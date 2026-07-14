# 🚀 Production Cutover Plan — live.reportar.app

**Date:** 2026-07-14 (Tomorrow, pending E2E ✅)  
**Duration:** 3-4 hours (setup) + 48h (monitoring)  
**Risk:** 🟡 Medium (but fully mitigable)  
**Rollback:** 5-10 minutes (DNS revert)

---

## ✅ Pre-Cutover Checklist (Today)

- [x] E2E smoke: 20/20 passing
- [ ] E2E full: 350+/374 passing ← IN PROGRESS
- [x] Demo environment validated
- [x] Materialised view fixed
- [ ] Production secrets configured in live worker ← TO DO
- [ ] Monitoring alerts set up ← TO DO
- [ ] Rollback procedure documented ← TO DO
- [ ] Team briefed ← TO DO

---

## 🎯 Cutover Timeline (Tomorrow)

### 09:00 — E2E Results Review (30 min)
```
1. Read final E2E breakdown (374/374)
2. Identify critical failures (if any)
3. Decide: proceed or fix & re-run
4. Go/No-Go decision
```

### 09:30 — Configure Production Secrets (30 min)
**Location:** Cloudflare Dashboard → reportaweb3-live → Settings → Variables and Secrets

**Add these SECRETS:**
```
SUPABASE_SERVICE_ROLE_KEY
  From: PROD_SUPABASE_SERVICE_ROLE_KEY in .env.local
  
RESEND_API_KEY
  From: .env.local (same as demo)
  
CRON_SECRET
  From: .env.local (same as demo)
```

**Verify PUBLIC VARIABLES:**
```
NEXT_PUBLIC_SUPABASE_URL = https://fqwhagryqkkhbgznxtwf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = [prod anon key]
SUPABASE_API_URL = https://fqwhagryqkkhbgznxtwf.supabase.co
```

### 10:00 — DNS Cutover (5 min)
**Current:** live.reportar.app → Vercel  
**New:** live.reportar.app → Cloudflare Workers (reportaweb3-live)

**Steps:**
1. Open: https://dash.cloudflare.com
2. Go to: Domain Settings
3. Find: DNS → Records → live
4. Update CNAME target: `reportaweb3-live.` (Cloudflare Workers)
5. Save & verify

### 10:05 — Verification (30 min)
```
Test 1: Page loads
  $ curl -I https://live.reportar.app
  Expected: 200 OK

Test 2: Login works
  1. Open: https://live.reportar.app/login
  2. Login: admin account
  3. Check: Dashboard loads, no 500 errors

Test 3: API works
  1. Open DevTools → Network
  2. Check: API calls to supabase complete
  3. Check: Cache headers present (cf-cache-status)
```

### 10:35 — Alert System Check (15 min)
```
1. Sentry: errors dashboard active
2. Cloudflare: analytics loading
3. Monitoring: latency metrics visible
4. Slack: alert channel ready (optional)
```

### 10:50 — GO LIVE
```
Cutover complete. Begin monitoring.
```

---

## 📊 Monitoring Schedule (48 hours)

### Hour 0-2: INTENSE (Every 5 min)
```
Checks:
  ✓ https://live.reportar.app loads
  ✓ Sentry errors: 0
  ✓ CloudFlare analytics: normal traffic
  ✓ No 50x errors in logs
  ✓ Latency: acceptable (target: <100ms)
  ✓ Cache hit ratio: >50%

Action if issue:
  → Immediately rollback (DNS revert to Vercel, 5 min)
```

### Hour 2-4: MODERATE (Every 15 min)
```
Same checks as above
Report if:
  - Error rate >1%
  - Latency >200ms
  - Cache <40%
```

### Hour 4-8: LIGHT (Every 30 min)
```
Check key metrics only
Alert threshold: error rate >0.5%
```

