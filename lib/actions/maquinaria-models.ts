'use server'

import { getSupabaseContext } from '@/lib/action-context'
import { MaquinariaModelo } from '@/types/maquinaria'
import { revalidatePath } from 'next/cache'


export async function getMaquinariaModelos(onlyActive = true) {
    const { adminClient, tenantId } = await getSupabaseContext()
    if (!adminClient || !tenantId) return []

    let query = adminClient
        .from('maquinaria_modelos')
        .select('*')
        .eq('tenant_id', tenantId)

    if (onlyActive) {
        query = query.eq('is_active', true)
    }

    query = query.order('modelo', { ascending: true })

    const { data, error } = await query


    if (error) {
        console.error('Error fetching models:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
        return []
    }

    return data as MaquinariaModelo[]
}

export async function createMaquinariaModelo(prevState: any, formData: FormData) {
    const { adminClient, tenantId, user } = await getSupabaseContext()
    if (!adminClient || !tenantId || !user) return { message: 'No autorizado' }

    const tipo_equipo = formData.get('tipo_equipo') as string
    const marca = formData.get('marca') as string
    const modelo = formData.get('modelo') as string
    const capacidad = formData.get('capacidad') as string

    if (!modelo || !marca) return { message: 'Modelo y Marca requeridos' }

    const { data, error } = await adminClient
        .from('maquinaria_modelos')
        .insert({
            tenant_id: tenantId,
            tipo_equipo,
            marca,
            modelo,
            capacidad,
            created_by: user.id,
            updated_by: user.id
        })
        .select()
        .single()

    if (error) return { message: 'Error: ' + error.message }

    revalidatePath('/maquinarias/modelos')
    return { message: 'Modelo creado', success: true, data: data }
}

export async function deleteMaquinariaModelo(id: string) {
    const { adminClient, tenantId } = await getSupabaseContext()
    if (!adminClient || !tenantId) return { message: 'No autorizado' }

    const { data: updatedData, error } = await adminClient
        .from('maquinaria_modelos')
        .update({ is_active: false })
        .eq('id', id)
        .eq('tenant_id', tenantId)
        .select()

    if (error) {
        console.error('[deleteMaquinariaModelo] Error:', error)
        return { message: 'Error al eliminar' }
    }

    if (!updatedData || updatedData.length === 0) {
        console.error('[deleteMaquinariaModelo] No rows updated. ID:', id, 'Tenant:', tenantId)
        return { message: 'Error: No se pudo eliminar el registro (no encontrado)' }
    }

    revalidatePath('/maquinarias/modelos')
    return { message: 'Eliminado correctamente', success: true }
}

export async function restoreMaquinariaModelo(id: string) {
    const { adminClient, tenantId } = await getSupabaseContext()
    if (!adminClient || !tenantId) return { message: 'No autorizado' }

    const { error } = await adminClient
        .from('maquinaria_modelos')
        .update({ is_active: true })
        .eq('id', id)
        .eq('tenant_id', tenantId)

    if (error) return { message: 'Error al restaurar' }
    revalidatePath('/maquinarias/modelos')
    return { message: 'Restaurado correctamente', success: true }
}
