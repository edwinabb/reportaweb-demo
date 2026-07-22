# Auditoría de código muerto — 2026-07-21

**Alcance:** `app/` + `components/` + `lib/` (+ señales de knip sobre todo el repo).
**Método:** knip (entiende convenciones Next.js) → verificación cruzada por búsqueda de
referencias reales (externas + internas + imports dinámicos/relativos).
**Regla de oro:** ⚠️ el análisis estático da falsos positivos en ambos sentidos. **Ningún
ítem se borra sin pasar `npm run build` (tsc) como gate final.** Esta lista es el candidato,
no la orden de borrado.

Contexto de sesión: en paralelo hay rotación de key PROD + deploy live en curso, y el
cluster `terceros_personal` está atado a DUDA-TER-006 y DUDA-E2E-001. No mezclar.

---

## ✅ Ya ejecutado
- Borrado archivo basura `C⟨U+F03A⟩Proyectosreportaweb3libactionscatalogs-validation.ts`
  (stub `// Force rebuild`, 31 bytes, trackeado, sin secretos) — `git rm`, staged.

---

## 🟢 Tier A — Exports sin uso (0 refs externas + 0 refs internas)
Server actions / helpers exportados que **nada importa y nada llama internamente**.
Candidatos fuertes a eliminar (o des-exportar). Verificar con build.

| Archivo | Símbolos muertos |
|---|---|
| `lib/actions/cotizaciones.ts` | `getHistoricoCotizaciones`, `updateNotasInternas`, `markPDFGenerated`, `notificarPlanner`, `updateCotizacionPDFConfig`, `guardarPrecioNegociado`, `guardarPreciosDetalleLote` |
| `lib/actions/epp.ts` | `calcularFechaVencimiento` |
| `lib/actions/inspecciones.ts` | `getInspeccionesByTarea` |
| `lib/actions/planificacion.ts` | `updateTarea` |
| `lib/actions/terceros.ts` | `fixTercerosConsistency` |
| `lib/actions/compras.ts` | `setPrecioPorDiaReporteCompra` |
| `lib/actions/tasas-cambio.ts` | `getTasaCambioVigente` |
| `lib/actions/reportes.ts` | `createTareaRecurso`, `deleteTareaRecurso` |
| `lib/actions/maquinaria-models.ts` | `updateMaquinariaModelo` |
| `lib/actions/document-types.ts` | `deleteDocumentType` |
| `lib/actions/permisos.ts` | `getSistemaRecursos` |
| `lib/actions/ventas.ts` | `setPrecioPorDiaReporte` |
| `lib/actions/maquinaria-docs.ts` | `getGlobalDocuments` |
| `lib/actions/tareas.ts` | `updateTareaEstado`, `updateTareaProgreso` (⚠️ `getTareas`/`createTarea`/`deleteTarea` del mismo archivo SÍ se usan) |
| `lib/utils/tz.ts` | `nowTimeInTZ`, `nowISOwithOffset`, `formatTimeInTZ` (otras funciones del archivo se usan internamente) |
| `lib/epp-email-templates.ts` | `renderCotizacionConfirmadaEmailHtml` |
| `lib/sentry/index.ts` | `sentryHeader` (⚠️ `seccionDesdePath` se usa internamente, NO borrar) |

**Nota:** varios (`notificarPlanner`, `updateTarea`, `markPDFGenerated`…) pueden ser stubs de
features planeadas pero sin cablear. Confirmar con el owner antes de borrar por si son "todavía no".

---

## 🟢 Tier B — Archivos completos sin importar (unique basename, 0 imports en todo el repo)
Verificados contra imports estáticos, dinámicos y relativos. Candidatos a borrar enteros.

