'use server'

import { getSupabaseContext } from '@/lib/action-context'

export type MaquinariaDocExpiryStatus = 'all' | 'vigente' | 'por_vencer' | 'vencido'

export interface GlobalMaquinariaDoc {
    id: string
    numero_doc: string | null
    fecha_emision: string | null
    fecha_vencimiento: string | null
    archivo_url: string | null
    is_active: boolean
    maquinaria_id: string | null
    tipo_doc_id: string | null
    maquinaria: { id: string, nombre: string | null, codigo_interno: string | null } | null
    tipo_doc: { id: string, nombre: string, dias_alerta: number | null, requiere_vencimiento: boolean | null } | null
}

const DEFAULT_ALERT_DAYS = 30

function toDateStr(date: Date) {
    return date.toISOString().split('T')[0]
}

function addDaysStr(base: Date, days: number) {
    const d = new Date(base)
    d.setDate(d.getDate() + days)
    return toDateStr(d)
}

/**
 * Documentos de maquinaria para la vista global (server-side: búsqueda,
 * filtros, paginación y Activos/Papelera resueltos por URL params).
 * El estado de vencimiento se filtra en servidor usando dias_alerta por tipo.
 */
export async function getGlobalMaquinariaDocumentsPaged({
    search,
    tipoDocId,
    isActive = true,
    expiryStatus = 'all',
    page = 1,
    limit = 20,
}: {
    search?: string
    tipoDocId?: string
    isActive?: boolean
    expiryStatus?: MaquinariaDocExpiryStatus
    page?: number
    limit?: number
}) {
    const { adminClient, tenantId } = await getSupabaseContext()
    if (!adminClient || !tenantId) return { data: [] as GlobalMaquinariaDoc[], count: 0, error: 'No autorizado' }

    const today = new Date()
    const todayStr = toDateStr(today)

    let query = adminClient
        .from('maquinaria_documentos')
        .select(`
            id, numero_doc, fecha_emision, fecha_vencimiento, archivo_url, is_active,
            maquinaria_id, tipo_doc_id,
            maquinaria:maquinarias (id, nombre, codigo_interno),
            tipo_doc:maquinaria_tipos_docs (id, nombre, dias_alerta, requiere_vencimiento)
        `, { count: 'exact' })
        .eq('tenant_id', tenantId)
        .eq('is_active', isActive)
        .order('fecha_vencimiento', { ascending: true, nullsFirst: false })

    if (tipoDocId && tipoDocId !== 'all') {
        query = query.eq('tipo_doc_id', tipoDocId)
    }

    if (search) {
        // OR entre columna local (numero_doc) y tablas relacionadas: PostgREST no
        // permite un solo .or() cruzando tablas, así que se prefiltran los IDs.
        const term = `%${search}%`
        const [maqRes, tipoRes] = await Promise.all([
            adminClient
                .from('maquinarias')
                .select('id')
                .eq('tenant_id', tenantId)
                .or(`nombre.ilike.${term},codigo_interno.ilike.${term}`),
            adminClient
                .from('maquinaria_tipos_docs')
                .select('id')
                .eq('tenant_id', tenantId)
                .ilike('nombre', term),
        ])

        const conditions = [`numero_doc.ilike.${term}`]
        const maqIds = (maqRes.data ?? []).map(m => m.id)
        const tipoIds = (tipoRes.data ?? []).map(t => t.id)
        if (maqIds.length) conditions.push(`maquinaria_id.in.(${maqIds.join(',')})`)
        if (tipoIds.length) conditions.push(`tipo_doc_id.in.(${tipoIds.join(',')})`)
        query = query.or(conditions.join(','))
    }

    if (expiryStatus === 'vencido') {
        query = query.not('fecha_vencimiento', 'is', null).lt('fecha_vencimiento', todayStr)
    } else if (expiryStatus === 'por_vencer' || expiryStatus === 'vigente') {
        // Ventana de alerta por tipo de documento (dias_alerta, default 30)
        const { data: tipos } = await adminClient
            .from('maquinaria_tipos_docs')
            .select('id, dias_alerta')
            .eq('tenant_id', tenantId)

        const porTipo = (tipos ?? []).map(t => ({
            id: t.id,
            limite: addDaysStr(today, t.dias_alerta ?? DEFAULT_ALERT_DAYS),
        }))
        const defaultLimite = addDaysStr(today, DEFAULT_ALERT_DAYS)

        if (expiryStatus === 'por_vencer') {
            const conds = [
                ...porTipo.map(t => `and(tipo_doc_id.eq.${t.id},fecha_vencimiento.lte.${t.limite})`),
                `and(tipo_doc_id.is.null,fecha_vencimiento.lte.${defaultLimite})`,
            ]
            query = query.gte('fecha_vencimiento', todayStr).or(conds.join(','))
        } else {
            // Vigente: sin vencimiento, o vence después de la ventana de alerta de su tipo
            const conds = [
                'fecha_vencimiento.is.null',
                ...porTipo.map(t => `and(tipo_doc_id.eq.${t.id},fecha_vencimiento.gt.${t.limite})`),
                `and(tipo_doc_id.is.null,fecha_vencimiento.gt.${defaultLimite})`,
            ]
            query = query.or(conds.join(','))
        }
    }

    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await query.range(from, to)

    if (error) {
        console.error('Error fetching global maquinaria docs:', JSON.stringify(error, null, 2))
        return { data: [] as GlobalMaquinariaDoc[], count: 0, error: error.message }
    }

    return { data: (data as unknown as GlobalMaquinariaDoc[]) ?? [], count: count || 0, error: null }
}
