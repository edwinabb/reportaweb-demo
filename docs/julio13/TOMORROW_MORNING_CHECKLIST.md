# Tomorrow Morning Checklist — 2026-07-14 09:00 UTC

**Objective:** Review E2E results and make Go/No-Go decision for production cutover

---

## 09:00 — Gather Results

### 1. Read E2E Final Results
```bash
# Check test summary
tail -50 /c/tmp/e2e-final.log | grep -E "passed|failed|skipped"

# Count total
grep -c "  ok  " /c/tmp/e2e-final.log  # passing
grep -c "  x  " /c/tmp/e2e-final.log   # failing
```

### 2. Categorize Failures
- [ ] Are failures data-related (seeding issue)?
- [ ] Are failures framework bugs (code issue)?
- [ ] Are failures FK constraints (schema issue)?
- [ ] Are failures timeout (infrastructure issue)?

### 3. Review Analysis Document
- Read: `E2E_FAILURE_ANALYSIS.md`
- Known issues: Terceros, Maquinaria modules
- Fix options documented

---

## 09:30 — Make Decision

### Go Criteria (✅ if ALL met)
- [x] E2E smoke: 20/20 passing
- [ ] E2E full: 350+/374 passing
- [ ] Critical features working (auth, cotizaciones)
- [ ] No framework bugs
- [ ] Data issues have known fixes

### No-Go Criteria (❌ if ANY met)
- [ ] E2E full: <340/374 passing
- [ ] Critical business logic broken
- [ ] Unknown framework bugs
- [ ] Schema corruption detected
- [ ] Security issues

### Decision Options

**OPTION A: GO LIVE (10:00)**
```
Preconditions:
  - E2E: 350+/374 passing
  - All critical features work
  - Only data-related gaps

Next:
  1. Configure prod secrets (10:00)
  2. DNS cutover (10:30)
  3. 48h monitoring (starts 10:30)
```

**OPTION B: CONDITIONAL GO (10:00 + gap fixes)**
```
Preconditions:
  - E2E: 340-350 passing
  - Gaps are data-seeding only
  - Framework is stable

Next:
  1. Seed missing data (09:30-10:00)
  2. Re-run failed tests (10:00-10:30)
  3. DNS cutover if re-run passes
  4. Otherwise delay 24h
```

**OPTION C: DELAY (Hold for investigation)**
```
Preconditions:
  - E2E: <340 passing
  - Unknown bugs detected
  - Schema issues found

Next:
  1. Investigate root cause (09:30-12:00)
  2. Fix in code/DB (12:00-14:00)
  3. Re-run E2E (14:00-15:00)
  4. Reschedule cutover (tomorrow or next week)
```

---

## 10:00 — Pre-Cutover Setup (If GO/CONDITIONAL GO)

### Configure Production Secrets
**Location:** Cloudflare Dashboard → reportaweb3-live worker

```
Settings → Variables and Secrets

ADD SECRETS:
☐ SUPABASE_SERVICE_ROLE_KEY
  Value: [from .env.local PROD_SUPABASE_SERVICE_ROLE_KEY]

☐ RESEND_API_KEY
  Value: [from .env.local]

☐ CRON_SECRET
  Value: [from .env.local]

VERIFY PUBLIC VARIABLES:
☐ NEXT_PUBLIC_SUPABASE_URL
  = https://fqwhagryqkkhbgznxtwf.supabase.co

☐ NEXT_PUBLIC_SUPABASE_ANON_KEY
  = [prod anon key]
```

### Verify Monitoring Ready
```
☐ Sentry dashboard loads
☐ CloudFlare analytics visible
☐ Alerts configured (if using)
☐ Team on standby
☐ Rollback procedure reviewed
```

---

## 10:30 — DNS Cutover (If GO)

### Pre-Cutover Verification
```bash
# Test current live (should route to Vercel)
curl -I https://live.reportar.app
# Expected: 200 OK from Vercel
```

### Execute Cutover
1. **Cloudflare Dashboard**
   - Domain Settings → DNS Records
   - Find: live → CNAME record
   - Change target to: `reportaweb3-live.` (Cloudflare Workers)
   - Save

2. **Verify New Route**
   ```bash
   curl -I https://live.reportar.app
   # Expected: 200 OK from Cloudflare
   ```

3. **Test Critical Path**
   - Open: https://live.reportar.app/login
   - Login with admin account
   - Verify dashboard loads (no 500 errors)
   - Check DevTools: Network tab → Supabase calls complete

### 🚀 GO LIVE
Once verified, cutover is complete. Begin monitoring.

---

## Post-Cutover: Monitoring Schedule

### 10:30-12:30: INTENSE (Every 5 min)
```
☐ Site loads (curl check)
☐ Sentry: 0 errors
☐ CloudFlare: normal traffic
☐ Latency: <100ms
☐ Cache: >50%
☐ No 50x errors
```

### 12:30-16:30: MODERATE (Every 15 min)
```
Same checks as INTENSE
Action if error rate >1%: Rollback
```

### 16:30+: LIGHT (Every 30 min)
```
Key metrics only
Alert if error rate >0.5%
```

### Daily (48h total)
```
Morning: 09:00 review
Evening: 17:00 review
Success after 48h: Document + celebrate
```

---

## Rollback Procedure (If Needed)

**Time to Execute:** 5-10 minutes  
**Data Loss:** None

```
1. Identify issue:
   - Sentry spike
   - Latency >300ms
   - Cache broken
   - Login failing

2. Execute rollback:
   - Cloudflare Dashboard → DNS
   - Change live CNAME back to Vercel
   - Save & flush cache
   - Verify: curl https://live.reportar.app

3. Post-mortem:
   - What failed?
   - Fix in code/config
   - Re-test on demo
   - Retry tomorrow
```

---

## Documents Ready for Reference

✅ CLOUDFLARE_MIGRATION_COMPLETE.md  
✅ PRODUCTION_CUTOVER_PLAN.md  
✅ E2E_FAILURE_ANALYSIS.md  
✅ EXECUTIVE_SUMMARY_2026-07-13.md  
✅ DEMO_TEST_DB_SETUP.md  

All in git, all committed.

---

## Key Contacts

**Engineering Lead:** [Your name/contact]  
**DevOps On-Call:** [Contact]  
**Support Lead:** [Contact]  

Know who to alert if things break.

---

## Summary

```
09:00  Read E2E results (30 min)
09:30  Make Go/No-Go decision (30 min)
10:00  Configure prod + cutover (60 min)
10:30  🚀 GO LIVE or 🛑 HOLD
10:30+ Monitoring (48 hours)
```

**Good luck! You've got this.** 🚀

---

*Generated: 2026-07-13 02:30 UTC*  
*Status: Ready for execution*
