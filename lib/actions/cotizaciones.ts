'use server'

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { ActionResponse, CotizacionEstado, HistoricalClientQuote, HistoricalSupplierOffer } from '@/types/cotizaciones'
import { getSupabaseContext, safeRevalidatePath } from '@/lib/action-context'



// ============================================
// COTIZACIONES ACTIONS
// ============================================

export async function getCotizaciones(
    estado?: CotizacionEstado,
    onlyActive = true
) {
    const { adminClient, tenantId } = await getSupabaseContext()
    if (!adminClient || !tenantId) return []

    let query = adminClient
        .from('cotizaciones')
        .select(`
            *,
            cliente:terceros!cotizaciones_cliente_id_fkey(id, razon_social, ruc),
            contacto:terceros_contactos(id, nombre_completo, email),
            sitio:terceros_sitios(id, nombre, direccion),
            detalles:cotizaciones_detalle(
                cantidad,
                servicio:servicios(nombre)
            ),
            ofertas:cotizaciones_ofertas_proveedores(
                proveedor_nombre,
                proveedor_id,
                proveedor:terceros!cotizaciones_ofertas_proveedores_proveedor_id_fkey(razon_social)
            )
        `)
        .eq('tenant_id', tenantId)

    if (onlyActive) {
        query = query.eq('is_active', true)
    }

    if (estado) {
        query = query.eq('estado', estado)
    }

    query = query.order('created_at', { ascending: false })

    const { data, error } = await query

    if (error) {
        console.error('Error fetching cotizaciones:', error)
        return []
    }

    return data
}

export async function getCotizacionesByClienteId(clienteId: string) {
    const { adminClient, tenantId } = await getSupabaseContext()
    if (!adminClient || !tenantId) return []

    const { data, error } = await adminClient
        .from('cotizaciones')
        .select('id, numero, estado')
        .eq('tenant_id', tenantId)
        .eq('cliente_id', clienteId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

    if (error) return []
    return data as { id: string; numero: string; estado: string }[]
}

export async function getCotizacionById(id: string) {
    const { adminClient, tenantId } = await getSupabaseContext()
    if (!adminClient || !tenantId) return null

    // `cotizaciones_matriz_responsabilidad` no tiene FK a `actividades_matriz`
    // en la DB actual (solo tiene FK a cotizaciones + companies). Ya no hacemos
    // el embed `actividad_details:actividades_matriz(...)` — PostgREST devolvía
    // PGRST200 "Could not find relationship" y la page crasheaba a 404. La
    // columna `descripcion` directa en la tabla es la fuente legacy.
    const { data, error } = await adminClient
        .from('cotizaciones')
        .select(`
            *,
            cliente:terceros!cotizaciones_cliente_id_fkey(id, razon_social, ruc, logo_url),
            contacto:terceros_contactos(id, nombre_completo, email),
            sitio:terceros_sitios(id, nombre, direccion),
            tasa_cambio:tasas_cambio(id, tasa, moneda_origen, moneda_destino),
            detalles:cotizaciones_detalle(
                *,
                servicio:servicios(*)
            ),
            matriz_responsabilidad:cotizaciones_matriz_responsabilidad(*)
        `)
        .eq('id', id)
        .eq('tenant_id', tenantId)
        .single()

    if (error) {
        console.error('Error fetching cotizacion:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
            id,
            tenantId,
        })
        return null
    }

    // Flatten embed results → _nombre fields
    if (data.detalles) {
        for (const d of data.detalles) {
            if (d.servicio) {
                const s = d.servicio
                s.precio_1_tipo_nombre = s.tipo_p1?.nombre ?? null
                s.precio_2_tipo_nombre = s.tipo_p2?.nombre ?? null
                s.precio_3_tipo_nombre = s.tipo_p3?.nombre ?? null
                delete s.tipo_p1; delete s.tipo_p2; delete s.tipo_p3
            }
        }
    }

    return data
}

// Generar número de cotización
async function generateNumeroCotizacion(tenantId: string, adminClient: SupabaseClient) {
    const year = new Date().getFullYear()
    const prefix = `CT ${year}-`

    // Get last number for this year
    const { data } = await adminClient
        .from('cotizaciones')
        .select('numero')
        .eq('tenant_id', tenantId)
        .like('numero', `${prefix}%`)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

    if (data?.numero) {
        const lastNumber = parseInt(data.numero.split('-')[1])
        return `${prefix}${String(lastNumber + 1).padStart(4, '0')}`
    }

    return `${prefix}0001`
}

