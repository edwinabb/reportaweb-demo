# Auditoría UI ↔ Datos — 04 · Planificación

**Fecha:** 2026-07-22 · **Módulo:** 4/15 (Planificación)
**Formato de referencia:** `03-terceros.md` (template v1.2)
**Screenshots Bubble:** `c:/tmp/screenshots/reportar/3 Planificacion/` (listado, ver tarea, editar wizard 3 pasos, + bindings "diseño")
**Datos BD PROD:** conteos verificados 2026-07-15 (`PRE-AUDIT-2026-07-15-maquinaria-planificacion.md`), solo CISE + GRUAS. ⚠️ **Re-confirmar contra Bubble LIVE antes del go-live** (Bubble sigue recibiendo ediciones 2026 — ver §6).
**DUDAs:** PLAN-001/002/003 ya resueltas en la pre-auditoría (ver §Decisiones). Este doc consolida el mapeo formal.

---

## Resumen Ejecutivo

- **Vista principal:** herramienta semanal con 3 modos — `LIST` (`PlanificacionTable`) · `PERSONAL` y `MAQUINARIA` (`ResourceTimeline`). No es un listado estándar → template v1.2 aplica **parcial** (decisión DUDA-PLAN-002).
- **Menú Bubble:** PLANIFICACIÓN = listado semanal agrupado por día + wizard de 3 pasos (Info General · Asignar Personal · Asignar Maquinaria).
- **Menú nuevo:** `/planificacion` (3 modos + diálogos `TareaDetailDialog`, `EditarFechasDialog`, `EditRecursosDialog`) · `/planificacion/nueva` (crear **y** editar `?tarea=<id>`, `NuevaTareaForm` 3 tabs) · `/tareas` → redirect legacy.

**Modelo de datos (3 tablas, migración 20260418170000):**
- `tareas` (header: titulo, estado, cliente/cotizacion, sitio, hora_inicio/fin, codigo `T-YYYY-XXXX`, prioridad, confirmada…)
- `tareas_fechas` (intervalos: `fecha_inicio`/`fecha_fin` o `fechas_multiples` date[])
- `tareas_recursos` (por intervalo vía `tarea_fecha_id`: PERSONAL|MAQUINARIA, personal_id/maquinaria_id, proveedor_id, recurso_externo_nombre)
- Listado leído vía MV `mv_planificacion_diaria` (join por `tarea_fecha_id`).

**Hallazgos críticos (datos):**
1. 🔴 **8.694 recursos invisibles (`tarea_fecha_id NULL`, 22% del total)** — la MV y el detalle unen por `tarea_fecha_id`; estos recursos existen en tabla pero NO se renderizan en ninguna vista. Causa raíz: **2.567 tareas migradas sin ninguna fila en `tareas_fechas`** (CISE 2.326 = 47%). El seed REP-3.11-002 logró 100% de cobertura *a nivel tabla* pero no resolvió la visibilidad. Ver #P1 + DUDA-PLAN-001.
2. 🔴 **123 tareas de 2026 sin fechas** (39 CISE + 84 GRUAS, última 2026-06-03) → no aparecen en `/planificacion` y pueden ser operativamente relevantes. Segmento A de la auditoría contra Bubble (§6 pre-audit): recuperables.

**Defectos encontrados:** ver §"Otros hallazgos" (fechas UTC/local, race condition de código, campos sin UI). **DUDA-PLAN-003 (editar destruía fechas/recursos) → YA CORREGIDA 2026-07-15.**

### Cobertura BD PROD (2026-07-15, CISE / GRUAS)

| Tabla / métrica | CISE | GRUAS | Total |
|---|---:|---:|---:|
| tareas | 4.974 | 9.537 | 14.511 |
| tareas **sin** `tareas_fechas` | 2.326 (47%) | 241 (2,5%) | 2.567 |
| tareas_recursos (PERSONAL) | 4.774 | 14.738 | 19.512 |
| tareas_recursos (MAQUINARIA) | 4.644 | 14.804 | 19.448 |
| recursos `tarea_fecha_id` NULL | 2.577 | 6.117 | **8.694 (22%)** |
| tareas_comentarios | 0 | 0 | 0 |

---

## Decisiones del usuario YA TOMADAS (no son DUDA)

