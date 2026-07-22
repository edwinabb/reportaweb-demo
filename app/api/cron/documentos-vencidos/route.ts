// app/api/cron/documentos-vencidos/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/email'
import {
    renderMaquinariaVencidosEmailHtml,
    renderPersonalVencidosEmailHtml,
    type DocMaquinariaRow,
    type DocPersonalRow,
} from '@/lib/notificaciones-email-templates'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://reportar.app'
const POR_VENCER_DIAS = 15

export async function GET(req: NextRequest) {
    const auth = req.headers.get('authorization')
    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    )

    const hoyIso = new Date().toISOString().split('T')[0]

    const porVencerFecha = new Date()
    porVencerFecha.setUTCDate(porVencerFecha.getUTCDate() + POR_VENCER_DIAS)
    const porVencerIso = porVencerFecha.toISOString().split('T')[0]

    const { data: tenants, error: tenantsError } = await supabase
        .from('companies')
        .select('id, nombre_comercial, razon_social')

    if (tenantsError) {
        console.error('[documentos-vencidos] Error fetching tenants:', tenantsError.message)
        return NextResponse.json({ ok: false, error: tenantsError.message }, { status: 500 })
    }

    if (!tenants?.length) {
        return NextResponse.json({ ok: true, message: 'No tenants found' })
    }

    const summary: Record<string, { maquinaria: number; personal: number; emails: number }> = {}

    for (const tenant of tenants) {
        try {
        const tenantId = tenant.id
        const tenantNombre = tenant.nombre_comercial || tenant.razon_social || tenant.id

        // Update expired maquinaria docs to VENCIDO
        const { error: updateError } = await supabase
            .from('maquinaria_documentos')
            .update({ estado: 'VENCIDO', updated_at: new Date().toISOString() })
            .eq('tenant_id', tenantId)
            .eq('is_active', true)
            .neq('estado', 'VENCIDO')
            .lt('fecha_vencimiento', hoyIso)
        if (updateError) {
            console.error(`[documentos-vencidos] Failed updating maquinaria docs for tenant ${tenantId}:`, updateError.message)
        }

        // Vencidos maquinaria
        const { data: maqVencidos } = await supabase
            .from('maquinaria_documentos')
            .select(`
                id,
                numero_doc,
                fecha_vencimiento,
                maquinarias!inner ( nombre, codigo ),
                maquinaria_tipos_docs ( nombre )
            `)
            .eq('tenant_id', tenantId)
            .eq('is_active', true)
            .eq('estado', 'VENCIDO')
            .not('fecha_vencimiento', 'is', null)

        // Por vencer maquinaria (next 15 days)
        const { data: maqPorVencer } = await supabase
            .from('maquinaria_documentos')
            .select(`
                id,
                numero_doc,
                fecha_vencimiento,
                maquinarias!inner ( nombre, codigo ),
                maquinaria_tipos_docs ( nombre )
            `)
            .eq('tenant_id', tenantId)
            .eq('is_active', true)
            .neq('estado', 'VENCIDO')
            .gte('fecha_vencimiento', hoyIso)
            .lte('fecha_vencimiento', porVencerIso)

        const maqVencidosRows: DocMaquinariaRow[] = (maqVencidos ?? []).map((d: any) => ({
            maquinaria: d.maquinarias?.nombre || d.maquinarias?.codigo || '—',
            tipo_doc: d.maquinaria_tipos_docs?.nombre || '—',
            numero_doc: d.numero_doc ?? undefined,
            fecha_vencimiento: d.fecha_vencimiento,
        }))

        const maqPorVencerRows: DocMaquinariaRow[] = (maqPorVencer ?? []).map((d: any) => ({
            maquinaria: d.maquinarias?.nombre || d.maquinarias?.codigo || '—',
            tipo_doc: d.maquinaria_tipos_docs?.nombre || '—',
            numero_doc: d.numero_doc ?? undefined,
            fecha_vencimiento: d.fecha_vencimiento,
        }))

        // Personal vencidos
        const { data: persVencidos } = await supabase
            .from('user_documents')
            .select(`
                id,
                valid_until,
                document_types ( name ),
                profiles!inner ( nombre_completo )
            `)
            .eq('tenant_id', tenantId)
            .eq('is_active', true)
            .not('valid_until', 'is', null)
            .lt('valid_until', hoyIso)

        // Personal por vencer
        const { data: persPorVencer } = await supabase
            .from('user_documents')
            .select(`
                id,
                valid_until,
                document_types ( name ),
                profiles!inner ( nombre_completo )
            `)
            .eq('tenant_id', tenantId)
            .eq('is_active', true)
            .not('valid_until', 'is', null)
            .gte('valid_until', hoyIso)
            .lte('valid_until', porVencerIso)

        const persVencidosRows: DocPersonalRow[] = (persVencidos ?? []).map((d: any) => ({
            persona: d.profiles?.nombre_completo || '—',
            tipo_doc: d.document_types?.name || '—',
            fecha_vencimiento: d.valid_until,
        }))

        const persPorVencerRows: DocPersonalRow[] = (persPorVencer ?? []).map((d: any) => ({
            persona: d.profiles?.nombre_completo || '—',
            tipo_doc: d.document_types?.name || '—',
            fecha_vencimiento: d.valid_until,
        }))

        summary[tenantNombre] = {
            maquinaria: maqVencidosRows.length + maqPorVencerRows.length,
            personal: persVencidosRows.length + persPorVencerRows.length,
            emails: 0,
        }

        // Get receptores for this tenant
        const { data: receptores } = await supabase
            .from('notificaciones_receptores')
            .select('email, nombre, tipo_correo, frecuencia, dia_semana')
            .eq('tenant_id', tenantId)
            .eq('is_active', true)

        for (const receptor of receptores ?? []) {
            // Skip SEMANAL receptors if today is not their day
            if (receptor.frecuencia === 'SEMANAL') {
                const diaSemanaHoy = new Date().getUTCDay()
                if (receptor.dia_semana !== null && receptor.dia_semana !== diaSemanaHoy) continue
            }

            if (receptor.tipo_correo === 'DOCUMENTOS_MAQUINARIA_VENCIDOS') {
                if (maqVencidosRows.length === 0 && maqPorVencerRows.length === 0) continue
                const html = renderMaquinariaVencidosEmailHtml({
                    nombre: receptor.nombre,
                    tenantNombre,
                    vencidos: maqVencidosRows,
                    porVencer: maqPorVencerRows,
                    siteUrl: SITE_URL,
                })
                await sendEmail({
                    to: receptor.email,
                    subject: `⚠️ Documentos Maquinaria — ${maqVencidosRows.length} vencidos · ${tenantNombre}`,
                    html,
                })
                summary[tenantNombre].emails++
            }

            if (receptor.tipo_correo === 'DOCUMENTOS_PERSONAL_VENCIDOS') {
                if (persVencidosRows.length === 0 && persPorVencerRows.length === 0) continue
                const html = renderPersonalVencidosEmailHtml({
                    nombre: receptor.nombre,
                    tenantNombre,
                    vencidos: persVencidosRows,
                    porVencer: persPorVencerRows,
                    siteUrl: SITE_URL,
                })
                await sendEmail({
                    to: receptor.email,
                    subject: `⚠️ Documentos Personal — ${persVencidosRows.length} vencidos · ${tenantNombre}`,
                    html,
                })
                summary[tenantNombre].emails++
            }
        }
        } catch (err) {
            console.error(`[documentos-vencidos] Error processing tenant ${tenant.id}:`, err)
            summary[tenant.nombre_comercial || tenant.razon_social || tenant.id] = { maquinaria: -1, personal: -1, emails: -1 }
        }
    }

    return NextResponse.json({ ok: true, summary })
}
