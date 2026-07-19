# CLAUDE.md — REPORTA · Contexto de sesión

## Ecosistema

**REPORTA** — SaaS de gestión operativa para empresas de grúas/maquinaria pesada. Multi-tenant.

| Repo | Ruta | Stack | Versión |
|------|------|-------|---------|
| Web admin | `c:\Proyectos\reportaweb3` | Next.js 16, React 19, TypeScript, Tailwind, Radix | **3.11.4** |
| App móvil | `c:\Proyectos\reporta-app` | Expo 54, expo-router, SQLite/Drizzle, React Native | **1.8.14** |
| DB / Backend | Supabase test `oyrokyyaeaeqzlsgxtto` (Brazil) / prod `fqwhagryqkkhbgznxtwf` (Brazil) | PostgreSQL + Auth + Storage | — |

**Tenants:** CISE `1cb97ec7-326c-4376-93ee-ed317d3da51b` · GRUAS `6f4c923a-c3b7-47c2-9dea-2a187f274f73`

**Infra:** Cloudflare Workers + OpenNext (demo.reportar.app → BD test · live.reportar.app → BD prod) · Repos deploy: `reportaweb-demo` / `reportaweb-live` (GitHub integration) · Gotenberg (PDF) · Resend (dominio verificado: `reportar.app`, from: `noreply@reportar.app`) · Sentry (solo client-side) · Cloudflare DNS

> Detalle de deployment: [ARCHITECTURE.md § Infrastructure](./docs/ARCHITECTURE.md). Vercel fue reemplazado el 2026-07-13; cron jobs pendientes de migrar.

---

## Estado Actual

**Date:** 2026-07-18  
**Web Version:** v3.11.4 — ✅ demo · live: worker `reportaweb-live` desplegado vía GitHub pero **dominio live.reportar.app SIN enrutar al worker (522)** — entorno live aún no listo (falta binding de dominio + secret `SUPABASE_SERVICE_ROLE_KEY` + rotar key)  
**App Version:** v1.8.14  
**Foco activo:** 🚀 **Growth Engine** (leads→trial→cliente) — diseño en curso. Ver [HANDOFF-2026-07-18.md](./docs/HANDOFF-2026-07-18.md) para retomar. Playbook portable (reuso en Impulsar, agosto) en [docs/PLAYBOOK-GROWTH-ENGINE.md](./docs/PLAYBOOK-GROWTH-ENGINE.md). Sub-proyecto A: spec + plan listos; B: spec listo; C/D/E pendientes.  
**Auditoría UI:** Módulo 3/15 (Terceros) ✅ template v1.2 + fixes de revisión aplicados (personal externo migrado a `profiles` — DUDA-TER-006); matriz en [docs/auditoria-ui/03-terceros.md](./docs/auditoria-ui/03-terceros.md) — pausada por foco en Growth Engine  
**Template listados:** v1.2 aplicado a Usuarios, Maquinaria y Terceros  
**E2E Suite:** ⚠️ desactualizada tras template v1.2 + cambio personal externo (DUDA-E2E-001 · TESTING.md § TEST-003)

**Deploy demo (pipeline funcionando):**
- Push a `demo/master` → Cloudflare Workers Builds (worker `reportaweb-demo`)
- Build: `npm run build:demo && npx opennextjs-cloudflare build` (usa `.env.demo` → BD TEST)
- Deploy: `npx wrangler deploy --config wrangler.demo.toml`
- Secrets del worker (dashboard): `SUPABASE_SERVICE_ROLE_KEY` (TEST)
- live.reportar.app: ⚠️ deploy AÚN NO configurado (usar `wrangler.live.toml` + build normal)

**Próximo paso:** Módulo 2 (Maquinaria) — plan en [docs/auditoria-ui/PLAN-2026-07-15-MAQUINARIA.md](./docs/auditoria-ui/PLAN-2026-07-15-MAQUINARIA.md)  
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

