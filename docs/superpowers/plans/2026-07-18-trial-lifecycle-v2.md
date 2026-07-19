# Trial Lifecycle v2 (Sub-proyecto A) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Evolucionar el trial self-service de 10 días a un ciclo de vida de leads de 25 días (15 ACTIVE + 7 DECISION + 3 WARNING → auto-borrado) con onboarding adaptativo al avance real y un editor de plan para SuperAdmin.

**Architecture:** Single-schema multi-tenant. Un lead es un `companies` con `trial_status`. Un cron diario en Cloudflare avanza fases, envía el correo del día (elegido por avance real, no por calendario), calcula engagement y borra tenants vencidos vía función de BD con guardas. El SuperAdmin edita el plan global (`trial_plan_steps`) desde una página en `/sistema`.

**Tech Stack:** Next.js 16 (App Router, server actions), Supabase (Postgres + RLS + Auth admin API), Cloudflare Workers + Cron Triggers, Resend (email), Telegram Bot API (alertas admin, compartido con sub-proyecto B).

**Spec de referencia:** `docs/superpowers/specs/2026-07-18-trial-lifecycle-v2-design.md`
**Playbook:** `docs/PLAYBOOK-GROWTH-ENGINE.md`

## Global Constraints

- **Estados válidos** `trial_status`: `active` | `decision` | `warning` | `converted` | `NULL`. `NULL` = tenant real, jamás entra al ciclo.
- **Duraciones:** ACTIVE=15d, DECISION=7d, WARNING=3d (constantes en `lib/trial-config.ts`).
- **Tenants reales intocables:** CISE `1cb97ec7-326c-4376-93ee-ed317d3da51b`, GRUAS `6f4c923a-c3b7-47c2-9dea-2a187f274f73` — excluidos por hardcode del borrado.
- **Secretos server-side jamás en archivos trackeados** — solo secrets del worker Cloudflare (`SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET`, `TELEGRAM_BOT_TOKEN`).
- **Idempotencia del drip:** `trial_emails_log` UNIQUE por `(tenant_id, step_id)`; máximo un correo por lead por día.
- **Verificación:** el repo no tiene runner unitario; verificar cada task con `npm run build` (typecheck estricto obligatorio) + el check manual indicado. Las funciones puras (`lib/trial-plan.ts`, validación del editor) llevan test unitario si se agrega vitest (Task 0, opcional).
- **Migraciones:** aplicar primero en Supabase TEST (`oyrokyyaeaeqzlsgxtto`), luego PROD (`fqwhagryqkkhbgznxtwf`). Regenerar tipos con `npm run types:supabase` tras cada migración.

---

## File Structure

| Archivo | Responsabilidad |
|---------|-----------------|
| `supabase/migrations/20260718_trial_lifecycle_v2.sql` | Columnas de fase, tablas nuevas, constraint, `delete_lead_tenant()` |
| `lib/trial-config.ts` | Constantes de duración + ponderación de engagement + IDs de tenants reales |
| `lib/trial-plan.ts` | Motor adaptativo puro: `selectDailyStep()` |
| `lib/trial-progress.ts` | Detección de avance real (queries por `completion_signal`) |
| `lib/actions/trial.ts` | (modif) alta con fechas de fase; `advancePhase`, `computeEngagement`, `convertTrial` |
| `lib/actions/trial-plan-admin.ts` | Server actions del editor: `savePlanStep`, `validatePlan`, `publishPlan` |
| `lib/trial-email-templates.ts` | (modif) templates por fase + framing (al día/adelantado/atrasado) |
| `app/api/cron/trial-lifecycle/route.ts` | Cron único diario |
| `utils/supabase/middleware.ts` | (modif) expone fase a la UI (sin bloqueo) |
| `components/sistema/onboarding/trials-table.tsx` | (modif) fase, engagement, acciones |
| `app/(dashboard)/sistema/plan-onboarding/page.tsx` | Página editor (SuperAdmin) |
| `components/sistema/plan/plan-editor.tsx` | UI CRUD + validación + preview + simulador |
| `wrangler.live.toml` | (modif) Cron Trigger |

---

## Task 1: Migración de BD (schema + función de borrado)

**Files:**
- Create: `supabase/migrations/20260718_trial_lifecycle_v2.sql`
- Modify (regen): `types/supabase.ts`

