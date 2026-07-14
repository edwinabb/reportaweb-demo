# Architecture — REPORTA Web Admin

Technical decisions, patterns, and conventions for developers.

---

## Schema Decisions

### Foreign Key Strategy

**Rule:** Always use UUID FKs, never composite keys.

**Examples:**
- `app_calendario_festivos`: `pais_id UUID FK → paises.id` (NOT pais_codigo TEXT)
- `reportes_maquinaria`: `maquinaria_id UUID FK → maquinarias.id`

**Why:** Multi-tenant isolation, referential integrity, easy migrations.

### Versioning Strategy

**Version field:** `version_formato` (text, not number)
- `'v1'` = migrated from Bubble (read-only, never update)
- `'v2'` = newly created in Supabase (can update)

**Why:** Bubble schemas were fixed at migration; new features use v2.

### Timezone Handling

**Rule:** Always store UTC in DB; use cookie + RPC for user timezone.

- DB column: `companies.timezone` (IANA string, default `'America/Lima'`)
- Cookie: `rw3_timezone` (httpOnly: false, maxAge 1h)
- RPC `get_timezone()` reads from profile_details or falls back to company

**Why:** Prevents timezone bugs; user can override company timezone.

### Config Tables (Singleton Pattern)

**Rule:** `config_informe_*` and `config_checklist` are 1 row per tenant. Always upsert, never insert.

```sql
INSERT INTO config_informe_maquinaria (tenant_id, ...)
VALUES (...)
ON CONFLICT (tenant_id) DO UPDATE SET ...;
```

**Why:** Prevents duplicate config errors; supports onboarding + updates.

---

## Conventions

### File Organization

**Server Actions:** `lib/actions/<module>.ts`
- Always `'use server'`
- One action per business flow (no mega-files)
- Example: `lib/actions/cotizaciones.ts` (createQuote, approveQuote, etc.)

**Client Components:** `components/<module>/` + `'use client'`
- Break into sub-components by responsibility
- Example: `components/cotizaciones/quote-list.tsx`, `quote-dialog.tsx`

**Types:** `types/supabase.ts` (generated) + `types/<module>.ts` (custom)
- Run `npm run types:supabase` after schema changes
- Always clean up `<claude-code-hint>` tag if present

**Tests:** `tests/flows/<N>-<description>.spec.ts`
- Pattern: `tests/flows/12-cotizaciones.spec.ts`
- Each E2E flow is one file with describe blocks

### searchParams Handling (Next.js 16)

**Rule:** Always use Promise-typed searchParams + await.

```typescript
// ✅ Correct
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const params = await searchParams
  const tab = params.tab || 'overview'
}

// ❌ Wrong
export default function Page({ searchParams }) {
  const tab = searchParams.tab  // searchParams is Promise, not object
}
```

### Error Handling in Server Actions

**Rule:** Always use Sentry + pathname context.

```typescript
import { captureWithContext } from '@/lib/sentry'

export async function createQuote(data: QuoteInput) {
  try {
    // ...
  } catch (error) {
    captureWithContext(error, '/cotizaciones/nueva')
    throw new Error('Failed to create quote')
  }
}
```

**Why:** Errors include page context for debugging; no silent failures.

### Auth Middleware + Cookie Copying

**Rule:** When middleware does `NextResponse.redirect()`, copy auth cookies.

```typescript
const response = NextResponse.redirect(new URL('/login', request.url))
const cookies = request.cookies.getAll()
cookies.forEach(cookie => response.cookies.set(cookie))
return response
```

**Why:** Redirect loses cookies otherwise; auth fails.

---

## Patterns

### RBAC via cargo_permisos

**Architecture:**
- `profiles.role` = high-level role (admin_tenant, planner, viewer)
- `job_titles` = cargo/position (E2E PLANNER, Supervisor, etc.)
- `cargo_permisos` = permissions per cargo per resource