| ID | Decisión (2026-07-15) |
|----|----------------------|
| DUDA-PLAN-002 | Se **acepta la UX de calendario** con reglas parciales del template v1.2: **descripción de página, export XLS del listado y tarjeta de toolbar**. No se exige Activos\|Papelera, embudos ni paginación. Adicional: evaluar **impresión PDF carta horizontal** de las vistas semanales (personal/maquinaria). |
| DUDA-PLAN-003 | **HECHO**: rehidratación completa en `nueva-tarea-form.tsx` (todas las fechas + recursos), sync calendario↔asignaciones, y guardado insertar-antes-de-borrar en `createTarea`/`updateTareaIntervals`. |
| DUDA-PLAN-001 | **Investigado** (auditoría 100% de las 2.567 contra Bubble Data API): propuesta mixta por segmento (§6 pre-audit) **pendiente de aprobación del usuario** — ver TK-P1 abajo. |
| Huérfanos de código | `components/planificacion/nueva-tarea-wizard.tsx` (reemplazado por `NuevaTareaForm`) — **NO borrar**, revisar en conjunto (DUDA-LIMPIEZA-001). |

---

## 1. LISTADO (modo LIST)

**Path Bubble:** PLANIFICACIÓN (listado semanal agrupado por día)
**Path reportaweb3:** `/planificacion` modo LIST · `page.tsx` (client) → `components/planificacion/planificacion-table.tsx`
**Datos BD:** 14.511 tareas (CISE 4.974, GRUAS 9.537)

### 1.1 Columnas de la lista

| Elemento | Campo Bubble | Tabla.columna Supabase | UI nueva (reportaweb3) | Dato migrado | Status | Notas |
|---|---|---|---|---|---|---|
| Estado (semáforo) | punto verde/gris | tareas.confirmada / estado | ✅ (indicador) | ✅ | ✅ OK | |
| HORARIO | `id_hora_inicio's HoraDesplegar - id_hora_final's HoraDesplegar` | tareas.hora_inicio / hora_fin (`time`) | ✅ ("Horario") | ✅ | ✅ OK | |
| TAREA | `codigo:uppercase` (T-XXXX) | tareas.codigo | ✅ ("Tarea") | ✅ | ✅ OK | |
| DESCRIPCIÓN | `titulo:uppercase` | tareas.titulo | ⚠️ **Fusionada** en columna "Tarea" (código + título) | ✅ | ⚪ Rediseño | Bubble tenía columna propia; el nuevo la combina — aceptable |
| PERSONAL | `lista_personal:count` + nombres | tareas_fechas → tareas_recursos (PERSONAL) | ✅ ("Personal") | ⚠️ recursos con `tarea_fecha_id` NULL no se muestran | 🔴 **Gap #P1** | Ver hallazgo crítico |
| MAQUINARIA | `lista_maquinaria:count` + `Proveedor_id's razon_social` | tareas_recursos (MAQUINARIA) + proveedor | ✅ ("Maquinaria") | ⚠️ ídem #P1 | 🔴 **Gap #P1** | |
| INFORMES | íconos + contador | `getInformesCount` (inspecciones/reportes) | ✅ ("Informes", contadores) | ✅ | ✅ OK | |
| CLIENTE | `id_cotizacion's cliente_id's razon_social:upper` | tareas.cotizacion_id → cotizaciones → terceros | ✅ (fusionada "Cliente / Cotización") | ✅ | ⚪ Rediseño | Bubble tenía Cliente y Cotización en 2 columnas |
| COTIZACIÓN | `id_cotizacion's Codigo` | cotizaciones.codigo | ✅ (misma columna "Cliente / Cotización") | ✅ | ⚪ Rediseño | |
| SITIO | `id_sitio's nombre` | tareas.sitio_id → terceros_sitios.nombre | ✅ ("Sitio") | ✅ | ✅ OK | |
| AUTOR | `Creator's first_name + last_name` | tareas.created_by → profiles | ✅ ("Autor") | ✅ | ✅ OK | |
| Acción: Ver (👁) | ícono ojo | — | ✅ (abre `TareaDetailDialog`) | — | ✅ OK | |
| Acción: Eliminar (🗑) | ícono papelera | tareas.is_active | ✅ | — | ✅ OK | |
| Buscador | 🔍 | multicampo (título/código/cliente/sitio) | ✅ multicampo | — | ✅ OK | Fuera de tarjeta (DUDA-PLAN-002: aceptado) |
| Selector de vista | "Listado" dropdown | — | ✅ LIST/PERSONAL/MAQUINARIA | — | ✅ OK | |
| Navegación semanal (Hoy / ‹ ›) | control de semana | — | ✅ | — | ✅ OK | |
| Ícono descarga (↓) | export de tabla | — | ❌ Sin export XLS del listado | — | 🟡 **Gap UI (DUDA-PLAN-002)** | Template parcial: XLS SÍ se pidió |
| PageDescription + h1 sr-only | — | — | ❌ Falta | — | 🟡 **Gap UI (DUDA-PLAN-002)** | |
| Toolbar en tarjeta blanca | — | — | ⚠️ header `bg-gray-50/50` (no `bg-muted/50`) | — | 🟡 **Gap UI (DUDA-PLAN-002)** | |
| Nueva Tarea | "Nueva Tarea" (naranja) | — | ✅ → `/planificacion/nueva` | — | ✅ OK | |

