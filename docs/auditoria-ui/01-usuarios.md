# Auditoría UI ↔ Datos — 01 · Usuarios (piloto)

**Fecha:** 2026-07-14 · **Piloto de:** auditoría completa módulo Usuarios  
**Especificación:** `docs/superpowers/specs/2026-07-14-auditoria-ui-datos-design.md`  
**Decisiones de diseño aprobadas:** `memory/project_estandar_listas_ui.md`  
**Datos BD prod:** ejecución `audit-usuarios-data.ts` exitosa (2026-07-14)

---

## Resumen Ejecutivo

- **Sub-módulos:** Usuarios (Directorio) · Tipos de Documento (Catálogo) · Documentos de Usuario (Gestión)
- **Screenshots Bubble:** 11 archivos en `c:/tmp/screenshots/reportar/1 usuarios/`
- **Cambios de diseño aprobados:**
  - ❌ Sin mapa de Google en dirección
  - ↔️ Firma electrónica y PIN: movidos del paso 1 al paso 2 (después de dirección y contacto familiar)
  - 🔐 Firma y PIN: re-autenticación requerida en edit/view (visibles directo solo en CREATE)
  - 🔍 Búsqueda multicampo case-insensitive + filtros por columna (no popup)

**Defectos encontrados:** 12 gaps identificados (orden de resolución: Crítico → Media → Baja)

---

## 1. USUARIOS — Directorio

**Path Bubble:** OPERACIONES → Usuarios → Directorio  
**Path reportaweb3:** `/users` · Componentes: `app/\(dashboard\)/users/page.tsx` · `components/users/user-form.tsx` · `components/users/user-actions.tsx`  
**Datos BD:** 327 perfiles (CISE 103 activos, GRUAS 224 activos)

### 1.1 USUARIOS — Lista

| Elemento | Campo Bubble | Tabla.columna Supabase | UI nueva (reportaweb3) | Dato migrado | Status | Notas |
|---|---|---|---|---|---|---|
| Búsqueda | "Buscar nombre de usuario..." (por nombre) | profiles.first_name, profiles.last_name, profiles.doc_number | ❌ Solo busca email (searchKey="email") | ✅ Datos presentes | 🟡 **Gap UI** | Implementar multicampo: nombre completo + nro documento (patrón en `lib/actions/user-documents-query.ts:L47`) |
| Columna: Select | Checkbox individual + Select All | — | ✅ | — | ✅ OK | |
| Columna: Nro Documento | "Parent group's User's doc_number" (mostrado con badge) | profiles.doc_number | ✅ (DataTableColumnHeader "Nro. Documento") | ✅ (327 perfiles, 100% coverage) | ✅ OK | Mostrado junto a nombre |
| Columna: Email | "Parent group's User's email" (no visible en RG pero en tooltip/menú) | profiles.email | ✅ (columna "Email") | ✅ (100% coverage) | ✅ OK | |
| Columna: Nombre Completo | "Parent group's User's nombre_completo is not empty:formatted as text" (full_name, first_name + last_name) | profiles.first_name, profiles.last_name, profile_details.middle_name (opcional) | ✅ (cell override combina first_name + last_name) | ✅ Completo: 327 usuarios con names | ✅ OK | |
| Columna: Cargo/Rol | "Parent group's User's id_cargo's Opción de Lista" (job_title binding) | profiles.job_title_id → job_titles.name | ✅ (columna "Rol", mostrado como badge) | ⚠️ **Parcial**: job_titles vinculados pero algunos usuarios sin cargo asignado | 🟡 **Gap migración** | Auditar cuántos perfiles no tienen job_title_id (DUDA-101) |
| Columna: Proveedor/Tercero | "Parent group's User's id_tercero's razón_social" (terceros binding) | profiles.tercero_id → terceros.razon_social (¿FK existe?) | ❌ NO visible en UI nueva | ✅ Columna tercero_id existe en schema pero 0 datos migrados | 🔴 **Gap migración + UI** | DUDA-102: ¿Todos los usuarios en Bubble tenían proveedor asignado? |
| Columna: Estado | "Parent group's User's is_active" (booleano mostrando Activo/Inactivo) | profiles.is_active | ✅ (columna "Estado", Badge rojo/verde) | ✅ (CISE 103 activos de 103 total, GRUAS 224 activos de 224 total) | ✅ OK | |
| Ícono Email | "Parent group's User's email" (clickable) | profiles.email | ✅ (columna visible) | ✅ | ✅ OK | |
| Ícono Teléfono | "Parent group's User's phone" (clickable si no vacío) | profiles.phone | ❌ NO visible en UI nueva | ❌ Vacío en prod (0 registros con phone en CISE/GRUAS) | 🔴 **Gap migración** | Phone nunca se migró; no mostrar si columna vacía |
| Menú de Fila (•••) | Acciones: Ver · Editar · Deshabilitar · Eliminar (en RG) | — | ✅ (UserActions component) | — | ✅ OK | Implementado |