**Example:**
```sql
SELECT r.id, r.name
FROM sistema_recursos r
WHERE EXISTS (
  SELECT 1 FROM cargo_permisos cp
  WHERE cp.cargo_id = $1
    AND cp.recurso_id = r.id
    AND cp.puede_ver = true
)
```

**Why:** Decouples role from permissions; ops can change permisos without code changes.

### Multi-Tenant Isolation (@roles)

**E2E tests:** Separate test suites per role
- `chromium` (planner): Runs all tests except @roles + @sistema
- `chromium-admin` (admin): Runs only @roles tests
- `chromium-viewer` (viewer): Runs only @roles tests

**Why:** Prevents refresh_token rotation when auth files are shared across contexts.

### PDF Generation via Gotenberg

**Endpoint:** All PDFs route through `app/api/<module>/[id]/pdf/route.ts`

```typescript
const response = await fetch(`${GOTENBERG_URL}/forms/chromium/convert/html`, {
  method: 'POST',
  body: formData,  // includes HTML from Gotenberg
})
```

**Why:** Offloads heavy rendering; supports async generation.

### Storage + RLS Policies

**Architecture:**
- Upload: `clients/<tenant_id>/<bucket>/<file>`
- RLS: Check `tenant_id` in JWT against path
- Public buckets: RLS allows anon read, auth write (specific paths)

**Why:** Tenant data never leaks; clients only see their files.

---

## Data Flows

### Planificación Module

1. **Create Tarea** → Server Action (`createTask`)
   - Validate tenant access
   - Insert `tareas` row
   - Trigger RPC `refresh_mv_planificacion_diaria`

2. **Add Recursos** → Server Action (`addTareasRecursos`)
   - Insert `tareas_recursos` rows
   - Update `maquinaria_horas` if machinery type
   - Refresh materialized view

3. **View Agenda** → SQL Query + RPC
   - Query `view_tarea_agenda_diaria` (filtered by tenant + date range)
   - RPC `get_rutas_bloqueadas()` for RBAC

### Cotizaciones Module

1. **Create Quote** → Server Action + PIN rate-limiting
   - Check `pin_attempts` table
   - If < 3 attempts, allow; else block
   - Rate-limit window: 1 hour per email

2. **Approve Quote** → Server Action + PIN validation
   - Hash PIN with user salt
   - Compare with stored hash
   - Send approval email via Resend

3. **Generate PDF** → API endpoint
   - Fetch quote HTML
   - POST to Gotenberg
   - Save to Storage
   - Return signed URL

### Reportes (Maquinaria, Personal)

1. **Create Report** → Server Action
   - Validate `tarea_id` exists + tenant access
   - Insert `reportes_maquinaria` or `reportes_personal`
   - Generate PDF async

2. **View Report Details** → Server Component
   - Fetch report + linked task
   - Display PDF (Storage signed URL)
   - Show responses (if v2+ format)

---

### Materialized Views for Reporting

**Pattern:** Denormalize read-heavy queries via `mv_*` views + `refresh_mv_*()` RPC.

**Example:**
```sql
CREATE MATERIALIZED VIEW mv_planificacion_diaria AS
  SELECT t.id, t.fecha, t.tenant_id, COUNT(tr.id) as recursos_count
  FROM tareas t
  LEFT JOIN tareas_recursos tr ON t.id = tr.tarea_id
  WHERE t.deleted_at IS NULL
  GROUP BY t.id;

-- Refresh function
CREATE OR REPLACE FUNCTION refresh_mv_planificacion_diaria()
RETURNS void LANGUAGE sql AS $$
  REFRESH MATERIALIZED VIEW mv_planificacion_diaria;
$$;
```

**Why:** MV caches expensive JOINs; refresh after inserts/updates.

### Email Workflow via Resend

**Architecture:**
- Action: `sendApprovalEmail(userEmail, quoteId)`
- Resend domain: `noreply@reportar.app` (verified in Resend + DNS)
- Templates: Stored in Resend console (not in repo)
- Rate-limit: 1 email per resource per minute