**Clasificación de gaps — Listado:**
- 🔴 **Gap migración #P1 (CRÍTICO):** 8.694 recursos con `tarea_fecha_id` NULL invisibles; 2.567 tareas sin `tareas_fechas` (incl. 123 de 2026). Propuesta mixta por segmento (TK-P1). [ver §6 pre-audit]
- 🟡 **Gap UI #P2 (DUDA-PLAN-002):** aplicar template parcial: PageDescription + h1 sr-only, export XLS del listado, tarjeta de toolbar (`bg-muted/50`). [2h]

---

## 2. VER TAREA (`TareaDetailDialog`)

**Path Bubble:** popup "TAREA T-XXXX" (con botón Editar)
**Path reportaweb3:** `components/tareas/tarea-detail-dialog.tsx`

| Elemento | Campo Bubble | Tabla.columna Supabase | UI nueva | Dato migrado | Status | Notas |
|---|---|---|---|---|---|---|
| Título "TAREA T-XXXX + nombre" | codigo + titulo | tareas.codigo / titulo | ✅ | ✅ | ✅ OK | |
| FECHA Y HORA | fecha(s) + horas | tareas_fechas + hora_inicio/fin | ✅ | ⚠️ tareas sin fechas → vacío | 🔴 #P1 | |
| CLIENTE | cotización → cliente | cotizaciones → terceros | ✅ | ✅ | ✅ OK | |
| COTIZACIÓN | `id_cotizacion's Codigo` | cotizaciones.codigo | ✅ | ✅ | ✅ OK | |
| SITIO | `id_sitio's nombre` | terceros_sitios.nombre | ✅ | ✅ | ✅ OK | |
| PRIORIDAD | prioridad | tareas.prioridad | ✅ (muestra "MEDIA") | ⚠️ siempre 'MEDIA' | 🟡 #P4 | Sin control UI en alta (siempre MEDIA) |
| ¿CONFIRMADA? | confirmada (Si/No) | tareas.confirmada | ✅ | ✅ | ✅ OK | |
| COMENTARIOS O INSTRUCCIONES | comentarios | tareas.comentarios | ✅ ("Sin comentarios" si vacío) | ✅ | ✅ OK | |
| PERSONAL (chips) | lista_personal | tareas_recursos (PERSONAL) | ✅ (chips) | ⚠️ #P1 | 🔴 #P1 | |
| EQUIPOS - MAQUINARIA (chips) | lista_maquinaria | tareas_recursos (MAQUINARIA) | ✅ (chips) | ⚠️ #P1 | 🔴 #P1 | |
| Accesos: PERSONAL / MAQUINARIA / P.ACCIÓN | íconos | diálogos edición + planes_accion | ✅ | — | ✅ OK | |
| SELECCIONE OTRO FORMATO (crear informe) | select formato + ➕ | formatos / informes | ✅ | — | ✅ OK | |
| REPORTES DEL <fecha> | informes de la fecha | inspecciones/reportes | ✅ | ✅ | ✅ OK | |
| Cerrar / Editar | botones | — | ✅ (Editar → `/planificacion/nueva?tarea=<id>`) | — | ✅ OK | |

