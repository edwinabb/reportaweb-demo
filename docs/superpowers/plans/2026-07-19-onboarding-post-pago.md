# Onboarding Post-Pago (Sub-proyecto D) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tras el pago (C), guiar al cliente con un onboarding definitivo (setup productivo completo) reusando el motor adaptativo de A con un tramo de plan propio (`phase='paid'`), hasta dejar el tenant "productivo".

**Architecture:** D NO agrega motor nuevo. Añade (1) un tramo de contenido al plan (`trial_plan_steps` con una fase `paid`), (2) reglas de detección de progreso para los pasos productivos, (3) un estado de onboarding pago en `companies`, y (4) una barra/checklist en el dashboard. La orquestación (escaneo de avance, selección adaptativa del correo, idempotencia) es la misma de A, filtrando por fase.

**Tech Stack:** Next.js 16 (App Router, server components), Supabase (Postgres + RLS), Cloudflare Cron (el mismo cron de A), Resend, Telegram (alerta de traba — reusa `lib/telegram.ts` de B).

**Spec de referencia:** `docs/superpowers/specs/2026-07-19-onboarding-post-pago-design.md`
**Depende de:** A (motor `selectDailyStep`, `trial_plan_steps`, `trial_module_progress`, cron) y C (webhook pone `onboarding_paid_status='pending'` al convertir).
**Playbook:** `docs/PLAYBOOK-GROWTH-ENGINE.md`

## Global Constraints

- **Reuso del motor de A:** no duplicar `selectDailyStep` ni el escaneo de progreso; extenderlos con un parámetro de fase.
- **Fase de plan** nueva: `trial_plan_steps.tier` (o una columna `phase`) admite `paid` además de `core`/`advanced`. Elegir el mismo mecanismo que A usa para `tier`.
- **Estado onboarding pago:** `companies.onboarding_paid_status ∈ (pending, in_progress, done)`; `NULL` = aún no pagó.
- **"Hecho" se detecta por datos reales** (mismas señales que A + señales productivas nuevas), no por marcar como leído.
- **Branding gateado por plan:** el paso de branding solo aplica si `hasBranding(company)` (OWN BRAND/CUSTOM) — reusa `lib/billing-quota.ts` de C.
- **Secretos server-side jamás en archivos trackeados.**
- **Verificación:** `npm run build` (typecheck estricto) + check manual por task. Migraciones: TEST → PROD; `npm run types:supabase` tras cada una.

---

## File Structure

| Archivo | Responsabilidad |
|---------|-----------------|
| `supabase/migrations/20260719_onboarding_paid.sql` | Columnas `onboarding_paid_status`, `onboarding_paid_started_at`; ampliar CHECK de `tier`/`phase` para `paid` |
| `lib/trial-plan.ts` | (modif A) `selectDailyStep` acepta el set de pasos de la fase pedida (ya es agnóstico del tier; parametrizar) |
| `lib/trial-progress.ts` | (modif A) señales productivas nuevas (usuarios invitados, informe configurado, login app, primera operación) |
| `app/api/cron/trial-lifecycle/route.ts` | (modif A) procesar también el onboarding pago de tenants `converted` |
| `components/onboarding/checklist-post-pago.tsx` | Barra/checklist de setup en el dashboard |
| `app/(dashboard)/**` | (modif) montar la barra hasta `done` |
| `components/sistema/plan/plan-editor.tsx` | (modif A) el editor soporta la fase `paid` |
| `supabase/seed/trial_plan_steps_paid.sql` | Seed de los pasos productivos (estructura; copy por negocio) |

---

## Task 1: Migración (estado de onboarding pago + fase `paid`)

**Files:**
- Create: `supabase/migrations/20260719_onboarding_paid.sql`
- Modify (regen): `types/supabase.ts`

**Interfaces:**
- Produces: `companies.onboarding_paid_status`, `companies.onboarding_paid_started_at`; `trial_plan_steps.tier` admite `paid`.

- [ ] **Step 1: Escribir la migración**

```sql
-- 20260719_onboarding_paid.sql
ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS onboarding_paid_status TEXT
      CHECK (onboarding_paid_status IS NULL OR onboarding_paid_status IN ('pending','in_progress','done')),
  ADD COLUMN IF NOT EXISTS onboarding_paid_started_at TIMESTAMPTZ;

-- Ampliar el CHECK de tier para admitir 'paid' (nombre real de la constraint según A).
ALTER TABLE trial_plan_steps DROP CONSTRAINT IF EXISTS trial_plan_steps_tier_check;
ALTER TABLE trial_plan_steps ADD CONSTRAINT trial_plan_steps_tier_check
    CHECK (tier IN ('core','advanced','paid'));
```

> Si C ya incluyó `onboarding_paid_status` en su migración (ver nota de C Task 6), omitir el `ADD COLUMN` duplicado aquí y dejar solo el CHECK de `tier`.

- [ ] **Step 2: Aplicar en TEST + regenerar tipos**

