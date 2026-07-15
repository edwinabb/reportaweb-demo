# Technical Debts & DUDAs — Reporta Web 3

**Última revisión:** 2026-07-15 (auditoría Maquinaria + Planificación)

| ID | Tema | Prioridad | Estado |
|----|------|-----------|--------|
| DUDA-SEC-001 | Rotar SERVICE_ROLE_KEY de PROD (estuvo en git) | ALTA | 🟡 Pendiente |
| DUDA-E2E-001 | Actualizar suite E2E a la UI del template v1.2 | ALTA | 🟡 Pendiente |
| DUDA-CACHE-001 | Migrar cache HTML a stale-while-revalidate | MEDIA | 🟡 Pendiente |
| DUDA-DEPS-001 | Migrar xlsx (vulns altas sin fix en npm) | MEDIA | 🟡 Pendiente |
| DUDA-DEPS-002 | middleware.ts → proxy.ts (espera soporte OpenNext) | BAJA | 🔴 Bloqueado |
| DUDA-MAQ-HORAS | `maquinaria_horas` sin UI propia (se usa en informes y tareas) | MEDIA | 🟡 Pendiente |
| — | Migrar cron jobs de Vercel a Cloudflare | MEDIA | 🟡 Pendiente |
| — | Configurar deploy de live.reportar.app (worker reportaweb-live) | ALTA | 🟡 Pendiente |

---

## DUDA-SEC-001: Rotar SERVICE_ROLE_KEY de PROD

**Status:** 🟡 PENDIENTE
**Prioridad:** ALTA
**Esfuerzo:** 15 min

El `SUPABASE_SERVICE_ROLE_KEY` de PROD (fqwhagryqkkhbgznxtwf) estuvo committeado
brevemente en `.env.production` (commits del 2026-07-14, repos privados). Ya se
retiró del archivo, pero queda en el historial de git.

**Acción:** Supabase Dashboard → proyecto PROD → Settings → API → Reset
`service_role` key, y actualizar el Secret en Cloudflare (worker reportaweb-live)
y `.env.local` (PROD_SUPABASE_SERVICE_ROLE_KEY).

---

## DUDA-E2E-001: Suite E2E desactualizada tras template v1.2

**Status:** 🟡 PENDIENTE
**Prioridad:** ALTA (antes del próximo release a live)
**Esfuerzo:** 2-4h

Los cambios del template v1.2 (búsqueda multicampo, columnas nuevas, botones
Activos/Papelera/XLS, columna Estado eliminada, títulos removidos) muy
probablemente rompen tests de `tests/flows/17-usuarios.spec.ts` y relacionados.

**Acción:** correr `npm run test:e2e:grupo-c` contra la BD test, actualizar
selectores/asserts al nuevo estándar, y de paso crear helpers reutilizables
para validar el template en los próximos módulos.

## DUDA-CACHE-001: Migrar a stale-while-revalidate (Opción B)

**Status:** 🟡 PENDIENTE  
**Prioridad:** MEDIA  
**Esfuerzo:** 1h (cambio de config + análisis de métricas)

### Contexto

Actualmente usamos **Opción A** para caché de HTML en Cloudflare:
```
Cache-Control: public, max-age=300, must-revalidate
```

**Comportamiento:**
- HTML se cachea por **5 minutos**
- Después de 5 min, Cloudflare revalida con el servidor
- Si hay versión nueva, la sirve en la siguiente petición
- Máximo delay observado: **5 minutos** desde deploy

### Propuesta: Opción B

Migrar a:
```
Cache-Control: public, max-age=3600, stale-while-revalidate=86400
```

**Comportamiento:**
- HTML se cachea por **1 hora** (fresh)
- Después de 1 hora, pero durante **24 horas** más, Cloudflare:
  - Sirve la versión cacheada INMEDIATAMENTE
  - Revalida en background
  - Próxima petición obtiene versión nueva (si cambió)

**Ventajas:**
- ✅ Mejor performance inicial (sin esperar revalidación)
- ✅ Usuarios siempre ven página cargada en ~50ms
- ✅ Actualizaciones llegan en background (próxima visita o después de 1h)

**Desventajas:**
- ❌ Usuarios pueden ver versión vieja por hasta 24h (peor caso)
- ❌ Percepción: "cambié algo pero no se ve"

### Criterios de Éxito

Para cambiar a Opción B, se debe:

1. **Medir métricas actuales** con Opción A:
   - Time to First Byte (TTFB) promedio
   - Cache hit rate en Cloudflare
   - User complaints sobre "no ve cambios"

2. **Definir estrategia de comunicación:**
   - Si el equipo hace cambios significativos, notificar al equipo de ops
   - Agregar endpoint `/api/deploy-info` que devuelva timestamp del último deploy
   - Los usuarios pueden consultar si hay versión nueva

