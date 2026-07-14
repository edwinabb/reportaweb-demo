# Demo Environment: Test DB Setup (oyrokyyaeaeqzlsgxtto)

## Status: ✅ READY

**Test DB:** oyrokyyaeaeqzlsgxtto (Brazil, same region as prod)  
**Current State:** 140 tables + 429 RLS policies + 24 buckets + 1 CISE tenant + 3 E2E users  
**E2E Suite:** 20/20 smoke tests passing ✅

---

## Update demo.reportar.app Worker (5 minutes)

The demo worker currently uses PROD database. To switch it to TEST:

**1. Go to:** https://dash.cloudflare.com → Workers and Pages → reportaweb3-demo

**2. Settings → Variables and Secrets**

**3. Update these PUBLIC VARIABLES:**

```
NEXT_PUBLIC_SUPABASE_URL
  Value: https://oyrokyyaeaeqzlsgxtto.supabase.co
  (Change from: https://fqwhagryqkkhbgznxtwf.supabase.co)

NEXT_PUBLIC_SUPABASE_ANON_KEY
  Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95cm9reXlhZWFlcXpsc2d4dHRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM2MzAwNzQsImV4cCI6MjA5OTIwNjA3NH0.Oy_WO5suRhBeN-FUTVnpRjN2SwdOJZbY0amKaKO20cc
  (New key from TEST project)

SUPABASE_API_URL
  Value: https://oyrokyyaeaeqzlsgxtto.supabase.co
```

**4. SECRETS (already set):**

These should already be there. If missing, add from .env.local:
- SUPABASE_SERVICE_ROLE_KEY ← from DEMO_SUPABASE_SERVICE_ROLE_KEY
- RESEND_API_KEY ← same as prod
- CRON_SECRET ← same as prod

**5. Save & Redeploy**

```
Click "Save" on each variable
Then: Settings → Deployments → Redeploy (or wait for auto-deploy)
```

---

## Verify Demo Works

After deploying:

```
1. Open: https://demo.reportar.app
2. Try: Login with e2e-admin@reporta.la / E2E-Admin-2026!
3. Check: Dashboard loads, sidebar modules visible
4. Verify: No 500 errors, data loads from TEST DB
```

---

## E2E Test Credentials (TEST DB)

| Role | Email | Password |
|---|---|---|
| Admin | e2e-admin@reporta.la | E2E-Admin-2026! |
| Planner | e2e-planner@reporta.la | E2E-Planner-2026! |
| Viewer | e2e-viewer@reporta.la | E2E-Viewer-2026! |

---

## Local Dev Still Works

Local development already points to TEST DB (`.env.local` configured).

```bash
npm run dev
# Connects to oyrokyyaeaeqzlsgxtto (test DB)
# Login with E2E credentials above
```

---

## Suite E2E Ready

After demo variables updated, run full suite:

```bash
npm run test:e2e
# Will use test DB for all 374 tests
# Demo validates at: https://demo.reportar.app (via Workers)
```

---

## Summary

- ✅ Test DB fully seeded (140 tables, 24 buckets, 3 E2E users)
- ✅ APKs cleaned from Storage (100MB freed)
- ✅ Local dev points to test DB
- ⏳ **NEXT:** Update demo worker variables (5 min manual step)
- ⏳ **THEN:** Run full E2E suite against test DB + demo.reportar.app

---

**Time to complete:** ~5 minutes  
**Risk:** 🟢 Zero (test environment only)
