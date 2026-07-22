'use server'

import { Tercero } from '@/types/terceros'
import { getSupabaseContext, safeRevalidatePath } from '@/lib/action-context'



function getLogoPath(razon_social: string, fileName: string, tenantId: string) {
    const cleanName = razon_social.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const fileExt = fileName.split('.').pop()
    const newFileName = `${cleanName}-logo-${dateStr}.${fileExt}`
    return `${tenantId}/${cleanName}/logo/${newFileName}`
}

export async function getTerceros(query?: string, onlyActive = true, tipo?: string) {
    const { adminClient, tenantId } = await getSupabaseContext()
    if (!adminClient || !tenantId) return []

    let dbQuery = adminClient
        .from('terceros')
        .select(`
            *,
            rubros(nombre),
            paises(nombre),
            ubigeo(departamento, provincia, distrito)
        `)
        .eq('tenant_id', tenantId)

    if (onlyActive) {
        dbQuery = dbQuery.eq('is_active', true)
    }

    if (tipo) {
        dbQuery = dbQuery.eq('tipo', tipo.toLowerCase())
    }

    dbQuery = dbQuery.order('created_at', { ascending: false })

    if (query) {
        dbQuery = dbQuery.or(`razon_social.ilike.%${query}%,ruc.ilike.%${query}%`)
    }

    const { data, error } = await dbQuery

    if (error) {
        console.error('Error fetching terceros:', error)
        return []
    }

    return data as (Tercero & {
        rubros: { nombre: string },
        paises: { nombre: string },
        ubigeo: { departamento: string, provincia: string, distrito: string }
    })[]
}