**Example:**
```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
await resend.emails.send({
  from: 'noreply@reportar.app',
  to: userEmail,
  subject: 'Quote Approval Required',
  html: templateHtml,
})
```

**Why:** Resend handles bounce tracking; no email infra overhead.

---

## Implementation Checklist for New Features

### Before Writing Code

- [ ] Sketch schema changes (FK strategy, versioning, tenant isolation)
- [ ] Identify business flows (happy path + error cases)
- [ ] Plan RBAC: Which roles can perform this action?
- [ ] Check existing module for similar patterns
- [ ] Schedule DB migration review (if schema change needed)

### During Development

- [ ] Follow file organization: actions in `lib/actions/`, components in `components/<module>/`
- [ ] Use Server Actions + Sentry error handling
- [ ] searchParams must be Promise-typed + awaited
- [ ] Auth: Always validate tenant_id in RLS + server action
- [ ] PDF: Route through Gotenberg endpoint
- [ ] Storage: Use `clients/<tenant_id>/<bucket>/` prefix

### Before Submitting PR

- [ ] Types regenerated: `npm run types:supabase` (if schema changed)
- [ ] No `<claude-code-hint>` tags remain
- [ ] Tests: Add E2E flow to `tests/flows/`
- [ ] Middleware: Update if adding new auth guard
- [ ] Lint + format: `npm run lint && npm run format`
- [ ] E2E suite passes: `npm run test:e2e` (or subset with `-g`)

---

## Common Gotchas

### Gotcha 1: searchParams as Sync

**Problem:** Old Next.js allowed `searchParams: { foo: string }`. Next.js 16 made it a Promise.

**Symptom:** `undefined` values on first render.

**Fix:**
```typescript
// OLD (breaks in 16+)
const tab = searchParams.tab

// NEW (works in 16+)
const params = await searchParams
const tab = params.tab
```

### Gotcha 2: Auth Cookies Lost on Redirect

**Problem:** Middleware returns `NextResponse.redirect()` without copying cookies.

**Symptom:** User redirected to login, but auth token not sent → login fails.

**Fix:** Copy cookies before redirect.

### Gotcha 3: Duplicate Config Rows

**Problem:** INSERT into `config_informe_*` table without UPSERT logic.

**Symptom:** Constraint violation; second onboarding fails.

**Fix:** Always use `ON CONFLICT (tenant_id) DO UPDATE`.

### Gotcha 4: PDF Generation Timeout

**Problem:** Large HTML docs take >30s to render in Gotenberg.

**Symptom:** Worker request timeout (Cloudflare Workers CPU limit).

**Fix:** Use async job queue; return signed URL, not PDF bytes.

### Gotcha 5: Storage RLS Leaks Data

**Problem:** RLS policy checks only `tenant_id` in path, not JWT claims.

**Symptom:** User can upload to wrong tenant's bucket.

**Fix:** Always verify `JWT.tenant_id == path.tenant_id` in policy + action.

---

## Database Debugging

### List All RLS Policies

```sql
SELECT schemaname, tablename, policyname, permissive, roles
FROM pg_policies
WHERE tablename LIKE 'reportes_%'
ORDER BY tablename;
```

### Check Materialized View Status

```sql
SELECT schemaname, matviewname, ispopulated
FROM pg_matviews
WHERE matviewname LIKE 'mv_%';
```

### Check Foreign Key Constraints

```sql
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name
FROM information_schema.table_constraints AS tc
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name LIKE 'reportes%';
```

---

## Deployment Checklist

### Before Merging to Main

1. All E2E tests pass (or explicitly skipped with `@skip`)
2. No console.log() or debug code
3. Sentry events reviewed (if error handling changed)
4. DB migration approved (if schema changed)
5. No hardcoded secrets or API keys

### Infrastructure (Cloudflare Workers — desde 2026-07)

| Entorno | URL | Repo GitHub | Base de datos |
|---|---|---|---|
| **Demo** | `demo.reportar.app` | `reportaweb-demo` | Test (`oyrokyyaeaeqzlsgxtto`, Brazil) |
| **Producción** | `live.reportar.app` | `reportaweb-live` | Prod (`fqwhagryqkkhbgznxtwf`, Brazil) |
| **Local** | `localhost:3000` | — | Test (via `.env.local`) |

