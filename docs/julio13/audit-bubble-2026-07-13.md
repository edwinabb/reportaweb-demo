# 📋 AUDITORÍA BUBBLE — 2026-07-13T02:09:58.603Z

## 🔴 TABLA 1: INSPECCIONES_DETALLES (informe_respuesta)

**Status Bubble:** 0 registros
**Status Supabase:** 138,528 registros (2026-06-03)
**Gap:** -138,528 registros pendientes

### Distribución por AÑO + TENANT

| Año | CISE | GRÚAS | Total |
|-----|------|-------|-------|
| **TOTAL** | **0** | **0** | **0** |

### Decisión
- ✅ MIGRAR: 0 registros (CISE + GRÚAS)
- ⏳ Estrategia: Paginación por trimestres (API limita 50k/query)
- 📅 Timeline: Semana 2026-07-22

---

## 🟡 TABLA 2: COTIZACIONES_MATRIZ

**Status Bubble:** 100 registros
**Status Supabase:** 33,082 registros (2026-06-03)
**Gap:** -32,982 registros (HUÉRFANOS, sin cotizacion_id)

### Distribución por AÑO (estimado 50/50 CISE/GRÚAS)

| Año | CISE | GRÚAS | Total |
|-----|------|-------|-------|
| **2020** | 50 | 50 | **100** |
| **TOTAL** | **50** | **50** | **100** |

### Decisión
- ❌ IGNORAR: -32,982 registros huérfanos (sin valor funcional)
- 📌 Razón: No están vinculados a cotizaciones (relación inversa no recuperable)
- 💾 Alternativa: Migrar con cotizacion_id=NULL si cliente lo requiere (4-6 horas)

---

## 📊 RESUMEN EJECUTIVO

### A MIGRAR

| Tabla | Total | CISE | GRÚAS | Esfuerzo | Timeline |
|-------|-------|------|-------|----------|----------|
| **inspecciones_detalles** | 0 | 0 | 0 | 3-4h | Semana 22 |

### A IGNORAR

| Tabla | Huérfanos | Razón |
|-------|-----------|-------|
| **cotizaciones_matriz** | -32,982 | Sin cotizacion_id válido |

---

## 🚀 PRÓXIMOS PASOS

1. ✅ Números confirmados
2. [ ] Crear script v4 (paginación por trimestres)
3. [ ] Test en TEST environment
4. [ ] Ejecutar en PROD (semana 2026-07-22)

---

**Auditoría realizada:** 2026-07-13T02:09:58.603Z
**Token:** 5532c3bb...