**Clasificación de gaps — Lista Usuarios:**
- 🟡 **Gap UI #1-U1:** Búsqueda monocampo (email) → multicampo (nombre + doc_number) [Esfuerzo: 30 min]
- 🔴 **Gap migración #1-U2:** Cargo (job_title_id) incompleto en algunos perfiles [Auditar + Migrar: 2h]
- 🔴 **Gap migración #1-U3:** Proveedor (tercero_id) 0 datos migrados [Auditar + Migrar: 3h]
- 🟡 **Gap UI #1-U4:** Falta agregar filtros de columna (Cargo · Proveedor · Estado) [Esfuerzo: 1h por filtro = 3h total]

---

### 1.2 USUARIOS — Crear / Editar (Wizard 3 pasos)

**Paso 1: Datos Personales**

| Elemento | Campo Bubble | Tabla.columna Supabase | UI nueva | Dato migrado | Status | Notas |
|---|---|---|---|---|---|---|
| Email | "Parent group's User's email" | profiles.email | ✅ (input required, email validation) | ✅ | ✅ OK | En CREATE; en EDIT readonly si admin, editable si self-service |
| Password | "Parent group's User's password" (hash en BD) | auth.users.encrypted_password | ✅ (input min 6, CREATE only) | — | ✅ OK | Manejado por Auth |
| Nombre | "Parent group's User's first_name" | profiles.first_name | ✅ (input "Nombre") | ✅ (327 registros) | ✅ OK | |
| Apellido | "Parent group's User's last_name" | profiles.last_name | ✅ (input "Apellido") | ✅ (327 registros) | ✅ OK | |
| Segundo Apellido | "Parent group's User's segundo_apellido" (Bubble binding) | profile_details.second_last_name | ✅ (input "Segundo Apellido") | ⚠️ 0 registros en CISE, 0 en GRUAS | 🔴 **Gap migración** | Campo existe pero nunca poblado en Bubble |
| Nombre del Medio | "Parent group's User's middle_name" | profile_details.middle_name | ✅ (input opcional) | ⚠️ 33/327 registros | 🔴 **Gap migración** | 90% de datos faltantes |
| Tipo de Documento | "Parent group's User's id_tipo_doc's Opción de Lista" | profiles.doc_type (enum: DNI, CE, PASSPORT, etc.) | ✅ (select enum) | ✅ Asumido DNI para la mayoría | ⚠️ Parcial | Verificar si todos son correctos |
| Nro de Documento | "Parent group's User's doc_number" | profiles.doc_number | ✅ (input required, unique check cliente-side) | ✅ (327 registros, 0 duplicados) | ✅ OK | |
| Género | "Parent group's User's gender" | profiles.gender (Masculino/Femenino) | ✅ (radio/select) | ⚠️ No capturado en migración original | 🔴 **Gap migración** | DUDA-103: ¿Bubble tenía este campo? |
| Fecha de Nacimiento | "Parent group's User's birth_date" | profile_details.birth_date | ✅ (date picker, default -30 años) | ⚠️ 87/327 registros | 🔴 **Gap migración** | 73% faltantes |
| Nacionalidad | "Parent group's User's nationality" | profile_details.nationality (catalog) | ✅ (select con getPaises()) | ⚠️ 38/327 registros | 🔴 **Gap migración** | 88% faltantes |
| Rol | "Parent group's User's role" (admin_tenant/supervisor/member) | profiles.role | ✅ (select, hidden si selfService=true) | ✅ | ✅ OK | Asignado en CREATE; editable solo por admin |
| Cargo/Job Title | "Parent group's User's id_cargo's Opción de Lista" | profiles.job_title_id | ✅ (select required) | ⚠️ Algunos sin cargo | 🟡 **Gap migración** | Relacionado con Gap #1-U2 |
| **Firma Electrónica** (PASO 1 en Bubble) | "Parent group's User's id_firma's signature_url" | profile_details.signature_url | ❌ **Movido al PASO 2** (decisión de diseño aprobada) | ⚠️ 31/327 registros (CISE 30, GRUAS 1) | 🟡 **Gap UI OK** | Relocalizado; no es gap. Botón "Editar firma" con re-auth en EDIT |
| **PIN de Seguridad** (PASO 1 en Bubble) | "Parent group's User's pin" | profiles.pin | ❌ **Movido al PASO 2** (decisión de diseño aprobada) | ❌ Vacío en prod (0 registros) | 🟡 **Gap UI OK** | Relocalizado; gap migración conocida. Botón "Editar PIN" con re-auth en EDIT |

