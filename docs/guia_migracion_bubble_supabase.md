# Guía de Migración y Sincronización de Datos (Bubble -> Supabase)

Este documento detalla el paso a paso para migrar todos los módulos desde Bubble a Supabase. Se han desarrollado scripts específicos para cada fase que manejan la **lectura de datos**, **transformación**, **inserción/actualización (Upsert)** y **migración de archivos**.

## 📋 Prerrequisitos

1. **Configuración de Entorno**: Archivo `.env.local` con credenciales de Supabase y Bubble.
2. **Orden de Ejecución**: Es vital respetar el orden de las fases para satisfacer las dependencias (Relaciones Foreign Key).
3. **Idempotencia**: Todos los scripts pueden ejecutarse múltiples veces. Si un registro ya existe (identificado por `bubble_id`), se actualizará con la data más reciente.

---

## 🚀 Fases de Migración

### Fase 1: Usuarios y Perfiles

Migración de cuentas de usuario y perfiles asociados.

- **Objetivo**: Crear usuarios en `auth.users` y sus perfiles en `public.profiles`.
- **Script**: `npx tsx scripts/migrate-users.ts`
- **Script (Detalles)**: `npx tsx scripts/migrate-profile-details.ts` (Opcional, si hay campos extra).
- **Verificación**: Revisar en tabla `profiles` que los usuarios tengan `bubble_id` y `tenant_id` asignado.

#### 1.a — Parche: Personal Externo (Contratistas) *(ejecutar después de Fase 3)*

Algunos usuarios de Bubble son personal de terceros/proveedores (`personal_contratista = true`).
Su `Id_tenant` en Bubble apunta al tercero que los emplea (no a CISE/GRUAS).

- **Schema**: `supabase/migrations/20260501200000_add_personal_externo_to_profiles.sql`
  - Agrega `personal_externo BOOLEAN`, `tercero_bubble_id TEXT`, `tercero_id UUID → terceros(id)` a `profiles`.
- **Dependencia**: Fase 3 debe estar completa (los terceros necesitan `bubble_id` en Supabase).
- **Dry-run**: `npx tsx scripts/patch-profiles-personal-externo.ts --dry-run`
- **Aplicar**: `npx tsx scripts/patch-profiles-personal-externo.ts`
- **Qué hace**:
  1. Carga todos los users de Bubble donde `personal_contratista = true`.
  2. Resuelve `Id_tenant` (Bubble ID del tercero) → `tercero_id` + `tenant_id` en Supabase.
  3. Actualiza `profiles` con `personal_externo = true`, `tercero_bubble_id`, `tercero_id` y corrige el `tenant_id`.
- **Verificación**: En la tabla `profiles` filtrar `personal_externo = true`; cada fila debe tener `tercero_id` poblado.

### Fase 2: Catálogos del Sistema

Listas desplegables y configuraciones base.

- **Objetivo**: Poblar tablas maestras (`rubros`, `plazos_pago`, `paises`, `ubigeo`, `bancos`).
- **Script**: `npx tsx scripts/migrate-batch1.ts`
- **Nota**: Este script migra múltiples listas de Bubble (`ConfiguracionOpcionesListas`) a sus respectivas tablas en Supabase. También carga `Paises` y `Ubigeo` estáticos.

### Fase 3: Terceros (Clientes y Proveedores)

Base de datos de empresas externas.

- **Objetivo**: Migrar `terceros`, `terceros_contactos`, `terceros_sitios` y `terceros_personal`. Incluye Logos, Firmas y Fotos.
- **Dependencia**: Fase 2 (Rubros, Paises).
- **Script**: `npx tsx scripts/migrate-terceros-bubble.ts`
- **Almacenamiento**:
  - Logos: `[Tenant]/[Tercero]/logo/`
  - Personal: `[Tenant]/[Tercero]/foto/` o `firma/`

### Fase 4: Maquinaria

Flota de equipos y sus documentos.

- **Objetivo**: Migrar `maquinaria_modelos`, `maquinarias` (equipos), `maquinaria_tipos_docs` y metadatos de documentos.
- **Dependencia**: Fase 3 (Proveedores de maquinaria).
- **Script (Data)**: `npx tsx scripts/migrate-maquinaria-bubble.ts`
- **Script (Archivos)**: `npx tsx scripts/migrate-maquinaria-files.ts`
- **Almacenamiento**:
  - Fotos: `[Tenant]/[Maq]/foto/`
  - Docs: `[Tenant]/[Maq]/[TipoDoc]/`

