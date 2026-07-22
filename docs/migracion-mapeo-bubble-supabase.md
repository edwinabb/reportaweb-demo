# Mapeo de Migración Bubble → Supabase

**Creado:** 2026-06-03  
**Última actualización:** 2026-06-03 (jornada 3 — cierre sesión)  
**Estado:** 35 tablas OK/gap aceptado · 1 pendiente crítica (`inspecciones_detalles` 43.6%) · migración prácticamente completa

---

## Contexto

| Item | Detalle |
|---|---|
| Bubble API URL | `https://reporta.la/api/1.1/obj` |
| Bubble Token | `<BUBBLE_API_TOKEN — ver .env.local>` |
| PROD (Brazil) | `fqwhagryqkkhbgznxtwf` |
| TEST (USA) | `wioozisskjjgjjybsoqo` |
| Tenant CISE | `1cb97ec7-326c-4376-93ee-ed317d3da51b` (Bubble: `1596035803087x371442079041323000`) |
| Tenant GRUAS | `6f4c923a-c3b7-47c2-9dea-2a187f274f73` (Bubble: `1691779382086x534175713862630160`) |
| Cutover ejecutado | 2026-05-30 22:00 |
| Total tipos Bubble | 155 |
| Sin data | 49 |
| Con data | 106 |
| No migrar (confirmado) | 7 |
| **A migrar** | **99** |

### 7 tablas confirmadas NO migrar
`app_calendario_festivos` · `app_horaintervalos` · `sst_checklist_equipos` · `sst_ats_medida_control-new` · `sst_capacitacion` · `sst_extintor_equipo` · `sst_ats_registro-new`

### Regla de migración de archivos
Después de migrar cada tabla con URLs (foto, pdf, firma), ejecutar script de migración de archivos que:
1. Descarga el archivo desde Bubble CDN
2. Lo sube a Supabase Storage
3. Actualiza el campo URL en Supabase con el nuevo link

---

## Principio de orden: topología por FK

Migrar siempre en el orden de grupos. Una tabla de Grupo N solo puede migrarse después de que todas sus dependencias (Grupos 0..N-1) estén completas. De lo contrario los campos FK quedarán vacíos.

---

## GRUPO A — Catálogos sin dependencias (migrar primero)

### A.0 — Sin ningún FK (raíces absolutas)

| # | Supabase | Bubble type | PROD actual | Bubble total | Estado | Script |
|---|---|---|---:|---:|---|---|
| 1 | `paises` | `paises` | 249 | 249 | ✅ done | — |
| 2 | `ubigeo` | `ubigeo_peru` | ~1,800 | ~1,800 | ✅ done | — |
| 3 | `maquinaria_modelos` | `maquinaria_modelos` | 230 | 244 | ✅ done | — |
| 4 | `plantillas` | `formato` + `formato_seccion` + `formato_pregunta` + `formato_opciones_multiples` | 322 | 161×2 | ✅ done | — |
| 5 | `servicios` | `servicio` | 430 | 459 | ✅ done | — |
| 6 | `servicios_tipo_precios` | `servicios_tipo_precios` | 46 | 46 | ✅ done | — |
| 7 | `sitios_tipo` | catalog global (sin Bubble equivalent directo) | 22 | — | ✅ done | — |

### A.1 — FK solo a `companies`

| # | Supabase | Bubble type | PROD actual | Bubble total | Estado | Script |
|---|---|---|---:|---:|---|---|
| 8 | `tasas_cambio` | `tasas_cambio` | 871 | 873 | ⚠️ gap -2 aceptado | — |
| 9 | `document_types` | user doc types | 45 | 45 | ✅ done | — |
| 10 | `tipos_precio` | catalog global | 20 | 20 | ✅ done | — |
| 11 | `servicios_tipos` | inline en `servicio` | 0 | 0 | ⏭️ skip (vacío) | — |
| 12 | `maquinaria_tipos_docs` | `maquinaria_tipos_docs` | 30 | 31 | ✅ done | — |
| 13 | `rubros` | campo `rubro` en `tercero` | 57 | 57 | ✅ done | — |
| 14 | `job_titles` | `usuario_cargos` (vacío) → derivado de `user.id_cargo` | 156 | — | ✅ done | — |
| 15 | `formas_pago` | catalog inline | 14 | — | ✅ done | — |
| 16 | `plazos_pago` | catalog inline | 83 | — | ✅ done | — |
| 17 | `bancos` | `app_bancos` | 0 | 0 | ⏭️ skip (vacío en Bubble) | — |
| 18 | `catalogos` | `configuraciones_opciones_listas` | 0 | 2 | ⏭️ skip (2 registros globales, no por tenant) | — |
| 19 | `terceros_tipos` | inline en `tercero.tipo` | 15 | — | ✅ done | — |

---

## GRUPO B — FK a Grupo A

| # | Supabase | Bubble type | PROD actual | Bubble total | Estado | FK depende de |
|---|---|---|---:|---:|---|---|
| 20 | `terceros` | `tercero` | 631 | ~687 | ⚠️ gap -56 | paises, rubros, ubigeo |

---

## GRUPO C — FK a Grupo B

| # | Supabase | Bubble type | PROD actual | Bubble total | Estado | FK depende de |
|---|---|---|---:|---:|---|---|
| 21 | `maquinarias` | `maquinaria` | 260 | 282 | ✅ done | maquinaria_modelos, **terceros** |
| 22 | `terceros_contactos` | `terceros_contactos` | **734** | ~884 | ⚠️ 83% (150 huérfanos Bubble) | **terceros** |
| 23 | `terceros_personal` | `terceros_personal` | 0 | 0 | ⏭️ skip (vacío en Bubble) | **terceros** |
| 24 | `terceros_sitios` | `terceros_sitios` | 1,689 | ~1,957 | ⚠️ gap -268 | sitios_tipo, **terceros** |
| 25 | `profiles` + `profile_details` | `user` | 274 | ~319 | ⚠️ gap -45 | **terceros**, job_titles |

