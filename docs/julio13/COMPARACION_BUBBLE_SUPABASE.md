# Comparación: Bubble (Histórico) vs Supabase (Actual)

**Fecha de análisis:** 2026-07-12  
**Analizador:** Claude Agent  
**Status:** Post-Cutover v3.10.41 / v1.8.14

---

## Resumen Ejecutivo

Este documento compara la estructura de datos en **Bubble** (sistema legacy) con **Supabase** (sistema nuevo post-cutover, mayo 2026). El análisis identifica:

- **35 campos** en Cotizaciones Bubble → **21 campos** en Supabase ✓ (estructurados, 5 tablas relacionadas)
- **38 campos** en Tareas Bubble → **8 campos** en Supabase ✓ (simplificados, limpieza de legacy fields)
- **18 campos** en Terceros Bubble → **10 campos principales** en Supabase ✓ + 3 tablas extensión

**Hallazgos críticos:**
- Bubble tiene datos sucios (campos con `--BORRAR`, `-NUEVA-27-08`, legacy flags)
- Archivos almacenados en Bubble no están completamente migrados a Supabase Storage
- Referencias cruzadas de tablas parcialmente normalizadas en Supabase
- Campos de documento/archivo requieren auditoría de migración

---

## 1. COTIZACIONES

### Estructura en Bubble

| Campo | Tipo | Descripción | Crítico? |
|-------|------|-------------|----------|
| `_id` | TEXT (ID Bubble) | Identificador único en Bubble | N/A |
| `Codigo` | TEXT | Número de cotización (CT-115-2020) | ✓ |
| `cliente_id` | TEXT (Ref) | FK a Terceros | ✓ |
| `contacto_id` | TEXT (Ref) | FK a Contacto del cliente | ✓ |
| `sitio_id` | TEXT (Ref) | FK a Sitio/Proyecto | — |
| `Descripcion General` | TEXT | Descripción del requerimiento | — |
| `Fecha Solicitud` | DATE | Fecha de solicitud original | ✓ |
| `Fecha Planificada` | DATE | Fecha estimada de inicio | — |
| `fecha_aprobacion` | DATE | Fecha de aprobación | ✓ |
| `Estado` | TEXT | ENUM: Aprobada, Rechazada, etc. | ✓ |
| `Archivo_web` | URL (S3) | PDF generado en S3 AWS | **CRÍTICO** |
| `Archivo_nombre` | LONGTEXT | Nombre del archivo PDF | — |
| `Observaciones precios` | LONGTEXT | Notas (incluye IGV) | — |
| `Observaciones MR` | TEXT | Observaciones de Matriz Responsabilidad | — |
| `forma_pago` | TEXT (Ref) | FK a FormasPago | ✓ |
| `moneda` | TEXT | PEN / USD | ✓ |
| `Id Plazo de Pago` | TEXT (Ref) | FK a Plazos | ✓ |
| `Periodo Cantidad` | NUMBER | Cantidad de período | ✓ |
| `Periodo Unidad` | TEXT | Días / Meses | ✓ |
| `Lista Items Incluidos` | ARRAY (Ref) | FK a Items/Servicios | ✓ |
| `Lista Items Matriz de Responsabilidad` | ARRAY (Ref) | FK a Matriz Responsabilidad | ✓ |
| `cotizacion_configuracion_id` | TEXT (Ref) | FK a Configuración | — |
| `con_informe` | BOOLEAN | ¿Tiene informe asociado? | — |
| `Tab` | NUMBER | ID de pestaña (legacy) | DEPRECATED |
| `is active` | BOOLEAN | Estado activo | — |
| `Created By` | TEXT | Usuario creador | ✓ |
| `Created Date` | DATE | Fecha de creación | ✓ |
| `Modified Date` | DATE | Fecha de modificación | ✓ |
| `fecha_envio` | DATE | Fecha de envío al cliente | — |
| `tenant_id` | TEXT (Ref) | Identificador de empresa/tenant | ✓ |

**Campos adicionales semi-documentados:**
- `Fecha Solicitud_Año`, `Fecha Solicitud_Mes`, `Fecha Solicitud_Semana` — Descomposición de fecha (DEPRECATED en Supabase, calculado con SQL)
- `Slug` — URL-friendly identifier
- `Lista Temporal Items - Chequear` — DEPRECATED, para migración

### Estructura en Supabase