Run: pegar en TEST SQL editor; luego `npm run types:supabase`.  Expected: sin error; tipos actualizados.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260719_onboarding_paid.sql types/supabase.ts
git commit -m "feat(onboarding-pago): estado onboarding pago + fase paid del plan"
```

---

## Task 2: Señales de progreso productivas

**Files:**
- Modify: `lib/trial-progress.ts`

**Interfaces:**
- Consumes: `createAdminClient`.
- Produces: extiende `SIGNAL_TABLE` (o crea `detectPaidModules(tenantId)`) con las señales de los pasos `paid`.

- [ ] **Step 1: Agregar señales productivas**

Extender el mapa de A con las señales del checklist §3 del spec que no existan aún. Ejemplos (ajustar a tablas reales de `types/supabase.ts`):
```typescript
const PAID_SIGNAL_TABLE: Record<string, string> = {
  usuario_invitado:   'profiles',              // count > umbral de asientos
  informe_configurado:'config_informe',        // fila del tenant presente
  branding_cargado:   'companies',             // logo/colores no nulos (query especial)
  operacion_real:     'reportes',              // registro POSTERIOR a la conversión
}
```

- [ ] **Step 2: Reglas especiales** (no solo `count>0`)

- `informe_configurado`: existe fila en la tabla de config de informes del tenant (patrón upsert 1-fila-por-tenant; ver memoria `project_informes_config_por_tenant`).
- `branding_cargado`: `companies.logo_url IS NOT NULL` (solo aplica si `hasBranding`).
- `operacion_real`: hay un `reportes`/`tareas` con `created_at > companies.onboarding_paid_started_at`.

Implementar un detector `detectPaidModules(tenantId)` que devuelva las señales cumplidas aplicando estas reglas (una función por señal cuando no sea un simple count).

- [ ] **Step 3: Typecheck + commit**

Run: `npm run build`  Expected: PASS.
```bash
git add lib/trial-progress.ts && git commit -m "feat(onboarding-pago): deteccion de avance productivo"
```

---

## Task 3: Parametrizar el motor por fase

**Files:**
- Modify: `lib/trial-plan.ts`

**Interfaces:**
- El `selectDailyStep` de A ya recibe `coreSteps`/`advancedSteps`. Para `paid` se reutiliza tal cual pasándole los pasos `paid` como "core" de esta fase (sin tramo advanced), o se generaliza a `steps`/`fallbackSteps`.

- [ ] **Step 1: Generalizar (mínimo cambio)**

Opción recomendada: NO tocar la firma; en el cron (Task 4) llamar `selectDailyStep({ expectedDay, coreSteps: paidSteps, advancedSteps: [], completedModules, sentStepIds })`. Así el motor de A sirve sin refactor.
Si se prefiere claridad, agregar un wrapper:
```typescript
export function selectPaidStep(args: {
  expectedDay: number; paidSteps: PlanStep[]; completedModules: Set<string>; sentStepIds: Set<string>
}): DailyPick | null {
  return selectDailyStep({ ...args, coreSteps: args.paidSteps, advancedSteps: [] })
}
```

- [ ] **Step 2: Typecheck + commit**

Run: `npm run build`  Expected: PASS.
```bash
git add lib/trial-plan.ts && git commit -m "feat(onboarding-pago): reuso del motor adaptativo para fase paid"
```

---

## Task 4: Extender el cron para el onboarding pago

**Files:**
- Modify: `app/api/cron/trial-lifecycle/route.ts`

**Interfaces:**
- Consumes: `detectPaidModules` (Task 2), `selectPaidStep`/`selectDailyStep` (Task 3), `renderPlanEmail` (A), `sendTelegram` (B, fallback), `hasBranding` (C).

- [ ] **Step 1: Procesar tenants `converted` con onboarding pendiente/en curso**

Agregar, después del bucle de trials de A, un segundo bucle:
```typescript
const { data: paidLeads } = await admin.from('companies')
  .select('id, name, plan_code, onboarding_paid_status, onboarding_paid_started_at')
  .eq('trial_status', 'converted')
  .in('onboarding_paid_status', ['pending','in_progress'])

