# Análisis Comparativo Bubble vs Supabase - Índice de Documentos

**Fecha:** 2026-07-12  
**Generado por:** Claude Agent - Post-Cutover Data Analysis  
**Versiones:** v3.10.41 (web) / v1.8.14 (app)

---

## 📋 Documentos Generados

Este análisis incluye **1,350 líneas de documentación** distribuidas en 3 archivos:

### 1. **COMPARACION_BUBBLE_SUPABASE.md** (670 líneas, 28 KB)

**Objetivo:** Análisis profundo y completo de estructura de datos.

**Contenido:**
- Resumen ejecutivo con hallazgos críticos
- Análisis detallado de 3 tablas principales (Cotizaciones, Tareas, Terceros)
- Campos: tipos de datos, equivalencias, gaps
- Archivos y documentos: ubicaciones, gaps de migración
- Mapeo completo Bubble → Supabase
- Recomendaciones y acciones priorizadas
- Checklists de validación pre/post-migración
- Referencias y anexos

**Para quién:** Arquitectos, leads técnicos, revisores de código

**Leer cuando:** Necesitas entender a fondo qué falta migrar y por qué.

---

### 2. **MIGRACION_DATOS_BUBBLE_GAPS.md** (397 líneas, 12 KB)

**Objetivo:** Acciones técnicas específicas y blockers.

**Contenido:**
- Quick reference de campos críticos no migrados
- DDL completo para crear tablas faltantes (tareas_maquinarias, tareas_personal, etc.)
- SQL para auditoría de integridad
- Matriz decisional: ¿migrar este campo?
- Backlog de tickets Jira (v3.11, v3.12)
- Scripts de validación post-migración
- Plan de migración de archivos (PDFs S3 → Supabase Storage)

**Para quién:** Desarrolladores, DBAs, ingenieros de datos

**Leer cuando:** Necesitas implementar las migraciones o crear tickets de trabajo.

---

### 3. **docs/BUBBLE_SUPABASE_QUICK_REFERENCE.md** (283 líneas, 13 KB)

**Objetivo:** Tablas de referencia rápida para consulta diaria.

**Contenido:**
- Mapeo de campos en tablas (Cotizaciones, Tareas, Terceros)
- Status visual (✓ Migrado, ✗ Gap, ~ Validar)
- Enums: valores en Bubble vs Supabase
- Ubicaciones de archivos/documentos
- Conteo de registros (estimado)
- Matriz decisional simplificada
- Tickets Jira sugeridos (copy-paste ready)
- Checklist de acciones inmediatas

**Para quién:** Product managers, cualquiera que necesite consulta rápida

**Leer cuando:** Necesitas una respuesta rápida sin leer 670 líneas.

---

## 🎯 Hallazgos Principales

### Datos Correctamente Migrados (71%)

| Tabla | Campos Migrados | Total | % |
|-------|-----------------|-------|---|
| Cotizaciones | 20 | 25 | 80% |
| Terceros | 14 | 18 | 78% |
| Tareas | 7 | 15 | 47% |
| **TOTAL** | **41** | **58** | **71%** |

### Gaps Críticos (3)

1. **Archivos PDFs (Cotizaciones)** — BLOCKER
   - Ubicación: AWS S3 legacy (`appforest_uf` bucket)
   - Cobertura: ~40-50% de cotizaciones
   - Acción: Migrar a Supabase Storage
   - Timeline: v3.11 (8 horas)

2. **Relaciones N:M (Tareas)** — MEDIUM
   - `lista_maquinaria` → Crear `tareas_maquinarias` (junction table)
   - `lista_personal` → Crear `tareas_personal` (junction table)
   - Timeline: v3.11 (8 horas)

3. **Campos de Progreso (Tareas)** — MEDIUM
   - `Progreso % - NUEVA 27-08` → `progreso_porcentaje` (INT 0-100)
   - `Tarea_Padre` → `tarea_padre_id` (FK a tareas)
   - Timeline: v3.11 (2 horas)

### Campos Deprecated (15+)