**Interfaces:**
- Produces: columnas `companies.trial_active_until|trial_decision_until|trial_delete_at|engagement_score|engagement_alerted_at`; tablas `trial_plan_steps`, `trial_module_progress`, `trial_deletions_log`; función `delete_lead_tenant(uuid)`; `trial_status` CHECK ampliado; `trial_emails_log.step_id`.

- [ ] **Step 1: Escribir la migración**

```sql
-- 20260718_trial_lifecycle_v2.sql

-- 1. Columnas de fase + engagement en companies
ALTER TABLE companies
    ADD COLUMN IF NOT EXISTS trial_active_until    TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS trial_decision_until  TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS trial_delete_at       TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS engagement_score      INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS engagement_alerted_at TIMESTAMPTZ;

-- 2. Migrar datos existentes: trial_expires_at -> trial_active_until; expired -> decision
UPDATE companies SET trial_active_until = trial_expires_at
    WHERE trial_expires_at IS NOT NULL AND trial_active_until IS NULL;
UPDATE companies SET trial_status = 'decision' WHERE trial_status = 'expired';

-- 3. Ampliar CHECK
ALTER TABLE companies DROP CONSTRAINT IF EXISTS companies_trial_status_check;
ALTER TABLE companies ADD CONSTRAINT companies_trial_status_check
    CHECK (trial_status IS NULL OR trial_status IN
           ('active','decision','warning','converted'));

-- 4. Plan global
CREATE TABLE IF NOT EXISTS trial_plan_steps (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tier              TEXT NOT NULL CHECK (tier IN ('core','advanced')),
    day               INT  NOT NULL,
    module_key        TEXT NOT NULL,
    title             TEXT NOT NULL,
    body              TEXT NOT NULL,
    cta_label         TEXT NOT NULL,
    cta_path          TEXT NOT NULL,
    completion_signal TEXT NOT NULL,
    status            TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
    UNIQUE (tier, day)
);
ALTER TABLE trial_plan_steps ENABLE ROW LEVEL SECURITY;
-- Lectura solo SuperAdmin / escritura solo service_role (ver Task 10).

-- 5. Avance real por lead
CREATE TABLE IF NOT EXISTS trial_module_progress (
    tenant_id    UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    module_key   TEXT NOT NULL,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (tenant_id, module_key)
);
ALTER TABLE trial_module_progress ENABLE ROW LEVEL SECURITY;

-- 6. Idempotencia del drip por paso
ALTER TABLE trial_emails_log ADD COLUMN IF NOT EXISTS step_id UUID REFERENCES trial_plan_steps(id);
-- (nuevas filas usan step_id; se mantiene la columna dia por compatibilidad)
CREATE UNIQUE INDEX IF NOT EXISTS trial_emails_log_step_unique
    ON trial_emails_log (tenant_id, step_id) WHERE step_id IS NOT NULL;

-- 7. Auditoría de borrados
CREATE TABLE IF NOT EXISTS trial_deletions_log (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id    UUID NOT NULL,
    company_name TEXT,
    admin_email  TEXT,
    counts       JSONB,
    deleted_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Función de borrado seguro con guardas
CREATE OR REPLACE FUNCTION delete_lead_tenant(p_tenant_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $fn$
DECLARE
    v_status TEXT;
    v_name   TEXT;
    v_counts JSONB;
BEGIN
    SELECT trial_status, name INTO v_status, v_name FROM companies WHERE id = p_tenant_id;

    -- Guarda 1: solo en fase warning
    IF v_status IS DISTINCT FROM 'warning' THEN
        RAISE EXCEPTION 'delete_lead_tenant abortado: tenant % no esta en warning (status=%)', p_tenant_id, v_status;
    END IF;

    -- Guarda 2: nunca tocar tenants reales
    IF p_tenant_id IN ('1cb97ec7-326c-4376-93ee-ed317d3da51b','6f4c923a-c3b7-47c2-9dea-2a187f274f73') THEN
        RAISE EXCEPTION 'delete_lead_tenant abortado: tenant real protegido %', p_tenant_id;
    END IF;

    -- Conteos para auditoria (ajustar tablas segun esquema real)
    SELECT jsonb_build_object(
        'reportes',    (SELECT count(*) FROM reportes    WHERE tenant_id = p_tenant_id),
        'tareas',      (SELECT count(*) FROM tareas       WHERE tenant_id = p_tenant_id),
        'maquinarias', (SELECT count(*) FROM maquinarias  WHERE tenant_id = p_tenant_id)
    ) INTO v_counts;

    INSERT INTO trial_deletions_log (tenant_id, company_name, counts)
    VALUES (p_tenant_id, v_name, v_counts);

    -- Borrado. Preferir ON DELETE CASCADE desde companies; si alguna tabla no
    -- cascada, borrar aqui en orden de dependencias ANTES del DELETE de companies.
    DELETE FROM companies WHERE id = p_tenant_id;
END;
$fn$;
```