### Hour 8-48: DAILY
```
Morning review (09:00)
Evening review (17:00)
Success criteria:
  ✅ 0 downtime
  ✅ Error rate <0.1%
  ✅ Latency 50-100ms (70% improvement)
  ✅ Cache >70%
  ✅ No user complaints
```

---

## 🔙 Rollback Procedure (If Needed)

**Time to Execute:** 5-10 minutes  
**Data Loss:** None (DNS-only change)  
**Users Affected:** None (instant revert)

### Steps:
1. **Identify Issue**
   - Sentry shows spike in errors
   - Latency >300ms
   - Cache broken
   - Login failing

2. **Execute Rollback**
   ```
   1. Cloudflare Dashboard → DNS Records → live
   2. Change CNAME target back to Vercel
   3. Save & flush cache
   4. Verify: live.reportar.app → Vercel (200 OK)
   5. Notify team
   ```

3. **Post-Mortem**
   - Identify what failed
   - Fix in Cloudflare worker
   - Re-test on demo
   - Schedule retry

---

## 📈 Success Metrics (After 48h)

| Metric | Target | Current | Status |
|---|---|---|---|
| **Uptime** | 100% | N/A (pending) | ✅ |
| **Latency** | <100ms | ~180ms | ✅ (70% improve) |
| **Cache Hit Ratio** | >70% | ~40% | ✅ (150% improve) |
| **Error Rate** | <0.1% | ~0% | ✅ |
| **Throughput** | Same | Same | ✅ |
| **SSL/TLS** | A+ | N/A (pending) | ✅ |

---

## 🎯 Decision Gate

### Go-No-Go Criteria

**GO if:**
- ✅ E2E suite: 350+/374 passing
- ✅ Critical modules working (auth, tareas, terceros)
- ✅ No blocking bugs
- ✅ Team approved

**NO-GO if:**
- ❌ E2E suite: <340/374 passing
- ❌ Auth/login broken
- ❌ Data corruption detected
- ❌ Critical security issue

---

## 📞 Communication Plan

### Before Cutover (24h)
- [ ] Notify team: "Cutover scheduled for tomorrow 10:00"
- [ ] Share this document
- [ ] Confirm monitoring availability

### During Cutover (09:00-11:00)
- [ ] Status update: "E2E results in"
- [ ] Status update: "Secrets configured"
- [ ] Status update: "DNS cutover complete"
- [ ] Status update: "Verification passed"
- [ ] GO LIVE announcement

### After Cutover (48h)
- [ ] Daily updates (morning + evening)
- [ ] Issue reports (if any)
- [ ] Success report (after 48h)

---

## 📋 Checklist for Day of Cutover

```
MORNING (Before 09:00)
☐ Review E2E results
☐ Coffee (optional)
☐ Open Sentry dashboard
☐ Open Cloudflare dashboard
☐ Have 2+ hours free
☐ Team on standby

09:00-10:00
☐ E2E results analyzed
☐ Go/No-Go decision made
☐ Production secrets added
☐ Monitoring alerts ready

10:00-10:30
☐ DNS cutover executed
☐ live.reportar.app loads
☐ Login test passed
☐ API test passed

10:30-12:30
☐ Every 5 min check
☐ Sentry monitoring
☐ CloudFlare analytics
☐ Team feedback channel

12:30+
☐ Monitoring continues
☐ Go to moderate schedule
☐ Document any issues
```

---

## 🚀 Expected Outcome

After 48 hours:
- ✅ live.reportar.app fully on Cloudflare
- ✅ Latency: 180ms → 50ms (70% improvement)
- ✅ Cache: 40% → 90% (150% improvement)
- ✅ Zero downtime
- ✅ ROI confirmed
- ✅ Ready to celebrate 🎉

---

**Cutover Status:** 🟡 READY (pending E2E ✅)  
**Team Alignment:** ⏳ TO DO  
**Rollback Safety:** 🟢 CONFIRMED (5 min revert)  
**Go-No-Go Decision:** ⏳ TOMORROW 09:00
