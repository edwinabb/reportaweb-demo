# Roadmap — REPORTA

Priorities, deuda técnica, and timeline for stakeholders and product.

**Last Updated:** 2026-07-23  
**Current State:** v3.12.0 · **Foco: Cutover CISE/GRUAS (Bubble → v3)**

---

## 🔀 FOCO ACTUAL — Cutover CISE/GRUAS (2026-07-23)

Sacar a los **2 únicos clientes reales** (CISE + GRUAS) de Bubble a la v3. La migración está
~95% a nivel tabla; el bloqueante son **gaps de migración a nivel campo** que revela la auditoría
UI ↔ datos módulo por módulo. Plan maestro: [superpowers/plans/2026-07-22-cutover-cise-gruas.md](./superpowers/plans/2026-07-22-cutover-cise-gruas.md) · handoff: [HANDOFF-2026-07-23.md](./HANDOFF-2026-07-23.md).

### Progreso

| Área | Estado |
|------|--------|
| Acceso a BD (Management API vía `SUPABASE_ACCESS_TOKEN`) | ✅ Resuelto |
| Auditoría UI: Usuarios·Maquinaria·Terceros·**Planificación (4/15)** | 🟢 Auditados |
| **Terceros: esquema + re-migración de campos a PROD** | ✅ **Cerrado** (rubro/ubicación/SUNAT/cargo-área/sitios) |
| Módulos 5–15 (Cotizaciones, Ventas, Compras, Informes, EPP, Config, …) | ⬜ Pendiente (faltan screenshots) |
| Planificación TK-P1 (recursos invisibles) | ⏳ Espera aprobación DUDA-PLAN-001 |
| Delta-sync final desde Bubble LIVE | ⬜ Pendiente (DT-MIG-DELTA) |
| Suite E2E actualizada (template v1.2) | ⬜ Pendiente (DUDA-E2E-001) |
| Deploy prod (`reportar.app` apex + worker live) | ⬜ Pendiente |

### Próximos pasos

1. Regenerar `types/supabase.ts` (DT-TYPES-001) + build local antes de deploy (DT-BUILD-001).
2. Aprobar DUDA-PLAN-001 → ejecutar TK-P1 de Planificación.
3. Seguir auditoría por módulos (5+) resolviendo gaps de campo con re-migraciones idempotentes.
4. Delta-sync final + E2E verde + entorno Cloudflare prod → **corte comunicado a CISE/GRUAS**.

> **Growth Engine** (leads→trial→pago) queda **pausado**: specs+planes A–E ✅, sin implementar.
> Ver [PLAN-GROWTH-ENGINE-JOURNEY.md](./PLAN-GROWTH-ENGINE-JOURNEY.md).

---

## 📦 Histórico — P1-P5 (2026-Q2, pre-cutover)

> Sección de referencia; muchos ítems mencionan Vercel (reemplazado 2026-07-13 por Cloudflare) y v3.10.x.

## P1-P5 Items (Critical Path)

### P1 🔴 E2E Viewer Auth (Status: ⏳ In Progress)

**Issue:** 18 E2E tests failing with viewer auth redirect to /login

**Root Cause:** Supabase TEST JWT TTL is 3600s (1 hour); E2E suite runs ~40 min; token expires mid-suite → refresh_token consumed → next viewer test loads stale token

**Solution:** Increase JWT TTL in Supabase TEST from 3600s → 7200s (2 hours)

**Action:** Manual in Supabase dashboard (TEST project > Authentication > Settings > JWT expiry)

**Timeline:** 2026-06-08 EOD

**Expected Impact:** 21 viewer tests → passing; E2E suite 347/374 → 366+/374

---

### P2 🟢 Flow 6 Personal Names (Status: ✅ Complete)

**Issue:** Personal names not appearing in "Reportes" tab of tarea detail

**Fix Applied:** JOIN syntax updated in query: `personal:profiles!reportes_personal_personal_id_fkey(*)`

**Commit:** 55c4120

**Verified:** Test passing

---

### P3 🟢 Toggle INTERNO/EXTERNO (Status: ✅ Complete)

**Issue:** Toggle buttons not rendering in reporte personal form

**Fix Applied:** Default config added when DB config is null; form now renders toggle buttons

**Commit:** 2cc6836

**Verified:** Test passing

---

### P4 🟡 Play Store Upload (Status: ⏳ Blocked on Credentials)

**What's Done:** AAB generated (61 MB) at `app/build/outputs/bundle/release/app-release.aab`

**Blocker:** Google Play Console credentials (API key, signing key) pending from ops

**Action:** Ops: upload AAB to Play Store Internal Testing → promote to Open Testing when stable