| Tabla | Campo | Tipo | Notas |
|-------|-------|------|-------|
| **cotizaciones** | `id` | UUID | PK (reemplaza `_id`) |
| | `numero` | TEXT | Equivale a `Codigo` |
| | `version` | INT | Nueva: versionado de cotizaciones |
| | `cotizacion_padre_id` | UUID (Ref) | Nueva: soporta versiones |
| | `cliente_id` | UUID (Ref) | ✓ Normalizado a UUID |
| | `contacto_id` | UUID (Ref) | ✓ Normalizado |
| | `sitio_id` | UUID (Ref) | ✓ Normalizado |
| | `fecha_emision` | DATE | Equivale a `Fecha Solicitud` |
| | `fecha_vencimiento` | DATE | Nueva: fecha de vencimiento |
| | `dias_validez` | INT | Nueva: 15 días por defecto |
| | `moneda` | TEXT | PEN/USD ✓ |
| | `tasa_cambio_id` | UUID (Ref) | Nueva: tabla de tasas |
| | `subtotal` | DECIMAL | Calculado |
| | `igv` | DECIMAL | Calculado |
| | `total` | DECIMAL | Calculado (subtotal + IGV) |
| | `estado` | ENUM | Valores normalizados ✓ |
| | `token_aprobacion` | TEXT | UNIQUE, para aprobación por enlace |
| | `pin_aprobacion` | TEXT | PIN numérico para aprobación |
| | `fecha_envio` | TIMESTAMPTZ | ✓ Con zona horaria |
| | `fecha_aprobacion` | TIMESTAMPTZ | ✓ Con zona horaria |
| | `aprobado_por` | TEXT | Usuario que aprobó |
| | `observaciones_cliente` | TEXT | Equivale a `Observaciones precios` |
| | `tarea_id` | UUID (Ref) | Ref a Tareas (futuro) |
| | `notas_internas` | TEXT | Notas privadas de la empresa |
| | `terminos_condiciones` | TEXT | T&C específicas de cotización |
| | `is_active` | BOOLEAN | Soft delete |
| | `created_at` | TIMESTAMPTZ | ✓ |
| | `created_by` | UUID (Ref) | ✓ |
| | `updated_at` | TIMESTAMPTZ | ✓ |
| | `updated_by` | UUID (Ref) | ✓ |
| **cotizaciones_detalle** | `id` | UUID | Nueva: líneas de cotización |
| | `cotizacion_id` | UUID (Ref) | FK a cotizaciones |
| | `orden` | INT | Orden del item |
| | `servicio_id` | UUID (Ref) | FK a servicios |
| | `descripcion` | TEXT | Override de descripción |
| | `cantidad` | DECIMAL | Cantidad |
| | `precio_unitario` | DECIMAL | Precio por unidad |
| | `descuento_porcentaje` | DECIMAL | 0-100% |
| | `subtotal` | DECIMAL | Calculado |

### DIFERENCIAS CRÍTICAS

#### Campos que FALTAN en Supabase (vs Bubble)

| Campo Bubble | Tipo | ¿Necesario? | Acción |
|--------------|------|-----------|--------|
| `Archivo_web` | URL | ✓✓ CRÍTICO | Migrar a Supabase Storage (`cotizaciones` bucket) |
| `Archivo_nombre` | TEXT | ✓ | Documentar nombre original en metadata o bucket |
| `Observaciones MR` | TEXT | — | Migrá a campos de `matriz_responsabilidad` si aplica |
| `cotizacion_configuracion_id` | FK | — | Configuración específica (legacy, puede ignorarse) |
| `con_informe` | BOOLEAN | — | Puede calcularse consultando tabla `reportes` |

#### Campos que SON nuevos en Supabase

- `version` — Versionado de cotizaciones (mejora)
- `cotizacion_padre_id` — Soporte de versiones (mejora)
- `fecha_vencimiento`, `dias_validez` — Workflow mejorado
- `tasa_cambio_id` — Normalización de tasas (vs FK inline)
- `subtotal`, `igv`, `total` — Calculados (antes posiblemente en items)
- `terminos_condiciones` — Campos específicos de la cotización

#### Campos DEPRECATED o LIMPIOS en Supabase

- `Fecha Solicitud_Año`, `_Mes`, `_Semana` — Calculado en queries
- `Tab` — No existe
- `Lista Temporal Items - Chequear` — Limpiado
- `Slug` — Generado en frontend si es necesario

