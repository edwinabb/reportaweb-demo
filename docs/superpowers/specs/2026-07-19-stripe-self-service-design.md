# Cobro Self-Service con Stripe (Sub-proyecto C) — Design Spec

**Fecha:** 2026-07-19
**Proyecto:** reportaweb3 (portable a IMPULSAR — ver `docs/PLAYBOOK-GROWTH-ENGINE.md`)
**Estado:** Borrador (en revisión)
**Depende de:** Sub-proyecto A (`2026-07-18-trial-lifecycle-v2-design.md`) — usa `trial_status`,
fases y `companies`. Al pagar, el lead pasa de trial a `converted`.
**Habilita:** Sub-proyecto D (onboarding post-pago se dispara al convertir).

---

## Resumen

Permite que un lead en trial **pague solo, sin intervención del dueño**, y convierta su
cuenta demo en cliente pagante. Modelo **por asiento (per-seat)**: paga por número de
usuarios, mínimo 10. Tres planes (STANDARD, OWN BRAND, CUSTOM) × tres periodicidades
(mensual, semestral −10%, anual −20%). Stripe Checkout para el alta, Stripe Customer
Portal para autogestión (cambiar asientos, tarjeta, cancelar), y webhooks para mantener
el estado de la suscripción sincronizado con `companies`. Al convertir se activan las
**cuotas por plan** (asientos pagados = límite de usuarios).

Objetivo de negocio: cero fricción para cobrar y cero tiempo del dueño en el alta paga.

---

## 1. Modelo de precios (catálogo)

Cobro **por asiento por mes**, facturado según periodicidad. Mínimo **10 asientos**.

| Plan | code | Precio/asiento/mes | Mínimo | Diferenciador |
|------|------|--------------------|--------|---------------|
| STANDARD | `standard` | $29.99 | 10 | Producto base |
| OWN BRAND | `own_brand` | $49.99 | 10 | White-label (logo/colores/dominio propio) |
| CUSTOM | `custom` | negociado | negociado | Precio y features a medida (alta manual) |

**Periodicidad** (mismo precio base/asiento, descuento aplicado como precio ya rebajado):

| Interval | code | Descuento | Cómo se cobra |
|----------|------|-----------|---------------|
| Mensual | `monthly` | 0% | `interval=month, interval_count=1` |
| Semestral | `semiannual` | −10% | `interval=month, interval_count=6` |
| Anual | `annual` | −20% | `interval=year, interval_count=1` |

Ejemplo STANDARD, 10 asientos:
- Mensual: 10 × $29.99 = **$299.90/mes** (equiv. $3,598.80/año).
- Semestral: 10 × $29.99 × 6 × 0.90 = **$1,619.46 cada 6 meses** → **ahorro $359.88/año**.
- Anual: 10 × $29.99 × 12 × 0.80 = **$2,879.04/año** → **ahorro $719.76/año**.

### Mostrar el ahorro (requisito)
Siempre que se ofrezca semestral/anual, la UI **debe resaltar cuánto ahorra el cliente**
frente a pagar mensual, en dinero y en %. Fórmula (en `lib/billing-config.ts`):
```
baseAnual   = precioAsiento × 12 × asientos          // costo anual si pagara mensual
costoPlan   = montoDelIntervalo × (periodosPorAño)    // lo que realmente paga/año
ahorroAnual = baseAnual − costoPlan                    // > 0 en semestral/anual
ahorroPct   = ahorroAnual / baseAnual                  // 10% semestral, 20% anual
```
Se muestra como badge "Ahorras $X/año (Y%)" en: selector de periodicidad (`/suscribir`),
resumen previo al pago, página `/facturacion` (cuánto lleva ahorrado en el ciclo actual) y
en los correos de bienvenida/renovación (D). El copy exacto lo define negocio; el **cálculo
es fuente única** en `lib/billing-config.ts` (no recalcular en cada vista).

> **Moneda:** USD. **Países del comprador:** Perú, Ecuador, otros (Stripe cobra al lead
> con tarjeta internacional; la cuenta Stripe del vendedor ya existe, falta configurarla).
> Los montos exactos viven en `lib/billing-config.ts` (fuente de verdad del copy y del
> alta de Prices en Stripe), no hardcodeados en la UI.

