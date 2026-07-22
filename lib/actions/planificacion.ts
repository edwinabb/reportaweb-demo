'use server'

import { revalidatePath } from 'next/cache'
import { getSupabaseContext } from '@/lib/action-context'
import type {
    TareaWithRelations,
    TareaRecurso,
    CreateTareaPayload,
    TareaDetalle,
} from '@/types/planificacion'

/**
 * Trae tareas del tenant, joined con sus intervalos (tareas_fechas) y los
 * recursos asignados a cada intervalo (tareas_recursos).
 *
 * El filtro por rango `startDate/endDate` usa overlap sobre tareas_fechas:
 *   tarea aparece si tiene algún intervalo que se cruza con el rango.
 */
export async function getTareas(startDate?: string, endDate?: string): Promise<TareaWithRelations[]> {
    const { adminClient, tenantId } = await getSupabaseContext()
    if (!adminClient || !tenantId) return []

    // Refrescar la MV antes de consultar para que siempre muestre datos actualizados
    try { await adminClient.rpc('refresh_mv_planificacion') } catch { }

    // Query a la vista materializada (Index Scan ~0.15ms vs 35ms original)
    let mvQuery = adminClient
        .from('mv_planificacion_diaria')
        .select('*')
        .eq('tenant_id', tenantId)

    if (startDate && endDate) {
        mvQuery = mvQuery.gte('fecha', startDate).lte('fecha', endDate)
    }

    const { data: mvRows, error } = await mvQuery

    if (error) {
        console.error('[getTareas] mv error:', error, { startDate, endDate })
        return []
    }
    if (!mvRows?.length) return []

    // Mini-query para campos de Tarea que no están en la MV:
    // created_at (para ordenar), cotizacion, tipo_tarea, descripcion, etc.
    const tareaIds = [...new Set(mvRows.map((r: { tarea_id: string }) => r.tarea_id))]
    const { data: tareasMeta } = await adminClient
        .from('tareas')
        .select(`
            id, created_at, created_by, is_active,
            descripcion, cliente_id, cotizacion_id, cotizacion_item_id,
            tipo_tarea, servicio_ref, contacto_id,
            cotizacion:cotizaciones!tareas_cotizacion_id_fkey(id, estado, numero, anio)
        `)
        .in('id', tareaIds)
        .eq('tenant_id', tenantId)

    const metaMap = new Map<string, typeof tareasMeta extends (infer T)[] | null ? T : never>(
        (tareasMeta ?? []).map((t) => [t.id, t])
    )

    // Reconstruir TareaWithRelations[] desde filas planas de la MV.
    // Una fila MV = (tarea_fecha_id, fecha) — groupeamos por tarea → intervalo.
    const tareaMap = new Map<string, TareaWithRelations>()
    // Rastreamos qué intervalos ya fueron creados para no duplicar recursos
    const fechaSeenMap = new Set<string>()

    for (const row of mvRows) {
        const tid: string = row.tarea_id
        const fid: string = row.tarea_fecha_id

        if (!tareaMap.has(tid)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const meta = metaMap.get(tid) as any
            tareaMap.set(tid, {
                id: tid,
                tenant_id: row.tenant_id,
                codigo: row.codigo,
                titulo: row.titulo,
                estado: row.estado,
                // MV v3: cliente, sitio, hora y autor ya vienen resueltos vía FK
                sitio: row.sitio,
                cliente_nombre: row.cliente_nombre,
                prioridad: row.prioridad,
                hora_inicio: row.hora_inicio ?? null,
                hora_fin: row.hora_fin ?? null,
                cotizacion_cod: row.cotizacion_cod ?? null,
                autor_nombre: row.autor_nombre ?? null,
                personal_nombres: null, // se acumula abajo por intervalo
                created_at: meta?.created_at ?? '',
                created_by: meta?.created_by ?? null,
                is_active: true,
                descripcion: meta?.descripcion ?? null,
                cliente_id: meta?.cliente_id ?? null,
                cotizacion_id: meta?.cotizacion_id ?? null,
                cotizacion_item_id: meta?.cotizacion_item_id ?? null,
                cotizacion_ref: null,
                tipo_tarea: meta?.tipo_tarea ?? null,
                servicio_ref: meta?.servicio_ref ?? null,
                contacto_id: meta?.contacto_id ?? null,
                cotizacion: meta?.cotizacion ?? null,
                fechas: [],
            })
        }

        // Acumular nombres únicos de personal desde cada intervalo
        if (row.personal_nombres?.length) {
            const tarea = tareaMap.get(tid)!
            const set = new Set(tarea.personal_nombres ?? [])
            for (const n of row.personal_nombres) set.add(n)
            tarea.personal_nombres = Array.from(set)
        }

        // Cada tarea_fecha_id aparece N veces (una por día). Solo creamos el
        // intervalo en la primera aparición — los recursos son iguales en todas.
        if (!fechaSeenMap.has(fid)) {
            fechaSeenMap.add(fid)

            const recursos: TareaRecurso[] = [
                ...(row.personal_ids ?? []).map((pid: string) => ({
                    id: `${fid}_${pid}`,
                    tenant_id: row.tenant_id,
                    tarea_id: tid,
                    tarea_fecha_id: fid,
                    tipo_recurso: 'PERSONAL' as const,
                    personal_id: pid,
                    maquinaria_id: null,
                    recurso_externo_nombre: null,
                    proveedor_id: null,
                    is_active: true,
                    created_at: null,
                    created_by: null,
                })),
                ...(row.maquinaria_ids ?? []).map((mid: string) => ({
                    id: `${fid}_${mid}`,
                    tenant_id: row.tenant_id,
                    tarea_id: tid,
                    tarea_fecha_id: fid,
                    tipo_recurso: 'MAQUINARIA' as const,
                    personal_id: null,
                    maquinaria_id: mid,
                    recurso_externo_nombre: null,
                    proveedor_id: null,
                    is_active: true,
                    created_at: null,
                    created_by: null,
                })),
            ]

            tareaMap.get(tid)!.fechas.push({
                id: fid,
                tenant_id: row.tenant_id,
                tarea_id: tid,
                fecha_inicio: row.fecha_inicio ?? null,
                fecha_fin: row.fecha_fin ?? null,
                fechas_multiples: row.fechas_multiples ?? null,
                notas: row.notas ?? null,
                is_active: true,
                created_at: null,
                updated_at: '',
                recursos,
            })
        }
    }

    return Array.from(tareaMap.values()).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
}