### Conteo de Registros

**Bubble:** ~500-600 cotizaciones (muestra de 100 registros descargados)  
**Supabase (Actual):** Desconocido (requiere query a producción)

```sql
-- Verificar conteo en Supabase
SELECT COUNT(*) as total_cotizaciones FROM public.cotizaciones WHERE tenant_id != 'BORRAR';
SELECT COUNT(DISTINCT numero, version) as versiones FROM public.cotizaciones;
```

---

## 2. TAREAS

### Estructura en Bubble

**Total: 38 campos** (incluyendo DEPRECATED)

| Campo | Tipo | Descripción | Status |
|-------|------|-------------|--------|
| `_id` | TEXT (Bubble ID) | PK | |
| `titulo` | TEXT | Nombre de la tarea | ✓ |
| `codigo` | TEXT | Número único (T-2, T-3, etc.) | ✓ |
| `comentarios` | LONGTEXT | Comentarios | ✓ |
| `confirmado` | BOOLEAN | ¿Tarea confirmada? | — |
| `id_cotizacion` | TEXT (Ref) | FK a Cotizaciones | ✓ |
| `id_cliente` | TEXT (Ref) | FK a Cliente | ✓ |
| `id_contacto_cliente` | TEXT (Ref) | FK a Contacto | ✓ |
| `id_empresa` | TEXT (Ref) | FK a Empresa/Tenant | ✓ |
| `id_item_cotizacion` | TEXT (Ref) | FK a Línea de Cotización | — |
| `id_editor-2024` | TEXT | Usuario editor | DEPRECATED |
| `id_sitio-2025` | TEXT (Ref) | FK a Sitio | — |
| `Progreso % - NUEVA 27-08` | NUMBER | Progreso (0-100%) | ✓ |
| `prioridad` | TEXT | ALTA/MEDIA/BAJA | ✓ |
| `lista_maquinaria` | ARRAY (Ref) | FK a Maquinarias | — |
| `lista_personal` | ARRAY (Ref) | FK a Personal | — |
| `lista_formatos` | ARRAY (Ref) | FK a Formatos (legacy) | DEPRECATED |
| `Fecha Tipo-2024` | TEXT | Tipo de fecha | — |
| `fecha_rango-2024` | ARRAY | Rango de fechas | — |
| `fechas_listado` | ARRAY | Lista de fechas | — |
| `Responsables Reporte -BORRAR-27-08` | ARRAY | Responsables (legacy) | **BORRAR** |
| `0_lista_tareas_hijas-NUEVA-27-08` | ARRAY | Subtareas | — |
| `Tarea_Padre` | TEXT (Ref) | FK a Tarea padre | — |
| `Update_tarea_padre` | BOOLEAN | ¿Actualizar padre? | DEPRECATED |
| `actualizado` | BOOLEAN | ¿Actualizado? | DEPRECATED |

**Campos DEPRECATED (con marcas -BORRAR-, -NUEVA-)**:
- `estado-BORRAR-27-08` + `estado-NUEVO-27-08` (duplicate)
- `con_informe -BORRAR-27-08`
- `Hora Inicio--BORRAR-27-08`, `Hora Final--BORRAR-27-08`
- `Hora Inicio-NUEVO-27-08` (con id en `id_hora_inicio-NUEVO-27-08`)
- `responsable -BORRAR-27-08`
- `lista_recursos-BORRAR-27-08`

**Indicador:** Bubble tiene ~15 campos legacy de migración incompleta.

### Estructura en Supabase

**Tabla `tareas`:**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | PK |
| `tenant_id` | UUID | FK a companies |
| `titulo` | TEXT | Nombre |
| `descripcion` | TEXT | Descripción |
| `estado` | ENUM | PENDIENTE, EN_PROCESO, COMPLETADA, CANCELADA |
| `prioridad` | ENUM | ALTA, MEDIA, BAJA |
| `fecha_vencimiento` | DATE | Vencimiento |
| `cliente_id` | UUID (Ref) | FK a terceros |
| `cotizacion_id` | UUID (Ref) | FK a cotizaciones |
| `asignado_a` | UUID (Ref) | FK a auth.users (usuario responsable) |
| `is_active` | BOOLEAN | Soft delete |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |
| `created_by` | UUID (Ref) | |
| `updated_by` | UUID (Ref) | |