Tareas en Bubble tiene campos legacy con sufijos `-BORRAR-`, `-NUEVO-`:
```
estado-BORRAR-27-08, estado-NUEVO-27-08, con_informe -BORRAR-27-08,
Hora Inicio--BORRAR, lista_formatos-BORRAR, etc.
```
**Decisión:** IGNORAR SIEMPRE. NO copiar a Supabase.

### Normalización Mejorada (Supabase)

Supabase introdujo mejor estructura de datos:
- Contactos: Inline en Bubble → tabla `terceros_contactos` ✓
- Sitios: Inline en Bubble → tabla `terceros_sitios` ✓
- Personal: No existe Bubble → tabla `terceros_personal` (NEW)
- Relaciones: ARRAY en Bubble → junction tables (mejor diseño)

---

## 📊 Estadísticas

```
CAMPOS POR TABLA:
  Bubble.Cotizaciones:   35 campos
  Bubble.Tareas:         38 campos (15+ deprecated)
  Bubble.Terceros:       18 campos
  TOTAL Bubble:          91 campos

  Supabase.cotizaciones:           21 campos
  Supabase.tareas:                  8 campos
  Supabase.terceros:               10 campos
  Supabase (tablas relacionadas):   15 campos
  TOTAL Supabase:                  54 campos

CAMBIOS:
  Reducción de campos: 91 → 54 (41% simplificación)
  Pero MEJOR NORMALIZADOS (4 tablas extra)
  Mejora estructural: ✓ (junction tables en lugar de ARRAY)

REGISTROS (estimado):
  Cotizaciones:  ~500-600
  Tareas:        ~300-400
  Terceros:      ~150-200
  TOTAL:         ~950-1200
```

---

## 🚀 Timeline de Acciones

### v3.11 (Inmediato - 18 horas)

```
[8h]  Migrar PDFs Cotizaciones (CRÍTICO)
      - Auditar Bubble: contar Archivo_web
      - Script: descargar URLs S3 → Supabase Storage
      - Actualizar referencias pdf_url en cotizaciones

[4h]  Crear tareas_maquinarias
[4h]  Crear tareas_personal
[2h]  Agregar progreso_porcentaje a tareas
```

### v3.12 (Corto Plazo - 11 horas)

```
[3h]  Agregar tarea_padre_id (subtareas)
[6h]  Auditoría integridad (FKs, orfandad, estados)
[2h]  Validar estado_seniat vs condicion (Terceros)
```

### Q3 2027 (Largo Plazo - Deprecación)

```
[-]   Deprecar S3 Bubble bucket (12 meses de grace period)
      - Mantener acceso para references antiguas
      - Logging de accesos para medir adoption
      - Shutdown: Q3 2027
```

---

## 📖 Cómo Usar Esta Documentación

### Caso 1: "Necesito implementar las migraciones"

1. Lee: `MIGRACION_DATOS_BUBBLE_GAPS.md` → Secciones 2, 4, 6, 9
2. Obtén: DDL SQL listo para copiar
3. Crea: Tickets Jira desde sección 9
4. Consulta rápida: `docs/BUBBLE_SUPABASE_QUICK_REFERENCE.md` (cualquier momento)

### Caso 2: "¿Qué falta migrar?"

1. Lee rápido: `docs/BUBBLE_SUPABASE_QUICK_REFERENCE.md` (5 minutos)
2. Profundiza: `COMPARACION_BUBBLE_SUPABASE.md` → Secciones 1-3 (30 minutos)

### Caso 3: "Necesito explicar a la gerencia qué está pendiente"

1. Usa: Resumen ejecutivo de `COMPARACION_BUBBLE_SUPABASE.md`
2. Diagrama: Tabla en sección "HALLAZGOS PRINCIPALES" (este documento)
3. Timeline: Esta sección (abajo)

### Caso 4: "¿Cuáles son los campos exactos que mapean?"

1. Consulta: `docs/BUBBLE_SUPABASE_QUICK_REFERENCE.md` → Secciones 1-3 (tablas)

### Caso 5: "¿Qué archivos no se migraron?"

1. Lee: `COMPARACION_BUBBLE_SUPABASE.md` → Sección 4
2. Plan: `MIGRACION_DATOS_BUBBLE_GAPS.md` → Sección 7

---

## 🔍 Validaciones Requeridas

Antes de dar por "completa" la migración, ejecutar:

```sql
-- 1. ¿Todos los PDFs migrados?
SELECT COUNT(pdf_url) * 100.0 / COUNT(*) as pct_pdf
FROM cotizaciones;
-- Esperado: 100% (o cercano a % en Bubble)

-- 2. ¿Integridad FK?
SELECT COUNT(*) as orfanos
FROM cotizaciones c
LEFT JOIN terceros t ON c.cliente_id = t.id
WHERE t.id IS NULL;
-- Esperado: 0

-- 3. ¿Estados válidos?
SELECT DISTINCT estado FROM cotizaciones;
-- Esperado: BORRADOR, ENVIADA, APROBADA, RECHAZADA, VENCIDA

-- 4. ¿Progreso en rango?
SELECT COUNT(*) as invalidos
FROM tareas
WHERE progreso_porcentaje < 0 OR progreso_porcentaje > 100;
-- Esperado: 0
```

---

## 🎓 Referencias

### Documentos Relacionados (en repo)

- **CLAUDE.md** — Instrucciones del proyecto, stack, tenants
- **ARCHITECTURE.md** — Decisiones técnicas, patrones, convenciones
- **ROADMAP.md** — P1-P5 priorities, timeline 2026-Q2
- **TESTING.md** — E2E suite, resultados actuales (347/374 ✓ 92.8%)

### Archivos de Configuración

- **/types/cotizaciones.ts** — Tipos TypeScript (referencias)
- **/types/terceros.ts** — Tipos TypeScript (referencias)
- **/supabase/migrations/** — Migraciones DDL (fuente de verdad)

### APIs Externas

- **Bubble API:** `https://reporta.la/api/1.1/obj/` (legacy, legacy token required)
- **Supabase REST:** `https://wioozisskjjgjjybsoqo.supabase.co/rest/v1/`
- **Supabase Storage:** `https://wioozisskjjgjjybsoqo.supabase.co/storage/v1/`

---

## ✅ Checklist de Revisión

Antes de dar por cerrado este análisis:

- [x] Muestreo de 100 registros por tabla en Bubble
- [x] Extracción de estructura completa (campos, tipos)
- [x] Comparación con migraciones Supabase
- [x] Identificación de gaps y campos deprecated
- [x] Análisis de archivos (PDFs, logos, etc.)
- [x] Generación de DDL para tablas faltantes
- [x] Queries SQL de validación
- [x] Estimados de horas por tarea
- [x] Timeline v3.11 y v3.12

Pendiente (para ejecutar):
- [ ] Validar conteos reales en Bubble vs Supabase
- [ ] Ejecutar auditoría de integridad FK
- [ ] Crear tickets Jira y asignar en sprints
- [ ] Implementar migraciones v3.11
- [ ] Auditoría post-v3.11

---

## 📞 Contacto / Propietario

**Análisis generado por:** Claude Agent (Anthropic)  
**Fecha:** 2026-07-12  
**Repositorio:** C:\Proyectos\reportaweb3  
**Versión Post-Cutover:** 3.10.41 (web) / 1.8.14 (app)

**Próxima revisión:** Post v3.11 release (August 2026)

---

## 📄 Resumen de Archivos

| Archivo | Líneas | Size | Auditor | Para Quién |
|---------|--------|------|---------|-----------|
| COMPARACION_BUBBLE_SUPABASE.md | 670 | 28 KB | Detallado | Arquitectos, Leads |
| MIGRACION_DATOS_BUBBLE_GAPS.md | 397 | 12 KB | Técnico | Developers, DBAs |
| docs/BUBBLE_SUPABASE_QUICK_REFERENCE.md | 283 | 13 KB | Quick | PM, Any User |
| **TOTAL** | **1,350** | **53 KB** | — | — |

---

**🎯 Acción Inmediata:** Leer `docs/BUBBLE_SUPABASE_QUICK_REFERENCE.md` (5 min) para overview rápido.

**📚 Profundidad:** Leer `COMPARACION_BUBBLE_SUPABASE.md` (30 min) para contexto completo.

**🛠️ Implementación:** Usar `MIGRACION_DATOS_BUBBLE_GAPS.md` (15 min + coding) para ejecutar.