export async function createCotizacion(_prevState: ActionResponse, formData: FormData): Promise<ActionResponse> {
    const { adminClient, tenantId, user } = await getSupabaseContext()
    if (!adminClient || !tenantId || !user) return { message: 'No autorizado' }

    const cliente_id = formData.get('cliente_id') as string
    const contacto_id = formData.get('contacto_id') as string
    const sitio_id = formData.get('sitio_id') as string
    const fecha_emision = formData.get('fecha_emision') as string
    const fecha_inicio_estimada = formData.get('fecha_inicio_estimada') as string
    const periodo = parseInt(formData.get('periodo') as string)
    const periodo_unidad = formData.get('periodo_unidad') as string
    const forma_pago = formData.get('forma_pago') as string
    const moneda = formData.get('moneda') as string
    const plazo_pago = formData.get('plazo_pago') as string
    const descripcion_requerimiento = formData.get('descripcion_requerimiento') as string
    const tasa_cambio_id = formData.get('tasa_cambio_id') as string

    if (!cliente_id) return { message: 'Falta Cliente ID' }
    if (!fecha_emision) return { message: 'Falta Fecha Emisión' }
    if (isNaN(periodo)) return { message: 'Periodo inválido' }
    if (!moneda) return { message: 'Falta Moneda' }

    // Generate numero
    const numero = await generateNumeroCotizacion(tenantId, adminClient)

    // Calculate fecha_vencimiento (30 days from emission)
    const fechaEmision = new Date(fecha_emision)
    const fechaVencimiento = new Date(fechaEmision)
    fechaVencimiento.setDate(fechaVencimiento.getDate() + 30)

    // Helper to sanitize IDs
    const sanitizeId = (id: string) => (id && id !== '_none' ? id : null)

    const { data: cotizacion, error } = await adminClient
        .from('cotizaciones')
        .insert({
            tenant_id: tenantId,
            numero,
            version: 1,
            cliente_id,
            contacto_id: sanitizeId(contacto_id),
            sitio_id: sanitizeId(sitio_id),
            fecha_emision,
            fecha_inicio_estimada: fecha_inicio_estimada || null,
            fecha_vencimiento: fechaVencimiento.toISOString().split('T')[0],
            dias_validez: 30,
            periodo,
            periodo_unidad,
            forma_pago,
            moneda,
            plazo_pago,
            descripcion_requerimiento: descripcion_requerimiento || null,
            tasa_cambio_id: sanitizeId(tasa_cambio_id),
            estado: 'BORRADOR',
            subtotal: 0,
            igv: 0,
            total: 0,
            created_by: user.id,
            updated_by: user.id
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating cotizacion:', error)
        return { message: 'Error al crear cotización: ' + error.message }
    }

    safeRevalidatePath('/cotizaciones')
    return {
        message: 'Cotización creada',
        success: true,
        cotizacion_id: cotizacion.id
    }
}

export async function updateCotizacionPaso1(_prevState: ActionResponse, formData: FormData): Promise<ActionResponse> {
    const { adminClient, tenantId, user } = await getSupabaseContext()
    if (!adminClient || !tenantId || !user) return { message: 'No autorizado' }

    const id = formData.get('id') as string
    const cliente_id = formData.get('cliente_id') as string
    const contacto_id = formData.get('contacto_id') as string
    const sitio_id = formData.get('sitio_id') as string
    const fecha_emision = formData.get('fecha_emision') as string
    const fecha_inicio_estimada = formData.get('fecha_inicio_estimada') as string
    const periodo = parseInt(formData.get('periodo') as string)
    const periodo_unidad = formData.get('periodo_unidad') as string
    const forma_pago = formData.get('forma_pago') as string
    const moneda = formData.get('moneda') as string
    const plazo_pago = formData.get('plazo_pago') as string
    const descripcion_requerimiento = formData.get('descripcion_requerimiento') as string
    const tasa_cambio_id = formData.get('tasa_cambio_id') as string

    if (!id || !cliente_id || !fecha_emision || !periodo || !moneda) {
        return { message: 'Campos requeridos faltantes' }
    }

    const sanitizeId = (id: string) => (id && id !== '_none' ? id : null)

    const { error } = await adminClient
        .from('cotizaciones')
        .update({
            cliente_id,
            contacto_id: sanitizeId(contacto_id),
            sitio_id: sanitizeId(sitio_id),
            fecha_emision,
            fecha_inicio_estimada: fecha_inicio_estimada || null,
            periodo,
            periodo_unidad,
            forma_pago,
            moneda,
            plazo_pago,
            descripcion_requerimiento: descripcion_requerimiento || null,
            tasa_cambio_id: sanitizeId(tasa_cambio_id),
            updated_by: user.id,
            updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('tenant_id', tenantId)

    if (error) {
        console.error('Error updating cotizacion:', error)
        return { message: 'Error al actualizar cotización: ' + error.message }
    }

    safeRevalidatePath('/cotizaciones')
    safeRevalidatePath(`/cotizaciones/${id}`)
    return { message: 'Cotización actualizada', success: true }
}

// ============================================
// COTIZACIONES DETALLE ACTIONS
// ============================================

// Import getServicioById or query directly. Since we are in same context, query directly to avoid circular depends if any.
// Actually, let's query directly for simplicity.

export async function addServicioToCotizacion(cotizacion_id: string, servicio_id: string, cantidad: number, precio_seleccionado: number = 1) {
    const { adminClient, tenantId, user } = await getSupabaseContext()
    if (!adminClient || !tenantId || !user) return { message: 'No autorizado' }

    // 1. Get Service Details for Snapshot
    const { data: servicio, error: serviceError } = await adminClient
        .from('servicios')
        .select('*')
        .eq('id', servicio_id)
        .eq('tenant_id', tenantId)
        .single()

    if (serviceError || !servicio) {
        return { message: 'Servicio no encontrado' }
    }

    // 2. Determine Price Snapshot
    let precio_tipo = null
    let precio_valor = 0
    let precio_campo_adicional = null

    if (precio_seleccionado === 1) {
        precio_tipo = servicio.precio_1_tipo
        precio_valor = servicio.precio_1_valor
        precio_campo_adicional = servicio.precio_1_campo_adicional
    } else if (precio_seleccionado === 2) {
        precio_tipo = servicio.precio_2_tipo
        precio_valor = servicio.precio_2_valor
        precio_campo_adicional = servicio.precio_2_campo_adicional
    } else if (precio_seleccionado === 3) {
        precio_tipo = servicio.precio_3_tipo
        precio_valor = servicio.precio_3_valor
        precio_campo_adicional = servicio.precio_3_campo_adicional
    } else if (precio_seleccionado === 0) {
        precio_tipo = 'SEGÚN TIEMPO'
        precio_valor = 0
        precio_campo_adicional = null
    }

    // 3. Get next orden
    const { data: detalles } = await adminClient
        .from('cotizaciones_detalle')
        .select('orden')
        .eq('cotizacion_id', cotizacion_id)
        .order('orden', { ascending: false })
        .limit(1)

    const nextOrden = detalles && detalles.length > 0 ? detalles[0].orden + 1 : 1

    const { error } = await adminClient
        .from('cotizaciones_detalle')
        .insert({
            cotizacion_id,
            tenant_id: tenantId,
            servicio_id,
            cantidad,
            orden: nextOrden,

            // Snapshot fields
            precio_seleccionado: precio_seleccionado === 0 ? 1 : precio_seleccionado, // Workaround: DB constraint requires 1,2,3. We use 1 as dummy for 0, relying on precio_tipo to identify 'SEGÚN TIEMPO'
            precio_tipo,
            precio_valor,
            precio_campo_adicional,

            estado_aprobacion: 'PENDIENTE',
            created_by: user.id
        })

    if (error) {
        console.error('Error adding servicio:', error)
        return { message: 'Error al agregar servicio: ' + error.message + ' (Code: ' + error.code + ')' }
    }

    safeRevalidatePath(`/cotizaciones/${cotizacion_id}`)
    return { message: 'Servicio agregado', success: true }
}

export async function removeServicioFromCotizacion(detalle_id: string) {
    const { adminClient, tenantId } = await getSupabaseContext()
    if (!adminClient || !tenantId) return { message: 'No autorizado' }

    const { error } = await adminClient
        .from('cotizaciones_detalle')
        .delete()
        .eq('id', detalle_id)
        .eq('tenant_id', tenantId)

    if (error) {
        console.error('Error removing servicio:', error)
        return { message: 'Error al quitar servicio' }
    }

    safeRevalidatePath('/cotizaciones')
    return { message: 'Servicio quitado', success: true }
}

export async function updateCantidadServicio(detalle_id: string, cantidad: number) {
    const { adminClient, tenantId } = await getSupabaseContext()
    if (!adminClient || !tenantId) return { message: 'No autorizado' }

    const { error } = await adminClient
        .from('cotizaciones_detalle')
        .update({ cantidad })
        .eq('id', detalle_id)
        .eq('tenant_id', tenantId)

    if (error) {
        console.error('Error updating cantidad:', error)
        return { message: 'Error al actualizar cantidad' }
    }

    safeRevalidatePath('/cotizaciones')
    return { message: 'Cantidad actualizada', success: true }
}

export async function deleteCotizacion(id: string) {
    const { adminClient, tenantId } = await getSupabaseContext()
    if (!adminClient || !tenantId) return { message: 'No autorizado' }

    const { error } = await adminClient
        .from('cotizaciones')
        .update({ is_active: false })
        .eq('id', id)
        .eq('tenant_id', tenantId)

    if (error) {
        console.error('Error deleting cotizacion:', error)
        return { message: 'Error al eliminar' }
    }

    safeRevalidatePath('/cotizaciones')
    return { message: 'Eliminado correctamente', success: true }
}

export async function restoreCotizacion(id: string) {
    const { adminClient, tenantId } = await getSupabaseContext()
    if (!adminClient || !tenantId) return { message: 'No autorizado' }

    const { error } = await adminClient
        .from('cotizaciones')
        .update({ is_active: true })
        .eq('id', id)
        .eq('tenant_id', tenantId)

    if (error) {
        console.error('Error restoring cotizacion:', error)
        return { message: 'Error al restaurar' }
    }


    safeRevalidatePath('/cotizaciones')
    return { message: 'Restaurado correctamente', success: true }
}

export async function duplicateCotizacion(id: string) {
    const { adminClient, tenantId, user } = await getSupabaseContext()
    if (!adminClient || !tenantId || !user) return { message: 'No autorizado' }

    // 1. Fetch original cotizacion
    const original = await getCotizacionById(id)
    if (!original) return { message: 'Cotización no encontrada' }

    // 2. Generate new number
    const numero = await generateNumeroCotizacion(tenantId, adminClient)

    // 3. Create new cotizacion record
    const { data: newCotizacion, error: createError } = await adminClient
        .from('cotizaciones')
        .insert({
            tenant_id: tenantId,
            numero: numero + ' (Copia)',
            version: 1,
            cliente_id: original.cliente_id,
            contacto_id: original.contacto_id,
            sitio_id: original.sitio_id,
            fecha_emision: new Date().toISOString().split('T')[0], // Today
            fecha_inicio_estimada: original.fecha_inicio_estimada,
            fecha_vencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            dias_validez: original.dias_validez,
            periodo: original.periodo,
            periodo_unidad: original.periodo_unidad,
            forma_pago: original.forma_pago,
            moneda: original.moneda,
            plazo_pago: original.plazo_pago,
            descripcion_requerimiento: original.descripcion_requerimiento,
            tasa_cambio_id: original.tasa_cambio_id,
            cotizacion_padre_id: original.id, // Trace origin
            estado: 'BORRADOR',
            subtotal: 0, // Recalculated later or could copy? Let's copy 0 and let verify step fix it, or copy simplistic.
            igv: 0,
            total: 0,
            created_by: user.id,
            updated_by: user.id,
            is_active: true
        })
        .select()
        .single()

    if (createError) {
        console.error('Error duplicating cotizacion header:', createError)
        return { message: 'Error al duplicar cabecera' }
    }

    // 4. Duplicate Detalles (Services)
    if (original.detalles && original.detalles.length > 0) {
        const detallesInsert = (original.detalles as unknown[]).map((d: any) => ({
            cotizacion_id: newCotizacion.id,
            tenant_id: tenantId,
            servicio_id: d.servicio_id,
            cantidad: d.cantidad,
            orden: d.orden,
            precio_seleccionado: d.precio_seleccionado,
            precio_tipo: d.precio_tipo,
            precio_valor: d.precio_valor,
            precio_campo_adicional: d.precio_campo_adicional,
            estado_aprobacion: 'PENDIENTE',
            created_by: user.id
        }))

        const { error: detallesError } = await adminClient
            .from('cotizaciones_detalle')
            .insert(detallesInsert)

        if (detallesError) {
            console.error('Error duplicating detalles:', detallesError)
            // Should potentially rollback? For now just log.
        }
    }

    // 5. Duplicate Matriz Responsabilidad
    if (original.matriz_responsabilidad && original.matriz_responsabilidad.length > 0) {
        const matrizInsert = (original.matriz_responsabilidad as unknown[]).map((m: any) => ({
            cotizacion_id: newCotizacion.id,
            tenant_id: tenantId,
            actividad: m.actividad,
            responsable: m.responsable,
            orden: m.orden,
            created_by: user.id
        }))

        const { error: matrizError } = await adminClient
            .from('cotizaciones_matriz_responsabilidad')
            .insert(matrizInsert)

        if (matrizError) {
            console.error('Error duplicating matriz:', matrizError)
        }
    }

    safeRevalidatePath('/cotizaciones')
    return {
        message: 'Cotización duplicada correctamente',
        success: true,
        new_id: newCotizacion.id
    }
}

// ============================================
// MATRIZ RESPONSABILIDAD ACTIONS
// ============================================

export async function getMatrizResponsabilidad(cotizacion_id: string) {
    const { adminClient, tenantId } = await getSupabaseContext()
    if (!adminClient || !tenantId) return []

    const { data, error } = await adminClient
        .from('cotizaciones_matriz_responsabilidad')
        .select('*')
        .eq('cotizacion_id', cotizacion_id)
        .eq('tenant_id', tenantId)
        .order('orden', { ascending: true })

    if (error) {
        console.error('Error fetching matriz:', error)
        return []
    }

    return data
}

export async function saveMatrizResponsabilidad(
    cotizacion_id: string,
    actividades: Array<{ actividad_id?: string; actividad: string; descripcion?: string; responsable: 'EMPRESA' | 'CLIENTE' | 'AMBOS'; orden: number }>
) {
    const { adminClient, tenantId, user } = await getSupabaseContext()
    if (!adminClient || !tenantId || !user) return { message: 'No autorizado' }

    // Delete existing matriz
    await adminClient
        .from('cotizaciones_matriz_responsabilidad')
        .delete()
        .eq('cotizacion_id', cotizacion_id)
        .eq('tenant_id', tenantId)

    // Insert new matriz. La columna `actividad_id` se eliminó: la tabla
    // `cotizaciones_matriz_responsabilidad` solo tiene `actividad` (nombre
    // corto), `descripcion` (texto largo que va al PDF), `responsable` y
    // `orden`. El `actividad_id` que había antes causaba error silencioso
    // porque no existe como columna. Persistimos `descripcion` — sin esto
    // el preview mostraba "Actividad 1/2/..." en vez del texto real del
    // catálogo.
    const insertData = actividades.map(act => ({
        cotizacion_id,
        tenant_id: tenantId,
        actividad: act.actividad,
        descripcion: act.descripcion || null,
        responsable: act.responsable,
        orden: act.orden,
        created_by: user.id,
    }))

    const { error } = await adminClient
        .from('cotizaciones_matriz_responsabilidad')
        .insert(insertData)

    if (error) {
        console.error('Error saving matriz:', error)
        return { message: 'Error al guardar matriz: ' + error.message }
    }

    safeRevalidatePath(`/cotizaciones/${cotizacion_id}`)
    return { message: 'Matriz guardada', success: true }
}

export async function getActividadesMatrizCatalog() {
    const { adminClient, tenantId } = await getSupabaseContext()
    if (!adminClient || !tenantId) return []

    const { data, error } = await adminClient
        .from('actividades_matriz')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .order('orden', { ascending: true })

    if (error) {
        console.error('Error fetching actividades catalog:', error)
        return []
    }

    return data
}

export async function addActividadMatrizCatalog(
    nombre: string,
    responsable_default: 'EMPRESA' | 'CLIENTE' | 'AMBOS',
    descripcion?: string
) {
    const { adminClient, tenantId, user } = await getSupabaseContext()
    if (!adminClient || !tenantId || !user) return { message: 'No autorizado' }

    // Get next orden
    const { data: actividades } = await adminClient
        .from('actividades_matriz')
        .select('orden')
        .eq('tenant_id', tenantId)
        .order('orden', { ascending: false })
        .limit(1)

    const nextOrden = actividades && actividades.length > 0 ? actividades[0].orden + 1 : 1

    const { error } = await adminClient
        .from('actividades_matriz')
        .insert({
            tenant_id: tenantId,
            nombre,
            descripcion: descripcion || null,
            responsable_default,
            orden: nextOrden,
            created_by: user.id
        })

    if (error) {
        console.error('Error adding actividad:', error)
        return { message: 'Error al agregar actividad' }
    }

    return { message: 'Actividad agregada', success: true }
}


// ============================================
// PRECIOS ACTIONS
// ============================================

export async function updatePreciosDetalle(
    detalle_id: string,
    precio_seleccionado: number,
    precio_tipo: string,
    precio_valor: number,
    precio_campo_adicional?: number
) {
    const { adminClient, tenantId } = await getSupabaseContext()
    if (!adminClient || !tenantId) return { message: 'No autorizado' }

    // Si precio_tipo es un UUID, resolverlo al nombre para snapshot inmutable
    let precio_tipo_snapshot = precio_tipo
    if (precio_tipo && /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(precio_tipo)) {
        const { data: tipo } = await adminClient
            .from('servicios_tipo_precios')
            .select('nombre')
            .eq('id', precio_tipo)
            .eq('tenant_id', tenantId)
            .maybeSingle()
        if (tipo?.nombre) precio_tipo_snapshot = tipo.nombre
    }

    const { error } = await adminClient
        .from('cotizaciones_detalle')
        .update({
            precio_seleccionado: precio_seleccionado === 0 ? 1 : precio_seleccionado,
            precio_tipo: precio_tipo_snapshot,
            precio_valor,
            precio_campo_adicional: precio_campo_adicional || null
        })
        .eq('id', detalle_id)
        .eq('tenant_id', tenantId)

    if (error) {
        console.error('Error updating precios:', error)
        return { message: 'Error al actualizar precios' }
    }

    safeRevalidatePath('/cotizaciones')
    return { message: 'Precios actualizados', success: true }
}

// ============================================
// OFERTAS PROVEEDORES ACTIONS
// ============================================

export async function getOfertasProveedores(cotizacion_id: string, servicio_id?: string) {
    const { adminClient, tenantId } = await getSupabaseContext()
    if (!adminClient || !tenantId) return []

    let query = adminClient
        .from('cotizaciones_ofertas_proveedores')
        .select(`
            *,
            servicio:servicios(codigo, nombre)
        `)
        .eq('cotizacion_id', cotizacion_id)
        .eq('tenant_id', tenantId)

    if (servicio_id) {
        query = query.eq('servicio_id', servicio_id)
    }

    query = query.order('created_at', { ascending: false })

    const { data, error } = await query

    if (error) {
        console.error('Error fetching ofertas:', error)
        return []
    }

    return data
}

import { OfertaProveedorFormData } from '@/types/cotizaciones'

export async function addOfertaProveedor(
    cotizacion_id: string,
    formData: OfertaProveedorFormData
) {
    const { adminClient, tenantId, user } = await getSupabaseContext()
    if (!adminClient || !tenantId || !user) return { message: 'No autorizado' }

    // Validar datos mínimos
    if (!formData.servicio_id || !formData.precio) {
        return { message: 'Servicio y Precio son obligatorios' }
    }

    // 1. Create Header (Offer Provider)
    const { data: ofertaHeader, error: headerError } = await adminClient
        .from('cotizaciones_ofertas_proveedores')
        .insert({
            tenant_id: tenantId,
            cotizacion_id: cotizacion_id,
            servicio_id: formData.servicio_id, // Main service for the offer group
            proveedor_nombre: formData.proveedor_nombre || 'Proveedor Manual',
            precio: formData.precio, // Total price for list view
            observaciones: formData.observaciones || null,

            id_oferta_manual: formData.id_oferta_manual,
            fecha_oferta: formData.fecha_oferta,
            proveedor_id: formData.proveedor_id,
            contacto_id: formData.contacto_id,
            moneda: formData.moneda || 'USD',
            forma_pago: formData.forma_pago,
            plazo_pago: formData.plazo_pago,
            fecha_inicio_preliminar: formData.fecha_inicio_preliminar,
            fecha_solicitud: formData.fecha_solicitud,
            sitio_texto: formData.sitio_texto,
            descripcion_requerimiento: formData.descripcion_requerimiento,

            created_by: user.id
        })
        .select()
        .single()

    if (headerError) {
        console.error('Error adding oferta header:', headerError)
        return { message: 'Error al agregar oferta: ' + headerError.message }
    }

    // 2. Create Item (Offer Item) with Detailed Prices
    const { error: itemError } = await adminClient
        .from('cotizaciones_ofertas_items')
        .insert({
            cotizacion_oferta_id: ofertaHeader.id,
            tenant_id: tenantId,
            servicio_id: formData.servicio_id,
            descripcion: formData.descripcion_requerimiento,
            cantidad: formData.cantidad || 1,
            precio_monto: formData.precio, // Total line amount

            // Detailed Breakdown
            precio_1_valor: formData.precio_1_valor,
            precio_1_campo_adicional: formData.precio_1_campo_adicional,
            precio_2_valor: formData.precio_2_valor,
            precio_2_campo_adicional: formData.precio_2_campo_adicional,
            precio_3_valor: formData.precio_3_valor,
            precio_3_campo_adicional: formData.precio_3_campo_adicional,

            created_by: user.id
        })

    if (itemError) {
        console.error('Error adding oferta item:', itemError)
        // Cleanup header? For now, we return error but header might remain. 
        // Ideal: Transaction or cleanup. Given limitations, report error.
        return { message: 'Error al agregar detalle de oferta: ' + itemError.message }
    }

    safeRevalidatePath(`/cotizaciones/${cotizacion_id}`)
    return { message: 'Oferta agregada', success: true }
}

export async function deleteOfertaProveedor(oferta_id: string) {
    const { adminClient, tenantId } = await getSupabaseContext()
    if (!adminClient || !tenantId) return { message: 'No autorizado' }

    const { error } = await adminClient
        .from('cotizaciones_ofertas_proveedores')
        .delete()
        .eq('id', oferta_id)
        .eq('tenant_id', tenantId)

    if (error) {
        console.error('Error deleting oferta:', error)
        return { message: 'Error al eliminar oferta' }
    }

    safeRevalidatePath('/cotizaciones')
    return { message: 'Oferta eliminada', success: true }
}

// ============================================
// PDF GENERATION ACTIONS
// ============================================

export async function updateNotasPrecios(cotizacion_id: string, notas: string) {
    const { adminClient, tenantId } = await getSupabaseContext()
    if (!adminClient || !tenantId) return { message: 'No autorizado' }

    const { error } = await adminClient
        .from('cotizaciones')
        .update({ notas_precios: notas })
        .eq('id', cotizacion_id)
        .eq('tenant_id', tenantId)

    if (error) {
        console.error('Error updating notas:', error)
        return { message: 'Error al actualizar notas' }
    }

    safeRevalidatePath(`/cotizaciones/${cotizacion_id}`)
    return { message: 'Notas actualizadas', success: true }
}

// ============================================
// APROBACIÓN CLIENTE ACTIONS
// ============================================

function generateToken(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

function generatePIN(): string {
    return Math.floor(1000 + Math.random() * 9000).toString()
}

export async function generateAprobacionToken(cotizacion_id: string) {
    const { adminClient, tenantId, user } = await getSupabaseContext()
    if (!adminClient || !tenantId || !user) return { message: 'No autorizado' }

    const token = generateToken()
    const pin = generatePIN()

    const { error } = await adminClient
        .from('cotizaciones')
        .update({
            token_aprobacion: token,
            pin_aprobacion: pin,
            fecha_envio: new Date().toISOString(),
            estado: 'ENVIADA'
        })
        .eq('id', cotizacion_id)
        .eq('tenant_id', tenantId)

    if (error) {
        console.error('Error generating token:', error)
        return { message: 'Error al generar token' }
    }

    safeRevalidatePath(`/cotizaciones/${cotizacion_id}`)
    return {
        message: 'Token generado',
        success: true,
        token,
        pin
    }
}

export async function getCotizacionByToken(token: string) {
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    )

    const { data, error } = await supabaseAdmin
        .from('cotizaciones')
        .select(`
            *,
            cliente:terceros!cotizaciones_cliente_id_fkey(id, razon_social, ruc),
            contacto:terceros_contactos(id, nombre_completo, email),
            detalles:cotizaciones_detalle(
                *,
                servicio:servicios(*)
            )
        `)
        .eq('token_aprobacion', token)
        .single()

    if (error) {
        console.error('Error fetching cotizacion by token:', error)
        return null
    }

    // Flatten tipo names onto each servicio
    if (data?.detalles) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(data as any).detalles = (data as any).detalles.map((d: any) => {
            if (!d.servicio) return d
            const s = d.servicio
            s.precio_1_tipo_nombre = s.tipo_p1?.nombre ?? null
            s.precio_2_tipo_nombre = s.tipo_p2?.nombre ?? null
            s.precio_3_tipo_nombre = s.tipo_p3?.nombre ?? null
            delete s.tipo_p1; delete s.tipo_p2; delete s.tipo_p3
            return d
        })
    }

    return data
}

export async function validatePIN(token: string, pin: string) {
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    )

    // Note: pin_attempts / pin_locked_until columns not yet in schema — basic validation only
    const { data } = await supabaseAdmin
        .from('cotizaciones')
        .select('id, pin_aprobacion')
        .eq('token_aprobacion', token)
        .single()

    if (!data) {
        return { valid: false, message: 'Enlace de aprobación inválido' }
    }

    if (data.pin_aprobacion !== pin) {
        return { valid: false, message: 'PIN incorrecto. Verifica el código que recibiste.' }
    }

    return { valid: true, cotizacion_id: data.id }
}

export async function aprobarServicio(
    cotizacion_id: string,
    detalle_id: string
) {
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    )

    const { error } = await supabaseAdmin
        .from('cotizaciones_detalle')
        .update({ estado_aprobacion: 'APROBADA' })
        .eq('id', detalle_id)
        .eq('cotizacion_id', cotizacion_id)

    if (error) {
        console.error('Error approving service:', error)
        return { message: 'Error al aprobar servicio' }
    }

    return { message: 'Servicio aprobado', success: true }
}

