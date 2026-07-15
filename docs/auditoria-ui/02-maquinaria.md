# Auditoría UI ↔ Datos — 02 · Maquinaria

**Fecha:** 2026-07-15 · **Módulo:** 2/15 (Maquinaria)
**Formato de referencia:** `docs/auditoria-ui/01-usuarios.md` (piloto validado)
**Pre-auditoría técnica:** `docs/auditoria-ui/PRE-AUDIT-2026-07-15-maquinaria-planificacion.md` (rutas, componentes, gaps vs template v1.2)
**Datos BD PROD:** queries 2026-07-15, solo tenants CISE + GRUAS

---

## Resumen Ejecutivo

- **Sub-módulos:** Equipos (Maquinaria) · Modelos (catálogo) · Tipos de Documento de Maquinaria · Documentos de Maquinaria
- **Screenshots Bubble:** 10 archivos en `c:/tmp/screenshots/reportar/2 Maquinaria/`
- **Menú Bubble:** MAQUINARIA → Maquinaria · Tipo Docs Maq. · Documentos Maq. (Modelos era popup inline, sin lista propia)
- **Menú nuevo:** `/maquinarias` · `/maquinarias/modelos` · `/maquinarias/types` · `/maquinarias/documentos` (+ tabs embedded en `/settings/maquinaria`)

**Hallazgos críticos (datos):**
1. 🔴 `maquinarias.modelo_id`: **1/293 (0.3%)** vinculado — pero el form nuevo lo exige como requerido (editar cualquier equipo migrado obliga a re-seleccionar modelo)
2. 🔴 `maquinaria_documentos.tipo_doc_id`: **0/242 (0%)** — la columna "TIPO DOCUMENTO" sale vacía para todo lo migrado y el filtro por tipo no matchea nada
3. 🔴 CISE: **46/46 archivos** de documentos apuntan a S3 de Bubble (`//s3.amazonaws.com/appforest_uf/...`), no a Supabase Storage
4. 🔴 `maquinaria_tipos_docs` **no tiene columna Código** — en Bubble era campo requerido y columna de lista

**Defectos encontrados:** 16 gaps identificados (4 críticos) · 11 DUDAs nuevas (DUDA-MAQ-004 a 014) · 3 DUDAs previas resueltas por decisión del usuario

### Cobertura BD PROD por tabla (2026-07-15)

| Tabla | CISE | GRUAS | Total |
|-------|-----:|------:|------:|
| maquinarias | 153 | 140 | 293 |
| maquinaria_modelos | 107 | 130 | 237 |
| maquinaria_tipos_docs | 14 | 16 | 30 |
| maquinaria_documentos | 52 | 190 | 242 |
| maquinaria_horas | 1.917 | 0 | 1.917 (DEUDA — ver Decisiones) |
| reportes_maquinaria | 5.817 | 18.535 | 24.352 (módulo Informes) |

---

## Decisiones del usuario YA TOMADAS (no son DUDA)

| Tema | Decisión |
|------|----------|
| `maquinaria_horas` (1.917 filas CISE, 0 GRUAS, sin UI propia) | Queda como **DEUDA TÉCNICA** (se usa en informes y tareas). No se audita UI ahora. Cierra DUDA-MAQ-001 del PRE-AUDIT. |
| Columna Estado en `/maquinarias/documentos` | Será **"Estado" con VENCIDO / POR VENCER / VIGENTE** (ticket ya en curso). Cierra DUDA-MAQ-002 del PRE-AUDIT. |
| `/maquinarias/documentos` | Migra a **server-side URL params** (como `/users/documents`) + botón/página **"Depurar vencidos"** (ticket ya en curso). Cierra DUDA-MAQ-003 del PRE-AUDIT. |
| Archivos huérfanos en Storage | **NO se borran**; se listan como DUDA para revisión conjunta (DUDA-MAQ-012). |

---

## 1. MAQUINARIA — Equipos

**Path Bubble:** MAQUINARIA → Maquinaria
**Path reportaweb3:** `/maquinarias` · Componentes: `app/(dashboard)/maquinarias/page.tsx` · `maquinaria-table.tsx` · `columns.tsx` · `components/maquinaria/maquinaria-form.tsx` · `maquinaria-actions.tsx`
**Datos BD:** 293 equipos (CISE 153, GRUAS 140), 100% activos (papelera vacía)

### 1.1 EQUIPOS — Lista

