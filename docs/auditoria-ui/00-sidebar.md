# Auditoría UI ↔ Datos — 00 · Sidebar (índice maestro)

**Fecha:** 2026-07-14 · **Fuente Bubble:** `c:/tmp/screenshots/reportar/1 usuarios/1 sidebar.png` (tenant GRÚAS)
**Fuente nueva:** `lib/config/menu.ts` + `components/dashboard/sidebar.tsx`
**Spec:** `docs/superpowers/specs/2026-07-14-auditoria-ui-datos-design.md`

## Mapeo de módulos

| # | Bubble | reportaweb3 | Status | Nota |
|---|---|---|---|---|
| 1 | Panel de Control | ❓ | ❓ DUDA | No hay ítem "Panel" en el menú nuevo. ¿Equivale al home `/` o falta un dashboard? |
| 2 | Cotizaciones | Cotizaciones (Gestión · Servicios · Tasas) | ✅ | |
| 3 | Ventas | Ventas (Panel · Valoraciones · Facturas) | ✅ | |
| 4 | Compras | Compras (Panel · Valoraciones · Facturas) | ✅ | |
| 5 | Maquinaria | Maquinaria (Equipos · Modelos · Tipos · Documentos) | ✅ | |
| 6 | Terceros | Terceros (Directorio · Contactos · Personal · Sitios) | ✅ | |
| 7 | Sitios (nivel raíz) | Terceros → Sitios | ⚪ Reorganizado | Decisión de IA aceptada |
| 8 | **Usuarios** (Usuarios · Tipos De Doc · Documentos) | **Usuarios** (Directorio · Documentación) + Configuración → Tipos de Documento | ⚪ Reorganizado | Tipos de Doc movido a Configuración. Ver [01-usuarios.md](./01-usuarios.md) |
| 9 | Gestión EPP | Gestión EPP (5 subopciones) | ✅ | Nueva UI más completa |
| 10 | Gestión Formatos | Sistema → Formatos | ❓ DUDA | En el menú nuevo solo visible para admin (`/sistema`). ¿Los usuarios de tenant necesitan acceso a Formatos? |
| 11 | Planificación | Planificación (Panel · Registrar) | ✅ | |
| 12 | Informes | Informes (Checklist · Maquinaria · Personal · Gastos) | ✅ | |
| 13 | Planes de Acción | Planes de Acción (Panel · Listado) | ✅ | |
| 14 | Perfil de Usuario | Menú de avatar → `/settings/perfil` | ⚪ Reorganizado | Fuera del sidebar, patrón moderno |
| 15 | Soporte | Soporte | ✅ | |
| 16 | Configuración | Configuración (10 subopciones) | ✅ | Nueva UI más granular |
| 17 | Salir | Menú de avatar → Logout | ⚪ Reorganizado | |
| 18 | Opciones Internas | Sistema (solo `reporta_admin`) | ✅ | Equivalente |

## Orden de auditoría por módulo (acordado)

1. ✅ **Usuarios** (piloto) → [01-usuarios.md](./01-usuarios.md)
2. Pendiente definir tras retro del piloto (propuesta: catálogos → Terceros → Maquinaria → Cotizaciones → Planificación/Tareas → Informes → EPP → Ventas/Compras)

## DUDAs abiertas (responder el usuario)

- [ ] **D-01:** ¿"Panel de Control" de Bubble equivale al home `/` del sistema nuevo, o falta construir un dashboard?
- [ ] **D-02:** ¿"Gestión Formatos" debe ser visible para usuarios de tenant (como en Bubble) o se queda solo en Sistema/admin?