- [ ] **Step 2: Verificar las FK cascada antes de confiar en el DELETE**

Run (Supabase SQL editor, TEST): consultar qué tablas referencian `companies(id)` y con qué `ON DELETE`:
```sql
SELECT tc.table_name, rc.delete_rule
FROM information_schema.referential_constraints rc
JOIN information_schema.table_constraints tc ON tc.constraint_name = rc.constraint_name
JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = rc.constraint_name
WHERE ccu.table_name = 'companies';
```
Expected: listar cada tabla. Para las que NO tengan `CASCADE`, agregar `DELETE FROM <tabla> WHERE tenant_id = p_tenant_id;` en la función antes del `DELETE FROM companies` (orden hijos→padres).

- [ ] **Step 3: Aplicar en TEST y probar las guardas**

Run (TEST): crear un tenant dummy en `warning`, ejecutar `SELECT delete_lead_tenant('<id>')` → OK; ejecutar sobre un tenant `active` → debe RAISE; ejecutar sobre CISE → debe RAISE.
Expected: primer caso borra + fila en `trial_deletions_log`; los otros dos abortan con excepción.

- [ ] **Step 4: Regenerar tipos**

Run: `npm run types:supabase`
Expected: `types/supabase.ts` incluye las nuevas tablas/columnas.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260718_trial_lifecycle_v2.sql types/supabase.ts
git commit -m "feat(trial-v2): migracion ciclo de vida + delete_lead_tenant con guardas"
```

---

## Task 2: Configuración y constantes

**Files:**
- Create: `lib/trial-config.ts`

**Interfaces:**
- Produces: `TRIAL_DURATIONS = { ACTIVE_DAYS:15, DECISION_DAYS:7, WARNING_DAYS:3 }`; `REAL_TENANT_IDS: string[]`; `ENGAGEMENT_WEIGHTS`, `ENGAGEMENT_HOT_THRESHOLD`; `computePhaseDates(startISO): { activeUntil, decisionUntil, deleteAt }`.

- [ ] **Step 1: Escribir el módulo**

```typescript
// lib/trial-config.ts
export const TRIAL_DURATIONS = { ACTIVE_DAYS: 15, DECISION_DAYS: 7, WARNING_DAYS: 3 } as const

export const REAL_TENANT_IDS = [
  '1cb97ec7-326c-4376-93ee-ed317d3da51b', // CISE
  '6f4c923a-c3b7-47c2-9dea-2a187f274f73', // GRUAS
] as const

export const ENGAGEMENT_WEIGHTS = { login: 1, tarea: 3, reporte: 5, valorizacion: 5 } as const
export const ENGAGEMENT_HOT_THRESHOLD = 25

const DAY_MS = 24 * 60 * 60 * 1000
export function computePhaseDates(startISO: string) {
  const start = new Date(startISO).getTime()
  const activeUntil   = new Date(start + TRIAL_DURATIONS.ACTIVE_DAYS * DAY_MS)
  const decisionUntil = new Date(activeUntil.getTime() + TRIAL_DURATIONS.DECISION_DAYS * DAY_MS)
  const deleteAt      = new Date(decisionUntil.getTime() + TRIAL_DURATIONS.WARNING_DAYS * DAY_MS)
  return {
    activeUntil:   activeUntil.toISOString(),
    decisionUntil: decisionUntil.toISOString(),
    deleteAt:      deleteAt.toISOString(),
  }
}
```

- [ ] **Step 2: Typecheck + commit**

Run: `npm run build`  Expected: PASS.
```bash
git add lib/trial-config.ts && git commit -m "feat(trial-v2): constantes y fechas de fase"
```

---

## Task 3: Motor adaptativo (función pura)

**Files:**
- Create: `lib/trial-plan.ts`

**Interfaces:**
- Consumes: tipo `PlanStep = { id, tier, day, module_key, ... }` (forma de `trial_plan_steps`).
- Produces: `selectDailyStep({ expectedDay, coreSteps, advancedSteps, completedModules, sentStepIds }): { step: PlanStep, framing: 'normal'|'behind'|'ahead'|'advanced', pendingDays: number[] } | null`

- [ ] **Step 1: Escribir el motor (§3.2 del spec)**

```typescript
// lib/trial-plan.ts
export interface PlanStep {
  id: string; tier: 'core' | 'advanced'; day: number
  module_key: string; title: string; body: string
  cta_label: string; cta_path: string; completion_signal: string
}
export type Framing = 'normal' | 'behind' | 'ahead' | 'advanced'
export interface DailyPick { step: PlanStep; framing: Framing; pendingDays: number[] }

