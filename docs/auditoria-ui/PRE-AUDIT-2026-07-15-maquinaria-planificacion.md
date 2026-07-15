# Pre-auditoría técnica — Maquinaria + Planificación

**Fecha:** 2026-07-15
**Alcance:** revisión de código (rutas/componentes/actions) + cobertura de datos en BD PROD (solo CISE + GRUAS).
**Pendiente:** mapeo Bubble → reportaweb3 (esperando screenshots en `c:/tmp/screenshots/reportar/`). Este doc alimenta las matrices `02-maquinaria.md` y la futura de Planificación.

---

## 1. MAQUINARIA

### 1.1 Rutas y cadena de render (verificada page.tsx → imports)

| Ruta | page.tsx | Renderiza |
|------|----------|-----------|
| `/maquinarias` | `app/(dashboard)/maquinarias/page.tsx` (server) | `maquinaria-table.tsx` → `DataTable` + `maquinarias/columns.tsx` + `components/maquinaria/maquinaria-actions.tsx` |
| `/maquinarias/create` | server | `components/maquinaria/maquinaria-form.tsx` |
| `/maquinarias/[id]/edit` | server | `client-edit-page.tsx` → tabs `MaquinariaForm` + `documents-tab.tsx` |
| `/maquinarias/modelos` | server (Breadcrumb) | `modelos/client-page.tsx` (columnas **inline**) + `ModelCreationDialog` |
| `/maquinarias/types` | server (Breadcrumb) | `types/client-page.tsx` + `TipoDocForm` |
| `/maquinarias/documentos` | server (Breadcrumb) | `documentos/client-page.tsx` (toolbar custom) + `GlobalDocumentDialog` |
| `/settings/maquinaria` | server | tabs que **reusan** `TypesClientPage` y `ModelosClientPage` con `embedded={true}` |
| `/informes/maquinaria` | server | `components/reportes/reportes-maquinaria-section.tsx` (tabla HTML manual — módulo Informes) |

**⚠️ Huérfano confirmado:** `app/(dashboard)/maquinarias/modelos/columns.tsx` — nadie lo importa; la vista real define columnas inline en `modelos/client-page.tsx:63-144`. Candidato a borrado.

**⚠️ Doble impacto:** editar `TypesClientPage`/`ModelosClientPage` afecta también `/settings/maquinaria` (embedded).

### 1.2 Cumplimiento template v1.2 (resumen)

Lo heredado de `components/ui/data-table.tsx` ya cumple: tarjeta blanca de toolbar, header gris `bg-muted/50`, contenedor estándar, paginación al pie.

Gaps transversales a `/maquinarias`, `/modelos`, `/types`:
- ❌ Sin `PageDescription` + h1 sr-only (modelos/types además tienen Breadcrumb, prohibido en v1.2)
- ❌ Búsqueda monocampo (`searchKey` único) — template pide multicampo
- ❌ Botón "Vista" (DataTableViewOptions) presente — prohibido regla 5
- ❌ Sin export ↓XLS estándar (`lib/utils/export-excel.ts` — 0 usos en el módulo)
- ❌ Sin `ColumnFilterHeader` (embudos)
- ❌ Inactivos no se pintan `text-red-600`
- ✔ Activos|Papelera y botón + Nuevo naranja `bg-orange-600` presentes

Específicos:
- `/maquinarias`: ❌ tiene columna **Estado** (regla 6b) y **sort** en Equipo/Marca (`columns.tsx:21-23,35-37`, regla 3)
- `/maquinarias/documentos`: el más divergente — toolbar custom, export `xlsx` inline (no el helper estándar), iconos Excel/ZIP, naranja hex `#FF5A1F`, columna ESTADO (VIGENTE/VENCIDO — semántica distinta, definir en DUDA), y filtra todo en cliente siendo el candidato natural a server-side (regla 8, como `/users/documents`)
- `/informes/maquinaria`: tabla HTML manual sin búsqueda/paginación/export (pertenece a módulo Informes, auditar allá)

### 1.3 Capa de datos

Server actions en `lib/actions/`: `maquinarias.ts`, `maquinaria-models.ts`, `maquinaria-types.ts`, `maquinaria-docs.ts`, `reportes.ts`. **Todas filtran `tenant_id`** ✔ (vía `getTenantContext()` + adminClient).

Nota: `doc_maquinarias` es **bucket de Storage** (uploads en `maquinaria-docs.ts:95,109,173,180`), NO una tabla (verificado en PROD: la tabla no existe).

**`maquinaria_horas`: 1.917 filas en PROD (todas CISE, 0 GRUAS) y NINGUNA pantalla la consume.** → DUDA.

