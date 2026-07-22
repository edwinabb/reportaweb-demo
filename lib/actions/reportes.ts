'use server'

import { getSupabaseContext, safeRevalidatePath } from '@/lib/action-context'

// --- UPLOAD DE FOTOS (genérico para reportes) ---

export async function uploadReportePhoto(input: {
    base64: string       // "data:image/...;base64,<data>"
    filename: string
    bucket: string       // 'reporte-maquinaria' | 'informes-personal' | 'reportes-combustible'
    folder: string       // sub-path dentro del bucket, ej: "combustible/{tenantId}"
}): Promise<{ success: true; url: string } | { success: false; error: string }> {
    const { adminClient, tenantId } = await getSupabaseContext()
    if (!adminClient || !tenantId) return { success: false, error: 'No autorizado' }

    const match = input.base64.match(/^data:(.+);base64,(.+)$/)
    if (!match) return { success: false, error: 'Formato de imagen inválido' }

    const mime = match[1]
    const data = Buffer.from(match[2], 'base64')
    const ext = mime.split('/')[1]?.split('+')[0] || 'jpg'
    const ts = Date.now()
    const safeName = input.filename.replace(/[^a-z0-9._-]/gi, '_')
    const path = `${input.folder}/${ts}_${safeName}.${ext}`

    const { error } = await adminClient.storage
        .from(input.bucket)
        .upload(path, data, { contentType: mime, upsert: true })

    if (error) {
        console.error('[uploadReportePhoto] error:', error)
        return { success: false, error: error.message }
    }

    const { data: pub } = adminClient.storage.from(input.bucket).getPublicUrl(path)
    return { success: true, url: pub.publicUrl }
}

// --- TAREAS RECURSOS (Assignments) ---

// --- REPORTES PERSONAL ---

export async function createReportePersonal(data: any) {
    const { adminClient, tenantId, user } = await getSupabaseContext()
    if (!adminClient || !tenantId) return { success: false, message: 'No autorizado', id: null }

    const { error, data: insertResult } = await adminClient
        .from('reportes_personal')
        .insert({
            ...data,
            tenant_id: tenantId,
            created_by: user.id
        })
        .select('id')

    if (error) return { success: false, message: error.message, id: null }
    safeRevalidatePath('/informes/personal')
    return { success: true, message: 'Reporte de personal guardado', id: (insertResult?.[0]?.id ?? null) as string | null }
}

export async function getReportesPersonal(tareaId: string) {
    const { adminClient, tenantId } = await getSupabaseContext()
    if (!adminClient || !tenantId) return []

    const { data } = await adminClient
        .from('reportes_personal')
        .select(`
            *,
            personal:profiles!reportes_personal_personal_id_fkey(first_name, last_name, email),
            tercero_personal:terceros_personal!reportes_personal_tercero_personal_id_fkey(nombres, apellidos, cargo, tercero:terceros(razon_social)),
            maquinaria:maquinarias(nombre, codigo_interno)
        `)
        .eq('tarea_id', tareaId)
        .eq('tenant_id', tenantId)
        .order('fecha_reporte', { ascending: false })

    return data || []
}

export async function getTerceroPersonalList() {
    const { adminClient, tenantId } = await getSupabaseContext()
    if (!adminClient || !tenantId) return []

    // Personal externo vive en profiles (tercero_id / personal_externo), no en
    // terceros_personal (deprecada, DUDA-TER-006). El id devuelto es un profile id
    // y el reporte lo guarda en personal_id.
    const { data } = await adminClient
        .from('profiles')
        .select('id, first_name, last_name, tercero:terceros!profiles_tercero_id_fkey(id, razon_social)')
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .or('tercero_id.not.is.null,personal_externo.eq.true')
        .order('first_name')

    return (data || []).map(p => ({
        id: p.id,
        nombres: p.first_name ?? '',
        apellidos: p.last_name ?? '',
        cargo: null,
        tercero: p.tercero
    }))
}

// --- REPORTES MAQUINARIA ---

export async function createReporteMaquinaria(data: any) {
    const { adminClient, tenantId, user } = await getSupabaseContext()
    if (!adminClient || !tenantId) return { success: false, message: 'No autorizado', id: null }

    const { error, data: insertResult } = await adminClient
        .from('reportes_maquinaria')
        .insert({
            ...data,
            tenant_id: tenantId,
            created_by: user.id
        })
        .select('id')

    if (error) return { success: false, message: error.message, id: null }
    safeRevalidatePath('/informes/maquinaria')
    return { success: true, message: 'Reporte de maquinaria guardado', id: (insertResult?.[0]?.id ?? null) as string | null }
}

export async function getReportesMaquinaria(tareaId: string) {
    const { adminClient, tenantId } = await getSupabaseContext()
    if (!adminClient || !tenantId) return []

    const { data } = await adminClient
        .from('reportes_maquinaria')
        .select(`
            *,
            maquinaria:maquinarias(nombre, codigo_interno),
            operador:profiles!reportes_maquinaria_operador_id_fkey(first_name, last_name)
        `)
        .eq('tarea_id', tareaId)
        .eq('tenant_id', tenantId)
        .order('fecha_reporte', { ascending: false })

    return data || []
}

// --- REPORTES COMBUSTIBLE ---

