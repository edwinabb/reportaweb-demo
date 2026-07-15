# CLAUDE.md — REPORTA · Contexto de sesión

## Ecosistema

**REPORTA** — SaaS de gestión operativa para empresas de grúas/maquinaria pesada. Multi-tenant.

| Repo | Ruta | Stack | Versión |
|------|------|-------|---------|
| Web admin | `c:\Proyectos\reportaweb3` | Next.js 16, React 19, TypeScript, Tailwind, Radix | **3.11.0** |
| App móvil | `c:\Proyectos\reporta-app` | Expo 54, expo-router, SQLite/Drizzle, React Native | **1.8.14** |
| DB / Backend | Supabase test `oyrokyyaeaeqzlsgxtto` (Brazil) / prod `fqwhagryqkkhbgznxtwf` (Brazil) | PostgreSQL + Auth + Storage | — |

**Tenants:** CISE `1cb97ec7-326c-4376-93ee-ed317d3da51b` · GRUAS `6f4c923a-c3b7-47c2-9dea-2a187f274f73`

**Infra:** Cloudflare Workers + OpenNext (demo.reportar.app → BD test · live.reportar.app → BD prod) · Repos deploy: `reportaweb-demo` / `reportaweb-live` (GitHub integration) · Gotenberg (PDF) · Resend (dominio verificado: `reportar.app`, from: `noreply@reportar.app`) · Sentry (solo client-side) · Cloudflare DNS

> Detalle de deployment: [ARCHITECTURE.md § Infrastructure](./docs/ARCHITECTURE.md). Vercel fue reemplazado el 2026-07-13; cron jobs pendientes de migrar.

---

## Estado Actual

**Date:** 2026-07-13  
**Web Version:** v3.11.0 (PROD) ✅ — **READY FOR DEPLOYMENT**  
**App Version:** v1.8.14  
**E2E Suite:** 347/374 tests passing (92.8%)  
**Cutover:** 2026-05-30 ✅  
**v3.11 Status:** ✅ COMPLETADO (all 6 tickets done)

**Environment Status:**
- ✅ Production (master): v3.11 ready
- ⚠️ Development: Temporarily unavailable
- ✅ Database: 100% tareas_recursos coverage, 0 orphans

**Release Notes (v3.11):**
- ✅ tareas_recursos: 100% coverage (14,511/14,511 tareas)
- ✅ FK Integrity: 0 orphans, 0 duplicates
- ✅ CISE + GRUAS tenant cleanup
- ✅ See [DEPLOYMENT_v3.11.md](./DEPLOYMENT_v3.11.md) for deploy instructions

---

## Documentation Index

Quick links to specialized documentation:

- **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)** — Technical decisions, schema patterns, conventions, data flows
- **[ROADMAP.md](./docs/ROADMAP.md)** — P1-P5 priorities, deuda técnica, 2026-Q2 timeline, blockers
- **[TESTING.md](./TESTING.md)** — E2E suite architecture, results, new tests, next steps

---

## Quick Commands

```bash
# Web (c:\Proyectos\reportaweb3)
npm run dev                   # http://localhost:3000
npm run build                 # build prod (must pass TS)
npm run test:e2e              # E2E suite (388 tests, ~40 min)
npm run types:supabase        # regen types/supabase.ts

# App (c:\Proyectos\reporta-app)
npm start                     # expo start --dev-client
cd android && gradlew assembleRelease   # APK
cd android && gradlew bundleRelease     # AAB
```