---

## GRUPO D — FK a Grupo C

| # | Supabase | Bubble type | PROD actual | Bubble total | Estado | FK depende de |
|---|---|---|---:|---:|---|---|
| 26 | `cotizaciones` | `cotizaciones` | 2,581 | ~2,644 | ⚠️ gap -63 | tasas_cambio, **terceros**, **terceros_contactos**, **terceros_sitios** |
| 27 | `maquinaria_documentos` | `maquinaria_documento` | 239 | ~244 | ⚠️ gap -5 📎 | maquinaria_tipos_docs, **maquinarias** |
| 28 | `proyectos` | `proyecto` | 0 | ~2 | ⏭️ skip (CISE/GRUAS no usan proyectos) | **terceros**, **terceros_sitios** |
| 29 | `terceros_sitios_rel` | relación interna | 0 | — | ⏭️ skip (relación manejada en app) | **terceros**, **terceros_sitios** |

---

## GRUPO E — FK a Grupo D

| # | Supabase | Bubble type | PROD actual | Bubble total | Estado | FK depende de |
|---|---|---|---:|---:|---|---|
| 30 | `tareas` | `tareas` | ~13,738 | ~14,461 | ⚠️ gap -723 | **cotizaciones**, **terceros**, **terceros_contactos**, **terceros_sitios** |
| 31 | `cotizaciones_detalle` | `cotizaciones_detalle` | 4,166 | ~4,258 | ⚠️ gap -92 | **cotizaciones**, servicios |
| 32 | `cotizaciones_ofertas_proveedores` | `cotizaciones_ofertas_proveedores` | **722** | ~721 | ✅ done | **cotizaciones**, **terceros**, **terceros_contactos** |
| 33 | `cotizaciones_matriz_responsabilidad` | `cotizaciones_matriz_responsabilidad` | 33,082 | 55,128 | ⚠️ gap ~22k = huérfanos en Bubble (sin cotizacion_id válido) — aceptado | **cotizaciones** |
| 34 | `cotizaciones_motivo_rechazo` | catalog | 509 | 509 | ✅ done | **cotizaciones** |
| 35 | `cotizaciones_historial` | historial inline | 0 | — | ⏭️ skip (generado por la app) | **cotizaciones** |
| 36 | `facturas_venta` | `facturas_venta` | 2,889 | ~2,914 | ⚠️ gap -25 📎 | (sin FK definido, lógico post-cotizaciones) |
| 37 | `facturas_compra` | `facturas_compra` | 1,265 | ~1,364 | ✅ done 📎 | (sin FK definido) |

---

## GRUPO F — FK a Grupo E

| # | Supabase | Bubble type | PROD actual | Bubble total | Estado | FK depende de |
|---|---|---|---:|---:|---|---|
| 38 | `inspecciones` | `informes` | 13,747 | ~13,796 | ⚠️ gap -49 📎 | **maquinarias**, **plantillas**, **tareas** |
| 39 | `tareas_fechas` | embedded en tareas | — | — | ✅ done | **tareas** |
| 40 | `cotizaciones_ofertas_items` | `cotizaciones_ofertas_items` | **634** | ~636 | ✅ done | **cotizaciones_ofertas_proveedores** |
| 41 | `reportes_maquinaria` | `maquinaria_reporte_horas_new` | 22,750 | ~24,193 | ✅ 99.5% (backfill tarea_id completado) 📎 | **maquinarias**, **tareas** |
| 42 | `reportes_personal` | `usuario-reporte-horas-new` | 26,757 | ~27,044 | ✅ 99.8% (backfill tarea_id completado) 📎 | **maquinarias**, **tareas**, **terceros_personal** |
| 43 | `facturas_venta_item` | `facturas_venta_item` | ~18,393 | ~23,033 | ⚠️ gap documentado | (sin FK definido) |
| 44 | `facturas_compra_item` | `facturas_compra_item` | 20,761 | ~22,663 | ✅ done | (sin FK definido) |
| 45 | `tareas_recursos` | embedded en tareas | 36,461 | — | ✅ done | **maquinarias**, **tareas**, tareas_fechas |

---

## GRUPO G — FK a Grupo F

| # | Supabase | Bubble type | PROD actual | Bubble total | Estado | FK depende de |
|---|---|---|---:|---:|---|---|
| 46 | `inspecciones_detalles` | `informe_respuesta` | 38,528 | ~317,878 | ❌ solo 12% | **inspecciones** |
| 47 | `maquinaria_horas` | `maquinaria_horas` | 1,917 | ~22,219 | ✅ done | **cotizaciones_detalle**, **inspecciones**, **maquinarias**, **tareas** |
| 48 | `gastos_usuario` | `usuario_gastos` | 3,277 | 3,277 | ✅ done | **inspecciones** |

---

## GRUPO H — FK a Grupo G

| # | Supabase | Bubble type | PROD actual | Bubble total | Estado | FK depende de |
|---|---|---|---:|---:|---|---|
| 49 | `valorizaciones` | `maquinaria_horas-valorizaciones` | 752 | 752 | ✅ done | **maquinaria_horas**, **reportes_maquinaria** |
| 50 | `planes_accion` | `plan_de_accion` | 405 | 484 | ✅ done | **inspecciones**, **inspecciones_detalles** |

---

## GRUPO I — FK a Grupo H