for (const c of paidLeads ?? []) {
  // marcar inicio
  if (c.onboarding_paid_status === 'pending') {
    await admin.from('companies').update({
      onboarding_paid_status: 'in_progress',
      onboarding_paid_started_at: new Date().toISOString(),
    }).eq('id', c.id)
  }
  // 1. avance real (señales paid; branding solo si hasBranding)
  const completed = await detectPaidModules(c.id)
  for (const sig of completed) {
    await admin.from('trial_module_progress').upsert(
      { tenant_id: c.id, module_key: sig }, { onConflict: 'tenant_id,module_key', ignoreDuplicates: true })
  }
  // 2. cargar pasos paid publicados (filtrando branding si !hasBranding) + sentStepIds
  // 3. pick = selectPaidStep(...); si pick != null -> enviar correo (renderPlanEmail) + log
  // 4. cierre: si todos los pasos paid aplicables están completos -> onboarding_paid_status='done'
  //    + correo "Sistema listo" + alerta Telegram "cliente productivo"
  // 5. alerta de traba: si N días sin avanzar un paso critico -> sendTelegram al admin
}
```

- [ ] **Step 2: Implementar los pasos 2-5 con código completo** (cargar `trial_plan_steps` `tier='paid'` `status='published'`, excluir `branding_cargado` si `!hasBranding(c)`, reutilizar la lógica de envío/idempotencia de A con `trial_emails_log(tenant_id, step_id)`).

- [ ] **Step 3: Probar contra TEST**

Run: `curl "http://localhost:3000/api/cron/trial-lifecycle?secret=$CRON_SECRET"` con un tenant `converted` `onboarding_paid_status='pending'` en TEST.
Expected: pasa a `in_progress`, envía el primer correo `paid`, registra `trial_emails_log`; al completar todas las señales pasa a `done`.

- [ ] **Step 4: Commit**

```bash
git add app/api/cron/trial-lifecycle/route.ts
git commit -m "feat(onboarding-pago): cron procesa onboarding definitivo post-pago"
```

---

## Task 5: Barra/checklist de onboarding en el dashboard

**Files:**
- Create: `components/onboarding/checklist-post-pago.tsx`
- Modify: `app/(dashboard)/**` (layout o home del dashboard)

**Interfaces:**
- Consumes: `trial_module_progress` + `trial_plan_steps (tier='paid')`; `hasBranding` (C).

- [ ] **Step 1: `checklist-post-pago.tsx`** — lista los pasos `paid` con estado hecho/pendiente (cruzando `trial_module_progress`), barra de progreso %, y CTA por paso a su `cta_path`. Excluye branding si `!hasBranding`. Visible solo si `onboarding_paid_status ∈ (pending,in_progress)`.
- [ ] **Step 2: Montar en el dashboard** — en el home/layout del `(dashboard)`, renderizar la barra cuando el tenant esté en onboarding pago. Ocultar en `done`.
- [ ] **Step 3: Typecheck + verificación manual + commit**

Run: `npm run build`  Expected: PASS. Tenant `converted` en `in_progress` ve la barra; al completar señales, desaparece.
```bash
git add components/onboarding/checklist-post-pago.tsx "app/(dashboard)"
git commit -m "feat(onboarding-pago): checklist de setup en dashboard"
```

---

## Task 6: Editor de plan soporta la fase `paid`

**Files:**
- Modify: `components/sistema/plan/plan-editor.tsx`
- Modify: `lib/actions/trial-plan-admin.ts` (validación de A)

**Interfaces:**
- Reusa el editor y la validación de A, agregando la pestaña/fase `paid`.

- [ ] **Step 1: Pestaña `paid` en el editor** — tercera pestaña junto a Core/Avanzado; misma UI de edición de pasos (7 campos). El "día" en `paid` es orden sugerido, sin exigir cobertura 1..N estricta (a diferencia de core).
- [ ] **Step 2: Ajustar `validatePlanSteps`** — para `tier='paid'`, no exigir la secuencia 1..15/1..7 (validar solo unicidad de día y campos obligatorios/señal/placeholder). Ampliar `ALLOWED_SIGNALS` con las señales productivas de Task 2.
- [ ] **Step 3: Typecheck + verificación manual + commit**

Run: `npm run build`  Expected: PASS. Crear pasos `paid`, validar, publicar.
```bash
git add components/sistema/plan/plan-editor.tsx lib/actions/trial-plan-admin.ts
git commit -m "feat(onboarding-pago): editor soporta fase paid"
```

---

## Task 7: Seed de los pasos productivos (estructura)

**Files:**
- Create: `supabase/seed/trial_plan_steps_paid.sql`

- [ ] **Step 1: Escribir el seed** con los pasos del checklist §3 (empresa, branding, usuarios, config informes, datos maestros, app móvil, primera operación) usando módulos reales y señales de Task 2; copy provisional.
- [ ] **Step 2: Aplicar en TEST, publicar desde el editor, correr el cron** con un tenant `converted` de prueba → validar punta a punta hasta `done`.
- [ ] **Step 3: Commit**

```bash
git add supabase/seed/trial_plan_steps_paid.sql
git commit -m "feat(onboarding-pago): seed de pasos productivos (estructura)"
```

---

## Self-Review (cobertura vs spec)

- §1 diferencia trial/pago → Task 1 (estado) + Task 4 (tono/tramo). ✅
- §2 datos (reuso A + estado) → Task 1. ✅
- §3 checklist de setup → Task 2 (señales) + Task 7 (seed). ✅
- §4 motor (reuso A, disparo, cierre, alerta de traba) → Task 3 + Task 4. ✅
- §5 UI → Task 5 (barra) + Task 6 (editor). ✅
- §6 archivos → cubiertos.
- **Dependencia A:** requiere el motor y el cron de A implementados. **Dependencia C:** el webhook debe poner `onboarding_paid_status='pending'`.
- **Dependencia B:** alerta de traba / "cliente productivo" por Telegram; fallback log hasta que B exista.
- **Contenido:** copy de los correos `paid` → negocio (fuera de alcance).
