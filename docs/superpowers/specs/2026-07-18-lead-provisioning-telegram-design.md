# Alta Sales-Led de Leads + Aprobación/Telegram (Sub-proyecto B) — Design Spec

**Fecha:** 2026-07-18
**Proyecto:** reportaweb3 (portable a IMPULSAR — ver `docs/PLAYBOOK-GROWTH-ENGINE.md`)
**Estado:** Borrador (en revisión)
**Depende de:** Sub-proyecto A (`2026-07-18-trial-lifecycle-v2-design.md`) — usa `registerTrial`, estados y fechas de fase.

---

## Resumen

Provisión de cuentas demo para leads con **mínima intervención del dueño**: el lead pide
la demo (formulario en landing) o el admin la crea directo; el admin **aprueba con 1 clic
desde Telegram** (o desde `/sistema`), y el sistema provisiona la cuenta, arranca el ciclo
de vida (A) y envía credenciales al lead. Toda la infraestructura Telegram (bot, envío,
callbacks) se define aquí y la comparte A (alerta de lead caliente).

Objetivo de negocio: que dar de alta y atender leads consuma **minutos** del dueño, con
alertas solo cuando importa (aprobar, lead caliente).

---

## 1. Flujos de alta

### 1.1 Auto-solicitud desde landing (principal)
1. Lead completa formulario público `/solicitar-demo` (nombre, email, empresa, país,
   tipo de flota, tamaño).
2. Se crea una fila `lead_requests` con `status='pending'`.
3. Se notifica al admin: **Telegram con botones inline [Aprobar] [Rechazar]** + correo.
4. Admin aprueba → provisión (2) → credenciales al lead por correo → arranca ciclo A.
5. Admin rechaza → `status='rejected'`, opcional correo cortés al lead.

### 1.2 Alta directa por el admin (desde `/sistema`)
El admin crea la cuenta sin solicitud previa (para leads captados en reuniones). Salta la
aprobación: provisión inmediata.

---

## 2. Modelo de datos

### `lead_requests` (nueva)
```sql
CREATE TABLE lead_requests (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_name   TEXT NOT NULL,
    email        TEXT NOT NULL,
    company_name TEXT NOT NULL,
    country      TEXT,
    fleet_type   TEXT,
    fleet_size   INT,
    status       TEXT NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending','approved','rejected')),
    tenant_id    UUID REFERENCES companies(id),  -- set al aprobar
    requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved_at  TIMESTAMPTZ,
    resolved_by  UUID                              -- admin que resolvió (o 'telegram')
);
```
RLS: lectura/escritura solo service_role y SuperAdmin.

---

## 3. Infraestructura Telegram (compartida con A)

### 3.1 Configuración
- Secret del worker: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_ADMIN_CHAT_ID`.
- Bot creado con @BotFather (una vez). Sin costo, sin aprobación de plataforma.

### 3.2 Envío — `lib/telegram.ts`
```typescript
export async function sendTelegram(text: string, buttons?: { text: string; callback_data: string }[][]) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: process.env.TELEGRAM_ADMIN_CHAT_ID,
      text, parse_mode: 'HTML',
      reply_markup: buttons ? { inline_keyboard: buttons } : undefined,
    }),
  })
}
```
Usos: aprobación de lead (`callback_data: approve:<requestId>` / `reject:<requestId>`) y
**alerta de lead caliente de A** (`computeEngagement` cruza el umbral).

### 3.3 Webhook de callbacks — `app/api/telegram/webhook/route.ts`
- Recibe el `callback_query` cuando el admin toca [Aprobar]/[Rechazar].
- Verifica secret (`X-Telegram-Bot-Api-Secret-Token`).
- Parsea `callback_data`; ejecuta `approveLeadRequest(id)` o `rejectLeadRequest(id)`.
- Responde `answerCallbackQuery` + edita el mensaje ("✅ Aprobado por Telegram").
- Registrar el webhook una vez con `setWebhook` apuntando a
  `https://live.reportar.app/api/telegram/webhook`.

---

## 4. Provisión — `lib/actions/lead-provisioning.ts`

