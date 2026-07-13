# 📋 Technical Debt — Cloudflare Initiatives

**Date:** 2026-07-14  
**Status:** TRACKING  
**Owner:** Infrastructure Team

---

## 📌 Completed Items ✅

### ✅ Phase 1: Cloudflare Free Plan Settings (DEFERRED TO PRO PLAN)
- **Item:** Enable Brotli, Minification, Cache TTL on reportar.app
- **Status:** DEFERRED (requires Cloudflare Pro plan)
- **When:** After upgrading to Pro plan
- **Effort:** 15 minutes
- **Reference:** `/docs/julio13/PHASE1_CONTEXT.md`

**Action items when Pro activated:**
```
[ ] Enable Brotli compression (Speed → Compression)
[ ] Enable CSS/JS/HTML minification (Speed → Minify)
[ ] Set Browser Cache TTL to 4 hours (Caching → Caching Level)
[ ] Verify Web Analytics enabled
[ ] Run 3 validation tests
```

---

## 🔄 In Progress Items

### 🔄 Vercel → Cloudflare Pages Migration
- **Status:** PLANNED FOR IMMEDIATE EXECUTION
- **Timeline:** 2026-07-14 to 2026-07-17 (4 days)
- **Effort:** 6-8 hours total
- **Reference:** `/docs/julio13/MIGRATION_VERCEL_TO_CLOUDFLARE_PAGES.md`

**Phases:**
1. Phase 1: Setup & Deploy staging (web.reportar.app) — 2-3h
2. Phase 2: Deploy demo (demo.reportar.app) — 1-2h
3. Phase 3: Deploy production (live.reportar.app) + monitoring — 2-3h
4. Phase 4: Cleanup (delete Vercel) — 1h

**Deliverables:**
- [ ] `next.config.ts` updated for Cloudflare Pages
- [ ] `wrangler.toml` created
- [ ] All 3 environments deployed and validated
- [ ] Vercel project deleted
- [ ] Migration results documented

---

## 📅 Backlog Items (Future)

### Cloudflare Advanced Features (v3.13+)
```
[ ] Cloudflare Workers for edge logic
[ ] Custom caching rules optimization
[ ] Bot Management (Pro feature)
[ ] Advanced WAF rules
[ ] Regional failover configuration
```

**Effort:** 4-6 hours  
**ROI:** High (improved security + performance)

### Performance Monitoring Dashboard
```
[ ] Create custom Cloudflare analytics dashboard
[ ] Setup regional latency tracking (Colombia, Ecuador, Peru)
[ ] Integrate with Sentry for error correlation
[ ] Setup alerts for anomalies
```

**Effort:** 2-3 hours  
**Priority:** Medium (can be done post-migration)

---

## 💾 Deferred Items (Waiting for Conditions)

### ⏳ Phase 1 Free Plan Optimizations (WAITING: Cloudflare Pro)
- **Condition:** Cloudflare Pro plan active
- **Status:** DEFERRED
- **Action:** Apply when Pro activated (15 min task)

---

## 🎯 Success Metrics

### After Vercel → Cloudflare Pages Migration:
```
✅ Latency: 180-260ms → 50-90ms (70% improvement)
✅ Cache Hit Ratio: 60% → 85%+
✅ Bandwidth: -40% reduction
✅ Cost: Same ($20/mo for Cloudflare Pro vs Vercel Pro)
✅ Zero downtime during migration
✅ All features working (login, CRUD, real-time)
```

### After Cloudflare Pro Settings Activation:
```
✅ File size: -40-60% (Brotli)
✅ Page load: -10-15% additional (minification)
✅ Browser cache: 4 hours (faster repeat visits)
```

---

## 🔗 Related Documentation

- **Migration Plan:** `/docs/julio13/MIGRATION_VERCEL_TO_CLOUDFLARE_PAGES.md`
- **Phase 1 Settings:** `/docs/julio13/PHASE1_CONTEXT.md` (deferred)
- **Architecture:** `/docs/ARCHITECTURE.md` (needs update post-migration)
- **Deployment:** `DEPLOYMENT.md` (needs update for Cloudflare)

---

## 👤 Owner & Contact

- **Owner:** Infrastructure Team
- **Reviewer:** Tech Lead
- **Approval:** Product/CTO

---

**Last Updated:** 2026-07-14  
**Next Review:** After Phase 3 production deployment (2026-07-18)

---

## 🚨 Pendientes Post-Migración OpenNext (2026-07-13)

### 1. ⚠️ CRÍTICO: Migrar cron jobs (Vercel Crons eliminados)
`vercel.json` tenía 6 crons que YA NO CORREN al salir de Vercel:
- `/api/cron/epp-alertas` (diario 9:00) · `/api/cron/epp-reporte-semanal` (lunes 8:00)
- `/api/cron/documentos-vencidos` (diario 6:00) · `/api/cron/pdf-jobs` (diario 5:00)
- `/api/cron/trial-emails` (diario 8:00) · `/api/cron/trial-expiry` (diario 7:00)

**Opciones:** Cloudflare Cron Triggers (requiere handler `scheduled` en el worker
OpenNext) o un servicio externo (cron-job.org / GitHub Actions) que haga fetch a
las URLs con el header `Authorization: Bearer ${CRON_SECRET}`.

### 2. Subir APK a Supabase Storage
El APK (84 MB) se removió del repo (límite 25 MiB en Workers assets). El link en
`/descargar-app` ya apunta a `apks/app-reportar-v3.9.10.apk` en Supabase Storage.
**Acción:** subir el límite global de upload en Supabase (Settings → Storage,
plan permite hasta 500 MB) y subir el archivo. Largo plazo: Play Store.

### 3. Configurar Secrets en ambos Workers
En cada proyecto (demo y live) → Settings → Variables and Secrets, agregar como
**Secret**: `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `CRON_SECRET`,
`BUBBLE_API_TOKEN` (si aún se usa).

### 4. Regenerar types/supabase.ts con schema v3.11
Se restauró la versión de junio (2f0cec2). Falta `npx supabase login` y regenerar.
El script `types:supabase` sobrescribe el archivo aunque falle — corregirlo.
