# Technical Debts & DUDAs — Reporta Web 3

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
