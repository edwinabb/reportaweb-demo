# 📁 DOCUMENTACIÓN v3.11 — JULIO 12, 2026

**Fecha:** 2026-07-12  
**Objetivo:** Análisis exhaustivo de gaps + plan de migración inspecciones_detalles + cotizaciones_matriz  
**Alcance:** CISE del Perú SAC + GRÚAS del PACIFICO SAC

---

## 📋 ARCHIVOS PRINCIPALES (Leer en este orden)

### 1. **PARA ENTENDER EL CONTEXTO**

| Archivo | Propósito | Leer si... |
|---------|-----------|-----------|
| [MEMORY.md](MEMORY.md) | Índice de todos los análisis | Quieres un mapa rápido |
| [rule_migracion_tenants_scope.md](rule_migracion_tenants_scope.md) | **REGLA CRÍTICA:** Solo CISE + GRÚAS | Necesitas confirmar scope |
| [GAPS_CONFIRMADOS_MIGRACION.md](GAPS_CONFIRMADOS_MIGRACION.md) | Gaps reales del mapeo (cuál migrar, cuál ignorar) | Quieres saber qué está faltando |

### 2. **PARA ENTENDER LOS GAPS v3.11**

| Archivo | Propósito |
|---------|-----------|
| [GAPS_AND_ACTIONS.md](GAPS_AND_ACTIONS.md) | 12 gaps identificados (3 CRÍTICA, 5 MEDIA, 4 BAJA) |
| [v3.11-TICKETS.md](v3.11-TICKETS.md) | 6 tickets listos para backlog (15.5h) |
| [AUDITAR_BUBBLE_NO_MIGRADOS.md](AUDITAR_BUBBLE_NO_MIGRADOS.md) | Guía paso-a-paso para auditar Bubble |

### 3. **PARA MIGRAR INSPECCIONES_DETALLES + COTIZACIONES_MATRIZ**

| Archivo | Propósito | Acción |
|---------|-----------|--------|
| [PLAN_MIGRACION_GAPS_CRITICOS.md](PLAN_MIGRACION_GAPS_CRITICOS.md) | **LEER PRIMERO** — Plan completo con números | Ejecutar plan |
| [migracion-mapeo-bubble-supabase.md](migracion-mapeo-bubble-supabase.md) | Documento oficial de migración (2026-06-03) | Referencia técnica |

### 4. **ANÁLISIS TÉCNICOS (Referencia)**

| Archivo | Propósito |
|---------|-----------|
| [SCHEMA_VALIDATION.md](SCHEMA_VALIDATION.md) | Validación de 150 tablas en Supabase |
| [BUBBLE_COMPARISON.md](BUBBLE_COMPARISON.md) | Comparación 71% migrado OK, 3 gaps críticos |
| [BACKEND_DEPS.md](BACKEND_DEPS.md) | 200+ funciones analizadas (13 módulos) |
| [UI_DEPS.md](UI_DEPS.md) | 50+ componentes analizados (25+ páginas) |

---

## 🎯 RESUMEN EJECUTIVO

### Estado Actual (2026-07-12)

✅ **Análisis:** Exhaustivo (342k tokens, 5 documentos)  
✅ **Validación:** BD Supabase intacta (150 tablas, 14/14 críticas)  
✅ **Gaps:** 12 identificados, priorizados por criticidad  
✅ **Tickets:** 6 listos para v3.11 (15.5 horas)  

### Gaps v3.11 (15.5 horas)

| # | Gap | Prioridad | Esfuerzo | Estado |
|---|-----|-----------|----------|--------|
| REP-3.11-001 | PDFs Cotizaciones → Storage | 🔴 | 8h | Script listo |
| REP-3.11-002 | Auditar tareas_recursos (N:M) | 🔴 | 6h | SQL listo |
| REP-3.11-003 | Agregar progreso + tarea_padre_id | 🔴 | 4h | Schema listo |
| REP-3.11-004 | Migrar notas_internas | 🟡 | 1.5h | SQL listo |
| REP-3.11-005 | Auditar FK + Constraints | 🟡 | 2h | Queries listos |
| REP-3.11-006 | Sincronizar Catálogos | 🟡 | 1h | OK |

**Timeline:** Semana 2026-07-15 (1 dev FT, viernes 2026-07-19)

### Gaps Grandes (Próximas fases)

| Tabla | Bubble | Supabase | Gap | Acción |
|-------|--------|----------|-----|--------|
| `inspecciones_detalles` | 317,878 | 138,528 | ~180k | ✅ Plan v4 (paginación) |
| `cotizaciones_matriz` | 55,128 | 33,082 | ~22k | ❌ IGNORAR (huérfanos) |

---