export async function createReporteCombustible(data: any) {
    const { adminClient, tenantId, user } = await getSupabaseContext()
    if (!adminClient || !tenantId) return { success: false, message: 'No autorizado', id: null }

    const { error, data: insertResult } = await adminClient
        .from('reportes_combustible')
        .insert({
            ...data,
            tenant_id: tenantId,
            created_by: user.id
        })
        .select('id')

    if (error) return { success: false, message: error.message, id: null }
    safeRevalidatePath('/informes/gastos')
    return { success: true, message: 'Reporte de combustible guardado', id: (insertResult?.[0]?.id ?? null) as string | null }
}

export async function getReportesCombustible(tareaId: string) {
    const { adminClient, tenantId } = await getSupabaseContext()
    if (!adminClient || !tenantId) return []

    const { data } = await adminClient
        .from('reportes_combustible')
        .select(`
            *,
            maquinaria:maquinarias(nombre, codigo_interno)
        `)
        .eq('tarea_id', tareaId)
        .eq('tenant_id', tenantId)
        .order('fecha_reporte', { ascending: false })

    return data || []
}

// --- LISTADOS GLOBALES (sin filtro por tarea) ---

export async function getAllReportesPersonal() {
    const { adminClient, tenantId } = await getSupabaseContext()
    if (!adminClient || !tenantId) return []

    const { data } = await adminClient
        .from('reportes_personal')
        .select(`
            id, fecha_reporte, id_documento_interno, total_horas, gasto_total, pdf_url, tipo_personal, jornada1_inicio, created_at,
            tarea:tareas(codigo, titulo),
            personal:profiles!reportes_personal_personal_id_fkey(first_name, last_name),
            tercero_personal:terceros_personal!reportes_personal_tercero_personal_id_fkey(nombres, apellidos, cargo)
        `)
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .order('fecha_reporte', { ascending: false })

    return data || []
}

export async function getAllReportesMaquinaria() {
    const { adminClient, tenantId } = await getSupabaseContext()
    if (!adminClient || !tenantId) return []

    const { data } = await adminClient
        .from('reportes_maquinaria')
        .select(`
            id, fecha_reporte, id_documento_interno, total_horas, pdf_url, jornada1_inicio, created_at,
            tarea:tareas(codigo, titulo),
            maquinaria:maquinarias(nombre, codigo_interno),
            operador:profiles!reportes_maquinaria_operador_id_fkey(first_name, last_name)
        `)
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .order('fecha_reporte', { ascending: false })

    return data || []
}

export async function getAllReportesGastos() {
    const { adminClient, tenantId } = await getSupabaseContext()
    if (!adminClient || !tenantId) return []

    const { data } = await adminClient
        .from('reportes_combustible')
        .select(`
            id, fecha_reporte, galones, tipo_combustible, monto_total, pdf_url, created_at,
            tarea:tareas(codigo, titulo),
            maquinaria:maquinarias(nombre, codigo_interno)
        `)
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .order('fecha_reporte', { ascending: false })

    return data || []
}

// --- GETBYID + UPDATE ---

export async function getReporteMaquinariaById(id: string) {
    const { adminClient, tenantId } = await getSupabaseContext()
    if (!adminClient || !tenantId) return null
    const { data } = await adminClient
        .from('reportes_maquinaria').select('*').eq('id', id).eq('tenant_id', tenantId).single()
    return data ?? null
}

export async function updateReporteMaquinaria(id: string, payload: Record<string, unknown>) {
    const { adminClient, tenantId } = await getSupabaseContext()
    if (!adminClient || !tenantId) return { success: false, message: 'No autorizado', id: null }
    const { error } = await adminClient
        .from('reportes_maquinaria')
        .update(payload)
        .eq('id', id).eq('tenant_id', tenantId)
    if (error) return { success: false, message: error.message, id: null }
    safeRevalidatePath('/informes/maquinaria')
    return { success: true, message: 'Reporte actualizado', id }
}

export async function getReportePersonalById(id: string) {
    const { adminClient, tenantId } = await getSupabaseContext()
    if (!adminClient || !tenantId) return null
    const { data } = await adminClient
        .from('reportes_personal').select('*').eq('id', id).eq('tenant_id', tenantId).single()
    return data ?? null
}

export async function updateReportePersonal(id: string, payload: Record<string, unknown>) {
    const { adminClient, tenantId } = await getSupabaseContext()
    if (!adminClient || !tenantId) return { success: false, message: 'No autorizado', id: null }
    const { error } = await adminClient
        .from('reportes_personal')
        .update(payload)
        .eq('id', id).eq('tenant_id', tenantId)
    if (error) return { success: false, message: error.message, id: null }
    safeRevalidatePath('/informes/personal')
    return { success: true, message: 'Reporte actualizado', id }
}

export async function getReporteCombustibleById(id: string) {
    const { adminClient, tenantId } = await getSupabaseContext()
    if (!adminClient || !tenantId) return null
    const { data } = await adminClient
        .from('reportes_combustible').select('*').eq('id', id).eq('tenant_id', tenantId).single()
    return data ?? null
}

export async function updateReporteCombustible(id: string, payload: Record<string, unknown>) {
    const { adminClient, tenantId } = await getSupabaseContext()
    if (!adminClient || !tenantId) return { success: false, message: 'No autorizado', id: null }
    const { error } = await adminClient
        .from('reportes_combustible')
        .update(payload)
        .eq('id', id).eq('tenant_id', tenantId)
    if (error) return { success: false, message: error.message, id: null }
    safeRevalidatePath('/informes/gastos')
    return { success: true, message: 'Reporte actualizado', id }
}
