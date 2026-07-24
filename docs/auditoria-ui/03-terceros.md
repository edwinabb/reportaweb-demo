# Auditoría UI ↔ Datos — 03 · Terceros

**Fecha:** 2026-07-15 · **Módulo:** 3/15 (Terceros)
**Formato de referencia:** `docs/auditoria-ui/01-usuarios.md` (piloto) · `docs/auditoria-ui/02-maquinaria.md`
**Screenshots Bubble:** 10 archivos en `c:/tmp/screenshots/reportar/4 terceros/` (1 runtime de lista + 9 del editor Bubble con bindings — los archivos "editar 1-4" son el EDITOR del wizard, no el sistema nuevo)
**Datos BD PROD:** queries 2026-07-15, solo tenants CISE + GRUAS

---

## Resumen Ejecutivo

- **Sub-módulos:** Empresas (Terceros) · Contactos · Personal · Sitios · Ubigeo (vista nueva, sin equivalente Bubble)
- **Menú Bubble:** TERCEROS = lista única de empresas + wizard de 4 pasos (Inf. Básica · Contactos · Personal · Sitios). Contactos/Personal/Sitios NO tenían lista global propia en Bubble — vivían dentro del wizard del tercero.
- **Menú nuevo:** `/terceros` · `/terceros/new` · `/terceros/[id]/edit` (tabs Información General · Contactos · Sitios — **sin tab Personal**) · `/terceros/contactos` · `/terceros/personal` · `/terceros/sitios` · `/terceros/ubigeo`

**Hallazgos críticos (datos):**
1. 🔴 **Rubro: 0/678** — ni `rubro` (texto legacy) ni `rubro_id` (FK) migrados, aunque en Bubble el rubro era campo **requerido** y columna de lista (CONSTRUCCIÓN, TRANSPORTE…). El catálogo `rubros` SÍ migró (CISE 20, GRUAS 17). La columna "Rubro" de la lista nueva sale "N/A" para todo lo migrado.
2. 🔴 **Ciudad / Departamento: 0/678** — `ubicacion_ciudad`, `ubicacion_departamento` y `ubigeo_codigo` todos en 0 (solo `ubicacion_pais` migró 678/678). Las columnas CIUDAD y DEPARTAMENTO de Bubble (LIMA, SAN ISIDRO, CALLAO…) se perdieron; la columna "Ubicación" nueva muestra N/A para el 100%.
3. 🔴 **Contactos — Cargo y Área: 0/734** — ni texto (`cargo`, `area`) ni FK (`cargo_id`, `area_id`). Bubble los mostraba en lista (COORDINADOR / LOGÍSTICA). Los catálogos `contactos_cargo`/`contactos_area` existen (5+5 por tenant).
4. 🔴 **Sitios — código 7/1.696 (0,4%) · tipo 0/1.696 · dirección 0/1.696** — Bubble mostraba Código (AGEFRED-M2), Tipo (SITIO DE PROYECTO) y Dirección-Link georreferenciada; el form nuevo exige Código y Tipo como **requeridos** → editar cualquier sitio migrado obliga a recapturar.
5. 🔴 **Condición (SUNAT): 0/678** — Bubble mostraba Condición "HABIDO" junto al Estado; `condicion` nunca migró. `estado` = 'ACTIVO' en 678/678 (¿migración real o default? en Bubble había filas con ESTADO vacío).
6. 🔴 **1 registro CISE con tipo 'PROVEEDOR' (mayúsculas)** — sin RUC, sin `bubble_id`, creado post-migración. El filtro `.eq('tipo','proveedor')` de `getTerceros` (`lib/actions/terceros.ts:35`) es case-sensitive → registro **invisible** en los selects de proveedor (cotizaciones, maquinaria).

**Defectos encontrados:** 18 gaps identificados (7 críticos) · 14 DUDAs (DUDA-TER-001 a 014)

### Cobertura BD PROD por tabla (2026-07-15)

| Tabla | CISE | GRUAS | Total |
|-------|-----:|------:|------:|
| terceros | 446 | 232 | 678 |
| terceros_contactos | 493 | 241 | 734 |
| terceros_personal | 21 | 0 | 21 |
| terceros_sitios | 1.452 | 244 | 1.696 |
| terceros_sitios_rel (M:N) | 1.446 | 243 | 1.689 |
| terceros_tipos (catálogo) | 5 | 5 | 10 |
| rubros (catálogo) | 20 | 17 | 37 |
| contactos_cargo / contactos_area | 5 / 5 | 5 / 5 | 20 |
| personal_cargos | 150 | 151 | 301 |
| sitios_tipo | 7 | 8 | 15 |
| ubigeo (catálogo global, sin tenant — por diseño) | — | — | 1.874 distritos aprox. |

### Cobertura de campos clave (CISE / GRUAS)

| Campo | CISE | GRUAS | Nota |
|---|---|---|---|
| terceros.direccion | 336/446 (75%) | 225/232 (97%) | |
| terceros.estado | 446/446 'ACTIVO' | 232/232 'ACTIVO' | un solo valor |
| terceros.condicion | 0 | 0 | Bubble: HABIDO |
| terceros.rubro / rubro_id | 0 / 0 | 0 / 0 | 🔴 |
| terceros.ubicacion_ciudad / _departamento / ubigeo_codigo | 0 | 0 | 🔴 (`ubicacion_pais` 100%) |
| terceros.logo_url | 248/446 (56%) | **0/232** | DUDA-TER-014 |
| terceros.pais_id | 445/446 | 232/232 | |
| contactos.email / telefono | 493 / 464 | 240 / 208 | ✅ bien migrado |
| contactos.cargo(_id) / area(_id) | 0 | 0 | 🔴 |
| personal: cargo, email | 21/21 | — | texto plano |
| personal: telefono, firma_url, foto_url, pin | 0 | — | campos de form sin datos |
| sitios.codigo / tipo / direccion / ciudad / lat-long | 6 / 0 / 0 / 0 / 0 (de 1.452) | 1 / 0 / 0 / 0 / 0 (de 244) | 🔴 |

---

## Decisiones del usuario YA TOMADAS (no son DUDA)

| Tema | Decisión |
|------|----------|
| Componentes huérfanos detectados en el código | **NO se borran**; se listan como DUDA para revisión conjunta (DUDA-TER-010). Misma regla que DUDA-MAQ-012. |
| Catálogo `ubigeo` global sin `tenant_id` | Por diseño (catálogo nacional de Perú). No es gap de multi-tenancy. |

---

## 1. TERCEROS — Empresas

**Path Bubble:** TERCEROS (lista) + wizard paso 1 "Inf. Básica"
**Path reportaweb3:** `/terceros` · Componentes: `app/(dashboard)/terceros/page.tsx` · `terceros-client.tsx` · `terceros-table.tsx` · `columns.tsx` · `components/terceros/tercero-form.tsx` · `tercero-actions.tsx` · `quick-tercero-dialog.tsx`
**Datos BD:** 678 empresas (CISE 446, GRUAS 232) · Bubble GRUAS mostraba "235 item" (3 de diferencia — probable papelera)