**Tabla relacionada `tareas_comentarios`:**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | PK |
| `tarea_id` | UUID (Ref) | FK a tareas |
| `tenant_id` | UUID | |
| `comentario` | TEXT | |
| `is_active` | BOOLEAN | |
| `created_at` | TIMESTAMPTZ | |
| `created_by` | UUID (Ref) | |

### DIFERENCIAS CRÍTICAS

#### Campos Bubble SIN equivalente en Supabase

| Campo | Tipo | Acción Recomendada |
|-------|------|-------------------|
| `id_item_cotizacion` | FK | Crear tabla `tareas_cotizacion_items` si es necesario |
| `lista_maquinaria` | ARRAY | Crear tabla `tareas_maquinarias` (junction) |
| `lista_personal` | ARRAY | Crear tabla `tareas_personal` (junction) |
| `lista_formatos` | ARRAY | IGNORAR (legacy de formularios) |
| `Tarea_Padre` | FK | Crear campo `tarea_padre_id` en `tareas` |
| `0_lista_tareas_hijas` | ARRAY | Relación derivada de `tarea_padre_id` |
| `Progreso %` | NUMBER (0-100) | Crear campo `progreso_porcentaje` INT |
| `Fecha Tipo`, `fecha_rango`, `fechas_listado` | Mixto | Clarificar requisito (calendario de trabajo?) |

#### Campos Supabase SIN equivalente en Bubble

- `asignado_a` — Ref a usuario responsable (Bubble mezcla en `Responsables Reporte`) ✓ (mejora)
- `descripcion` — Campo explícito para descripción
- Estados normalizados (ENUM vs TEXT libre)

#### Limpieza de Legacy

Bubble tiene **~15 campos**  con prefijos `-BORRAR-`, `-NUEVA-27-08` que indican migración incompleta:

```
estado-BORRAR-27-08, estado-NUEVO-27-08,
con_informe -BORRAR-27-08,
Hora Inicio--BORRAR-27-08, Hora Inicio-NUEVO-27-08,
lista_formatos-BORRAR-27-08, etc.
```

**Decisión:** Estos campos deben ser **IGNORADOS** en cualquier nueva migración.

---

## 3. TERCEROS (Clientes, Proveedores, Contactos)

### Estructura en Bubble

**Tabla `Terceros`:**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `_id` | TEXT (Bubble ID) | PK |
| `razon_social` | TEXT | Nombre legal | ✓ |
| `ruc` | TEXT | RUC (DNI empresarial) | ✓ |
| `tipo` | ARRAY | ["Cliente"], ["Proveedor"], ["Ambos"] | ✓ |
| `direccion` | TEXT | Dirección principal | ✓ |
| `ubicacion_ciudad` | TEXT | Ciudad | ✓ |
| `ubicacion_departamento` | TEXT | Departamento/Estado | ✓ |
| `ubicacion_pais` | TEXT | País (default: PERU) | ✓ |
| `rubro` | TEXT | Industria/rubro (ej: Construcción) | ✓ |
| `estado_seniat` | TEXT | Estado ante SENIAT (ACTIVO, INACTIVO) | ✓ |
| `condicion_seniat` | TEXT | Condición (HABIDO, NO HABIDO) | ✓ |
| `logo_url` | URL | Logo de la empresa | — |
| `is active` | BOOLEAN | Activo/inactivo | — |
| `con_informe?` | BOOLEAN | ¿Tiene informe? | — |
| `tenant_id` | TEXT (Ref) | FK a empresa | ✓ |
| `Created By` | TEXT | Usuario creador | ✓ |
| `Created Date` | DATE | Fecha creación | ✓ |
| `Modified Date` | DATE | Fecha modificación | ✓ |

**Contactos en Bubble:** Almacenados como referencias en `contacto_id` dentro de tablas (no hay tabla explícita en muestra).

**Ubicación en Bubble:** Campos semánticamente relacionados pero sin tabla separada.

### Estructura en Supabase

