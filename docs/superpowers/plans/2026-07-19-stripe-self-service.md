# Stripe Self-Service (Sub-proyecto C) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permitir que un lead en trial pague solo (Stripe Checkout) y convierta su cuenta en cliente pagante per-seat, con autogestión (Customer Portal), webhooks idempotentes y cuotas por plan.

**Architecture:** Cobro por asiento (`quantity`) con suscripción recurrente en Stripe. El alta ocurre por Checkout hosted; la conversión trial→`converted` ocurre **solo** en el webhook verificado (`checkout.session.completed`). El estado de la suscripción se espeja en `companies`. Las cuotas (asientos pagados = límite de usuarios) se aplican en un único punto (`assertSeatAvailable`), no-op en trial y tenants legacy.

**Tech Stack:** Next.js 16 (App Router, server actions, route handlers), Supabase (Postgres + RLS + admin API), Stripe (Checkout + Billing Customer Portal + Webhooks), Cloudflare Workers (secrets del worker), Resend (email), Telegram (alerta admin — reusa `lib/telegram.ts` de B).

**Spec de referencia:** `docs/superpowers/specs/2026-07-19-stripe-self-service-design.md`
**Playbook:** `docs/PLAYBOOK-GROWTH-ENGINE.md`

## Global Constraints

- **Planes/precios (USD, per-seat, mínimo 10 asientos):** STANDARD `standard` $29.99 · OWN BRAND `own_brand` $49.99 · CUSTOM `custom` (ad-hoc). Intervalos: `monthly` (0%) · `semiannual` (−10%, `interval=month, interval_count=6`) · `annual` (−20%, `interval=year`).
- **Descuento como Price ya rebajado**, NO cupón. Los montos exactos viven en `lib/billing-config.ts` (fuente única de copy + cálculo de ahorro).
- **Mostrar siempre el ahorro** (en $ y %) vs mensual cuando se ofrece semestral/anual: checkout, `/facturacion`, correos.
- **Conversión solo por webhook verificado** (`checkout.session.completed`), nunca por `success_url`.
- **Idempotencia obligatoria:** `billing_events.stripe_event_id` UNIQUE — Stripe reintenta.
- **Cuota = `seats_paid`**, enforcement en `assertSeatAvailable`; **no-op** si `trial_status != 'converted'` o `plan_code IS NULL` (trial y tenants legacy CISE/GRUAS).
- **Secretos server-side jamás en archivos trackeados** — `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` solo como secrets del worker.
- **Verificación:** el repo no tiene runner unitario; verificar cada task con `npm run build` (typecheck estricto) + el check manual indicado. Funciones puras (cálculo de precio/ahorro, `assertSeatAvailable`) llevan test unitario si se agrega vitest.
- **Migraciones:** primero Supabase TEST (`oyrokyyaeaeqzlsgxtto`), luego PROD (`fqwhagryqkkhbgznxtwf`). Regenerar tipos con `npm run types:supabase` tras cada migración.
- **Runtime Cloudflare/OpenNext:** usar el SDK `stripe` con `httpClient` basado en `fetch` (`Stripe.createFetchHttpClient()`) para compatibilidad con Workers.

---

## File Structure

| Archivo | Responsabilidad |
|---------|-----------------|
| `supabase/migrations/20260719_billing.sql` | Columnas de billing en `companies` + tabla `billing_events` + RLS |
| `lib/billing-config.ts` | Catálogo (planes, precios, priceIds por env) + cálculo de precio y ahorro |
| `lib/stripe.ts` | Cliente Stripe server-side (fetch http client) |
| `lib/actions/billing.ts` | `createCheckoutSession`, `createBillingPortalSession`, `attachCustomSubscription` |
| `lib/billing-quota.ts` | `assertSeatAvailable`, `hasBranding`, `SeatLimitError` |
| `app/api/stripe/webhook/route.ts` | Webhook idempotente (verifica firma, espeja estado, convierte) |
| `app/(dashboard)/suscribir/page.tsx` | Selector plan/periodicidad/asientos + badge de ahorro → checkout |
| `app/(dashboard)/suscribir/gracias/page.tsx` | Confirmación post-pago (enlaza a D) |
| `app/(dashboard)/facturacion/page.tsx` | Estado de suscripción + Customer Portal |
| `lib/actions/usuarios.ts` (o equivalente real) | (modif) llamar `assertSeatAvailable` al alta de usuario |
| `components/sistema/onboarding/trials-table.tsx` | (modif) columnas plan/asientos/estado sub. |