### 1.1 EMPRESAS — Lista

| Elemento | Campo Bubble | Tabla.columna Supabase | UI nueva (reportaweb3) | Dato migrado | Status | Notas |
|---|---|---|---|---|---|---|
| Búsqueda 1 | "Buscar por nombre de empresa..." | terceros.razon_social | ✅ (`searchKey="razon_social"`) | ✅ 678/678 | ✅ OK | |
| Búsqueda 2 | "Buscar por RUC ..." (input SEPARADO) | terceros.ruc | ❌ NO busca por RUC | ✅ RUC ~100% | 🟡 **Gap UI** | Bubble tenía DOS buscadores; template v1.2 → multicampo razón social + RUC |
| Ícono filtro (embudo) | Popup de filtros | — | ❌ Sin `ColumnFilterHeader` | — | 🟡 **Gap UI (template)** | Embudos por columna (Tipo · Rubro · Departamento) |
| Ícono descarga (↓) | Export de la tabla | — | ❌ Sin export XLS | — | 🟡 **Gap UI (template)** | ↓XLS estándar |
| Botón Nuevo | "Nuevo" (naranja) | — | ✅ "+ Nuevo Tercero" `bg-orange-600` → `/terceros/new` | — | ✅ OK | |
| Checkbox selección + Select All | Checkbox por fila | — | ❌ NO existe en columns.tsx | — | 🟡 Gap UI menor | Definir si se necesita (en Bubble alimentaba el export) |
| Columna: (logo) | — (no visible en lista Bubble) | terceros.logo_url (bucket `tercero`) | ✅ ("Logo", columna nueva) | ⚠️ CISE 248/446 · GRUAS 0/232 | ❓ DUDA-TER-014 | ¿GRUAS tenía logos en Bubble? |
| Columna: RAZÓN SOCIAL | "Terceros's razon_social:uppercase" | terceros.razon_social | ✅ ("Razón Social") | ✅ 678/678 | ✅ OK | |
| Columna: ID TRIBUTARIO | "Terceros's ruc" | terceros.ruc | ✅ ("ID Tributario") | ✅ ~100% (1 CISE sin RUC = el anómalo) | ✅ OK | |
| Columna: RUBRO | "Terceros's rubro's Opción de Lista:uppercase" | terceros.rubro_id → rubros.nombre (y legacy terceros.rubro texto) | ✅ ("Rubro", join rubros) | 🔴 **0/678** (FK y texto) | 🔴 **Gap migración CRÍTICO** | Sale "N/A" en todo lo migrado. Catálogo rubros sí migró. Ver #1-T1 + DUDA-TER-004 |
| Columna: TIPO | "Terceros's tipo…" (3 badges circulares → lista de tipos) | terceros.tipo (texto: cliente/proveedor/ambos) + catálogo terceros_tipos (5 valores, SIN uso en UI) | ✅ ("Tipo", badge CL/PR/CL-PR) | ✅ 678/678 (677 minúsculas + 1 'PROVEEDOR') | ❓ DUDA-TER-001 + 🔴 dato | En Bubble el tipo parece multi-selección y el catálogo migrado incluye Socio y Subcontratista que el enum nuevo no representa. Registro 'PROVEEDOR' → #1-T4 |
| Columna: ESTADO | "Terceros's estado_seni/sunat" (ACTIVO; algunas filas vacías) | terceros.estado (+ estado_sunat duplicada, 0/678) | ✅ ("Estado", badge outline) | ⚠️ 678/678 = 'ACTIVO' (un solo valor; en Bubble había vacíos) | ❓ DUDA-TER-002 | Es el estado del contribuyente (SUNAT), NO is_active — no aplica la regla 6b de quitar columna Estado, pero hoy no aporta (valor único) |
| Columna: DIRECCIÓN | "Terceros's direccion" | terceros.direccion | ✅ ("Dirección", truncada 150px) | ⚠️ CISE 336/446 (75%) · GRUAS 225/232 (97%) | ⚠️ Parcial | 110 CISE sin dirección — ¿real o migración? (cubierto por DUDA-TER-003) |
| Columna: CIUDAD | "Terceros's ubicacion_ciudad" | terceros.ubicacion_ciudad / ubigeo_codigo → ubigeo | ✅ ("Ubicación": ubigeo → fallback ciudad) | 🔴 **0/678** (ciudad, departamento y ubigeo_codigo) | 🔴 **Gap migración CRÍTICO** | "N/A" para el 100% migrado. Ver #1-T2 + DUDA-TER-003 |
| Columna: DEPARTAMENTO | "Terceros's ubicacion_departamento" | terceros.ubicacion_departamento | ⚠️ Fusionada en "Ubicación" (distrito, departamento) | 🔴 0/678 | 🔴 (mismo gap) | Rediseño de columna aceptable, pero sin dato no muestra nada |
| Columna: País | — (no era columna en Bubble) | terceros.pais_id → paises.nombre | ✅ ("País", columna nueva) | ✅ 677/678 | ✅ OK (campo nuevo en lista) | |
| Toggle Activos/Papelera | — (Bubble filtraba con toggle) | terceros.is_active | ✅ Activos \| Papelera | ✅ | ✅ OK | |
| Sort en columnas | — (sin sort en Bubble) | — | ⚠️ `DataTableColumnHeader` en 6 columnas | — | 🟡 **Gap UI (template)** | Regla 3 v1.2: sin sort |
| Botón "Vista" | — | — | ⚠️ DataTableViewOptions presente (DataTable estándar) | — | 🟡 **Gap UI (template)** | Regla 5 v1.2: prohibido |
| Menú de Fila (•••) | Acciones en RG | — | ✅ (`TerceroActions`) | — | ✅ OK | |
| Paginación "1 2 3 4" | Paginación Bubble | — | ✅ (DataTable estándar) | — | ✅ OK | |

**Clasificación de gaps — Lista Empresas:**
- 🔴 **Gap migración #1-T1 (CRÍTICO):** Rubro 0/678 (FK y texto). Re-vincular desde Bubble contra catálogo `rubros` ya migrado. [3h + DUDA-TER-004]
- 🔴 **Gap migración #1-T2 (CRÍTICO):** Ciudad/Departamento/ubigeo 0/678 (solo país migró). Migrar a `ubigeo_codigo` por match de texto contra catálogo `ubigeo` (o a campos legacy). [3h + DUDA-TER-003]
- 🔴 **Gap migración #1-T3:** `condicion` (SUNAT) 0/678; `estado` con valor único 'ACTIVO' sospechoso de default. [1h + DUDA-TER-002]
- 🔴 **Gap dato #1-T4:** registro 'PROVEEDOR' mayúsculas invisible al filtro case-sensitive. Normalizar + constraint/CHECK o normalización en insert. [30 min + DUDA-TER-009]
- 🟡 **Gap UI #1-T5:** Búsqueda multicampo razón social + RUC (Bubble tenía ambos buscadores) [30 min]
- 🟡 **Gap UI #1-T6:** Template v1.2: quitar sort + botón Vista, PageDescription + h1 sr-only, ↓XLS, embudos, inactivos `text-red-600` [3h]

