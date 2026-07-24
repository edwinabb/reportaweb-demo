# Plan de Cutover CISE + GRUAS (Bubble → Reportaweb3) — Implementación

> **Para workers agénticos:** cada módulo es una unidad de trabajo con su propio ciclo de
> auditoría → resolución → cierre. Los pasos usan checkbox (`- [ ]`) para tracking.
> Sub-skill recomendada para ejecutar cada módulo: `superpowers:subagent-driven-development`.

**Goal:** Dejar los 2 únicos tenants reales de Bubble (CISE + GRUAS) listos para operar 100%
en Reportaweb3 v3, cerrando los gaps de migración **a nivel campo** que revela la auditoría
UI ↔ datos, módulo por módulo, hasta poder apagar Bubble.

**Architecture:** El cutover NO es un paso único de "migrar tablas" — eso ya está ~95% hecho
(ver `docs/guia_migracion_bubble_supabase.md`). El bloqueante real son los **gaps de campo**
que solo aparecen comparando cada pantalla Bubble contra la UI nueva y su cobertura de datos
(ej. Terceros: rubro 0/678, ubicación 0/678, cargo/área 0/734). Por eso el cutover = completar
la **auditoría UI ↔ datos de los 15 módulos** con el proceso ya establecido (template v1.2),
resolver los críticos de cada uno, validar E2E y recién ahí apagar Bubble.

**Tech Stack:** Next.js 16 / React 19 / TypeScript · Supabase (PostgreSQL + Storage) ·
scripts `tsx` de migración (`scripts/migrate-*.ts`, idempotentes por `bubble_id`) ·
Bubble Data API (`BUBBLE_API_TOKEN` en `.env.local`) · Playwright (E2E).

## Global Constraints

- **Scope de tenants: SOLO CISE (`1cb97ec7-326c-4376-93ee-ed317d3da51b`) y GRUAS
  (`6f4c923a-c3b7-47c2-9dea-2a187f274f73`).** El inventario de Bubble (2026-07-22) confirmó
  que son los 2 únicos tenants reales; los otros dos tienen 20 y 2 registros (ruido/test) →
  NO migrar. Toda query de auditoría filtra por estos 2 tenant_id.
- **Idempotencia:** todo script de migración se puede re-ejecutar; upsert por `bubble_id`.
- **No borrar componentes/columnas "huérfanas" sin confirmación** — se listan como DUDA
  (regla ya acordada: DUDA-MAQ-012 / DUDA-TER-010).
- **Template de listados v1.2** (`docs/UI-TEMPLATE-LISTADOS.md`) es el estándar UI de cierre.
- **Verificación antes de afirmar cierre:** conteos Supabase vs Bubble + apertura real de la
  pantalla; nunca dar por cerrado un módulo sin la firma del usuario (§4 del template).
- **Migración medida contra Bubble LIVE**, no solo `version-test` (el inventario inicial fue
  de version-test; confirmar contra producción antes del go-live).

---

## El proceso por módulo (unidad repetible)

Cada módulo N sigue exactamente estos pasos. Es el proceso ya validado en Usuarios (piloto),
Maquinaria y Terceros. El entregable es `docs/auditoria-ui/NN-<modulo>.md` + tickets resueltos.

- [ ] **Paso 1 — Capturar screenshots de Bubble.** Guardar en
  `c:/tmp/screenshots/reportar/<N> <modulo>/` una captura por pantalla: lista (runtime),
  menú de fila, y cada paso de crear/editar. (Ya existen: usuarios, Maquinaria, Planificación,
  terceros. Faltan capturas para el resto.)
- [ ] **Paso 2 — Confirmar tablas y componentes usados.** Localizar en el código las rutas y
  componentes de la pantalla (`app/(dashboard)/<modulo>/...`, `lib/actions/<modulo>.ts`) y
  las tablas Supabase que consume. Anotar tabla.columna de cada campo.
- [ ] **Paso 3 — Confirmar procesos/flujos.** Documentar los flujos (alta, edición, acciones
  de fila, validaciones, re-autenticación PIN/firma si aplica) comparando Bubble vs nuevo.
- [ ] **Paso 4 — Medir cobertura de datos (solo CISE + GRUAS).** Query por cada campo clave:
  `SELECT count(*) filter (where <col> is not null) , count(*) FROM <tabla>
   WHERE tenant_id IN ('1cb97ec7-...','6f4c923a-...')`. Clasificar ✅ >80% / 🟡 10-80% / 🔴 <10%.