### Fase 5: Servicios

Catálogo de servicios ofrecidos.

- **Objetivo**: Migrar el catálogo de servicios (`servicios` y `servicios_tipos`) incluyendo imágenes referenciales.
- **Script**: `npx tsx scripts/migrate-services.ts`
- **Script (Imágenes)**: `npx tsx scripts/migrate-servicios-images.ts` (Ejecutar después para asegurar descarga correcta de imágenes).

### Fase 6: Cotizaciones (Comercial)

Gestión de ofertas comerciales.

- **Objetivo**: Migrar cabeceras (`cotizaciones`), detalles (`cotizaciones_detalle`) y configuración comercial (`cotizaciones_configuracion`).
- **Dependencia**: Fase 3 (Clientes), Fase 5 (Servicios).
- **Script**: `npx tsx scripts/migrate-cotizaciones-bubble.ts`
- **Nota**: Este script descarga automáticamente el PDF generado en Bubble y lo adjunta a la cotización en Supabase.
- **Almacenamiento**: `[Tenant]/[Cliente]/[Año]/[Archivo].pdf`

### Fase 7: Reportes Maquinaria (Partes de Máquina)

Registro de horómetros y actividad de equipos.

- **Objetivo**: Migrar los reportes de uso de maquinaria (`reportes_maquinaria`).
- **Dependencia**: Fase 4 (Maquinaria), Fase 1 (Operadores), Fase 6 (Cotizaciones).
- **Script primario (tenants filtrados)**: `npx tsx scripts/migrate-reportes-maquinaria-filtered.ts`
  - Solo migra CISE y GRUAS (filtra por `tenant_id` en Bubble).
  - Bubble type: `Maquinaria_reporte_horas_new`
  - **Conteos verificados** (2026-05-25): CISE 5,361 · GRUAS 15,317 → ~20,678 total
- **Script alternativo (MIG-6)**: `npx tsx scripts/migrate-reportes-mig6.ts --step=migrate-maq`
  - Incluye URLs de archivos Supabase Storage (preserva si ya están migradas).
- **Script (Limpieza de duplicados)**: `npx tsx scripts/migrate-reportes-mig6.ts --step=clean-maq`
- **Validación**: `npx tsx scripts/migrate-reportes-mig6.ts --step=inspect`

> ⚠️ **FK pendiente**: Las columnas `valorizacion_compra_id` / `valorizacion_venta_id` se añadieron a `reportes_maquinaria` el 2026-05-25, pero el backfill devuelve 0 matches. Los IDs en el campo TEXT `valorizacion_venta` de Bubble no coinciden con `valorizaciones.bubble_id`. Requiere investigación adicional antes del cutover.

### Fase 8: Reportes Personal (Control de Horas Personal)

Registro de horas hombre y gastos de personal de campo (CISE y GRUAS).

> ⚠️ **IMPORTANTE — Corrección 2026-05-25**: El nombre del tipo Bubble para esta tabla **NO** es `personal-reporte-horas` (devuelve 404). Es `usuario-reporte-horas-new`, el **mismo tipo** que `reportes_usuario`. La distinción es que este es el tipo que usa la APP en producción (`lib/actions/reportes.ts`, endpoints `/api/reportes-personal/`). `reportes_usuario` es una tabla legacy solo usada en scripts de migración.

- **Objetivo**: Migrar los reportes de horas de personal (`reportes_personal`).
- **Dependencia**: Fase 1 (Profiles/`id_autor`), Fase 7 (Tareas opcionales).
- **Bubble type**: `usuario-reporte-horas-new`
- **Campo tenant en Bubble**: `id_empresa` (NO es `tenant_id`)
- **Campo trabajador en Bubble**: `id_autor` → `personal_id` (NO es `id_usuario` ni `id_personal`)
- **Campo PDF en Bubble**: `archivo_pdf` (NO es `pdf_url`)
- **Script**: `npx tsx scripts/migrate-reportes-personal.ts --step=migrate`
- **Verificación previa**: `npx tsx scripts/migrate-reportes-personal.ts --step=inspect`
- **Conteos verificados** (2026-05-25):
  - CISE: 12,050 registros · GRUAS: 14,707 registros → **26,757 total, 0 errores**
  - `personal_id` resuelto: 26,750 / 26,757 (99.97%)
  - `tarea_id` resuelto: 26,704 / 26,757 (99.8%)
  - `pdf_url` presente: 24,253 / 26,757 (90.7%)

