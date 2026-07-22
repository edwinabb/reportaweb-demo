'use server'

import { getSupabaseContext, safeRevalidatePath } from '@/lib/action-context'
import { renderPdfFromHtml } from '@/lib/pdf-generator'
import { renderEppEntregaHtml } from '@/lib/epp-pdf-template'
import { getStorageUrl } from '@/lib/utils/storage'

const EPP_BUCKET = 'epp-entregas'

// ─────────────────────────────────────────────────────────────
// CATÁLOGO (sst_epp_config)
// ─────────────────────────────────────────────────────────────

export async function getCatalogoEpp(opts?: { onlyActive?: boolean }) {
    const { adminClient, tenantId } = await getSupabaseContext()
    if (!adminClient || !tenantId) return []

    let query = adminClient
        .from('sst_epp_config')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('epp_nombre', { ascending: true })

    if (opts?.onlyActive) query = query.eq('is_active', true)

    const { data, error } = await query
    if (error) {
        console.error('[getCatalogoEpp] error:', error)
        return []
    }
    return data || []
}

export async function createCatalogoEpp(data: {
    epp_nombre: string
    tipo: 'EPP' | 'EE'
    dias_renovacion: number
    nivel_riesgo?: string | null
}) {
    const { adminClient, tenantId } = await getSupabaseContext()
    if (!adminClient || !tenantId) return { success: false, message: 'No autorizado' }

    const { data: row, error } = await adminClient
        .from('sst_epp_config')
        .insert({
            tenant_id: tenantId,
            epp_nombre: data.epp_nombre,
            tipo: data.tipo,
            dias_renovacion: data.dias_renovacion,
            nivel_riesgo: data.nivel_riesgo ?? null,
            is_active: true,
        })
        .select('id')
        .single()

    if (error) return { success: false, message: error.message }
    safeRevalidatePath('/epp/catalogo')
    return { success: true, message: 'EPP agregado al catálogo', id: row.id }
}

export async function updateCatalogoEpp(id: string, data: {
    epp_nombre?: string
    tipo?: 'EPP' | 'EE'
    dias_renovacion?: number
    nivel_riesgo?: string | null
}) {
    const { adminClient, tenantId } = await getSupabaseContext()
    if (!adminClient || !tenantId) return { success: false, message: 'No autorizado' }

    const { error } = await adminClient
        .from('sst_epp_config')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('tenant_id', tenantId)

    if (error) return { success: false, message: error.message }
    safeRevalidatePath('/epp/catalogo')
    return { success: true, message: 'EPP actualizado' }
}