**Paso 2: Información de Contacto (nuevo orden post-diseño)**

| Elemento | Campo Bubble | Tabla.columna Supabase | UI nueva | Dato migrado | Status | Notas |
|---|---|---|---|---|---|---|
| Dirección | "Parent group's User's id_info_personal's dirección" | profiles.direccion | ✅ (textarea, sin Google Maps ✅) | ❌ 0 registros en CISE, 0 en GRUAS | 🔴 **Gap migración** | Decisión aprobada: mapa removido. Campo text solo. |
| **Mapa Google** | "Google Maps widget binding direccion" | — | ❌ **Removido** (decisión de diseño) | — | ✅ OK (omitido intencional) | Usuario confirmó remover el mapa |
| Contacto Emergencia: Nombre | "Parent group's User's id_info_personal's contact" | profiles.contacto_emergencia_nombre | ✅ (input "Nombres y apellidos familiar") | ❌ 0 registros en ambos tenants | 🔴 **Gap migración** | Nunca poblado |
| Contacto Emergencia: Parentesco | "Parentesco (select popup en Bubble)" | profiles.contacto_emergencia_parentesco | ✅ (select "Parentesco") | ❌ 0 registros | 🔴 **Gap migración** | Nunca poblado |
| Contacto Emergencia: Celular | "Parent group's User's id_info_personal's celular" | profiles.contacto_emergencia_celular | ✅ (input "Número de celular") | ❌ 0 registros | 🔴 **Gap migración** | Nunca poblado |
| **Firma Electrónica** (PASO 2 — nuevo) | "Parent group's User's signature_url" | profile_details.signature_url | ✅ **Nuevo** (upload + preview, botón "Editar firma" si EDIT) | ⚠️ 31/327 registros (9.5% coverage) | 🟡 **Gap migración** | Relocalizado del paso 1. En EDIT/VIEW: botón "Editar" con re-auth dialog (ReAuthDialog implementado en líneas 378-460 de user-profile-fields.tsx) |
| **PIN de Seguridad** (PASO 2 — nuevo) | "Parent group's User's pin" (input masked) | profiles.pin | ✅ **Nuevo** (masked input, botón "Editar PIN" si EDIT) | ❌ 0 registros (0% coverage) | 🔴 **Gap migración** | Relocalizado del paso 1. Nunca se migró. En EDIT/VIEW: botón "Editar" con re-auth dialog. |

**Paso 3: Documentación**

| Elemento | Campo Bubble | Tabla.columna Supabase | UI nueva | Dato migrado | Status | Notas |
|---|---|---|---|---|---|---|
| Documentos de Usuario (tabla embebida) | "Parent group's User_documents listfirst item's..." | user_documents join document_types | ✅ (UserDocumentsManager component) | ✅ (CISE 167, GRUAS 485 documentos) | ✅ OK | Gestión separada en paso 3 |