export function selectDailyStep(args: {
  expectedDay: number
  coreSteps: PlanStep[]      // ordenados por day
  advancedSteps: PlanStep[]  // ordenados por day
  completedModules: Set<string>
  sentStepIds: Set<string>
}): DailyPick | null {
  const { expectedDay, coreSteps, advancedSteps, completedModules, sentStepIds } = args
  const done = (s: PlanStep) => completedModules.has(s.module_key)
  const notSent = (s: PlanStep) => !sentStepIds.has(s.id)

  const allCoreDone = coreSteps.every(done)
  if (allCoreDone) {
    const next = advancedSteps.find(notSent)
    return next ? { step: next, framing: 'advanced', pendingDays: [] } : null
  }

  const stepOfDay = coreSteps.find(s => s.day === expectedDay)
  const pendingDays = coreSteps.filter(s => s.day < expectedDay && !done(s)).map(s => s.day)

  // CASO C — adelantado: ya hizo el módulo de hoy → saltar al siguiente pendiente
  if (stepOfDay && done(stepOfDay)) {
    const next = coreSteps.find(s => !done(s) && notSent(s))
    if (next) return { step: next, framing: 'ahead', pendingDays: [] }
    const adv = advancedSteps.find(notSent)
    return adv ? { step: adv, framing: 'advanced', pendingDays: [] } : null
  }

  // CASO A/B — al día o atrasado: mandar el paso del día (si no fue enviado)
  if (stepOfDay && notSent(stepOfDay)) {
    return { step: stepOfDay, framing: pendingDays.length ? 'behind' : 'normal', pendingDays }
  }
  return null // ya enviado / nada que mandar hoy
}
```

- [ ] **Step 2: (si se agrega vitest) test de los 4 ritmos**

Casos: al día (normal), día 2 con módulos 3-4 hechos → ahead + salta a 5, atrasado → behind + pendingDays, core completo → advanced. Si no hay runner, verificar con el simulador de Task 11.

- [ ] **Step 3: Typecheck + commit**

Run: `npm run build`  Expected: PASS.
```bash
git add lib/trial-plan.ts && git commit -m "feat(trial-v2): motor adaptativo selectDailyStep"
```

---

## Task 4: Detección de avance real

**Files:**
- Create: `lib/trial-progress.ts`

**Interfaces:**
- Consumes: `createAdminClient` (`utils/supabase/admin`).
- Produces: `detectCompletedModules(tenantId): Promise<string[]>` — devuelve los `module_key` que el tenant ya usó, según un mapa señal→query.

- [ ] **Step 1: Escribir el detector**

```typescript
// lib/trial-progress.ts
import { createAdminClient } from '@/utils/supabase/admin'

// Mapa completion_signal -> tabla a contar. Ampliable desde el catálogo del editor.
const SIGNAL_TABLE: Record<string, string> = {
  tarea_creada:        'tareas',
  reporte_creado:      'reportes',
  maquinaria_creada:   'maquinarias',
  tercero_creado:      'terceros',
  valorizacion_creada: 'valorizaciones',
}