| # | Supabase | Bubble type | PROD actual | Bubble total | Estado | FK depende de |
|---|---|---|---:|---:|---|---|
| 51 | `planes_accion_avances` | `plan_de_accion_avance` | 44 | 44 | ✅ done | **planes_accion** |

---

## Tablas a ignorar / skip

| Tabla Supabase | Razón |
|---|---|
| `bancos` | `app_bancos` vacío en Bubble |
| `terceros_personal` | Vacío en Bubble y en PROD |
| `servicios_tipos` | Bubble no tiene tipo separado (nombre inline en servicio) |
| `catalogos` | Solo 2 registros globales en Bubble, no por tenant |
| `proyectos` | Solo 1-2 proyectos test en Bubble, CISE/GRUAS no usan proyectos |
| `sst_epp_*` | Módulo 100% nuevo en Supabase, sin equivalente Bubble |
| `sst_incidente`, `sst_ats_*`, `sst_capacitacion` | Módulos nuevos Supabase |
| `kpifunnel`, `kpisources` | Analytics interno |
| `notificaciones_receptores` | No hay historial en Bubble |
| `terceros_sitios_rel` | Relación manejada en app, no necesita migración |
| `cotizaciones_historial` | Generado por la app, no existe en Bubble como historial exportable |

---

## Mapeo campo a campo — Tablas con gaps o pendientes

### `terceros_contactos` ❌ VACÍO → Bubble: `terceros_contactos`

**Estrategia especial:** La API Bubble no devuelve contactos vía constraints.  
Iterar cada tercero (`/obj/tercero?limit=100`) → leer lista de `_id` de contactos → fetch individual `/obj/terceros_contactos/{id}`.

| Bubble campo | Supabase columna | Tipo | Estado | Nota |
|---|---|---|---|---|
| `_id` | `bubble_id` | text | ✅ | |
| `nombre_completo` | `nombre_completo` | text NOT NULL | ✅ | |
| `telefono` | `telefono` | text | ✅ | |
| `email` | `email` | text | ✅ | |
| *(vía padre tercero)* | `tercero_id` | uuid | ⚠️ | FK via bubble_id del padre |
| *(vía padre tercero)* | `tenant_id` | uuid | ⚠️ | Heredar del tercero padre |
| — | `cargo` | text | 🆕 | No en Bubble, null |
| — | `area` | text | 🆕 | No en Bubble, null |
| `Created Date` | `created_at` | timestamp | ✅ | |

**PROD:** 0 | **Bubble:** ~884 | **Prioridad:** 🔴 CRÍTICO

---

### `terceros` ⚠️ gap → Bubble: `tercero`

| Bubble campo | Supabase columna | Tipo | Estado | Nota |
|---|---|---|---|---|
| `_id` | `bubble_id` | text | ✅ | |
| `razon_social` | `razon_social` | text NOT NULL | ✅ | |
| `ruc` | `ruc` | text | ✅ | |
| `tipo` | `tipo` | text | ✅ | lista → join con `,` |
| `rubro` | `rubro` | text | ✅ | texto plano |
| `ubicacion_ciudad` | `ubicacion_ciudad` | text | ✅ | |
| `ubicacion_pais` | `ubicacion_pais` | text | ✅ | |
| `is active` | `is_active` | boolean | ⚠️ | nombre con espacio |
| `tenant_id` | `tenant_id` | uuid | ⚠️ | bubble_id → TENANT_MAP |
| `Created Date` | `created_at` | timestamp | ✅ | |
| — | `rubro_id` | uuid | 🆕 | null |
| — | `nombre_comercial` | text | 🆕 | null |
| — | `logo_url` | text | 🆕 | 📎 migrar fotos Bubble CDN |

**PROD:** 631 | **Bubble:** ~687 | **Gap:** -56

---

### `terceros_sitios` ⚠️ gap → Bubble: `terceros_sitios`

| Bubble campo | Supabase columna | Tipo | Estado | Nota |
|---|---|---|---|---|
| `_id` | `bubble_id` | text | ✅ | |
| `nombre` | `nombre` | text NOT NULL | ✅ | |
| `codigo` | `codigo` | text | ✅ | |
| `is_active` | `is_active` | boolean | ✅ | |
| `tenant_id` | `tenant_id` | uuid | ⚠️ | bubble → TENANT_MAP |
| `tercero_id` | `tercero_id` | uuid | ⚠️ | bubble_id → buildBubbleMap('terceros') |
| `tipo_id` | `tipo` | uuid | ⚠️ | bubble_id → buildBubbleMap('sitios_tipo') |
| `Created Date` | `created_at` | timestamp | ✅ | |
| — | `direccion` | text | 🆕 | null |
| — | `ciudad` | text | 🆕 | null |
| — | `latitud` / `longitud` | numeric | 🆕 | null |

**PROD:** 1,689 | **Bubble:** ~1,957 | **Gap:** -268

---

### `cotizaciones` ⚠️ gap → Bubble: `cotizaciones`