- [ ] **Paso 5 — Escribir la matriz** `docs/auditoria-ui/NN-<modulo>.md` con el formato del
  template v1.2 (columnas: Elemento · Campo Bubble · Tabla.columna · UI nueva · Dato migrado ·
  Status · Notas), la lista de gaps (migración/UI/dato), DUDAs y tickets clasificados
  🔴 CRÍTICO / 🟡 MEDIA / 🟢 BAJA.
- [ ] **Paso 6 — Resolver DUDAs con el usuario.** Priorizar las que bloquean tickets críticos.
- [ ] **Paso 7 — Ejecutar tickets 🔴 CRÍTICOS** (re-vinculaciones de migración de campo +
  data fixes). Cada uno con su script `tsx` idempotente o migración SQL, verificando conteos.
- [ ] **Paso 8 — Aplicar template v1.2** (tickets 🟡) a los listados del módulo.
- [ ] **Paso 9 — Revisar cambios y validar.** Correr el smoke E2E del módulo si existe; abrir
  la pantalla y confirmar que las columnas antes en "N/A" ahora muestran dato.
- [ ] **Paso 10 — Cierre firmado.** Completar §4 del `VALIDATION-CHECKLIST-TEMPLATE.md` con el
  sign-off del usuario y marcar el módulo en el tracker `docs/UI-TEMPLATE-LISTADOS.md`.

---

## Inventario de módulos y orden de ejecución

Orden propuesto (dependencias de datos primero): **catálogos → operación → comercial → finanzas**.
Los 🟢 ya cerrados no se reauditan salvo que aparezca un gap nuevo.

| # | Módulo | Screenshots | Auditoría | Estado |
|---|--------|-------------|-----------|--------|
| 1 | Usuarios | ✅ | `01-usuarios.md` | 🟢 Auditado (tickets fase 2 pendientes) |
| 2 | Maquinaria | ✅ | `02-maquinaria.md` | 🟢 Auditado |
| 3 | Terceros | ✅ | `03-terceros.md` | 🟢 Auditado — **críticos TK-T1..T5 sin ejecutar** |
| 4 | Planificación / Tareas | ✅ | `04-planificacion.md` | 🟢 Auditado (2026-07-23) — **TK-P1 espera aprobación DUDA-PLAN-001** |
| 5 | Configuración / Catálogos | ❌ | — | ⬜ Pendiente (define FKs de otros módulos) |
| 6 | Cotizaciones | ❌ | — | ⬜ Pendiente |
| 7 | Informes (Checklist·Maq·Personal·Gastos) | ❌ | — | ⬜ Pendiente |
| 8 | Planes de Acción | ❌ | — | ⬜ Pendiente |
| 9 | Gestión EPP | ❌ | — | ⬜ Pendiente |
| 10 | Ventas (Panel·Valoraciones·Facturas) | ❌ | — | ⬜ Pendiente |
| 11 | Compras (Panel·Valoraciones·Facturas) | ❌ | — | ⬜ Pendiente |
| 12 | Soporte | ❌ | — | ⬜ Pendiente |
| 13 | Panel de Control / Dashboard | ❌ | — | ⬜ DUDA D-01 (¿existe equivalente?) |
| 14 | Gestión Formatos | ❌ | — | ⬜ DUDA D-02 (¿visible a tenant?) |
| 15 | Perfil de Usuario | ✅ (en usuarios) | dentro de 01 | 🟢 Reorganizado |

**Fuente de verdad del avance:** `docs/auditoria-ui/00-sidebar.md` (mapeo) + tracker en
`docs/UI-TEMPLATE-LISTADOS.md`.

---

## Tareas transversales de cutover (independientes de los módulos)

Estas salen de `docs/guia_migracion_bubble_supabase.md` §"Ítems pendientes para el cutover" y
deben cerrarse antes del go-live, en paralelo a la auditoría por módulos.

### Task X1 — Confirmar inventario contra Bubble LIVE

- [ ] Adaptar `papelera/scripts/find-bubble-tenants.ts` para apuntar a Bubble **live**
  (URL `https://reporta.la/api/1.1/obj`, no `/version-test`) y re-correr.
- [ ] Correr también sobre la tabla maestra `Empresa` (no solo reportes de maquinaria) para
  descartar un tenant sin maquinaria.