/**
 * Guarda el encabezado de una tarea como BORRADOR al completar el Step 1 del wizard.
 * Si tareaId es null, crea una tarea nueva; si existe, actualiza el header y reemplaza
 * el intervalo de fechas básico. No inserta tareas_recursos — eso lo hace createTarea al finalizar.
 */
export async function saveTareaBorradorBasic(payload: {
    tareaId?: string | null
    titulo: string
    clienteId?: string | null
    clienteNombre?: string | null
    contactoId?: string | null
    sitio?: string | null
    prioridad: string
    descripcion?: string | null
    fechasMultiples: string[]
}): Promise<{ success: boolean; tareaId?: string; message?: string }> {
    const { adminClient, tenantId, user } = await getSupabaseContext()
    if (!adminClient || !tenantId || !user) return { success: false, message: 'No autorizado' }
    if (!payload.titulo) return { success: false, message: 'Título es obligatorio' }
    if (!payload.fechasMultiples.length) return { success: false, message: 'Seleccione al menos una fecha' }

    const sorted = [...payload.fechasMultiples].sort()
    const fechaInicio = sorted[0]
    const fechaFin = sorted[sorted.length - 1]

    let tareaId = payload.tareaId ?? null
    let oldFechaIds: string[] = []

    if (tareaId) {
        const { error: errUpd } = await adminClient.from('tareas').update({
            titulo: payload.titulo,
            cliente_id: payload.clienteId ?? null,
            cliente_nombre: payload.clienteNombre ?? null,
            contacto_id: payload.contactoId ?? null,
            sitio: payload.sitio ?? null,
            prioridad: payload.prioridad,
            descripcion: payload.descripcion ?? null,
        }).eq('id', tareaId).eq('tenant_id', tenantId)
        if (errUpd) return { success: false, message: `Error al actualizar: ${errUpd.message}` }
        // Los intervalos previos (y sus recursos, por CASCADE) se eliminan recién
        // después de insertar el nuevo — un fallo a mitad no destruye nada.
        const { data: prevFechas } = await adminClient
            .from('tareas_fechas')
            .select('id')
            .eq('tarea_id', tareaId)
            .eq('tenant_id', tenantId)
        oldFechaIds = (prevFechas ?? []).map((f) => f.id)
    } else {
        const year = new Date().getFullYear()
        const { count } = await adminClient.from('tareas')
            .select('*', { count: 'exact', head: true })
            .eq('tenant_id', tenantId).gte('created_at', `${year}-01-01`)
        const codigo = `T-${year}-${String((count || 0) + 1).padStart(4, '0')}`

        const { data: tarea, error: errIns } = await adminClient.from('tareas').insert({
            tenant_id: tenantId, created_by: user.id, codigo,
            titulo: payload.titulo,
            cliente_id: payload.clienteId ?? null,
            cliente_nombre: payload.clienteNombre ?? null,
            contacto_id: payload.contactoId ?? null,
            sitio: payload.sitio ?? null,
            prioridad: payload.prioridad,
            descripcion: payload.descripcion ?? null,
            estado: 'BORRADOR', is_active: true,
        }).select('id').single()
        if (errIns || !tarea) return { success: false, message: `Error al crear: ${errIns?.message}` }
        tareaId = tarea.id
    }

    const { data: nuevaFecha, error: errFecha } = await adminClient.from('tareas_fechas').insert({
        tenant_id: tenantId, tarea_id: tareaId, is_active: true,
        fecha_inicio: fechaInicio, fecha_fin: fechaFin,
        fechas_multiples: sorted,
    }).select('id').single()
    if (errFecha || !nuevaFecha) return { success: false, message: `Error al guardar fechas: ${errFecha?.message}` }

    if (oldFechaIds.length > 0) {
        // Re-vincular los recursos ya asignados al intervalo nuevo ANTES de borrar
        // los intervalos viejos — si no, el CASCADE los eliminaría y un usuario que
        // abandona el wizard a mitad perdería las asignaciones de la tarea.
        await adminClient
            .from('tareas_recursos')
            .update({ tarea_fecha_id: nuevaFecha.id })
            .in('tarea_fecha_id', oldFechaIds)
        await adminClient.from('tareas_fechas').delete().in('id', oldFechaIds)
    }

    revalidatePath('/planificacion')
    return { success: true, tareaId: tareaId! }
}