| Elemento | Campo Bubble | Tabla.columna Supabase | UI nueva (reportaweb3) | Dato migrado | Status | Notas |
|---|---|---|---|---|---|---|
| Búsqueda | "Buscar por placa ..." | maquinarias.placa | ❌ Solo busca nombre (`searchKey="nombre"`) | ⚠️ placa: CISE 60/153, GRUAS 138/140 | 🟡 **Gap UI** | Multicampo: nombre + código + placa (Bubble buscaba POR PLACA) |
| Toggle "Deshabilitado?" (título) | "IonicToggle Deshabilitado? is checked" | maquinarias.is_active | ✅ Activos \| Papelera | ✅ (293/293 activos) | ✅ OK | |
| Ícono filtro (embudo) | Popup de filtros | — | ❌ Sin `ColumnFilterHeader` | — | 🟡 **Gap UI** | Template v1.2: embudos por columna |
| Ícono descarga (↓) | Export de la tabla | — | ❌ Sin export XLS (`export-excel.ts` 0 usos) | — | 🟡 **Gap UI** | Template v1.2: ↓XLS estándar |
| Botón Nuevo | "Nuevo" (naranja) | — | ✅ "+ Nuevo Equipo" `bg-orange-600` | — | ✅ OK | |
| Columna: CODIGO | "maquinarias's codigo_interno" (implícito, 1ª col) | maquinarias.codigo_interno | ✅ ("Código") | ✅ 293/293 (100%) | ✅ OK | |
| Columna: EQUIPO | "maquinarias's categoria" | maquinarias.categoria | ✅ ("Categoría") | ✅ 293/293 (100%) | ✅ OK | En Bubble la col. EQUIPO mostraba la categoría; la nueva col. "Equipo" muestra `nombre` (100% migrado) — ambas presentes |
| Columna: MARCA | "maquinarias's Marca" | maquinarias.marca | ✅ ("Marca") | ✅ 293/293 (100%) | ✅ OK | Texto plano, NO FK (ver Gap #2-M6) |
| Columna: MODELO | "maquinarias's Modelo" | maquinarias.modelo (texto) / modelo_id → maquinaria_modelos | ✅ ("Modelo", fallback texto → modelo_ref) | ⚠️ texto: 269/293 (CISE 129/153) · FK modelo_id: **1/293** | 🔴 **Gap migración** | Ver Gap crítico #2-M6 (modelo_id) y DUDA-MAQ-014 |
| Columna: CAPACIDAD | "maquinarias's capacidad" | maquinarias.capacidad | ❌ NO visible en lista | ✅ 290/293 (99%) | 🟡 **Gap UI** | Agregar columna (dato ya migrado) |
| Columna: PLACA | "maquinarias's Placa" | maquinarias.placa | ✅ ("Placa") | ⚠️ CISE 60/153 (39%) · GRUAS 138/140 (99%) | ❓ DUDA-MAQ-010 | ¿CISE sin placa es real (maquinaria no vehicular) o migración incompleta? |
| Columna: PROPIETARIO | "maquinarias's Proveedor_id's razon_social:capitalized words" | maquinarias.proveedor_id → terceros.razon_social | ❌ Solo badge propio/tercero ("Propiedad") | ✅ proveedor_id: 237/237 de los 'tercero' (100%) | 🟡 **Gap UI** | Bubble mostraba la RAZÓN SOCIAL del proveedor; dato ya migrado, solo falta mostrar |
| Columna: Estado | — (no existe columna en Bubble; el toggle filtra) | maquinarias.estado (enum maquinaria_estado) | ⚠️ Columna "Estado" presente | — | 🟡 **Gap UI (template)** | Regla 6b v1.2: quitar columna Estado; inactivos van a Papelera + `text-red-600` |
| Sort en columnas | — (sin sort en Bubble) | — | ⚠️ Sort en Equipo/Marca (`columns.tsx:21-23,35-37`) | — | 🟡 **Gap UI (template)** | Regla 3 v1.2: sin sort |
| Botón "Vista" | — | — | ⚠️ DataTableViewOptions presente | — | 🟡 **Gap UI (template)** | Regla 5 v1.2: prohibido |
| Menú de Fila (•••) | Acciones en RG | — | ✅ (`MaquinariaActions`: editar/eliminar/restaurar) | — | ✅ OK | |
| Paginación "1 2" | Paginación Bubble | — | ✅ (DataTable estándar) | — | ✅ OK | |

**Clasificación de gaps — Lista Equipos:**
- 🟡 **Gap UI #1-M1:** Búsqueda monocampo (nombre) → multicampo nombre + código + placa [30 min]
- 🟡 **Gap UI #1-M2:** Falta columna Capacidad (dato 99% migrado) [30 min]
- 🟡 **Gap UI #1-M3:** Falta Propietario con razón social del proveedor (237 FK migrados) [1h]
- 🟡 **Gap UI #1-M4:** Template v1.2: quitar columna Estado + sort + botón Vista; agregar PageDescription + h1 sr-only, ↓XLS, embudos, inactivos en rojo [3h]
- ❓ **DUDA-MAQ-010:** Placa CISE 39% — ¿real o gap migración?

---

### 1.2 EQUIPOS — Crear / Editar (Bubble: wizard 2 pasos · Nuevo: form + tab documentos en edit)

**Paso 1 Bubble: "Información básica"** ↔ `maquinaria-form.tsx` (react-hook-form + zod)

| Elemento | Campo Bubble | Tabla.columna Supabase | UI nueva | Dato migrado | Status | Notas |
|---|---|---|---|---|---|---|
| Código (único) * | "maquinarias's codigo_interno" | maquinarias.codigo_interno | ✅ (input) | ✅ 293/293 | ✅ OK | En Bubble requerido y único; verificar unicidad en nueva |
| Equipo * (select) | "maquinarias's categoria" | maquinarias.categoria | ✅ (readonly, derivado del modelo) | ✅ 293/293 | ⚠️ Ver #2-M6 | En Bubble era select directo; nueva lo deriva de modelo_id → sin modelo_id no se puede derivar |
| Marca / Fabricante * (select) | "maquinarias's Marca" | maquinarias.marca | ✅ (readonly, derivado del modelo) | ✅ 293/293 | ⚠️ Ver #2-M6 | Ídem |
| Modelo * (select) | "maquinarias's Modelo" | maquinarias.modelo_id → maquinaria_modelos | ✅ (SearchableSelect **requerido** + alta inline de modelo) | 🔴 **1/293 (0.3%)** | 🔴 **Gap migración CRÍTICO** | Editar cualquier equipo migrado fuerza re-seleccionar modelo. Ver #2-M6 + DUDA-MAQ-014 |
| Capacidad * (select) | "maquinarias's capacidad" | maquinarias.capacidad | ✅ (campo en form) | ✅ 290/293 | ✅ OK | |
| Placa | "maquinarias's Placa" | maquinarias.placa | ✅ (input opcional) | ⚠️ CISE 39% | ❓ DUDA-MAQ-010 | |
| Foto (JPG/JPEG/PNG, 600×240 sugerido) | Upload de imagen | maquinarias.foto_url (bucket `maquinarias`) | ✅ (upload con compresión 50%) | 🔴 15/293 (CISE 14, GRUAS 1) | ❓ DUDA-MAQ-011 | ¿Bubble tenía fotos que no se migraron, o casi no se usaba? |
| ¿Propiedad de un Proveedor? (toggle) | Booleano propiedad proveedor | maquinarias.propietario (enum propio/tercero) · existe también maquinarias.propiedad_proveedor (bool) | ✅ (radio propio/tercero) | ✅ 293/293 (237 tercero) | ✅ OK | Nota: columna booleana `propiedad_proveedor` coexiste con el enum — posible redundancia de schema |
| Proveedor * (condicional) | "Selecciona el Proveedor" | maquinarias.proveedor_id → terceros | ✅ (select condicional si tercero) | ✅ 237/237 de los tercero | ✅ OK | |
| Año de fabricación | — (NO existe en Bubble) | maquinarias.anio_fabricacion | ✅ (campo nuevo) | — 0/293 (esperado, campo nuevo) | ✅ OK (campo nuevo) | No requiere migración |
| Botones Cerrar / Siguiente | Wizard 2 pasos | — | ⚠️ Form único; documentos solo en `/[id]/edit` (tab) | — | 🟡 **Gap UI (flujo)** | Bubble permitía cargar docs en el paso 2 del ALTA; nueva obliga a guardar y reabrir en edit. Ver #2-M7 |

**Paso 2 Bubble: "Documentos" (embebido en wizard)** ↔ `documents-tab.tsx` (solo en edit)

| Elemento | Campo Bubble | Tabla.columna Supabase | UI nueva | Dato migrado | Status | Notas |
|---|---|---|---|---|---|---|
| Tabla de documentos del equipo | "maquinaria_documento's tipo_doc_id's nombre · fecha_emision · fecha_vencimiento · Link del archivo" | maquinaria_documentos (join tipos) | ✅ (tab Documentos en edit) | 🔴 tipo_doc_id 0/242 → nombre de tipo vacío | 🔴 **Gap migración** | Ver sección 4 (mismo dato) |
| Botones descarga (↓ ×2) + Nuevo | Export/descarga + alta | — | ✅ (alta vía dialog) / ❌ export | — | 🟡 Gap UI menor | |
| Botones Anterior / Cerrar / Finalizar | Navegación wizard | — | — (flujo distinto) | — | ✅ OK (rediseño) | |

**Clasificación de gaps — Crear/Editar Equipos:**
- 🔴 **Gap migración #2-M6 (CRÍTICO):** `modelo_id` 1/293. Los datos migrados guardan categoria/marca/modelo como TEXTO plano sin FK a `maquinaria_modelos` (237 modelos sí migrados). El form nuevo exige modelo_id y deriva categoria/marca de él → editar un equipo migrado rompe/fuerza recaptura. [Migración re-vinculación: 3h + DUDA-MAQ-014 estrategia]
- 🟡 **Gap UI #2-M7:** Alta sin paso de documentos (Bubble wizard sí lo tenía). Confirmar si el flujo "crear → editar → tab docs" es aceptable o se agrega paso 2. [Decisión + 2h]
- ❓ **DUDA-MAQ-011:** Fotos 15/293 (5%) — ¿migrar desde Bubble?
- ⚪ Campos de schema sin UI ni datos: `qr_url` (0), `hoja_vida_url` (0), `con_informes`, `habilitado`, `propietario_id` — inventariar en limpieza de schema (no bloquea)

---

## 2. MODELOS DE MAQUINARIA

**Path Bubble:** popup "AGREGAR MODELO" dentro del form de equipo (SIN lista propia en Bubble)
**Path reportaweb3:** `/maquinarias/modelos` · `modelos/client-page.tsx` (columnas inline) + `ModelCreationDialog` · **doble impacto:** embedded en `/settings/maquinaria`
**Datos BD:** 237 modelos (CISE 107, GRUAS 130), 100% activos

### 2.1 MODELOS — Lista (vista nueva, sin equivalente Bubble)

| Elemento | Campo Bubble | Tabla.columna Supabase | UI nueva | Dato migrado | Status | Notas |
|---|---|---|---|---|---|---|
| Búsqueda | — (no había lista) | maquinaria_modelos.modelo | ✅ (`searchKey="modelo"`) | ✅ | 🟡 **Gap UI (template)** | Multicampo modelo + marca + tipo_equipo |
| Columna: Modelo | "maquinaria_modelos's Mod..." | maquinaria_modelos.modelo | ✅ ("Modelo", bold) | ✅ 237/237 (100%) | ✅ OK | |
| Columna: Marca | "r_maquinaria_modelo's Fabricante" | maquinaria_modelos.marca | ✅ ("Marca") | ✅ 237/237 (100%) | ✅ OK | |
| Columna: Tipo | "r_maquinaria_modelo's Equipo" | maquinaria_modelos.tipo_equipo | ✅ ("Tipo", badge) | ✅ 237/237 (100%) | ✅ OK | |
| Columna: Capacidad | "maquinaria_modelos's Capa..." | maquinaria_modelos.capacidad | ✅ ("Capacidad") | ✅ 234/237 (99%) | ✅ OK | |
| Activos \| Papelera + Nuevo | — | is_active | ✅ (naranja estándar) | ✅ | ✅ OK | |
| Menú de Fila: Editar | — | — | ⚠️ Hack `document.querySelector('[data-model-edit]')` → toast "Próximamente" | — | 🟡 **Gap UI** | Edición de modelo NO implementada de forma directa (`client-page.tsx:129-133`) |
| Menú de Fila: Eliminar/Restaurar | — | — | ✅ (AlertDialog + papelera) | — | ✅ OK | |

### 2.2 MODELOS — Crear (popup "AGREGAR MODELO")

| Elemento | Campo Bubble | Tabla.columna Supabase | UI nueva | Dato migrado | Status | Notas |
|---|---|---|---|---|---|---|
| Equipo | "r_maquinaria_modelo's Equipo" | maquinaria_modelos.tipo_equipo | ✅ (ModelCreationDialog) | ✅ 100% | ✅ OK | |
| Fabricante | "r_maquinaria_modelo's Fabricante" | maquinaria_modelos.marca | ✅ | ✅ 100% | ✅ OK | |
| Modelo | "maquinaria_modelos's Modelo" | maquinaria_modelos.modelo | ✅ | ✅ 100% | ✅ OK | |
| Capacidad | "maquinaria_modelos's Capacidad" | maquinaria_modelos.capacidad | ✅ | ✅ 99% | ✅ OK | |
| Cerrar / Guardar | Botones popup | — | ✅ | — | ✅ OK | |

**Clasificación de gaps — Modelos:**
- 🟡 **Gap UI #2-M8:** Editar modelo no funciona (toast "Próximamente") [2h]
- 🟡 **Gap UI #2-M9:** Template v1.2: Breadcrumb prohibido, sin PageDescription, sin XLS, sin embudos, huérfano `modelos/columns.tsx` a borrar [2h — cuidado doble impacto `/settings/maquinaria`]

---

## 3. TIPOS DE DOCUMENTO DE MAQUINARIA

**Path Bubble:** MAQUINARIA → Tipo Docs Maq.
**Path reportaweb3:** `/maquinarias/types` · `types/client-page.tsx` + `components/maquinaria/tipo-doc-form.tsx` · **doble impacto:** embedded en `/settings/maquinaria`
**Datos BD:** 30 tipos (CISE 14, GRUAS 16) · activos: CISE 14/14, GRUAS 11/16 · categoria: con_vencimiento 20, sin_vencimiento 10, **seguro 0** · aplica_a: 100% 'maquinaria'

### 3.1 TIPOS DOC MAQ — Lista

| Elemento | Campo Bubble | Tabla.columna Supabase | UI nueva | Dato migrado | Status | Notas |
|---|---|---|---|---|---|---|
| Búsqueda | "Buscar tipo de documento ..." | maquinaria_tipos_docs.nombre | ✅ (`searchKey="nombre"`) | ✅ | ✅ OK | |
| Columna: CÓDIGO | "maquinaria_tipos_docs's codigo" | ❌ **NO EXISTE la columna en BD** | ❌ NO visible | ❌ 0 (columna inexistente) | 🔴 **Gap schema + migración** | En Bubble era columna de lista Y campo requerido del form. `document_types` (usuarios) SÍ tiene `code`; aquí no. DUDA-MAQ-004 |
| Columna: DOCUMENTO | "maquinaria_tipos_docs's nombre" | maquinaria_tipos_docs.nombre | ✅ ("Nombre", bold) | ✅ 30/30 (100%) | ✅ OK | |
| Columna: VENCE (📅) | "requiere_vencimiento is no:formatted as text" | maquinaria_tipos_docs.requiere_vencimiento | ✅ ("Vencimiento" Sí/No) | ✅ 30/30 (20 true) | ✅ OK | |
| Columna: ALERTA (DÍAS ANTES) | "requiere_vencimiento…" (binding) → días de alerta | maquinaria_tipos_docs.dias_alerta | ✅ ("Días Alerta") | ✅ 30/30 (100%) | ✅ OK | A diferencia de usuarios (DUDA-201), aquí SÍ está migrado y visible |
| Columna: SEGURO | "maquinaria_tipos_docs's seguro? is no:formatted as text" | ⚠️ Sin boolean; existe maquinaria_tipos_docs.categoria (opción 'seguro') | ❌ NO visible (ni columna Categoría) | ⚠️ **0/30 con categoria='seguro'** | ❓ DUDA-MAQ-005 | ¿En Bubble había tipos marcados como seguro? Si sí, la migración los dejó como con/sin_vencimiento |
| Columna: GARANTÍA | "maquinaria_tipos_docs's seguro? is no…" (binding repetido en screenshot; columna GARANTÍA existía en la lista) | ❌ Sin equivalente en BD | ❌ NO visible | ❌ | ❓ DUDA-MAQ-005 | No asumir equivalencia — preguntar qué guardaba GARANTÍA |
| Columna: INDIVIDUAL | "maquinaria_tipos_docs's individual? is no:formatted as text" | ⚠️ maquinaria_tipos_docs.aplica_a (enum todos/vehiculo/maquinaria/categoria/modelo) | ✅ ("Aplica a") | ⚠️ 30/30 = 'maquinaria' (un solo valor) | ❓ DUDA-MAQ-006 | Bubble: "aplica a UNA maquinaria" vs grupo. El enum nuevo NO tiene opción "una maquinaria específica" — ¿se perdió semántica en la migración? |
| Columna: Obligatorio | — (no existe en Bubble) | maquinaria_tipos_docs.es_obligatorio | ✅ (campo/columna nuevos) | ✅ 30/30 (default) | ✅ OK (campo nuevo) | |
| Ícono filtro + paginación "1 2" | Popup filtros | — | ❌ Sin embudos | — | 🟡 **Gap UI (template)** | |
| Botón Nuevo | "Nuevo" naranja | — | ✅ "+ Nuevo Tipo" dialog | — | ✅ OK | |
| Menú de Fila | Editar · Eliminar | — | ✅ (EditTypeDialog + papelera) | — | ✅ OK | GRUAS tiene 5 tipos en papelera (11/16 activos) |

### 3.2 TIPOS DOC MAQ — Crear / Editar (popup "AGREGAR TIPO DOCUMENTO")

| Elemento | Campo Bubble | Tabla.columna Supabase | UI nueva | Dato migrado | Status | Notas |
|---|---|---|---|---|---|---|
| Nombre del Documento * | "maquinaria_tipos_docs's no[mbre]" | maquinaria_tipos_docs.nombre | ✅ (input required) | ✅ 100% | ✅ OK | |
| Código del documento * | "maquinaria_tipos_docs's co[digo]" | ❌ NO existe | ❌ NO existe en form | ❌ | 🔴 **Gap schema** | DUDA-MAQ-004: ¿se necesita? Si sí: ALTER TABLE + migrar desde Bubble |
| Categoría del Documento (DOC) * | Select (Seguro · Con vencimiento · Sin vencimiento) | maquinaria_tipos_docs.categoria | ✅ (select 3 opciones idénticas) | ⚠️ 100% poblado pero 0 'seguro' | ✅ OK (UI) / ❓ dato | Mismas 3 categorías que document_types de usuarios (DUDA-202 resuelta allá) |
| Toggle "Aplica a un grupo de maquinarias / Aplica a una maquinaria" | Booleano individual? | maquinaria_tipos_docs.aplica_a (+ categoria_equipo, modelo_id condicionales) | ✅ (select 5 opciones + selects condicionales) | ⚠️ todo = 'maquinaria' | ❓ DUDA-MAQ-006 | UI nueva más rica que Bubble, pero verificar migración del booleano |
| Alerta * (días antes de vencimiento) | Input "00" + leyenda | maquinaria_tipos_docs.dias_alerta | ✅ (number, visible solo si categoría vence) | ✅ 100% | ✅ OK | |
| Es Obligatorio | — (no existe en Bubble) | maquinaria_tipos_docs.es_obligatorio | ✅ (checkbox, campo nuevo) | ✅ | ✅ OK (campo nuevo) | |
| Cerrar / Guardar | Botones popup | — | ✅ | — | ✅ OK | |

**Clasificación de gaps — Tipos Doc Maq:**
- 🔴 **Gap schema #3-M10:** Columna Código no existe en BD nueva (Bubble: requerida + columna de lista) [DUDA-MAQ-004 → si aplica: ALTER + migración 2h]
- ❓ **DUDA-MAQ-005:** SEGURO (0 registros con categoria='seguro') y GARANTÍA (sin equivalente) — aclarar semántica Bubble
- ❓ **DUDA-MAQ-006:** individual? → aplica_a: enum sin opción "una maquinaria"; 100% migrado con un solo valor
- 🟡 **Gap UI #3-M11:** Mostrar columna Categoría en lista + template v1.2 (embudos, XLS, PageDescription, sin Breadcrumb) [2h]

---

## 4. DOCUMENTOS DE MAQUINARIA

**Path Bubble:** MAQUINARIA → Documentos Maq.
**Path reportaweb3:** `/maquinarias/documentos` · `documentos/client-page.tsx` (toolbar custom) + `GlobalDocumentDialog`
**Datos BD:** 242 documentos (CISE 52, GRUAS 190), 100% activos · 76 vencidos a hoy (CISE 32, GRUAS 44)
**⚠️ Ya en curso (decisión):** Estado 3 valores + server-side + "Depurar vencidos"

### 4.1 DOCUMENTOS MAQ — Lista

| Elemento | Campo Bubble | Tabla.columna Supabase | UI nueva | Dato migrado | Status | Notas |
|---|---|---|---|---|---|---|
| Búsqueda | "Buscar por placa ..." | maquinarias.placa (join) | ⚠️ Busca equipo/tipo/número pero **NO placa** | ⚠️ placa CISE 39% | 🟡 **Gap UI** | Incluir placa en el multicampo (era LA búsqueda de Bubble) |
| Filtro: Tipo de documento | "Seleccionar tipo documento ..." | maquinaria_documentos.tipo_doc_id | ✅ (Select) | 🔴 **0/242 con tipo_doc_id** → filtro no matchea NADA migrado | 🔴 **Gap migración** | Ver #4-M12 |
| Filtro: Estado | — (columna ESTADO en RG) | calculado (fecha_vencimiento) | ✅ (Todos/Vigente/Por vencer 30d/Vencido) | ✅ | ✅ OK | Decisión tomada: columna Estado 3 valores (ticket en curso) |
| Ícono filtro + ↓ + XLS | Filtros popup + exports | — | ✅ Excel + ZIP (iconos) | — | ✅ OK (existe) / 🟡 estilo | Export inline `xlsx`, no usa helper estándar; naranja hex `#FF5A1F`; botón "Vista" prohibido — normaliza el ticket server-side en curso |
| Checkbox selección + Select All | Checkbox por fila | — | ✅ (descarga masiva ZIP/Excel de seleccionados) | — | ✅ OK | |
| Columna: MAQUINARIA | "maquinaria_id's categoria" | maquinaria_documentos.maquinaria_id → maquinarias | ✅ ("EQUIPO": código + modelo) | ✅ 240/242 (2 GRUAS sin maquinaria_id) | ✅ OK | 2 huérfanos de FK — incluir en depuración |
| Columna: PLACA | "maquinaria_id's Placa:unique elements" | maquinarias.placa (join) | ❌ NO visible | ⚠️ | 🟡 **Gap UI** | Agregar columna |
| Columna: PROPIETARIO | "maquinaria_id's Proveedor_id's razon_social" | maquinarias.proveedor_id → terceros (join) | ❌ NO visible | ✅ (FK migrados) | 🟡 **Gap UI** | Agregar columna |
| Columna: DOCUMENTO | "tipo_doc_id's nombre" | maquinaria_documentos.tipo_doc_id → maquinaria_tipos_docs.nombre | ✅ ("TIPO DOCUMENTO") | 🔴 **0/242 (0%)** — sale vacío en todo lo migrado | 🔴 **Gap migración CRÍTICO** | #4-M12 + DUDA-MAQ-007 |
| Columna: Nº DOCUMENTO | — (no visible en RG Bubble) | maquinaria_documentos.numero_doc | ✅ ("Nº DOCUMENTO", mono) | ⚠️ CISE 0/52 · GRUAS 190/190 pero el valor es "NOMBRE TIPO+PLACA" concatenado (ej. "SOATAYE-752.") — no es un número real | ❓ DUDA-MAQ-008 | El dato GRUAS parece ser la llave para re-vincular tipo_doc_id |
| Columna: VÁLIDO DESDE | "fecha_emision:formatted as…" | maquinaria_documentos.fecha_emision | ✅ ("VÁLIDO DESDE") | ⚠️ CISE 33/52 (63%) · GRUAS 150/190 (79%) | ⚠️ Parcial | Faltantes probablemente docs sin vencimiento — DUDA-MAQ-013 |
| Columna: ESTADO | "Group Cell Body's …" (booleano) | maquinaria_documentos.is_active + calculado | ✅ (Badge VIGENTE/VENCIDO) → será VENCIDO/POR VENCER/VIGENTE | ✅ (calculado; col. `estado` BD = 0/242, siempre NULL) | ✅ OK (decisión tomada) | Columna física `estado` sin uso — candidata a limpieza |
| Columna: VENCE (📅) | Ícono calendario | (mismo dato vencimiento) | — (fusionado en Estado/Vencimiento) | — | ✅ OK (rediseño) | |
| Columna: VÁLIDO HASTA | "fecha_vencimiento:formatted as…" | maquinaria_documentos.fecha_vencimiento | ✅ ("VENCIMIENTO") | ⚠️ CISE 33/52 · GRUAS 150/190 | ⚠️ Parcial | 76 ya vencidos → "Depurar vencidos" (ticket en curso) |
| Columna: ARCHIVO | "Link del archivo" | maquinaria_documentos.archivo_url | ✅ ("Link del archivo") | 🔴 CISE 46/52 con URL pero **46/46 en S3 de Bubble** · GRUAS 189/190 en Supabase ✅ | 🔴 **Gap migración** | #4-M13: si Bubble se apaga, CISE pierde TODOS sus archivos. URLs protocol-relative (`//s3…`) |
| Menú de Fila | Ver/editar/descargar/eliminar | — | ✅ (Editar · Descargar · Eliminar · Restaurar) | — | ✅ OK | |
| Botón Nuevo | "Nuevo" naranja | — | ✅ (GlobalDocumentDialog) | — | ✅ OK | |

### 4.2 DOCUMENTOS MAQ — Crear / Subir (popup "AGREGAR DOCUMENTO")

| Elemento | Campo Bubble | Tabla.columna Supabase | UI nueva | Dato migrado | Status | Notas |
|---|---|---|---|---|---|---|
| Tipo de documento * | Select tipo | maquinaria_documentos.tipo_doc_id | ✅ (select required) | 🔴 0% en migrados | ✅ OK (UI) | |
| Tipo de Maquinaria * (radio Interna/Externa) | Radio para filtrar el select de equipos | (filtro sobre maquinarias.propietario) | ✅ (select Todas/Interna/Externa) | — | ✅ OK | |
| Maquinaria para la que aplica * | Select equipo | maquinaria_documentos.maquinaria_id | ✅ (select required) | ✅ 240/242 | ✅ OK | |
| Documento (Máximo 5 MB) * | File upload | maquinaria_documentos.archivo_url (bucket Storage `doc_maquinarias`) | ✅ (file .pdf/.jpg/.jpeg/.png, required en create) | ⚠️ ver #4-M13 | ✅ OK | Nueva UI no declara límite 5MB — verificar límite en server action |
| Número / Referencia | — (no visible en popup Bubble) | maquinaria_documentos.numero_doc | ✅ (input opcional, campo nuevo en form) | ⚠️ ver DUDA-MAQ-008 | ✅ OK (campo nuevo) | |
| Fecha emisión / Fecha vencimiento | — (NO visibles en popup Bubble, pero la lista Bubble las muestra) | fecha_emision · fecha_vencimiento | ⚠️ Ambas **required SIEMPRE** | ⚠️ 92/242 docs migrados sin fechas | 🟡 **Gap UI** + ❓ | #4-M14: un tipo `sin_vencimiento` no debería exigir fecha_vencimiento. DUDA-MAQ-013: ¿dónde capturaba Bubble las fechas? (no salen en el popup) |

**Clasificación de gaps — Documentos Maq:**
- 🔴 **Gap migración #4-M12 (CRÍTICO):** tipo_doc_id 0/242 — columna Tipo vacía y filtro inútil para lo migrado [re-vinculación: 3h + DUDA-MAQ-007]
- 🔴 **Gap migración #4-M13 (CRÍTICO):** 46 archivos CISE en S3 de Bubble — migrar a Supabase Storage antes de apagar Bubble [3h]
- 🟡 **Gap UI #4-M15:** Columnas Placa + Propietario; búsqueda incluir placa [2h — encajar en ticket server-side en curso]
- 🟡 **Gap UI #4-M14:** Form exige fecha_vencimiento aunque el tipo no venza [1h, condicionar a requiere_vencimiento]
- ⚠️ 2 documentos GRUAS sin maquinaria_id (huérfanos de FK) — incluir en "Depurar vencidos"

---

## DUDAs Abiertas (DUDA-MAQ-004 a 014 — las 001-003 del PRE-AUDIT quedaron resueltas por decisión)

| ID | Pregunta | Impacto |
|---|---|---|
| **DUDA-MAQ-004** | `maquinaria_tipos_docs` no tiene columna **Código** (en Bubble: campo requerido + columna de lista; en usuarios `document_types.code` SÍ existe). ¿Se necesita? Si sí, ¿migrar los códigos desde Bubble? | Gap #3-M10 (schema + migración + UI) |
| **DUDA-MAQ-005** | Columnas **SEGURO** y **GARANTÍA** de la lista Bubble: hoy 0/30 tipos con categoria='seguro' y GARANTÍA no tiene equivalente en BD. ¿Qué guardaban exactamente y hay tipos que deban re-categorizarse? | Lista tipos + semántica categoria |
| **DUDA-MAQ-006** | Bubble `individual?` = "aplica a UNA maquinaria" (toggle del form). El enum nuevo `aplica_a` no tiene esa opción y el 100% migró como 'maquinaria'. ¿Se perdió semántica? ¿Algún tipo era individual en Bubble? | Migración tipos + form |
| **DUDA-MAQ-007** | `tipo_doc_id` 0/242: ¿cómo re-vincular? GRUAS: `numero_doc` contiene "NOMBRE TIPO+PLACA" (ej. "SOATAYE-752.", "SEGURO TRECBNO-811") — parseable. CISE: `numero_doc` vacío — ¿la relación existe en Bubble para extraerla? | Gap crítico #4-M12 |
| **DUDA-MAQ-008** | ¿Existía un **número real de documento** (nº de póliza/certificado) en Bubble? Lo migrado en GRUAS no es un número; CISE está vacío. Si existe, migrar; si no, la columna queda para captura futura. | Columna Nº Documento |
| **DUDA-MAQ-009** | 46 archivos CISE apuntan a S3 de Bubble. Confirmar plan: ¿descargar y re-subir a bucket `doc_maquinarias` (mismo patrón que los 50 PDFs faltantes detectados en BUBBLE_COMPARISON)? | Gap crítico #4-M13 |
| **DUDA-MAQ-010** | Placa CISE 60/153 (39%) vs GRUAS 138/140 (99%). ¿Los CISE sin placa son maquinaria no vehicular (real) o migración incompleta? | Columna/búsqueda placa |
| **DUDA-MAQ-011** | Fotos de equipo: 15/293 (5%). ¿Bubble tenía fotos que no se migraron o casi no se usaba la foto? | Migración opcional |
| **DUDA-MAQ-012** | **Archivos huérfanos en Storage** (buckets `maquinarias` y `doc_maquinarias` vs filas BD): NO se borran (decisión); levantar listado y revisarlo juntos. | Limpieza Storage |
| **DUDA-MAQ-013** | 92/242 documentos sin fecha_emision/vencimiento: ¿son docs "sin vencimiento" legítimos (tarjetas de propiedad, tablas de carga) o faltó migrar fechas? Además: el popup Bubble no muestra campos de fecha — ¿dónde se capturaban? | Gap #4-M14 + validación form |
| **DUDA-MAQ-014** | Estrategia de re-vinculación `modelo_id` (Gap #2-M6): ¿match exacto texto marca+modelo contra `maquinaria_modelos` y revisión manual del resto, o traer la FK real desde Bubble? | Gap crítico #2-M6 |

---

## Tickets de Implementación Propuestos

### 🔴 CRÍTICO (bloquean uso real del módulo)

1. **TK-M1:** Migración — re-vincular `maquinarias.modelo_id` (Gap #2-M6)
   - 292/293 sin FK; el form requiere modelo_id y deriva categoría/marca de él. Los 237 modelos ya están migrados.
   - Esfuerzo: 3h (estrategia según DUDA-MAQ-014)

2. **TK-M2:** Migración — re-vincular `maquinaria_documentos.tipo_doc_id` (Gap #4-M12)
   - 0/242. GRUAS parseable desde numero_doc; CISE requiere fuente Bubble (DUDA-MAQ-007).
   - Esfuerzo: 3h

3. **TK-M3:** Migración — mover 46 archivos CISE de S3 Bubble → Supabase Storage (Gap #4-M13, DUDA-MAQ-009)
   - Riesgo: pérdida total de documentos CISE al apagar Bubble. Normalizar también URLs protocol-relative.
   - Esfuerzo: 3h

4. **TK-M4 (EN CURSO):** `/maquinarias/documentos` server-side + columna Estado VENCIDO/POR VENCER/VIGENTE + "Depurar vencidos"
   - Decisión ya tomada; al implementarlo cubrir: quitar botón Vista, naranja estándar, export con helper `export-excel.ts`, 2 docs GRUAS sin maquinaria_id, columnas Placa/Propietario y búsqueda por placa (#4-M15).

### 🟡 MEDIA (template v1.2 + gaps UI)

5. **TK-M5:** Template v1.2 en `/maquinarias` (Gap #1-M1, #1-M2, #1-M3, #1-M4)
   - Multicampo nombre+código+placa · columnas Capacidad y Propietario (razón social) · quitar col. Estado, sort y botón Vista · PageDescription + h1 sr-only · ↓XLS · embudos · inactivos `text-red-600`. [4h]

6. **TK-M6:** Template v1.2 en `/maquinarias/modelos` y `/maquinarias/types` (Gap #2-M9, #3-M11)
   - Quitar Breadcrumb · PageDescription · multicampo · XLS · embudos · columna Categoría en tipos. ⚠️ Doble impacto: `/settings/maquinaria` (embedded). [3h]

7. **TK-M7:** Edición directa de Modelos (Gap #2-M8) — reemplazar hack querySelector/"Próximamente" por EditDialog real. [2h]

8. **TK-M8:** Form documentos: fecha_vencimiento condicional a `requiere_vencimiento` del tipo (Gap #4-M14) + validar límite 5MB server-side. [1h]

9. **TK-M9:** Tipos doc: columna Código — DEPENDE de DUDA-MAQ-004 (posible ALTER TABLE + migración + UI). [2h si aplica]

10. **TK-M10:** Alta de equipo con paso de documentos (Gap #2-M7) — decidir si se replica el wizard 2 pasos de Bubble o se mantiene crear→editar. [decisión + 2h]

### 🟢 BAJA (migraciones opcionales / limpieza)

11. **TK-M11:** Migraciones opcionales según DUDAs: fotos de equipo (DUDA-MAQ-011), placas CISE (DUDA-MAQ-010), numero_doc real (DUDA-MAQ-008), fechas faltantes docs (DUDA-MAQ-013).

12. **TK-M12:** Limpieza — borrar huérfano `app/(dashboard)/maquinarias/modelos/columns.tsx` (verificado sin imports); inventariar columnas de schema sin uso: `maquinarias.qr_url`, `hoja_vida_url`, `propiedad_proveedor`, `propietario_id`, `maquinaria_documentos.estado` (0/242, siempre NULL). [1h]

### ⚪ DEUDA TÉCNICA (decisión usuario — no auditar ahora)

- **maquinaria_horas** (1.917 filas CISE, 0 GRUAS): se usa en informes y tareas; queda registrada como deuda en `docs/TECHNICAL_DEBTS.md`.

### ⚪ OMITIDO INTENCIONAL

- `/informes/maquinaria` (`reportes-maquinaria-section.tsx`): pertenece al módulo Informes — auditar allá.
- Botón "VENCE 📅" de Bubble como columna aparte: fusionado en Estado/Vencimiento (rediseño aceptado).

---

## Próximos Pasos

1. **Resolver DUDAs con el usuario** (11 DUDAs, priorizar 007/009/014 que bloquean los tickets críticos TK-M1/M2/M3)
2. **Terminar TK-M4** (ya en curso: server-side + Estado + Depurar vencidos) incorporando #4-M15
3. **Ejecutar críticos** TK-M1 → TK-M2 → TK-M3 (migraciones de re-vinculación y archivos)
4. **Aplicar template v1.2** (TK-M5/M6) y cerrar módulo 2 en el tracker `docs/UI-TEMPLATE-LISTADOS.md`
