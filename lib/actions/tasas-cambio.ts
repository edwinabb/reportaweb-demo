'use server'

import { revalidatePath } from 'next/cache'
import { getSupabaseContext } from '@/lib/action-context'
import { TasaCambio, Moneda } from '@/types/cotizaciones'


// ============================================
// TASA DE CAMBIO ACTIONS
// ============================================

export async function getTasasCambio(
    monedaOrigen?: Moneda,
    monedaDestino?: Moneda,
    fecha?: string,
    onlyActive = true
): Promise<TasaCambio[]> {
    const { adminClient, tenantId } = await getSupabaseContext()
    if (!adminClient || !tenantId) return []

    let query = adminClient
        .from('tasas_cambio')
        .select('*')
        .eq('tenant_id', tenantId)

    if (onlyActive) {
        query = query.eq('is_active', true)
    }

    if (monedaOrigen) {
        query = query.eq('moneda_origen', monedaOrigen)
    }

    if (monedaDestino) {
        query = query.eq('moneda_destino', monedaDestino)
    }

    if (fecha) {
        query = query.eq('fecha_vigencia', fecha)
    }

    query = query.order('fecha_vigencia', { ascending: false })

    const { data, error } = await query

    if (error) {
        console.error('Error fetching tasas cambio:', error)
        return []
    }

    return data as TasaCambio[]
}

export async function createTasaCambio(prevState: any, formData: FormData) {
    const { adminClient, tenantId, user } = await getSupabaseContext()
    if (!adminClient || !tenantId || !user) return { message: 'No autorizado' }

    const moneda_origen = formData.get('moneda_origen') as Moneda
    const moneda_destino = formData.get('moneda_destino') as Moneda
    const tasa = parseFloat(formData.get('tasa') as string)
    const fecha_vigencia = formData.get('fecha_vigencia') as string

    if (!moneda_origen || !moneda_destino || !tasa || !fecha_vigencia) {
        return { message: 'Campos requeridos faltantes' }
    }

    if (moneda_origen === moneda_destino) {
        return { message: 'Las monedas de origen y destino deben ser diferentes' }
    }

    if (tasa <= 0) {
        return { message: 'La tasa debe ser mayor a 0' }
    }

    // Check if already exists
    const { data: existing } = await adminClient
        .from('tasas_cambio')
        .select('id')
        .eq('tenant_id', tenantId)
        .eq('moneda_origen', moneda_origen)
        .eq('moneda_destino', moneda_destino)
        .eq('fecha_vigencia', fecha_vigencia)
        .single()

    if (existing) {
        return { message: 'Ya existe una tasa de cambio para esta fecha y par de monedas' }
    }

    const { error } = await adminClient
        .from('tasas_cambio')
        .insert({
            tenant_id: tenantId,
            moneda_origen,
            moneda_destino,
            tasa,
            fecha_vigencia,
            created_by: user.id,
            updated_by: user.id
        })

    if (error) {
        console.error('Error creating tasa cambio:', error)
        return { message: 'Error al crear tasa de cambio: ' + error.message }
    }

    revalidatePath('/cotizaciones/tasas')
    return { message: 'Tasa de cambio creada', success: true }
}

export async function updateTasaCambio(prevState: any, formData: FormData) {
    const { adminClient, tenantId, user } = await getSupabaseContext()
    if (!adminClient || !tenantId || !user) return { message: 'No autorizado' }

    const id = formData.get('id') as string
    const moneda_origen = formData.get('moneda_origen') as Moneda
    const moneda_destino = formData.get('moneda_destino') as Moneda
    const tasa = parseFloat(formData.get('tasa') as string)
    const fecha_vigencia = formData.get('fecha_vigencia') as string

    if (!id || !moneda_origen || !moneda_destino || !tasa || !fecha_vigencia) {
        return { message: 'Campos requeridos faltantes' }
    }

    if (moneda_origen === moneda_destino) {
        return { message: 'Las monedas de origen y destino deben ser diferentes' }
    }

    if (tasa <= 0) {
        return { message: 'La tasa debe ser mayor a 0' }
    }

    const { error } = await adminClient
        .from('tasas_cambio')
        .update({
            moneda_origen,
            moneda_destino,
            tasa,
            fecha_vigencia,
            updated_by: user.id,
            updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('tenant_id', tenantId)

    if (error) {
        console.error('Error updating tasa cambio:', error)
        return { message: 'Error al actualizar tasa de cambio: ' + error.message }
    }

    revalidatePath('/cotizaciones/tasas')
    return { message: 'Tasa de cambio actualizada', success: true }
}

export async function deleteTasaCambio(id: string) {
    const { adminClient, tenantId } = await getSupabaseContext()
    if (!adminClient || !tenantId) return { message: 'No autorizado' }

    const { error } = await adminClient
        .from('tasas_cambio')
        .update({ is_active: false })
        .eq('id', id)
        .eq('tenant_id', tenantId)

    if (error) {
        console.error('Error deleting tasa cambio:', error)
        return { message: 'Error al eliminar' }
    }

    revalidatePath('/cotizaciones/tasas')
    return { message: 'Eliminado correctamente', success: true }
}

export async function restoreTasaCambio(id: string) {
    const { adminClient, tenantId } = await getSupabaseContext()
    if (!adminClient || !tenantId) return { message: 'No autorizado' }

    const { error } = await adminClient
        .from('tasas_cambio')
        .update({ is_active: true })
        .eq('id', id)
        .eq('tenant_id', tenantId)

    if (error) {
        console.error('Error restoring tasa cambio:', error)
        return { message: 'Error al restaurar' }
    }

    revalidatePath('/cotizaciones/tasas')
    return { message: 'Restaurado correctamente', success: true }
}