#### 8.a — Parche tarea_id en reportes_personal *(ejecutar si hay NULLs en tarea_id)*

```bash
npx tsx scripts/patch-tarea-id-links.ts --table=reportes_personal
```

Bubble field: `tarea_id` · Tenant field: `id_empresa`

### Fase 9: Facturación y Finanzas

Histórico de ventas y compras.

- **Objetivo**: Migrar facturas de venta, compra y sus pagos (`facturas_venta`, `facturas_compra`, `pagos`).
- **Dependencia**: Fase 3 (Clientes/Proveedores), Fase 7/8 (Reportes origen).
- **Script**: `npx tsx scripts/migrate-finance-tables.ts`
- **Script (Items)**: `npx tsx scripts/migrate-facturas-items.ts` (items de facturas con FK a cotizaciones_detalle)
- **Script (Archivos)**: `npx tsx scripts/migrate-finance-files.ts` (PDFs de facturas).

---

## 🩹 Parches Post-Migración

Scripts correctivos que resuelven problemas de FK cuando las fases se ejecutaron fuera de orden
o cuando Bubble no tenía el campo poblado en registros históricos.

### Parche A — tarea_id en inspecciones y reportes *(2026-05-01)*

**Problema:** `tarea_id` queda `NULL` en `inspecciones`, `reportes_maquinaria` y `reportes_personal`
cuando los registros se migraron antes de que la tabla `tareas` estuviese poblada con `bubble_id`.

**Script**: `scripts/patch-tarea-id-links.ts`

```bash
# Ver cuántos registros tienen tarea_id=NULL y cuántos son recuperables
npx tsx scripts/patch-tarea-id-links.ts --dry-run

# Aplicar solo una tabla
npx tsx scripts/patch-tarea-id-links.ts --table=inspecciones
npx tsx scripts/patch-tarea-id-links.ts --table=reportes_maquinaria
npx tsx scripts/patch-tarea-id-links.ts --table=reportes_personal

# Aplicar todas las tablas
npx tsx scripts/patch-tarea-id-links.ts
```

**Lógica:**

1. Construye `tareasMap` (Bubble ID → Supabase UUID) desde la tabla `tareas`.
2. Para cada tabla: trae filas con `tarea_id IS NULL AND bubble_id IS NOT NULL`.
3. Consulta Bubble para obtener el campo `id_tarea` / `tarea_id` del registro original.
4. Hace `UPDATE` solo en los registros donde la FK se puede resolver.

**Campos Bubble por tabla:**

| Tabla Supabase        | Tipo Bubble                    | Campo tarea en Bubble | Campo tenant en Bubble |
| --------------------- | ------------------------------ | --------------------- | ---------------------- |
| `inspecciones`        | `informes`                     | `id_tarea`            | `id_empresa`           |
| `reportes_maquinaria` | `Maquinaria_reporte_horas_new` | `tarea_id`            | `tenant_id`            |
| `reportes_personal`   | `usuario-reporte-horas-new`    | `tarea_id`            | `id_empresa`           |

**Resultado esperado (2026-05-01):**

- `inspecciones`: 683 registros con `tarea_id=NULL` son datos históricos sin `id_tarea` en Bubble — no recuperables por diseño.
- `reportes_maquinaria`: 19 registros CISE recuperados. 110 son históricos sin tarea en Bubble.
- `reportes_personal`: 0 registros con `tarea_id=NULL` — migración perfecta.

**Dependencia:** Fase 6 (Tareas) debe estar completa con `bubble_id` poblado.

---

### Parche B — personal_externo en profiles *(2026-05-01)*

Ver **Fase 1.a** arriba.

---

### Parche C — Columnas FK UUID en reportes_maquinaria *(2026-05-25)*