/**
 * Crea una tarea completa: header + N intervalos + recursos por intervalo.
 * Si payload.header.id existe (tarea guardada como BORRADOR), actualiza el header
 * y reemplaza los intervalos en lugar de crear una tarea nueva.
 * Si falla en cualquier paso, trata de revertir lo anterior (best-effort).
 */
export async function createTarea(payload: CreateTareaPayload) {
    const { adminClient, tenantId, user } = await getSupabaseContext()
    if (!adminClient || !tenantId || !user) {
        return { success: false as const, message: 'No autorizado' }
    }

    if (!payload.header.titulo) {
        return { success: false as const, message: 'Título es obligatorio' }
    }
    if (!payload.intervalos || payload.intervalos.length === 0) {
        return { success: false as const, message: 'Falta al menos un intervalo de fechas' }
    }

    let tareaDbId: string
    const isExisting = Boolean(payload.header.id)
    // En edición NO se borra nada por adelantado: primero se insertan los
    // intervalos nuevos y, solo si TODO salió bien, se eliminan los previos
    // (CASCADE limpia sus tareas_recursos). Así un fallo a mitad de camino
    // nunca deja la tarea sin fechas/recursos.
    let oldFechaIds: string[] = []

    if (payload.header.id) {
        // Tarea existente (borrador o reedición) — actualizar header
        const { error: errUpd } = await adminClient.from('tareas').update({
            titulo: payload.header.titulo,
            descripcion: payload.header.descripcion ?? null,
            cliente_id: payload.header.cliente_id ?? null,
            cliente_nombre: payload.header.cliente_nombre ?? null,
            sitio: payload.header.sitio ?? null,
            cotizacion_id: payload.header.cotizacion_id ?? null,
            cotizacion_item_id: payload.header.cotizacion_item_id ?? null,
            contacto_id: payload.header.contacto_id ?? null,
            prioridad: payload.header.prioridad ?? 'MEDIA',
            estado: payload.header.estado ?? 'BORRADOR',
            hora_inicio: payload.header.hora_inicio ?? null,
            hora_fin: payload.header.hora_fin ?? null,
        }).eq('id', payload.header.id).eq('tenant_id', tenantId)
        if (errUpd) return { success: false as const, message: `Error al actualizar tarea: ${errUpd.message}` }
        const { data: prevFechas, error: errPrev } = await adminClient
            .from('tareas_fechas')
            .select('id')
            .eq('tarea_id', payload.header.id)
            .eq('tenant_id', tenantId)
        if (errPrev) return { success: false as const, message: `Error al leer intervalos previos: ${errPrev.message}` }
        oldFechaIds = (prevFechas ?? []).map((f) => f.id)
        tareaDbId = payload.header.id
    } else {
        // 1) código consecutivo T-YYYY-XXXX (por tenant + año)
        const year = new Date().getFullYear()
        const { count } = await adminClient
            .from('tareas')
            .select('*', { count: 'exact', head: true })
            .eq('tenant_id', tenantId)
            .gte('created_at', `${year}-01-01`)
        const codigo = `T-${year}-${String((count || 0) + 1).padStart(4, '0')}`

        // 2) insert header
        const { data: tarea, error: errHeader } = await adminClient
            .from('tareas')
            .insert({
                tenant_id: tenantId,
                created_by: user.id,
                codigo,
                titulo: payload.header.titulo,
                descripcion: payload.header.descripcion ?? null,
                cliente_id: payload.header.cliente_id ?? null,
                cliente_nombre: payload.header.cliente_nombre ?? null,
                sitio: payload.header.sitio ?? null,
                cotizacion_id: payload.header.cotizacion_id ?? null,
                cotizacion_item_id: payload.header.cotizacion_item_id ?? null,
                contacto_id: payload.header.contacto_id ?? null,
                prioridad: payload.header.prioridad ?? 'MEDIA',
                estado: payload.header.estado ?? 'BORRADOR',
                hora_inicio: payload.header.hora_inicio ?? null,
                hora_fin: payload.header.hora_fin ?? null,
            })
            .select('id')
            .single()

        if (errHeader || !tarea) {
            return { success: false as const, message: `Error al crear tarea: ${errHeader?.message}` }
        }
        tareaDbId = tarea.id
    }

    // 3) insert cada intervalo + sus recursos (los previos siguen intactos)
    const insertedFechaIds: string[] = []
    const undoInserts = async () => {
        // Deshacer lo insertado en esta llamada; los intervalos previos quedan como estaban.
        if (insertedFechaIds.length > 0) {
            await adminClient.from('tareas_fechas').delete().in('id', insertedFechaIds)
        }
        if (!isExisting) await rollbackTarea(adminClient, tareaDbId)
    }

    for (const intervalo of payload.intervalos) {
        // Si solo hay fechas_multiples (sin rango), derivar fecha_inicio/fecha_fin como min/max
        // para que el filtro de overlap en getTareas() las encuentre correctamente.
        const sortedMulti = [...(intervalo.fechas_multiples ?? [])].sort()
        const fechaInicio = intervalo.fecha_inicio ?? sortedMulti[0] ?? null
        const fechaFin = intervalo.fecha_fin ?? sortedMulti[sortedMulti.length - 1] ?? null

        const { data: fecha, error: errFecha } = await adminClient
            .from('tareas_fechas')
            .insert({
                tenant_id: tenantId,
                tarea_id: tareaDbId,
                fecha_inicio: fechaInicio,
                fecha_fin: fechaFin,
                fechas_multiples: intervalo.fechas_multiples ?? null,
                notas: intervalo.notas ?? null,
            })
            .select('id')
            .single()

        if (errFecha || !fecha) {
            await undoInserts()
            return { success: false as const, message: `Error al crear intervalo: ${errFecha?.message}` }
        }
        insertedFechaIds.push(fecha.id)

        if (intervalo.recursos && intervalo.recursos.length > 0) {
            const rows = intervalo.recursos.map((r) => {
                const recursoIdValido = r.recurso_id && r.recurso_id.length > 0 ? r.recurso_id : null
                return {
                    tenant_id: tenantId,
                    tarea_id: tareaDbId,
                    tarea_fecha_id: fecha.id,
                    tipo_recurso: r.tipo_recurso,
                    personal_id: r.tipo_recurso === 'PERSONAL' ? recursoIdValido : null,
                    // Siempre guardamos maquinaria_id si hay entrada de catálogo (sea interna o externa).
                    // Lo externo se distingue por proveedor_id != null.
                    maquinaria_id: r.tipo_recurso === 'MAQUINARIA' ? recursoIdValido : null,
                    recurso_externo_nombre: r.recurso_externo_nombre ?? null,
                    proveedor_id: r.proveedor_id ?? null,
                    created_by: user.id,
                    is_active: true,
                }
            })
            const { error: errRec } = await adminClient.from('tareas_recursos').insert(rows)
            if (errRec) {
                await undoInserts()
                return { success: false as const, message: `Error al asignar recursos: ${errRec.message}` }
            }
        }
    }

    // 4) todo insertado OK → recién ahora se eliminan los intervalos previos
    //    (CASCADE limpia sus tareas_recursos)
    if (oldFechaIds.length > 0) {
        const { error: errDelOld } = await adminClient
            .from('tareas_fechas')
            .delete()
            .in('id', oldFechaIds)
        if (errDelOld) {
            await undoInserts()
            return { success: false as const, message: `Error al reemplazar intervalos anteriores: ${errDelOld.message}` }
        }
    }

    // Refrescar la MV antes de volver al timeline para que la tarea nueva aparezca de inmediato
    try { await adminClient.rpc('refresh_mv_planificacion') } catch {}
    revalidatePath('/planificacion')
    return { success: true as const, message: 'Tarea creada correctamente', id: tareaDbId }
}