export async function rechazarServicio(
    cotizacion_id: string,
    detalle_id: string
) {
    // Uses service role so unauthenticated clients (approval page) can call this
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    )

    const { error } = await supabaseAdmin
        .from('cotizaciones_detalle')
        .update({ estado_aprobacion: 'RECHAZADA' })
        .eq('id', detalle_id)
        .eq('cotizacion_id', cotizacion_id)

    if (error) {
        console.error('Error rejecting service:', error)
        return { message: 'Error al rechazar servicio' }
    }

    return { message: 'Servicio rechazado', success: true }
}

// ... existing code ...

// ============================================
// EMAIL NOTIFICATIONS
// ============================================

import { sendEmail } from '@/lib/email'

export async function sendCotizacionEmail(cotizacion_id: string, email?: string) {
    const { adminClient, tenantId, user } = await getSupabaseContext()
    if (!adminClient || !tenantId || !user) return { message: 'No autorizado' }

    // 1. Get Cotizacion
    const cotizacion = await getCotizacionById(cotizacion_id)
    if (!cotizacion) return { message: 'Cotización no encontrada' }

    const targetEmail = email || cotizacion.contacto?.email || cotizacion.cliente?.email
    if (!targetEmail) return { message: 'No hay email destinatario definido' }

    // 2. Ensure Token Exists
    let token = cotizacion.token_aprobacion
    let pin = cotizacion.pin_aprobacion

    if (!token || !pin) {
        const genResult = await generateAprobacionToken(cotizacion_id)
        if (!genResult.success) return { message: 'Error generando token de acceso' }
        token = genResult.token
        pin = genResult.pin
    }

    // 3. Prepare Email Content
    const approvalUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://reportar.app'}/aprobacion/${token}`
    const appUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://reportar.app'

    // Fetch tenant info for logo
    const { data: tenantData } = await adminClient
        .from('companies')
        .select('nombre_comercial, razon_social, logo_url')
        .eq('id', tenantId)
        .single()

    const tenantNombre = tenantData?.nombre_comercial || tenantData?.razon_social || 'Proveedor'
    const tenantLogo = tenantData?.logo_url

    const monedaSimbolo = cotizacion.moneda === 'PEN' ? 'S/' : 'USD'
    const fechaEmision = new Date(cotizacion.fecha_emision).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })

    // Build services rows — show all catalog prices per service
    const serviciosRows = (cotizacion.detalles || []).map((d: any) => {
        const s = d.servicio
        const preciosHtml = [1, 2, 3].map(idx => {
            const nombre = s?.[`precio_${idx}_tipo_nombre`]
            const valor = s?.[`precio_${idx}_valor`]
            if (!valor) return ''
            return `<div style="margin-bottom:4px;"><span style="font-size:11px;color:#6b7280;text-transform:uppercase;">${nombre || `Precio ${idx}`}:</span> <strong>${monedaSimbolo} ${(valor as number).toFixed(2)}</strong></div>`
        }).join('')
        return `
        <tr>
            <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px;">${s?.nombre || 'Servicio'}</td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; text-align: center;">${d.cantidad}</td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; font-size: 13px;">${preciosHtml || `${monedaSimbolo} ${(d.precio_valor || 0).toFixed(2)}`}</td>
        </tr>`
    }).join('')

    const totalValor = (cotizacion.detalles || []).reduce((sum: number, d: any) => {
        const s = d.servicio
        const maxPrice = Math.max(s?.precio_1_valor || 0, s?.precio_2_valor || 0, s?.precio_3_valor || 0)
        return sum + (maxPrice * (d.cantidad || 1))
    }, 0)

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cotización ${cotizacion.numero}</title>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;800&display=swap" rel="stylesheet">
</head>
<body style="margin:0; padding:0; background-color:#f1f5f9; font-family: 'Segoe UI', Arial, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%;">

          <!-- HEADER -->
          <tr>
            <td style="background: linear-gradient(135deg, #111827 0%, #1f2937 100%); border-radius: 12px 12px 0 0; padding: 32px; text-align: center;">
              ${tenantLogo
                ? `<img src="${tenantLogo}" alt="${tenantNombre}" style="height: 52px; object-fit: contain; margin-bottom: 12px; display: block; margin-left: auto; margin-right: auto;" />`
                : `<div style="display: inline-block; background: #f97316; color: white; font-size: 18px; font-weight: normal; letter-spacing: 3px; padding: 10px 24px; border-radius: 8px; margin-bottom: 12px;">COTIZACIÓN</div>`
              }
              <p style="color: #9ca3af; font-size: 13px; margin: 0;">${(cotizacion as any).numero}</p>
            </td>
          </tr>

          <!-- ORANGE ACCENT BAR -->
          <tr>
            <td style="background: #f97316; height: 4px;"></td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="background: #ffffff; padding: 36px 32px;">

              <!-- Greeting -->
              <h1 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 700; color: #111827;">Nueva Cotización para Revisión</h1>
              <p style="margin: 0 0 24px 0; font-size: 15px; color: #6b7280;">
                Estimado/a <strong style="color: #111827;">${cotizacion.contacto?.nombre_completo || cotizacion.cliente?.razon_social}</strong>,<br/>
                adjuntamos la cotización <strong style="color: #f97316;">${cotizacion.numero}</strong> para su revisión y aprobación.
              </p>

              <!-- Info Grid -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 28px; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                <tr style="background: #f9fafb;">
                  <td style="padding: 10px 16px; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; width: 40%; border-bottom: 1px solid #e5e7eb;">Número</td>
                  <td style="padding: 10px 16px; font-size: 14px; color: #111827; font-weight: 600; border-bottom: 1px solid #e5e7eb;">${cotizacion.numero}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 16px; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; border-bottom: 1px solid #e5e7eb;">Fecha</td>
                  <td style="padding: 10px 16px; font-size: 14px; color: #111827; border-bottom: 1px solid #e5e7eb;">${fechaEmision}</td>
                </tr>
                <tr style="background: #f9fafb;">
                  <td style="padding: 10px 16px; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; border-bottom: 1px solid #e5e7eb;">Moneda</td>
                  <td style="padding: 10px 16px; font-size: 14px; color: #111827; border-bottom: 1px solid #e5e7eb;">${cotizacion.moneda === 'PEN' ? 'Soles (S/)' : 'Dólares (USD)'}</td>
                </tr>
                ${cotizacion.forma_pago ? `<tr>
                  <td style="padding: 10px 16px; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; border-bottom: 1px solid #e5e7eb;">Forma de Pago</td>
                  <td style="padding: 10px 16px; font-size: 14px; color: #111827; border-bottom: 1px solid #e5e7eb;">${cotizacion.forma_pago}</td>
                </tr>` : ''}
                ${cotizacion.plazo_pago ? `<tr style="background: #f9fafb;">
                  <td style="padding: 10px 16px; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Plazo de Pago</td>
                  <td style="padding: 10px 16px; font-size: 14px; color: #111827;">${cotizacion.plazo_pago}</td>
                </tr>` : ''}
              </table>

              <!-- Services Table -->
              <h3 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 700; color: #111827; text-transform: uppercase; letter-spacing: 0.05em;">Servicios Cotizados</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; margin-bottom: 28px;">
                <thead>
                  <tr style="background: #111827;">
                    <th style="padding: 10px 12px; text-align: left; font-size: 12px; color: #d1d5db; font-weight: 600; text-transform: uppercase;">Servicio</th>
                    <th style="padding: 10px 12px; text-align: center; font-size: 12px; color: #d1d5db; font-weight: 600; text-transform: uppercase;">Cant.</th>
                    <th style="padding: 10px 12px; text-align: left; font-size: 12px; color: #d1d5db; font-weight: 600; text-transform: uppercase;">Precios del Catálogo</th>
                  </tr>
                </thead>
                <tbody>
                  ${serviciosRows}
                </tbody>
                <tfoot>
                  <tr style="background: #f9fafb;">
                    <td colspan="2" style="padding: 12px; text-align: right; font-size: 14px; font-weight: 700; color: #111827;">Total Referencial:</td>
                    <td style="padding: 12px; text-align: right; font-size: 16px; font-weight: 800; color: #f97316;">${monedaSimbolo} ${totalValor.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="${approvalUrl}" style="display: inline-block; background: #f97316; color: #ffffff; font-size: 16px; font-weight: 700; padding: 16px 40px; border-radius: 8px; text-decoration: none; letter-spacing: 0.02em;">
                  Revisar y Aprobar Cotización →
                </a>
              </div>

              <!-- PIN Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #fafafa; border: 2px dashed #e5e7eb; border-radius: 8px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px; text-align: center;">
                    <p style="margin: 0 0 8px 0; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600;">PIN DE ACCESO SEGURO</p>
                    <p style="margin: 0; font-size: 36px; font-weight: 800; color: #111827; letter-spacing: 0.3em; font-family: monospace;">${pin}</p>
                    <p style="margin: 8px 0 0 0; font-size: 12px; color: #9ca3af;">Ingresa este PIN al acceder al enlace de cotización</p>
                  </td>
                </tr>
              </table>

              <p style="font-size: 13px; color: #9ca3af; text-align: center; margin: 0;">
                Si tienes problemas con el enlace, cópialo y pégalo en tu navegador:<br/>
                <span style="color: #6b7280; font-size: 11px; word-break: break-all;">${approvalUrl}</span>
              </p>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background: #111827; border-radius: 0 0 12px 12px; padding: 20px 32px; text-align: center;">
              <a href="https://reportar.app" style="display: inline-block; font-family: 'Montserrat', sans-serif; color: #9ca3af; font-size: 13px; font-weight: 600; letter-spacing: 0.1em; text-decoration: none; margin-bottom: 8px;">REPORTAR.APP</a>
              <p style="margin: 0; color: #6b7280; font-size: 11px;">Este correo fue generado automáticamente. Por favor no respondas a este mensaje.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

    // 4. Send Email
    const emailResult = await sendEmail({
        to: targetEmail,
        subject: `Cotización ${cotizacion.numero} — ${tenantNombre}`,
        html
    })

    if (!emailResult.success) {
        console.error('[sendCotizacionEmail] Resend error:', emailResult.error)
        return { message: `Error al enviar el correo: ${emailResult.error || 'Error desconocido'}`, success: false }
    }

    // 5. Update Status
    await adminClient.from('cotizaciones').update({ estado: 'ENVIADA', fecha_envio: new Date().toISOString() }).eq('id', cotizacion_id)

    safeRevalidatePath(`/cotizaciones/${cotizacion_id}`)
    return { message: 'Correo enviado correctamente', success: true }
}


