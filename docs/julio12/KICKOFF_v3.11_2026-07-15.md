# 🚀 KICKOFF v3.11 — LUNES 2026-07-15

**Estado:** ✅ GO  
**BD:** Íntegra, validada, lista  
**Timeline:** Semana 2026-07-15 a 2026-07-19  
**Equipo:** 2-3 devs (paralelo)  
**Esfuerzo:** 15.5 horas totales  

---

## 📋 RESUMEN EJECUTIVO

**Qué es v3.11:**
Validación + arreglo de 6 gaps pequeños en Supabase (NON migración masiva — eso ya pasó).

**Por qué ahora:**
- ✅ Bubble limpiado (datos ya migrados 2026-05-30)
- ✅ Supabase íntegra (288k registros, 0 huérfanos)
- ✅ Todos los gaps identificados y priorizados

**Resultado esperado:**
BD 100% operativa, listo para v3.12 y beyond.

---

## 🎯 LOS 6 TICKETS

### 🔴 CRÍTICOS (11 horas)

#### **REP-3.11-001** — PDFs Cotizaciones (8h)
**Qué:** Validar que 40-50 PDFs de cotizaciones están en Supabase Storage  
**Por qué:** Sistema espera `cotizaciones.pdf_url` → Storage  
**Pasos:**
```sql
-- 1. Contar PDFs en Storage
SELECT COUNT(*) FROM storage.objects 
WHERE bucket_id = 'cotizaciones' 
  AND name LIKE '%.pdf';

-- 2. Contar cotizaciones con pdf_url válido
SELECT COUNT(*) FROM cotizaciones 
WHERE pdf_url LIKE '%supabase%' 
  AND pdf_url IS NOT NULL;

-- 3. Si alguno es 0 → ejecutar migrate-all-bubble-cdn-files.ts
npx tsx scripts/migrate-all-bubble-cdn-files.ts
```
**Criterios de aceptación:**
- ✅ 40+ PDFs en Storage
- ✅ cotizaciones.pdf_url actualizado 100%
- ✅ Links públicos funcionan (test manual)

---

#### **REP-3.11-002** — tareas_recursos Validación (6h)
**Qué:** Verificar que todas las tareas tienen recursos asignados  
**Por qué:** Planificación depende de tareas.recursos  
**Pasos:**
```sql
-- 1. Contar tareas con recursos
SELECT 
  COUNT(DISTINCT t.id) as total_tareas,
  COUNT(DISTINCT CASE WHEN tr.id IS NOT NULL THEN t.id END) as con_recursos
FROM tareas t
LEFT JOIN tareas_recursos tr ON t.id = tr.tarea_id
WHERE t.is_active = true;

-- 2. Si hay gap → investigar qué tareas faltan
SELECT t.id, t.codigo, t.titulo
FROM tareas t
LEFT JOIN tareas_recursos tr ON t.id = tr.tarea_id
WHERE t.is_active = true AND tr.id IS NULL;

-- 3. Si es aceptable el gap → documentar
```
**Criterios de aceptación:**
- ✅ 95%+ de tareas con recursos
- ✅ Gap < 50 tareas (aceptable)
- ✅ Reporte documentado

---

#### **REP-3.11-003** — Campos Faltantes (4h)
**Qué:** Agregar `progreso_porcentaje` + `tarea_padre_id` a tareas  
**Por qué:** Dashboard + Planificación los necesitan  
**Pasos:**
```sql
-- 1. Crear columnas
ALTER TABLE tareas ADD COLUMN progreso_porcentaje NUMERIC(5,2) DEFAULT 0;
ALTER TABLE tareas ADD COLUMN tarea_padre_id UUID REFERENCES tareas(id) ON DELETE SET NULL;

-- 2. Migrar datos de Bubble (si existen)
-- [Ver script migrate-tareas-campos.ts]

-- 3. Validar
SELECT COUNT(*) FROM tareas WHERE progreso_porcentaje > 0;  -- Should be 400+
SELECT COUNT(*) FROM tareas WHERE tarea_padre_id IS NOT NULL;  -- Should be 50
```
**Criterios de aceptación:**
- ✅ Columnas creadas
- ✅ 400+ registros con progreso migrado
- ✅ 50 subtareas vinculadas
- ✅ RLS policy validada

---

### 🟡 MEDIA PRIORIDAD (4.5 horas)

#### **REP-3.11-004** — notas_internas Cotizaciones (1.5h)
```sql
ALTER TABLE cotizaciones ADD COLUMN notas_internas TEXT;
UPDATE cotizaciones SET notas_internas = '...' FROM bubble_cotizaciones;
```

#### **REP-3.11-005** — FK Integrity Audit (2h)
```sql
-- Ejecutar todas las queries en AUDITAR_GAPS_QUERIES.md
-- Verificar 0 huérfanos en todas las FK críticas
```

#### **REP-3.11-006** — Sincronizar Catálogos (1h)
```sql
-- Verificar rowcounts:
SELECT 'rubros' as tabla, COUNT(*) FROM rubros
UNION ALL SELECT 'paises', COUNT(*) FROM paises
UNION ALL SELECT 'servicios', COUNT(*) FROM servicios;
-- Si alguno < esperado, llevar faltantes
```

---

## 📅 PLAN SEMANAL

### **LUNES 2026-07-15 (Kickoff)**

**09:00 AM — Standup Kickoff (30 min)**
```
Agenda:
- Estado general: BD íntegra ✅
- 6 tickets: roles asignados
- Timeline: 15-19 (viernes cierre)
- Blockers: ¿acceso a Bubble? ¿credenciales Supabase?
- Slack channel: #v3.11-recovery (crear si no existe)

Decidir:
- Dev A: REP-3.11-001 + 002
- Dev B: REP-3.11-003 + 004
- Dev C: REP-3.11-005 + 006
```