/**
 * Asigna un recurso adicional a un intervalo existente. El intervalo tiene que
 * pertenecer al tenant del usuario (verificado vía RLS).
 */
export async function addRecursoToIntervalo(
    tareaFechaId: string,
    tipo: 'PERSONAL' | 'MAQUINARIA',
    recursoId: string,
) {
    const { adminClient, tenantId, user } = await getSupabaseContext()
    if (!adminClient || !tenantId || !user) {
        return { success: false as const, message: 'No autorizado' }
    }

    // Traer el intervalo para sacarle tarea_id (denormalizado) y validar tenant.
    const { data: intervalo, error: errFetch } = await adminClient
        .from('tareas_fechas')
        .select('id, tarea_id, tenant_id')
        .eq('id', tareaFechaId)
        .eq('tenant_id', tenantId)
        .maybeSingle()

    if (errFetch || !intervalo) {
        return { success: false as const, message: 'Intervalo no encontrado' }
    }

    const { data, error } = await adminClient
        .from('tareas_recursos')
        .insert({
            tenant_id: tenantId,
            tarea_id: intervalo.tarea_id,
            tarea_fecha_id: tareaFechaId,
            tipo_recurso: tipo,
            personal_id: tipo === 'PERSONAL' ? recursoId : null,
            maquinaria_id: tipo === 'MAQUINARIA' ? recursoId : null,
            created_by: user.id,
            is_active: true,
        })
        .select('id')
        .single()

    if (error || !data) {
        return { success: false as const, message: `Error al asignar recurso: ${error?.message}` }
    }

    revalidatePath('/planificacion')
    return { success: true as const, message: 'Recurso agregado', id: data.id }
}

/**
 * Borra un recurso asignado. Si el recurso no pertenece al tenant, la query
 * falla silenciosamente (0 filas afectadas) por RLS.
 */