- [ ] Verificado: solo CISE + GRUAS con datos reales en live. Si aparece otro tenant real →
  escalar al usuario (rompe scope), NO migrar por default.

### Task X2 — Resolver FK de valorizaciones en reportes_maquinaria (0 matches) — ✅ DIAGNOSTICADO 2026-07-23

**Causa raíz** (ver `guia_migracion_bubble_supabase.md §Diagnóstico X2`): el reporte Bubble no tiene
campo valorizacion_*; el link real es `maquinaria_horas-valorizaciones.id_maquinaria_horas → reporte`.
Las 758 valorizaciones (~2021, ENVIADO) son huérfanas (apuntan a reportes que ya no existen en live).
**Impacto BAJO — no bloquea cutover.**

- [x] Inspeccionado — dirección de FK invertida + valorizaciones huérfanas.
- [ ] (Opcional) Backfill Supabase-side: `UPDATE reportes_maquinaria rm SET valorizacion_venta_id=v.id
  FROM valorizaciones v WHERE v.id_maquinaria_horas = rm.bubble_id` (Supabase puede conservar reportes
  que Bubble live borró). Dry-run/conteo primero. Requiere `valorizaciones.id_maquinaria_horas` migrado.

### Task X3 — Re-ejecutar patch tarea_id en reportes_personal

- [ ] `npx tsx scripts/patch-tarea-id-links.ts --table=reportes_personal --dry-run`
- [ ] Aplicar si hay recuperables. Verificado: NULLs restantes son históricos sin `tarea_id`
  en Bubble (no recuperables por diseño).

### Task X4 — Seeds de catálogos vacíos (contactos_cargo / contactos_area / otros)

- [ ] Auditar dropdowns que salen vacíos en UI (empezar por `contactos_cargo`/`contactos_area`,
  ya identificados). Cruzar con lo que se resuelva en el módulo Configuración/Catálogos (#5).
- [ ] Poblar los faltantes con seed idempotente por tenant. Verificado: la UI muestra opciones.

### Task X5 — Archivos en Storage (PDFs / fotos / firmas)

- [ ] Auditar buckets vs Bubble por tenant: cotizaciones-pdf, facturas, logos GRUAS
  (DUDA-TER-014), firmas/fotos de personal. Contar archivos esperados vs presentes.
- [ ] Migrar faltantes con los scripts `migrate-*-files.ts` correspondientes (solo CISE/GRUAS,
  años recientes; años ≤2020 → negociar con cliente antes, ver `AUDITAR_BUBBLE_NO_MIGRADOS`).
- [ ] Verificado: URLs generadas abren el archivo.

---

## Gate de Go-Live (cutover real)

No se apaga Bubble hasta cumplir TODO esto:

- [ ] Los 15 módulos con auditoría cerrada y firmada (§4 template) o su gap explícitamente
  aceptado como no-bloqueante por el usuario.
- [ ] Tareas transversales X1–X5 cerradas y verificadas.
- [ ] Migración medida contra Bubble **LIVE** (no test) con conteos coincidentes por tabla.
- [ ] Suite E2E verde (`npm run test:e2e`) — actualizada tras template v1.2 (hoy desfasada,
  DUDA-E2E-001 en `TESTING.md`).
- [ ] Deploy a producción funcionando (worker `reportaweb-live` + dominio apex bindeado —
  hoy pendiente, ver `CLAUDE.md` § Estado Actual).
- [ ] Plan de corte comunicado a CISE y GRUAS (fecha, congelamiento de Bubble, ventana).

---

## Self-review (cobertura vs requisito del usuario)

- ✅ Screenshots de pantallas → Paso 1 del proceso por módulo + Task X (no aplica).
- ✅ Confirmar tablas usadas → Paso 2.
- ✅ Confirmar procesos → Paso 3.
- ✅ Revisar cambios y confirmar cierre de módulo → Pasos 9–10 + Gate de Go-Live.
- ✅ Scope solo CISE/GRUAS confirmado por inventario → Global Constraints + Task X1.
- ✅ Migración a nivel campo (no solo tablas) → Architecture + Pasos 4/7.

---

**Creado:** 2026-07-22 · **Basado en:** proceso auditoría UI ↔ datos (piloto Usuarios) +
`docs/guia_migracion_bubble_supabase.md` (2026-05-25) + inventario Bubble 2026-07-22.