## 📊 REGISTROS A MIGRAR (Inspecciones_detalles)

**Total:** ~175,000 registros

```
2026 (6m)  | CISE: 8k    | GRÚAS: 12k   | Total: 20k ✅
2025 (12m) | CISE: 16k   | GRÚAS: 24k   | Total: 40k ✅
2024 (12m) | CISE: 13k   | GRÚAS: 20k   | Total: 33k ✅
2023 (12m) | CISE: 11k   | GRÚAS: 17k   | Total: 28k ✅
2022 (12m) | CISE: 9k    | GRÚAS: 14k   | Total: 23k ✅
2021 (12m) | CISE: 7k    | GRÚAS: 11k   | Total: 18k ✅
2020 (12m) | CISE: 5k    | GRÚAS: 8k    | Total: 13k ⏳

TOTAL     | CISE: 69k   | GRÚAS: 106k  | 175k registros
```

**Para revisar pasos a seguir:** ~140k-175k (depende si incluir 2020)

---

## 🚀 PRÓXIMOS PASOS (INMEDIATOS)

### HOY (2026-07-12)

1. ✅ **Copia completada:** 50 archivos en `c:\Proyectos\reportaweb3\docs\julio12\`
2. ✅ **Plan creado:** PLAN_MIGRACION_GAPS_CRITICOS.md

### LUNES (2026-07-15)

3. [ ] **Auditoría Bubble:** Ejecutar queries para confirmar años/tenants
4. [ ] **Kickoff v3.11:** Asignar 6 tickets a devs
5. [ ] **Iniciar:**
   - REP-3.11-001: PDFs (8h)
   - REP-3.11-002: tareas_recursos (6h)
   - REP-3.11-003: campos tareas (4h)

### SEMANA DE 2026-07-22 (DESPUÉS de v3.11)

6. [ ] **Crear script v4:** migrate-inspecciones-detalles-v4.ts
7. [ ] **Test:** Validar paginación en TEST
8. [ ] **Ejecutar:** Migración completa en PROD (~3 horas)
9. [ ] **Validar:** FKs, counts, UI

---

## 📖 CÓMO USAR ESTE FOLDER

### Para devs trabajando en v3.11

```
1. Leer: GAPS_CONFIRMADOS_MIGRACION.md (qué falta, por qué)
2. Asignar: v3.11-TICKETS.md (6 tickets con SQL/pasos)
3. Ejecutar: Cada ticket según Timeline
4. Validar: Criterios de aceptación en cada ticket
```

### Para devs trabajando en inspecciones_detalles (v3.12)

```
1. Leer: PLAN_MIGRACION_GAPS_CRITICOS.md (estrategia)
2. Entender: Por qué paginación por trimestres (limitación API)
3. Crear: Script v4 con loop WINDOWS × TENANTS
4. Test: En TEST con auditoría de años
5. Ejecutar: En PROD con monitoreo
```

### Para PM/Stakeholders

```
1. Leer: Sección "RESUMEN EJECUTIVO" (arriba)
2. Revisar: Tabla de 6 tickets v3.11
3. Aprobar: Timeline (lunes-viernes 2026-07-15 a 2026-07-19)
4. Confirmar: Si migrar inspecciones_detalles (180k registros, ~3 horas)
```

---

## 📞 REFERENCIAS RÁPIDAS

### Tenants (SIEMPRE usar estos)

```
CISE del Perú SAC:      1cb97ec7-326c-4376-93ee-ed317d3da51b
GRÚAS del PACIFICO SAC: 6f4c923a-c3b7-47c2-9dea-2a187f274f73
```

### Credenciales

```
Ver: config_credentials_supabase.md
- ANON_KEY: En .env.local
- SERVICE_ROLE_KEY: En .env.local
- Bubble Token: <BUBBLE_API_TOKEN — ver .env.local>
```

### Queries SQL (Copiar/pega)

```
Ver: AUDITAR_GAPS_QUERIES.md (9 queries listos)
Ver: PLAN_MIGRACION_GAPS_CRITICOS.md (queries auditoría)
```

---

## ✅ CHECKLIST ANTES DE EMPEZAR v3.11

- [ ] REGLA leída: Solo CISE + GRÚAS
- [ ] Tickets asignados a 2+ devs
- [ ] Acceso a Bubble API confirmado
- [ ] Acceso a Supabase PROD confirmado
- [ ] Timeline: Lunes 2026-07-15 ✅
- [ ] Monitoreo: Slack channel #v3.11-recovery

---

**Última actualización:** 2026-07-12  
**Documentación:** Completa y lista  
**Status:** ✅ GO para v3.11  

---

**Preguntas?** Ver MEMORY.md (índice de toda la investigación)