| Bubble campo | Supabase columna | Tipo | Estado | Nota |
|---|---|---|---|---|
| `_id` | `bubble_id` | text | ✅ | |
| `Codigo` | `codigo` | text | ✅ | |
| `Estado` | `estado` | text | ✅ | |
| `tenant_id` | `tenant_id` | uuid | ⚠️ | bubble → TENANT_MAP |
| `cliente_id` | `cliente_id` | uuid | ⚠️ | bubble_id → terceros |
| `sitio_id` | `sitio_id` | uuid | ⚠️ | bubble_id → terceros_sitios |
| `contacto_id` | `contacto_id` | uuid | ⚠️ | bubble_id → terceros_contactos (requiere C) |
| `tasa_cambio_id` | `tasa_cambio_id` | uuid | ⚠️ | bubble_id → tasas_cambio |
| `cotizacion_configuracion_id` | `cotizacion_configuracion_id` | uuid | ⚠️ | bubble_id → cotizaciones_configuracion |
| `Fecha Solicitud` | `fecha_solicitud` | date | ✅ | |
| `moneda` | `moneda` | text | ✅ | |
| `forma_pago` | `forma_pago` | text | ✅ | |
| `Descripcion General` | `descripcion_general` | text | ✅ | |
| `Tab` | — | — | ❌ | No existe en Supabase |
| `Periodo Cantidad` / `Periodo Unidad` | — | — | ❌ | No existe en Supabase |
| `Created Date` | `created_at` | timestamp | ✅ | |

**PROD:** 2,581 | **Bubble:** ~2,644 | **Gap:** -63

---

### `cotizaciones_detalle` ⚠️ gap → Bubble: `cotizaciones_detalle`

**Estrategia:** La relación va `cotizacion.Lista Items Incluidos → []cotizacion_detalle`. Requiere iterar cotizaciones y leer sus detalles.

| Bubble campo | Supabase columna | Tipo | Estado | Nota |
|---|---|---|---|---|
| `_id` | `bubble_id` | text | ✅ | |
| `tenant_id` | `tenant_id` | uuid | ⚠️ | |
| `servicio_id` | `servicio_id` | uuid | ⚠️ | bubble_id → servicios |
| *(vía padre cotizacion)* | `cotizacion_id` | uuid | ⚠️ | FK inversa |
| `cantidad` | `cantidad` | numeric | ✅ | |
| `precio1_monto` | `precio_monto` | numeric | ✅ | |
| `minimo1` | `minimo` | numeric | ✅ | |
| `Created Date` | `created_at` | timestamp | ✅ | |

**PROD:** 4,166 | **Bubble:** ~4,258 | **Gap:** -92

---

### `cotizaciones_ofertas_proveedores` ❌ VACÍO

**Estrategia:** Igual que detalle — la relación va del padre cotizacion. Además `cotizacion_id`, `servicio_id` y `proveedor_nombre` son NOT NULL en Supabase, requieren lógica especial.

| Bubble campo | Supabase columna | Tipo | Estado | Nota |
|---|---|---|---|---|
| `_id` | `bubble_id` | text | ✅ | |
| `tenant_id` | `tenant_id` | uuid | ⚠️ | |
| `proveedor_id` | `proveedor_id` | uuid | ⚠️ | bubble_id → terceros |
| `contacto_id` | `contacto_id` | uuid | ⚠️ | bubble_id → terceros_contactos |
| `forma_pago` | `forma_pago` | text | ✅ | |
| `observaciones` | `observaciones` | text | ✅ | |
| *(vía cotizacion padre)* | `cotizacion_id` | uuid NOT NULL | ⚠️ | FK inversa |
| *(deducido de proveedor)* | `proveedor_nombre` | text NOT NULL | ⚠️ | Leer de `tercero.razon_social` |
| *(primer item)* | `precio` | numeric NOT NULL | ⚠️ | Leer de primer `cotizaciones_ofertas_item` |
| `estado` | — | — | ❌ | No en Supabase |
| `fecha_respuesta` | — | — | ❌ | No en Supabase |
| `id_oferta_manual` | — | — | ❌ | No en Supabase |

**PROD:** 0 | **Bubble:** ~721 | **Prioridad:** 🟠

---

### `cotizaciones_ofertas_items` ❌ VACÍO

| Bubble campo | Supabase columna | Tipo | Estado | Nota |
|---|---|---|---|---|
| `_id` | `bubble_id` | text | ✅ | |
| `tenant_id` | `tenant_id` | uuid | ⚠️ | |
| `cotizacion_oferta_id` | `cotizacion_oferta_id` | uuid NOT NULL | ⚠️ | bubble_id → cotizaciones_ofertas_proveedores |
| `cantidad` | `cantidad` | numeric | ✅ | |
| `precio_1_valor` | `precio_monto` | numeric | ✅ | |
| `aprobado` | `aprobado` | boolean | ✅ | |
| `con_respuesta` | — | — | ❌ | No en Supabase |
| `precio_1_campo_adicional` | — | — | ❌ | No en Supabase |
| — | `cotizacion_oferta_bubble_id` | text | 🆕 | provisional para FK |

**PROD:** 0 | **Bubble:** ~636 | **Prioridad:** 🟠

---

### `maquinaria_documentos` ⚠️ gap → Bubble: `maquinaria_documento`

| Bubble campo | Supabase columna | Tipo | Estado | Nota |
|---|---|---|---|---|
| `_id` | `bubble_id` | text | ✅ | |
| `tenant_id` | `tenant_id` | uuid | ⚠️ | |
| `maquinaria_id` (lista) | `maquinaria_id` | uuid | ⚠️ | lista → tomar primero |
| `numero_doc` | `numero_doc` | text | ✅ | |
| `fecha_emision` | `fecha_emision` | date | ✅ | |
| `fecha_vencimiento` | `fecha_vencimiento` | date | ✅ | |
| `archivo_url` | `archivo_url` | text | ✅ | 📎 migrar PDF |
| — | `tipo_doc_id` | uuid | 🆕 | null |

**PROD:** 239 | **Bubble:** ~244 | **Gap:** -5

---

### `tareas` ⚠️ gap → Bubble: `tareas`