**Problema:** `reportes_maquinaria` tenía `valorizacion_venta`, `valorizacion_compra`, `factura_compra_item` y `factura_venta_item` como campos TEXT con Bubble IDs crudos en lugar de FKs UUID reales.

**Migración aplicada** (`supabase/migrations/`):
```sql
ALTER TABLE public.reportes_maquinaria
  ADD COLUMN IF NOT EXISTS valorizacion_compra_id UUID REFERENCES public.valorizaciones(id),
  ADD COLUMN IF NOT EXISTS valorizacion_venta_id  UUID REFERENCES public.valorizaciones(id),
  ADD COLUMN IF NOT EXISTS factura_compra_item_id UUID REFERENCES public.facturas_compra_item(id),
  ADD COLUMN IF NOT EXISTS factura_venta_item_id  UUID REFERENCES public.facturas_venta_item(id);
```

**Estado backfill** (2026-05-25):
- `factura_compra_item_id` / `factura_venta_item_id`: ✅ ~42,000 filas resueltas.
- `valorizacion_compra_id` / `valorizacion_venta_id`: ⚠️ **0 matches** — los IDs Bubble en `reportes_maquinaria.valorizacion_venta` no coinciden con `valorizaciones.bubble_id`. Pendiente de investigación.

**Script de backfill** (ya ejecutado, puede re-ejecutarse):
```sql
UPDATE reportes_maquinaria rm
SET factura_compra_item_id = fci.id
FROM facturas_compra_item fci
WHERE rm.factura_compra_item = fci.bubble_id AND rm.factura_compra_item_id IS NULL;

UPDATE reportes_maquinaria rm
SET factura_venta_item_id = fvi.id
FROM facturas_venta_item fvi
WHERE rm.factura_venta_item = fvi.bubble_id AND rm.factura_venta_item_id IS NULL;
```

---

### Parche D — foto_url y pin en terceros_personal *(2026-05-25)*

**Problema:** La tabla `terceros_personal` carecía de las columnas `foto_url` y `pin`.

**Migración aplicada** (`supabase/migrations/20260525000000_terceros_personal_foto_pin.sql`):
```sql
ALTER TABLE public.terceros_personal ADD COLUMN IF NOT EXISTS foto_url TEXT;
ALTER TABLE public.terceros_personal ADD COLUMN IF NOT EXISTS pin TEXT;
```

---

### Parche E — Seguridad en scripts de migración *(2026-05-25)*

**Problema:** Varios scripts tenían el `BUBBLE_API_TOKEN` hardcodeado en el código fuente.

**Scripts corregidos** (ahora usan `process.env.BUBBLE_API_TOKEN` con validación):
- `scripts/migrate-facturas-items.ts`
- `scripts/migrate-reportes-maquinaria-filtered.ts`
- `scripts/migrate-cotizaciones-fix.ts`
- `scripts/migrate-reportes-mig6.ts`
- `scripts/migrate-user-reports-data.ts`

Todos lanzan `throw new Error('BUBBLE_API_TOKEN env var is required')` si el token no está en `.env.local`.

---

## 🔄 Sincronización Continua

Para mantener los datos actualizados tras cambios en Bubble:

1. Identificar el módulo afectado.
2. Ejecutar el script correspondiente a la fase (Ej: Si cambió un Cliente, correr `migrate-terceros-bubble.ts`).
3. El script detectará el ID y actualizará los campos o archivos necesarios.

## ⚠️ Checklist de Validación

Al finalizar cada fase, verifica:

- [ ] Conteo de registros en Supabase vs Bubble.
- [ ] Que no existan errores de Foreign Key en la consola.
- [ ] Que los archivos críticos (PDFs recientes) se puedan abrir desde la URL generada.

---

## 📊 Estado de Migración al 2026-05-25