export async function finalizarAprobacion(
    cotizacion_id: string,
    comentarios_cliente?: string,
    token?: string // when called from public client approval page (no session)
) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let db: any
    let tenantId: string

    if (token) {
        // Public call: validate token matches cotizacion_id, then use service role
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { auth: { persistSession: false } }
        )
        const { data: cotCheck } = await supabaseAdmin
            .from('cotizaciones')
            .select('id, tenant_id')
            .eq('id', cotizacion_id)
            .eq('token_aprobacion', token)
            .single()
        if (!cotCheck) return { message: 'Token inválido' }
        db = supabaseAdmin
        tenantId = cotCheck.tenant_id
    } else {
        const ctx = await getSupabaseContext()
        if (!ctx.adminClient || !ctx.tenantId) return { message: 'No autorizado' }
        db = ctx.adminClient
        tenantId = ctx.tenantId
    }

    // Get all detalles to check if all are approved
    const { data: detalles } = await db
        .from('cotizaciones_detalle')
        .select('estado_aprobacion')
        .eq('cotizacion_id', cotizacion_id)
        .eq('tenant_id', tenantId)

    const allApproved = detalles?.every((d: { estado_aprobacion: string | null }) => d.estado_aprobacion === 'APROBADA')
    const anyRejected = detalles?.some((d: { estado_aprobacion: string | null }) => d.estado_aprobacion === 'RECHAZADA')
    const hasComments = comentarios_cliente && comentarios_cliente.trim().length > 0

    let newEstado: CotizacionEstado = 'ENVIADA'
    let taskTitle = ''
    let taskDesc = ''

    // Logic: Only Approve if CLEAN (All approved + No comments)
    if (allApproved && !hasComments) {
        newEstado = 'APROBADA'
        taskTitle = `Atención de Cotización Aprobada`
        taskDesc = `El cliente ha aprobado la cotización satisfactoriamente. Proceder con la atención.`
    } else {
        // Negotiation Loop
        // Keep status as ENVIADA (or effectively "Under Negotiation")
        // But create URGENT task
        newEstado = 'ENVIADA'
        taskTitle = `⚠️ EXCEPCIÓN: Cliente con Observaciones`
        taskDesc = `El cliente ha respondido con observaciones o rechazos parciales. REVISAR INMEDIATAMENTE.\n\nComentarios: ${comentarios_cliente || 'Ninguno'}\nRechazados: ${anyRejected ? 'Sí' : 'No'}`
    }

    // Get full cotizacion for metadata
    const { data: cotizacion } = await db
        .from('cotizaciones')
        .select('*')
        .eq('id', cotizacion_id)
        .single()

    if (!cotizacion) return { message: 'Cotización no encontrada' }

    // Update Cotizacion
    const { error } = await db
        .from('cotizaciones')
        .update({
            estado: newEstado,
            comentarios_cliente,
            fecha_aprobacion: new Date().toISOString()
        })
        .eq('id', cotizacion_id)

    if (error) {
        console.error('Error finalizing approval:', error)
        return { message: 'Error al finalizar aprobación' }
    }

    // Genera código T-YYYY-XXXX consecutivo por tenant + año (misma lógica que
    // `createTarea`). Si el insert falla, igual devolvemos success porque la
    // aprobación de la cotización se completó — el admin puede crear la tarea
    // manualmente desde planificación.
    const year = new Date().getFullYear()
    const { count: countTareas } = await db
        .from('tareas')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', cotizacion.tenant_id)
        .gte('created_at', `${year}-01-01`)
    const codigoTarea = `T-${year}-${String((countTareas || 0) + 1).padStart(4, '0')}`

    let tareaIdCreated: string | null = null
    let tareaCodigoCreated: string | null = null
    const { data: newTarea, error: taskError } = await db
        .from('tareas')
        .insert({
            tenant_id: cotizacion.tenant_id,
            codigo: codigoTarea,
            titulo: `${taskTitle} ${cotizacion.numero ?? ''}`.trim(),
            descripcion: taskDesc,
            // La tarea nace en BORRADOR — el operador fija fechas/recursos y la
            // confirma desde planificación. No usamos 'PENDIENTE' (no existe en
            // el enum de `tareas.estado`).
            estado: 'BORRADOR',
            prioridad: 'ALTA',
            cliente_id: cotizacion.cliente_id,
            cotizacion_id: cotizacion.id,
            created_by: cotizacion.created_by,
        })
        .select('id, codigo')
        .single()

    if (taskError) {
        console.error('Error creating task:', taskError)
    } else if (newTarea) {
        tareaIdCreated = newTarea.id
        tareaCodigoCreated = newTarea.codigo
        // Guarda el link inverso en la cotización para que el Paso 5 pueda
        // mostrar T-XXXX y enlazar directo a la tarea.
        await db
            .from('cotizaciones')
            .update({ tarea_id: newTarea.id })
            .eq('id', cotizacion_id)
    }

    safeRevalidatePath(`/cotizaciones/${cotizacion_id}`)

    return {
        message: 'Aprobación finalizada',
        success: true,
        estado: newEstado,
        tarea_id: tareaIdCreated,
        tarea_codigo: tareaCodigoCreated,
    }
}

