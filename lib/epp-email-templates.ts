/**
 * Templates HTML para emails del módulo EPP.
 */

export type AlertaResumen = {
    nivel: 'D30' | 'D15' | 'VENCIDO'
    epp_nombre: string
    colaborador_nombre: string
    fecha_vencimiento: string | null
    dias_restantes: number | null
}

function escapeHtml(s: string | null | undefined): string {
    if (s === null || s === undefined) return ''
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
}

function nivelBadge(nivel: 'D30' | 'D15' | 'VENCIDO'): string {
    const cfg = {
        VENCIDO: { bg: '#dc2626', label: 'VENCIDO' },
        D15: { bg: '#ea580c', label: '≤ 15 días' },
        D30: { bg: '#ca8a04', label: '≤ 30 días' },
    }[nivel]
    return `<span style="background:${cfg.bg};color:#fff;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:700;">${cfg.label}</span>`
}

export function renderEppAlertasEmailHtml(data: {
    tenant_nombre: string
    destinatario_nombre: string
    alertas: AlertaResumen[]
    url_panel: string
}): string {
    const { tenant_nombre, destinatario_nombre, alertas, url_panel } = data

    const vencidos = alertas.filter(a => a.nivel === 'VENCIDO')
    const d15 = alertas.filter(a => a.nivel === 'D15')
    const d30 = alertas.filter(a => a.nivel === 'D30')

    const row = (a: AlertaResumen) => `
        <tr>
            <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;">${nivelBadge(a.nivel)}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;font-weight:600;">${escapeHtml(a.epp_nombre)}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;">${escapeHtml(a.colaborador_nombre)}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#6b7280;">${escapeHtml(a.fecha_vencimiento ?? '—')}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;text-align:right;${a.nivel === 'VENCIDO' ? 'color:#dc2626;font-weight:700;' : ''}">${a.dias_restantes !== null ? `${a.dias_restantes} días` : '—'}</td>
        </tr>
    `

    return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Alertas EPP — ${escapeHtml(tenant_nombre)}</title></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
    <table width="100%" style="background:#f3f4f6;padding:24px 0;">
        <tr>
            <td align="center">
                <table width="600" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
                    <tr>
                        <td style="background:#f97316;padding:20px 24px;color:#fff;">
                            <div style="font-size:20px;font-weight:800;font-style:italic;">REPORTA</div>
                            <div style="font-size:14px;opacity:0.9;margin-top:4px;">Alertas de EPP · ${escapeHtml(tenant_nombre)}</div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:24px;">
                            <p style="margin:0 0 12px 0;font-size:14px;">Hola ${escapeHtml(destinatario_nombre)},</p>
                            <p style="margin:0 0 16px 0;font-size:14px;color:#374151;">
                                Tenés <strong>${alertas.length} alertas pendientes</strong> de EPP
                                (${vencidos.length} vencidos, ${d15.length} ≤15 días, ${d30.length} ≤30 días).
                            </p>

                            <table width="100%" style="border-collapse:collapse;margin-top:12px;">
                                <thead>
                                    <tr style="background:#f9fafb;">
                                        <th style="padding:8px 12px;text-align:left;font-size:12px;text-transform:uppercase;color:#6b7280;border-bottom:2px solid #e5e7eb;">Nivel</th>
                                        <th style="padding:8px 12px;text-align:left;font-size:12px;text-transform:uppercase;color:#6b7280;border-bottom:2px solid #e5e7eb;">EPP</th>
                                        <th style="padding:8px 12px;text-align:left;font-size:12px;text-transform:uppercase;color:#6b7280;border-bottom:2px solid #e5e7eb;">Colaborador</th>
                                        <th style="padding:8px 12px;text-align:left;font-size:12px;text-transform:uppercase;color:#6b7280;border-bottom:2px solid #e5e7eb;">Vence</th>
                                        <th style="padding:8px 12px;text-align:right;font-size:12px;text-transform:uppercase;color:#6b7280;border-bottom:2px solid #e5e7eb;">Días</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${vencidos.map(row).join('')}
                                    ${d15.map(row).join('')}
                                    ${d30.map(row).join('')}
                                </tbody>
                            </table>

                            <div style="text-align:center;margin-top:24px;">
                                <a href="${escapeHtml(url_panel)}" style="display:inline-block;background:#f97316;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px;">
                                    Ver panel de alertas
                                </a>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style="background:#f9fafb;padding:16px 24px;text-align:center;font-size:12px;color:#6b7280;border-top:1px solid #e5e7eb;">
                            Reporta.la · Este email se envía automáticamente cuando hay alertas pendientes.
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`
}