### 1.4 Cobertura BD PROD (2026-07-15)

| Tabla | CISE | GRUAS |
|-------|-----:|------:|
| maquinarias | 153 | 140 |
| maquinaria_modelos | 107 | 130 |
| maquinaria_tipos_docs | 14 | 16 |
| maquinaria_documentos | 52 | 190 |
| maquinaria_horas | 1.917 | 0 |
| reportes_maquinaria | 5.817 | 18.535 |

Datasets chicos → tablas cliente OK; solo documentos/reportes ameritan evaluación server-side.

### 1.5 Formulario crear/editar (compartido, `maquinaria-form.tsx`)

react-hook-form + zod. Campos: nombre*, codigo_interno, modelo_id* (SearchableSelect + alta inline de modelo), categoria/marca (readonly desde modelo), placa, capacidad, anio_fabricacion, foto (compresión 50% → bucket `maquinarias`), propietario (propio/tercero), proveedor_id (condicional).

---

## 2. PLANIFICACIÓN

### 2.1 Rutas

| Ruta | Renderiza |
|------|-----------|
| `/planificacion` | `page.tsx` (client) → 3 modos: `PlanificacionTable` (LIST) / `ResourceTimeline` ×2 (PERSONAL, MAQUINARIA). Diálogos: `TareaDetailDialog`, `EditarFechasDialog`, `EditRecursosDialog` |
| `/planificacion/nueva` | crear **y** editar (`?tarea=<id>`) → `nueva-tarea-form.tsx` (wizard 3 tabs: info → personal → maquinaria) |
| `/tareas` | redirect legacy a `/planificacion` |

**⚠️ Huérfano confirmado:** `components/planificacion/nueva-tarea-wizard.tsx` — no lo importa ninguna ruta (reemplazado por `NuevaTareaForm`). Candidato a borrado.

### 2.2 Modelo de datos (3 tablas, migración 20260418170000)

- `tareas` (header: titulo, estado, cliente, sitio, hora_inicio/fin `time`, codigo `T-YYYY-XXXX`…)
- `tareas_fechas` (intervalos: `fecha_inicio`/`fecha_fin` date o `fechas_multiples` date[])
- `tareas_recursos` (por intervalo vía `tarea_fecha_id`: PERSONAL|MAQUINARIA, personal_id/maquinaria_id, proveedor_id, recurso_externo_nombre)
- Lectura del listado vía MV `mv_planificacion_diaria` (join por `tarea_fecha_id`)

### 2.3 🔴 HALLAZGO CRÍTICO 1 — Recursos invisibles (`tarea_fecha_id NULL`)

Verificado en PROD 2026-07-15:

| Tenant | Tipo | Total | `tarea_fecha_id` NULL | % NULL |
|--------|------|------:|---------------------:|-------:|
| CISE | MAQUINARIA | 4.644 | **2.332** | 50% |
| CISE | PERSONAL | 4.774 | 245 | 5% |
| GRUAS | MAQUINARIA | 14.804 | **6.035** | 41% |
| GRUAS | PERSONAL | 14.738 | 82 | 1% |
| **Total** | | 38.960 | **8.694** | 22% |

**La UI no puede renderizar filas con `tarea_fecha_id NULL`:** la MV une por `tarea_fecha_id`, `getAvailability` usa `tareas_fechas!inner` (`planificacion.ts:727`), y el detalle anida recursos dentro de cada intervalo (`planificacion.ts:521-529`). El seed de REP-3.11-002 logró 100% cobertura *a nivel tabla*, pero estos 8.694 recursos son invisibles en todas las vistas.

**Causa raíz:** tareas de Bubble **sin ninguna fila en `tareas_fechas`**:

| Tenant | Tareas | Sin fechas | Solo recursos NULL |
|--------|-------:|-----------:|-------------------:|
| CISE | 4.974 | **2.326 (47%)** | 2.338 |
| GRUAS | 9.537 | 241 (2,5%) | 739 |

Las 2.567 tareas sin fechas son 100% `bubble_id NOT NULL`, 0 confirmadas, mayormente 2020-2023 (CISE), pero hay **123 creadas en 2026** (39 CISE + 84 GRUAS, última 2026-06-03). Estas tareas tampoco aparecen en `/planificacion` (la MV requiere fechas).

**DUDA-PLAN-001:** ¿qué hacer? Opciones: (a) migrar las fechas reales desde Bubble y re-vincular recursos; (b) re-vincular recursos al primer intervalo solo donde exista; (c) limpiar el seed huérfano. Las 123 de 2026 podrían ser operativamente relevantes.