/**
 * Trae el {id, codigo, titulo} de la tarea generada al aprobar una cotización.
 * No hay FK desde `cotizaciones.tarea_id`, así que leemos por id directo.
 * Si no hay tarea (no aprobada aún o creación falló), devuelve null.
 */
export async function getCotizacionTareaInfo(cotizacion_id: string) {
    const { adminClient, tenantId } = await getSupabaseContext()
    if (!adminClient || !tenantId) return null

    const { data: cot } = await adminClient
        .from('cotizaciones')
        .select('tarea_id')
        .eq('id', cotizacion_id)
        .eq('tenant_id', tenantId)
        .maybeSingle()

    if (!cot?.tarea_id) return null

    const { data: tarea } = await adminClient
        .from('tareas')
        .select('id, codigo, titulo, estado')
        .eq('id', cot.tarea_id)
        .eq('tenant_id', tenantId)
        .maybeSingle()

    return tarea ?? null
}

// ============================================
// HISTORICAL DATA ACTIONS
// ============================================

export async function getHistoricalClientQuotes(
    servicio_id: string,
    page = 1,
    limit = 10,
    cliente_id?: string | null,
) {
    const { adminClient, tenantId } = await getSupabaseContext()
    if (!adminClient || !tenantId) return { data: [], total: 0 }

    const from = (page - 1) * limit
    const to = from + limit - 1

    // Embed condicional al cliente actual: cuando `cliente_id` viene, el
    // `!inner` + `cliente.id.eq` filtra a precios cotizados al mismo cliente.
    // Sin cliente (cotización nueva sin cliente fijo) se trae histórico general.
    const embedCliente = cliente_id
        ? `cliente:terceros!cotizaciones_cliente_id_fkey!inner(razon_social)`
        : `cliente:terceros!cotizaciones_cliente_id_fkey(razon_social)`

    let query = adminClient
        .from('cotizaciones_detalle')
        .select(`
            precio_valor,
            precio_tipo,
            cotizacion:cotizaciones!inner(
                id,
                codigo,
                cliente_id,
                fecha_emision,
                moneda,
                ${embedCliente}
            )
        `, { count: 'exact' })
        .eq('servicio_id', servicio_id)
        .eq('tenant_id', tenantId)
        .not('precio_valor', 'is', null)
        .order('created_at', { ascending: false })
        .range(from, to)

    if (cliente_id) {
        query = query.eq('cotizacion.cliente_id', cliente_id)
    }

    const { data, error, count } = await query

    if (error) {
        console.error('Error fetching historical quotes:', error)
        return { data: [], total: 0 }
    }

    // Cast data because Supabase joins might be inferred as arrays
    const formattedData = (data as any[]).map(item => {
        const cotizacion = Array.isArray(item.cotizacion) ? item.cotizacion[0] : item.cotizacion
        if (cotizacion && Array.isArray(cotizacion.cliente)) {
            cotizacion.cliente = cotizacion.cliente[0] || null
        }
        return {
            ...item,
            moneda: cotizacion?.moneda ?? 'USD',
            cotizacion
        }
    }) as HistoricalClientQuote[]

    return { data: formattedData, total: count || 0 }
}