**Timeline:** 2026-06-09 (waiting on ops)

---

### P5 🟢 Trial Registration (Status: ✅ Complete)

**Feature:** `/registro` flow for prospects → auto-seed demo data → send welcome email

**What's Done:**
- RESEND_API_KEY configured
- Redirect logic fixed (router.push → window.location.href)
- UX spinner + completion message added

**Commit:** e9d0f4c

**Verified:** Flow tested end-to-end

---

## Deuda Técnica (Technical Debt)

### DT-QA-VIEWER: E2E Viewer Auth Tests (21 tests, Priority: HIGH)

**Issue:** Viewer auth tests fail because JWT TTL expires during suite

**Status:** 🔴 Blocker — awaiting P1 fix (TTL increase)

**Once P1 Fixed:** Re-run E2E suite; viewer tests should pass

**Effort:** 0 (just re-run; fix is infrastructure, not code)

---

### DT-QA-FLOW6: Flow 6 + Toggle (2 tests, Priority: MEDIUM)

**Issue:** Two related test failures in personal reporting flow

**Status:** 🟢 Complete — P2 + P3 fixes resolved both

**Tests:** Passing as of 2026-06-07

---

### DT-WEB-OG01: OG Image /descargar-app (Priority: LOW)

**Issue:** `opengraph-image.tsx` generates empty PNG in edge runtime (fetch circular ref)

**Current:** Fallback to static `og-image.jpg` works

**Status:** 🟡 Deferred — investigate 3 options:
1. Use `nodejs` runtime + `fs.readFileSync`
2. Embed image as static import
3. Create dedicated og-image 1200×630 in Figma/Canva

**Timeline:** 2026-06-22 (post-launch stabilization)

---

### DT-WEB-AUTO: Vercel Auto-Deploy (Priority: MEDIUM)

**Issue:** Automatic builds from master are ignored by Vercel (4s cancel with "Ignored Build Step")

**Status:** 🟡 Pending investigation

**Likely Cause:** Vercel → Settings → Git → Ignored Build Step has a blocking command

**Action:** Review Vercel dashboard; remove or fix the build-step filter

**Timeline:** 2026-06-10

---

### DT-DEMO-01: Onboarding for Demos (Priority: MEDIUM)

**Issue:** No auto-reset demo tenant for prospect demos

**Solution:** Create tenant DEMO + pg_cron job that resets it every 24h

**Status:** 🟡 Pending — ops + DB setup required

**Timeline:** 2026-06-15 (sales enablement)

---

## Timeline 2026-Q2

### Week of 2026-06-08 (This Week)

- [ ] P1: JWT TTL increase in Supabase TEST
- [ ] P4: Play Store upload (ops credentials)
- [ ] E2E suite re-run post-P1 fix → confirm 370+ / 374 passing
- [ ] DT-WEB-AUTO: Investigate Vercel ignored build step

**Milestone:** E2E suite 95%+ passing; P1-P5 closed

---

### Week of 2026-06-15

- [ ] E2E suite v2 (multi-rol, ~1100 tests) — investigate scope
- [ ] App distribution: TestFlight (iOS) if demand signals
- [ ] DT-DEMO-01: Onboarding demo tenant setup (sales enablement)

**Milestone:** Multi-rol E2E framework ready; demo environment operational

---

### Week of 2026-06-22

- [ ] Stabilization + bug fixes from live usage
- [ ] Competitive features brainstorm + roadmap v2
- [ ] DT-WEB-OG01: OG image investigation (if not urgent)

**Milestone:** Production stable; feature prioritization locked for next quarter

---

## Blockers & Dependencies

| Blocker | Owner | Status | Impact | ETA |
|---------|-------|--------|--------|-----|
| Supabase TEST JWT TTL | Claude | 🔴 Critical | 18 E2E tests fail | 2026-06-08 |
| Play Store credentials | Ops | 🟡 High | Can't upload AAB | 2026-06-09 |
| Vercel build-step filter | Ops | 🟡 Medium | Auto-deploy broken | 2026-06-10 |
| Demo tenant setup | Ops + DB | 🟡 Medium | Sales can't demo | 2026-06-15 |

---

## Success Metrics

- E2E suite: 370+/374 passing (95%+)
- Play Store: AAB uploaded, Open Testing channel live
- Demo: Auto-reset tenant operational
- Auto-deploy: Working without manual force-push

---

## Next Review: 2026-06-15

Check progress on:
1. P1 TTL increase impact (did E2E go to 95%+?)
2. Play Store upload completion
3. Demo tenant setup (any blockers?)
4. E2E suite v2 scope (is 1100 tests realistic?)
