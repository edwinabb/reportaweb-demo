# Onboarding Definitivo Post-Pago (Sub-proyecto D) — Design Spec

**Fecha:** 2026-07-19
**Proyecto:** reportaweb3 (portable a IMPULSAR — ver `docs/PLAYBOOK-GROWTH-ENGINE.md`)
**Estado:** Borrador (en revisión)
**Depende de:** Sub-proyecto A (motor de plan adaptativo + progreso real) y C (dispara D
al convertir a `converted`). Reutiliza `trial_plan_steps`, `trial_module_progress` y el
motor de `lib/trial-plan.ts`.

---

## Resumen

Cuando un lead paga (C), su cuenta pasa de "explorar en trial" a "operar en serio". El
onboarding post-pago es un **segundo plan guiado, más completo y definitivo**: llevar al
cliente a configurar TODO lo que un tenant productivo necesita (branding si OWN BRAND,
todos los usuarios/asientos, config de informes, datos maestros, integración con la app
móvil), reaprovechando el mismo motor adaptativo de A pero con un **tramo de plan propio**
(`phase='paid'`). Objetivo: que el cliente llegue a "sistema listo para el día a día" sin
soporte manual, y que el dueño solo intervenga si el cliente se traba (alerta Telegram).

---

## 1. Diferencia trial vs post-pago

| | Trial (A) | Post-pago (D) |
|---|-----------|---------------|
| Meta | Enamorar: que pruebe y vea valor rápido | Operar: dejar el sistema listo para producción |
| Alcance | Núcleo (core 15d) + avanzado (7d) | **Setup definitivo completo** (todos los módulos productivos) |
| Asientos | Ilimitado | Los **pagados** (invitar/activar hasta `seats_paid`) |
| Branding | No | **Sí, si OWN BRAND** (logo, colores, dominio) |
| Tono correos | Descubrimiento / urgencia de decisión | Acompañamiento de implementación (éxito del cliente) |
| Fin | Conversión o borrado | "Tenant productivo" (checklist 100%) |

---

## 2. Modelo de datos (reutiliza A + extensión mínima)

- **Plan:** se añade un tramo al catálogo de `trial_plan_steps` con `phase='paid'`
  (A ya define `phase` para `core`/`advanced`). Mismo esquema, nuevo tramo editable por
  el SuperAdmin (§ editor de A, `/sistema/plan-onboarding`, con selector de fase).
- **Progreso:** se sigue usando `trial_module_progress` (A escanea datos reales por
  módulo). D solo consulta el mismo progreso, no duplica tablas.
- **Estado de onboarding pago** (columna nueva en `companies`):
```sql
ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS onboarding_paid_status TEXT
      CHECK (onboarding_paid_status IN ('pending','in_progress','done'))
      DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS onboarding_paid_started_at TIMESTAMPTZ;
```
> `NULL` = aún no pagó. Se pone `'pending'` en el webhook `checkout.session.completed` (C).

---

## 3. Checklist de setup definitivo (contenido del tramo `paid`)

Pasos-tipo (el copy final lo define negocio en el editor; aquí la **estructura**):

| # | Módulo | Qué completa | "Hecho" se detecta por |
|---|--------|--------------|------------------------|
| 1 | Empresa | Datos fiscales, logo, colores | `companies` completo |
| 2 | **Branding** (solo OWN BRAND) | Logo/colores/dominio propio | `hasBranding` + assets cargados |
| 3 | Usuarios | Invitar/activar hasta `seats_paid`, asignar roles | Nº usuarios activos vs asientos |
| 4 | Config de informes | Jornadas, riggers, firmas, fotos (por tenant) | `config_informe_*` presente |
| 5 | Datos maestros | Maquinaria, terceros/clientes base | Filas > umbral en cada tabla |
| 6 | App móvil | Descargar app, primer login de un operador | Login registrado desde app |
| 7 | Primera operación real | Crear 1 tarea/informe productivo | Registro real post-conversión |

Cada paso ⇒ un `trial_plan_steps` con `phase='paid'`, `day` (orden sugerido), `module`,
`email_subject`, `email_body`, y una **regla de detección** (reutiliza el escaneo de A).