### Productos y Prices en Stripe (a crear una vez)
- **2 Products**: `STANDARD`, `OWN BRAND`. (CUSTOM no es Product fijo: se crea un Price
  ad-hoc por negociación, o se usa un Product `CUSTOM` con Price por cliente.)
- **6 Prices** recurrentes (2 products × 3 intervals), todos `usage_type=licensed`
  (cantidad = asientos). Los montos ya llevan el descuento incorporado.
- Todos con `metadata: { plan_code, interval_code }` para mapear el webhook → catálogo.

---

## 2. Modelo de datos

### `companies` (columnas nuevas — extienden A)
```sql
ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS plan_code            TEXT
      CHECK (plan_code IN ('standard','own_brand','custom')),
  ADD COLUMN IF NOT EXISTS billing_interval     TEXT
      CHECK (billing_interval IN ('monthly','semiannual','annual')),
  ADD COLUMN IF NOT EXISTS seats_paid           INT,      -- asientos pagados (>= 10)
  ADD COLUMN IF NOT EXISTS stripe_customer_id   TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS subscription_status  TEXT,     -- espejo de Stripe: active/past_due/canceled/...
  ADD COLUMN IF NOT EXISTS current_period_end   TIMESTAMPTZ;
```
> `plan_code`/`seats_paid` son NULL mientras `trial_status IN (active,decision,warning)`
> y se poblan al convertir. Un tenant real preexistente (CISE/GRUAS) puede quedar con
> `plan_code=NULL` y `trial_status=NULL` (no aplican cuotas — ver §5).

### `billing_events` (nueva — auditoría idempotente de webhooks)
```sql
CREATE TABLE billing_events (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stripe_event_id   TEXT NOT NULL UNIQUE,      -- idempotencia: un evento se procesa 1 vez
    type              TEXT NOT NULL,             -- checkout.session.completed, etc.
    tenant_id         UUID REFERENCES companies(id),
    payload           JSONB NOT NULL,
    processed_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```
RLS: solo service_role.

---

## 3. Flujos

### 3.1 Conversión (trial → pago)
1. Lead en trial abre **`/suscribir`** (in-app; CTA visible en toda fase, destacado en
   DECISION/WARNING). Ve el catálogo (§1) con selector de **plan**, **periodicidad** y
   **nº de asientos** (default = usuarios actuales, mínimo 10).
2. Server action `createCheckoutSession(tenantId, planCode, interval, seats)`:
   - valida `seats >= 10`;
   - resuelve el `priceId` desde `lib/billing-config.ts` (por `plan_code`+`interval`);
   - crea/recupera el `stripe_customer_id` del tenant;
   - crea `checkout.session` (`mode=subscription`, `line_items:[{price, quantity:seats}]`,
     `client_reference_id=tenantId`, `success_url`/`cancel_url`).
3. Redirige a Stripe Checkout (hosted). El lead paga con tarjeta.
4. Stripe dispara `checkout.session.completed` → webhook (§4) convierte el tenant.
5. `success_url` → `/suscribir/gracias` (mensaje + arranca onboarding post-pago **D**).

### 3.2 Autogestión (cliente ya pagante)
- **`/facturacion`** in-app → botón "Gestionar suscripción" → `createBillingPortalSession`
  → **Stripe Customer Portal** (hosted): cambiar asientos, actualizar tarjeta, ver
  facturas, cancelar. Los cambios llegan por webhook `customer.subscription.updated`.

### 3.3 Alta CUSTOM (manual, por el admin)
- Fuera del checkout self-service: el admin crea un Price ad-hoc en Stripe y usa una
  server action `attachCustomSubscription(tenantId, priceId, seats)` que crea la
  suscripción y convierte. Se apoya en la misma lógica de conversión.

---

## 4. Webhooks — `app/api/stripe/webhook/route.ts`

