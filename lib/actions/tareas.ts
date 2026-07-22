'use server'

import { revalidatePath } from 'next/cache'
import { getSupabaseContext } from '@/lib/action-context'

// Types (to be moved to types/tareas.ts eventually)
export type TareaEstado = 'PENDIENTE' | 'EN_PROCESO' | 'COMPLETADA' | 'CANCELADA'
export type TareaPrioridad = 'ALTA' | 'MEDIA' | 'BAJA'


export async function getTareas(estado?: TareaEstado) {
    const { adminClient, tenantId } = await getSupabaseContext()
    if (!adminClient || !tenantId) return []

    let query = adminClient
        .from('tareas')
        .select(`
            *,
            cliente:terceros!tareas_cliente_id_fkey(id, razon_social),
            cotizacion:cotizaciones(id, numero),
            usuario_asignado:auth_users!tareas_asignado_a_fkey(email),
            tarea_padre:tareas!tareas_tarea_padre_id_fkey(id, titulo, progreso_porcentaje)
        `) // Note: auth_users join might need adjustments depending on how users are exposed.
        // Usually we user profiles table. let's assume profiles for now if auth_users is not directly accessible via standard join without extra setup.
        // Actually, standard supabase setup often links to profiles. Let's try to link to 'profiles' if 'auth_users' fails, but schema says 'auth.users'.
        // To be safe, let's fetch profiles for assigned user if possible, or just raw ID if not.
        // For now, let's just get the ID and we can resolve names later or use a view.
        // Schema says: asignado_a uuid references auth.users(id)
        // If we want email/name we usually need a join with profiles.
        .eq('tenant_id', tenantId)
        .eq('is_active', true)

    if (estado) {
        query = query.eq('estado', estado)
    }

    query = query.order('prioridad', { ascending: true }).order('fecha_vencimiento', { ascending: true })

    const { data, error } = await query

    if (error) {
        console.error('Error fetching tareas:', error)
        return []
    }

    return data
}

export async function createTarea(prevState: any, formData: FormData) {
    const { adminClient, tenantId, user } = await getSupabaseContext()
    if (!adminClient || !tenantId || !user) return { message: 'No autorizado' }

    const titulo = formData.get('titulo') as string
    const descripcion = formData.get('descripcion') as string
    const prioridad = formData.get('prioridad') as string
    const fecha_vencimiento = formData.get('fecha_vencimiento') as string
    const cliente_id = formData.get('cliente_id') as string // Optional
    const asignado_a = formData.get('asignado_a') as string // Optional
    const progreso_porcentaje = parseFloat(formData.get('progreso_porcentaje') as string) || 0
    const tarea_padre_id = formData.get('tarea_padre_id') as string // Optional (for subtasks)

    if (!titulo || !prioridad) {
        return { message: 'Campos requeridos faltantes' }
    }

    // Validate progreso_porcentaje is between 0-100
    if (progreso_porcentaje < 0 || progreso_porcentaje > 100) {
        return { message: 'El progreso debe estar entre 0 y 100%' }
    }

    const { error } = await adminClient
        .from('tareas')
        .insert({
            tenant_id: tenantId,
            titulo,
            descripcion: descripcion || null,
            prioridad,
            fecha_vencimiento: fecha_vencimiento || null,
            cliente_id: cliente_id && cliente_id !== '_none' ? cliente_id : null,
            asignado_a: asignado_a && asignado_a !== '_none' ? asignado_a : user.id, // Default to creator
            estado: 'PENDIENTE',
            progreso_porcentaje,
            tarea_padre_id: tarea_padre_id && tarea_padre_id !== '_none' ? tarea_padre_id : null,
            created_by: user.id,
            updated_by: user.id
        })

    if (error) {
        console.error('Error creating tarea:', error)
        return { message: 'Error al crear tarea: ' + error.message }
    }

    revalidatePath('/tareas')
    return { message: 'Tarea creada', success: true }
}