**10:00 AM — Dev Time**
- Cada dev comienza su ticket
- Slack updates cada 2 horas

---

### **MARTES 2026-07-16**

**09:00 AM — Progress Check (15 min)**
- REP-3.11-001: PDFs validados? ✅ or ❓
- REP-3.11-002: Gap aceptable? ✅ or ❓
- REP-3.11-003: Campos creados? ✅ or ❓

**If blocker:** Escalar inmediatamente

---

### **MIÉRCOLES 2026-07-17**

**Merge PRs + Validación**
- Code review rápido (2 horas)
- Merge a develop
- Smoke tests en TEST

---

### **JUEVES 2026-07-18**

**E2E Testing**
- Correr suite completa: `npm run test:e2e`
- Meta: 347+/374 tests passing
- Fix cualquier regresión

---

### **VIERNES 2026-07-19 (Cierre)**

**09:00 AM — Final Validation (1h)**
```
Checklist:
- ✅ 6 tickets completados
- ✅ 0 test failures
- ✅ Documentación de cambios
- ✅ Reporte final generado
```

**10:00 AM — Release**
- Tag v3.11.0 en git
- Update CHANGELOG.md
- Announce en Slack #releases

---

## 🔧 HERRAMIENTAS + ACCESO

### Credenciales Necesarias

**Supabase:**
```
URL: https://fqwhagryqkkhbgznxtwf.supabase.co
ANON_KEY: eyJhbGciOiJIUzI1NiIs...
SERVICE_ROLE: eyJhbGciOiJIUzI1NiIs...
```

**Bubble API:**
```
Token: <BUBBLE_API_TOKEN — ver .env.local>
URL: https://reporta.la/api/1.1/obj
```

### Scripts Disponibles

```bash
# Auditoría Supabase
npx tsx scripts/audit-supabase-integrity.ts

# Auditoría Bubble
npx tsx scripts/audit-bubble-gaps.ts

# Migrar PDFs
npx tsx scripts/migrate-all-bubble-cdn-files.ts

# Tests
npm run test:e2e        # Full suite
npm run test:e2e --tag @dev-only  # Quick tests
```

### Documentación

```
c:\Proyectos\reportaweb3\docs\julio12\

├─ README.md                      ← START HERE
├─ v3.11-TICKETS.md               ← Detalles SQL
├─ AUDITAR_GAPS_QUERIES.md        ← Queries FK
├─ AUDITORIA_SUPABASE_INTEGRIDAD.md  ← Estado actual BD
└─ PLAN_MIGRACION_GAPS_CRITICOS.md  ← Contexto histórico
```

---

## ✅ CHECKLIST PRE-KICKOFF

**DEV LEAD — Verificar AHORA:**

- [ ] Crear Slack channel #v3.11-recovery
- [ ] Asignar devs a tickets (ver arriba)
- [ ] Verificar acceso a Supabase TEST + PROD
- [ ] Verificar acceso a Bubble API (token = 5532c3b...)
- [ ] Pull latest develop branch
- [ ] Install dependencies: `npm install`

**EQUIPO — Leer AHORA (30 min):**

- [ ] README.md en docs/julio12
- [ ] Tu ticket específico (REP-3.11-00X)
- [ ] Pasos SQL en v3.11-TICKETS.md

**Blockers CONOCIDOS:**

- ❌ Ninguno documentado
- ⚠️ Si Bubble no responde: usar fallback (SQL directo)
- ⚠️ Si Supabase lento: usar TEST environment primero

---

## 🎯 SUCCESS METRICS

**v3.11 se considera DONE cuando:**

```
✅ 6 tickets completados + merged
✅ E2E suite: 347/374 tests passing
✅ 0 regressions detectadas
✅ Documentación actualizada
✅ Changelog completo
```

**v3.11 se considera SHIPPED cuando:**

```
✅ Tag v3.11.0 creado
✅ Vercel auto-deploy completado
✅ Smoke tests en PROD pasados
✅ Team notificado en Slack
```

---

## 📞 ESCALATION

**Si algo se tranca:**

1. **Slack:** Post en #v3.11-recovery con `@dev-lead`
2. **GitHub:** Crear issue y asignar a `@dev-lead`
3. **Call:** Agendar 15min sync si es BLOCKER

---

## 📊 TRACKING

**Daily Standup:**
```
09:00 AM LUNES-VIERNES
Formato: 
  ✅ Qué hice ayer
  🏗️  Qué hago hoy
  🚧 Blockers (si hay)
```

**Slack Updates:**
- 12:00 PM: Midday checkpoint
- 05:00 PM: EOD status

---

## 🎉 FINAL

**La BD está lista.** Los datos están seguros. Los tickets están claros.

**Solo falta que el equipo los ejecute.**

---

**Kickoff:** Lunes 2026-07-15 09:00 AM  
**Cierre:** Viernes 2026-07-19 10:00 AM  
**Versión:** v3.11.0  

**¡VAMOS! 🚀**

---

## 📌 QUICK LINKS

- [Tickets detallados](v3.11-TICKETS.md)
- [Auditoría Supabase](AUDITORIA_SUPABASE_INTEGRIDAD.md)
- [Auditoría Bubble](AUDITORIA_BUBBLE_RESULTADOS_2026-07-13.md)
- [Plan de migración](PLAN_MIGRACION_GAPS_CRITICOS.md)

---

**Preparado por:** Claude Code  
**Fecha:** 2026-07-13  
**Status:** ✅ READY TO GO  