**Clasificación de gaps — Crear/Editar Usuarios:**
- 🟡 **Gap UI #2-U5:** Firma + PIN relocalización OK (diseño aprobado) [✅ RESOLVED]
- 🔴 **Gap migración #2-U6:** Segundo apellido nunca poblado [0 datos] [No migrar]
- 🔴 **Gap migración #2-U7:** Nombre del medio 90% faltante [Auditar + Migrar opcionalmente: 1h]
- 🔴 **Gap migración #2-U8:** Género no capturado [¿Existe en Bubble? DUDA-103]
- 🔴 **Gap migración #2-U9:** Fecha de nacimiento 73% faltante [Auditar + Migrar opcionalmente: 1h]
- 🔴 **Gap migración #2-U10:** Nacionalidad 88% faltante [Auditar + Migrar opcionalmente: 1h]
- 🔴 **Gap migración #2-U11:** Dirección 100% faltante [Auditar + Migrar: 2h]
- 🔴 **Gap migración #2-U12:** Contacto de Emergencia (3 campos) 100% faltante [Auditar + Migrar: 3h]
- 🔴 **Gap migración #2-U13:** PIN de Seguridad 100% faltante [Auditar + Migrar: 1h]
- 🔴 **Gap migración #2-U14:** Firma Electrónica 90.5% faltante (31/327) [Auditar + Migrar: 4h]

---

## 2. TIPOS DE DOCUMENTO

**Path Bubble:** CONFIGURACION → Tipos de Documento  
**Path reportaweb3:** `/settings/document-types` · Componentes: `app/\(dashboard\)/settings/document-types/page.tsx` · `components/settings/document-types/document-types-table.tsx`  
**Datos BD:** 48 tipos de documento (CISE 14, GRUAS 31)

### 2.1 TIPOS DE DOCUMENTO — Lista

| Elemento | Campo Bubble | Tabla.columna Supabase | UI nueva | Dato migrado | Status | Notas |
|---|---|---|---|---|---|---|
| Búsqueda | "Buscar tipo de documento ..." | document_types.name | ✅ (search input) | ✅ | ✅ OK | |
| Columna: Código | "Parent group's document_type's code" | document_types.code | ✅ ("Código") | ✅ (48 registros, todos con code) | ✅ OK | Usado en reportes |
| Columna: Nombre de Documento | "Parent group's document_type's nombre_documento" | document_types.name | ✅ ("Nombre") | ✅ (48 registros) | ✅ OK | |
| Columna: ¿Vence? | "Group Cell Body's document_type's vence? is no:formatted as text" (booleano) | document_types.vence (boolean) | ❌ NO visible | ✅ Columna existe | 🟡 **Gap UI** | Agregar como filtro columna (booleano → toggle) |
| Columna: Alerta (días antes vencimiento) | "Group Cell Body's document_type's pes's vence? is no:formatted as text" | document_types.alerta_dias (integer) | ❌ NO visible | ⚠️ Columna existe pero 0 valores en prod | 🟡 **Gap UI + Migración** | DUDA-201: ¿Se usa este campo en Bubble? |
| Columna: ¿Seguro? | "Group Cell Body's document_type's seguro? is no:formatted as text" (booleano) | document_types.seguro (boolean) | ❌ NO visible | ✅ Poblado (algunos true/false) | 🟡 **Gap UI** | Agregar como filtro columna |
| Columna: Individual o Dual | "Group Cell Body's document_type's individual? is no:formatted as text" (booleano) | document_types.individual (boolean) | ❌ NO visible | ✅ Poblado (algunos true/false) | 🟡 **Gap UI** | Agregar como filtro columna (Individual/Dual/Ambos) |
| Menú de Fila | Acciones: Editar · Eliminar (si no tiene documentos asociados) | — | ✅ (DropdownMenu) | — | ✅ OK | |

**Clasificación de gaps — Lista Tipos de Documento:**
- 🟡 **Gap UI #3-U15:** Agregar columnas: Vence · Seguro · Individual [Esfuerzo: 1h por columna = 3h total]
- 🟡 **Gap UI #3-U16:** Agregar filtros de columna: Vence · Seguro · Individual [Esfuerzo: 1h por filtro = 3h total]
- 🟡 **Gap UI #3-U17:** ¿Mostrar columna Alerta (días)? [DUDA-201: verificar si se usa]

---

### 2.2 TIPOS DE DOCUMENTO — Crear / Editar