export async function removeRecurso(recursoId: string) {
    const { adminClient, tenantId } = await getSupabaseContext()
    if (!adminClient || !tenantId) {
        return { success: false as const, message: 'No autorizado' }
    }

    const { error } = await adminClient
        .from('tareas_recursos')
        .delete()
        .eq('id', recursoId)
        .eq('tenant_id', tenantId)

    if (error) return { success: false as const, message: `Error al remover recurso: ${error.message}` }

    revalidatePath('/planificacion')
    return { success: true as const, message: 'Recurso removido' }
}

/**
 * Rollback best-effort. Las FKs son ON DELETE CASCADE, así que borrar la tarea
 * cleanea tareas_fechas y tareas_recursos.
 */
async function rollbackTarea(
    adminClient: NonNullable<Awaited<ReturnType<typeof getSupabaseContext>>['adminClient']>,
    tareaId: string,
) {
    await adminClient.from('tareas').delete().eq('id', tareaId)
}

/**
 * Trae una tarea con sus intervalos y recursos. Usado por el dialog de edición
 * para pre-llenar el formulario.
 */
export async function getTareaById(id: string): Promise<TareaWithRelations | null> {
    const { adminClient, tenantId } = await getSupabaseContext()
    if (!adminClient || !tenantId) return null

    const { data, error } = await adminClient
        .from('tareas')
        .select(
            `
            *,
            fechas:tareas_fechas(
                *,
                recursos:tareas_recursos(*)
            )
        `,
        )
        .eq('id', id)
        .eq('tenant_id', tenantId)
        .maybeSingle()

    if (error || !data) return null
    return data as unknown as TareaWithRelations
}

/**
 * Versión hidratada de la tarea — cliente/contacto/cotización joined + nombres
 * de personal/maquinaria/proveedor en los recursos asignados. Usada por el
 * dialog de detalle; los listados siguen usando `getTareas` / `getTareaById`
 * para no pagar el costo del join extra.
 */
export async function getTareaWithDetails(id: string): Promise<TareaDetalle | null> {
    const { adminClient, tenantId } = await getSupabaseContext()
    if (!adminClient || !tenantId) return null

    const { data, error } = await adminClient
        .from('tareas')
        .select(
            `
            *,
            cliente:terceros!tareas_cliente_id_fkey(id, razon_social, ruc, telefono),
            contacto:terceros_contactos!tareas_contacto_id_fkey(id, nombre_completo, telefono, email, cargo),
            cotizacion:cotizaciones!tareas_cotizacion_id_fkey(id, numero, anio, estado, total, moneda, descripcion_requerimiento),
            fechas:tareas_fechas(
                *,
                recursos:tareas_recursos(
                    *,
                    personal:profiles!tareas_recursos_personal_id_fkey(id, first_name, last_name, doc_number),
                    maquinaria:maquinarias!tareas_recursos_maquinaria_id_fkey(id, nombre, codigo_interno, modelo, placa, marca),
                    proveedor:terceros!tareas_recursos_proveedor_id_fkey(id, razon_social, ruc)
                )
            )
        `,
        )
        .eq('id', id)
        .eq('tenant_id', tenantId)
        .maybeSingle()

    if (error || !data) {
        if (error) console.error('[getTareaWithDetails] error:', error)
        return null
    }

    return data as unknown as TareaDetalle
}

/**
 * Reemplaza completamente los intervalos (`tareas_fechas`) y sus recursos
 * (`tareas_recursos`) de una tarea.
 *
 * Estrategia "replace-all": borrar todos los intervalos existentes (CASCADE
 * limpia `tareas_recursos`) y crear los nuevos. Simple y consistente — evita
 * diffs complicados para el primer pass. Si crece el volumen, se puede
 * optimizar a un upsert por id con diff granular.
 */