3. **Implementación:**
   - Cambiar headers en `next.config.ts` línea ~40
   - Agregar tooltips en UI si es necesario: "Cambios pueden tardar hasta 1 hora en aparecer"
   - Monitorear feedback

### Archivos Afectados

- `next.config.ts` (líneas ~40-45)
- No cambios en código de la app

### Timeline Sugerido

- **Semana de 2026-07-21:** Medir métricas con Opción A
- **Semana de 2026-07-28:** Evaluar feedback + decidir
- **Semana de 2026-08-04:** Implementar Opción B si se aprueba

---

## DUDA-DEPS-001: Migrar xlsx (SheetJS) — vulnerabilidades altas sin fix en npm

**Status:** 🟡 PENDIENTE  
**Prioridad:** MEDIA  
**Esfuerzo:** 2-4h (depende de cuántos módulos usan xlsx)

### Contexto

`xlsx@0.18.5` (SheetJS) tiene vulnerabilidades altas conocidas (prototype pollution,
ReDoS) que **no tienen fix en el registro de npm**: SheetJS dejó de publicar ahí.
Las versiones corregidas solo se distribuyen desde su CDN propio (https://cdn.sheetjs.com).

### Opciones

- **A)** Instalar desde el CDN de SheetJS: `npm i https://cdn.sheetjs.com/xlsx-latest/xlsx-latest.tgz`
  (mismo API, cambio mínimo, pero la dependencia queda fuera de npm)
- **B)** Migrar a `exceljs` u otra librería mantenida en npm (más trabajo, API distinta)

### Mitigación actual

El riesgo es bajo mientras xlsx solo procese archivos generados por nosotros
(export). Si en algún momento se usa para **importar archivos subidos por
usuarios**, esta deuda pasa a prioridad ALTA.

### Timeline sugerido

Evaluar junto con DUDA-CACHE-001 (semana 2026-07-28).

---

## DUDA-DEPS-002: Migrar middleware.ts → proxy.ts cuando OpenNext lo soporte

**Status:** 🔴 BLOQUEADO (por dependencia externa)  
**Prioridad:** BAJA  
**Esfuerzo:** 15 min (rename + verificar deploy)

### Contexto

Next.js 16 deprecó la convención `middleware.ts` a favor de `proxy.ts`
(que corre en runtime Node.js). Se intentó la migración el 2026-07-14 pero
el deploy a Cloudflare falló con:

```
ERROR Node.js middleware is not currently supported. Consider switching to Edge Middleware.
```

`@opennextjs/cloudflare` (v1.20.1, la última) solo soporta **Edge Middleware**.
Se revirtió a `middleware.ts` (funciona, solo muestra warning de deprecation
en el build).

### Acción

Cada 1-2 meses revisar el changelog de @opennextjs/cloudflare:
https://github.com/opennextjs/opennextjs-cloudflare/releases

Cuando anuncie soporte para Node.js middleware/proxy:
1. `git mv middleware.ts proxy.ts` + renombrar la función a `proxy`
2. `npm i @opennextjs/cloudflare@latest`
3. Verificar build local (`npm run build:demo && npx opennextjs-cloudflare build`) y deploy a demo

---

## DUDA-MAQ-HORAS: `maquinaria_horas` sin UI propia

**Status:** 🟡 PENDIENTE
**Prioridad:** MEDIA
**Esfuerzo:** por dimensionar (auditoría módulos Informes/Planificación)

### Contexto

La tabla `maquinaria_horas` (1.917 filas en PROD, todas CISE; 0 GRUAS) no es
consumida por ninguna pantalla del módulo Maquinaria. Decisión del usuario
(2026-07-15): **se utiliza en la parte de informes y en tareas** — queda como
deuda para cubrirla al auditar esos módulos, no se elimina.

### Acción

Al auditar los módulos Informes (#9) y Planificación (#7), mapear dónde debe
mostrarse/alimentarse `maquinaria_horas` (jornadas, total_horas, cant_servicios)
y crear los tickets de UI correspondientes.

---

## Template para nuevas DUDAs

```markdown
## DUDA-XXX: [Título]

**Status:** 🟡 PENDIENTE | 🟢 EN PROGRESO | 🔴 BLOQUEADO | ✅ RESUELTO  
**Prioridad:** CRÍTICA | ALTA | MEDIA | BAJA  
**Esfuerzo:** Xh

### Contexto
[Explicar la situación actual]

### Problema
[Qué queremos mejorar]

### Opciones Consideradas
[A, B, C con trade-offs]

### Recomendación
[Cuál elegir y por qué]

### Criterios de Éxito
[Cómo sabremos que está bien]

### Timeline
[Cuándo hacerlo]
```
