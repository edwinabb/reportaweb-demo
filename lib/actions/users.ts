
'use server'

import { revalidatePath } from 'next/cache'
import { Profile } from '@/types'
import { getTenantContext } from '@/lib/utils/tenant-context'

export async function getProfiles(onlyActive = true): Promise<Profile[]> {
    const { adminClient: supabaseAdmin, tenantId: targetTenantId } = await getTenantContext()
    if (!supabaseAdmin || !targetTenantId) return []

    // Fetch Profiles for Target Tenant with Details
    // Note: phone, gender, pin viven en `profiles` (ya vienen por el `select('*')`),
    // NO en `profile_details`. No agregarlos al sub-select o rompe con "column does not exist".
    let query = supabaseAdmin
        .from('profiles')
        .select(`
            *,
            profile_details (
                middle_name,
                second_last_name,
                doc_type,
                nationality,
                birth_date,
                photo_url,
                signature_url,
                job_title_id,
                job_title:job_title_id(name)
            ),
            tercero:tercero_id(razon_social)
        `)
        .eq('tenant_id', targetTenantId)

    if (onlyActive) {
        query = query.eq('is_active', true)
    }

    const { data, error } = await query
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching profiles:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
            tenantId: targetTenantId
        })
        return []
    }

    // Flatten the join results
    const flattenedData = (data as any[]).map(profile => ({
        ...profile,
        ...(profile.profile_details?.[0] || {}),
        full_name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email || '',
        cargo: (profile.profile_details?.[0] as any)?.job_title?.name ?? null,
    }))

    return flattenedData as Profile[]
}

export async function getProfileById(id: string): Promise<Profile | null> {
    const { adminClient: supabaseAdmin } = await getTenantContext()
    if (!supabaseAdmin) return null

    const { data: profile, error } = await supabaseAdmin
        .from('profiles')
        .select(`
            *,
            profile_details (
                middle_name,
                second_last_name,
                doc_type,
                nationality,
                birth_date,
                photo_url,
                signature_url,
                job_title_id,
                job_title:job_title_id(name)
            ),
            tercero:tercero_id(razon_social)
        `)
        .eq('id', id)
        .single()

    if (error || !profile) {
        console.error('[getProfileById] Error or no profile:', error)
        return null
    }

    // Check if details is array or object
    const detailsRaw = profile.profile_details
    const details = Array.isArray(detailsRaw) ? detailsRaw[0] : detailsRaw

    // Flatten
    return {
        ...profile,
        ...(details || {}),
        full_name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email || '',
    } as Profile
}

// Reusable function to calculate paths (moved here or duplicte)
// For now duplication is safer to avoid breaking other files
function cleanString(str: string) {
    return (str || 'unknown').normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/gi, '_').toLowerCase()
}

export async function deleteProfile(id: string) {
    const { adminClient: supabaseAdmin } = await getTenantContext()
    if (!supabaseAdmin) return { message: 'No autorizado', success: false }

    // 1. Disable in DB (Profiles & Details)
    const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({ is_active: false })
        .eq('id', id)

    if (profileError) return { message: 'Error al desactivar perfil en BD: ' + profileError.message, success: false }

    await supabaseAdmin
        .from('profile_details')
        .update({ is_active: false })
        .eq('id', id)

    // 2. Disable in Auth (Block User)
    // We do NOT change the email, so it can be restored.
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(id, {
        user_metadata: { is_active: false },
        // We can also ban the user if we want strict blocking
        ban_duration: '876600h' // 100 years
    })

    if (authError) {
        console.error('Error banning auth user:', authError)
        // Keep going, DB soft delete is primary
    }

    revalidatePath('/users')
    return { message: 'Usuario desactivado', success: true }
}

export async function restoreProfile(id: string) {
    const { adminClient: supabaseAdmin } = await getTenantContext()
    if (!supabaseAdmin) return { message: 'No autorizado', success: false }

    // 1. Enable in DB
    const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({ is_active: true })
        .eq('id', id)

    if (profileError) return { message: 'Error al restaurar perfil en BD: ' + profileError.message, success: false }

    await supabaseAdmin
        .from('profile_details')
        .update({ is_active: true })
        .eq('id', id)

    // 2. Enable in Auth (Unban)
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(id, {
        user_metadata: { is_active: true },
        ban_duration: '0' // Remove ban
    })

    if (authError) {
        console.error('Error unbanning auth user:', authError)
    }

    revalidatePath('/users')
    return { message: 'Usuario restaurado', success: true }
}

export async function toggleOperario(profileId: string, value: boolean) {
    const { adminClient, tenantId } = await getTenantContext()
    if (!adminClient || !tenantId) return { success: false, message: 'No autorizado' }

    const { error } = await adminClient
        .from('profiles')
        .update({ is_operario: value })
        .eq('id', profileId)
        .eq('tenant_id', tenantId)

    if (error) return { success: false, message: error.message }

    revalidatePath('/planificacion')
    return { success: true }
}

export async function updateUserCredentials(
    targetUserId: string,
    type: 'email' | 'password',
    value: string,
): Promise<{ success: boolean; message: string }> {
    const { adminClient, tenantId, user: currentUser } = await getTenantContext()
    if (!adminClient || !tenantId || !currentUser) return { success: false, message: 'No autorizado' }

    // Only admin_tenant and reporta_admin can change credentials
    const { data: callerProfile } = await adminClient
        .from('profiles')
        .select('role')
        .eq('id', currentUser.id)
        .single()

    const allowedRoles = ['admin_tenant', 'reporta_admin']
    if (!callerProfile || !allowedRoles.includes(callerProfile.role)) {
        return { success: false, message: 'Sin permisos para esta acción' }
    }

    // Ensure target user belongs to the same tenant (or caller is reporta_admin)
    if (callerProfile.role !== 'reporta_admin') {
        const { data: targetProfile } = await adminClient
            .from('profiles')
            .select('tenant_id')
            .eq('id', targetUserId)
            .single()
        if (!targetProfile || targetProfile.tenant_id !== tenantId) {
            return { success: false, message: 'El usuario no pertenece a tu organización' }
        }
    }

    if (type === 'email') {
        const { error } = await adminClient.auth.admin.updateUserById(targetUserId, { email: value })
        if (error) return { success: false, message: error.message }
        await adminClient.from('profiles').update({ email: value }).eq('id', targetUserId)
    } else {
        const { error } = await adminClient.auth.admin.updateUserById(targetUserId, { password: value })
        if (error) return { success: false, message: error.message }
    }

    revalidatePath('/users')
    return { success: true, message: type === 'email' ? 'Correo actualizado' : 'Contraseña actualizada' }
}