---

### 1.2 EMPRESAS — Crear / Editar (Bubble: wizard 4 pasos · Nuevo: form + tabs en edit)

**Paso 1 Bubble "Inf. Básica"** ↔ `tercero-form.tsx` (react-hook-form + zod; en edit con tabs Información General · Contactos · Sitios)

| Elemento | Campo Bubble | Tabla.columna Supabase | UI nueva | Dato migrado | Status | Notas |
|---|---|---|---|---|---|---|
| Código tributario (RUC) * | "Terceros's ruc" | terceros.ruc | ✅ ("Número de RUC / Registro", requerido) | ✅ ~100% | ⚠️ Validación | zod exige **exactamente 11 dígitos** (RUC Perú); Bubble decía "Código tributario" genérico. DUDA-TER-013 |
| Estado (readonly) | "Terceros's estado_…" (ACTIVO — probable lookup RUC/SUNAT) | terceros.estado | ❌ NO visible en form | ⚠️ 678/678 'ACTIVO' | ❓ DUDA-TER-002 | ¿Se replica la consulta SUNAT o se muestra readonly? |
| Condición (readonly) | "Terceros's condicion_…" (HABIDO) | terceros.condicion | ❌ NO visible en form | 🔴 0/678 | 🔴 #1-T3 + DUDA-TER-002 | |
| Nombre de la Empresa (Razón social) * | "Terceros's razon_social" | terceros.razon_social | ✅ (input requerido) | ✅ 678/678 | ✅ OK | |
| Tipo de Tercero * | "Selecciona tipo(s) de tercero" (multi, catálogo) | terceros.tipo (texto) — catálogo terceros_tipos sin uso | ✅ (select fijo Cliente/Proveedor/Ambos) | ✅ (solo 3 valores en datos) | ❓ DUDA-TER-001 | Catálogo migrado con 5 valores (incl. Socio, Subcontratista) que la UI no ofrece |
| Rubro * (+ botón agregar) | "Selecciona el rubro" + alta inline | terceros.rubro_id → rubros | ✅ (SearchableSelect + `ActionCatalogoDialog`) pero **opcional** | 🔴 0/678 | 🔴 #1-T1 | En Bubble era requerido; en nuevo es opcional — decidir al migrar |
| Logo (JPG/JPEG/PNG, 200×80 sugerido) | Upload imagen | terceros.logo_url (bucket `tercero`) | ✅ (upload client-side, sin sugerencia de tamaño) | ⚠️ CISE 56% · GRUAS 0% | ❓ DUDA-TER-014 | |
| Dirección fiscal | "Terceros's direccion" | terceros.direccion | ✅ ("Dirección Fiscal / Principal") | ⚠️ 83% | ✅ OK (UI) | |
| Ciudad * | Select ciudad | terceros.ubigeo_codigo (cascada) / ubicacion_ciudad (no-PE) | ✅ (si PE: Departamento→Provincia→Distrito; si no: Ciudad texto) | 🔴 0/678 | 🔴 #1-T2 | UI nueva más rica (ubigeo real), pero requerido en Bubble y opcional en nuevo |
| Estado/Departamento * | "LIMA" (select) | (cubierto por cascada ubigeo) | ✅ (Departamento en cascada) | 🔴 0/678 | 🔴 #1-T2 | |
| País * | Select país | terceros.pais_id → paises | ✅ (SearchableSelect, default PE) | ✅ 677/678 | ✅ OK | |
| Botones Cerrar / Siguiente (wizard) | Wizard 4 pasos | — | ⚠️ Form único; Contactos/Sitios como tabs SOLO en edit; **Personal no existe como tab** | — | 🟡 **Gap UI (flujo)** | Ver #2-T9 (alta sin contactos/sitios) y #3-T10 (tab Personal ausente) |
| Alta rápida (sin equivalente Bubble) | — | terceros vía `QuickTerceroDialog` (cotizaciones, planificación) | ⚠️ Recoge campo **Email (Contacto Principal)** que `createTercero` NO lee → se descarta en silencio | — | 🟡 **Gap UI (bug)** | `quick-tercero-dialog.tsx:99` vs `lib/actions/terceros.ts:88-103`. #1-T7 + DUDA-TER-012 |

**Clasificación de gaps — Crear/Editar Empresas:**
- 🔴 (heredados de 1.1): #1-T1 rubro, #1-T2 ubicación, #1-T3 estado/condición
- 🟡 **Gap UI #1-T7:** QuickTerceroDialog pierde el email capturado (persistir en `terceros.email` —columna existe, 0 datos— o crear `terceros_contactos`; o quitar el campo) [1h + DUDA-TER-012]
- 🟡 **Gap UI #1-T8:** Validación RUC 11 dígitos estricta [decisión DUDA-TER-013]
- ⚪ Campos de schema sin UI ni datos: `nombre_comercial` (0), `telefono` (0), `email` (0), `con_informe` (0 true), `vendedor_asignado_id` (0), `activo` (bool redundante con is_active), `estado_sunat`/`condicion_sunat` (duplican `estado`/`condicion`, 0) — inventariar en limpieza de schema (TK-T12)

---

## 2. CONTACTOS

**Path Bubble:** wizard paso 2 "Contactos" (lista embebida por tercero)
**Path reportaweb3:** `/terceros/contactos` (lista GLOBAL, vista nueva) · `contactos/client-page.tsx` (columnas inline) + `ContactoDialog` · **doble impacto:** tab Contactos en `/terceros/[id]/edit` usa `TerceroContactosManager` (form inline distinto)
**Datos BD:** 734 contactos (CISE 493, GRUAS 241)

### 2.1 CONTACTOS — Lista

