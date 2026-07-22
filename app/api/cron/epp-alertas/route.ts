import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

import { renderEppAlertasEmailHtml, type AlertaResumen } from '@/lib/epp-email-templates'
import { sendEmail } from '@/lib/email'

/**
 * POST /api/cron/epp-alertas
 *
 * Endpoint de cron para:
 *   1) Ejecutar generate_epp_alerts por cada tenant (D30/D15/VENCIDO)
 *   2) Enviar emails de resumen a admin_tenant + supervisor del tenant
 *
 * Protección: header `Authorization: Bearer <CRON_SECRET>`.
 * Usar con Vercel Cron Jobs (vercel.json) o cualquier scheduler externo.
 */
export async function POST(req: NextRequest) {
    const authHeader = req.headers.get('authorization')
    const expected = process.env.CRON_SECRET
    if (!expected || authHeader !== `Bearer ${expected}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) {
        return NextResponse.json({ error: 'Missing Supabase env' }, { status: 500 })
    }
    const admin = createClient(url, key, { auth: { persistSession: false } })

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://reportar.app'

    // 1) Obtener todos los tenants activos
    const { data: tenants, error: errTenants } = await admin
        .from('companies')
        .select('id, name, razon_social')
    if (errTenants) {
        return NextResponse.json({ error: errTenants.message }, { status: 500 })
    }

    const resumen: Array<{
        tenant_id: string
        tenant: string
        alertas_nuevas: number
        total_pendientes: number
        emails_enviados: number
    }> = []

    for (const t of tenants ?? []) {
        // 2) Scan
        const { data: scanData, error: scanErr } = await admin.rpc('generate_epp_alerts', {
            p_tenant_id: t.id,
        })
        const stats = (scanErr ? null : (scanData as any[] | null)?.[0]) ?? {
            inserted_d30: 0,
            inserted_d15: 0,
            inserted_vencido: 0,
        }
        const alertasNuevas =
            (stats.inserted_d30 || 0) + (stats.inserted_d15 || 0) + (stats.inserted_vencido || 0)

        // 3) Alertas pendientes
        const { data: alertasRaw } = await admin
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
            .eq('tenant_id', t.id)
            .eq('gestionado', false)

        if (!alertasRaw || alertasRaw.length === 0) {
            resumen.push({
                tenant_id: t.id,
                tenant: t.razon_social ?? t.name ?? '',
                alertas_nuevas: alertasNuevas,
                total_pendientes: 0,
                emails_enviados: 0,
            })
            continue
        }

        const hoy = new Date()
        const alertas: AlertaResumen[] = (alertasRaw as unknown as Array<{
            nivel: string
            item: {
                fecha_vencimiento: string | null
                catalogo: { epp_nombre: string | null } | null
                entrega: { colaborador: { first_name: string | null; last_name: string | null } | null } | null
            } | null
        }>).map(a => {
            const fechaStr = a.item?.fecha_vencimiento ?? null
            let dias: number | null = null
            if (fechaStr) {
                dias = Math.floor((new Date(fechaStr).getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
            }
            const col = a.item?.entrega?.colaborador
            return {
                nivel: (a.nivel as AlertaResumen['nivel']) ?? 'D30',
                epp_nombre: a.item?.catalogo?.epp_nombre ?? '—',
                colaborador_nombre: col
                    ? `${col.first_name ?? ''} ${col.last_name ?? ''}`.trim() || '—'
                    : '—',
                fecha_vencimiento: fechaStr,
                dias_restantes: dias,
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
            const html = renderEppAlertasEmailHtml({
                tenant_nombre: t.razon_social ?? t.name ?? 'Empresa',
                destinatario_nombre:
                    [d.first_name, d.last_name].filter(Boolean).join(' ').trim() || 'Equipo',
                alertas,
                url_panel: `${baseUrl}/epp/alertas`,
            })
            const result = await sendEmail({
                to: d.email,
                subject: `[${t.razon_social ?? t.name ?? ''}] ${alertas.length} alertas EPP pendientes`,
                html,
            })
            if (result.success) enviados++
        }

        resumen.push({
            tenant_id: t.id,
            tenant: t.razon_social ?? t.name ?? '',
            alertas_nuevas: alertasNuevas,
            total_pendientes: alertas.length,
            emails_enviados: enviados,
        })
    }

    return NextResponse.json({ ok: true, resumen })
}

// Permitir GET también para schedulers que no soportan POST
export async function GET(req: NextRequest) {
    return POST(req)
}