export async function getHistoricalSupplierOffers(servicio_id: string, page = 1, limit = 10) {
    const { adminClient, tenantId } = await getSupabaseContext()
    if (!adminClient || !tenantId) return { data: [], total: 0 }

    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await adminClient
        .from('cotizaciones_ofertas_proveedores')
        .select(`
            *
        `, { count: 'exact' })
        .eq('servicio_id', servicio_id)
        .eq('tenant_id', tenantId)
        .order('fecha_oferta', { ascending: false })
        .range(from, to)

    if (error) {
        console.error('Error fetching historical offers:', error)
        return { data: [], total: 0 }
    }

    return { data: data as HistoricalSupplierOffer[], total: count || 0 }
}

export async function getServiciosByCotizacionId(cotizacionId: string) {
    const { adminClient, tenantId } = await getSupabaseContext()
    if (!adminClient || !tenantId) return []
    const { data, error } = await adminClient
        .from('cotizaciones_detalle')
        .select('id, servicio:servicios(id, nombre, codigo)')
        .eq('cotizacion_id', cotizacionId)
        .eq('tenant_id', tenantId)
        .not('servicio_id', 'is', null)
    if (error) return []
    type S = { id: string; nombre: string | null; codigo: string }
    type Row = { id: string; servicio: S | null }
    // Puede haber múltiples líneas del mismo servicio — conservamos la primera por servicio
    const seen = new Set<string>()
    const result: { id: string; nombre: string | null; codigo: string; detalle_id: string }[] = []
    for (const row of (data || []) as unknown as Row[]) {
        const s = row.servicio
        if (s && s.id && !seen.has(s.id)) {
            seen.add(s.id)
            result.push({ ...s, detalle_id: row.id })
        }
    }
    return result.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || '', 'es'))
}