export async function getTercerosForSelect(): Promise<{ id: string; razon_social: string }[]> {
    const { adminClient, tenantId } = await getSupabaseContext()
    if (!adminClient || !tenantId) return []
    const { data } = await adminClient
        .from('terceros')
        .select('id, razon_social')
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .order('razon_social', { ascending: true })
    return (data ?? []) as { id: string; razon_social: string }[]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createTercero(prevState: any, formData: FormData) {
    const { adminClient, tenantId, user } = await getSupabaseContext()
    if (!adminClient || !tenantId || !user) return { message: 'No autorizado' }

    const razon_social = formData.get('razon_social') as string
    const ruc = formData.get('ruc') as string
    // Normalizar tipo a minúsculas (evita registros invisibles al filtro case-sensitive, ej. 'PROVEEDOR')
    const tipo = ((formData.get('tipo') as string) || '').toLowerCase()
    const rubro_id = formData.get('rubro_id') as string || null
    const pais_id = formData.get('pais_id') as string || null
    const ubigeo_codigo = formData.get('ubigeo_codigo') as string || null
    const direccion = formData.get('direccion') as string
    const ubicacion_ciudad = formData.get('ubicacion_ciudad') as string
    const ubicacion_departamento = formData.get('ubicacion_departamento') as string
    // Email opcional (QuickTerceroDialog) → se persiste como contacto principal
    const contactoEmail = (formData.get('email') as string || '').trim()

    if (!razon_social || !ruc) {
        return { message: 'Razón Social y RUC son requeridos' }
    }

    const logoFile = formData.get('logo') as File | null
    const uploadedLogoUrl = formData.get('uploaded_logo_url') as string
    let logo_url = null

    if (uploadedLogoUrl && uploadedLogoUrl.length > 0) {
        logo_url = uploadedLogoUrl
    } else if (logoFile && logoFile.size > 0) {
        // Upload Logo if present (Server fallback)
        const cleanName = razon_social.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '') // YYYYMMDD
        const fileExt = logoFile.name.split('.').pop()
        const newFileName = `${cleanName}-logo-${dateStr}.${fileExt}`
        const filePath = `${tenantId}/${cleanName}/logo/${newFileName}`

        const { error: uploadError } = await adminClient.storage
            .from('tercero')
            .upload(filePath, logoFile, {
                contentType: logoFile.type,
                upsert: true
            })

        if (uploadError) {
            console.error('Error uploading logo:', uploadError)
        } else {
            const { data: { publicUrl } } = adminClient.storage.from('tercero').getPublicUrl(filePath)
            logo_url = publicUrl
        }
    }

    const { data, error } = await adminClient
        .from('terceros')
        .insert({
            tenant_id: tenantId,
            razon_social,
            ruc,
            tipo,
            rubro_id,
            pais_id,
            ubigeo_codigo,
            direccion,
            ubicacion_ciudad,
            ubicacion_departamento,
            logo_url,
            is_active: true,
            created_by: user.id,
            updated_by: user.id
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating tercero:', error)
        return { message: 'Error al crear tercero: ' + error.message }
    }

    // Si vino un email (alta rápida), crear el contacto principal del tercero
    if (contactoEmail) {
        const { error: contactoError } = await adminClient
            .from('terceros_contactos')
            .insert({
                tenant_id: tenantId,
                tercero_id: data.id,
                nombre_completo: 'CONTACTO PRINCIPAL',
                email: contactoEmail,
                created_by: user.id,
                updated_by: user.id
            })
        if (contactoError) {
            // No bloquea la creación del tercero
            console.error('Error creating contacto principal:', contactoError)
        }
    }

    safeRevalidatePath('/terceros')
    return {
        message: 'Tercero creado correctamente',
        success: true,
        tercero: {
            id: data.id,
            razon_social: data.razon_social,
            ruc: data.ruc
        }
    }
}

export async function deleteTercero(id: string) {
    const { adminClient, tenantId } = await getSupabaseContext()
    if (!adminClient || !tenantId) return { message: 'No autorizado' }

    const { error } = await adminClient
        .from('terceros')
        .update({ is_active: false })
        .eq('id', id)
        .eq('tenant_id', tenantId)

    if (error) {
        return { message: 'Error al eliminar' }
    }

    safeRevalidatePath('/terceros')
    return { message: 'Eliminado correctamente', success: true }
}

export async function restoreTercero(id: string) {
    const { adminClient, tenantId } = await getSupabaseContext()
    if (!adminClient || !tenantId) return { message: 'No autorizado' }

    const { error } = await adminClient
        .from('terceros')
        .update({ is_active: true })
        .eq('id', id)
        .eq('tenant_id', tenantId)

    if (error) {
        return { message: 'Error al restaurar' }
    }

    safeRevalidatePath('/terceros')
    return { message: 'Restaurado correctamente', success: true }
}

export async function getTerceroById(id: string) {
    const { adminClient, tenantId } = await getSupabaseContext()
    if (!adminClient || !tenantId) return null

    const { data, error } = await adminClient
        .from('terceros')
        .select(`
            *,
            ubigeo (
                departamento,
                provincia,
                distrito
            )
        `)
        .eq('id', id)
        .eq('tenant_id', tenantId)
        .single()

    if (error) return null
    return data as Tercero
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateTercero(prevState: any, formData: FormData) {
    const { adminClient, tenantId, user } = await getSupabaseContext()
    if (!adminClient || !tenantId || !user) return { message: 'No autorizado' }

    const id = formData.get('id') as string
    const razon_social = formData.get('razon_social') as string
    const ruc = formData.get('ruc') as string
    // Normalizar tipo a minúsculas (misma regla que createTercero)
    const tipo = ((formData.get('tipo') as string) || '').toLowerCase()
    const rubro_id = formData.get('rubro_id') as string || null
    const pais_id = formData.get('pais_id') as string || null
    const ubigeo_codigo = formData.get('ubigeo_codigo') as string || null
    const direccion = formData.get('direccion') as string
    const ubicacion_ciudad = formData.get('ubicacion_ciudad') as string
    const ubicacion_departamento = formData.get('ubicacion_departamento') as string

    if (!id || !razon_social || !ruc) {
        return { message: 'Datos incompletos' }
    }

    const logoFile = formData.get('logo') as File | null
    const uploadedLogoUrl = formData.get('uploaded_logo_url') as string

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: any = {
        razon_social,
        ruc,
        tipo,
        rubro_id,
        pais_id,
        ubigeo_codigo,
        direccion,
        ubicacion_ciudad,
        ubicacion_departamento,
        updated_by: user.id,
        updated_at: new Date().toISOString()
    }

    if (uploadedLogoUrl && uploadedLogoUrl.length > 0) {
        payload.logo_url = uploadedLogoUrl
    } else if (logoFile && logoFile.size > 0) {
        // Fallback to server-side upload if client-side failed or wasn't used
        const filePath = getLogoPath(razon_social, logoFile.name, tenantId)

        const { error: uploadError } = await adminClient.storage
            .from('tercero')
            .upload(filePath, logoFile, {
                contentType: logoFile.type,
                upsert: true
            })

        if (!uploadError) {
            const { data: { publicUrl } } = adminClient.storage.from('tercero').getPublicUrl(filePath)
            payload.logo_url = publicUrl
        }
    }

    const { error } = await adminClient
        .from('terceros')
        .update(payload)
        .eq('id', id)
        .eq('tenant_id', tenantId)

    if (error) {
        console.error('Error updating tercero:', error)
        return { message: 'Error al actualizar: ' + error.message }
    }

    safeRevalidatePath('/terceros')
    return { message: 'Tercero actualizado correctamente', success: true }
}