---

## Task 1: Migración de BD (billing en companies + billing_events)

**Files:**
- Create: `supabase/migrations/20260719_billing.sql`
- Modify (regen): `types/supabase.ts`

**Interfaces:**
- Produces: columnas `companies.plan_code|billing_interval|seats_paid|stripe_customer_id|stripe_subscription_id|subscription_status|current_period_end`; tabla `billing_events`.

- [ ] **Step 1: Escribir la migración**

```sql
-- 20260719_billing.sql

ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS plan_code              TEXT
      CHECK (plan_code IS NULL OR plan_code IN ('standard','own_brand','custom')),
  ADD COLUMN IF NOT EXISTS billing_interval       TEXT
      CHECK (billing_interval IS NULL OR billing_interval IN ('monthly','semiannual','annual')),
  ADD COLUMN IF NOT EXISTS seats_paid             INT,
  ADD COLUMN IF NOT EXISTS stripe_customer_id     TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS subscription_status    TEXT,
  ADD COLUMN IF NOT EXISTS current_period_end     TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS companies_stripe_customer_idx ON companies (stripe_customer_id);
CREATE INDEX IF NOT EXISTS companies_stripe_sub_idx      ON companies (stripe_subscription_id);

CREATE TABLE IF NOT EXISTS billing_events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stripe_event_id TEXT NOT NULL UNIQUE,
    type            TEXT NOT NULL,
    tenant_id       UUID REFERENCES companies(id),
    payload         JSONB NOT NULL,
    processed_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE billing_events ENABLE ROW LEVEL SECURITY;
-- Sin policies => solo service_role accede (bypassa RLS). Confirmar convención del repo.
```

- [ ] **Step 2: Aplicar en TEST y regenerar tipos**

Run (Supabase TEST SQL editor): pegar y ejecutar la migración. Luego `npm run types:supabase`.
Expected: sin error; `types/supabase.ts` incluye `billing_events` y las columnas nuevas.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260719_billing.sql types/supabase.ts
git commit -m "feat(billing): columnas de suscripcion + billing_events"
```

---

## Task 2: Catálogo, precios y cálculo de ahorro (función pura)

**Files:**
- Create: `lib/billing-config.ts`

**Interfaces:**
- Produces: tipos `PlanCode`, `Interval`; `PLANS`; `PRICE_PER_SEAT`; `MIN_SEATS=10`; `priceIdFor(plan, interval)`; `quote({ plan, interval, seats }): { total: number; perYear: number; savingsPerYear: number; savingsPct: number }`.

- [ ] **Step 1: Escribir el módulo (montos ya con descuento)**

```typescript
// lib/billing-config.ts
export type PlanCode = 'standard' | 'own_brand' | 'custom'
export type Interval = 'monthly' | 'semiannual' | 'annual'

export const MIN_SEATS = 10
export const PRICE_PER_SEAT: Record<Exclude<PlanCode, 'custom'>, number> = {
  standard: 29.99,
  own_brand: 49.99,
}
export const INTERVAL_DISCOUNT: Record<Interval, number> = { monthly: 0, semiannual: 0.10, annual: 0.20 }
// Periodos por año (para comparar contra el costo anual base pagando mensual)
export const PERIODS_PER_YEAR: Record<Interval, number> = { monthly: 12, semiannual: 2, annual: 1 }
// Meses cubiertos por cada cobro
const MONTHS_PER_PERIOD: Record<Interval, number> = { monthly: 1, semiannual: 6, annual: 12 }

export const PLANS = {
  standard:  { code: 'standard',  label: 'STANDARD',  hasBranding: false },
  own_brand: { code: 'own_brand', label: 'OWN BRAND', hasBranding: true },
  custom:    { code: 'custom',    label: 'CUSTOM',    hasBranding: true },
} as const