export async function getAllServicios() {
    const { adminClient, tenantId } = await getSupabaseContext()
    if (!adminClient || !tenantId) return []
    const { data, error } = await adminClient
        .from('servicios')
        .select('id, nombre, codigo')
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .order('nombre', { ascending: true })
    if (error) return []
    return data as { id: string; nombre: string | null; codigo: string }[]
}

/**
 * Fetches full cotización + tenant info by token — no auth required (service role).
 * Used by the public client approval pages (/aprobacion/[token]/preview).
 */
export async function getCotizacionWithTenantByToken(token: string) {
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    )

    const { data, error } = await supabaseAdmin
        .from('cotizaciones')
        .select(`
            *,
            cliente:terceros!cotizaciones_cliente_id_fkey(id, razon_social, ruc, logo_url),
            contacto:terceros_contactos(id, nombre_completo, email, cargo),
            sitio:terceros_sitios(id, nombre, direccion),
            detalles:cotizaciones_detalle(
                *,
                servicio:servicios(*)
            )
        `)
        .eq('token_aprobacion', token)
        .single()

    if (error || !data) return null

    // Flatten tipo names onto each servicio
    if ((data as any).detalles) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(data as any).detalles = (data as any).detalles.map((d: any) => {
            if (!d.servicio) return d
            const s = d.servicio
            s.precio_1_tipo_nombre = s.tipo_p1?.nombre ?? null
            s.precio_2_tipo_nombre = s.tipo_p2?.nombre ?? null
            s.precio_3_tipo_nombre = s.tipo_p3?.nombre ?? null
            delete s.tipo_p1; delete s.tipo_p2; delete s.tipo_p3
            return d
        })
    }

    // Fetch tenant branding (companies table — same as email)
    const { data: tenantInfo } = await supabaseAdmin
        .from('companies')
        .select('nombre_comercial, razon_social, logo_url')
        .eq('id', data.tenant_id)
        .single()

    return { cotizacion: data, tenantInfo: tenantInfo || null }
}