| Elemento | Campo Bubble | Tabla.columna Supabase | UI nueva | Dato migrado | Status | Notas |
|---|---|---|---|---|---|---|
| Nombre del Documento | "Parent group's document_type's nombre_documento" | document_types.name | ✅ (input required) | ✅ | ✅ OK | |
| Código | "Parent group's document_type's code" | document_types.code | ✅ (input) | ✅ | ✅ OK | |
| ¿Vence? | "document_type's vence?" | document_types.vence | ✅ (toggle/checkbox) | ✅ | ✅ OK | |
| Alerta (días antes) | "document_type's alerta_dias" | document_types.alerta_dias | ✅ (number input) | ⚠️ 0 valores | 🟡 **Gap migración** | DUDA-201: confirmar si se usa |
| ¿Seguro? | "document_type's seguro?" | document_types.seguro | ✅ (toggle/checkbox) | ✅ | ✅ OK | |
| Individual o Dual | "document_type's individual?" | document_types.individual | ✅ (toggle/checkbox) | ✅ | ✅ OK | |
| Categoría | — (no visible en Bubble RG pero existe en schema) | document_types.categoria | ❓ DUDA-202 | ⚠️ Columna existe pero no se sabe si se usa en Bubble | ❓ DUDA | Preguntar si existe en Bubble |

---

## 3. DOCUMENTOS DE USUARIO

**Path Bubble:** OPERACIONES → Usuarios → Documentación  
**Path reportaweb3:** `/users/documents` · Componentes: `components/users/documents/global-documents-table.tsx` · `components/users/documents/upload-document-dialog.tsx`  
**Datos BD:** 652 documentos (CISE 167, GRUAS 485)

### 3.1 DOCUMENTOS DE USUARIO — Lista

| Elemento | Campo Bubble | Tabla.columna Supabase | UI nueva | Dato migrado | Status | Notas |
|---|---|---|---|---|---|---|
| Búsqueda | "Buscar usuario ..." | user_documents → profiles.first_name, profiles.last_name | ✅ (input, BUT: busca solo nombre del usuario) | ✅ | ✅ OK (multicampo por usuario: nombre completo + doc_number solicitado) | Implementar según estándar aprobado |
| Filtro: Tipo de Documento | "Seleccionar tipo documento ..." (dropdown) | document_types.id | ✅ (Select dropdown) | ✅ | ✅ OK | |
| Columna: Usuario | "Parent group's User_documents's user_id listfirst item's nombre_completo" | user_documents.user_id → profiles.first_name + profiles.last_name | ✅ ("Usuario") | ✅ (652 docs con usuario válido) | ✅ OK | |
| Columna: Proveedor | "Parent group's User_documents's id_proveedor's razón_social" | user_documents.proveedor_id → terceros.razon_social (¿FK existe?) | ❌ NO visible | ⚠️ Columna existe pero relación a terceros DUDA-301 | 🟡 **Gap UI + DUDA** | DUDA-301: ¿user_documents.proveedor_id → terceros? |
| Columna: Tipo de Documento | "Parent group's User_documents's document_type_id's nombre_documento" | user_documents.document_type_id → document_types.name | ✅ ("Documento") | ✅ (652 documentos con tipo válido) | ✅ OK | |
| Columna: Válido Desde | "Parent group's User_documents's valid_from:formatted as mar 14 julio, 2026" | user_documents.valid_from (date) | ✅ ("Válido Desde") | ✅ (652 registros con fecha) | ✅ OK | |
| Columna: Estado | "Group Cell Body's" (booleano is_active) | user_documents.is_active | ✅ (Badge rojo/verde) | ✅ (Estado mostrado) | ✅ OK | |
| Columna: Vence (calendar) | "Parent group's User_documents's valid_until:formatted as martes, julio 14, 2026" | user_documents.valid_until (date) | ✅ ("Vence") | ✅ (652 registros) | ✅ OK | |
| Columna: Archivo | "Link del archivo" (clickable descarga) | user_documents.file_url → Storage URL | ✅ (Link "Descargar") | ✅ (652 documentos con archivos) | ✅ OK | Manejo de presigned URLs implementado |
| Menú de Fila | Acciones: Ver · Editar · Descargar · Archivar/Deshabilitar · Eliminar | — | ✅ (DropdownMenu con todas las acciones) | — | ✅ OK | |
| Exportar a Excel | Descarga de tabla con columnas relevantes | — | ✅ (Botón "Descargar") | — | ✅ OK | Usa XLSX |
| Descarga Masiva (Bulk) | Descargar múltiples documentos seleccionados como ZIP | — | ✅ (Con checkboxes) | — | ✅ OK | |