// priceIds reales de Stripe por (plan, interval), inyectados por env (nunca hardcodear el id en git es opcional; el id de price NO es secreto pero se configura por entorno).
export function priceIdFor(plan: Exclude<PlanCode, 'custom'>, interval: Interval): string {
  const key = `STRIPE_PRICE_${plan.toUpperCase()}_${interval.toUpperCase()}`
  const id = process.env[key]
  if (!id) throw new Error(`Falta price id de Stripe: ${key}`)
  return id
}

/** Monto por periodo (ya con descuento) para `seats` asientos. */
export function periodAmount(plan: Exclude<PlanCode, 'custom'>, interval: Interval, seats: number): number {
  const base = PRICE_PER_SEAT[plan] * seats * MONTHS_PER_PERIOD[interval]
  const withDisc = base * (1 - INTERVAL_DISCOUNT[interval])
  return Math.round(withDisc * 100) / 100
}

export function quote(args: { plan: Exclude<PlanCode, 'custom'>; interval: Interval; seats: number }) {
  const { plan, interval, seats } = args
  const total = periodAmount(plan, interval, seats)              // lo que paga este cobro
  const perYear = Math.round(total * PERIODS_PER_YEAR[interval] * 100) / 100
  const baseYear = Math.round(PRICE_PER_SEAT[plan] * seats * 12 * 100) / 100 // pagando mensual
  const savingsPerYear = Math.round((baseYear - perYear) * 100) / 100
  const savingsPct = INTERVAL_DISCOUNT[interval]
  return { total, perYear, savingsPerYear, savingsPct }
}
```

- [ ] **Step 2: (si se agrega vitest) test del cálculo**

Casos: `quote({plan:'standard',interval:'annual',seats:10})` → `total=2879.04`, `savingsPerYear=719.76`, `savingsPct=0.2`; semestral → `total=1619.46`, `savingsPerYear=359.88`; mensual → `savingsPerYear=0`.

- [ ] **Step 3: Typecheck + commit**

Run: `npm run build`  Expected: PASS.
```bash
git add lib/billing-config.ts && git commit -m "feat(billing): catalogo de planes + calculo de precio y ahorro"
```

---

## Task 3: Cliente Stripe (compat Workers)

**Files:**
- Create: `lib/stripe.ts`

**Interfaces:**
- Produces: `stripe` (instancia server-side); `getStripe()` lazy.

- [ ] **Step 1: Instalar dependencia**

Run: `npm install stripe`
Expected: `stripe` en `package.json`.

- [ ] **Step 2: Escribir el cliente con fetch http client**

```typescript
// lib/stripe.ts
import Stripe from 'stripe'

let _stripe: Stripe | null = null
export function getStripe(): Stripe {
  if (_stripe) return _stripe
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('Falta STRIPE_SECRET_KEY')
  _stripe = new Stripe(key, {
    apiVersion: '2025-06-30.basil',                 // fijar versión; ajustar a la vigente
    httpClient: Stripe.createFetchHttpClient(),     // compat Cloudflare Workers
  })
  return _stripe
}
```

- [ ] **Step 3: Typecheck + commit**

Run: `npm run build`  Expected: PASS.
```bash
git add lib/stripe.ts package.json package-lock.json && git commit -m "feat(billing): cliente stripe compat workers"
```

---

## Task 4: Setup de Stripe (Products/Prices/Portal/Webhook) — configuración

**Files:**
- Modify: `.env.demo` / `.env.production` (solo los `STRIPE_PRICE_*`, que **no** son secretos) — o secrets del worker si se prefiere no versionarlos.
- Modify: secrets del worker (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`).

- [ ] **Step 1: Crear en Stripe Dashboard (test mode primero)**

- 2 Products: `STANDARD`, `OWN BRAND`.
- 6 Prices recurrentes (`usage_type=licensed`), montos ya con descuento (ver Task 2):
  - STANDARD: monthly $29.99 (×seat), semiannual $161.946/seat cobro (interval_count=6, −10%), annual $287.904/seat (year, −20%).
  - OWN BRAND: análogo con $49.99.
  - Cada Price con `metadata: { plan_code, interval_code }`.
- Activar **Customer Portal** (Billing → Customer Portal) permitiendo cambiar cantidad y cancelar.

> Nota: Stripe cobra por asiento vía `quantity`; el monto del Price es **por asiento por periodo** (ya con descuento). El total lo hace `quantity × price`.

