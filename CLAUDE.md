# CLAUDE.md — REPORTA · Contexto de sesión

## Ecosistema

**REPORTA** — SaaS de gestión operativa para empresas de grúas/maquinaria pesada. Multi-tenant.

| Repo | Ruta | Stack | Versión |
|------|------|-------|---------|
| Web admin | `c:\Proyectos\reportaweb3` | Next.js 16, React 19, TypeScript, Tailwind, Radix | **3.12.0** |
| App móvil | `c:\Proyectos\reporta-app` | Expo 54, expo-router, SQLite/Drizzle, React Native | **1.8.14** |
| DB / Backend | Supabase test `oyrokyyaeaeqzlsgxtto` (Brazil) / prod `fqwhagryqkkhbgznxtwf` (Brazil) | PostgreSQL + Auth + Storage | — |

**Tenants:** CISE `1cb97ec7-326c-4376-93ee-ed317d3da51b` · GRUAS `6f4c923a-c3b7-47c2-9dea-2a187f274f73`

**Infra:** Cloudflare Workers + OpenNext (**dev.reportar.app** → BD test · **reportar.app** apex → BD prod) · Repos deploy: `reportaweb-demo` / `reportaweb-live` (GitHub integration) · Gotenberg (PDF) · Resend (dominio verificado: `reportar.app`, from: `noreply@reportar.app`) · Sentry (solo client-side) · Cloudflare DNS

**Estándar de dominios (2026-07-22):** un solo dominio de cara al cliente — `reportar.app` (apex) = home con login embebido + `/novedades` + landings de campaña (prefijo por definir: marca/marketing) + `/registro` + app. `dev.reportar.app` = interno (BD test). `www` → 301 apex. `/login` → 301 a `/`. Nunca hardcodear dominio (usar `NEXT_PUBLIC_SITE_URL`). Detalle en [ARCHITECTURE.md § Domain & Routing Standard](./docs/ARCHITECTURE.md) · portable en [PLAYBOOK-DOMAIN-STRATEGY.md](./docs/PLAYBOOK-DOMAIN-STRATEGY.md). Home/landings/novedades = Growth Engine (track ventas).

> Detalle de deployment: [ARCHITECTURE.md § Infrastructure](./docs/ARCHITECTURE.md). Vercel fue reemplazado el 2026-07-13; cron jobs pendientes de migrar.

---

## Estado Actual

**Date:** 2026-07-23  
**Web Version:** v3.12.0 — ✅ demo · live: anon rotada a `sb_publishable_` en `.env.production`/`wrangler.live.toml`; deploy en curso. **Pendiente dashboard (usuario):** cargar secret `SUPABASE_SERVICE_ROLE_KEY=sb_secret_` en worker `reportaweb-live` + bindear dominio live.reportar.app (sigue 522 hasta entonces) + deshabilitar legacy keys (cierra DUDA-SEC-001)  
**App Version:** v1.8.14  
**Foco activo (2026-07-23):** 🔀 **Cutover CISE/GRUAS (Bubble → v3)** — sacar a los 2 únicos clientes reales de Bubble. Plan: [docs/superpowers/plans/2026-07-22-cutover-cise-gruas.md](./docs/superpowers/plans/2026-07-22-cutover-cise-gruas.md) · handoff del día: [HANDOFF-2026-07-23.md](./docs/HANDOFF-2026-07-23.md). Migración ~95% a nivel tabla; bloqueante = **gaps de migración a nivel campo** que revela la auditoría UI. Acceso a Bubble LIVE confirmado (token de `.env.local` funciona). **Growth Engine PAUSADO** (specs+planes A–E ✅; ver [PLAN-GROWTH-ENGINE-JOURNEY.md](./docs/PLAN-GROWTH-ENGINE-JOURNEY.md) + [HANDOFF-2026-07-18.md](./docs/HANDOFF-2026-07-18.md) para retomar).  
**Auditoría UI:** Módulo **4/15** (Planificación) ✅ matriz en [docs/auditoria-ui/04-planificacion.md](./docs/auditoria-ui/04-planificacion.md) (DUDAs PLAN-001/002/003 resueltas; DUDA-PLAN-001 espera aprobación para TK-P1). Terceros (3/15): 5 DUDAs resueltas con datos de Bubble LIVE (03-terceros.md §Resolución).  
**Template listados:** v1.2 aplicado a Usuarios, Maquinaria y Terceros  
**E2E Suite:** ⚠️ desactualizada tras template v1.2 + cambio personal externo (DUDA-E2E-001 · TESTING.md § TEST-003)

**Deploy demo (pipeline funcionando):**
- Push a `demo/master` → Cloudflare Workers Builds (worker `reportaweb-demo`)
- Build: `npm run build:demo && npx opennextjs-cloudflare build` (usa `.env.demo` → BD TEST)
- Deploy: `npx wrangler deploy --config wrangler.demo.toml`
- Secrets del worker (dashboard): `SUPABASE_SERVICE_ROLE_KEY` (TEST)
- **reportar.app** (prod): ⚠️ entorno Cloudflare AÚN NO creado (falta importar repo `reportaweb-live` a Workers Builds + secret `sb_secret_` + bindear apex). Rebinding pendiente: `demo.reportar.app`→`dev.reportar.app`.

**Próximo paso (usuario):** aplicar migración esquema Terceros `20260723120000` (test→prod) + `npm run types:supabase` · cargar service-role PROD en `.env.local` (o instalar MCP Supabase read-only) para validar steps de catálogo contra PROD · screenshots módulos 5–15. Detalle en [HANDOFF-2026-07-23.md](./docs/HANDOFF-2026-07-23.md).  
**Deudas técnicas:** [docs/TECHNICAL_DEBTS.md](./docs/TECHNICAL_DEBTS.md) (rotar key PROD = ALTA)

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