---

## 4. Motor (reutiliza A)

- **Disparo:** webhook C setea `onboarding_paid_status='pending'`; el cron de A (o uno
  gemelo) al detectar tenants `converted` con onboarding `pending`/`in_progress`:
  1. marca `in_progress` y `onboarding_paid_started_at` en el primer tick;
  2. corre el mismo `selectDailyStep` de A pero filtrando `phase='paid'`;
  3. elige el correo según **avance real** (adelantado → felicita/salta; atrasado →
     recuerda; completó todo → marca `done`), idéntica lógica adaptativa de A;
  4. idempotencia por `step_id` vía `trial_emails_log` (A).
- **Cierre:** cuando todos los pasos `paid` con detección dan "hecho" →
  `onboarding_paid_status='done'` + correo de felicitación "Sistema listo" + alerta
  Telegram al admin ("✅ Cliente X quedó productivo").
- **Alerta de traba:** si un cliente pago lleva N días sin avanzar un paso crítico
  (usuarios/config informes) → alerta Telegram al admin para intervención humana
  (reutiliza `sendTelegram` de B).

> **Reuso clave:** D NO agrega motor nuevo. Es un **tramo de plan + un estado**; toda la
> maquinaria (escaneo de progreso, selección adaptativa, envío de correo idempotente)
> es la de A. Esto mantiene un solo motor que mantener.

---

## 5. UI

- **Barra de progreso de onboarding** en el dashboard del cliente pago: checklist §3 con
  estado por paso (hecho/pendiente) y CTA directo a cada módulo. Visible hasta `done`.
- **`/suscribir/gracias`** (de C) enlaza a esta barra como primer destino post-pago.
- **SuperAdmin `/sistema`:** columna "Onboarding pago" (pending/in_progress/done) en el
  listado de tenants + acceso al editor de plan con la fase `paid`.

---

## 6. Archivos nuevos / modificados

| Archivo | Acción |
|---------|--------|
| `supabase/migrations/YYYYMMDD_onboarding_paid.sql` | NUEVO — columnas `onboarding_paid_*` |
| `lib/trial-plan.ts` | MODIFICADO — `selectDailyStep` acepta `phase` param (core/advanced/paid) |
| `lib/trial-progress.ts` | MODIFICADO — reglas de detección de los pasos `paid` (§3) |
| `app/api/cron/trial-lifecycle/route.ts` | MODIFICADO — procesar también `onboarding_paid` |
| `components/onboarding/checklist-post-pago.tsx` | NUEVO — barra/checklist en dashboard |
| `app/(dashboard)/**` | MODIFICADO — montar la barra hasta `done` |
| `components/sistema/plan-onboarding/**` | MODIFICADO — editor soporta fase `paid` |
| `lib/actions/billing.ts` (C) | MODIFICADO — al convertir, setear `onboarding_paid_status='pending'` |

---

## 7. Fuera de alcance de D

- **El cobro** → C. D asume el tenant ya `converted`.
- **Soporte conversacional** (dudas del cliente durante el setup) → sub-proyecto **E**
  (asistente). D solo dispara correos y alertas; las preguntas las resuelve E o el humano.
- **Migración de datos históricos** desde Bubble/sistema viejo del cliente → proceso
  aparte (no todos los clientes lo piden).

---

## 8. Decisiones / lecciones (para el playbook)

1. **Reusar el motor de A** (mismo `selectDailyStep` + progreso real, distinto `phase`) en
   vez de construir un onboarding paralelo = un solo motor, dos tramos de contenido.
2. **"Hecho" se detecta por datos reales**, no por "marcar como leído" = el checklist
   refleja el estado operativo verdadero del tenant.
3. **Definición de éxito = tenant productivo** (checklist 100%), medible y accionable por
   la alerta de traba, no una métrica difusa de "activación".
4. **Branding gateado por plan** (paso solo visible en OWN BRAND) = el mismo plan sirve a
   ambos productos sin ramificar el motor.