export async function toggleCatalogoEppActive(id: string, is_active: boolean) {
    const { adminClient, tenantId } = await getSupabaseContext()
    if (!adminClient || !tenantId) return { success: false, message: 'No autorizado' }

    const { error } = await adminClient
        .from('sst_epp_config')
        .update({ is_active, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('tenant_id', tenantId)

    if (error) return { success: false, message: error.message }
    safeRevalidatePath('/epp/catalogo')
    return { success: true, message: is_active ? 'EPP activado' : 'EPP desactivado' }
}

// ─────────────────────────────────────────────────────────────
// COLABORADORES (helper)
// Devuelve profiles del tenant con su cargo (desde profile_details/job_titles)
// ─────────────────────────────────────────────────────────────

export async function getColaboradoresEpp() {
    const { adminClient, tenantId } = await getSupabaseContext()
    if (!adminClient || !tenantId) return []

    const { data, error } = await adminClient
        .from('profiles')
        .select(`
            id, first_name, last_name, email, doc_number, is_active,
            details:profile_details(
                job_title_id,
                job_title:job_titles(name)
            )
        `)
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .order('first_name', { ascending: true })

    if (error) {
        console.error('[getColaboradoresEpp] error:', error)
        return []
    }

    return (data || []).map((p: any) => ({
        id: p.id,
        first_name: p.first_name,
        last_name: p.last_name,
        email: p.email,
        dni: p.doc_number,
        cargo: p.details?.[0]?.job_title?.name ?? null,
    }))
}

// ─────────────────────────────────────────────────────────────
// ENTREGA — crea entrega + items + movimientos (best-effort transactional)
// ─────────────────────────────────────────────────────────────

type ItemEntregaInput = {
    catalogo_id: string
    cantidad: number
    fecha_vencimiento: string // ISO yyyy-mm-dd
}

export async function createEntregaEpp(input: {
    colaborador_id: string
    responsable_sst_id?: string | null
    fecha_entrega: string // ISO yyyy-mm-dd
    observaciones?: string | null
    items: ItemEntregaInput[]
}) {
    const { adminClient, tenantId, user } = await getSupabaseContext()
    if (!adminClient || !tenantId || !user) return { success: false as const, message: 'No autorizado' }

    if (!input.items.length) return { success: false as const, message: 'Debe incluir al menos un item' }

    // 1) Insert entrega header
    const { data: entrega, error: errEntrega } = await adminClient
        .from('sst_epp_entrega')
        .insert({
            tenant_id: tenantId,
            colaborador_id: input.colaborador_id,
            responsable_sst_id: input.responsable_sst_id ?? user.id,
            fecha_entrega: input.fecha_entrega,
            estado: 'ACTIVO',
            observaciones: input.observaciones ?? null,
            created_by: user.id,
        })
        .select('id')
        .single()

    if (errEntrega || !entrega) {
        return { success: false as const, message: errEntrega?.message || 'Error creando entrega' }
    }

    // 2) Insert items
    const itemsPayload = input.items.map((it) => ({
        tenant_id: tenantId,
        entrega_id: entrega.id,
        catalogo_id: it.catalogo_id,
        cantidad: it.cantidad,
        fecha_vencimiento: it.fecha_vencimiento,
        estado_vigencia: 'VIGENTE',
        created_by: user.id,
    }))

    const { data: items, error: errItems } = await adminClient
        .from('sst_epp_item')
        .insert(itemsPayload)
        .select('id, catalogo_id, cantidad')

    if (errItems || !items) {
        await adminClient.from('sst_epp_entrega').delete().eq('id', entrega.id)
        return { success: false as const, message: errItems?.message || 'Error creando items' }
    }

    // 3) Insert movimientos ENTREGA
    const movimientosPayload = items.map((it) => ({
        tenant_id: tenantId,
        colaborador_id: input.colaborador_id,
        catalogo_id: it.catalogo_id,
        item_id: it.id,
        tipo: 'ENTREGA',
        fecha: input.fecha_entrega,
        cantidad: it.cantidad,
        created_by: user.id,
    }))

    const { error: errMov } = await adminClient.from('sst_epp_movimiento').insert(movimientosPayload)

    if (errMov) {
        await adminClient.from('sst_epp_item').delete().eq('entrega_id', entrega.id)
        await adminClient.from('sst_epp_entrega').delete().eq('id', entrega.id)
        return { success: false as const, message: errMov.message }
    }

    // 4) Generar PDF (best-effort — si falla, la entrega queda sin PDF y se puede regenerar después)
    let pdfWarning: string | null = null
    try {
        const pdfRes = await generateEppEntregaPdf(entrega.id)
        if (!pdfRes.success) pdfWarning = pdfRes.message
    } catch (e: any) {
        pdfWarning = e?.message || 'Error generando PDF'
    }

    safeRevalidatePath('/epp')
    safeRevalidatePath(`/epp/colaborador/${input.colaborador_id}`)
    return {
        success: true as const,
        message: pdfWarning ? `Entrega registrada (PDF falló: ${pdfWarning})` : 'Entrega registrada',
        entrega_id: entrega.id,
    }
}

// ─────────────────────────────────────────────────────────────
// PDF — genera GP-SST-FR vía Gotenberg + sube a bucket epp-entregas
// ─────────────────────────────────────────────────────────────

export async function generateEppEntregaPdf(entregaId: string) {
    const { adminClient, tenantId } = await getSupabaseContext()
    if (!adminClient || !tenantId) return { success: false as const, message: 'No autorizado' }

    // Fetch entrega + items + colaborador + responsable + cargo + company
    const { data: entrega, error } = await adminClient
        .from('sst_epp_entrega')
        .select(`
            id, fecha_entrega, observaciones, colaborador_id, responsable_sst_id,
            colaborador:profiles!sst_epp_entrega_colaborador_id_fkey(
                first_name, last_name, doc_number,
                details:profile_details(job_title:job_titles(name))
            ),
            responsable:profiles!sst_epp_entrega_responsable_sst_id_fkey(first_name, last_name),
            items:sst_epp_item(
                cantidad, fecha_vencimiento,
                catalogo:sst_epp_config(epp_nombre, tipo)
            )
        `)
        .eq('id', entregaId)
        .eq('tenant_id', tenantId)
        .maybeSingle()

    if (error || !entrega) return { success: false as const, message: error?.message || 'Entrega no encontrada' }

    const { data: company } = await adminClient
        .from('companies')
        .select('name, razon_social, ruc, direccion, telefono, logo_url')
        .eq('id', tenantId)
        .maybeSingle()

    if (!company) return { success: false as const, message: 'Datos de empresa no encontrados' }

    const colab: any = entrega.colaborador
    const cargo = colab?.details?.[0]?.job_title?.name ?? null
    const logoPublicUrl = company.logo_url ? getStorageUrl(company.logo_url, 'logos') : null

    const html = renderEppEntregaHtml({
        entrega: { id: entrega.id, fecha_entrega: entrega.fecha_entrega, observaciones: entrega.observaciones },
        colaborador: { first_name: colab?.first_name, last_name: colab?.last_name, doc_number: colab?.doc_number },
        cargo,
        responsable: entrega.responsable as any,
        items: (entrega.items as any[]) || [],
        company: company as any,
        logoPublicUrl,
    })

    let pdfBytes: ArrayBuffer
    try {
        pdfBytes = await renderPdfFromHtml(html)
    } catch (e: any) {
        return { success: false as const, message: `Gotenberg: ${e?.message || 'error'}` }
    }

    // Upload to bucket
    const path = `${tenantId}/${entregaId}.pdf`
    const { error: uploadErr } = await adminClient
        .storage
        .from(EPP_BUCKET)
        .upload(path, new Uint8Array(pdfBytes), {
            contentType: 'application/pdf',
            upsert: true,
        })

    if (uploadErr) return { success: false as const, message: `Upload: ${uploadErr.message}` }

    // Signed URL (bucket es privado)
    const { data: signed, error: signErr } = await adminClient
        .storage
        .from(EPP_BUCKET)
        .createSignedUrl(path, 60 * 60 * 24 * 30) // 30 días

    const pdfUrl = signed?.signedUrl ?? null
    if (signErr) console.error('[generateEppEntregaPdf] signed url error:', signErr)

    await adminClient
        .from('sst_epp_entrega')
        .update({ pdf_url: pdfUrl, updated_at: new Date().toISOString() })
        .eq('id', entregaId)

    safeRevalidatePath('/epp')
    return { success: true as const, message: 'PDF generado', pdf_url: pdfUrl, path }
}

export async function getEntregaById(id: string) {
    const { adminClient, tenantId } = await getSupabaseContext()
    if (!adminClient || !tenantId) return null

    const { data, error } = await adminClient
        .from('sst_epp_entrega')
        .select(`
            *,
            colaborador:profiles!sst_epp_entrega_colaborador_id_fkey(id, first_name, last_name, doc_number),
            responsable:profiles!sst_epp_entrega_responsable_sst_id_fkey(id, first_name, last_name),
            items:sst_epp_item(
                *,
                catalogo:sst_epp_config(id, epp_nombre, tipo)
            )
        `)
        .eq('id', id)
        .eq('tenant_id', tenantId)
        .maybeSingle()

    if (error) {
        console.error('[getEntregaById] error:', error)
        return null
    }
    return data
}

export async function listEntregas(opts?: { limit?: number }) {
    const { adminClient, tenantId } = await getSupabaseContext()
    if (!adminClient || !tenantId) return []

    const { data, error } = await adminClient
        .from('sst_epp_entrega')
        .select(`
            id, fecha_entrega, estado, pdf_url, created_at,
            colaborador:profiles!sst_epp_entrega_colaborador_id_fkey(id, first_name, last_name),
            items_count:sst_epp_item(count)
        `)
        .eq('tenant_id', tenantId)
        .order('fecha_entrega', { ascending: false })
        .limit(opts?.limit ?? 100)

    if (error) {
        console.error('[listEntregas] error:', error)
        return []
    }
    return data || []
}

// ─────────────────────────────────────────────────────────────
// STOCK por colaborador
// ─────────────────────────────────────────────────────────────

export async function getStockColaborador(colaboradorId: string) {
    const { adminClient, tenantId } = await getSupabaseContext()
    if (!adminClient || !tenantId) return []

    const { data, error } = await adminClient
        .from('sst_epp_item')
        .select(`
            *,
            catalogo:sst_epp_config(id, epp_nombre, tipo, dias_renovacion),
            entrega:sst_epp_entrega!inner(id, fecha_entrega, colaborador_id)
        `)
        .eq('tenant_id', tenantId)
        .eq('entrega.colaborador_id', colaboradorId)
        .in('estado_vigencia', ['VIGENTE', 'PRONTO'])
        .order('fecha_vencimiento', { ascending: true })

    if (error) {
        console.error('[getStockColaborador] error:', error)
        return []
    }
    return data || []
}

export async function getMovimientosColaborador(colaboradorId: string, opts?: { limit?: number }) {
    const { adminClient, tenantId } = await getSupabaseContext()
    if (!adminClient || !tenantId) return []

    const { data, error } = await adminClient
        .from('sst_epp_movimiento')
        .select(`
            *,
            catalogo:sst_epp_config(id, epp_nombre)
        `)
        .eq('tenant_id', tenantId)
        .eq('colaborador_id', colaboradorId)
        .order('fecha', { ascending: false })
        .limit(opts?.limit ?? 50)

    if (error) {
        console.error('[getMovimientosColaborador] error:', error)
        return []
    }
    return data || []
}

// ─────────────────────────────────────────────────────────────
// DEVOLUCIÓN / REEMPLAZO
// ─────────────────────────────────────────────────────────────

export async function createDevolucionEpp(input: {
    item_id: string
    fecha: string
    observacion?: string | null
}) {
    const { adminClient, tenantId, user } = await getSupabaseContext()
    if (!adminClient || !tenantId || !user) return { success: false, message: 'No autorizado' }

    const { data: item, error: errItem } = await adminClient
        .from('sst_epp_item')
        .select('id, catalogo_id, cantidad, entrega:sst_epp_entrega!inner(colaborador_id)')
        .eq('id', input.item_id)
        .eq('tenant_id', tenantId)
        .maybeSingle()

    if (errItem || !item) return { success: false, message: 'Item no encontrado' }

    const colaboradorId = (item as any).entrega.colaborador_id

    const { error: errMov } = await adminClient.from('sst_epp_movimiento').insert({
        tenant_id: tenantId,
        colaborador_id: colaboradorId,
        catalogo_id: item.catalogo_id,
        item_id: item.id,
        tipo: 'DEVOLUCION',
        fecha: input.fecha,
        cantidad: item.cantidad,
        observacion: input.observacion ?? null,
        created_by: user.id,
    })

    if (errMov) return { success: false, message: errMov.message }

    const { error: errUpd } = await adminClient
        .from('sst_epp_item')
        .update({ estado_vigencia: 'DEVUELTO' })
        .eq('id', item.id)

    if (errUpd) return { success: false, message: errUpd.message }

    safeRevalidatePath('/epp')
    safeRevalidatePath(`/epp/colaborador/${colaboradorId}`)
    return { success: true, message: 'Devolución registrada' }
}

export async function createReemplazoEpp(input: {
    item_origen_id: string
    fecha: string
    cantidad: number
    fecha_vencimiento: string
    observacion?: string | null
}) {
    const { adminClient, tenantId, user } = await getSupabaseContext()
    if (!adminClient || !tenantId || !user) return { success: false, message: 'No autorizado' }

    const { data: origen, error: errOrigen } = await adminClient
        .from('sst_epp_item')
        .select('id, catalogo_id, entrega_id, entrega:sst_epp_entrega!inner(colaborador_id)')
        .eq('id', input.item_origen_id)
        .eq('tenant_id', tenantId)
        .maybeSingle()

    if (errOrigen || !origen) return { success: false, message: 'Item origen no encontrado' }

    const colaboradorId = (origen as any).entrega.colaborador_id

    // 1) marcar origen como REEMPLAZADO
    await adminClient
        .from('sst_epp_item')
        .update({ estado_vigencia: 'REEMPLAZADO' })
        .eq('id', origen.id)

    // 2) insertar nuevo item ligado a la misma entrega origen (mantiene histórico)
    const { data: nuevoItem, error: errNew } = await adminClient
        .from('sst_epp_item')
        .insert({
            tenant_id: tenantId,
            entrega_id: origen.entrega_id,
            catalogo_id: origen.catalogo_id,
            cantidad: input.cantidad,
            fecha_vencimiento: input.fecha_vencimiento,
            estado_vigencia: 'VIGENTE',
            item_origen_id: origen.id,
            created_by: user.id,
        })
        .select('id')
        .single()

    if (errNew || !nuevoItem) return { success: false, message: errNew?.message || 'Error creando reemplazo' }

    // 3) movimiento REEMPLAZO
    await adminClient.from('sst_epp_movimiento').insert({
        tenant_id: tenantId,
        colaborador_id: colaboradorId,
        catalogo_id: origen.catalogo_id,
        item_id: nuevoItem.id,
        tipo: 'REEMPLAZO',
        fecha: input.fecha,
        cantidad: input.cantidad,
        observacion: input.observacion ?? null,
        created_by: user.id,
    })

    safeRevalidatePath('/epp')
    safeRevalidatePath(`/epp/colaborador/${colaboradorId}`)
    return { success: true, message: 'Reemplazo registrado', item_id: nuevoItem.id }
}

// ─────────────────────────────────────────────────────────────
// ALERTAS
// ─────────────────────────────────────────────────────────────

export async function getAlertasPendientes(filters?: { nivel?: 'D30' | 'D15' | 'VENCIDO' }) {
    const { adminClient, tenantId } = await getSupabaseContext()
    if (!adminClient || !tenantId) return []

    let query = adminClient
        .from('sst_epp_alerta')
        .select(`
            *,
            item:sst_epp_item(
                id, fecha_vencimiento, cantidad,
                catalogo:sst_epp_config(id, epp_nombre, tipo),
                entrega:sst_epp_entrega(
                    colaborador_id,
                    colaborador:profiles!sst_epp_entrega_colaborador_id_fkey(id, first_name, last_name)
                )
            )
        `)
        .eq('tenant_id', tenantId)
        .eq('gestionado', false)
        .order('nivel', { ascending: true }) // VENCIDO > D15 > D30 alfabéticamente; refinar si hace falta

    if (filters?.nivel) query = query.eq('nivel', filters.nivel)

    const { data, error } = await query
    if (error) {
        console.error('[getAlertasPendientes] error:', error)
        return []
    }
    return data || []
}

export async function runEppAlertsScanner() {
    const { adminClient, tenantId } = await getSupabaseContext()
    if (!adminClient || !tenantId) return { success: false as const, message: 'No autorizado' }

    const { data, error } = await adminClient.rpc('generate_epp_alerts', { p_tenant_id: tenantId })

    if (error) return { success: false as const, message: error.message }

    const stats = (data && (data as any[])[0]) || {
        inserted_d30: 0, inserted_d15: 0, inserted_vencido: 0,
        items_marked_vencido: 0, items_marked_pronto: 0,
    }

    safeRevalidatePath('/epp')
    safeRevalidatePath('/epp/alertas')

    const total = (stats.inserted_d30 || 0) + (stats.inserted_d15 || 0) + (stats.inserted_vencido || 0)
    return {
        success: true as const,
        message: total === 0
            ? 'Sin alertas nuevas. Todos los items en vigencia o ya alertados.'
            : `${total} alertas nuevas (${stats.inserted_vencido} vencido, ${stats.inserted_d15} ≤15d, ${stats.inserted_d30} ≤30d)`,
        stats,
    }
}

export async function marcarAlertaGestionada(id: string) {
    const { adminClient, tenantId, user } = await getSupabaseContext()
    if (!adminClient || !tenantId || !user) return { success: false, message: 'No autorizado' }

    const { error } = await adminClient
        .from('sst_epp_alerta')
        .update({
            gestionado: true,
            fecha_gestionado: new Date().toISOString(),
            gestionado_por: user.id,
        })
        .eq('id', id)
        .eq('tenant_id', tenantId)

    if (error) return { success: false, message: error.message }
    safeRevalidatePath('/epp/alertas')
    return { success: true, message: 'Alerta gestionada' }
}

// ─────────────────────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────────────────────

export async function getDashboardEppMetrics() {
    const { adminClient, tenantId } = await getSupabaseContext()
    if (!adminClient || !tenantId) {
        return { colaboradores_activos: 0, epp_vencidos: 0, epp_proximos: 0, ultimas_entregas: [], alertas_recientes: [] }
    }

    // Colaboradores activos con items vigentes o próximos
    const { data: colabs } = await adminClient
        .from('sst_epp_item')
        .select('entrega:sst_epp_entrega!inner(colaborador_id)', { count: 'exact', head: false })
        .eq('tenant_id', tenantId)
        .in('estado_vigencia', ['VIGENTE', 'PRONTO'])

    const colabSet = new Set(
        (colabs || [])
            .map((r: any) => r.entrega?.colaborador_id)
            .filter(Boolean),
    )

    // EPP vencidos (sin reemplazar)
    const { count: vencidos } = await adminClient
        .from('sst_epp_item')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .eq('estado_vigencia', 'VENCIDO')

    // EPP próximos a vencer
    const { count: proximos } = await adminClient
        .from('sst_epp_item')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .eq('estado_vigencia', 'PRONTO')

    // Últimas 5 entregas
    const { data: ultimas } = await adminClient
        .from('sst_epp_entrega')
        .select(`
            id, fecha_entrega, pdf_url, estado_confirmacion,
            colaborador:profiles!sst_epp_entrega_colaborador_id_fkey(id, first_name, last_name),
            items:sst_epp_item(id)
        `)
        .eq('tenant_id', tenantId)
        .order('fecha_entrega', { ascending: false })
        .limit(5)

    // Alertas pendientes recientes (top 5)
    const { data: alertas } = await adminClient
        .from('sst_epp_alerta')
        .select(`
            id, nivel, fecha_generacion,
            item:sst_epp_item(
                catalogo:sst_epp_config(epp_nombre),
                entrega:sst_epp_entrega(
                    colaborador:profiles!sst_epp_entrega_colaborador_id_fkey(first_name, last_name)
                )
            )
        `)
        .eq('tenant_id', tenantId)
        .eq('gestionado', false)
        .order('fecha_generacion', { ascending: false })
        .limit(5)

    return {
        colaboradores_activos: colabSet.size,
        epp_vencidos: vencidos ?? 0,
        epp_proximos: proximos ?? 0,
        ultimas_entregas: ultimas ?? [],
        alertas_recientes: alertas ?? [],
    }
}

// ─────────────────────────────────────────────────────────────
// Helper — calcula fecha de vencimiento dada vida útil del catálogo
// Exportable para reusar en forms (client) o en server actions.
// ─────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────
// Envío de emails de alertas EPP (Fase J — Resend)
// ─────────────────────────────────────────────────────────────

type AlertaItemRow = {
    id: string
    nivel: string
    item: {
        fecha_vencimiento: string | null
        catalogo: { epp_nombre: string | null } | null
        entrega: {
            colaborador: { first_name: string | null; last_name: string | null } | null
        } | null
    } | null
}

/**
 * Envía un email a cada admin_tenant / supervisor del tenant con el resumen
 * de alertas EPP pendientes. Opera por tenant único (el del contexto actual)
 * o por todos los tenants si `p_all_tenants` = true (sólo uso desde cron).
 */
export async function sendEppAlertasEmails(opts?: { all_tenants?: boolean }) {
    const { sendEmail } = await import('@/lib/email')
    const { renderEppAlertasEmailHtml } = await import('@/lib/epp-email-templates')
    type AlertaResumen = import('@/lib/epp-email-templates').AlertaResumen
    const { adminClient, tenantId } = await getSupabaseContext()
    if (!adminClient) return { success: false as const, message: 'No Supabase client' }

    // Tenants a procesar
    let tenantIds: string[]
    if (opts?.all_tenants) {
        const { data: tenants } = await adminClient.from('companies').select('id')
        tenantIds = (tenants ?? []).map(t => t.id)
    } else {
        if (!tenantId) return { success: false as const, message: 'Sin tenant en contexto' }
        tenantIds = [tenantId]
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://reportar.app'
    const resultados: Array<{ tenant_id: string; enviados: number; total_alertas: number }> = []

    for (const tId of tenantIds) {
        // 1. Alertas pendientes del tenant
        const { data: alertasRaw } = await adminClient
            .from('sst_epp_alerta')
            .select(`
                id, nivel,
                item:sst_epp_item(
                    fecha_vencimiento,
                    catalogo:sst_epp_config(epp_nombre),
                    entrega:sst_epp_entrega(
                        colaborador:profiles!sst_epp_entrega_colaborador_id_fkey(first_name, last_name)
                    )
                )
            `)
            .eq('tenant_id', tId)
            .eq('gestionado', false)

        if (!alertasRaw || alertasRaw.length === 0) {
            resultados.push({ tenant_id: tId, enviados: 0, total_alertas: 0 })
            continue
        }

        const hoy = new Date()
        const alertas: AlertaResumen[] = (alertasRaw as unknown as AlertaItemRow[]).map(a => {
            const col = a.item?.entrega?.colaborador
            const fechaStr = a.item?.fecha_vencimiento ?? null
            let diasRestantes: number | null = null
            if (fechaStr) {
                const diff = Math.floor(
                    (new Date(fechaStr).getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)
                )
                diasRestantes = diff
            }
            return {
                nivel: (a.nivel as AlertaResumen['nivel']) ?? 'D30',
                epp_nombre: a.item?.catalogo?.epp_nombre ?? '—',
                colaborador_nombre: col
                    ? `${col.first_name ?? ''} ${col.last_name ?? ''}`.trim() || '—'
                    : '—',
                fecha_vencimiento: fechaStr,
                dias_restantes: diasRestantes,
            }
        })

        // 2. Destinatarios: admin_tenant + supervisor del tenant con email
        const { data: destinatarios } = await adminClient
            .from('profiles')
            .select('id, email, first_name, last_name, role')
            .eq('tenant_id', tId)
            .in('role', ['admin_tenant', 'supervisor'])
            .not('email', 'is', null)

        if (!destinatarios || destinatarios.length === 0) {
            resultados.push({ tenant_id: tId, enviados: 0, total_alertas: alertas.length })
            continue
        }

        // 3. Tenant nombre
        const { data: tenant } = await adminClient
            .from('companies')
            .select('razon_social, name')
            .eq('id', tId)
            .maybeSingle()
        const tenantNombre = tenant?.razon_social ?? tenant?.name ?? 'Empresa'

        // 4. Enviar 1 email por destinatario
        let enviados = 0
        for (const d of destinatarios) {
            if (!d.email) continue
            const html = renderEppAlertasEmailHtml({
                tenant_nombre: tenantNombre,
                destinatario_nombre: [d.first_name, d.last_name].filter(Boolean).join(' ').trim() || 'Equipo',
                alertas,
                url_panel: `${baseUrl}/epp/alertas`,
            })
            const result = await sendEmail({
                to: d.email,
                subject: `[${tenantNombre}] ${alertas.length} alertas EPP pendientes`,
                html,
            })
            if (result.success) enviados++
        }

        resultados.push({ tenant_id: tId, enviados, total_alertas: alertas.length })
    }

    return { success: true as const, resultados }
}

// ─────────────────────────────────────────────────────────────
// FASE 7 — Observaciones de operario + gestión admin
// ─────────────────────────────────────────────────────────────

export type EntregaConItems = {
    id: string
    fecha_entrega: string
    estado: string
    estado_confirmacion: string | null
    confirmado_via_app: boolean | null
    fecha_confirmacion_app: string | null
    pdf_url: string | null
    items: Array<{
        id: string
        cantidad: number
        fecha_vencimiento: string
        estado_item: string | null
        estado_vigencia: string
        motivo_observacion: string | null
        nota_operario: string | null
        respuesta_admin: string | null
        decision_admin: string | null
        catalogo: { id: string; epp_nombre: string | null; tipo: string | null } | null
    }>
}

export async function getEntregasByColaborador(colaboradorId: string): Promise<EntregaConItems[]> {
    const { adminClient, tenantId } = await getSupabaseContext()
    if (!adminClient || !tenantId) return []

    const { data, error } = await adminClient
        .from('sst_epp_entrega')
        .select(`
            id, fecha_entrega, estado, estado_confirmacion, confirmado_via_app,
            fecha_confirmacion_app, pdf_url,
            items:sst_epp_item(
                id, cantidad, fecha_vencimiento, estado_item, estado_vigencia,
                motivo_observacion, nota_operario, respuesta_admin, decision_admin,
                catalogo:sst_epp_config(id, epp_nombre, tipo)
            )
        `)
        .eq('tenant_id', tenantId)
        .eq('colaborador_id', colaboradorId)
        .order('fecha_entrega', { ascending: false })
        .limit(20)

    if (error) {
        console.error('[getEntregasByColaborador] error:', error)
        return []
    }
    return (data ?? []) as unknown as EntregaConItems[]
}

export async function responderObservacionItem(params: {
    item_id: string
    respuesta_admin: string
    decision_admin: 'REENVIAR' | 'ANULAR' | 'RESOLVER_OFFLINE'
}): Promise<{ success: boolean; message: string }> {
    const { adminClient, tenantId, user } = await getSupabaseContext()
    if (!adminClient || !tenantId || !user) return { success: false, message: 'No autorizado' }

    const { data: item, error: itemErr } = await adminClient
        .from('sst_epp_item')
        .select('id, entrega_id, catalogo_id, cantidad, fecha_vencimiento, estado_item')
        .eq('id', params.item_id)
        .eq('tenant_id', tenantId)
        .maybeSingle()

    if (itemErr || !item) return { success: false, message: 'Item no encontrado' }
    if (item.estado_item !== 'OBSERVADO') return { success: false, message: 'El item no está en estado OBSERVADO' }

    const now = new Date().toISOString()
    let nuevoEstado: string

    if (params.decision_admin === 'REENVIAR') {
        nuevoEstado = 'PENDIENTE_CONFIRMACION'
        const { data: entregaOrigen } = await adminClient
            .from('sst_epp_entrega')
            .select('colaborador_id, responsable_sst_id')
            .eq('id', item.entrega_id)
            .maybeSingle()

        if (entregaOrigen) {
            const { data: nuevaEntrega } = await adminClient
                .from('sst_epp_entrega')
                .insert({
                    tenant_id: tenantId,
                    colaborador_id: entregaOrigen.colaborador_id,
                    responsable_sst_id: entregaOrigen.responsable_sst_id,
                    fecha_entrega: new Date().toISOString().slice(0, 10),
                    estado: 'ACTIVO',
                    estado_confirmacion: 'PENDIENTE',
                    created_by: user.id,
                })
                .select('id')
                .single()

            if (nuevaEntrega) {
                await adminClient.from('sst_epp_item').insert({
                    tenant_id: tenantId,
                    entrega_id: nuevaEntrega.id,
                    catalogo_id: item.catalogo_id,
                    cantidad: item.cantidad,
                    fecha_vencimiento: item.fecha_vencimiento,
                    estado_vigencia: 'VIGENTE',
                    estado_item: 'PENDIENTE_CONFIRMACION',
                    item_origen_id: item.id,
                    created_by: user.id,
                })
            }
        }
    } else if (params.decision_admin === 'ANULAR') {
        nuevoEstado = 'ANULADO'
    } else {
        nuevoEstado = 'RESUELTO'
    }

    await adminClient
        .from('sst_epp_item')
        .update({
            estado_item: nuevoEstado,
            respuesta_admin: params.respuesta_admin,
            decision_admin: params.decision_admin,
            admin_que_respondio_id: user.id,
            fecha_decision_admin: now,
        })
        .eq('id', params.item_id)

    // Si todos los items de la entrega tienen estado final → COMPLETO
    const { data: todosItems } = await adminClient
        .from('sst_epp_item')
        .select('id, estado_item')
        .eq('entrega_id', item.entrega_id)
        .eq('tenant_id', tenantId)

    const finalStates = new Set(['CONFIRMADO', 'ANULADO', 'RESUELTO'])
    const todosFinales = (todosItems ?? []).every(it =>
        it.id === params.item_id ? finalStates.has(nuevoEstado) : finalStates.has(it.estado_item ?? '')
    )

    if (todosFinales) {
        await adminClient
            .from('sst_epp_entrega')
            .update({ estado_confirmacion: 'COMPLETO', updated_at: now })
            .eq('id', item.entrega_id)
    }

    safeRevalidatePath('/epp')
    safeRevalidatePath('/epp/colaborador')
    return { success: true, message: 'Respuesta guardada' }
}