// ============================================
// PASO 6 — RESPUESTA DEL CLIENTE
// ============================================

/**
 * Devuelve los detalles de una cotización con estado_aprobacion, precio_negociado
 * y tarea vinculada por detalle (para el paso 6).
 */
export async function getCotizacionRespuesta(cotizacion_id: string) {
    const { adminClient, tenantId } = await getSupabaseContext()
    if (!adminClient || !tenantId) return null

    const { data: cot } = await adminClient
        .from('cotizaciones')
        .select(`
            id, numero, estado, comentarios_cliente, observaciones_cliente,
            fecha_aprobacion, aprobado_por, moneda,
            cliente:terceros!cotizaciones_cliente_id_fkey(id, razon_social),
            contacto:terceros_contactos(id, nombre_completo),
            sitio:terceros_sitios(id, nombre),
            detalles:cotizaciones_detalle(
                id, orden, cantidad, precio_tipo, precio_valor,
                precio_negociado, estado_aprobacion, tarea_id,
                servicio:servicios(
                    id, nombre, cantidad_precios,
                    precio_1_tipo, precio_1_valor,
                    precio_2_tipo, precio_2_valor,
                    precio_3_tipo, precio_3_valor,
                    tipo_p1:servicios_tipo_precios!precio_1_tipo(nombre),
                    tipo_p2:servicios_tipo_precios!precio_2_tipo(nombre),
                    tipo_p3:servicios_tipo_precios!precio_3_tipo(nombre)
                )
            )
        `)
        .eq('id', cotizacion_id)
        .eq('tenant_id', tenantId)
        .single()

    if (!cot) return null

    // precio_tipo ya se guarda como nombre (snapshot inmutable) — enriquecer con tarea y aplanar tipo nombres
    const detallesConTarea = await Promise.all(
        ((cot as any).detalles ?? []).map(async (d: any) => {
            // Flatten tipo names
            if (d.servicio) {
                d.servicio.precio_1_tipo_nombre = d.servicio.tipo_p1?.nombre ?? null
                d.servicio.precio_2_tipo_nombre = d.servicio.tipo_p2?.nombre ?? null
                d.servicio.precio_3_tipo_nombre = d.servicio.tipo_p3?.nombre ?? null
                delete d.servicio.tipo_p1; delete d.servicio.tipo_p2; delete d.servicio.tipo_p3
            }
            if (!d.tarea_id) return { ...d, tarea: null }
            const { data: tarea } = await adminClient
                .from('tareas')
                .select('id, codigo, titulo, estado')
                .eq('id', d.tarea_id)
                .eq('tenant_id', tenantId)
                .maybeSingle()
            return { ...d, tarea: tarea ?? null }
        })
    )

    return { ...cot, detalles: detallesConTarea }
}

/**
 * Crea una tarea por cada detalle con estado_aprobacion = 'APROBADA' que no
 * tenga tarea_id ya asignado. Hereda cliente, sitio, contacto y cotizacion de
 * la cotización padre.
 */
export async function crearTareasAprobadas(cotizacion_id: string): Promise<ActionResponse & {
    creadas?: { detalle_id: string; tarea_id: string; codigo: string }[]
}> {
    const { adminClient, tenantId } = await getSupabaseContext()
    if (!adminClient || !tenantId) return { message: 'No autorizado' }

    const { data: cot } = await adminClient
        .from('cotizaciones')
        .select(`
            id, numero, tenant_id, cliente_id, sitio_id, contacto_id, created_by,
            fecha_inicio_estimada,
            detalles:cotizaciones_detalle(
                id, estado_aprobacion, tarea_id, precio_negociado,
                servicio:servicios(nombre)
            )
        `)
        .eq('id', cotizacion_id)
        .eq('tenant_id', tenantId)
        .single()

    if (!cot) return { message: 'Cotización no encontrada' }

    const aprobados = ((cot as any).detalles ?? []).filter(
        (d: any) => d.estado_aprobacion === 'APROBADA' && !d.tarea_id
    )

    if (aprobados.length === 0) return { message: 'Sin ítems aprobados pendientes de tarea', success: true, creadas: [] }

    const year = new Date().getFullYear()
    const { count: countBase } = await adminClient
        .from('tareas')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .gte('created_at', `${year}-01-01`)

    const creadas: { detalle_id: string; tarea_id: string; codigo: string }[] = []
    let counter = (countBase ?? 0) + 1

    for (const det of aprobados) {
        const codigo = `T-${year}-${String(counter).padStart(4, '0')}`
        const servNombre = det.servicio?.nombre ?? 'Servicio'
        const titulo = `${servNombre} · ${(cot as any).numero ?? cotizacion_id}`

        const fechaInicio = (cot as any).fecha_inicio_estimada
        const descripcion = fechaInicio
            ? `Inicio estimado: ${new Date(fechaInicio).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })}`
            : null

        const { data: tarea, error } = await adminClient
            .from('tareas')
            .insert({
                tenant_id: tenantId,
                codigo,
                titulo,
                estado: 'CONFIRMADA',
                prioridad: 'ALTA',
                tipo_tarea: 'OPERACIONES',
                servicio_ref: servNombre,
                descripcion,
                cliente_id: (cot as any).cliente_id ?? null,
                sitio_id: (cot as any).sitio_id ?? null,
                contacto_id: (cot as any).contacto_id ?? null,
                cotizacion_id: cot.id,
                cotizacion_item_id: det.id,
                created_by: (cot as any).created_by ?? null,
            })
            .select('id, codigo')
            .single()

        if (error || !tarea) {
            console.error('Error creando tarea para detalle', det.id, error)
            continue
        }

        await adminClient
            .from('cotizaciones_detalle')
            .update({ tarea_id: tarea.id })
            .eq('id', det.id)
            .eq('tenant_id', tenantId)

        creadas.push({ detalle_id: det.id, tarea_id: tarea.id, codigo: tarea.codigo })
        counter++
    }

    // Actualizar estado de la cotización y fecha_aprobacion según resultado
    const todosDetalles = (cot as any).detalles ?? []
    const algunoAprobado = todosDetalles.some((d: any) => d.estado_aprobacion === 'APROBADA')
    const todosRechazados = todosDetalles.length > 0 &&
        todosDetalles.every((d: any) => d.estado_aprobacion === 'RECHAZADA')

    const nuevoEstado = todosRechazados ? 'RECHAZADA' : algunoAprobado ? 'APROBADA' : null
    if (nuevoEstado) {
        await adminClient
            .from('cotizaciones')
            .update({ estado: nuevoEstado, fecha_aprobacion: new Date().toISOString() })
            .eq('id', cotizacion_id)
            .eq('tenant_id', tenantId)
    }

    safeRevalidatePath(`/cotizaciones/${cotizacion_id}`)

    return {
        message: `${creadas.length} tarea(s) creada(s)`,
        success: true,
        creadas,
    }
}

