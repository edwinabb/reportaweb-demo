'use server'

import { getSupabaseContext } from '@/lib/action-context'
import { MaquinariaDocumento } from '@/types/maquinaria'
import { revalidatePath } from 'next/cache'


// Helper to get ALL documents for the global view
export async function getGlobalDocuments(onlyActive = true) {
    const { adminClient, tenantId } = await getSupabaseContext()
    if (!adminClient || !tenantId) return []

    let query = adminClient
        .from('maquinaria_documentos')
        .select(`
            *,
            maquinaria:maquinarias (id, codigo_interno, modelo, modelo_ref:maquinaria_modelos(modelo)),
            tipo_doc:maquinaria_tipos_docs (nombre)
        `)
        .eq('tenant_id', tenantId)

    if (onlyActive) {
        query = query.eq('is_active', true)
    }

    const { data, error } = await query
        .order('fecha_vencimiento', { ascending: true })

    if (error) {
        console.error('Error fetching global docs:', error)
        return []
    }

    return data as MaquinariaDocumento[]
}


export async function getMaquinariaDocumentos(maquinariaId: string) {
    const { adminClient, tenantId } = await getSupabaseContext()
    if (!adminClient || !tenantId) return []

    const { data, error } = await adminClient
        .from('maquinaria_documentos')
        .select(`
            *,
            tipo_doc:tipo_doc_id (nombre, aplica_a)
        `)
        .eq('maquinaria_id', maquinariaId)
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .order('fecha_vencimiento', { ascending: true })

    if (error) {
        console.error('Error fetching docs:', error)
        return []
    }

    return data as MaquinariaDocumento[]
}

export async function createMaquinariaDocumento(_prevState: any, formData: FormData) {
    const { adminClient, tenantId, user } = await getSupabaseContext()
    if (!adminClient || !tenantId || !user) return { message: 'No autorizado' }

    const maquinaria_id = formData.get('maquinaria_id') as string
    const tipo_doc_id = formData.get('tipo_doc_id') as string
    const numero_doc = formData.get('numero_doc') as string
    const fecha_emision = formData.get('fecha_emision') as string || null
    const fecha_vencimiento = formData.get('fecha_vencimiento') as string || null
    const archivo = formData.get('archivo') as File

    // File Upload handling could go here. For now, assuming we handle file upload separately 
    // or we are just storing the logic. 
    // Since I cannot easily debug storage buckets blindly, I will check if file size > 0.

    let archivo_url = null
    if (archivo && archivo.size > 0) {
        // Fetch details for path generation
        const { data: maquina } = await adminClient.from('maquinarias').select('nombre').eq('id', maquinaria_id).single()
        const { data: tipo } = await adminClient.from('maquinaria_tipos_docs').select('nombre').eq('id', tipo_doc_id).single()

        if (!maquina || !tipo) return { message: 'Error recuperando datos para generar nombre de archivo' }

        const { cleanPathString } = await import('@/lib/utils')
        const cleanNombre = cleanPathString(maquina.nombre)
        const cleanTipo = cleanPathString(tipo.nombre)
        const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '') // YYYYMMDD
        const fileExt = archivo.name.split('.').pop()

        // Path: /nombre-equipo (clean) / tipo-doc (clean) / nombre-equipo (clean) - tipo-doc (clean) - YYYYMMDD
        const fileName = `${cleanNombre}/${cleanTipo}/${cleanNombre}-${cleanTipo}-${dateStr}.${fileExt}`

        const { error: uploadError } = await adminClient
            .storage
            .from('doc_maquinarias')
            .upload(fileName, archivo, {
                contentType: archivo.type,
                upsert: true
            })

        if (uploadError) {
            console.error('Upload error', uploadError)
            return { message: 'Error subiendo archivo: ' + uploadError.message }
        }

        // Get Public URL
        const { data: { publicUrl } } = adminClient
            .storage
            .from('doc_maquinarias')
            .getPublicUrl(fileName)

        archivo_url = publicUrl
    }

    const { error } = await adminClient
        .from('maquinaria_documentos')
        .insert({
            tenant_id: tenantId,
            maquinaria_id,
            tipo_doc_id,
            numero_doc,
            fecha_emision,
            fecha_vencimiento,
            archivo_url,
            estado: 'vigente', // Logic to determine if expired?
            created_by: user.id,
            updated_by: user.id
        })

    if (error) return { message: 'Error: ' + error.message }

    revalidatePath(`/maquinarias/${maquinaria_id}/edit`)
    return { message: 'Documento agregado', success: true }
}