export async function detectCompletedModules(tenantId: string): Promise<string[]> {
  const admin = createAdminClient()
  const completed: string[] = []
  for (const [signal, table] of Object.entries(SIGNAL_TABLE)) {
    const { count } = await admin.from(table).select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId)
    if ((count ?? 0) > 0) completed.push(signal)
  }
  return completed
}
```

> Nota: el `module_key` del plan debe coincidir con el `completion_signal`, o mapear señal→módulo. Confirmar nombres reales de tablas (`valorizaciones`, `terceros`) contra `types/supabase.ts` antes de dar por buena esta lista.

- [ ] **Step 2: Verificar nombres de tabla + typecheck + commit**

Run: `npm run build`  Expected: PASS.
```bash
git add lib/trial-progress.ts && git commit -m "feat(trial-v2): deteccion de avance real por senal"
```

---

## Task 5: Actualizar server actions del trial

**Files:**
- Modify: `lib/actions/trial.ts`

**Interfaces:**
- Consumes: `computePhaseDates` (Task 2).
- Produces: alta con `trial_status='active'` + 3 fechas de fase; `advancePhase(tenantId): Promise<void>`; `computeEngagement(tenantId): Promise<number>`; `convertTrial` (setea `converted` + fechas a null).

- [ ] **Step 1: Alta con fechas de fase**

En `registerTrial`, reemplazar el cálculo de `trialExpiry` por:
```typescript
import { computePhaseDates } from '@/lib/trial-config'
// ...
const now = new Date().toISOString()
const { activeUntil, decisionUntil, deleteAt } = computePhaseDates(now)
// en el insert de companies:
//   trial_status: 'active', trial_start_at: now,
//   trial_active_until: activeUntil, trial_decision_until: decisionUntil, trial_delete_at: deleteAt,
```

- [ ] **Step 2: `advancePhase` y `computeEngagement`**

```typescript
export async function advancePhase(tenantId: string): Promise<void> {
  const admin = createAdminClient()
  const { data: c } = await admin.from('companies')
    .select('trial_status, trial_active_until, trial_decision_until')
    .eq('id', tenantId).single()
  if (!c || !c.trial_status) return
  const now = Date.now()
  let next = c.trial_status
  if (c.trial_status === 'active'   && c.trial_active_until   && now > Date.parse(c.trial_active_until))   next = 'decision'
  if (c.trial_status === 'decision' && c.trial_decision_until && now > Date.parse(c.trial_decision_until)) next = 'warning'
  if (next !== c.trial_status) await admin.from('companies').update({ trial_status: next }).eq('id', tenantId)
}