**Stack de deployment:**
- **Adapter:** `@opennextjs/cloudflare` (Next.js 16 → Cloudflare Workers)
- **Config:** `wrangler.toml` (worker + assets + variables) y `open-next.config.ts`
- **Build:** `npm run build` + `npx opennextjs-cloudflare build` → `.open-next/worker.js`
- **Límites:** worker ≤10 MiB comprimido (plan pago, `minify = true` obligatorio); assets ≤25 MiB por archivo (NO commitear APKs)
- **Middleware:** debe ser Edge-compatible (`middleware.ts` con `updateSession` de Supabase; Node middleware NO soportado)
- **Sentry:** solo client-side (instrumentation server-side incompatible con OpenNext worker)
- **Secrets:** Cloudflare Dashboard → Worker → Settings → Variables and Secrets (`SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `CRON_SECRET`)

### Production Deployment (Cloudflare)

1. Push a `master` del repo `reportaweb-live`
2. Cloudflare (GitHub integration) auto-builds + deploys a `live.reportar.app`
3. Monitor Sentry for new errors (1h window)
4. Check Cloudflare Analytics (latency, cache hit ratio, errors)

### Demo Deployment (Cloudflare)

1. Push al repo `reportaweb-demo`
2. Cloudflare auto-builds + deploys a `demo.reportar.app` (apunta a BD de test)
3. Test auth + E2E flows en demo
4. Approve PR

### Cron Jobs

Los 6 cron jobs que corrían en Vercel (`vercel.json`, eliminado) están **pendientes de migrar** a Cloudflare Cron Triggers o servicio externo. Ver `docs/julio13/TECHNICAL_DEBT_CLOUDFLARE.md`.

---

## Next Steps for New Developers

1. **Read this doc** for decisions + patterns
2. **Read [ROADMAP.md](./ROADMAP.md)** for priorities
3. **Read [TESTING.md](../TESTING.md)** for E2E architecture
4. **Clone a similar feature** (e.g., Cotizaciones if building another approval flow)
5. **Ask in #dev-general** for module-specific questions

---

## Debugging Server Actions

### Strategy 1: Sentry + Breadcrumbs

Every server action should log breadcrumbs for context.

```typescript
import * as Sentry from '@sentry/nextjs'

export async function updateQuote(id: string, data: QuoteUpdate) {
  Sentry.captureMessage(`Updating quote ${id}`, 'info')
  
  try {
    const result = await db.updateQuote(id, data)
    Sentry.captureMessage(`Quote ${id} updated`, 'info')
    return result
  } catch (error) {
    Sentry.captureException(error, {
      tags: { action: 'updateQuote', quoteId: id }
    })
    throw error
  }
}
```

### Strategy 2: Database Query Logging

Use `RLS_TENANT_ID` context variable for multi-tenant debugging.

```sql
-- In migration or RPC:
SELECT set_config('app.current_tenant_id', $1::text, false);

-- Then in SELECT:
SELECT * FROM tareas
WHERE tenant_id = current_setting('app.current_tenant_id')::uuid;
```

### Strategy 3: Email Preview in Dev

Test email rendering without sending via Resend:

```typescript
// lib/debug/email-preview.ts
export function previewEmail(template: string, data: object) {
  console.log(`[EMAIL PREVIEW] ${template}`)
  console.log(JSON.stringify(data, null, 2))
  // In dev, return HTML to render in browser
}
```

---

## Tenant Isolation Verification

### Checklist for New Tables

Every table should have `tenant_id UUID FK → companies.id`.

```sql
-- ✅ Correct
CREATE TABLE reportes_maquinaria (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES companies(id),
  tarea_id UUID NOT NULL REFERENCES tareas(id),
  -- ... other columns
);

-- Add RLS policy
ALTER TABLE reportes_maquinaria ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_own_tenant ON reportes_maquinaria
  FOR SELECT
  USING (tenant_id = auth.jwt() ->> 'tenant_id');

-- ❌ Wrong (no tenant_id)
CREATE TABLE reportes_maquinaria (
  id UUID PRIMARY KEY,
  tarea_id UUID NOT NULL,
  -- missing tenant_id = SECURITY RISK
);
```

### Test Multi-Tenant Isolation

Always write an E2E test that verifies tenant isolation:

```typescript
test('User A cannot see User B quotes', async ({ browser }) => {
  // Login as User A
  const page1 = await browser.newPage()
  await loginAs(page1, 'usera@company1.com')
  
  // Login as User B in separate context
  const page2 = await browser.newPage()
  await loginAs(page2, 'userb@company2.com')
  
  // User A tries to access User B's quote directly
  await page1.goto('/cotizaciones/OTHER_TENANT_QUOTE_ID')
  
  // Should fail (404 or error)
  expect(page1.url()).toContain('/cotizaciones')
  expect(await page1.textContent()).toContain('No encontrado')
})
```

---

## Performance Optimization

### Query Optimization

Use EXPLAIN ANALYZE for slow queries:

```sql
EXPLAIN ANALYZE
SELECT t.*, COUNT(tr.id) as recursos_count
FROM tareas t
LEFT JOIN tareas_recursos tr ON t.id = tr.tarea_id
WHERE t.tenant_id = $1
  AND t.fecha BETWEEN $2 AND $3
GROUP BY t.id;
```

### Cache Strategy

- **Materialized Views:** `mv_*` tables for expensive JOINs (refresh after updates)
- **React Query:** Client cache with `staleTime: 1 minute` for dashboards
- **HTTP Cache:** `Cache-Control: max-age=3600` for static assets

### Avoiding N+1 Queries

Instead of:
```typescript
// ❌ N+1: loops through each tarea, makes separate query
const tareas = await db.query('SELECT * FROM tareas')
for (const tarea of tareas) {
  const recursos = await db.query('SELECT * FROM tareas_recursos WHERE tarea_id = ?', [tarea.id])
}
```

Do:
```typescript
// ✅ Single JOIN query
const tareasConRecursos = await db.query(`
  SELECT t.*, tr.id as recurso_id
  FROM tareas t
  LEFT JOIN tareas_recursos tr ON t.id = tr.tarea_id
  WHERE t.tenant_id = ?
`)
```

---

## Security Best Practices

### API Key Management

- **NEVER** commit `.env.local` or secrets to git
- **ALWAYS** use environment variables (Cloudflare Worker Secrets en deploy; `.env.local`/`.dev.vars` en local)
- **RESEND_API_KEY:** Only used on server side (never expose to client)
- **SUPABASE_ANON_KEY:** Safe to expose (public, can't write)
- **SUPABASE_SERVICE_ROLE_KEY:** Server-only, for admin operations

### SQL Injection Prevention

Always use parameterized queries:

```typescript
// ✅ Safe
const result = await db.query('SELECT * FROM tareas WHERE id = $1', [id])

// ❌ Dangerous
const result = await db.query(`SELECT * FROM tareas WHERE id = ${id}`)
```

### CSRF Protection

Next.js middleware automatically includes CSRF tokens. Don't disable it.

### Session Security

- Tokens stored in httpOnly cookies (not localStorage)
- Refresh token only valid for 7200s (2 hours)
- Logout clears both access + refresh tokens

---

## Resources

- **Supabase Docs:** https://supabase.com/docs
- **Next.js 16 Docs:** https://nextjs.org/docs
- **Playwright E2E:** https://playwright.dev
- **Tailwind CSS:** https://tailwindcss.com/docs
- **Radix UI:** https://www.radix-ui.com/docs/primitives/overview/introduction
- **Sentry:** https://docs.sentry.io/platforms/javascript/guides/nextjs/
- **PostgreSQL RLS:** https://www.postgresql.org/docs/current/sql-createpolicy.html