```typescript
export async function approveLeadRequest(requestId: string, resolvedBy = 'telegram') {
  // 1. cargar lead_requests (status pending)
  // 2. llamar registerTrial(A) con los datos → crea company (active + fechas), admin, seed, config
  // 3. update lead_requests: status='approved', tenant_id, resolved_at, resolved_by
  // 4. enviar correo de bienvenida al lead con credenciales / link de acceso
  // 5. confirmar al admin (Telegram)
}
export async function rejectLeadRequest(requestId: string, resolvedBy = 'telegram') { /* status='rejected' + correo opcional */ }
export async function createLeadDirect(input: RegisterTrialInput) { /* 1.2: registerTrial + welcome, sin lead_requests */ }
```

**"Sin límites" durante el trial:** los tenants en trial no tienen enforcement de cuotas
(usuarios/maquinaria/terceros/informes/facturación/valorización). Si en el futuro se
agregan cuotas por plan, se aplican solo a `trial_status='converted'` con un `plan_id`
(sub-proyecto C). En A/B no hay límites.

---

## 5. Notificaciones (resumen)

| Evento | Canal | Destinatario |
|--------|-------|--------------|
| Nueva solicitud de demo | Telegram (botones) + correo | Admin |
| Lead aprobado | Correo (credenciales) | Lead |
| Lead caliente (engagement, de A) | Telegram | Admin |
| Alta directa lista | Correo (credenciales) | Lead |

Telegram = admin (gratis, inmediato, botones). Cliente = correo (+ asistente web en E).
WhatsApp queda como opción futura (mayor alcance LatAm, mayor costo/fricción de API).

---

## 6. Vista admin — `/sistema`

- Pestaña **Solicitudes** (`lead_requests`): pendientes con [Aprobar]/[Rechazar] (misma
  acción que Telegram), historial de resueltas.
- Botón **+ Alta directa** → formulario que llama `createLeadDirect`.
- Se integra con el tab **Trials** de A (una vez aprobado, el lead aparece ahí con su fase).

---

## 7. Seguridad

- `TELEGRAM_BOT_TOKEN` y secret del webhook: solo secrets del worker, nunca en archivos.
- Webhook valida el `secret_token` de Telegram; ignora callbacks no reconocidos.
- `callback_data` acotado a `approve:<uuid>`/`reject:<uuid>`; validar formato antes de actuar.
- Provisión y resolución de solicitudes: solo service_role (server actions) — el lead
  nunca crea su propia cuenta activa sin aprobación (flujo 1.1).

---

## 8. Archivos nuevos / modificados

| Archivo | Acción |
|---------|--------|
| `supabase/migrations/YYYYMMDD_lead_requests.sql` | NUEVO — tabla `lead_requests` + RLS |
| `app/solicitar-demo/page.tsx` | NUEVO — formulario público |
| `lib/telegram.ts` | NUEVO — `sendTelegram` (compartido con A) |
| `app/api/telegram/webhook/route.ts` | NUEVO — callbacks de botones |
| `lib/actions/lead-provisioning.ts` | NUEVO — approve/reject/createDirect |
| `lib/actions/lead-requests.ts` | NUEVO — crear solicitud desde landing |
| `components/sistema/leads/solicitudes-table.tsx` | NUEVO — tab Solicitudes |
| `app/(dashboard)/sistema/**` | MODIFICADO — tab Solicitudes + alta directa |
| `wrangler.live.toml` | MODIFICADO — (ninguno nuevo; webhook es ruta normal) |

---

## 9. Fuera de alcance de B

- **Cobro / conversión a pago** → sub-proyecto **C** (Stripe).
- **Onboarding post-pago** → sub-proyecto **D**.
- **Asistente web de ventas/soporte** → sub-proyecto **E**.
- **WhatsApp** como canal de cliente → futuro.
- **Cuotas por plan** → futuro (con C).

---

## 10. Decisiones / lecciones (para el playbook)

1. **Aprobación desde Telegram con botones inline** = el dueño aprueba desde el celular en
   segundos, sin entrar al sistema. Webhook + `callback_data` acotado.
2. **Telegram como infra compartida** (aprobación en B + alerta de engagement en A) — un
   solo `lib/telegram.ts`.
3. **Dos caminos de alta** (auto-solicitud con aprobación / alta directa) cubren lead
   inbound y lead captado en reunión sin duplicar lógica (ambos terminan en `registerTrial`).
4. **Sin cuotas en trial**: la fricción de límites se posterga a la etapa paga; el trial
   debe sentirse ilimitado para enamorar.
