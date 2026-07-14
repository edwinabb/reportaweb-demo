# Spec: Auditoría UI ↔ Datos (Bubble → reportaweb3)

**Fecha:** 2026-07-14 · **Aprobado por:** usuario · **Piloto:** módulo Usuarios

## Problema

Tras el cutover (2026-05-30) hay páginas de reportaweb3 que no muestran toda la información
que mostraba el sistema Bubble (reporta.la). No existe un mapeo página → Repeating Group →
tabla Supabase que permita verificar paridad ni dirigir la migración de datos faltantes.
La auditoría de abril (`docs/auditoria/01-10`) cubrió paridad de UI (columnas, filtros,
acciones) pero no la dimensión de datos, y tiene 3 meses de antigüedad (v3.5 → v3.11).

## Objetivo

Por cada módulo, producir una **matriz de paridad** que verifique que la UI nueva muestra
toda la información de Bubble, con trazabilidad a `tabla.columna` de Supabase y estado de
migración del dato. Los gaps alimentan: (a) tickets de UI, (b) el proceso de migración
(kit `scripts/migrate-*` + `GAPS_CONFIRMADOS_MIGRACION.md`).

## Enfoque (aprobado: "A + C")

Auditoría dirigida por páginas Bubble (fuente de verdad = lo que el cliente ya tenía),
reforzada con una pasada automática schema-first (datos migrados que ninguna UI muestra).

### Insumos por módulo (4 fuentes)
1. **Auditoría abril** `docs/auditoria/0X-*.md` — baseline; cada fila se re-verifica contra código actual
2. **Screenshots del editor Bubble** (usuario captura en `c:/tmp/screenshots/reportar/<N módulo>/`):
   sidebar, lista con RG seleccionado y bindings visibles, wizard/popup de crear (todos los pasos),
   menú de fila abierto, popups de cada acción, panel de filtros
3. **Escaneo del código actual** (Claude): páginas `app/`, componentes, queries `.from()/.select()`,
   columnas de tablas y formularios
4. **Queries a BD prod** (Claude): existencia de columna + conteo de datos por tenant (CISE/GRUAS)

### Recorrido por módulo (orden del usuario)
```
0. Sidebar (una sola vez) → índice maestro de módulos/opciones
Por cada opción del módulo:
  1. Lista (columnas, búsqueda, filtros, export)
  2. Ventana "Crear nuevo" (campos, validaciones, pasos de wizard)
  3. Menú de fila (acciones disponibles)
  4. Ventanas/popups de cada acción
```

### Matriz de paridad (markdown, una por módulo)

| Columna | Contenido |
|---|---|
| Elemento | Lista / Crear paso N / Menú fila / Ventana X |
| Campo Bubble | Binding extraído del screenshot (ej: `User's id_cargo's Opción de Lista`) |
| Tabla.columna Supabase | Fuente en el schema nuevo |
| UI nueva | ✅ lo muestra / ❌ no |
| Dato migrado | ✅ con datos / ⚠️ parcial / ❌ vacío o columna inexistente |
| Status | ✅ OK · 🟡 Gap UI · 🔴 Gap migración · ⚪ Omitido intencional · ❓ DUDA |

**Regla dura:** ❓ DUDA nunca se resuelve por inferencia — se pregunta al usuario
(lista de preguntas al final de cada módulo). Ver memoria `preguntar-no-inferir`.

### Flujo de gaps
- 🔴 Gap migración → agregar a `GAPS_CONFIRMADOS_MIGRACION.md` + ejecutar con kit `scripts/migrate-*`
- 🟡 Gap UI → ticket con esfuerzo (reutilizar estimaciones de abril si siguen vigentes)
- ⚪ Omitido intencional → registrar el porqué en la matriz

## Entregables

- `docs/auditoria-ui/00-sidebar.md` — índice maestro (menú Bubble vs menú nuevo)
- `docs/auditoria-ui/01-usuarios.md` — piloto (sub-módulos: Usuarios, Tipos de Doc, Documentos)
- Retro de 15 min al cerrar el piloto → ajustar plantilla/proceso antes del módulo 2

## Orden de módulos

1. **Usuarios** (piloto — screenshots ya entregados 2026-07-14)
2. Catálogos restantes y luego páginas complejas (Tareas, Cotizaciones…) — orden a confirmar
   con el usuario tras la retro del piloto.

## Criterios de éxito del piloto

- Matriz completa de los 3 sub-módulos de Usuarios con las 6 columnas pobladas
- Cada campo Bubble trazado a tabla.columna o marcado ❓
- Gaps clasificados con acción concreta (ticket UI / entrada de migración / omitido)
- Preguntas DUDA respondidas por el usuario antes de cerrar el módulo

## Fuera de alcance

- Ejecutar las migraciones de datos (proceso separado, usa el kit existente)
- Cambios de UI (solo se generan tickets)
- Paridad pixel-perfect de diseño (solo información/datos)