**Gaps — Ver tarea:** heredado #P1 (fechas/recursos vacíos en tareas sin `tareas_fechas`).

---

## 3. EDITAR / CREAR (wizard 3 pasos · `NuevaTareaForm`)

**Path Bubble:** wizard PASO 1 Información General · PASO 2 Asignar Personal · PASO 3 Asignar Maquinaria
**Path reportaweb3:** `/planificacion/nueva` (`?tarea=<id>` para editar) · `nueva-tarea-form.tsx` (3 tabs)

### 3.1 PASO 1 — Información General

| Elemento | Campo Bubble | Tabla.columna Supabase | UI nueva | Dato migrado | Status | Notas |
|---|---|---|---|---|---|---|
| Título de la tarea * | titulo | tareas.titulo | ✅ (requerido) | ✅ | ✅ OK | |
| Cliente | id_cotizacion → cliente | tareas.cotizacion_id → terceros | ✅ (select) | ✅ | ✅ OK | |
| Contacto del cliente (+ Celular) | contacto | terceros_contactos | ✅ | ⚠️ depende de contactos | 🟡 | |
| RUC (readonly) | cliente's ruc | terceros.ruc | ✅ | ✅ | ✅ OK | |
| Sitio | id_sitio | tareas.sitio_id → terceros_sitios | ✅ (select) | ✅ | ✅ OK | |
| Cotización (readonly) + Fecha de envío | id_cotizacion's Codigo | cotizaciones | ✅ | ✅ | ✅ OK | |
| Fecha(s) de ejecución * | calendario multi-select | tareas_fechas (fecha_inicio/fin o fechas_multiples) | ✅ (calendario) | 🔴 #P1 (2.567 sin fechas) | 🔴 #P1 | |
| Hora de inicio * / finalización * | horas | tareas.hora_inicio / hora_fin | ✅ | ✅ | ✅ OK | |
| Prioridad | prioridad | tareas.prioridad | ⚠️ existe en FormData pero **sin campo UI** → siempre 'MEDIA' | ⚠️ | 🟡 **#P4** | Bubble tenía select |
| ¿Confirmada? (toggle) | confirmada | tareas.confirmada | ✅ (toggle) | ✅ | ✅ OK | |
| Tipo de Tarea (TURNOS…) | tipo_tarea | tareas.tipo_tarea | ✅ (select) | ✅ | ✅ OK | |
| Comentarios o instrucciones especiales | comentarios | tareas.comentarios | ✅ (textarea) | ✅ | ✅ OK | |
| Validación (zod/rhf) | — | — | ⚠️ **manual por toasts** (sin zod/react-hook-form) | — | 🟡 **#P5** | Único form del sistema sin zod |

### 3.2 PASO 2 — Asignar Personal · 3.3 PASO 3 — Asignar Maquinaria

| Elemento | Campo Bubble | Tabla.columna Supabase | UI nueva | Dato migrado | Status | Notas |
|---|---|---|---|---|---|---|
| Scope de fechas (todas / desde esta / solo seleccionada) | 3 radios | lógica de intervalos | ⚠️ FUTURE/SINGLE **deshabilitados** ("Próximamente") | — | 🟡 **#P6** | Solo "todas las fechas" activo (`nueva-tarea-form.tsx:973-980`) |
| Interno / Externo | radios | tareas_recursos.recurso_externo_nombre / proveedor_id | ✅ | ✅ | ✅ OK | |
| Grupo de usuarios (personal) | select grupo | grupos de trabajo | ✅ | — | ✅ OK | |
| Proveedor de recursos humanos / Tipo de equipo | select | proveedor_id | ✅ | — | ✅ OK | |
| Personal / Equipo (select + ➕ alta) | select + alta inline | personal_id / maquinaria_id | ✅ | ✅ | ✅ OK | |
| Lista "asignado" (+ rol / eliminar) | chips con rol | tareas_recursos | ✅ | ⚠️ #P1 | 🔴 #P1 | |
| Timeline semanal por recurso (abajo) | plan semanal | derivado de assignments | ✅ (`ResourceTimeline`) | ⚠️ #P1 | 🔴 #P1 | |
| Guardado (editar) | — | createTarea/updateTareaIntervals | ✅ **insertar-antes-de-borrar** (DUDA-PLAN-003 fix) | — | ✅ OK | Antes destruía datos; corregido 2026-07-15 |

