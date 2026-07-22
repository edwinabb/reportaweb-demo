import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

import { sendEmail } from '@/lib/email'
import { renderEppReporteSemanalHtml } from '@/lib/epp-reporte-semanal-template'

/**
 * POST /api/cron/epp-reporte-semanal
 *
 * Genera y envía un reporte semanal EPP por tenant a todos los admin_tenant /
 * supervisor. Programar lunes 08:00 AM.
 *
 * Protección: header `Authorization: Bearer <CRON_SECRET>`.
 */
export async function POST(req: NextRequest) {
    const authHeader = req.headers.get('authorization')
    const expected = process.env.CRON_SECRET
    if (!expected || authHeader !== `Bearer ${expected}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) return NextResponse.json({ error: 'Missing Supabase env' }, { status: 500 })

    const admin = createClient(url, key, { auth: { persistSession: false } })
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://reportar.app'

    // Período: últimos 7 días
    const hoy = new Date()
    const inicio = new Date(hoy)
    inicio.setDate(inicio.getDate() - 7)
    const periodoInicio = inicio.toISOString().slice(0, 10)
    const periodoFin = hoy.toISOString().slice(0, 10)

    const { data: tenants } = await admin.from('companies').select('id, name, razon_social')
    const resumen: Array<{
        tenant_id: string
        tenant: string
        emails_enviados: number
        entregas: number
        alertas_pendientes: number
    }> = []

    for (const t of tenants ?? []) {
        // 1) Entregas en el periodo
        const { count: entregas } = await admin
            .from('sst_epp_entrega')
            .select('id', { count: 'exact', head: true })
            .eq('tenant_id', t.id)
            .gte('fecha_entrega', periodoInicio)
            .lte('fecha_entrega', periodoFin)

        // 2) Alertas pendientes por nivel
        const { data: alertas } = await admin
            .from('sst_epp_alerta')
            .select('id, nivel')
            .eq('tenant_id', t.id)
            .eq('gestionado', false)

        const vencidos = (alertas ?? []).filter(a => a.nivel === 'VENCIDO').length
        const d15 = (alertas ?? []).filter(a => a.nivel === 'D15').length
        const d30 = (alertas ?? []).filter(a => a.nivel === 'D30').length

        // 3) Top 10 próximos a vencer
        const { data: proximosRaw } = await admin
            .from('sst_epp_item')
            .select(`
                id, fecha_vencimiento,
                catalogo:sst_epp_config(epp_nombre),
                entrega:sst_epp_entrega(
                    colaborador:profiles!sst_epp_entrega_colaborador_id_fkey(first_name, last_name)
                )
            `)
            .eq('tenant_id', t.id)
            .not('fecha_vencimiento', 'is', null)
            .order('fecha_vencimiento', { ascending: true })
            .limit(10)

        const proximos = (proximosRaw ?? []).map((p: any) => {
            const col = p.entrega?.colaborador
            const dias = Math.floor(
                (new Date(p.fecha_vencimiento).getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)
            )
            return {
                epp_nombre: p.catalogo?.epp_nombre ?? '—',
                colaborador: col ? `${col.first_name ?? ''} ${col.last_name ?? ''}`.trim() : '—',
                fecha_vencimiento: p.fecha_vencimiento,
                dias,
            }
        })

        // 4) Destinatarios
        const { data: dests } = await admin
            .from('profiles')
            .select('id, email, first_name, last_name')
            .eq('tenant_id', t.id)
            .in('role', ['admin_tenant', 'supervisor'])
            .not('email', 'is', null)

        let enviados = 0
        for (const d of dests ?? []) {
            if (!d.email) continue
            const html = renderEppReporteSemanalHtml({
                tenant_nombre: t.razon_social ?? t.name ?? 'Empresa',
                destinatario_nombre:
                    [d.first_name, d.last_name].filter(Boolean).join(' ').trim() || 'Equipo',
                periodo_inicio: periodoInicio,
                periodo_fin: periodoFin,
                entregas_periodo: entregas ?? 0,
                total_alertas_pendientes: (alertas ?? []).length,
                vencidos,
                d15,
                d30,
                top_epp_proximos: proximos,
                url_panel: `${baseUrl}/epp`,
            })
            const result = await sendEmail({
                to: d.email,
                subject: `[${t.razon_social ?? t.name ?? ''}] Reporte EPP semanal (${periodoInicio} — ${periodoFin})`,
                html,
            })
            if (result.success) enviados++
        }

        resumen.push({
            tenant_id: t.id,
            tenant: t.razon_social ?? t.name ?? '',
            emails_enviados: enviados,
            entregas: entregas ?? 0,
            alertas_pendientes: (alertas ?? []).length,
        })
    }

    return NextResponse.json({ ok: true, periodo: { inicio: periodoInicio, fin: periodoFin }, resumen })
}

export async function GET(req: NextRequest) {
    return POST(req)
}