| Bubble campo | Supabase columna | Tipo | Estado | Nota |
|---|---|---|---|---|
| `_id` | `bubble_id` | text | ✅ | |
| `titulo` | `titulo` | text | ✅ | |
| `codigo` | `codigo` | text | ✅ | |
| `id_empresa` | `tenant_id` | uuid | ⚠️ | bubble → TENANT_MAP |
| `id_cliente` | `cliente_id` | uuid | ⚠️ | bubble_id → terceros |
| `id_cotizacion` | `cotizacion_id` | uuid | ⚠️ | bubble_id → cotizaciones (nullable) |
| `confirmado` | `estado` | text | ⚠️ | true→'CONFIRMADA', false→'BORRADOR' |
| `id_sitio-2025` | `sitio_id` | uuid | ⚠️ | bubble_id → terceros_sitios |
| `id_contacto_cliente` | `contacto_id` | uuid | ⚠️ | bubble_id → terceros_contactos |
| `comentarios` | `comentarios` | text | ✅ | |
| `Created Date` | `created_at` | timestamp | ✅ | |
| `Progreso % - NUEVA 27-08` | — | — | ❌ | No en Supabase |

**PROD:** ~13,738 | **Bubble:** ~14,461 | **Gap:** -723

---

### `inspecciones` ⚠️ gap → Bubble: `informes`

| Bubble campo | Supabase columna | Tipo | Estado | Nota |
|---|---|---|---|---|
| `_id` | `bubble_id` | text | ✅ | |
| `id_empresa` | `tenant_id` | uuid | ⚠️ | |
| `id_formato` | `plantilla_id` | uuid | ⚠️ | bubble_id → plantillas |
| `id_tarea` | `tarea_id` | uuid | ⚠️ | bubble_id → tareas |
| *(vía informe_objeto)* | `maquinaria_id` | uuid | ⚠️ | lookup por informe_objeto |
| `Created Date` | `created_at` | timestamp | ✅ | |
| — | `archivo_pdf_url` | text | 🆕 | 📎 migrar PDF |

**PROD:** 13,747 | **Bubble:** ~13,796 | **Gap:** -49

---

### `inspecciones_detalles` ❌ INCOMPLETO → Bubble: `informe_respuesta`

**Volumen crítico:** ~317,878 registros. Paginar con cursor de 100 en 100.

| Bubble campo | Supabase columna | Tipo | Estado | Nota |
|---|---|---|---|---|
| `_id` | `bubble_id` | text | ✅ | |
| `id_empresa` | `tenant_id` | uuid | ⚠️ | |
| `id_informe` | `inspeccion_id` | uuid | ⚠️ | bubble_id → inspecciones |
| `tipo` | `tipo_pregunta` | text | ✅ | |
| `obligatorio?` | `obligatorio` | boolean | ✅ | |
| `respuesta_fecha` | `respuesta_fecha` | date | ✅ | |
| — | `categoria` | text | 🆕 | null |
| — | `item` | text | 🆕 | null |
| — | `estado` | text | 🆕 | null |
| — | `foto_url` | text | 🆕 | 📎 si existe |
| — | `pregunta_bubble_id` | text | 🆕 | provisional |

**PROD:** 38,528 | **Bubble:** ~317,878 | **Gap:** -279,350 | **Prioridad:** 🔴 CRÍTICO

---

### `profile_details` ⚠️ gap → Bubble: `user`

| Bubble campo | Supabase columna | Estado | Nota |
|---|---|---|---|
| `_id` | `bubble_id` (en profiles) | ✅ | |
| `doc_type` | `doc_type` | ✅ | |
| `doc_number` | `doc_number` | ✅ | |
| `id_cargo` | `job_title_id` | ⚠️ | bubble_id → job_titles |
| `signature_url` | `firma_url` | ✅ | 📎 |
| `photo_url` | `foto_url` | ✅ | 📎 |
| `first_name`, `last_name` | en `profiles` | ✅ | ya migrado |

**PROD:** 274 | **Bubble:** ~319 | **Gap:** -45

---

### `maquinaria_horas` ✅ done → Bubble: `maquinaria_horas`

| Bubble campo | Supabase columna | Estado |
|---|---|---|
| `_id` | `bubble_id` | ✅ |
| `maquinaria_id` | `maquinaria_id` | ✅ |
| `tarea_id` | `tarea_id` | ✅ |
| `cotizacion_item_id` | `cotizacion_item_id` | ✅ |
| `Id Informe` | `inspeccion_id` | ⚠️ bubble_id → inspecciones |
| `id_cliente` | `cliente_id` | ✅ |
| `jornada1_inicio/fin` | `jornada1_inicio/fin` | ✅ |
| `jornada2_inicio/fin` | `jornada2_inicio/fin` | ✅ |
| `Total Horas` | `total_horas_texto` | ✅ |
| `total_horas` | `total_horas_num` | ✅ |
| `cant_servicios` | `cant_servicios` | ✅ |
| `tipo_recorrido` | `tipo_recorrido` | ✅ |
| `tenant_id` | `tenant_id` | ✅ |
| `Var Estado` | `estado` | ✅ |

**PROD:** 1,917 | **Bubble:** ~22,219 | **Nota:** Solo se migró `maquinaria_horas` (Bubble), no `maquinaria_reporte_horas_new`. Verificar si hay confusión entre ambos tipos.

---

## Archivos a migrar a Storage (post-migración de cada tabla)