**Clasificación de gaps — Wizard:**
- 🟡 **#P4:** `prioridad` sin control UI (siempre 'MEDIA'); Bubble tenía select. Agregar campo. [30 min]
- 🟡 **#P5:** migrar `NuevaTareaForm` a react-hook-form + zod (hoy validación manual por toasts). [3h]
- 🟡 **#P6:** habilitar scope FUTURE/SINGLE de asignación (hoy "Próximamente"). [decisión + 3h]
- 🟠 **#P7 (bug latente):** código `T-YYYY-XXXX` por `count(*)` → race condition en creaciones simultáneas (`planificacion.ts:288-294`). Usar secuencia/constraint único. [1h]
- 🟠 **#P8:** fechas sin util central, mezcla UTC/local → off-by-one (Perú UTC-5) en `editar-fechas-dialog.tsx:57-64`, `tarea-detail-dialog.tsx:828-851`. Centralizar en util UTC. [2h]

---

## 4. Impresión PDF vistas semanales (propuesta DUDA-PLAN-002)

Requerimiento: imprimir timeline semanal (personal / maquinaria) en **carta horizontal**.
Repo ya tiene los patrones: route group `app/(print)/` (`@media print` + `@page`) y Gotenberg (`/api/pdf/generate`).
**Propuesta v1:** ruta `app/(print)/planificacion/imprimir?vista=personal|maquinaria&semana=YYYY-MM-DD` (`@page { size: letter landscape }`) + botón "🖨 PDF" en `/planificacion`. Fase 2: descarga server-side vía Gotenberg. → **TK-P9** [4h]

---

## Tickets de Implementación Propuestos

### 🔴 CRÍTICO
1. **TK-P1:** Resolver recursos invisibles (`tarea_fecha_id` NULL) — **requiere aprobar propuesta mixta por segmento** (§6 pre-audit): A) migrar fechas de Bubble + re-vincular recursos para 1.932 recuperables (incl. 120 de 2026); B) dejar 635 sin fecha (tienen informes/reportes, no limpiar); C) revisar 3 deshabilitadas. Incluye **delta-sync final de tareas 2026** (Bubble sigue editándose). [~8h + aprobación DUDA-PLAN-001]

### 🟡 MEDIA
2. **TK-P2:** Template v1.2 parcial en `/planificacion` (PageDescription + h1 sr-only · export XLS del listado · tarjeta de toolbar `bg-muted/50`). [2h]
3. **TK-P4:** Campo `prioridad` en el wizard (hoy siempre 'MEDIA'). [30 min]
4. **TK-P5:** Migrar `NuevaTareaForm` a react-hook-form + zod. [3h]
5. **TK-P6:** Habilitar scope de asignación FUTURE/SINGLE. [3h]
6. **TK-P9:** Impresión PDF carta horizontal de vistas semanales. [4h]

### 🟠 BUGS
7. **TK-P7:** Código de tarea sin race condition (secuencia/constraint). [1h]
8. **TK-P8:** Centralizar manejo de fechas UTC (off-by-one Perú). [2h]

### 🟢 BAJA / LIMPIEZA
9. **TK-P10:** `tareas_comentarios` (0 filas ambos tenants) — confirmar si la UI la usa o retirar. Huérfano `nueva-tarea-wizard.tsx` (DUDA-LIMPIEZA-001, revisar juntos). Funciones sin uso `addRecursoToIntervalo`/`removeRecurso`.

---

## Próximos Pasos

1. **Aprobar DUDA-PLAN-001** (propuesta mixta A/B/C) → ejecutar **TK-P1** (crítico del módulo, desbloquea 8.694 recursos + 123 tareas 2026).
2. **TK-P2** (template parcial) + **TK-P4/P7/P8** (quick wins).
3. **Re-confirmar cobertura contra Bubble LIVE** (gate de go-live, tarea transversal X1 del plan de cutover).
4. Cerrar módulo 4 en el tracker `docs/UI-TEMPLATE-LISTADOS.md` con firma del usuario (§4 `VALIDATION-CHECKLIST-TEMPLATE.md`).
