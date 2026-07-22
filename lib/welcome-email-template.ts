export function renderWelcomeEmailHtml(data: {
    firstName: string
    tenantName: string
    resetLink: string
    siteUrl: string
    logoUrl?: string | null
}): string {
    const { firstName, tenantName, resetLink, siteUrl, logoUrl } = data

    const logoHtml = logoUrl
        ? `<img src="${logoUrl}" alt="${tenantName}" style="max-height:60px;max-width:200px;object-fit:contain;" />`
        : `<span style="font-size:22px;font-weight:800;color:#ea580c;letter-spacing:-0.5px;">${tenantName}</span>`

    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Bienvenido a ${tenantName}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#0f172a;padding:28px 40px;text-align:center;">
              ${logoHtml}
            </td>
          </tr>

          <!-- Orange accent bar -->
          <tr>
            <td style="background:#ea580c;height:4px;"></td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <h1 style="margin:0 0 8px;font-size:26px;font-weight:800;color:#0f172a;letter-spacing:-0.5px;">
                ¡TE DAMOS LA BIENVENIDA!
              </h1>
              <p style="margin:0 0 24px;font-size:16px;color:#475569;">
                Hola <strong>${firstName}</strong>,
              </p>
              <p style="margin:0 0 16px;font-size:15px;color:#334155;line-height:1.6;">
                El primer paso para ingresar a <strong>reportar.app</strong> es crear una contraseña segura.
                Utiliza <strong>ocho (8) caracteres como mínimo</strong>, con al menos una letra, un número y un símbolo.
              </p>
              <p style="margin:0 0 28px;font-size:15px;color:#334155;line-height:1.6;">
                Para crear tu contraseña haz clic en el siguiente botón:
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 28px;">
                <tr>
                  <td style="background:#ea580c;border-radius:8px;padding:14px 32px;text-align:center;">
                    <a href="${resetLink}" style="color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;display:inline-block;">
                      Crear mi contraseña
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px;font-size:13px;color:#64748b;text-align:center;">
                Este link solo es válido durante las próximas <strong>12 horas</strong>.
              </p>

              <!-- Divider -->
              <hr style="border:none;border-top:1px solid #e2e8f0;margin:28px 0;" />

              <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#334155;">Cordialmente,</p>
              <p style="margin:0;font-size:14px;color:#334155;">Equipo de <strong>REPORTAR.APP</strong></p>
            </td>
          </tr>

          <!-- Notes -->
          <tr>
            <td style="background:#f8fafc;padding:24px 40px;border-top:1px solid #e2e8f0;">
              <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Notas</p>
              <ol style="margin:0;padding-left:20px;">
                <li style="font-size:12px;color:#64748b;line-height:1.6;margin-bottom:4px;">
                  Si tienes problemas con el link de arriba, cópialo y pégalo en tu navegador web.
                </li>
                <li style="font-size:12px;color:#64748b;line-height:1.6;">
                  Si el link expiró, ingresa a
                  <a href="${siteUrl}/login" style="color:#ea580c;text-decoration:none;">${siteUrl}/login</a>,
                  selecciona la opción <em>¿OLVIDASTE TU CONTRASEÑA?</em> y sigue los pasos para recibir un nuevo link.
                </li>
              </ol>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#0f172a;padding:20px 40px;text-align:center;">
              <p style="margin:0 0 4px;font-size:11px;color:#94a3b8;line-height:1.5;">
                Este correo electrónico se ha enviado al email asociado a tu cuenta de usuario en la plataforma <strong>REPORTAR.APP</strong>
              </p>
              <a href="${siteUrl}" style="font-size:11px;color:#94a3b8;text-decoration:none;">${siteUrl}</a>
              <p style="margin:8px 0 0;font-size:10px;color:#64748b;">Santiago de Surco, Lima (Perú)</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
