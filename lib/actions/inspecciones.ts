'use server'

import { revalidatePath } from 'next/cache'
import { getSupabaseContext } from '@/lib/action-context'
import { Inspeccion, InspeccionDetalle, InspeccionWithRelations } from '@/types/formatos'


export async function getInspecciones(
    maquinaria_id?: string,
    fecha_inicio?: string,
    fecha_fin?: string,
    onlyActive = true
) {
    const { adminClient, tenantId } = await getSupabaseContext()
    if (!adminClient || !tenantId) return []

    let query = adminClient
        .from('inspecciones')
        .select(`
            *,
            maquinaria:maquinarias(id, nombre, codigo_interno, marca, modelo),
            supervisor:profiles!inspecciones_supervisor_id_fkey(id, email, full_name, avatar_url)
        `)
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })

    if (onlyActive) {
        query = query.eq('is_active', true)
    }

    if (maquinaria_id && maquinaria_id !== 'all') {
        query = query.eq('maquinaria_id', maquinaria_id)
    }

    if (fecha_inicio) {
        query = query.gte('fecha_inspeccion', fecha_inicio)
    }

    if (fecha_fin) {
        query = query.lte('fecha_inspeccion', fecha_fin)
    }

    const { data, error } = await query

    if (error) {
        return []
    }

    return data as InspeccionWithRelations[]
}

export async function getInspeccionesForTarea(tareaId: string) {
    const { adminClient, tenantId } = await getSupabaseContext()
    if (!adminClient || !tenantId) return []

    const { data, error } = await adminClient
        .from('inspecciones')
        .select(`
            id, codigo_interno, codigo, estado, fecha_inspeccion,
            tiene_fallas, puntaje,
            maquinaria:maquinarias(id, nombre, codigo_interno, marca, modelo)
        `)
        .eq('tenant_id', tenantId)
        .eq('tarea_id', tareaId)
        .neq('is_active', false)
        .order('fecha_inspeccion', { ascending: false })

    if (error) {
        console.error('getInspeccionesForTarea error:', error)
        return []
    }

    return data ?? []
}

export async function getInspeccionById(id: string) {
    const { adminClient, tenantId } = await getSupabaseContext()
    if (!adminClient || !tenantId) return null

    const { data, error } = await adminClient
        .from('inspecciones')
        .select(`
            *,
            maquinaria:maquinarias(id, nombre, codigo_interno, marca, modelo),
            supervisor:profiles!inspecciones_supervisor_id_fkey(id, email, full_name),
            detalles:inspecciones_detalles(*),
            planes_accion:planes_accion(*)
        `)
        .eq('id', id)
        .eq('tenant_id', tenantId)
        .single()

    if (error) {
        console.error('Error fetching inspeccion:', error)
        return null
    }

    return data as InspeccionWithRelations
}

export async function createInspeccion(data: Partial<Inspeccion>, detalles: Partial<InspeccionDetalle>[]) {
    const { adminClient, tenantId, user } = await getSupabaseContext()
    if (!adminClient || !tenantId || !user) return { success: false, message: 'No autorizado' }

    // Generate Code
    const year = new Date().getFullYear()
    const { count } = await adminClient
        .from('inspecciones')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .gte('created_at', `${year}-01-01`)

    const codigo_interno = `INS-${year}-${String((count || 0) + 1).padStart(4, '0')}`

    // Puntaje: count(SI) / (total - count(NO_APLICA)) * 100
    const totalItems = detalles.length
    const countSi = detalles.filter(d => d.estado === 'SI').length
    const countNa = detalles.filter(d => d.estado === 'NO_APLICA').length
    const denominador = totalItems - countNa
    const puntaje = denominador > 0 ? Math.round((countSi / denominador) * 100) : null

    const tieneNos = detalles.some(d => d.estado === 'NO')

    // 1. Create Header
    const { data: inspeccion, error: errorHeader } = await adminClient
        .from('inspecciones')
        .insert({
            tenant_id: tenantId,
            created_by: user.id,
            codigo_interno,
            maquinaria_id: data.maquinaria_id,
            conductor_id: data.conductor_id,
            supervisor_id: user.id,
            horometro_actual: data.horometro_actual,
            kilometraje_actual: data.kilometraje_actual,
            nivel_tanque_gasolina: data.nivel_tanque_gasolina,
            fecha_inspeccion: data.fecha_inspeccion || new Date().toISOString(),
            estado: tieneNos ? 'EN_PROCESO' : 'COMPLETADO',
            tiene_fallas: tieneNos,
            puntaje,
            observaciones: (data as any).observaciones ?? null,
            ubicacion_gps: data.ubicacion_gps,
            firma_supervisor_url: data.firma_supervisor_url,
            tarea_id: data.tarea_id,
        })
        .select()
        .single()

    if (errorHeader) return { success: false, message: 'Error al crear inspección: ' + errorHeader.message }

    // 2. Create Details (select to get IDs for plane_accion linking)
    const detallesToInsert = detalles.map(d => ({
        tenant_id: tenantId,
        inspeccion_id: inspeccion.id,
        categoria: d.categoria,
        item: d.item,
        orden: d.orden || 0,
        estado: d.estado,
        comentario: d.comentario,
        foto_url: d.foto_url
    }))

    const { data: detallesInserted, error: errorDetalles } = await adminClient
        .from('inspecciones_detalles')
        .insert(detallesToInsert)
        .select('id, item, estado, categoria')

    if (errorDetalles) {
        console.error('Error insertando detalles:', errorDetalles)
        return { success: false, message: 'Inspección creada pero hubo error en detalles.' }
    }

    // 3. Auto-crear planes de acción para cada respuesta NO
    const detallesConNo = (detallesInserted ?? []).filter(d => d.estado === 'NO')
    if (detallesConNo.length > 0) {
        const planesAInsertar = detallesConNo.map(d => ({
            tenant_id: tenantId,
            created_by: user.id,
            inspeccion_id: inspeccion.id,
            inspeccion_detalle_id: d.id,
            maquinaria_id: data.maquinaria_id ?? null,
            tarea_id: data.tarea_id ?? null,
            titulo: `Resolver: ${d.item}`,
            origen: 'CHECKLIST',
            estado: 'PENDIENTE',
        }))

        const { error: errorPlanes } = await adminClient
            .from('planes_accion')
            .insert(planesAInsertar)

        if (errorPlanes) {
            console.error('Error creando planes de acción automáticos:', errorPlanes)
            // No falla el flujo principal — la inspección ya está creada
        }
    }

    revalidatePath('/formatos')
    revalidatePath('/planes-accion')
    return { success: true, message: 'Inspección registrada correctamente', id: inspeccion.id }
}

export async function deleteInspeccion(id: string) {
    const { adminClient, tenantId } = await getSupabaseContext()
    if (!adminClient || !tenantId) return { success: false, message: 'No autorizado' }

    const { error } = await adminClient
        .from('inspecciones')
        .update({ is_active: false })
        .eq('id', id)
        .eq('tenant_id', tenantId)

    if (error) return { success: false, message: error.message }

    revalidatePath('/formatos')
    return { success: true, message: 'Inspección eliminada' }
}