Ruta pública (POST). Verifica firma con `STRIPE_WEBHOOK_SECRET`
(`stripe.webhooks.constructEvent`). **Idempotencia:** antes de procesar, intenta insertar
`billing_events(stripe_event_id)`; si ya existe (UNIQUE viola) → responde 200 sin repetir.

| Evento Stripe | Acción sobre `companies` |
|---------------|--------------------------|
| `checkout.session.completed` | Cargar sub por `subscription`; setear `trial_status='converted'`, `plan_code`, `billing_interval`, `seats_paid`, `stripe_customer_id`, `stripe_subscription_id`, `subscription_status='active'`, `current_period_end`. Disparar D (onboarding post-pago) + correo de bienvenida pago. Alerta Telegram al admin ("💵 Nuevo cliente pago"). |
| `customer.subscription.updated` | Espejar `seats_paid` (quantity), `billing_interval`, `subscription_status`, `current_period_end`. Si cambió el plan → `plan_code`. |
| `customer.subscription.deleted` | `subscription_status='canceled'`. **Política de gracia:** mantener acceso hasta `current_period_end`; luego decidir (ver §6 fuera de alcance). NO borrar datos automáticamente. |
| `invoice.payment_failed` | `subscription_status='past_due'`. Correo al cliente + (opcional) alerta Telegram. |
| `invoice.payment_succeeded` | `subscription_status='active'`; refrescar `current_period_end`. |

> `plan_code` se resuelve leyendo `price.metadata.plan_code` (por eso el metadata del §1).
> Registrar el endpoint en Stripe Dashboard → Webhooks apuntando a
> `https://live.reportar.app/api/stripe/webhook`.

---

## 5. Cuotas por plan (enforcement)

Al convertir, `seats_paid` fija el **límite de usuarios activos** del tenant.

- **Punto único de enforcement:** al crear/activar un usuario (server action de alta de
  usuario) → `assertSeatAvailable(tenantId)`: cuenta usuarios activos vs `seats_paid`.
  Si `activos >= seats_paid` → bloquea con mensaje "Alcanzaste tus N asientos. Amplía tu
  plan" + link a `/facturacion` (Customer Portal para subir quantity).
- **Feature flag OWN BRAND:** helper `hasBranding(company)` → `plan_code === 'own_brand'`
  (o `custom` con flag). Gatea la sección de branding/white-label (logo, colores, dominio).
- **Trials sin cuota:** si `trial_status` ∈ (active,decision,warning) → `assertSeatAvailable`
  es **no-op** (trial ilimitado, decisión de B §4). La cuota solo aplica a `converted`.
- **Tenants legacy** (`plan_code=NULL` y `trial_status=NULL`, ej. CISE/GRUAS migrados):
  no-op (sin límite) — no romper clientes existentes.

```typescript
// lib/billing-quota.ts
export async function assertSeatAvailable(tenantId: string): Promise<void> {
  const c = await getCompanyBilling(tenantId)             // plan_code, seats_paid, trial_status
  if (!c.plan_code || c.trial_status !== 'converted') return  // trial o legacy → sin límite
  const active = await countActiveUsers(tenantId)
  if (active >= (c.seats_paid ?? 0)) {
    throw new SeatLimitError(c.seats_paid)                // la UI lo traduce a upsell
  }
}
```

---

## 6. Vista in-app

- **`/suscribir`** — catálogo (§1) con selector plan/periodicidad/asientos + resumen de
  precio calculado en vivo (desde `lib/billing-config.ts`) + **badge de ahorro**
  "Ahorras $X/año (Y%)" en semestral/anual (§1) → botón "Pagar" (checkout).
- **`/suscribir/gracias`** — confirmación + entrada a onboarding post-pago (D).
- **`/facturacion`** — estado de suscripción (plan, asientos, próximo cobro,
  `subscription_status`) + "Gestionar suscripción" (Customer Portal).
- **Banner de estado:** si `subscription_status='past_due'` → aviso persistente "Tu pago
  falló, actualiza tu tarjeta".
- Integración con `/sistema` (SuperAdmin): columna plan/asientos/estado en el listado de
  tenants (junto al tab Trials de A).

---

## 7. Seguridad