### 2.4 🔴 HALLAZGO CRÍTICO 2 — Editar tarea pierde fechas y recursos

Flujo `/planificacion/nueva?tarea=<id>` (verificado en código):
- `nueva-tarea-form.tsx:164-195`: en edición solo rehidrata header + **la primera fecha** (`fechas?.[0]`, y solo 1 día). NO rehidrata `assignedPersonal`/`assignedMaquinaria` ni los demás intervalos.
- `planificacion.ts:284` (`createTarea` con `header.id`): `DELETE tareas_fechas` (CASCADE borra `tareas_recursos`) y reinserta **solo lo que está en el estado del form**.

→ Reeditar una tarea que ya tenía fechas múltiples/recursos y guardar **destruye lo no reingresado**.

**Mitigante:** los 2 puntos de entrada actuales son para tareas pendientes de planificar (banner de borradores `page.tsx:331` y tareas creadas desde cotización `cotizacion-respuesta-cliente.tsx:270`), que normalmente aún no tienen recursos. Pero un borrador con fechas ya guardadas (vía `saveTareaBorradorBasic`) pierde todas menos la primera. La edición de tareas confirmadas va por `EditarFechasDialog`/`EditRecursosDialog`, que son seguros (scoped).

### 2.5 🟠 Otros hallazgos Planificación

1. **Fechas sin util central, mezcla UTC/local** — riesgo off-by-one (Perú UTC-5): `editar-fechas-dialog.tsx:57-64` (`new Date(str)` UTC + `setDate` local), `tarea-detail-dialog.tsx:828-851`, vs patrón correcto `page.tsx:94-102` (todo UTC) y workaround `+'T12:00:00'` en `nueva-tarea-form.tsx:192,794`.
2. **Sin zod/react-hook-form** en NuevaTareaForm — validación manual por toasts.
3. **`prioridad` sin control UI** — siempre 'MEDIA' (existe en FormData, no hay campo).
4. **Código de tarea con race condition** — `T-YYYY-XXXX` por `count(*)` (`planificacion.ts:288-294`); dos creaciones simultáneas colisionan.
5. **Scope de asignación FUTURE/SINGLE deshabilitados** ("Próximamente", `nueva-tarea-form.tsx:973-980`).
6. `tareas_comentarios` existe en PROD con **0 filas** ambos tenants — ¿UI la usa? (revisar en auditoría formal).
7. `addRecursoToIntervalo`/`removeRecurso` (`planificacion.ts:387,436`) sin uso aparente en UI.

### 2.6 Planificación vs template v1.2

La vista principal es una herramienta semanal (listado agrupado por día + 2 timelines), no un listado estándar: sin Activos|Papelera, sin ↓XLS, sin embudos, sin paginación; header `bg-gray-50/50` en vez de `bg-muted/50`; búsqueda multicampo ✔ pero fuera de tarjeta. **DUDA-PLAN-002:** ¿se exige homogeneidad v1.2 aquí o se acepta UX propia de calendario (aplicando solo reglas compatibles: descripción de página, XLS del listado, tarjeta de toolbar)?

---

## 3. DUDas — RESUELTAS 2026-07-15 (decisiones del usuario)

| ID | Decisión |
|----|----------|
| DUDA-MAQ-001 | ✅ `maquinaria_horas` queda como **DEUDA técnica** — se utiliza en la parte de informes y en tareas. Registrar en TECHNICAL_DEBTS.md. |
| DUDA-MAQ-002 | ✅ La columna se llama **"Estado"** con 3 valores: **VENCIDO / POR VENCER / VIGENTE**. |
| DUDA-MAQ-003 | ✅ SÍ migra a server-side como `/users/documents`. Vista default = activos. + Botón **"Depurar vencidos"** y página para pasar a inactivos los docs con +1 mes de vencidos (mismo patrón de `/users/documents/depurar`). *(Implementación en curso.)* |
| DUDA-PLAN-001 | ✅ INVESTIGADO (2026-07-15, auditoría 100% de las 2.567 contra Data API de Bubble — ver §6). Propuesta mixta por segmento pendiente de aprobación del usuario. |
| DUDA-PLAN-002 | ✅ Se acepta la UX de calendario con reglas parciales del template: **descripción de página, export XLS y tarjeta de toolbar**. Adicional: evaluar **impresión a PDF en carta horizontal** de las vistas semanales por personal y por maquinaria (ver §5). |
| DUDA-PLAN-003 | ✅ Arreglar YA con solución sólida (funcionalidad crítica). **HECHO 2026-07-15**: rehidratación completa en `nueva-tarea-form.tsx` (todas las fechas + recursos), sync calendario↔asignaciones, y guardado insertar-antes-de-borrar en `createTarea`/`updateTareaIntervals`. |