export async function deleteTarea(id: string) {
    const { adminClient, tenantId } = await getSupabaseContext()
    if (!adminClient || !tenantId) return { message: 'No autorizado' }

    const { error } = await adminClient
        .from('tareas')
        .update({ is_active: false })
        .eq('id', id)
        .eq('tenant_id', tenantId)

    if (error) {
        console.error('Error deleting tarea:', error)
        return { message: 'Error al eliminar tarea' }
    }

    revalidatePath('/tareas')
    return { message: 'Tarea eliminada', success: true }
}

// --- BÚSQUEDA CON FILTROS ---

export type TareaConRecursos = {
    id: string
    codigo: string | null
    titulo: string
    fecha_inicio: string | null
    fecha_fin: string | null
    cliente: { id: string; razon_social: string | null } | null
    sitio: { id: string; nombre: string | null } | null
    recursos: Array<{
        tipo_recurso: string
        personal: { first_name: string | null; last_name: string | null } | null
        maquinaria: { nombre: string | null; codigo_interno: string | null } | null
    }>
}

export async function searchTareasConFiltros(
    clienteId?: string | null,
    fecha?: string | null,
): Promise<TareaConRecursos[]> {
    const { adminClient, tenantId } = await getSupabaseContext()
    if (!adminClient || !tenantId) return []

    // Filtro por fecha: OR entre rango consecutivo y fechas_multiples (no consecutivas)
    let tareaIds: string[] | null = null
    if (fecha) {
        // Query 1: fecha cae dentro del rango fecha_inicio–fecha_fin
        const [{ data: rangoData }, { data: multiplesData }] = await Promise.all([
            adminClient
                .from('tareas_fechas')
                .select('tarea_id')
                .lte('fecha_inicio', fecha)
                .gte('fecha_fin', fecha)
                .eq('tenant_id', tenantId),
            // Query 2: fecha está en el array fechas_multiples
            adminClient
                .from('tareas_fechas')
                .select('tarea_id')
                .contains('fechas_multiples', [fecha])
                .eq('tenant_id', tenantId),
        ])
        const rangoIds = (rangoData ?? []).map((f: any) => f.tarea_id).filter(Boolean)
        const multiplesIds = (multiplesData ?? []).map((f: any) => f.tarea_id).filter(Boolean)
        tareaIds = [...new Set([...rangoIds, ...multiplesIds])]
        if (tareaIds.length === 0) return []
    }

    let query = adminClient
        .from('tareas')
        .select(`
            id, codigo, titulo,
            cliente:terceros!tareas_cliente_id_fkey(id, razon_social),
            sitio:terceros_sitios!tareas_sitio_id_fkey(id, nombre),
            recursos:tareas_recursos(
                tipo_recurso,
                personal:profiles(first_name, last_name),
                maquinaria:maquinarias(nombre, codigo_interno)
            ),
            fechas:tareas_fechas(fecha_inicio, fecha_fin)
        `)
        .eq('tenant_id', tenantId)
        .neq('is_active', false)
        .order('created_at', { ascending: false })
        .limit(30)

    if (clienteId) query = query.eq('cliente_id', clienteId)
    if (tareaIds) query = query.in('id', tareaIds)

    const { data, error } = await query
    if (error) { console.error('searchTareasConFiltros error:', error); return [] }

    return (data ?? []).map((r: any) => {
        const fechas = (r.fechas ?? []) as Array<{ fecha_inicio: string; fecha_fin: string }>
        const fecha_inicio = fechas.reduce<string | null>(
            (min, f) => (!min || f.fecha_inicio < min ? f.fecha_inicio : min), null,
        )
        const fecha_fin = fechas.reduce<string | null>(
            (max, f) => (!max || f.fecha_fin > max ? f.fecha_fin : max), null,
        )
        const norm = (v: unknown) => {
            if (Array.isArray(v)) return v[0] ?? null
            if (v && typeof v === 'object' && Object.keys(v as object).length > 0) return v
            return null
        }
        return {
            id: r.id,
            codigo: r.codigo,
            titulo: r.titulo,
            fecha_inicio,
            fecha_fin,
            cliente: norm(r.cliente),
            sitio: norm(r.sitio),
            recursos: (r.recursos ?? []).map((rec: any) => ({
                tipo_recurso: rec.tipo_recurso,
                personal: norm(rec.personal),
                maquinaria: norm(rec.maquinaria),
            })),
        }
    })
}