- [ ] **Step 2: Registrar el endpoint de webhook**

Stripe Dashboard → Developers → Webhooks → add endpoint `https://live.reportar.app/api/stripe/webhook`, eventos: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`, `invoice.payment_succeeded`. Copiar el `whsec_…` → secret del worker `STRIPE_WEBHOOK_SECRET`.

- [ ] **Step 3: Cargar variables**

- `STRIPE_SECRET_KEY` (secret del worker).
- `STRIPE_WEBHOOK_SECRET` (secret del worker).
- `STRIPE_PRICE_STANDARD_MONTHLY|SEMIANNUAL|ANNUAL`, `STRIPE_PRICE_OWN_BRAND_MONTHLY|SEMIANNUAL|ANNUAL` (price ids; env por entorno).

- [ ] **Step 4: (sin commit de secretos)** confirmar `git grep sk_live` / `git grep whsec` vacío. Documentar los price ids usados en un doc no sensible.

---

## Task 5: Server actions de billing

**Files:**
- Create: `lib/actions/billing.ts`

**Interfaces:**
- Consumes: `getStripe` (Task 3), `priceIdFor`/`MIN_SEATS` (Task 2), `createAdminClient`.
- Produces: `createCheckoutSession({ tenantId, planCode, interval, seats }): Promise<{ url: string }>`; `createBillingPortalSession(tenantId): Promise<{ url: string }>`; `attachCustomSubscription({ tenantId, priceId, seats }): Promise<void>`.

- [ ] **Step 1: `createCheckoutSession`**

```typescript
'use server'
import { getStripe } from '@/lib/stripe'
import { priceIdFor, MIN_SEATS, type Interval, type PlanCode } from '@/lib/billing-config'
import { createAdminClient } from '@/utils/supabase/admin'
import { getBaseUrl } from '@/lib/urls' // helper existente o process.env.NEXT_PUBLIC_SITE_URL

export async function createCheckoutSession(args: {
  tenantId: string; planCode: Exclude<PlanCode,'custom'>; interval: Interval; seats: number
}): Promise<{ url: string }> {
  const { tenantId, planCode, interval, seats } = args
  if (seats < MIN_SEATS) throw new Error(`Mínimo ${MIN_SEATS} asientos`)
  const stripe = getStripe()
  const admin = createAdminClient()

  const { data: c } = await admin.from('companies')
    .select('id, name, trial_status, stripe_customer_id').eq('id', tenantId).single()
  if (!c) throw new Error('Tenant no encontrado')

  // reusar o crear el customer
  let customerId = c.stripe_customer_id
  if (!customerId) {
    const customer = await stripe.customers.create({ name: c.name ?? undefined, metadata: { tenant_id: tenantId } })
    customerId = customer.id
    await admin.from('companies').update({ stripe_customer_id: customerId }).eq('id', tenantId)
  }

  const base = getBaseUrl()
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    client_reference_id: tenantId,
    line_items: [{ price: priceIdFor(planCode, interval), quantity: seats }],
    subscription_data: { metadata: { tenant_id: tenantId } },
    success_url: `${base}/suscribir/gracias?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/suscribir?cancelado=1`,
  })
  if (!session.url) throw new Error('Stripe no devolvió URL')
  return { url: session.url }
}
```

- [ ] **Step 2: `createBillingPortalSession` y `attachCustomSubscription`**

```typescript
export async function createBillingPortalSession(tenantId: string): Promise<{ url: string }> {
  const stripe = getStripe(); const admin = createAdminClient()
  const { data: c } = await admin.from('companies').select('stripe_customer_id').eq('id', tenantId).single()
  if (!c?.stripe_customer_id) throw new Error('Sin customer de Stripe')
  const s = await stripe.billingPortal.sessions.create({
    customer: c.stripe_customer_id, return_url: `${getBaseUrl()}/facturacion`,
  })
  return { url: s.url }
}