export async function updateTareaIntervals(
    tareaId: string,
    intervalos: CreateTareaPayload['intervalos'],
) {
    const { adminClient, tenantId, user } = await getSupabaseContext()
    if (!adminClient || !tenantId || !user) {
        return { success: false as const, message: 'No autorizado' }
    }

    // Verificar que la tarea es del tenant (RLS ya protege, pero mejor fail-fast).
    const { data: tarea, error: errFetch } = await adminClient
        .from('tareas')
        .select('id')
        .eq('id', tareaId)
        .eq('tenant_id', tenantId)
        .maybeSingle()

    if (errFetch || !tarea) {
        return { success: false as const, message: 'Tarea no encontrada' }
    }

    // Insertar-primero, borrar-después: los intervalos previos se eliminan solo
    // si TODOS los nuevos se insertaron bien. Un fallo a mitad no destruye nada.
    const { data: prevFechas, error: errPrev } = await adminClient
        .from('tareas_fechas')
        .select('id')
        .eq('tarea_id', tareaId)
        .eq('tenant_id', tenantId)
    if (errPrev) {
        return { success: false as const, message: `Error al leer intervalos previos: ${errPrev.message}` }
    }
    const oldFechaIds = (prevFechas ?? []).map((f) => f.id)
    const insertedFechaIds: string[] = []
    const undoInserts = async () => {
        if (insertedFechaIds.length > 0) {
            await adminClient.from('tareas_fechas').delete().in('id', insertedFechaIds)
        }
    }

    // Insertar los nuevos.
    for (const intervalo of intervalos) {
        const sortedMulti = [...(intervalo.fechas_multiples ?? [])].sort()
        const fechaInicio = intervalo.fecha_inicio ?? sortedMulti[0] ?? null
        const fechaFin = intervalo.fecha_fin ?? sortedMulti[sortedMulti.length - 1] ?? null

        const { data: fecha, error: errFecha } = await adminClient
            .from('tareas_fechas')
            .insert({
                tenant_id: tenantId,
                tarea_id: tareaId,
                fecha_inicio: fechaInicio,
                fecha_fin: fechaFin,
                fechas_multiples: intervalo.fechas_multiples ?? null,
                notas: intervalo.notas ?? null,
            })
            .select('id')
            .single()

        if (errFecha || !fecha) {
            await undoInserts()
            return { success: false as const, message: `Error al crear intervalo: ${errFecha?.message}` }
        }
        insertedFechaIds.push(fecha.id)

        if (intervalo.recursos && intervalo.recursos.length > 0) {
            const rows = intervalo.recursos.map((r) => {
                const recursoIdValido = r.recurso_id && r.recurso_id.length > 0 ? r.recurso_id : null
                return {
                    tenant_id: tenantId,
                    tarea_id: tareaId,
                    tarea_fecha_id: fecha.id,
                    tipo_recurso: r.tipo_recurso,
                    personal_id: r.tipo_recurso === 'PERSONAL' ? recursoIdValido : null,
                    maquinaria_id: r.tipo_recurso === 'MAQUINARIA' ? recursoIdValido : null,
                    recurso_externo_nombre: r.recurso_externo_nombre ?? null,
                    proveedor_id: r.proveedor_id ?? null,
                    created_by: user.id,
                    is_active: true,
                }
            })
            const { error: errRec } = await adminClient.from('tareas_recursos').insert(rows)
            if (errRec) {
                await undoInserts()
                return { success: false as const, message: `Error al asignar recursos: ${errRec.message}` }
            }
        }
    }

    // Todo insertado OK → eliminar los intervalos previos (CASCADE limpia tareas_recursos)
    if (oldFechaIds.length > 0) {
        const { error: errDelOld } = await adminClient
            .from('tareas_fechas')
            .delete()
            .in('id', oldFechaIds)
        if (errDelOld) {
            await undoInserts()
            return { success: false as const, message: `Error al reemplazar intervalos anteriores: ${errDelOld.message}` }
        }
    }

    revalidatePath('/planificacion')
    return { success: true as const, message: 'Fechas actualizadas' }
}

export async function deleteTarea(id: string) {
    const { adminClient, tenantId } = await getSupabaseContext()
    if (!adminClient || !tenantId) return { success: false, message: 'No autorizado' }

    const { error } = await adminClient
        .from('tareas')
        .update({ is_active: false })
        .eq('id', id)
        .eq('tenant_id', tenantId)
    if (error) return { success: false, message: error.message }

    revalidatePath('/planificacion')
    return { success: true, message: 'Tarea eliminada' }
}

export async function getRecursosForPlanning() {
    const { getMaquinarias } = await import('@/lib/actions/maquinarias')
    const { getProfiles } = await import('@/lib/actions/users')
    const { getPersonalCargos } = await import('@/lib/actions/catalogos')

    const { adminClient, tenantId } = await getSupabaseContext()

    const [personal, maquinaria, cargos, tercerosRes] = await Promise.all([
        getProfiles(true),
        getMaquinarias('', true),
        getPersonalCargos(),
        adminClient && tenantId
            ? adminClient.from('terceros').select('id, razon_social').eq('tenant_id', tenantId).eq('is_active', true)
            : Promise.resolve({ data: [] }),
    ])

    const terceroMap = new Map<string, string>(
        ((tercerosRes as { data: { id: string; razon_social: string }[] | null }).data ?? [])
            .map((t) => [t.id, t.razon_social])
    )

    const maquinariaList = maquinaria.map((m) => ({
        id: m.id,
        nombre: [(m as any).categoria, m.marca, m.modelo, m.capacidad].filter(v => v && v !== '-').join(' · ') || m.nombre || '',
        codigo: m.codigo_interno || '',
        categoria: (m as any).categoria ?? null,
        propietario: ((m as any).propietario as string | null) ?? 'propio',
        proveedor_id: ((m as any).proveedor_id as string | null) ?? null,
        proveedor_nombre: ((m as any).proveedor?.razon_social as string | null) ?? null,
    }))

    const categoriasUnicas = Array.from(
        new Set(maquinariaList.map((m) => m.categoria).filter(Boolean) as string[])
    ).sort()

    return {
        personal: personal.map((p) => {
            const terceroId = (p as any).tercero_id as string | null
            const fullNombre = [p.first_name, p.last_name].filter(Boolean).join(' ') || p.full_name || 'Sin Nombre'
            // primer_nombre: solo first_name. Si no tiene, primera palabra del full_name
            // (solo si no es email). Sin fallback a email.
            const primerNombre = p.first_name
                || (p.full_name && !p.full_name.includes('@') ? p.full_name.split(' ')[0] : null)
            return {
                id: p.id,
                nombre: fullNombre,
                primer_nombre: primerNombre,
                avatar: p.photo_url,
                cargo_id: (p as any).job_title_id ?? null,
                personal_externo: Boolean((p as any).personal_externo),
                proveedor_nombre: terceroId ? (terceroMap.get(terceroId) ?? null) : null,
                is_operario: Boolean((p as any).is_operario),
            }
        }),
        maquinaria: maquinariaList,
        cargos: (cargos ?? []).map((c: any) => ({ id: c.id, nombre: c.nombre })),
        categoriasUnicas,
    }
}

