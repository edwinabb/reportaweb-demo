# Plan 2026-07-15 — Módulo 2: Maquinaria

**Contexto:** Módulo 1 (Usuarios) CERRADO el 2026-07-14 con v3.11.0 desplegada en demo.
**Avance auditoría:** 1/15 módulos ✅ — tracker en [UI-TEMPLATE-LISTADOS.md](../UI-TEMPLATE-LISTADOS.md)

---

## Estado al cierre del 2026-07-14

- ✅ v3.11.0 en demo.reportar.app (BD TEST `oyrokyyaeaeqzlsgxtto`, seed sintético)
- ✅ Pipeline de deploy demo FUNCIONANDO: push a `demo/master` → Cloudflare build
  (`npm run build:demo && npx opennextjs-cloudflare build`) → deploy
  (`npx wrangler deploy --config wrangler.demo.toml`, worker `reportaweb-demo`)
- ✅ Template estándar v1.2 DEFINIDO y validado por el usuario
- ✅ Vista "Depurar vencidos" aprobada (orden de grupos confirmado OK)
- ✅ Seed reutilizable: `scripts/seed-demo-db.ts` (local, no versionado)

## Objetivo de mañana

**Auditar el Módulo 2 (Maquinaria) y aplicar el template estándar a sus listados.**

### Prerrequisito (usuario)
- [ ] Screenshots de Bubble en `c:/tmp/screenshots/reportar/2 maquinaria/`
  (lista, crear/editar, menú de acciones, filtros)

### Proceso (probado en Usuarios — 6 pasos)

1. **Matriz de auditoría** → `docs/auditoria-ui/02-maquinaria.md`
   Mapeo Bubble → reportaweb3: Elemento | Campo Bubble | Tabla.columna | UI nueva | Dato migrado | Status.
   Sub-módulos esperados: Maquinarias (`/maquinarias`), Modelos/Equipos, Documentos de maquinaria, Configuración (`/settings/maquinaria`).
   Tablas BD: `maquinarias`, `maquinaria_modelos`, `maquinaria_documentos`, `maquinaria_tipos_docs`, `maquinaria_horas`, `reportes_maquinaria`.

2. **Queries de cobertura en BD PROD** — SOLO tenants CISE + GRUAS (regla crítica).

3. **DUDAs al usuario** — preguntar, no inferir.

4. **Tickets** (CRÍTICO / MEDIA / BAJA) — gaps de datos y de UI.

5. **Aplicar template estándar v1.2** (ver resumen abajo) a los listados de maquinaria.

6. **Validación final** — checklist + screenshots comparativos + sign-off
   (plantilla: `VALIDATION-CHECKLIST-TEMPLATE.md`) → actualizar tracker a 2/15.

---

## Template estándar v1.2 (aplicar a Maquinaria)

> Fuente completa: [docs/UI-TEMPLATE-LISTADOS.md](../UI-TEMPLATE-LISTADOS.md)

```
║ Breve descripción de la página… (sin path, sin título)                   ║
║ ┌─ tarjeta blanca ─────────────────────────────────────────────────────┐ ║
║ │ [Buscar…]              [Extras] [Activos|Papelera] [↓XLS] [+ Nuevo] │ ║
║ └──────────────────────────────────────────────────────────────────────┘ ║
║ HEADER GRIS (bg-muted/50) │ sin ordenar │ embudos ▼ en cols tipificadas  ║
║ (sin columna Estado; nombre en ROJO si inactivo)                         ║
║ N registro(s) │ Filas por página [10▾] │ Página X de Y │ ⏮ ◀ ▶ ⏭         ║
```

**Componentes listos para reutilizar:**
- `components/ui/column-filter-header.tsx` (embudo)
- `components/ui/table-pagination-bar.tsx` (paginación manual/server)
- `lib/utils/export-excel.ts` (XLS estándar `PAGINA-AAAA-MM-DD-HH-MM.xls`)
- `components/ui/page-description.tsx`
- `components/ui/data-table.tsx` (ya trae toolbar-tarjeta + header gris + paginación)

**Páginas de referencia:** `/users` (tanstack), `/settings/document-types` (tabla manual), `/users/documents` (server-side URL params).

⚠️ **Lección del módulo 1:** verificar SIEMPRE qué componente renderiza la ruta
(`page.tsx` → imports) antes de editar — en Usuarios se editaron archivos huérfanos.

---

## Pendientes (backlog fuera de Maquinaria)

| Pendiente | Prioridad | Nota |
|-----------|-----------|------|
| Rotar SERVICE_ROLE_KEY de PROD | ALTA | DUDA-SEC-001 — estuvo en git |
| Actualizar suite E2E al template v1.2 | ALTA | DUDA-E2E-001 — antes de release a live |
| Configurar deploy live.reportar.app | ALTA | Worker `reportaweb-live` + build:live + wrangler.live.toml + Secrets |
| Migrar cron jobs Vercel → Cloudflare | MEDIA | Pendiente desde cutover Cloudflare |
| Cache Opción B (stale-while-revalidate) | MEDIA | DUDA-CACHE-001 — medir métricas semana 07-21 |
| Migrar xlsx | MEDIA | DUDA-DEPS-001 |
| middleware→proxy | BAJA | DUDA-DEPS-002 — bloqueado por OpenNext |

> Detalle: [docs/TECHNICAL_DEBTS.md](../TECHNICAL_DEBTS.md)