// Alta CUSTOM (1.2 / §3.3 del spec): crea la suscripción con un price ad-hoc y deja que el webhook convierta.
export async function attachCustomSubscription(args: { tenantId: string; priceId: string; seats: number }): Promise<void> {
  const stripe = getStripe(); const admin = createAdminClient()
  const { data: c } = await admin.from('companies').select('stripe_customer_id').eq('id', args.tenantId).single()
  if (!c?.stripe_customer_id) throw new Error('Sin customer de Stripe')
  await stripe.subscriptions.create({
    customer: c.stripe_customer_id,
    items: [{ price: args.priceId, quantity: args.seats }],
    metadata: { tenant_id: args.tenantId, plan_code: 'custom' },
  })
}
```

> Guard: estas actions solo las puede invocar el admin del tenant o SuperAdmin. Reusar el helper de autorización existente del repo antes del cuerpo.

- [ ] **Step 3: Typecheck + commit**

Run: `npm run build`  Expected: PASS.
```bash
git add lib/actions/billing.ts && git commit -m "feat(billing): checkout, customer portal y alta custom"
```

---

## Task 6: Webhook idempotente (fuente de verdad de la conversión)

**Files:**
- Create: `app/api/stripe/webhook/route.ts`

**Interfaces:**
- Consumes: `getStripe`, `createAdminClient`, `convertTrial` (A, opcional), `sendTelegram` (B, fallback no-op si aún no existe).
- Produces: efecto lateral — espeja el estado de la suscripción en `companies` y convierte trials.

- [ ] **Step 1: Verificar firma + idempotencia + despacho**

```typescript
// app/api/stripe/webhook/route.ts
import { getStripe } from '@/lib/stripe'
import { createAdminClient } from '@/utils/supabase/admin'

export async function POST(req: Request) {
  const stripe = getStripe()
  const sig = req.headers.get('stripe-signature')
  const body = await req.text()
  let event
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig!, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (e) {
    return new Response(`firma inválida: ${(e as Error).message}`, { status: 400 })
  }

  const admin = createAdminClient()
  // Idempotencia: intentar registrar el evento; si ya existe, salir 200.
  const { error: dupErr } = await admin.from('billing_events')
    .insert({ stripe_event_id: event.id, type: event.type, payload: event as unknown as Record<string, unknown> })
  if (dupErr) {
    if ((dupErr as { code?: string }).code === '23505') return Response.json({ received: true, duplicate: true })
    throw dupErr
  }

  switch (event.type) {
    case 'checkout.session.completed':      await onCheckoutCompleted(admin, stripe, event); break
    case 'customer.subscription.updated':   await onSubUpdated(admin, event);   break
    case 'customer.subscription.deleted':   await onSubDeleted(admin, event);   break
    case 'invoice.payment_failed':          await onInvoiceFailed(admin, event); break
    case 'invoice.payment_succeeded':       await onInvoicePaid(admin, event);  break
  }
  return Response.json({ received: true })
}
```

- [ ] **Step 2: Handlers (espejo de estado + conversión)**

```typescript
async function onCheckoutCompleted(admin, stripe, event) {
  const session = event.data.object
  const tenantId = session.client_reference_id
  const sub = await stripe.subscriptions.retrieve(session.subscription)
  const item = sub.items.data[0]
  const planCode = item.price.metadata.plan_code ?? 'standard'
  const interval = item.price.metadata.interval_code ?? 'monthly'
  await admin.from('companies').update({
    trial_status: 'converted',
    trial_active_until: null, trial_decision_until: null, trial_delete_at: null,
    plan_code: planCode, billing_interval: interval, seats_paid: item.quantity,
    stripe_customer_id: sub.customer, stripe_subscription_id: sub.id,
    subscription_status: 'active',
    current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
    onboarding_paid_status: 'pending',   // dispara D (columna de su migración; puede no existir aún → ver nota)
  }).eq('id', tenantId)
  // correo bienvenida pago + alerta Telegram (fallback: log si sendTelegram no existe todavía)
}