**Clasificación de gaps — Lista Documentos:**
- 🟡 **Gap UI #4-U18:** Búsqueda multicampo usuario (nombre completo + doc_number) [Esfuerzo: 30 min] (mismo patrón que #1-U1)
- 🟡 **Gap UI #4-U19:** Agregar columna Proveedor [DUDA-301: confirmar FK y datos]
- 🟡 **Gap UI #4-U20:** Agregar filtros de columna (Tipo documento · Proveedor · Estado) [Esfuerzo: 1h por filtro]

---

### 3.2 DOCUMENTOS DE USUARIO — Crear / Subir

| Elemento | Campo Bubble | Tabla.columna Supabase | UI nueva | Dato migrado | Status | Notas |
|---|---|---|---|---|---|---|
| Usuario | "Parent group's User_documents's user_id" | user_documents.user_id (FK profiles) | ✅ (select/autocomplete required) | ✅ | ✅ OK | Preseleccionado si viene desde página de usuario |
| Tipo de Documento | "Parent group's User_documents's document_type_id" | user_documents.document_type_id (FK document_types) | ✅ (select required) | ✅ | ✅ OK | |
| Archivo | "File upload input" | user_documents.file_url (Storage Supabase) | ✅ (drag-drop or input) | ✅ (652 archivos en Storage) | ✅ OK | |
| Válido Desde | "Parent group's User_documents's valid_from" | user_documents.valid_from (date) | ✅ (date picker required) | ✅ | ✅ OK | |
| Válido Hasta | "Parent group's User_documents's valid_until" | user_documents.valid_until (date) | ✅ (date picker required) | ✅ | ✅ OK | |
| Proveedor | "Parent group's User_documents's id_proveedor" | user_documents.proveedor_id (FK terceros?) | ❓ DUDA-301 | ⚠️ Columna existe pero relación DUDA | ❓ DUDA | DUDA-301: ¿Mostrar en formulario si existe relación con terceros? |

---

## DUDAs Abiertas — TODAS RESPONDIDAS (2026-07-14)

| ID | Pregunta | Respuesta | Impacto en gaps |
|---|---|---|---|
| **DUDA-101** ✅ | ¿Todos los usuarios tenían cargo? | Solo 1 usuario de CISE no tiene cargo (102/103 OK) | Gap migración #1-U2 → **🟢 RESUELTO** (auditar 1 registro) |
| **DUDA-102** ✅ | ¿Proveedor (tercero_id) fue migrado? | Sí: GRUAS 142 registros, CISE 67 registros (209 total con proveedor) | Gap migración #1-U3 → **🟡 ESCALADO** (columna existe con datos, solo falta mostrar en UI) |
| **DUDA-103** ✅ | ¿Campo "Género" existe en Bubble? | Sí, está en `Usuario2_info_personal` (FK id_usuario). 133 usuarios no tienen género (~40% faltante) | Gap migración #2-U8 → **🟡 ESCALADO** (columna existe, 40% datos; migrar lo disponible) |
| **DUDA-201** ✅ | ¿"Alerta (días)" se usa en Bubble? | Sí, **CRÍTICO:** columna que define si se muestra alerta "POR VENCER". 31 registros sin valor (documentos sin vencimiento probable). | Gap UI #3-U17 → **🔴 ESCALADO A CRÍTICO** (mostrar columna en lista tipos de documento) |
| **DUDA-202** ✅ | ¿"Categoría" existe en Bubble? | Sí, se muestra al crear tipo documento. Valores: Seguro · Doc. con vencimiento · Doc. Sin Vencimiento. Solo 14 registros sin categoría. | Gap UI → **🟡 MEDIA** (agregar columna en lista tipos de documento) |
| **DUDA-301** ✅ | ¿"Proveedor" en documentos existe? | No: "Solo aplica si doc es de usuario que trabaja para proveedor. NO hay datos en Bubble LIVE." | Gap UI #4-U19 → **⚪ OMITIDO INTENCIONAL** (no mostrar columna proveedor en documentos) |

---

## Tickets de Implementación (Prioridad Actualizada Post-DUDAs)

### 🔴 CRÍTICO (Bloquean GO LIVE)