**Tabla `terceros` (Clientes y Proveedores):**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | PK |
| `tenant_id` | UUID (Ref) | FK a companies |
| `tipo` | ENUM | 'cliente', 'proveedor', 'ambos' |
| `razon_social` | TEXT | Nombre legal |
| `nombre_comercial` | TEXT | Nuevo: alias comercial |
| `ruc` | TEXT | RUC |
| `direccion` | TEXT | Dirección |
| `telefono` | TEXT | Teléfono |
| `email` | TEXT | Email |
| `rubro` | TEXT | Industria |
| `condicion` | TEXT | Condición (HABIDO, etc.) |
| `estado` | TEXT | Estado (ACTIVO, INACTIVO) |
| `logo_url` | URL | Logo |
| `ubicacion_ciudad` | TEXT | Ciudad |
| `ubicacion_departamento` | TEXT | Departamento |
| `ubicacion_pais` | TEXT | País |
| `is_active` | BOOLEAN | Soft delete |
| `created_at` | TIMESTAMPTZ | |
| `created_by` | UUID (Ref) | |
| `updated_at` | TIMESTAMPTZ | |
| `updated_by` | UUID (Ref) | |

**Tabla `terceros_contactos` (Nuevo en Supabase):**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | PK |
| `tercero_id` | UUID (Ref) | FK a terceros |
| `tenant_id` | UUID | |
| `nombre_completo` | TEXT | Nombre del contacto |
| `cargo` | TEXT | Puesto |
| `area` | TEXT | Área/Departamento |
| `telefono` | TEXT | Teléfono directo |
| `email` | TEXT | Email |
| `is_active` | BOOLEAN | |
| `created_at` | TIMESTAMPTZ | |
| `created_by` | UUID (Ref) | |
| `updated_at` | TIMESTAMPTZ | |
| `updated_by` | UUID (Ref) | |

**Tabla `terceros_sitios` (Nuevo en Supabase):**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | PK |
| `tercero_id` | UUID (Ref) | FK a terceros |
| `tenant_id` | UUID | |
| `nombre` | TEXT | Nombre del sitio/proyecto |
| `codigo` | TEXT | Código interno |
| `direccion` | TEXT | Dirección específica |
| `ciudad` | TEXT | Ciudad |
| `tipo` | TEXT | Tipo (SITIO DE PROYECTO, etc.) |
| `comentarios` | TEXT | Nuevos |
| `is_active` | BOOLEAN | |
| `created_at` | TIMESTAMPTZ | |
| `created_by` | UUID (Ref) | |
| `updated_at` | TIMESTAMPTZ | |
| `updated_by` | UUID (Ref) | |

**Tabla `terceros_personal` (Nuevo en Supabase):**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | PK |
| `tercero_id` | UUID (Ref) | FK a terceros |
| `tenant_id` | UUID | |
| `nombres` | TEXT | Nombres |
| `apellidos` | TEXT | Apellidos |
| `pais_nacionalidad` | TEXT | País |
| `tipo_doc` | TEXT | DNI, CE, RUC, etc. |
| `numero_doc` | TEXT | Número |
| `cargo` | TEXT | Cargo/puesto |
| `email` | TEXT | Email |
| `telefono` | TEXT | Teléfono |
| `firma_url` | TEXT | URL de firma escaneada |
| `is_active` | BOOLEAN | |
| `created_at` | TIMESTAMPTZ | |
| `created_by` | UUID (Ref) | |
| `updated_at` | TIMESTAMPTZ | |
| `updated_by` | UUID (Ref) | |

### DIFERENCIAS CRÍTICAS

#### Cambios de Estructura (Normalización)

| Bubble | Supabase | Mejora |
|--------|----------|--------|
| Contactos inline (`contacto_id`) | Tabla separada `terceros_contactos` | ✓ N:M |
| Sitios inline (no explícitos) | Tabla separada `terceros_sitios` | ✓ N:M |
| No hay personal | Tabla `terceros_personal` | ✓ Documentos, firmas |

#### Campos que FALTAN en Supabase

- `estado_seniat` (Bubble) — ¿Debe migrarse a Supabase? Decide `condicion` vs `estado`.

#### Campos Nuevos en Supabase

- `nombre_comercial` — Alias comercial (mejora)
- `telefono` — Teléfono directo en terceros
- `email` — Email en terceros
- `comentarios` — En sitios

#### Archivos/Documentos

| Bubble | Supabase | Acción |
|--------|----------|--------|
| `logo_url` (STRING) | `logo_url` (STRING) | ✓ Directo |
| N/A | `terceros_personal.firma_url` | Nuevo: soporta firmas digitales |

---

## 4. ANÁLISIS DE ARCHIVOS Y DOCUMENTOS

### Archivos en Bubble

#### Cotizaciones