export async function updateMaquinariaDocumento(id: string, _prevState: unknown, formData: FormData) {
    const { adminClient, tenantId, user } = await getSupabaseContext()
    if (!adminClient || !tenantId || !user) return { message: 'No autorizado' }

    const maquinaria_id = formData.get('maquinaria_id') as string
    const tipo_doc_id = formData.get('tipo_doc_id') as string
    const numero_doc = formData.get('numero_doc') as string
    const fecha_emision = formData.get('fecha_emision') as string || null
    const fecha_vencimiento = formData.get('fecha_vencimiento') as string || null
    const archivo = formData.get('archivo') as File | null

    const updates: Record<string, string | null> = {
        maquinaria_id,
        tipo_doc_id,
        numero_doc,
        fecha_emision,
        fecha_vencimiento,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
    }

    // Reuso del flujo de upload sólo si hay archivo nuevo
    if (archivo && archivo.size > 0) {
        const { data: maquina } = await adminClient.from('maquinarias').select('nombre').eq('id', maquinaria_id).single()
        const { data: tipo } = await adminClient.from('maquinaria_tipos_docs').select('nombre').eq('id', tipo_doc_id).single()

        if (!maquina || !tipo) return { message: 'Error recuperando datos para generar nombre de archivo' }

        const { cleanPathString } = await import('@/lib/utils')
        const cleanNombre = cleanPathString(maquina.nombre)
        const cleanTipo = cleanPathString(tipo.nombre)
        const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '')
        const fileExt = archivo.name.split('.').pop()
        const fileName = `${cleanNombre}/${cleanTipo}/${cleanNombre}-${cleanTipo}-${dateStr}.${fileExt}`

        const { error: uploadError } = await adminClient
            .storage
            .from('doc_maquinarias')
            .upload(fileName, archivo, { contentType: archivo.type, upsert: true })

        if (uploadError) return { message: 'Error subiendo archivo: ' + uploadError.message }

        const { data: { publicUrl } } = adminClient
            .storage
            .from('doc_maquinarias')
            .getPublicUrl(fileName)

        updates.archivo_url = publicUrl
    }

    const { error } = await adminClient
        .from('maquinaria_documentos')
        .update(updates)
        .eq('id', id)
        .eq('tenant_id', tenantId)

    if (error) return { message: 'Error: ' + error.message }

    revalidatePath('/maquinarias/documentos')
    revalidatePath(`/maquinarias/${maquinaria_id}/edit`)
    return { message: 'Documento actualizado', success: true }
}

export async function deleteMaquinariaDocumento(id: string, maquinariaId: string) {
    const { adminClient, tenantId } = await getSupabaseContext()
    if (!adminClient || !tenantId) return { message: 'No autorizado' }

    const { error } = await adminClient
        .from('maquinaria_documentos')
        .update({ is_active: false })
        .eq('id', id)
        .eq('tenant_id', tenantId)

    if (error) return { message: 'Error al eliminar' }

    revalidatePath(`/maquinarias/${maquinariaId}/edit`)
    revalidatePath('/maquinarias/documentos')
    return { message: 'Documento eliminado' }
}

export async function restoreMaquinariaDocumento(id: string, maquinariaId?: string) {
    const { adminClient, tenantId } = await getSupabaseContext()
    if (!adminClient || !tenantId) return { message: 'No autorizado' }

    const { error } = await adminClient
        .from('maquinaria_documentos')
        .update({ is_active: true })
        .eq('id', id)
        .eq('tenant_id', tenantId)

    if (error) return { message: 'Error al restaurar' }

    if (maquinariaId) {
        revalidatePath(`/maquinarias/${maquinariaId}/edit`)
    }
    revalidatePath('/maquinarias/documentos')

    return { message: 'Documento restaurado', success: true }
}