1. **TK-U1:** Migración — Direcciones de usuarios (Gap #2-U11)
   - Esfuerzo: 2h migración
   - Estado: 0% de usuarios con dirección. Completamente faltante en prod.

2. **TK-U2:** Migración — Contacto de Emergencia (Gap #2-U12)
   - Esfuerzo: 3h migración
   - Estado: 3 campos 100% vacíos (nombre, parentesco, celular).

3. **TK-U3:** Mostrar columna Proveedor en Usuarios (Gap #1-U3 → UI)
   - Esfuerzo: 1h
   - Estado: Datos YA MIGRADOS (GRUAS 142, CISE 67). Solo falta mostrar.

4. **TK-U4:** Mostrar columna ALERTA (DÍAS ANTES) en Tipos de Documento (DUDA-201 → UI)
   - Esfuerzo: 1h
   - Estado: Campo CRÍTICO para mostrar alerta "POR VENCER". 31 registros sin valor en Bubble (sin vencimiento probable). Solo falta mostrar en lista.

### 🟡 MEDIA (Mejoran UX, resuelven gaps de UI aprobados)

5. **TK-U5:** Búsqueda multicampo en Usuarios (Gap #1-U1) [Esfuerzo: 30 min]
   - Búsqueda: nombre completo + nº documento (patrón en user-documents-query.ts)

6. **TK-U6:** Filtros de columna en Usuarios (Gap #1-U4) [Esfuerzo: 3h]
   - Filtros: Cargo (solo 1 faltante) · Proveedor (209 datos) · Estado

7. **TK-U7:** Migración — Cargo (job_title_id) [Esfuerzo: 1h]
   - Estado: Solo 1 usuario de CISE sin cargo. Verificar y asignar.

8. **TK-U8:** Migración — Género (profile_details.gender) [Esfuerzo: 2h auditoría + 1h migración]
   - Estado: Campo en Usuario2_info_personal. ~40% datos faltantes (133/327).
   - Acción: Migrar datos disponibles desde Bubble.

9. **TK-U9:** Mostrar columnas adicionales en Tipos de Documento (Gap #3-U15) [Esfuerzo: 3h]
   - Columnas: Vence · Seguro · Individual · Categoría (datos YA POBLADOS en BD)

10. **TK-U10:** Filtros de columna en Tipos de Documento (Gap #3-U16) [Esfuerzo: 3h]
    - Filtros: Vence · Seguro · Individual · Categoría

11. **TK-U11:** Búsqueda multicampo en Documentos (Gap #4-U18) [Esfuerzo: 30 min]
    - Búsqueda: nombre de la persona

12. **TK-U12:** Filtros de columna en Documentos (Gap #4-U20) [Esfuerzo: 3h]
    - Filtros: Tipo documento · Estado (Proveedor: OMITIDO INTENCIONAL per DUDA-301)

### 🟢 BAJA (Migraciones opcionales, datos muy incompletos)

13. **TK-U13:** Migración — Nombre del medio (Gap #2-U7) [Esfuerzo: 1h, 90% faltante]
14. **TK-U14:** Migración — Fecha de nacimiento (Gap #2-U9) [Esfuerzo: 1h, 73% faltante]
15. **TK-U15:** Migración — Nacionalidad (Gap #2-U10) [Esfuerzo: 1h, 88% faltante]
16. **TK-U16:** Migración — PIN de Seguridad (Gap #2-U13) [Esfuerzo: 1h, 100% faltante]
17. **TK-U17:** Migración — Firma Electrónica (Gap #2-U14) [Esfuerzo: 4h, 90.5% faltante pero importante]

### ⚪ OMITIDO INTENCIONAL

- **TK-OMIT-01:** Columna Proveedor en Documentos de Usuario (DUDA-301)
  - Razón: "Solo aplica si documentación es de usuario que trabaja para proveedor. No hay datos con proveedor en Bubble LIVE."
  - No mostrar esta columna en lista ni formulario.

---

## Próximos Pasos

1. **Retro del piloto (15 min):**
   - ¿Matriz clara y útil?
   - ¿Plantilla de datos-campos-status funciona para otros módulos?
   - ¿DUDAs respondibles rápidamente?

2. **Responder DUDAs (DUDA-101 a DUDA-301)**
   - Contacto con stakeholders de Bubble si necesario
   - Auditoría adicional de datos si gaps son ambiguos

3. **Ejecutar Tickets CRÍTICO (TK-U1 a TK-U3)**
   - Bloquea la siguiente auditoría de módulos

4. **Módulo 2: Decidir en retro**
   - Propuesta: Catálogos → Terceros → Maquinaria → Cotizaciones