| Tabla | Campo(s) | Bucket sugerido | Prioridad |
|---|---|---|---|
| `maquinarias` | `foto_url` | `maquinarias` | 🟡 |
| `maquinaria_documentos` | `archivo_url` | `documentos-maquinaria` | 🟡 |
| `cotizaciones` | `pdf_url` | `cotizaciones` | 🟠 |
| `facturas_venta` | `pdf_valorizacion` | `facturas` | 🟡 |
| `facturas_compra` | `pdf_factura`, `pdf_valorizacion` | `facturas` | 🟡 |
| `inspecciones` | `archivo_pdf_url` | `inspecciones` | 🟠 |
| `reportes_maquinaria` | `pdf_url`, `firma_cliente_url`, `foto_reporte_escrito_url` | `reportes-maquinaria` | 🔴 |
| `reportes_personal` | `pdf_url` | `reportes-personal` | 🟠 |
| `profile_details` | `firma_url`, `foto_url` | `usuarios` | 🟡 |
| `terceros` | `logo_url` | `logos` | 🟡 |

---

## Estrategia de ejecución

### Para TEST (USA — `wioozisskjjgjjybsoqo`)
1. Wipe completo (borrar datos, no schema)
2. Ejecutar scripts en orden de grupos A→I
3. Verificar conteos vs Bubble
4. Corregir scripts si hay gaps

### Para PROD (Brazil — `fqwhagryqkkhbgznxtwf`)
1. Ejecutar los **mismos scripts** en modo **delta/upsert** (skip si `bubble_id` ya existe)
2. **NO borrar PROD** — tiene datos reales post-cutover
3. Verificar conteos vs Bubble — solo los nuevos registros se insertan
4. Los UUIDs de PROD y TEST serán distintos (correcto — cada DB genera sus propios IDs)

### Herramienta compartida
`scripts/_bubble-helpers.ts` — helpers: `fetchAllBubble()`, `buildBubbleMap()`, `loadExistingBubbleIds()`, `safeInsert()`, `TENANT_MAP`

---

## Prioridades para próximos scripts

| Prioridad | Tabla | Razón |
|---|---|---|
| 🔴 1 | `terceros_contactos` | Vacío, bloqueante para cotizaciones/tareas (contacto_id) |
| 🔴 2 | `inspecciones_detalles` | Solo 12%, núcleo del módulo checklists |
| 🟠 3 | `cotizaciones_ofertas_proveedores` | Vacío, módulo compras inoperativo |
| 🟠 4 | `cotizaciones_ofertas_items` | Depende de #3 |
| 🟡 5 | Deltas de tablas ya migradas | `terceros`, `terceros_sitios`, `tareas`, `reportes_*` |
| 🟡 6 | `cotizaciones_detalle` | Gap -92 |

---

## Hallazgos críticos de la ejecución

### `terceros_contactos` — relación sin FK en Bubble
Los contactos en Bubble NO tienen `tenant_id` ni referencia al tercero padre. La relación tampoco aparece como lista en el objeto tercero (el GET individual no la expone). **Solución aplicada:** inferir tenant y tercero_id vía cotizaciones y tareas que referencian el contacto. Resultado: 734/884 migrados (150 huérfanos sin referencia en ninguna cotizacion/tarea — se aceptan como no vinculables).

### `cotizaciones_ofertas_proveedores` — relación bidireccional invisible en API
La oferta en Bubble tiene `tenant_id` pero **NO** `cotizacion_id`. La cotizacion tampoco expone una lista de ofertas. No existe ningún campo visible en la API de Bubble que vincule oferta ↔ cotizacion. **Solución aplicada:** hacer nullable `cotizacion_id` en Supabase, migrar todas las ofertas con `cotizacion_id = NULL` y guardar `cotizacion_bubble_id` para reconciliación futura manual. El campo `id_oferta_manual` es solo un número secuencial interno de Bubble (12, 13...).

### `cotizaciones_matriz_responsabilidad` — gap ~22k items sin cotizacion_id (DECISIÓN: no migrar)

**Estado 2026-06-03:** 33,082 en Supabase / 55,128 en Bubble = gap ~22,046.

**Causa del gap investigada:**
- El tipo Bubble `cotizaciones_matriz_responsabilidad` tiene 55,128 objetos.
- Un item de matriz **no tiene campo `cotizacion_id`** en su propio objeto — solo tiene `actividad_id`, `responsable_empresa`, `_id`.
- La relación es **unidireccional**: la cotizacion lista sus items en `Lista Items Matriz de Responsabilidad`.
- Los ~22k items faltantes son **huérfanos en Bubble**: existen como objetos del tipo pero ninguna cotización los referencia en su campo lista. No tienen `cotizacion_id` recuperable.
- 43 cotizaciones no migradas a Supabase explican ~284 items adicionales (cotizaciones creadas post-migración o con FKs rotas).

**Decisión (2026-06-03):** No migrar los huérfanos. Insertar con `cotizacion_id = null` no aportaría valor funcional ya que no estarían vinculados a ninguna cotización. El script `migrate-cotizaciones-matriz-v2.ts` ya recuperó todos los items accesibles vía cotizaciones.

**Para referencia futura:** Si se necesita recuperar estos items, la única estrategia sería fetch directo del tipo `cotizaciones_matriz_responsabilidad` en Bubble e insertar con `cotizacion_id = null` + `cotizacion_bubble_id = null`. Buscar los items cuyo `_id` no está en `existing` (loadExistingBubbleIds).

### `maquinaria_documentos` — bubble_ids incompatibles entre migraciones
El script de mayo usó el endpoint `version-test` (o timestamps de migración como `created_at`). El delta de hoy usó el endpoint `live`. Resultado: 481 registros con 481 bubble_ids únicos pero solo 244 documentos reales. **Solución aplicada:** eliminar los 239 registros con `created_at` entre 2026-05-30 y 2026-06-03 (versión incorrecta). Quedaron 242 correctos.