/**
 * Availability — ocupación de recursos en un rango de fechas.
 *
 * Devuelve una entrada por (recurso × día-ocupado). Los intervalos se expanden
 * a días individuales del lado del servidor para que el timeline client-side
 * no tenga que reinterpretar fechas_multiples.
 */
export async function getAvailability(startDate: string, endDate: string) {
    const { adminClient, tenantId } = await getSupabaseContext()
    if (!adminClient || !tenantId) return []

    const { data, error } = await adminClient
        .from('tareas_recursos')
        .select(
            `
            id,
            personal_id,
            maquinaria_id,
            tipo_recurso,
            is_active,
            fecha:tareas_fechas!inner (
                id,
                fecha_inicio,
                fecha_fin,
                fechas_multiples
            ),
            tarea:tareas!inner (
                id,
                titulo,
                sitio,
                codigo,
                is_active
            )
        `,
        )
        .eq('tenant_id', tenantId)
        // Acepta true o null (migrados Bubble tienen is_active NULL)
        .or('is_active.is.null,is_active.eq.true')
        .eq('tarea.is_active', true)

    if (error) {
        console.error('Error fetching availability:', error)
        return []
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    // Expandir cada asignación a días individuales dentro del rango pedido.
    const expanded: Array<{
        resourceId: string
        tipo: 'PERSONAL' | 'MAQUINARIA'
        date: string
        tarea: unknown
    }> = []

    for (const row of data as unknown as Array<{
        personal_id: string | null
        maquinaria_id: string | null
        tipo_recurso: 'PERSONAL' | 'MAQUINARIA'
        fecha: { fecha_inicio: string | null; fecha_fin: string | null; fechas_multiples: string[] | null }
        tarea: unknown
    }>) {
        const resourceId = row.tipo_recurso === 'PERSONAL' ? row.personal_id : row.maquinaria_id
        if (!resourceId) continue

        const days = expandFechaInterval(row.fecha, start, end)
        for (const day of days) {
            expanded.push({ resourceId, tipo: row.tipo_recurso, date: day, tarea: row.tarea })
        }
    }

    return expanded
}

/**
 * Dado un intervalo (fecha_inicio+fecha_fin ó fechas_multiples), devuelve los
 * días YYYY-MM-DD que caen dentro de [rangeStart, rangeEnd].
 */
function expandFechaInterval(
    fecha: { fecha_inicio: string | null; fecha_fin: string | null; fechas_multiples: string[] | null },
    rangeStart: Date,
    rangeEnd: Date,
): string[] {
    const out: string[] = []

    if (fecha.fechas_multiples && fecha.fechas_multiples.length > 0) {
        for (const d of fecha.fechas_multiples) {
            const dt = new Date(d)
            if (dt >= rangeStart && dt <= rangeEnd) out.push(d)
        }
        return out
    }

    if (fecha.fecha_inicio && fecha.fecha_fin) {
        const start = new Date(fecha.fecha_inicio)
        const end = new Date(fecha.fecha_fin)
        const cursor = new Date(Math.max(start.getTime(), rangeStart.getTime()))
        const stop = new Date(Math.min(end.getTime(), rangeEnd.getTime()))
        while (cursor <= stop) {
            out.push(cursor.toISOString().slice(0, 10))
            cursor.setUTCDate(cursor.getUTCDate() + 1)
        }
    }

    return out
}

export async function getPersonal() {
    const { getProfiles } = await import('@/lib/actions/users')
    const personal = await getProfiles(true)
    return personal.map((p) => ({
        id: p.id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        nombre: [p.first_name, p.last_name].filter(Boolean).join(' ') || p.full_name || 'Sin Nombre',
        avatar: p.photo_url,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        cargo_id: (p as any).job_title_id as string | null ?? null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        personal_externo: Boolean((p as any).personal_externo),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        tercero_id: (p as any).tercero_id as string | null ?? null,
    }))
}

export async function getMaquinaria() {
    const { getMaquinarias } = await import('@/lib/actions/maquinarias')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const maquinaria = await getMaquinarias('', true) as any[]
    return maquinaria.map((m) => ({
        id: m.id as string,
        nombre: [m.categoria, m.marca, m.modelo, m.capacidad].filter((v: unknown) => v && v !== '-').join(' · ') || (m.nombre as string) || '',
        codigo: (m.codigo_interno as string) || '',
        categoria: (m.categoria as string | null) ?? null,
        modelo: (m.modelo as string) || '',
        propietario: (m.propietario as string | null) ?? 'propio',
        proveedor_id: (m.proveedor_id as string | null) ?? null,
    }))
}

export interface InformesCount {
    maquinaria: number
    personal: number
    inspecciones: number
}

/**
 * Retorna reportes e inspecciones por tarea Y por día.
 * Clave exterior: tarea_id. Clave interior: fecha (YYYY-MM-DD).
 */
export async function getInformesCount(
    tareaIds: string[],
    startDate?: string,
    endDate?: string,
): Promise<Record<string, Record<string, InformesCount>>> {
    const { adminClient, tenantId } = await getSupabaseContext()
    if (!adminClient || !tenantId || tareaIds.length === 0) return {}

    let query = adminClient
        .from('mv_planificacion_diaria')
        .select('tarea_id, fecha, reporte_personal_ids, reporte_maquinaria_ids, inspeccion_ids')
        .eq('tenant_id', tenantId)
        .in('tarea_id', tareaIds)
    if (startDate) query = query.gte('fecha', startDate)
    if (endDate) query = query.lte('fecha', endDate)
    const { data } = await query

    const result: Record<string, Record<string, InformesCount>> = {}
    for (const row of (data ?? [])) {
        const tid: string = row.tarea_id
        const fecha: string = (row.fecha as string).slice(0, 10)
        if (!result[tid]) result[tid] = {}
        result[tid][fecha] = {
            maquinaria: (row.reporte_maquinaria_ids ?? []).length,
            personal: (row.reporte_personal_ids ?? []).length,
            inspecciones: (row.inspeccion_ids ?? []).length,
        }
    }
    return result
}

/**
 * Reemplaza los recursos (personal o maquinaria) de una tarea según el alcance:
 *   - this_day: solo el intervalo que cubra esa fecha
 *   - from_this_day: todos los intervalos que terminen en esa fecha o después
 *   - all_days: todos los intervalos de la tarea
 */
export type TareaBorradorResumen = {
    id: string
    codigo: string | null
    titulo: string
    created_at: string
    cliente: { razon_social: string } | null
    cotizacion: { numero: string } | null
}

export async function getTareasBorrador(): Promise<TareaBorradorResumen[]> {
    const { adminClient, tenantId } = await getSupabaseContext()
    if (!adminClient || !tenantId) return []

    const { data, error } = await adminClient
        .from('tareas')
        .select(`
            id, codigo, titulo, created_at,
            cliente:terceros!tareas_cliente_id_fkey(razon_social),
            cotizacion:cotizaciones!tareas_cotizacion_id_fkey(numero)
        `)
        .eq('tenant_id', tenantId)
        .eq('estado', 'BORRADOR')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('[getTareasBorrador]', error.message)
        return []
    }
    return (data ?? []) as unknown as TareaBorradorResumen[]
}