- `components/common/catalogo-creation-dialog.tsx`
- `components/cotizaciones/servicio-list.tsx`
- `components/cotizaciones/tasa-cambio-list.tsx`
- `components/cotizaciones/view-toggle.tsx`
- `components/formatos/checklist-gruas-form.tsx`
- `components/formatos/formatos-columns.tsx`
- `components/formatos/formatos-table.tsx`
- `components/maquinaria/global-documents-list.tsx`
- `components/planificacion/nueva-tarea-wizard.tsx`
- `components/settings/simple-catalog-manager.tsx`
- `components/tareas/tareas-columns.tsx`
- `components/ui/data-table-column-filter.tsx`
- `lib/actions/dashboard.ts`
- `lib/actions/delete-user.ts`
- `lib/actions/catalogs-validation.ts` (el real; el fantasma ya se borró)
- `app/(dashboard)/settings/users/job-titles-trigger.tsx`
- `app/(dashboard)/terceros/contactos/contactos-cell-action.tsx`
- `tests/verify-registro.ts`

---

## 🟡 Tier C — Señales en conflicto → requieren build check individual
La verificación estática dio resultados contradictorios (imports dinámicos/relativos).
NO borrar sin removerlos uno a uno + `npm run build`.

- `components/tareas/tarea-dialog.tsx` — un check lo dio usado por `components/reportes/*-dialog.tsx`, otro DEAD.
- `components/terceros/personal-dialog.tsx` — usado por `components/reportes/reportes-personal-section.tsx` según un check.

---

## 🔴 Tier D — NO tocar (falsos positivos confirmados)
- **Convención Next.js:** todos los `loading.tsx` (`Loading()`), `page.tsx`, `layout.tsx`, `metadata`.
- **Playwright:** `tests/auth/setup-*.ts` → son project-dependencies en `playwright.config.ts:36-88`.
- **Tooling build/deploy:** `open-next.config.ts`, dep `@opennextjs/cloudflare`, `pg`, `dotenv`, `tsx`, `supabase`, `postcss` (el deploy live depende de ellos; no se importan en código).
- **Supabase Edge Functions:** `supabase/functions/fk-audit/index.ts`, `supabase/functions/onboarding-copy-defaults/index.ts` → se despliegan aparte a Supabase e invocan por HTTP/trigger, NO por import. knip no las ve.
- **shadcn/ui:** exports sin uso en `components/ui/*` (`CardAction`, `SelectSeparator`, `TableFooter`, `AvatarImage`, `DialogPortal`, etc.) → biblioteca completa a propósito.
- **columns.tsx de listados** (`maquinarias/modelos`, `terceros/contactos|personal|sitios`) → usados por `maquinaria-table.tsx` / `terceros-table.tsx`.
- **`components/formatos/inspeccion-pdf.tsx`** → import dinámico en `app/api/inspecciones/*` y `app/api/cron/pdf-jobs`.
- **`lib/supabase.ts`** → usado por `lib/actions/formatos.ts`.

---

## 🟠 Tier E — Cluster `terceros_personal` (personal externo deprecado)
Migrado a `profiles` (DUDA-TER-006). **Muerto funcionalmente pero entrelazado con la E2E
pendiente (DUDA-E2E-001).** Coordinar con esa deuda, NO borrar aislado.
- `lib/actions/terceros-modules.ts`: `getTerceroPersonal`, `restoreTerceroPersonal` (0 refs);
  `createTerceroPersonal`/`updateTerceroPersonal`/`deleteTerceroPersonal` aún referenciados por
  `personal-dialog.tsx`, `terceros/personal/columns.tsx`, flow 43 y `data-factory.ts`.
- Al reescribir el flow 43 con `profiles`, borrar todo el cluster de una.

---

## 🔵 Dependencias sin uso (PR aparte, bajo riesgo)
`axios`, `jspdf`, `html2canvas`, `uuid`, `@types/uuid`, `slugify`, `shadcn-ui`, `init`,
`@types/react-signature-canvas`, `@types/jszip`, `@types/pg`, `tw-animate-css`.
Verificar que ninguna se use vía import dinámico antes de sacarlas del `package.json`.

---

## Plan de ejecución sugerido
1. Rama `chore/dead-code-cleanup` (fuera del deploy live en curso).
2. Borrar Tier B + Tier A (des-exportar/eliminar) → `npm run build` → si pasa TS, commit.
3. Tier C: uno a uno con build entre cada uno.
4. Tier E: junto con la resolución de DUDA-E2E-001.
5. Deps: PR separado.
6. Tier D: dejar como está (documentado acá para no re-auditar).