## 4. Archivos huérfanos — NO BORRAR (decisión usuario: revisar en conjunto)

Son archivos de código que ninguna ruta importa (no son páginas; ninguna página se pierde por ellos):

| Archivo huérfano | Qué es | Página real equivalente (URL) |
|------------------|--------|-------------------------------|
| `app/(dashboard)/maquinarias/modelos/columns.tsx` | Definición de columnas vieja (con columna Estado) que nadie importa | La lista de modelos SÍ existe y funciona: **`/maquinarias/modelos`** (también embebida en **`/settings/maquinaria`** → tab Modelos), con columnas definidas inline en `modelos/client-page.tsx` |
| `components/planificacion/nueva-tarea-wizard.tsx` | Versión previa del formulario de tarea, reemplazada por `NuevaTareaForm` | **`/planificacion/nueva`** (form actual con 3 tabs) |

→ DUDA-LIMPIEZA-001: revisar juntos antes de decidir borrado.

## 5. Impresión PDF vistas semanales (personal / maquinaria) — propuesta

Requerimiento: imprimir la vista semanal (timeline por personal y por maquinaria) en PDF **tamaño carta horizontal** (landscape).

El repo ya tiene los dos patrones necesarios:
- Route group **`app/(print)/`** (usado por cotizaciones): página imprimible con `@media print` + `@page { size: ...; }` + `components/print-preview-toolbar.tsx` (`window.print()`).
- **Gotenberg** (`/api/pdf/generate`, chromium HTML→PDF) con `@page landscape` ya usado en `lib/valorizacion-venta-pdf-template.ts`.

**Propuesta (v1):** ruta `app/(print)/planificacion/imprimir?vista=personal|maquinaria&semana=YYYY-MM-DD` que renderice el timeline de la semana server-side con `@page { size: letter landscape; margin: 10mm; }` + botón imprimir. Botón "🖨 PDF" en `/planificacion` (modos PERSONAL/MAQUINARIA) que abre esa ruta. Fase 2 opcional: botón "Descargar PDF" server-side vía Gotenberg reutilizando el mismo HTML.

## 6. DUDA-PLAN-001 — Resultado de la auditoría contra Bubble (2026-07-15)

Se auditaron las **2.567 tareas completas** (no muestra) contra la Data API de Bubble. Fechas en Bubble: objeto `tareas`, campos `Fecha Tipo-2024`, `fecha_rango-2024` (rango), `fechas_listado` (sueltas).

| Segmento | Cant. | Detalle | Acción propuesta |
|---|---:|---|---|
| A. Recuperables en Bubble | **1.932 (75%)** | CISE 2020-2023 (64-94% por año) + 2026 (CISE 37, GRUAS 83). Forma: 1.165 con 1 fecha → rango X–X, 680 multi → `fechas_multiples`, 87 rango | Migrar fechas desde Bubble (upsert `tareas_fechas` con `bubble_id + '_interval'`) + re-vincular las 2.917 filas de `tareas_recursos` NULL + reconciliar ~3.000 ítems de recursos que Bubble tiene de más (5.928 vs 2.917) |
| B. Sin fecha tampoco en Bubble | **635** | 624 COMPLETADA (muchas internas "Taller Cise"); cohortes CISE 2024-25 y GRUAS 2023-25 son 100% este caso | No migrar, no limpiar (tienen informes/reportes vinculados). Los 11 PENDIENTE recientes: revisar con cliente |
| C. Deshabilitadas en Bubble | **3** | GRUAS 2026 `deshabilitado?=true` pero activas en Supabase | Candidatas a papelera, revisión individual |

**Hallazgos clave:**
- 0 tareas faltantes en Bubble; todas conservan allá sus listas de recursos.
- ⚠️ **Bubble sigue recibiendo ediciones post-cutover**: las 120 recuperables de 2026 tienen Modified Date de mayo/junio y hasta julio 2026 → programar **delta-sync final de tareas 2026** y confirmar con el cliente que dejen de operar en reporta.la.
- No limpiar en bloque: 421 con informes, 566 con reportes de maquinaria, 872 con reportes de personal.
- Insumos para el script guardados en scratchpad de la sesión (`sinfechas-full.json`, `bubble-recuperables.json`, `bubble-sinfecha.json`); mapeo de referencia: `docs/migracion-mapeo-bubble-supabase.md` + `git show 5258ae8:scripts/migrate-tareas-mig5.ts`.