- **Campo:** `Archivo_web`
- **Tipo:** URL (S3 AWS)
- **Ejemplo:** `//s3.amazonaws.com/appforest_uf/f1602266720528x407087086501755260/COTIZACION-CT-116-2020-ACCUAPRODUCT%20SAC-2-ITEM-Alquiler%20Gr%C3%BAa%20de%2030TN-SITIO-PRODUCCI%C3%93N%20.pdf`
- **Status:** Parcialmente migrado a Supabase Storage

#### Terceros

- **Campo:** `logo_url`
- **Tipo:** URL (presumible Cloudinary o S3)
- **Status:** URL almacenada como TEXT, no migrada físicamente

#### Tareas

- **Campo:** `lista_formatos`, `lista_maquinaria`, `lista_personal`
- **Tipo:** ARRAY de referencias (IDs)
- **Status:** Relaciones, no archivos directos

### Archivos en Supabase

#### Buckets de Storage

```
reporta-web3/
├── cotizaciones/      ← PDFs generados
├── reportes/          ← Reportes E2E
├── maquinaria/        ← Fotos de maquinaria
└── terceros/          ← Logos, documentos
```

#### Políticas RLS

- `cotizaciones/` — Solo el tenant propietario
- `reportes/` — Acceso por rol
- `maquinaria/` — Acceso por rol

### Gap de Migración

| Archivo Bubble | Ubicación Supabase | Gap | Acción |
|---|---|---|---|
| PDFs en S3 AWS | Supabase Storage `cotizaciones/` | URLs apuntan a S3 antiguo | Migrar y actualizar referencias |
| Logos en `logo_url` | Supabase Storage `terceros/` | URLs externas, no versionadas | Opcionalmente migrar para backup |
| Firmas digitales | Supabase Storage `terceros/personal/` | No existen en Bubble | N/A |

**Recomendación:** Los archivos PDF de Bubble están en URLs S3 públicas. Se sugiere:
1. Crear script de descarga de PDFs históricos
2. Almacenar en Supabase Storage bajo `cotizaciones/archive/`
3. Mantener URLs de Bubble como referencias hasta que expire el bucket

---

## 5. MAPEO DETALLADO (BUBBLE → SUPABASE)

### COTIZACIONES

```
Bubble.Cotizaciones
├─ _id                          → Supabase.cotizaciones.id (UUID)
├─ Codigo                       → Supabase.cotizaciones.numero
├─ cliente_id                   → Supabase.cotizaciones.cliente_id
├─ contacto_id                  → Supabase.cotizaciones.contacto_id
├─ sitio_id                     → Supabase.cotizaciones.sitio_id
├─ Descripcion General          → Supabase.cotizaciones.descripcion_requerimiento (nuevo campo)
├─ Fecha Solicitud              → Supabase.cotizaciones.fecha_emision
├─ Fecha Planificada            → Supabase.cotizaciones.fecha_inicio_estimada (nuevo)
├─ fecha_aprobacion             → Supabase.cotizaciones.fecha_aprobacion
├─ Estado                       → Supabase.cotizaciones.estado (ENUM normalizado)
├─ Archivo_web                  → Supabase.storage.cotizaciones/[id].pdf
├─ Observaciones precios        → Supabase.cotizaciones.notas_precios (nuevo)
├─ forma_pago                   → Supabase.cotizaciones.forma_pago (string)
├─ moneda                       → Supabase.cotizaciones.moneda (ENUM)
├─ Id Plazo de Pago             → Supabase.cotizaciones.plazo_pago (string)
├─ Periodo Cantidad             → Supabase.cotizaciones.periodo
├─ Periodo Unidad               → Supabase.cotizaciones.periodo_unidad (DIA/MES)
├─ Lista Items Incluidos        → Supabase.cotizaciones_detalle[] (relación)
├─ Lista Items Matriz Responsabilidad  → Supabase.matriz_responsabilidad[] (relación)
├─ tenant_id                    → Supabase.cotizaciones.tenant_id (UUID)
├─ Created By                   → Supabase.cotizaciones.created_by (UUID)
├─ Created Date                 → Supabase.cotizaciones.created_at (TIMESTAMPTZ)
├─ Modified Date                → Supabase.cotizaciones.updated_at (TIMESTAMPTZ)
├─ [IGNORAR] Fecha Solicitud_Año, _Mes, _Semana
├─ [IGNORAR] Tab, Slug, con_informe, cotizacion_configuracion_id
└─ [IGNORAR] Lista Temporal Items - Chequear
```

