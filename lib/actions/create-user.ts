'use server'

import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { sendEmail } from '@/lib/email'
import { renderWelcomeEmailHtml } from '@/lib/welcome-email-template'

function generateTempPassword(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$'
    let pw = ''
    for (let i = 0; i < 16; i++) pw += chars[Math.floor(Math.random() * chars.length)]
    return pw
}

const createUserSchema = z.object({
    email: z.string().email('Debe ser un correo electrónico válido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').optional().or(z.literal('')),
    firstName: z.string().min(1, 'El nombre es obligatorio'),
    lastName: z.string().min(1, 'El apellido es obligatorio'),
    role: z.enum(['admin_tenant', 'supervisor', 'member']),
    docNumber: z.string().min(1, 'El documento de identidad es obligatorio'),
    gender: z.enum(['Masculino', 'Femenino']).optional(),
    docType: z.enum(['DNI', 'CE', 'PASSPORT', 'RUC', 'OTHER']).optional(),
    nationality: z.string().optional(),
    birthDate: z.string().optional(),
    phone: z.string().optional(),
    pin: z.string().optional(),
    jobTitleId: z.string().uuid().optional().or(z.literal('')),
})

export type CreateUserState = {
    errors?: {
        [key: string]: string[] | undefined
    }
    message?: string
    success?: boolean
} | null

export async function createUser(prevState: CreateUserState, formData: FormData): Promise<CreateUserState> {
    const validatedFields = createUserSchema.safeParse({
        email: formData.get('email'),
        password: formData.get('password'),
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        role: formData.get('role'),
        docNumber: formData.get('docNumber'),
        gender: formData.get('gender'),
        docType: formData.get('docType'),
        nationality: formData.get('nationality'),
        birthDate: formData.get('birthDate'),
        phone: formData.get('phone'),
        pin: formData.get('pin'),
        jobTitleId: formData.get('jobTitleId'),
    })

    if (!validatedFields.success) {
        const fieldErrors = validatedFields.error.flatten().fieldErrors
        const invalidFields = Object.keys(fieldErrors).join(', ')
        return {
            errors: fieldErrors,
            message: `Datos inválidos en los campos: ${invalidFields}. Revise la información.`,
        }
    }

    const { email, firstName, lastName, role, docNumber, gender, docType, nationality, birthDate, phone, pin, jobTitleId } = validatedFields.data
    const password = validatedFields.data.password || generateTempPassword()

    // Personal externo de terceros (DUDA-TER-006): vínculo opcional en profiles
    const terceroId = (formData.get('tercero_id') as string) || null
    const personalExterno = formData.get('personal_externo') === 'true'

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
        return { message: 'Error de configuración del servidor (falta Service Key).' }
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
    })

    try {
        const supabaseServer = await createServerClient()
        const { data: { user: currentUser }, error: userError } = await supabaseServer.auth.getUser()

        if (userError || !currentUser) return { message: 'No estás autenticado o sesión expirada.' }

        // Get Organization Info
        const { data: adminProfile } = await supabase.from('profiles').select('tenant_id').eq('id', currentUser.id).single()
        const cookieStore = await cookies()
        const managedTenantId = cookieStore.get('managed_tenant_id')?.value
        const effectiveTenantId = managedTenantId || adminProfile?.tenant_id

        if (!effectiveTenantId) return { message: 'No se pudo identificar tu organización.' }

        const { data: tenant } = await supabase.from('companies').select('name, logo_url').eq('id', effectiveTenantId).single()
        const tenantClean = (tenant?.name || 'unknown').normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/gi, '_').toLowerCase()
        const userClean = `${firstName}_${lastName}`.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/gi, '_').toLowerCase()

        // 1. Process File Uploads
        let photoUrl = null
        let signatureUrl = null
        const todayStr = new Date().toISOString().split('T')[0].replace(/-/g, '')

        const photoFile = formData.get('photo') as File
        if (photoFile && photoFile.size > 0) {
            const ext = photoFile.name.split('.').pop()
            const filePath = `${tenantClean}/${userClean}/foto_${todayStr}.${ext}`
            const { error: uploadError } = await supabase.storage.from('usuarios').upload(filePath, photoFile, { contentType: photoFile.type })
            if (!uploadError) photoUrl = (await supabase.storage.from('usuarios').getPublicUrl(filePath)).data.publicUrl
        }

        const signatureFile = formData.get('signature') as File
        if (signatureFile && signatureFile.size > 0) {
            const ext = signatureFile.name.split('.').pop()
            const filePath = `${tenantClean}/${userClean}/firma_${todayStr}.${ext}`
            const { error: uploadError } = await supabase.storage.from('usuarios').upload(filePath, signatureFile, { contentType: signatureFile.type })
            if (!uploadError) signatureUrl = (await supabase.storage.from('usuarios').getPublicUrl(filePath)).data.publicUrl
        }

        // 2. Create Auth User
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { first_name: firstName, last_name: lastName },
        })

        if (authError) return { message: `Error de autenticación: ${authError.message}` }
        const userId = authData.user!.id

        // 3. Create Profile
        const { error: profileError } = await supabase
            .from('profiles')
            .insert({
                id: userId,
                email,
                first_name: firstName,
                last_name: lastName,
                role,
                doc_number: docNumber,
                tenant_id: effectiveTenantId,
                tercero_id: terceroId,
                personal_externo: personalExterno || null,
            })

        if (profileError) {
            await supabase.auth.admin.deleteUser(userId)
            return { message: `Error de base de datos (perfil): ${profileError.message}` }
        }

        // 4. Create Profile Details
        const detailsPayload = {
            id: userId,
            tenant_id: effectiveTenantId,
            gender: gender || null,
            photo_url: photoUrl,
            signature_url: signatureUrl,
            birth_date: birthDate || null,
            middle_name: formData.get('middleName') || null,
            second_last_name: formData.get('secondLastName') || null,
            doc_type: docType || 'DNI',
            nationality: nationality || null,
            phone: phone || null,
            pin: pin || null,
            job_title_id: jobTitleId || null,
        }

        const { error: detailsError } = await supabase
            .from('profile_details')
            .insert(detailsPayload)

        if (detailsError) {
            console.error('[createUser] Error inserting details:', detailsError)
            await supabase.auth.admin.deleteUser(userId)
            return { message: `Error de base de datos (detalles): ${detailsError.message}` }
        }

        // 5. Send welcome email with password setup link
        try {
            const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://reportar.app'
            const { data: linkData } = await supabase.auth.admin.generateLink({
                type: 'recovery',
                email,
                options: { redirectTo: `${siteUrl}/auth/reset-password` },
            })
            const resetLink = linkData?.properties?.action_link ?? `${siteUrl}/auth/reset-password`

            const tenantName = tenant?.name ?? 'Reportar.app'

            const html = renderWelcomeEmailHtml({
                firstName,
                tenantName,
                resetLink,
                siteUrl,
                logoUrl: tenant?.logo_url ?? null,
            })

            await sendEmail({
                to: email,
                cc: 'info@reportar.app',
                subject: `${tenantName}. ¡Te damos la Bienvenida!`,
                html,
            })
        } catch (emailErr) {
            // Email failure is non-fatal — user was already created successfully
            console.error('[createUser] Welcome email error:', emailErr)
        }

        revalidatePath('/users')
        revalidatePath('/terceros/personal')
        // Must redirect on success

    } catch (error: unknown) {
        const errMsg = error instanceof Error ? error.message : 'Error desconocido'
        return { message: `Error inesperado: ${errMsg}` }
    }

    redirect((formData.get('redirectTo') as string) || '/users')
}