export async function computeEngagement(tenantId: string): Promise<number> {
  const admin = createAdminClient()
  const q = (t: string) => admin.from(t).select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId)
  const [tareas, reportes, valor] = await Promise.all([q('tareas'), q('reportes'), q('valorizaciones')])
  const score = (tareas.count ?? 0) * 3 + (reportes.count ?? 0) * 5 + (valor.count ?? 0) * 5
  await admin.from('companies').update({ engagement_score: score }).eq('id', tenantId)
  return score
}
```

- [ ] **Step 3: `convertTrial` limpia fechas de borrado**

Actualizar el update existente para incluir `trial_active_until: null, trial_decision_until: null, trial_delete_at: null` junto a `trial_status: 'converted'`.

- [ ] **Step 4: Typecheck + commit**

Run: `npm run build`  Expected: PASS.
```bash
git add lib/actions/trial.ts && git commit -m "feat(trial-v2): fases en alta, advancePhase y computeEngagement"
```

---

## Task 6: Templates de correo por fase + framing

**Files:**
- Modify: `lib/trial-email-templates.ts`

**Interfaces:**
- Consumes: `PlanStep`, `Framing` (Task 3).
- Produces: `renderPlanEmail({ step, framing, pendingDays, adminName, companyName, daysLeftInPhase }): { subject, html }`; `renderWarningEmail({ daysToDelete, ... })`.

- [ ] **Step 1: Render con framing + interpolación de placeholders**

```typescript
export function renderPlanEmail(args: {
  step: PlanStep; framing: Framing; pendingDays: number[]
  adminName: string; companyName: string; daysLeftInPhase: number
}): { subject: string; html: string } {
  const { step, framing, pendingDays, adminName, companyName, daysLeftInPhase } = args
  const interp = (t: string) => t
    .replaceAll('{nombre}', adminName)
    .replaceAll('{empresa}', companyName)
    .replaceAll('{modulo}', step.module_key)
    .replaceAll('{dias_restantes_fase}', String(daysLeftInPhase))
  const intro =
    framing === 'ahead'    ? `<p>¡Vas rápido, ${adminName}! Ya adelantaste varios módulos. 🚀</p>`
    : framing === 'behind' ? `<p>Tenés pendientes los días ${pendingDays.join(', ')}. El plan de hoy:</p>`
    : framing === 'advanced' ? `<p>¡Completaste el plan! Acá va una tarea avanzada:</p>`
    : ''
  const subject = interp(step.title)
  const html = `${intro}<h2>${interp(step.title)}</h2><p>${interp(step.body)}</p>
    <a href="${step.cta_path}">${step.cta_label}</a>`
  return { subject, html }
}
```

- [ ] **Step 2: `renderWarningEmail` (fase WARNING)** — mensaje "borraremos en {daysToDelete} días", CTA a pago. (Escribir análogo al anterior.)

- [ ] **Step 3: Typecheck + commit**

Run: `npm run build`  Expected: PASS.
```bash
git add lib/trial-email-templates.ts && git commit -m "feat(trial-v2): templates por fase con framing"
```

---

## Task 7: Cron diario `trial-lifecycle`

**Files:**
- Create: `app/api/cron/trial-lifecycle/route.ts`

**Interfaces:**
- Consumes: `advancePhase`, `computeEngagement`, `detectCompletedModules`, `selectDailyStep`, `renderPlanEmail`/`renderWarningEmail`, `delete_lead_tenant` (RPC), `sendEmail`, Telegram sender (Task de sub-proyecto B; fallback email).

- [ ] **Step 1: Escribir la ruta protegida por CRON_SECRET**

Estructura (orden del §6 del spec), por cada company con `trial_status IN ('active','decision','warning')`:
```typescript
export async function GET(req: Request) {
  const secret = new URL(req.url).searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) return new Response('unauthorized', { status: 401 })
  const admin = createAdminClient()
  const { data: leads } = await admin.from('companies')
    .select('id, name, trial_status, trial_start_at, trial_active_until, trial_decision_until, trial_delete_at, engagement_score, engagement_alerted_at')
    .in('trial_status', ['active','decision','warning'])

  for (const lead of leads ?? []) {
    // 1. avance real
    const completed = await detectCompletedModules(lead.id)
    for (const sig of completed) {
      await admin.from('trial_module_progress').upsert({ tenant_id: lead.id, module_key: sig }, { onConflict: 'tenant_id,module_key', ignoreDuplicates: true })
    }
    // 2. avanzar fase
    await advancePhase(lead.id)
    // 3. correo del día (ACTIVE/DECISION via selectDailyStep; WARNING via renderWarningEmail)
    //    - cargar coreSteps/advancedSteps published, sentStepIds de trial_emails_log
    //    - expectedDay = clamp(daysSince(trial_start_at),1,15)
    //    - si pick != null: enviar, insertar trial_emails_log(tenant_id, step_id)
    // 4. engagement + alerta Telegram si score>=THRESHOLD y engagement_alerted_at IS NULL
    // 5. si status recalculado = 'warning' y trial_delete_at < now: rpc delete_lead_tenant + borrar auth users
  }
  return Response.json({ ok: true, processed: leads?.length ?? 0 })
}
```

- [ ] **Step 2: Implementar los pasos 3-5 con el código completo** (cargar pasos, llamar `selectDailyStep`, `sendEmail`, `admin.rpc('delete_lead_tenant', { p_tenant_id })`, `admin.auth.admin.deleteUser` para cada usuario del tenant antes del RPC si auth no cascada).

- [ ] **Step 3: Probar localmente contra TEST**

Run: `curl "http://localhost:3000/api/cron/trial-lifecycle?secret=$CRON_SECRET"`
Expected: `{ ok: true, processed: N }`; verificar en TEST que se insertó `trial_emails_log` y avanzó fase de un lead de prueba.

- [ ] **Step 4: Commit**

```bash
git add app/api/cron/trial-lifecycle/route.ts && git commit -m "feat(trial-v2): cron diario de ciclo de vida"
```

---

## Task 8: Cron Trigger en Cloudflare

**Files:**
- Modify: `wrangler.live.toml`

- [ ] **Step 1: Agregar trigger** (~06:00 America/Lima = 11:00 UTC)

```toml
[triggers]
crons = ["0 11 * * *"]
```

- [ ] **Step 2: Verificar que el handler del worker enruta el cron a `/api/cron/trial-lifecycle`** (OpenNext: usar `scheduled` handler o fetch interno con el secret). Documentar el mecanismo elegido en el TECHNICAL_DEBTS (migración de crons).

- [ ] **Step 3: Commit**

```bash
git add wrangler.live.toml && git commit -m "feat(trial-v2): cron trigger cloudflare"
```

---

## Task 9: Middleware expone la fase a la UI

**Files:**
- Modify: `utils/supabase/middleware.ts`

- [ ] **Step 1: Leer fase y setear header/cookie (sin bloquear)**

Después de autenticar, si `profile.tenant_id`: leer `trial_status` + fechas; setear response header `x-trial-phase` y `x-trial-days-left` para que la UI muestre banner/countdown. **No** redirigir ni bloquear escrituras.

- [ ] **Step 2: Typecheck + verificación manual + commit**

Run: `npm run build`  Expected: PASS. Login como lead → confirmar header presente.
```bash
git add utils/supabase/middleware.ts && git commit -m "feat(trial-v2): exponer fase de trial a la UI"
```

---

## Task 10: Server actions del editor de plan

**Files:**
- Create: `lib/actions/trial-plan-admin.ts`

**Interfaces:**
- Produces: `savePlanStep(step)`, `deletePlanStep(id)`, `validatePlan(): { errors: PlanIssue[], warnings: PlanIssue[] }`, `publishPlan(): { ok: boolean, errors? }`. Todas con guard SuperAdmin.

- [ ] **Step 1: Validación pura (reglas §9.5)**

```typescript
export interface PlanIssue { stepId?: string; rule: string; message: string }
const ALLOWED_SIGNALS = ['tarea_creada','reporte_creado','maquinaria_creada','tercero_creado','valorizacion_creada','usuario_invitado','informe_configurado']
const ALLOWED_TOKENS = ['{nombre}','{empresa}','{modulo}','{dia_actual}','{dias_restantes_fase}','{cta}']