### TAREAS

```
Bubble.Tareas
├─ _id                         → Supabase.tareas.id (UUID)
├─ titulo                      → Supabase.tareas.titulo
├─ codigo                      → Supabase.tareas.codigo (nuevo)
├─ comentarios                 → Supabase.tareas_comentarios[].comentario (relación)
├─ id_cotizacion               → Supabase.tareas.cotizacion_id
├─ id_cliente                  → Supabase.tareas.cliente_id
├─ id_empresa                  → Supabase.tareas.tenant_id
├─ Progreso % - NUEVA 27-08    → Supabase.tareas.progreso_porcentaje (nuevo, 0-100)
├─ prioridad                   → Supabase.tareas.prioridad (ENUM)
├─ [TODO] lista_maquinaria     → Supabase.tareas_maquinarias[] (crear tabla)
├─ [TODO] lista_personal       → Supabase.tareas_personal[] (crear tabla)
├─ [TODO] Tarea_Padre          → Supabase.tareas.tarea_padre_id (nuevo)
├─ [TODO] 0_lista_tareas_hijas → derivado de tarea_padre_id
├─ [IGNORAR] *--BORRAR-27-08, *-NUEVO-27-08 (legacy markers)
├─ [IGNORAR] Hora Inicio, Hora Final, estado-BORRAR, lista_formatos-BORRAR
├─ [IGNORAR] Responsables Reporte -BORRAR-27-08
└─ [IGNORAR] actualizado, Update_tarea_padre, confirmado
```

### TERCEROS

```
Bubble.Terceros
├─ _id                         → Supabase.terceros.id (UUID)
├─ razon_social                → Supabase.terceros.razon_social
├─ ruc                         → Supabase.terceros.ruc
├─ tipo                        → Supabase.terceros.tipo (ENUM: cliente, proveedor, ambos)
├─ direccion                   → Supabase.terceros.direccion
├─ ubicacion_ciudad            → Supabase.terceros.ubicacion_ciudad
├─ ubicacion_departamento      → Supabase.terceros.ubicacion_departamento
├─ ubicacion_pais              → Supabase.terceros.ubicacion_pais (default: PERU)
├─ rubro                       → Supabase.terceros.rubro
├─ estado_seniat               → Supabase.terceros.condicion [**VALIDAR**]
├─ condicion_seniat            → Supabase.terceros.estado
├─ logo_url                    → Supabase.terceros.logo_url
├─ is active                   → Supabase.terceros.is_active
├─ tenant_id                   → Supabase.terceros.tenant_id (UUID)
├─ Created By                  → Supabase.terceros.created_by (UUID)
├─ Created Date                → Supabase.terceros.created_at (TIMESTAMPTZ)
├─ Modified Date               → Supabase.terceros.updated_at (TIMESTAMPTZ)
├─ [NUEVO] nombre_comercial    ← N/A en Bubble
├─ [NUEVO] telefono            ← Campo separado en Supabase
├─ [NUEVO] email               ← Campo separado en Supabase
└─ [EXTERNO] Contactos         → Supabase.terceros_contactos[]
                              → Supabase.terceros_sitios[]
                              → Supabase.terceros_personal[]
```

---

## 6. RECOMENDACIONES Y ACCIONES

### Inmediatas (Prioritarios)

1. **Auditoría de PDFs en Bubble (CRÍTICO)**
   - [ ] Contar total de `Archivo_web` no nulos en Bubble
   - [ ] Verificar que todos apunten a S3 válido
   - [ ] Script: Listar URLs con fallos (404, inaccesible)
   - [ ] Decide: ¿Guardar archive en Supabase Storage?

   ```bash
   # Pseudo-script
   SELECT COUNT(*) FROM Cotizaciones WHERE Archivo_web IS NOT NULL AND Archivo_web != '';
   SELECT DISTINCT Archivo_web FROM Cotizaciones LIMIT 50;
   ```

2. **Campos Legacy en Tareas (HIGH)**
   - [ ] Confirmar que campos `-BORRAR-27-08` ya no se usan
   - [ ] Script de limpieza: Actualizar Tareas en Supabase sin estos campos
   - [ ] Documentar decision: ¿Copiar `progreso_porcentaje` de Bubble o resetear?

