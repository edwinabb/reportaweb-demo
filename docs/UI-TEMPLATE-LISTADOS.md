# UI Template — Páginas de Listado (estándar)

**Versión:** 1.2 — 2026-07-14
**Estado:** ✅ DEFINIDO (validado con usuario en módulo Usuarios)
**Objetivo:** Aplicar a TODOS los módulos de listado (Maquinaria, Terceros, Sitios, EPP, etc.)

---

## Estructura de página

```
║ Breve descripción de la página…                                          ║
║ [Buscar…            ]    [Extras] [Activos|Papelera] [↓XLS] [+ Nuevo]    ║
╟──────────────────────────────────────────────────────────────────────────╢
║ COLUMNAS sin ordenamiento │ filtros ▼ embudo en columnas tipificadas     ║
║ (nombre del registro en ROJO si está inactivo)                           ║
╟──────────────────────────────────────────────────────────────────────────╢
║ N registro(s) │ Filas por página [10 ▾] │ Página 1 de M │ ⏮ ◀ ▶ ⏭        ║
```

## Reglas

1. **Encabezado de página:** SIN breadcrumb/path, SIN título visible.
   Solo `<PageDescription>` con 1-2 frases (qué es la página y qué se puede hacer).
   Mantener un `<h1 className="sr-only">` por accesibilidad.

2. **Búsqueda multicampo:** un solo input, case-insensitive, coincidencia en
   cualquier posición, sobre los campos identificatorios (ej. nombre + nro
   documento + email). Placeholder explícito: `"Buscar por nombre, documento o email..."`.

3. **Sin ordenamiento por columna:** títulos fijos, sin flechas de sort.

4. **Filtros por columna (embudo):** usar `<ColumnFilterHeader>` en columnas
   tipificadas (estados, categorías, roles, tipos). Ícono azul cuando hay filtro
   activo + opción "Limpiar filtro". `multiple={false}` cuando el filtro se
   aplica en servidor con un solo valor.

5. **Botonera derecha (en este orden):**
   `[Extras específicos] [Activos|Papelera] [↓XLS] [+ Nuevo]`
   - **Activos/Papelera:** vista por defecto = solo activos. Papelera = inactivos.
   - **↓XLS:** exporta **lo filtrado** con `exportToExcel(pagina, filas)` →
     nombre `PAGINA-AAAA-MM-DD-HH-MM.xls` (ej. `USUARIOS-2026-07-14-20-06.xls`).
   - **+ Nuevo:** botón naranja (`bg-orange-600`).
   - SIN botón "Vista"/opciones de columnas.

6. **Registros inactivos:** el nombre/identificador se pinta `text-red-600`.

6b. **SIN columna Estado (Activo/Inactivo):** el estado NO se muestra como
   columna ni como filtro. Lo cubren las vistas Activos/Papelera (regla 5)
   y el nombre en rojo (regla 6). *(v1.1 — decidido tras validar Usuarios.)*

7. **Paginación (siempre al pie):** contador `N registro(s)` + `Filas por página`
   (10/20/50) + `Página X de Y` + ⏮ ◀ ▶ ⏭.
   - Tablas cliente (tanstack): `DataTable` ya la incluye (`DataTablePagination`).
   - Tablas manuales o server-side: `<TablePaginationBar>`.

8. **Datasets grandes → servidor:** si la tabla puede superar ~500 filas en prod
   (ej. Documentación), filtros + búsqueda + paginación van por URL params y se
   resuelven en el servidor. La URL filtrada debe ser copiable/compartible.

9. **Sección de buscador y botones (tarjeta):** la barra va en su propia
   tarjeta: `bg-white p-4 rounded-lg border shadow-sm`, con
   `flex flex-col md:flex-row md:items-center justify-between gap-4`.
   *(v1.2)*

10. **Barra de títulos de tabla en gris:** `<TableHeader className="bg-muted/50">`.
    La tabla va en `rounded-md border bg-white shadow-sm overflow-x-auto`. *(v1.2)*

11. **Responsive (tablet/celular):** *(v1.2)*
    - El contenedor de la tabla lleva `overflow-x-auto` (scroll horizontal
      propio; la página nunca scrollea de lado).
    - La barra de buscador/botones apila en columna en móvil
      (`flex-col md:flex-row`) y los botones envuelven (`flex-wrap`).
    - Inputs de búsqueda: `w-full md:w-[250px]`.

## Componentes compartidos

| Pieza | Archivo |
|-------|---------|
| Filtro embudo de columna | `components/ui/column-filter-header.tsx` |
| Barra de paginación manual/server | `components/ui/table-pagination-bar.tsx` |
| Export Excel estándar | `lib/utils/export-excel.ts` |
| Descripción de página | `components/ui/page-description.tsx` |
| Tabla tanstack con toolbar/paginación | `components/ui/data-table.tsx` |

## Páginas de referencia (implementación)

- **Cliente (tanstack):** `/users` → `app/(dashboard)/users/client-page.tsx`
- **Cliente (tabla manual):** `/settings/document-types` → `components/settings/document-types/document-types-table.tsx`
- **Servidor (URL params):** `/users/documents` → `components/users/documents/global-documents-table.tsx`
- **Vista especial (depuración en lote):** `/users/documents/depurar`

## Control de avance — Auditoría UI por módulos

**Avance: 1 de 15 módulos (6.7%) — faltan 14**

| # | Módulo | Status | Fecha |
|---|--------|--------|-------|
| 1 | Usuarios (Directorio · Tipos de Documento · Documentación · Depurar) | ✅ COMPLETADO | 2026-07-14 |
| 2 | Maquinaria | 🔲 Pendiente | — |
| 3 | Terceros | 🔲 Pendiente | — |
| 4 | Sitios | 🔲 Pendiente | — |
| 5 | Gestión EPP | 🔲 Pendiente | — |
| 6 | Cotizaciones | 🔲 Pendiente | — |
| 7 | Planificación | 🔲 Pendiente | — |
| 8 | Gestión Formatos | 🔲 Pendiente | — |
| 9 | Informes | 🔲 Pendiente | — |
| 10 | Planes de Acción | 🔲 Pendiente | — |
| 11 | Ventas | 🔲 Pendiente | — |
| 12 | Compras | 🔲 Pendiente | — |
| 13 | Configuración | 🔲 Pendiente | — |
| 14 | Perfil de Usuario | 🔲 Pendiente | — |
| 15 | Opciones Internas | 🔲 Pendiente | — |

> Actualizar esta tabla al cerrar cada módulo (status + fecha + % de avance).

## Pendientes de decisión

- Confirmar orden de grupos en Depurar vencidos (hoy: +6 meses primero → +1 al final;
  dentro de cada grupo, del vencimiento más reciente al más antiguo).
- Al auditar módulo 2 (Maquinaria), revisar si el template necesita ajustes antes
  de replicarlo al resto.