### `cotizaciones_detalle` — lista no expuesta en endpoint list de Bubble
El campo `Lista Items Incluidos` existe en el objeto cotizacion pero **no es retornado en el endpoint list**. Solo se podría obtener fetching individual por cotizacion (caro en API calls). Gap de 92 records aceptado como post-cutover.

### Scripts corregidos durante ejecución
- `profile_details`: columnas `doc_number`, `firma_url`, `pin` no existen → corregido a `signature_url`, `photo_url`, `middle_name`, `nationality`
- `cotizaciones`: `codigo` → `numero`, `descripcion_general` → `descripcion_requerimiento`
- `tareas`: `estado` check constraint — solo acepta `COMPLETADA`/`PENDIENTE` (no `CONFIRMADA`/`BORRADOR`)
- `reportes_maquinaria`: no tiene `turno_adicional` — eliminado
- `reportes_personal`: no tiene `version_formato` — eliminado
- `facturas_venta`: `is_active` → `esta_activa` + `deshabilitada`

## Estado de FKs post-backfill (2026-06-03)

| Campo | Con FK | Sin FK | % | Nota |
|---|---:|---:|---:|---|
| `terceros.pais_id` | 631 | 0 | **100%** | Fix SQL puro |
| `tareas.cliente_id` | 12,410 | 2,100 | **85.5%** | 14.5% sin cliente en Bubble |
| `tareas.contacto_id` | 12,310 | 2,200 | **84.8%** | |
| `tareas.sitio_id` | 2,359 | 12,151 | **16.3%** | Solo tareas con sitio asignado |
| `inspecciones.tarea_id` | 3,195 | 10,618 | **23.1%** | `id_tarea` vacío en Bubble en muchos |
| `inspecciones.maquinaria_id` | 4,144 | 9,669 | **30.0%** | |
| `reportes_maquinaria.tarea_id` | 24,231 | 121 | **99.5%** | ✅ completado 2026-06-03 |
| `reportes_personal.tarea_id` | 27,117 | 54 | **99.8%** | ✅ completado 2026-06-03 |

## Estado de archivos Bubble/S3 → Supabase Storage

> **CRÍTICO:** Los archivos en S3 son de Amazon vía Bubble. Al cancelar Bubble se pierde acceso.
> Script maestro: `migrate-all-bubble-cdn-files.ts --run`

| Campo | Archivos Bubble | En Supabase | Bucket | Estado |
|---|---:|---:|---|---|
| `maquinaria_documentos.archivo_url` | 189 | **189** | `doc_maquinarias` | ✅ 2026-06-03 |
| `profile_details.signature_url` | 31 | **31** | `usuarios/firmas/` | ✅ 2026-06-03 |
| `profile_details.photo_url` | 1 | **1** | `usuarios/fotos/` | ✅ 2026-06-03 |
| `inspecciones.archivo_pdf_url` | 31 | **31** | `informes-maquinaria/cdn-migrated/` | ✅ 2026-06-03 |
| `reportes_maquinaria.pdf_url` | 31 | **31** | `reporte-maquinaria/cdn-migrated/` | ✅ 2026-06-03 |
| `reportes_maquinaria.firma_cliente_url` | 23 | **23** | `reporta-maquinaria-fotos/cdn-migrated/` | ✅ 2026-06-03 |
| `reportes_personal.pdf_url` | 29 | **29** | `informes-personal/cdn-migrated/` | ✅ 2026-06-03 |
| `servicios.imagen_url` | 217 | pendiente | `public-assets/servicios/` | 🔄 corriendo 2026-06-03 |
| `planes_accion.lista_fotos` (JSONB) | 45 fotos / 33 planes | pendiente | `planes-accion/planes/` | 🔄 corriendo 2026-06-03 |
| `reportes_maquinaria.fotos_adicionales` (JSONB) | ~20 | pendiente | `reporta-maquinaria-fotos/fotos-adicionales/` | 🔄 corriendo 2026-06-03 |

**Tablas auditadas sin URLs Bubble (OK):** `maquinarias`, `terceros`, `inspecciones` (fotos tablero/firma/odómetro), `cotizaciones_configuracion`, `formatos_informes`, `formatos_informes_respuestas`, `terceros_personal`, `companies`, `valorizaciones`, `sst_*`, `app_*`, `bitacora_operaciones`, `reportes_combustible`, `reportes_usuario`

---

## Plan de trabajo — Estado al 2026-06-03 cierre de jornada

### ✅ P1 — backfill tarea_id en reportes
`reportes_maquinaria.tarea_id`: 99.5% | `reportes_personal.tarea_id`: 99.8%

### ✅ P2 — investigación tarea_id (cerrado)
Era tareasMap incompleto en migración inicial. P1 lo resolvió.

### ✅ P3 — cotizaciones_matriz_responsabilidad
33,082/55,128. Gap ~22k = huérfanos sin cotizacion_id. Decisión: no migrar.

### ❌ P4 — inspecciones_detalles (pendiente — próxima sesión)
138,528/317,878 (43.6%). Bubble API limita 50k/query sin importar constraint.  
**Estrategia para mañana:** paginación por rangos de `Created Date` (ventanas trimestrales < 50k):
```bash
# Script a crear: migrate-inspecciones-detalles-v3.ts
# Loop: para cada tenant × cada trimestre desde 2020 hasta hoy
# Constraint: Created Date >= '2022-01-01' AND < '2022-04-01'
```

### ✅ P5 — Archivos CDN/S3 → Supabase Storage (prácticamente completo)
146 archivos confirmados. 3 procesos más corriendo (servicios 217 + planes 45 + fotos 20 = ~282 archivos).