async function onSubUpdated(admin, event) {
  const sub = event.data.object; const item = sub.items.data[0]
  await admin.from('companies').update({
    seats_paid: item.quantity,
    subscription_status: sub.status,
    current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
    plan_code: item.price.metadata.plan_code ?? undefined,
  }).eq('stripe_subscription_id', sub.id)
}
async function onSubDeleted(admin, event) {
  await admin.from('companies').update({ subscription_status: 'canceled' })
    .eq('stripe_subscription_id', event.data.object.id)  // acceso hasta current_period_end; NO borrar datos
}
async function onInvoiceFailed(admin, event) {
  await admin.from('companies').update({ subscription_status: 'past_due' })
    .eq('stripe_customer_id', event.data.object.customer)
}
async function onInvoicePaid(admin, event) {
  const inv = event.data.object
  await admin.from('companies').update({
    subscription_status: 'active',
    current_period_end: inv.lines?.data?.[0]?.period?.end ? new Date(inv.lines.data[0].period.end * 1000).toISOString() : undefined,
  }).eq('stripe_customer_id', inv.customer)
}
```

> **Nota de orden con D:** `onboarding_paid_status='pending'` requiere la columna de la migración de D. Si C se implementa antes que D, quitar ese campo del update aquí y agregarlo cuando D exista (o incluir la columna en la migración de C). Decidir al ejecutar; documentarlo.

- [ ] **Step 3: Probar con Stripe CLI contra TEST/local**

Run: `stripe listen --forward-to localhost:3000/api/stripe/webhook` y en otra terminal `stripe trigger checkout.session.completed`.
Expected: 200; en la BD TEST el tenant de prueba pasa a `converted` con `plan_code`/`seats_paid`; un segundo envío del mismo evento responde `duplicate: true` (idempotencia).

- [ ] **Step 4: Commit**

```bash
git add app/api/stripe/webhook/route.ts && git commit -m "feat(billing): webhook idempotente que convierte trials"
```

---

## Task 7: Cuotas por plan (enforcement en un punto)

**Files:**
- Create: `lib/billing-quota.ts`
- Modify: `lib/actions/usuarios.ts` (confirmar el archivo real del alta de usuarios en el repo)

**Interfaces:**
- Consumes: `createAdminClient`.
- Produces: `class SeatLimitError`; `assertSeatAvailable(tenantId): Promise<void>`; `hasBranding(company): boolean`.

- [ ] **Step 1: Escribir el módulo**

```typescript
// lib/billing-quota.ts
import { createAdminClient } from '@/utils/supabase/admin'

export class SeatLimitError extends Error {
  constructor(public seats: number) { super(`Alcanzaste tus ${seats} asientos`) ; this.name = 'SeatLimitError' }
}

export async function assertSeatAvailable(tenantId: string): Promise<void> {
  const admin = createAdminClient()
  const { data: c } = await admin.from('companies')
    .select('plan_code, seats_paid, trial_status').eq('id', tenantId).single()
  if (!c?.plan_code || c.trial_status !== 'converted') return   // trial o legacy => sin límite
  const { count } = await admin.from('profiles')                // ajustar a la tabla real de usuarios activos
    .select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('activo', true)
  if ((count ?? 0) >= (c.seats_paid ?? 0)) throw new SeatLimitError(c.seats_paid ?? 0)
}

