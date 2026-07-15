'use server'

import { revalidatePath } from 'next/cache'
import { getSupabaseContext } from '@/lib/action-context'

/**
 * Documentos de maquinaria ACTIVOS con más de 1 mes de vencidos, para el
 * ritual de depuración (pasarlos a INACTIVO en lote). Ordenados del más
 * antiguo al más reciente para que los grupos "+6 meses", "+5 meses"…
 * salgan primero. Mismo patrón que /users/documents/depurar.
 */
export async function getDepurableMaquinariaDocuments({ page = 1, limit = 20 }: { page?: number, limit?: number }) {
    const { adminClient, tenantId } = await getSupabaseContext()
    if (!adminClient || !tenantId) return { data: [], count: 0, error: 'No autorizado' }

    const cutoff = new Date()
    cutoff.setMonth(cutoff.getMonth() - 1)
    const cutoffStr = cutoff.toISOString().split('T')[0]

    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await adminClient
        .from('maquinaria_documentos')
        .select(`
            id, numero_doc, archivo_url, fecha_vencimiento, is_active,
            maquinaria:maquinarias (id, nombre, codigo_interno),
            tipo_doc:maquinaria_tipos_docs (id, nombre)
        `, { count: 'exact' })
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .not('fecha_vencimiento', 'is', null)
        .lt('fecha_vencimiento', cutoffStr)
        .order('fecha_vencimiento', { ascending: true })
        .range(from, to)

    if (error) {
        console.error('Error fetching depurable maquinaria documents:', error)
        return { data: [], count: 0, error: error.message }
    }

    return { data: (data as any[]) ?? [], count: count || 0, error: null }
}

/**
 * Pasa a INACTIVO los documentos de maquinaria seleccionados.
 */
export async function deactivateMaquinariaDocuments(ids: string[]): Promise<{ success: boolean, message: string }> {
    if (!ids.length) return { success: false, message: 'No hay documentos seleccionados' }

    const { adminClient, tenantId, user } = await getSupabaseContext()
    if (!adminClient || !tenantId || !user) return { success: false, message: 'No autorizado' }

    const { error } = await adminClient
        .from('maquinaria_documentos')
        .update({
            is_active: false,
            updated_by: user.id,
            updated_at: new Date().toISOString(),
        })
        .eq('tenant_id', tenantId)
        .in('id', ids)

    if (error) {
        console.error('Error deactivating maquinaria documents:', error)
        return { success: false, message: 'Error al inactivar documentos' }
    }

    revalidatePath('/maquinarias/documentos')
    revalidatePath('/maquinarias/documentos/depurar')
    return { success: true, message: `${ids.length} documento(s) pasados a INACTIVO` }
}
