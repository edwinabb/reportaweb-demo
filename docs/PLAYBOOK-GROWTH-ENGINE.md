# Playbook — Growth Engine (Leads → Trial → Cliente)

**Qué es:** el sistema portable de captación y conversión de leads para SaaS
multi-tenant B2B. Diseñado en REPORTA (2026-07), pensado para reusarse en **IMPULSAR**
y futuros proyectos del ecosistema.

**Cómo usar este doc:** es agnóstico de proyecto — captura la **arquitectura y las
decisiones** que se copian. El detalle técnico concreto vive en los specs por
sub-proyecto (`docs/superpowers/specs/`), que cada proyecto adapta.

**Estado:** 🟢 vivo — se actualiza al cerrar cada sub-proyecto (A–E).

---

## Los 5 sub-proyectos

| # | Sub-proyecto | Rol | Estado spec |
|---|--------------|-----|-------------|
| **A** | Ciclo de vida del trial v2 | Estados, fases, onboarding adaptativo, auto-borrado | ✅ spec + plan (`2026-07-18-trial-lifecycle-v2-*`) |
| **B** | Alta sales-led + aprobación/notificaciones | Crear cuenta demo del lead, aprobación 1-clic, Telegram | ✅ spec (`2026-07-18-lead-provisioning-telegram-design.md`) |
| **C** | Cobro self-service (Stripe) | Checkout → convertir trial a pago, webhooks | ✅ spec (`2026-07-19-stripe-self-service-design.md`) |
| **D** | Onboarding definitivo post-pago | Onboarding completo tras el pago | ✅ spec (`2026-07-19-onboarding-post-pago-design.md`) |
| **E** | Asistente virtual (ventas + soporte) | Chat web pre-venta + soporte 1er nivel | ✅ spec (`2026-07-19-asistente-virtual-design.md`) |

**Orden de construcción:** A (base de estados) → B (alta) → C (cobro) → D (post-pago) →
E (asistente, cuando ya hay leads a quien atender).

**Dependencias:** B/C/D se enganchan a los estados de A. D depende de C. E es
independiente pero se construye último (no hay a quién soportar antes).

---

## Entornos

| Entorno | BD | Uso |
|---------|-----|-----|
| **demo** | Supabase TEST | Pruebas internas del equipo |
| **live / prod** | Supabase PROD | Leads y clientes reales |

Deploy vía Cloudflare Workers Builds (push a remote git). Secretos server-side (service
role, Stripe, Telegram) van **solo** como secrets del worker, nunca en archivos
trackeados.

---

## Decisiones de arquitectura (lo que se copia)

### 1. Single-schema multi-tenant — NO esquema separado para leads
Un lead es un **tenant con un estado** (`trial_status`), no una BD aparte. Ventajas:
- **Conversión instantánea:** lead paga → cambiar un estado, sin migrar datos.
- **Borrado seguro:** DELETE scopeado a `trial_status='warning'` (última fase) + función
  de BD con guardas. Un tenant real (`trial_status IS NULL`) es inalcanzable.
- Evita duplicar cada tabla/RLS/función/migración (lo que costaría un esquema espejo).

### 2. Ciclo de vida por engagement, NO por lock-out
Fases **15 ACTIVE + 7 DECISION + 3 WARNING → borrado** (ajustable por proyecto). Las
tres fases tienen **acceso total**; el estado controla **comunicación y countdown**, no
permisos. No se implementa modo solo-lectura:
- Mantener al lead usando el producto convierte mejor que bloquearlo.
- Elimina la pieza más invasiva (bloquear escrituras en decenas de acciones).
- La urgencia viene del **riesgo de perder los datos** (fase WARNING) — "paga para
  conservarlos" — no del bloqueo.

### 3. Onboarding adaptativo al avance real, NO drip por calendario
- **Plan global** por módulo/día (tabla `trial_plan_steps`, tiers core + advanced).
- **Avance real** por lead (tabla `trial_module_progress`, poblada escaneando datos).
- **El correo se elige por avance:** al día → plan del día; adelantado → felicita y
  salta; atrasado → recuerda pendientes; terminó → tramo avanzado.
- **Idempotencia por paso** (`trial_emails_log` por `step_id`), no por fecha.

### 4. Canales: Telegram para el admin, web + correo para el cliente
- **Admin (interno):** Telegram Bot API — gratis, sin aprobación de Meta, botones inline
  para aprobar altas y recibir alertas de leads calientes. Setup ~10 min.
- **Cliente (LatAm):** asistente web in-app + correo. WhatsApp queda como opción futura
  (mayor alcance pero API pesada: aprobación, plantillas, costo por conversación).

### 5. Alerta por engagement score — enfocar el tiempo del dueño
El sistema calcula un score por lead (logins, tareas, reportes, valorizaciones) y
**avisa al admin (Telegram) cuando un lead está caliente**. El tiempo comercial se
invierte en cerrar a los ya enganchados, no en perseguir a todos.

---

## Lecciones aprendidas (se irán sumando)

- **Secretos server-side jamás en archivos trackeados.** `.env.production`/`.env.demo`
  están trackeados (force-add en `.gitignore`) y solo llevan variables **públicas**
  (`NEXT_PUBLIC_*`). El service_role / secret keys van como secret del worker en
  Cloudflare. Poner un secret ahí = re-filtrarlo a git. (Ver DUDA-SEC-001.)
- **Versión de la app: derivarla de `package.json` en build** (`NEXT_PUBLIC_APP_VERSION`
  vía `next.config.ts env`), nunca hardcodear el número en la UI — se desactualiza.
- **Rotación de keys Supabase:** no resetear el JWT legacy (rompe la anon embebida en
  APKs instalados); migrar a las API keys nuevas (`sb_publishable_` / `sb_secret_`).
  Si no hay clientes en producción, deshabilitar las legacy es seguro.
- (más lecciones al implementar B–E)

---

## Portar a otro proyecto (checklist)

1. Verificar que el proyecto es single-schema multi-tenant con `tenant_id` + RLS.
2. Copiar la migración de A adaptando: nombre de tablas de tenant, IDs de tenants reales
   a excluir del borrado, módulos del plan.
3. Definir el **contenido** de `trial_plan_steps` (copy por día) con el negocio de ese
   proyecto — la estructura es igual, el copy es propio.
4. Configurar Cron Trigger + secrets (CRON_SECRET, Telegram bot token, Stripe) del worker.
5. Ajustar duraciones del ciclo y ponderación de engagement en `lib/trial-config.ts`.
