'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { DocumentType, documentTypeSchema } from '@/types/user-documents'

export type ActionState = {
    errors?: { [key: string]: string[] | undefined }
    message?: string
    success?: boolean
} | null

/**
 * Fetch all document types available for the current user (Global + Tenant specific)
 */
export async function getDocumentTypes(): Promise<{ data: DocumentType[] | null, error: string | null }> {
    const supabase = await createClient()

    try {
        const query = supabase
            .from('document_types')
            .select('*')
            .order('name', { ascending: true })

        const { data, error } = await query

        if (error) {
            console.error('[getDocumentTypes] Error:', JSON.stringify(error, null, 2))
            return { data: [], error: `Error detallado: ${error.message}` }
        }

        return { data: data as DocumentType[], error: null }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        return { data: null, error: message }
    }
}

/**
 * Create or Update a Document Type
 */
export async function upsertDocumentType(
    prevState: ActionState,
    formData: FormData
): Promise<ActionState> {
    const rawData = {
        id: formData.get('id') as string,
        name: formData.get('name') as string,
        category: formData.get('category') as string,
        expiration_alert_days: formData.get('expiration_alert_days') as unknown as number,
    }

    // Clean up empty ID
    if (!rawData.id || rawData.id === 'undefined') delete (rawData as Record<string, unknown>).id;

    const validatedFields = documentTypeSchema.safeParse(rawData)

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Error de validación. Revise los campos.',
            success: false,
        }
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { message: 'No autenticado', success: false }

    try {
        // Fetch Tenant ID securely using the new helper function (RPC)
        // This relies on the DB migration having been applied.
        const { data: tenantId, error: tenantError } = await supabase.rpc('get_auth_tenant_id')

        if (tenantError || !tenantId) {
            console.error('Tenant fetch error (RPC):', tenantError)
            // Fallback or specific error if needed, but RPC should handle it if user exists.
            // If RPC fails (e.g. migration not applied), this will error out, which is expected.
            return { message: 'No se encontró el tenant del usuario (Verificar Migración RLS)', success: false }
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const payload: any = {
            ...validatedFields.data,
            tenant_id: tenantId, // Always include tenant_id for RLS Compliance
        }

        // Handle timestamps and user tracking
        if (!payload.id) {
            // Insert
            payload.created_by = user.id
            payload.created_at = new Date().toISOString()
        } else {
            // Update
            payload.modified_by = user.id
            payload.modified_at = new Date().toISOString()
        }

        const { error } = await supabase
            .from('document_types')
            .upsert(payload)
            .select()

        if (error) {
            console.error('[upsertDocumentType] DB Error:', error)
            return { message: `Error al guardar: ${error.message}`, success: false }
        }

        revalidatePath('/settings/document-types')
        revalidatePath('/users')

        return { message: 'Tipo de documento guardado exitosamente', success: true }

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        return { message: `Error inesperado: ${message}`, success: false }
    }
}

/**
 * Toggle active status of a Document Type
 */
export async function toggleDocumentTypeStatus(id: string, currentStatus: boolean): Promise<ActionState> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { message: 'No autenticado', success: false }

    try {
        const { error } = await supabase
            .from('document_types')
            .update({
                is_active: !currentStatus,
                modified_by: user.id,
                modified_at: new Date().toISOString()
            })
            .eq('id', id)

        if (error) {
            return { message: 'Error al cambiar estado', success: false }
        }

        revalidatePath('/settings/document-types')
        revalidatePath('/settings/users')
        return { message: `Tipo de documento ${!currentStatus ? 'activado' : 'desactivado'}`, success: true }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        return { message: `Error: ${message}`, success: false }
    }
}

export async function deleteDocumentTypeSimple(id: string): Promise<{ success: boolean; message?: string }> {
    const result = await toggleDocumentTypeStatus(id, true)
    return {
        success: result?.success ?? false,
        message: result?.message
    }
}

export async function restoreDocumentTypeSimple(id: string): Promise<{ success: boolean; message?: string }> {
    const result = await toggleDocumentTypeStatus(id, false)
    return {
        success: result?.success ?? false,
        message: result?.message
    }
}