export function validatePlanSteps(core: PlanStep[], advanced: PlanStep[]): { errors: PlanIssue[]; warnings: PlanIssue[] } {
  const errors: PlanIssue[] = []; const warnings: PlanIssue[] = []
  const checkSeq = (steps: PlanStep[], n: number, tier: string) => {
    const days = new Set(steps.map(s => s.day))
    for (let d = 1; d <= n; d++) if (!days.has(d)) errors.push({ rule: 'secuencia', message: `Falta el día ${d} en ${tier}` })
    if (days.size !== steps.length) errors.push({ rule: 'secuencia', message: `Días duplicados en ${tier}` })
  }
  checkSeq(core, 15, 'core'); checkSeq(advanced, 7, 'advanced')
  for (const s of [...core, ...advanced]) {
    if (!s.module_key || !s.title || !s.body || !s.cta_label || !s.cta_path || !s.completion_signal)
      errors.push({ stepId: s.id, rule: 'obligatorio', message: `Campos incompletos (día ${s.day})` })
    if (!ALLOWED_SIGNALS.includes(s.completion_signal))
      errors.push({ stepId: s.id, rule: 'senal', message: `Señal inválida: ${s.completion_signal}` })
    for (const tok of (s.title + ' ' + s.body).match(/\{[^}]+\}/g) ?? [])
      if (!ALLOWED_TOKENS.includes(tok)) errors.push({ stepId: s.id, rule: 'placeholder', message: `Placeholder desconocido: ${tok}` })
    if (s.title.length > 60) warnings.push({ stepId: s.id, rule: 'asunto', message: `Asunto largo (${s.title.length})` })
  }
  return { errors, warnings }
}
```

- [ ] **Step 2: `savePlanStep`/`publishPlan` con guard SuperAdmin**

Guard: leer rol del usuario; si != SuperAdmin → throw. `publishPlan`: correr `validatePlanSteps`; si hay errores → devolver sin publicar; si no → `UPDATE trial_plan_steps SET status='published'`.

- [ ] **Step 3: Typecheck + commit**

Run: `npm run build`  Expected: PASS.
```bash
git add lib/actions/trial-plan-admin.ts && git commit -m "feat(trial-v2): server actions + validacion del editor de plan"
```

---

## Task 11: UI del editor de plan (SuperAdmin)

**Files:**
- Create: `app/(dashboard)/sistema/plan-onboarding/page.tsx`
- Create: `components/sistema/plan/plan-editor.tsx`

**Interfaces:**
- Consumes: `savePlanStep`, `validatePlan`, `publishPlan` (Task 10); `selectDailyStep` (Task 3) para el simulador; `renderPlanEmail` (Task 6) para el preview.

- [ ] **Step 1: page.tsx con guard SuperAdmin** (server component: verificar rol, 403 si no; cargar `trial_plan_steps` y pasarlos a `<PlanEditor>`).
- [ ] **Step 2: plan-editor.tsx** — dos pestañas (Core/Avanzado), lista por día, dialog de edición con los 7 campos (§9.2), botón "Validar plan" que muestra errores/warnings, botón "Publicar" (deshabilitado si hay errores), y **preview** del correo usando `renderPlanEmail` con datos de muestra. Seguir el patrón de UI existente (Radix + template v1.2).
- [ ] **Step 3: Simulador (§9.7)** — control que toma un patrón de avance (al día/adelantado/atrasado/terminó) y muestra, día a día, qué `renderPlanEmail` saldría (usa `selectDailyStep`).
- [ ] **Step 4: Typecheck + verificación manual + commit**

Run: `npm run build`  Expected: PASS. Entrar como SuperAdmin a `/sistema/plan-onboarding` → crear pasos, validar (provocar un hueco de día → error), publicar, previsualizar.
```bash
git add "app/(dashboard)/sistema/plan-onboarding/page.tsx" components/sistema/plan/plan-editor.tsx
git commit -m "feat(trial-v2): editor de plan de onboarding (SuperAdmin)"
```

---

## Task 12: Vista admin de Trials (fase + engagement + acciones)

**Files:**
- Modify: `components/sistema/onboarding/trials-table.tsx`

- [ ] **Step 1: Columnas** Fase · Días en fase · Engagement · Módulos completados · Últ. correo · Estado. Derivar "días en fase" de las fechas de fase.
- [ ] **Step 2: Acciones por fila** Extender fase (+N días a la frontera correspondiente) · Convertir (`convertTrial`) · Borrar ahora (forzar `warning` + `advancePhase`/`delete_lead_tenant`, con confirm) · Pausar borrado (`trial_delete_at += 30d`).
- [ ] **Step 3: Typecheck + verificación manual + commit**

Run: `npm run build`  Expected: PASS.
```bash
git add components/sistema/onboarding/trials-table.tsx
git commit -m "feat(trial-v2): tab Trials con fase, engagement y acciones"
```

---

## Task 13: Seed del plan (estructura) + contenido con negocio

**Files:**
- Create: `supabase/seed/trial_plan_steps.sql` (o script) con **15 pasos core + 7 advanced** de ejemplo (módulo, señal, CTA correctos; copy provisional a reemplazar por negocio).

- [ ] **Step 1: Escribir el seed** con los 15+7 pasos usando módulos reales del producto y señales del catálogo.
- [ ] **Step 2: Aplicar en TEST, publicar desde el editor, correr el cron de prueba** → validar el flujo punta a punta con un lead dummy.
- [ ] **Step 3: Commit**

```bash
git add supabase/seed/trial_plan_steps.sql && git commit -m "feat(trial-v2): seed del plan de onboarding (estructura)"
```

---

## Self-Review (cobertura vs spec)

- §1 estados → Task 1 (CHECK), Task 5 (transiciones). ✅
- §2 datos → Task 1. ✅
- §3 motor adaptativo → Task 3 + Task 4 (avance) + Task 7 (orquestación). ✅
- §4 engagement + Telegram → Task 5 (`computeEngagement`) + Task 7 (alerta; envío Telegram = sub-proyecto B, fallback email). ✅ (dependencia cross-proyecto anotada)
- §5 borrado seguro → Task 1 (función) + Task 7 (auth users + RPC). ✅
- §6 cron → Task 7 + Task 8. ✅
- §7 middleware → Task 9. ✅
- §8 vista admin → Task 12. ✅
- §9 editor de plan → Task 10 (acciones/validación) + Task 11 (UI). ✅
- §10 archivos → cubiertos.
- **Gap conocido:** el envío real a Telegram vive en sub-proyecto B; en A el cron usa fallback email hasta que B esté. Documentado en §4 del spec.
- **Contenido del plan** (copy) → Task 13 marca la estructura; el copy final lo define negocio (fuera de alcance del spec).