| Elemento | Campo Bubble | Tabla.columna Supabase | UI nueva | Dato migrado | Status | Notas |
|---|---|---|---|---|---|---|
| Búsqueda | "Buscar por nombre del contacto" | terceros_contactos.nombre_completo | ✅ (`searchKey="nombre_completo"`) | ✅ | 🟡 template | Multicampo nombre + empresa + email |
| Ícono filtro + descarga + paginación | Filtros popup + export | — | ❌ Sin embudos ni XLS | — | 🟡 **Gap UI (template)** | |
| Columna: Nombre | "terceros_contactos's nombre_completo:uppercase" | terceros_contactos.nombre_completo | ✅ ("Nombre Completo") | ✅ 734/734 | ✅ OK | |
| Columna: Cargo | "terceros_contactos's cargo's Opción de Lista:uppercase" | terceros_contactos.cargo (texto) + cargo_id (FK, ambos vacíos) | ✅ ("Cargo") | 🔴 **0/734** | 🔴 **Gap migración CRÍTICO** | Columna vacía para todo lo migrado. Ver #2-T9 + DUDA-TER-005 |
| Columna: Contacto (íconos ✉ / WhatsApp) | email + telefono clickeables | terceros_contactos.email · telefono | ⚠️ Mostrados como columnas de texto ("Correo Electrónico", "Teléfono") | ✅ email 733/734 · tel 672/734 | ✅ OK (rediseño) | Considerar mailto/wa.me como en Bubble (mejora menor) |
| Columna: Área | "terceros_contactos's area's Opción de Lista:uppercase" | terceros_contactos.area (texto) + area_id (FK, ambos vacíos) | ✅ ("Área") | 🔴 **0/734** | 🔴 (mismo gap #2-T9) | |
| Columna: Empresa | "terceros_contactos's tercero_id's razon_social:uppercase" | terceros_contactos.tercero_id → terceros.razon_social | ✅ ("Empresa", 1ª columna) | ✅ | ✅ OK | |
| Activos \| Papelera + Nuevo | — | is_active | ✅ (naranja estándar) | ✅ | ✅ OK | |
| Menú de Fila: Editar | Editar en RG | — | ⚠️ Hack `document.querySelector('[data-contacto-edit]')` | — | 🟡 **Gap UI** | Mismo antipatrón que modelos (#2-M8 de Maquinaria). `client-page.tsx:112-117` |
| Menú de Fila: Eliminar/Restaurar | — | — | ⚠️ `confirm()` nativo del navegador (no AlertDialog) | — | 🟡 estilo | |
| Breadcrumb | — | — | ⚠️ Presente | — | 🟡 template | Regla v1.2: prohibido |

### 2.2 CONTACTOS — Crear / Editar (popup "Agregar Contacto")

| Elemento | Campo Bubble | Tabla.columna Supabase | UI nueva | Dato migrado | Status | Notas |
|---|---|---|---|---|---|---|
| Empresa * | tercero del wizard (implícito) | terceros_contactos.tercero_id | ✅ (select requerido; preseleccionado desde tab del tercero) | ✅ | ✅ OK | |
| Nombre completo * | nombre_completo | terceros_contactos.nombre_completo | ✅ (input, fuerza MAYÚSCULAS) | ✅ | ✅ OK | |
| Correo electrónico | email | terceros_contactos.email | ✅ (label dice `*` pero zod lo permite vacío) | ✅ 99,9% | 🟡 menor | Incongruencia label vs validación |
| Teléfono | telefono | terceros_contactos.telefono | ✅ (prefijo 🇵🇪 hardcoded) | ✅ 92% | ✅ OK | |
| Cargo * (catálogo) | cargo (Opción de Lista) | terceros_contactos.cargo ← guarda **texto** del catálogo contactos_cargo (cargo_id queda sin uso) | ✅ (select catálogo + alta inline) | 🔴 0/734 | 🔴 #2-T9 + ❓ DUDA-TER-005 | Definir patrón: ¿texto o FK? La UI guarda nombre en `cargo`; la columna `cargo_id` existe pero nadie la escribe |
| Área (catálogo) | area (Opción de Lista) | terceros_contactos.area ← ídem (area_id sin uso) | ✅ (select catálogo + alta inline) | 🔴 0/734 | 🔴 ídem | |
| Cerrar / Guardar | Botones popup | — | ✅ | — | ✅ OK | |
| **Duplicación de form** | — | — | ⚠️ `TerceroContactosManager` (tab en edit) reimplementa el form inline, distinto del `ContactoDialog` | — | 🟡 **Gap UI** | ❓ DUDA-TER-011: unificar en un solo componente |

**Clasificación de gaps — Contactos:**
- 🔴 **Gap migración #2-T9 (CRÍTICO):** cargo y área 0/734 (ni texto ni FK) — migrar desde Bubble contra catálogos `contactos_cargo`/`contactos_area` [3h + DUDA-TER-005]
- 🟡 **Gap UI #2-T10:** Editar vía hack querySelector → EditDialog directo; confirm() → AlertDialog [2h]
- 🟡 **Gap UI #2-T11:** Template v1.2 (sin breadcrumb, PageDescription, multicampo, XLS, embudos) [2h]
- ❓ **DUDA-TER-011:** duplicación ContactoDialog vs TerceroContactosManager

---

## 3. PERSONAL

**Path Bubble:** wizard paso 3 "Personal" — ⚠️ los bindings apuntan a **User** ("Parent group's User's nombre_completo", "User's id_cargo's Opción de Lista", "User's doc_number"): en Bubble el Personal del tercero eran USUARIOS del sistema vinculados a la empresa, "quienes participan en los informes diarios"
**Path reportaweb3:** `/terceros/personal` (lista global) · `personal/client-page.tsx` (columnas inline) + `PersonalDialog` · tabla PROPIA `terceros_personal` (desvinculada de `profiles`) · **sin tab en `/terceros/[id]/edit`**
**Datos BD:** 21 registros (CISE 21, GRUAS 0) — comparar con `profiles.tercero_id` = 209 usuarios vinculados a terceros (DUDA-102 de Usuarios)

### 3.1 PERSONAL — Lista

| Elemento | Campo Bubble | Tabla.columna Supabase | UI nueva | Dato migrado | Status | Notas |
|---|---|---|---|---|---|---|
| Búsqueda | "Buscar por nombre del usuario" | terceros_personal.nombres | ✅ (`searchKey="nombres"`) | ✅ | 🟡 template | Multicampo nombres + apellidos + nº doc |
| Columna: (foto) | Avatar del User | terceros_personal.foto_url | ❌ NO visible | ❌ 0/21 | 🟡 Gap UI menor | Campo existe en form (ImageUpload) pero no en lista |
| Columna: Nombre | "User's nombre_completo:uppercase" | terceros_personal.nombres + apellidos | ✅ ("Nombres" / "Apellidos", 2 columnas) | ✅ 21/21 | ⚠️ semántica | ❓ DUDA-TER-006: entidad distinta a la de Bubble (User vs tabla propia) |
| Columna: Cargo | "User's id_cargo's Opción de Lista" | terceros_personal.cargo (texto; catálogo personal_cargos 150/151 registros) | ✅ ("Cargo") | ✅ 21/21 | ⚠️ | ❓ DUDA-TER-006: en Bubble el cargo venía de job_titles del User; catálogo personal_cargos paralelo sospechosamente igual a cargos de usuarios |
| Columna: Contacto (✉ / WhatsApp) | email/teléfono del User | terceros_personal.email · telefono | ⚠️ Solo "Teléfono" como texto; email NO visible | ⚠️ email 21/21 · tel **0/21** | 🟡 Gap UI | Mostrar email (dato 100%); teléfono vacío |
| Columna: Doc | "User's doc_number" | terceros_personal.tipo_doc + numero_doc | ✅ ("Doc" badge + "Número Doc") | ✅ 21/21 | ✅ OK | |
| Columna: Empresa | — (implícita: wizard del tercero) | terceros_personal.tercero_id → terceros | ❌ NO visible en lista global | ✅ | 🟡 **Gap UI** | En lista GLOBAL es imprescindible saber de qué tercero es cada persona |
| Badges finales (Pare…) | Indicadores del User (¿firma/foto?) | terceros_personal.firma_url / foto_url / pin | ❌ NO visibles | ❌ 0/21 los tres | ❓ DUDA-TER-006 | No asumir qué eran los badges — preguntar |
| Activos \| Papelera + Nuevo | — | is_active | ✅ | ✅ | ✅ OK | |
| Menú de Fila: Editar | — | — | ⚠️ Hack querySelector (ídem contactos) | — | 🟡 Gap UI | |
| Breadcrumb | — | — | ⚠️ Presente | — | 🟡 template | |

### 3.2 PERSONAL — Crear / Editar (popup)

| Elemento | Campo Bubble | Tabla.columna Supabase | UI nueva | Dato migrado | Status | Notas |
|---|---|---|---|---|---|---|
| Nombres * / Apellidos * | User first/last | terceros_personal.nombres · apellidos | ✅ | ✅ 21/21 | ✅ OK | |
| País * | User nationality | terceros_personal.pais_nacionalidad (texto, default "Peru") | ✅ | ✅ | ✅ OK | |
| Tipo Doc * / Nº Doc * | User doc | terceros_personal.tipo_doc · numero_doc | ✅ (default DNI) | ✅ | ✅ OK | |
| Cargo * | User id_cargo | terceros_personal.cargo ← texto de catálogo personal_cargos | ✅ (select + alta inline) | ✅ | ⚠️ DUDA-TER-006 | Mismo dilema texto vs FK que contactos |
| Contratista (tercero) * | tercero del wizard | terceros_personal.tercero_id | ✅ (select requerido) | ✅ | ✅ OK | |
| Email / Teléfono | User email/phone | terceros_personal.email · telefono | ✅ (opcionales) | ⚠️ email 100% · tel 0% | ⚠️ | |
| Firma (upload) | — (¿badge en Bubble?) | terceros_personal.firma_url | ✅ (ImageUpload) | ❌ 0/21 | ❓ DUDA-TER-006 | |
| Foto (upload) | Avatar User | terceros_personal.foto_url | ✅ (ImageUpload) | ❌ 0/21 | ❓ | |
| PIN | — | terceros_personal.pin | ✅ (input opcional) | ❌ 0/21 | ⚪ campo nuevo | Paralelo al PIN de usuarios (0% también allá) |

**Clasificación de gaps — Personal:**
- ❓ **DUDA-TER-006 (BLOQUEANTE del sub-módulo):** En Bubble Personal = Users vinculados al tercero (209 profiles.tercero_id migrados); en nuevo = tabla propia con solo 21 filas CISE. ¿Es la misma entidad? ¿Los 21 son migración completa de una tabla Bubble distinta ("personal externo no-usuario") o falta migrar? ¿GRUAS de verdad tenía 0? Definir antes de tocar UI.
- 🟡 **Gap UI #3-T12:** Columna Empresa (tercero) en lista global + email visible + foto [1h]
- 🟡 **Gap UI #3-T13:** Tab "Personal" ausente en `/terceros/[id]/edit` (Bubble paso 3 vivía dentro del tercero) [2h]
- 🟡 **Gap UI #3-T14:** Template v1.2 + editar sin hack querySelector [2h]

---

## 4. SITIOS

**Path Bubble:** wizard paso 4 "Sitios" — M:N: binding "Terceros_Sitios' tercero_id:each item's razon_social" (un sitio podía pertenecer a varios terceros) — ⚠️ en runtime la columna se titulaba "Ciudad" pero mostraba la razón social (label engañoso en Bubble)
**Path reportaweb3:** `/terceros/sitios` (lista global) · `sitios/client-page.tsx` (columnas inline) + `SitioDialog` · M:N vía `terceros_sitios_rel` · **doble impacto:** tab Sitios en `/terceros/[id]/edit` usa `TerceroSitiosManager` (form inline CON MapPicker lat/long, distinto del dialog)
**Datos BD:** 1.696 sitios (CISE 1.452, GRUAS 244) · 1.689 relaciones M:N

### 4.1 SITIOS — Lista

| Elemento | Campo Bubble | Tabla.columna Supabase | UI nueva | Dato migrado | Status | Notas |
|---|---|---|---|---|---|---|
| Búsqueda | "Buscar por nombre del sitio" | terceros_sitios.nombre | ✅ (`searchKey="nombre"`) | ✅ 1.696/1.696 | 🟡 template | Multicampo nombre + código + tercero |
| Columna: Código | "Terceros_Sitios's …" (AGEFRED-M2) | terceros_sitios.codigo | ✅ ("Código", mono bold) | 🔴 **7/1.696 (0,4%)** | 🔴 **Gap migración CRÍTICO** | Columna vacía para casi todo. Ver #4-T15 + DUDA-TER-008 |
| Columna: Sitio | "Terceros_Sitios's nombre" | terceros_sitios.nombre | ✅ ("Nombre Sitio") | ✅ 100% | ✅ OK | |
| Columna: Tipo | "Terceros_Sitios' tipo_id's Opción de Lista" (SITIO DE PROYECTO) | terceros_sitios.tipo (uuid → sitios_tipo) | ⚠️ ("Tipo" badge) pero renderiza `row.getValue("tipo")` = **uuid crudo**, sin join | 🔴 **0/1.696** | 🔴 **Gap migración + bug UI** | Catálogo sitios_tipo migrado (7/8). Ver #4-T15; bug del render en #4-T18 |
| Columna: Dirección - Link | "Ubicación Geográfica's formatted address" (link georreferenciado) | terceros_sitios.direccion + latitud/longitud | ✅ ("Dirección") | 🔴 **0/1.696** (direccion y lat/long) | 🔴 **Gap migración** | Bubble TENÍA la geodata (era el link). Ver #4-T16 + DUDA-TER-007 |
| Columna: Ciudad (mostraba razón social) | "tercero_id:each item's razon_social:upper" | terceros_sitios_rel → terceros | ✅ ("Tercero(s) Asociado(s)", badges) — corrige el label engañoso de Bubble | ✅ 1.689 rel | ✅ OK | |
| Columna: Ciudad (dato real) | — | terceros_sitios.ciudad | ✅ ("Ciudad") | ❌ 0/1.696 | ⚠️ | Sin dato; probablemente Bubble no la tenía como campo aparte — cubierto por DUDA-TER-007 |
| Activos \| Papelera + Nuevo | — | is_active | ✅ | ✅ | ✅ OK | |
| Menú de Fila: Editar | — | — | ⚠️ Hack querySelector + `confirm()` | — | 🟡 Gap UI | |
| Ícono filtro + ↓ + paginación | — | — | ❌ Sin embudos ni XLS | — | 🟡 template | Breadcrumb presente (prohibido) |

### 4.2 SITIOS — Crear / Editar (popup "AGREGAR SITIO" + manager inline)

| Elemento | Campo Bubble | Tabla.columna Supabase | UI nueva | Dato migrado | Status | Notas |
|---|---|---|---|---|---|---|
| Tercero(s) asociado(s) * | tercero_id (lista M:N) | terceros_sitios_rel (+ terceros_sitios.tercero_id legacy) | ✅ (checkboxes multi) | ✅ | ✅ OK | Modelo M:N respetado |
| Código * | codigo | terceros_sitios.codigo | ✅ (requerido) | 🔴 0,4% | 🔴 #4-T15 | **Editar cualquier sitio migrado obliga a inventar código** |
| Nombre * | nombre | terceros_sitios.nombre | ✅ (fuerza MAYÚSCULAS) | ✅ | ✅ OK | |
| Tipo * | tipo_id (catálogo) | terceros_sitios.tipo (uuid) ← select sitios_tipo + alta inline | ✅ (requerido) | 🔴 0% | 🔴 #4-T15 | Ídem: obliga a recapturar tipo |
| Dirección | Ubicación Geográfica (geocoded) | terceros_sitios.direccion | ✅ (texto, MAYÚSCULAS) — SIN mapa en dialog | 🔴 0% | 🔴 #4-T16 | |
| Lat/Long + Mapa | Ubicación Geográfica | terceros_sitios.latitud · longitud | ⚠️ SOLO en `TerceroSitiosManager` (MapPicker + geocoding); el `SitioDialog` global NO los captura | 🔴 0/1.696 | 🟡 **Gap UI (inconsistencia)** | ❓ DUDA-TER-011: dos forms distintos para la misma entidad |
| Ciudad | — | terceros_sitios.ciudad | ✅ (opcional) | ❌ 0 | ⚠️ | |
| Comentarios | — | terceros_sitios.comentarios | ❌ Sin UI | ❌ 0 | ⚪ | Columna sin uso — limpieza |
| Cerrar / Guardar | Botones popup | — | ✅ | — | ✅ OK | |

**Clasificación de gaps — Sitios:**
- 🔴 **Gap migración #4-T15 (CRÍTICO):** codigo 7/1.696 y tipo 0/1.696 con form que los exige → edición de sitios migrados rota funcionalmente [3h + DUDA-TER-008]
- 🔴 **Gap migración #4-T16 (CRÍTICO):** dirección georreferenciada 0/1.696 (Bubble la tenía como formatted address + link) [3h + DUDA-TER-007]
- 🟡 **Gap UI #4-T17:** Unificar SitioDialog vs TerceroSitiosManager (MapPicker/lat-long solo en uno; naming `tipo` vs `tipo_id`) [3h + DUDA-TER-011]
- 🟡 **Gap UI #4-T18:** Columna Tipo renderiza uuid crudo (falta join a sitios_tipo.nombre) [30 min]
- 🟡 **Gap UI #4-T19:** Template v1.2 (breadcrumb, multicampo, XLS, embudos, editar sin hack) [2h]

---

## 5. UBIGEO (vista nueva, sin equivalente Bubble)

**Path reportaweb3:** `/terceros/ubigeo` · `ubigeo/page.tsx` — tabla manual read-only (NO DataTable)
**Datos BD:** catálogo `ubigeo` (codigo, departamento, provincia, distrito, is_active) — **global sin tenant_id, por diseño**

| Elemento | Campo Bubble | Tabla.columna Supabase | UI nueva | Dato migrado | Status | Notas |
|---|---|---|---|---|---|---|
| Columna: País | — | (hardcoded "PERÚ") | ✅ | — | ⚠️ | Si algún día hay tenants no-PE, revisar |
| Columna: Departamento | — | ubigeo.departamento (distinct) | ✅ | ✅ | ✅ OK | |
| Provincia / Distrito | — | ubigeo.provincia · distrito | ❌ NO visibles | ✅ | 🟡 Gap UI menor | La página solo lista departamentos; sin búsqueda ni paginación ni template |
| Búsqueda / Nuevo / Papelera | — | — | ❌ (read-only) | — | ⚪ | Aceptable si se define como catálogo de solo consulta — confirmar en retro |

**Gap:** 🟡 **#5-T20:** Página mínima fuera de template (decidir: completarla a template v1.2 read-only con provincia/distrito + búsqueda, o quitarla del menú) [1-2h según decisión]

---

## ✅ Resolución con Bubble LIVE (2026-07-23)

Sondeo de solo lectura contra Bubble producción (`https://reporta.la/api/1.1/obj`, token de
`.env.local`), filtrado a CISE + GRUAS. **Los "gaps críticos" del módulo NO son pérdida de
datos: el dato existe en Bubble y es re-migrable — la migración quedó incompleta a nivel campo.**
⚠️ Bubble omite campos vacíos en la API → conteos sobre unión de claves de toda la tabla.

| Tipo Bubble | Filas CISE+GRUAS | Campo | Bubble LIVE | Supabase hoy | Veredicto |
|---|---:|---|---|---|---|
| `Terceros` | 639 | `rubro` (Bubble ID → rubros) | **516 (81%)** | 0/678 | ✅ **DUDA-TER-004: re-migrable** |
| `Terceros` | 639 | `ubicacion_departamento` (texto) | **550 (86%)** | 0/678 | ✅ **DUDA-TER-003: re-migrable** |
| `Terceros` | 639 | `ubicacion_ciudad` (texto) | 264 (41%) | 0/678 | ✅ DUDA-TER-003: re-migrable (parcial) |
| `Terceros` | 639 | `condicion_seniat` = HABIDO | **441 (69%)** | 0/678 | ✅ **DUDA-TER-002: re-migrable** (nombre real `_seniat`) |
| `Terceros` | 639 | `estado_seniat` = ACTIVO | 441 (69%) | 678='ACTIVO' | ⚠️ el 100% en Supabase era **default de migración**, no dato real |
| `Terceros` | 639 | `tipo` (array multi-valor) | 629 (98%) | enum plano | ✅ **DUDA-TER-001: Bubble es multi-select**; decidir si el catálogo se usa |
| `terceros_contactos` | 844 | `cargo` (**texto**, no FK) | **804 (95%)** | 0/734 | ✅ **DUDA-TER-005: re-migrable como texto** |
| `terceros_contactos` | 844 | `area` (**texto**, no FK) | **727 (86%)** | 0/734 | ✅ DUDA-TER-005: re-migrable como texto |
| `Terceros_Sitios` | 1739 | `codigo` | **1733 (100%)** | 7/1696 | ✅ **DUDA-TER-008: re-migrable** |
| `Terceros_Sitios` | 1739 | `tipo_id` (Bubble ID → sitios_tipo) | **1733 (100%)** | 0/1696 | ✅ **DUDA-TER-008: re-migrable** |
| `Terceros_Sitios` | 1739 | `latitud`/`longitud` | 303 (17%) | 0/1696 | ✅ **DUDA-TER-007: parcial (17%)**; hay campo `Ubicación Geografica` (address) |

**⚠️ Corrección (2026-07-23, tras dry-run):** los campos `cargo`/`area` de Bubble **NO son texto
sino IDs de opción de lista** (ej. `1596725183268x…`). Idem `rubro` (Terceros) y `tipo_id` (Sitios).
Para migrarlos hay que **resolver el Bubble option-ID → texto** contra el catálogo de opciones de
Bubble (tipo aún por identificar; `configuracion_opciones_listas` está casi vacío) y luego, según el
campo, guardar el texto (`cargo`/`area`) o matchear el catálogo Supabase por **nombre** (`rubro_id`
vía `rubros.nombre`, `tipo` vía `sitios_tipo.nombre`) — **no** por `bubble_id` (en TEST da 0 match
para rubros y `sitios_tipo.bubble_id` ni existe; validar en PROD). Los campos que SÍ son copia
directa (validados en dry-run): `ubicacion_ciudad`/`ubicacion_departamento`, `estadosunat`/`condicionsunat`.

**IDs de tenant en Bubble:** CISE `1596035803087x371442079041323000` · GRUAS
`1691779382086x534175713862630160`. Campo tenant: `Terceros`/`Terceros_Sitios` = `tenant_id`;
`terceros_contactos` **sin** tenant propio (se filtra por `tercero_id` → mapa de terceros).

### Cambio de esquema aplicado (2026-07-23, decisión del usuario)

Para desambiguar el estado del contribuyente vs activo/inactivo (parte de TK-T14 + DUDA-TER-002):
- **RENAME** `terceros.estado` → **`estadosunat`** · `terceros.condicion` → **`condicionsunat`**.
- **DROP** duplicados vacíos `estado_sunat` / `condicion_sunat` (0/678) + redundante `activo` (0 uso).
- **Activo/inactivo** del tercero queda en **`is_active`** (sin campo nuevo).
- Migración: `supabase/migrations/20260723120000_terceros_rename_estado_condicion_sunat.sql`
  (con guarda: aborta si las columnas a borrar tuvieran datos). Código actualizado
  (`columns.tsx`, `terceros-table.tsx`) + `types/supabase.ts`. ⏳ **Pendiente aplicar** a TEST→PROD.

---

## DUDAs Abiertas (DUDA-TER-001 a 014)

| ID | Pregunta | Impacto |
|---|---|---|
| **DUDA-TER-001** | **Tipo de Tercero:** Bubble era multi-selección ("Selecciona tipo(s)", 3 badges por fila) sobre catálogo; `terceros_tipos` migró 5 valores por tenant (Cliente · Cliente y Proveedor · Proveedor · **Socio** · **Subcontratista**) pero la UI nueva usa enum fijo cliente/proveedor/ambos y el catálogo NO se usa en ningún lado. ¿Existían terceros Socio/Subcontratista en Bubble que se aplanaron al migrar? ¿El catálogo se usa o se elimina? | Modelo de datos del módulo |
| **DUDA-TER-002** | **Estado/Condición SUNAT:** `estado` = 'ACTIVO' en 678/678 (en Bubble había filas con ESTADO vacío → sospecha de default en la migración) y `condicion` = 0/678 (Bubble mostraba HABIDO). ¿En Bubble venían de consulta al padrón SUNAT? ¿Se migran desde Bubble, se re-consultan vía API, o se descartan? Además: columnas duplicadas `estado_sunat`/`condicion_sunat` (0/678) — ¿cuál par es el canónico? | Gap #1-T3 + limpieza schema |
| **DUDA-TER-003** | **Ciudad/Departamento 0/678:** el dato existía en Bubble (columnas con LIMA, SAN ISIDRO, CALLAO…). ¿Migrar por match de texto contra catálogo `ubigeo` (→ `ubigeo_codigo`, lo que usa el form nuevo) o a los campos legacy `ubicacion_ciudad`/`ubicacion_departamento`? ¿Los 110 CISE sin dirección son reales? | Gap crítico #1-T2 |
| **DUDA-TER-004** | **Rubro 0/678:** ¿el dato existe en Bubble para re-vincular contra el catálogo `rubros` ya migrado (20+17)? ¿Match por texto o traer la FK de Bubble? ¿Rubro vuelve a ser requerido como en Bubble? | Gap crítico #1-T1 |
| **DUDA-TER-005** | **Cargo/Área de contactos 0/734:** ¿fuente en Bubble disponible? Y decisión de patrón: la UI nueva guarda el TEXTO del catálogo en `cargo`/`area` dejando `cargo_id`/`area_id` (FK) siempre NULL — ¿estandarizar a FK o aceptar texto? (aplica igual a `terceros_personal.cargo` y `terceros_sitios.tipo`) | Gap crítico #2-T9 + convención |
| **DUDA-TER-006** | **Personal — semántica:** en Bubble el paso 3 listaba **Users** (nombre_completo, id_cargo de job_titles, doc_number) vinculados al tercero; el sistema nuevo tiene tabla propia `terceros_personal` (21 CISE, 0 GRUAS) desconectada de `profiles` (que ya tiene 209 usuarios con tercero_id). ¿Son dos entidades distintas o una migración incompleta/duplicada? ¿Qué eran los badges naranjas al final de cada fila en Bubble (¿firma/foto?)? ¿Y el catálogo `personal_cargos` (150/151 filas, sospechosamente igual a cargos de usuarios) es correcto o basura de migración? | Sub-módulo Personal completo |
| **DUDA-TER-007** | **Sitios — geodata:** Bubble tenía "Ubicación Geográfica" con formatted address (columna Dirección-Link). En BD nueva `direccion`, `ciudad`, `latitud`, `longitud` están 0/1.696. ¿Se puede extraer la geodata de Bubble (address + coordenadas) y migrarla a `direccion` + `latitud`/`longitud`? | Gap crítico #4-T16 |
| **DUDA-TER-008** | **Sitios — código y tipo:** codigo 7/1.696 y tipo 0/1.696 pero el form los exige. ¿Existen en Bubble para migrar (el código se veía en lista: AGEFRED-M2)? Para tipo: catálogo `sitios_tipo` migró 7/8 — ¿match por texto del "Opción de Lista"? Mientras tanto, ¿relajar requeridos en edit para no bloquear? | Gap crítico #4-T15 |
| **DUDA-TER-009** | **Registro 'PROVEEDOR' (CISE):** mayúsculas, sin RUC, sin bubble_id, creado post-migración (los callers web de QuickTerceroDialog envían minúsculas — ¿app móvil? ¿insert manual?). Confirmar origen, normalizar a 'proveedor', completar RUC y agregar CHECK/normalización de `tipo` en el insert. | Gap #1-T4 |
| **DUDA-TER-010** | **Huérfanos (NO borrar — revisar juntos):** `app/(dashboard)/terceros/contactos/columns.tsx` · `contactos/contactos-cell-action.tsx` · `personal/columns.tsx` · `sitios/columns.tsx` (las 3 client-pages definen sus columnas inline y no los importan). | Limpieza código |
| **DUDA-TER-011** | **Formularios duplicados:** ContactoDialog vs TerceroContactosManager, y SitioDialog vs TerceroSitiosManager (este último es el ÚNICO con MapPicker/lat-long y usa `tipo_id` mientras el dialog usa `tipo`). ¿Cuál es el canónico para unificar? | Gaps #2-T10/#4-T17 |
| **DUDA-TER-012** | **QuickTerceroDialog:** recoge "Email (Contacto Principal)" que `createTercero` descarta. ¿Persistir en `terceros.email` (columna existe, 0 datos), crear un `terceros_contactos`, o eliminar el campo del dialog? | Gap #1-T7 |
| **DUDA-TER-013** | **Validación RUC:** zod exige exactamente 11 dígitos (RUC peruano); Bubble lo llamaba "Código tributario" genérico y el form nuevo soporta terceros de otros países (select País + Ciudad libre). ¿Relajar la validación cuando pais ≠ PE? | Form empresas |
| **DUDA-TER-014** | **Logos:** CISE 248/446 (56%) con logo, GRUAS 0/232. ¿GRUAS tenía logos en Bubble que no se migraron, o no los usaba? | Migración opcional |

---

## Tickets de Implementación Propuestos

### 🔴 CRÍTICO (bloquean uso real del módulo)

1. **TK-T1:** Migración — re-vincular `terceros.rubro_id` contra catálogo `rubros` (Gap #1-T1, DUDA-TER-004). 0/678 hoy; columna de lista y campo de form sin dato. [3h]

2. **TK-T2:** Migración — ubicación: `ubigeo_codigo` (match texto ciudad/departamento Bubble → catálogo `ubigeo`) o campos legacy (Gap #1-T2, DUDA-TER-003). 0/678 hoy; columna "Ubicación" en N/A total. [3h]

3. **TK-T3:** Migración — cargo/área de contactos (Gap #2-T9, DUDA-TER-005) + decidir convención texto-vs-FK para los 4 pares campo/catálogo del módulo. [3h]

4. **TK-T4:** Migración — sitios: código + tipo + dirección/geodata (Gaps #4-T15, #4-T16, DUDAs 007/008). Mientras se migra: relajar requeridos de código/tipo en EDIT para no bloquear la edición de 1.689 sitios. [4h]

5. **TK-T5:** Data fix — normalizar registro 'PROVEEDOR' + normalización/CHECK de `tipo` en insert + `condicion` SUNAT según DUDA-TER-002 (Gaps #1-T3, #1-T4). [1h]

### 🟡 MEDIA (template v1.2 + gaps UI)

6. **TK-T6:** Template v1.2 en `/terceros` (Gaps #1-T5, #1-T6): búsqueda multicampo razón social + RUC · quitar sort y botón Vista · PageDescription + h1 sr-only · ↓XLS · embudos (Tipo/Rubro/Departamento) · inactivos `text-red-600`. [3h]

7. **TK-T7:** Template v1.2 en `/terceros/contactos`, `/personal`, `/sitios` (Gaps #2-T11, #3-T14, #4-T19): quitar breadcrumbs · PageDescription · multicampo · XLS · embudos · reemplazar hack querySelector por EditDialog directo y `confirm()` por AlertDialog (patrón TK-M7 de Maquinaria). [4h]

8. **TK-T8:** Fix columna Tipo de sitios: join a `sitios_tipo.nombre` en vez de uuid crudo (Gap #4-T18). [30 min]

9. **TK-T9:** Unificar formularios duplicados contacto/sitio (dialog vs manager) e incorporar MapPicker/lat-long al form canónico de sitios (Gap #4-T17, DUDA-TER-011). [3h]

10. **TK-T10:** QuickTerceroDialog: persistir o eliminar el campo Email (Gap #1-T7, DUDA-TER-012). [1h]

11. **TK-T11:** Lista Personal: columna Empresa (tercero) + email visible + tab Personal en `/terceros/[id]/edit` (Gaps #3-T12, #3-T13) — **CONDICIONADO a DUDA-TER-006** (semántica del sub-módulo). [3h si aplica]

12. **TK-T12:** `/terceros/ubigeo`: completar a template read-only (provincia/distrito + búsqueda) o retirar del menú (Gap #5-T20). [1-2h según decisión]

### 🟢 BAJA (migraciones opcionales / limpieza)

13. **TK-T13:** Migraciones opcionales según DUDAs: logos GRUAS (DUDA-TER-014), teléfonos de personal (0/21), 110 direcciones CISE faltantes.

14. **TK-T14:** Limpieza de schema (inventariar, no borrar sin confirmar): `terceros.nombre_comercial/telefono/email` (0 datos, sin UI — email pendiente de DUDA-TER-012), `activo` (redundante con is_active), `con_informe` (0 true), `vendedor_asignado_id` (0), par duplicado `estado_sunat`/`condicion_sunat`, `terceros_sitios.comentarios` (0, sin UI), `terceros_sitios.tercero_id` legacy (superseded por M:N rel), FKs sin uso `terceros_contactos.cargo_id/area_id` (según convención DUDA-TER-005). Huérfanos de código: solo listar (DUDA-TER-010).

### ⚪ OMITIDO INTENCIONAL

- Columna "Ciudad" de sitios en Bubble que mostraba razón social: label engañoso del sistema viejo; la lista nueva ya lo separa en "Tercero(s) Asociado(s)" — rediseño correcto, no gap.
- Íconos ✉/WhatsApp de Bubble mostrados como texto en las listas nuevas: rediseño aceptado (mejora menor opcional en TK-T7).
- Catálogo `ubigeo` global sin tenant: por diseño, no es gap.

---

## Próximos Pasos

1. **Resolver DUDAs con el usuario** (14 DUDAs; priorizar **006** que bloquea el sub-módulo Personal y **003/004/005/007/008** que definen los tickets críticos TK-T1 a TK-T4)
2. **Ejecutar críticos** TK-T1 → TK-T4 (migraciones de re-vinculación) + TK-T5 (data fix 'PROVEEDOR')
3. **Aplicar template v1.2** (TK-T6/T7) y correcciones UI (TK-T8/T9/T10)
4. Cerrar módulo 3 en el tracker `docs/UI-TEMPLATE-LISTADOS.md`