export async function updateRecursosTarea(params: {
    tareaId: string
    tipo: 'PERSONAL' | 'MAQUINARIA'
    recursoIds: string[]
    scope: 'this_day' | 'from_this_day' | 'all_days'
    fecha?: string
}): Promise<{ success: boolean; message: string }> {
    const { adminClient, tenantId, user } = await getSupabaseContext()
    if (!adminClient || !tenantId || !user) {
        return { success: false, message: 'No autorizado' }
    }

    const { data: fechas, error: errFechas } = await adminClient
        .from('tareas_fechas')
        .select('id, fecha_inicio, fecha_fin, fechas_multiples')
        .eq('tarea_id', params.tareaId)
        .eq('tenant_id', tenantId)

    if (errFechas || !fechas) {
        return { success: false, message: 'Error al obtener intervalos de la tarea' }
    }

    let targets = fechas as { id: string; fecha_inicio: string | null; fecha_fin: string | null; fechas_multiples: string[] | null }[]

    if (params.scope !== 'all_days' && params.fecha) {
        const d = params.fecha
        targets = targets.filter((f) => {
            if (f.fechas_multiples && f.fechas_multiples.length > 0) {
                if (params.scope === 'this_day') return f.fechas_multiples.includes(d)
                return f.fechas_multiples.some((x) => x >= d)
            }
            const start = f.fecha_inicio ?? ''
            const end = f.fecha_fin ?? ''
            if (params.scope === 'this_day') return start <= d && end >= d
            return end >= d
        })
    }

    for (const intervalo of targets) {
        const { error: errDel } = await adminClient
            .from('tareas_recursos')
            .delete()
            .eq('tarea_fecha_id', intervalo.id)
            .eq('tipo_recurso', params.tipo)
            .eq('tenant_id', tenantId)

        if (errDel) {
            return { success: false, message: `Error al actualizar recursos: ${errDel.message}` }
        }

        if (params.recursoIds.length > 0) {
            const rows = params.recursoIds.map((rid) => ({
                tenant_id: tenantId,
                tarea_id: params.tareaId,
                tarea_fecha_id: intervalo.id,
                tipo_recurso: params.tipo,
                personal_id: params.tipo === 'PERSONAL' ? rid : null,
                maquinaria_id: params.tipo === 'MAQUINARIA' ? rid : null,
                created_by: user.id,
                is_active: true,
            }))
            const { error: errIns } = await adminClient.from('tareas_recursos').insert(rows)
            if (errIns) {
                return { success: false, message: `Error al insertar recursos: ${errIns.message}` }
            }
        }
    }

    revalidatePath('/planificacion')
    return { success: true, message: 'Recursos actualizados correctamente' }
}