export function hasBranding(company: { plan_code?: string | null }): boolean {
  return company.plan_code === 'own_brand' || company.plan_code === 'custom'
}
```

> Confirmar contra `types/supabase.ts` la tabla y el flag de "usuario activo" (¿`profiles.activo`? ¿estado?). Ajustar la query antes de dar por buena.

- [ ] **Step 2: Enganchar en el alta de usuario**

En la server action que crea/activa un usuario, al inicio: `await assertSeatAvailable(tenantId)`. En la UI, capturar `SeatLimitError` y mostrar el upsell con link a `/facturacion`.

- [ ] **Step 3: Verificación manual + typecheck + commit**

Run: `npm run build`  Expected: PASS. En TEST: tenant `converted` con `seats_paid=1` y 1 usuario activo → alta de otro usuario lanza `SeatLimitError`; un tenant en trial no bloquea.
```bash
git add lib/billing-quota.ts lib/actions/usuarios.ts
git commit -m "feat(billing): cuota por asientos con enforcement unico"
```

---

## Task 8: UI de suscripción (`/suscribir` + gracias)

**Files:**
- Create: `app/(dashboard)/suscribir/page.tsx`
- Create: `app/(dashboard)/suscribir/gracias/page.tsx`
- Create: `components/billing/plan-selector.tsx`

**Interfaces:**
- Consumes: `quote`, `PLANS`, `MIN_SEATS` (Task 2); `createCheckoutSession` (Task 5).

- [ ] **Step 1: `plan-selector.tsx`** — selección de plan (STANDARD/OWN BRAND), toggle de periodicidad (mensual/semestral/anual), input de asientos (default = usuarios actuales, mínimo `MIN_SEATS`). Muestra en vivo `quote(...)`: total del cobro, equivalente anual y **badge "Ahorras $X/año (Y%)"** en semestral/anual. Botón "Pagar" → `createCheckoutSession` → `window.location = url`.
- [ ] **Step 2: `page.tsx`** (server component) — carga tenant + nº usuarios actuales, renderiza `<PlanSelector>`. Guard: solo admin del tenant.
- [ ] **Step 3: `gracias/page.tsx`** — mensaje de éxito + CTA a la barra de onboarding post-pago (D). Nota: el estado real ya lo puso el webhook; esta página no convierte.
- [ ] **Step 4: Typecheck + verificación manual + commit**

Run: `npm run build`  Expected: PASS. Abrir `/suscribir` → cambiar a anual con 10 asientos → badge muestra "Ahorras $719.76/año (20%)".
```bash
git add "app/(dashboard)/suscribir" components/billing/plan-selector.tsx
git commit -m "feat(billing): pagina de suscripcion con badge de ahorro"
```

---

## Task 9: UI de facturación (`/facturacion` + Customer Portal)

**Files:**
- Create: `app/(dashboard)/facturacion/page.tsx`
- Create: `components/billing/estado-suscripcion.tsx`

**Interfaces:**
- Consumes: `createBillingPortalSession` (Task 5); datos de `companies`.

- [ ] **Step 1: `page.tsx`** (server) — carga plan, `seats_paid`, `billing_interval`, `subscription_status`, `current_period_end`; renderiza estado + **ahorro acumulado del ciclo** (usa `quote`). Botón "Gestionar suscripción" → `createBillingPortalSession` → redirect.
- [ ] **Step 2: Banner past_due** — si `subscription_status='past_due'`, aviso persistente "Tu pago falló, actualiza tu tarjeta" con link al portal.
- [ ] **Step 3: Typecheck + verificación manual + commit**

Run: `npm run build`  Expected: PASS.
```bash
git add "app/(dashboard)/facturacion/page.tsx" components/billing/estado-suscripcion.tsx
git commit -m "feat(billing): pagina de facturacion + portal"
```

---

## Task 10: Integración en la vista SuperAdmin

**Files:**
- Modify: `components/sistema/onboarding/trials-table.tsx`

- [ ] **Step 1: Columnas** Plan · Asientos · Estado suscripción · Próximo cobro, junto a las columnas de fase de A. Para `converted`, mostrar el plan/asientos; para trials, la fase.
- [ ] **Step 2: (opcional) Botón "Alta CUSTOM"** que invoca `attachCustomSubscription` (SuperAdmin), pidiendo priceId + asientos.
- [ ] **Step 3: Typecheck + commit**

Run: `npm run build`  Expected: PASS.
```bash
git add components/sistema/onboarding/trials-table.tsx
git commit -m "feat(billing): columnas de plan/suscripcion en vista SuperAdmin"
```

---

## Self-Review (cobertura vs spec)

- §1 catálogo/precios + ahorro → Task 2 (cálculo) + Task 4 (Stripe) + Task 8 (badge). ✅
- §2 datos → Task 1. ✅
- §3 flujos (conversión/portal/custom) → Task 5 (actions) + Task 8 (UI) + Task 6 (webhook convierte). ✅
- §4 webhooks + idempotencia → Task 6. ✅
- §5 cuotas → Task 7. ✅
- §6 UI in-app → Task 8 + Task 9 + Task 10. ✅
- §7 seguridad (firma, idempotencia, secrets, guards) → Task 6 + Task 5 + Task 4. ✅
- §8 archivos → cubiertos.
- **Dependencia con D:** el campo `onboarding_paid_status='pending'` en el webhook necesita la migración de D (Task 6 Step 2 lo documenta; decidir orden al ejecutar).
- **Dependencia con B:** `sendTelegram` para la alerta "nuevo cliente pago"; fallback log hasta que B exista.
- **Contenido:** copy de badges de ahorro y correos → negocio (fuera de alcance).