- `STRIPE_SECRET_KEY` y `STRIPE_WEBHOOK_SECRET`: **solo secrets del worker** (nunca en
  archivos trackeados). `NEXT_PUBLIC_STRIPE_*` no se usa (checkout es server-side/redirect).
- Webhook: **verificar firma siempre**; ignorar eventos sin firma válida.
- **Idempotencia obligatoria** (`billing_events.stripe_event_id UNIQUE`) — Stripe reintenta.
- `client_reference_id=tenantId` para atar la sesión al tenant; validar que exista y esté
  en trial antes de convertir.
- Todas las server actions de billing: solo el admin del tenant o SuperAdmin.
- Nunca confiar en el `success_url` para convertir — **la conversión ocurre solo por
  webhook verificado** (el usuario puede no volver del redirect).

---

## 8. Archivos nuevos / modificados

| Archivo | Acción |
|---------|--------|
| `supabase/migrations/YYYYMMDD_billing.sql` | NUEVO — columnas de `companies` + `billing_events` + RLS |
| `lib/billing-config.ts` | NUEVO — catálogo (planes, precios, priceIds, cálculo) |
| `lib/stripe.ts` | NUEVO — cliente Stripe server-side |
| `lib/actions/billing.ts` | NUEVO — `createCheckoutSession`, `createBillingPortalSession`, `attachCustomSubscription` |
| `lib/billing-quota.ts` | NUEVO — `assertSeatAvailable`, `hasBranding` |
| `app/api/stripe/webhook/route.ts` | NUEVO — webhook idempotente |
| `app/(dashboard)/suscribir/page.tsx` | NUEVO — checkout |
| `app/(dashboard)/suscribir/gracias/page.tsx` | NUEVO — post-pago → D |
| `app/(dashboard)/facturacion/page.tsx` | NUEVO — estado + portal |
| `lib/actions/usuarios.ts` (o equivalente) | MODIFICADO — llamar `assertSeatAvailable` al alta de usuario |
| `lib/actions/trial.ts` | MODIFICADO — `convertTrial` se dispara desde el webhook |
| `types/supabase.ts` | REGEN tras la migración |

> **Dependencia npm:** `stripe` (SDK server-side). Confirmar que corre en el runtime de
> Cloudflare Workers/OpenNext (usar `fetch`-based client de Stripe si hace falta).

---

## 9. Fuera de alcance de C

- **Onboarding definitivo post-pago** → sub-proyecto **D** (C solo dispara el evento).
- **Política de retención tras cancelación** (cuánto se conservan los datos de un
  `canceled` antes de purgar) → decisión de negocio posterior; C solo marca `canceled` y
  respeta `current_period_end`.
- **Prorrateo/upgrades finos entre planes** más allá de lo que hace Stripe por defecto.
- **Impuestos/facturación fiscal local** (Perú/Ecuador) → evaluar Stripe Tax o proveedor
  local en fase posterior.
- **Cobro sin tarjeta** (transferencia/otros métodos LatAm) → futuro.

---

## 10. Decisiones / lecciones (para el playbook)

1. **Per-seat con mínimo** = precio escala con el valor entregado; el mínimo de 10 asegura
   piso de ingreso. Stripe lo modela nativo con `quantity` (`licensed`).
2. **Descuento como Price rebajado, no cupón** = el catálogo es explícito y el webhook lee
   el precio real sin resolver cupones; más simple de auditar.
3. **Conversión solo por webhook verificado**, nunca por `success_url` = fuente de verdad
   única, resistente a que el usuario no vuelva del redirect.
4. **Idempotencia por `stripe_event_id`** = Stripe reintenta; sin esto se duplican
   conversiones/correos.
5. **Cuota = asientos pagados**, enforcement en un solo punto (`assertSeatAvailable`),
   no-op en trial y legacy = un único lugar que mantener, sin romper clientes existentes.
6. **Autogestión con Customer Portal** = cambiar asientos/tarjeta/cancelar sin tocar
   código ni tiempo del dueño.
7. **Resaltar el ahorro** (semestral/anual vs mensual, en $ y %) en checkout, facturación
   y correos = palanca de conversión a periodicidades largas; cálculo en fuente única.