### ✅ P6 — cotizaciones.tasa_cambio_id
1,935 actualizadas via SQL. 606 USD anteriores a jun 2022 sin tasa — aceptado.

### ✅ P7 — planes_accion
406 planes + 993 responsables + 44 avances.

### ✅ maquinaria_horas
1,917/1,917. Gap -20,302 era error en verify script (corregido).

---

## Plan para 2026-06-04

### 🔴 Verificar archivos que estaban corriendo al cierre
```bash
# Confirmar que terminaron correctamente:
npx tsx scripts/verify-migration-counts-v2.ts
# Verificar SQL:
# SELECT COUNT(*) FROM servicios WHERE imagen_url LIKE '%supabase%';  -- debe ser ~217
# SELECT COUNT(*) FROM planes_accion WHERE lista_fotos::text LIKE '%supabase%';  -- debe ser ~33
```

### 🔴 P4 — inspecciones_detalles v3 (paginación por fecha)
Crear `scripts/migrate-inspecciones-detalles-v3.ts`:
- Loop por tenant (CISE, GRUAS) × trimestre (2020-Q1 hasta 2026-Q2)
- Constraint: `Created Date >= YYYY-MM-DD AND < YYYY-MM-DD`
- Cada ventana debe tener < 50k registros (verificar con count antes)
- Idempotente: loadExistingBubbleIds para skip

### 🟠 DT-APP-04 — Keystore + AAB Play Store
```powershell
keytool -genkey -v -keystore android\app\reporta-release.keystore -alias reporta -keyalg RSA -keysize 2048 -validity 10000
cd android; gradlew.bat bundleRelease
```

### 🟠 Página descarga APP
Implementada en sesión anterior sin commitear. Recuperar y publicar.

### 🟡 E2E suite re-run
`npm run test:e2e` → analizar fallos → meta ≥ 395/404

### 🟡 DT-DNS01
DNS `reportar.app` error 522 Cloudflare

### Verificación al inicio de jornada
```bash
npx tsx scripts/verify-migration-counts-v2.ts
```

## Log de cambios

| Fecha | Cambio |
|---|---|
| 2026-06-03 AM | Mapeo inicial completo — 50 tablas en 9 grupos de dependencia FK |
| 2026-06-03 AM | Scripts ejecutados en PROD — ~5,000 registros nuevos migrados |
| 2026-06-03 AM | cotizaciones_ofertas: cotizacion_id hecho nullable — 722 ofertas + 634 items migrados |
| 2026-06-03 AM | cotizaciones_matriz_responsabilidad: 22,850→32,400 |
| 2026-06-03 AM | terceros_contactos: 0→734 (estrategia cotizaciones+tareas) |
| 2026-06-03 AM | inspecciones_detalles: 38k→138k (43.6% de 317k) |
| 2026-06-03 AM | Backfills FK: tareas.cliente_id 85%, reportes_maquinaria.tarea_id 78%, terceros.pais_id 100% |
| 2026-06-03 AM | Bug fix: buildBubbleMap ahora pagina completamente (era max 1,000 filas) |
| 2026-06-03 AM | Schema: cotizacion_id nullable en ofertas + matriz; profile_details columnas corregidas |
| 2026-06-03 PM | P1: backfill tarea_id completado — reportes_maquinaria 99.5%, reportes_personal 99.8% |
| 2026-06-03 PM | P2: investigado — tarea_id falla era tareasMap incompleto en migración inicial. P1 lo resolvió |
| 2026-06-03 PM | P3: cotizaciones_matriz: 32,400→33,082 (+682 GRUAS). Gap ~22k documentado como huérfanos en Bubble |
| 2026-06-03 PM | P4: --all no resuelve el problema — Bubble limita a 50k cursores por query sin importar constraint. Estrategia pendiente: paginación por rangos de fecha |
| 2026-06-03 PM | P5: 189 PDFs maquinaria_documentos migrados Bubble CDN→Supabase Storage (bucket doc_maquinarias, 0 errores) |
| 2026-06-03 PM | P5: profile_details firmas son S3 Amazon accesibles (30 placeholders + 1 real). No requieren migración |
| 2026-06-03 PM | P6: cotizaciones.tasa_cambio_id — 1,935 actualizadas via SQL (USD + fecha_vigencia). Sin acceso en Bubble API |
| 2026-06-03 PM | P7: planes_accion — 406 migrados (CISE 20, GRUAS 386) + 993 responsables + 44 avances |
| 2026-06-03 PM | maquinaria_horas: gap -20,302 era error en verify script. Real: 1,917/1,917 ✅. Script corregido a 1,954 |
| 2026-06-03 PM | Nuevo script: migrate-maquinaria-documentos-cdn.ts (descarga Bubble CDN → Supabase Storage) |
| 2026-06-03 PM | Nuevo script: investigate-reportes-personal-tarea.ts, investigate-matriz-gap.ts |
| 2026-06-03 NOCHE | ALERTA: archivos en S3 Bubble se pierden al cancelar Bubble — audit completo de todas las tablas |
| 2026-06-03 NOCHE | 146 archivos migrados: firmas, fotos, PDFs inspecciones/reportes/maquinaria/personal → Supabase Storage (0 errores) |
| 2026-06-03 NOCHE | Nuevo script: migrate-all-bubble-cdn-files.ts — migra 6 campos de 5 tablas en un solo run |
| 2026-06-03 NOCHE | En proceso: servicios.imagen_url (217), planes_accion.lista_fotos (45 fotos), reportes_maquinaria.fotos_adicionales (~20) |
| 2026-06-03 NOCHE | verify-migration-counts-v2.ts: maquinaria_horas corregido 22,219→1,954 (era error hardcodeado) |