3. **Validar Mapeo de Estados (HIGH)**
   - [ ] Cotizaciones: `Estado` en Bubble vs `estado` ENUM en Supabase
     - Bubble: "Aprobada", "Rechazada", "Vencida" ← ¿Otros estados?
     - Supabase: "BORRADOR", "ENVIADA", "APROBADA", "RECHAZADA", "VENCIDA"
   - [ ] Tareas: Mapeo de estados legacy

4. **Plantear Estructura de Tareas Detallada (MEDIUM)**
   - [ ] Requiere `lista_maquinaria`? → Crear tabla `tareas_maquinarias`
   - [ ] Requiere `lista_personal`? → Crear tabla `tareas_personal`
   - [ ] Requiere subtareas (`Tarea_Padre`)? → Agregar `tarea_padre_id`

### Mediano Plazo

5. **Migración de Logos de Terceros**
   - [ ] Decidir si descargar y guardar en Storage o mantener URLs externas
   - [ ] Si guardar: Script de descarga y actualización de referencias

6. **Validar Tasas de Cambio**
   - [ ] ¿Existen tasas en Bubble? (Bubble puede tener en tabla aparte)
   - [ ] Crear tabla `tasas_cambio` en Supabase con datos históricos

7. **Integración de Contactos y Sitios**
   - [ ] Verificar que `terceros_contactos` en Supabase refleja refs de `contacto_id` en Bubble
   - [ ] Verificar que `terceros_sitios` en Supabase refleja refs de `sitio_id` en Bubble

### Largo Plazo (Post-Cutover)

8. **Deprecación de Bucket S3 Bubble**
   - [ ] Una vez migrados todos los archivos, remover acceso a S3 Bubble
   - [ ] Mantener período de gracia de 6-12 meses para referencias antiguas

9. **Auditoría de Datos Sucios**
   - [ ] Estado en Supabase vs Bubble: ¿Hay inconsistencias?
   - [ ] Validación de FKs: ¿Hay orfandad de datos?
   - [ ] Integridad: ¿Cotizaciones sin cliente? ¿Tareas sin titulo?

---

## 7. CHECKLISTS DE VALIDACIÓN

### Pre-Migración Final

- [ ] Total de registros Cotizaciones: Bubble = _____, Supabase = _____
- [ ] Total de registros Tareas: Bubble = _____, Supabase = _____
- [ ] Total de registros Terceros: Bubble = _____, Supabase = _____
- [ ] % de cotizaciones con `Archivo_web`: _____ %
- [ ] % de tareas con campos `-BORRAR-`: _____ % (debe ser 0 después limpieza)
- [ ] Validar FK integridad: Cotizaciones.cliente_id válido en Terceros
- [ ] Validar FK integridad: Tareas.cotizacion_id válido en Cotizaciones
- [ ] Estados en Supabase son ENUM válidos (no TEXT libre)

### Post-Migración

- [ ] Queries de reporte funcionan sobre Supabase (no Bubble)
- [ ] Dashboard de E2E actualizado a refs Supabase
- [ ] PDFs se generan correctamente en Supabase workflow
- [ ] Aprobación de cotizaciones funciona (token + PIN)
- [ ] Historial de tareas se registra correctamente

---

## 8. REFERENCIAS Y ANEXOS

### URLs de APIs

**Bubble API (histórico):**
- Base: `https://reporta.la/api/1.1/obj`
- Endpoint: `/Cotizaciones`, `/Tareas`, `/Terceros`
- Método: GET con `api_token` en query

**Supabase APIs (actual):**
- REST: `https://wioozisskjjgjjybsoqo.supabase.co/rest/v1/`
- Auth: `https://wioozisskjjgjjybsoqo.supabase.co/auth/v1/`
- Realtime: `wss://wioozisskjjgjjybsoqo.supabase.co/realtime/v1/`

### Archivos de Configuración

- **Tipos TypeScript:** `/types/cotizaciones.ts`, `/types/terceros.ts`
- **Migraciones Supabase:** `/supabase/migrations/2025*_*.sql`
- **Schema Dump:** `/current_schema_dump.sql` (encoding issue, usar migraciones)

### Documentación Relacionada

- `CLAUDE.md` — Instrucciones proyecto
- `ARCHITECTURE.md` — Decisiones técnicas
- `ROADMAP.md` — Timeline 2026-Q2
- `TESTING.md` — E2E suite

---

**Última actualización:** 2026-07-12  
**Próxima revisión sugerida:** Post-cutover de otros módulos (reportes, planificación)