| Tabla Supabase | Bubble Type | Registros Supabase | Estado |
|---|---|---|---|
| `profiles` | `User` | ~616 | ✅ Completo |
| `terceros` | `Empresa` | — | ✅ Completo |
| `terceros_contactos` | `Contacto` | — | ✅ Completo |
| `terceros_sitios` | `Sitio` | — | ✅ Completo |
| `terceros_personal` | `Personal` | — | ✅ Completo (+ `foto_url`, `pin` 2026-05-25) |
| `maquinarias` | `Maquinaria` | 267 | ✅ Completo |
| `tareas` | `Tarea` | 14,391 | ✅ Completo |
| `cotizaciones` | `cotizaciones` | — | ✅ Completo |
| `cotizaciones_detalle` | — | — | ✅ Completo |
| `reportes_maquinaria` | `Maquinaria_reporte_horas_new` | ~20,678 | ✅ Completo (FKs UUID añadidas, valorizacion pendiente) |
| `reportes_personal` | `usuario-reporte-horas-new` | **26,757** | ✅ **Migrado 2026-05-25** |
| `facturas_venta` | — | 2,595 | ✅ Completo |
| `facturas_venta_item` | — | 19,742 | ✅ Completo |
| `facturas_compra` | — | 1,145 | ✅ Completo |
| `facturas_compra_item` | — | 19,367 | ✅ Completo |
| `valorizaciones` | `maquinaria_horas-valorizaciones` | — | ✅ Completo |

### 🔴 Ítems pendientes para el cutover

| # | Descripción | Impacto | Script / Acción |
|---|---|---|---|
| 1 | `valorizacion_compra_id` / `valorizacion_venta_id` en `reportes_maquinaria` con 0 matches | **Bajo** (ver diagnóstico) | Ver "Diagnóstico X2" abajo |
| 2 | `patch-tarea-id-links.ts` — re-ejecutar sobre `reportes_personal` post-migración | Bajo — mayoría ya tiene tarea_id | `npx tsx scripts/patch-tarea-id-links.ts --table=reportes_personal` |
| 3 | Verificar `contactos_cargo` / `contactos_area` seeds | Bajo — dropdowns vacíos en UI | Ver `plan-post-cutover.md` DT-MIG01 |

### Diagnóstico X2 — FK valorizaciones (2026-07-23, sondeo Bubble LIVE)

**Causa raíz encontrada:** la migración intentó mapear desde un campo `reportes_maquinaria.valorizacion_venta`
(TEXT) que **no existe en el tipo Bubble** `Maquinaria_reporte_horas_new` (sus keys no incluyen
valorizacion_venta/compra). El vínculo real es **inverso**: el tipo `maquinaria_horas-valorizaciones`
(758 registros, todos `estado=ENVIADO`, de ~2021) tiene el campo **`id_maquinaria_horas`** que apunta
al reporte. Por eso el match por `valorizaciones.bubble_id` daba 0.

**Segundo hallazgo:** esos 758 `id_maquinaria_horas` apuntan a reportes que **ya no existen en Bubble
live** (GET → 404; no hay tipo legacy `Maquinaria_reporte_horas`). Son valorizaciones huérfanas de 2021.
No hay distinción venta/compra en los datos (todo un solo flujo; `tipo_precio` es la base de precio:
Por Hora/Jornada/Servicio/etc., no venta vs compra).

**Impacto: BAJO.** Solo 758 valorizaciones, antiguas y huérfanas. La tabla `valorizaciones` de Supabase
sí tiene los datos; lo único ausente es el FK `reportes_maquinaria.valorizacion_*_id` para esas filas.

**Recomendación:** NO bloquear el cutover. Si se quiere el link, hacerlo **del lado Supabase**:
`UPDATE reportes_maquinaria rm SET valorizacion_venta_id = v.id FROM valorizaciones v
WHERE v.id_maquinaria_horas = rm.bubble_id` (Supabase puede conservar reportes históricos que Bubble
live ya borró, así que algunos resolverán aunque el GET live falle). Correr como dry-run/conteo primero.
Requiere que `valorizaciones` tenga la columna `id_maquinaria_horas` migrada (verificar).

### 🟡 Deuda técnica (no bloquea cutover)

| # | Descripción | Doc |
|---|---|---|
| DT-001 | PDF Planificación — botón + endpoint Gotenberg | `docs/DEUDA_TECNICA.md` |
| DT-002 | PDF Panel Valoraciones/Facturación — Gotenberg | `docs/DEUDA_TECNICA.md` |
| DT-003 | `valorizacion_venta/compra_id` backfill 0 matches | Ver Parche C arriba |
