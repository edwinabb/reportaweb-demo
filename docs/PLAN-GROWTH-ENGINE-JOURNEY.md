# Plan — Journey end-to-end del Growth Engine (portable, todos los sistemas)

**Qué es:** la vista **lineal** del recorrido del cliente — de la landing al cliente que
paga — con soporte de IA en ventas y en operación. Consolida en una sola línea los
sub-proyectos A–E (que están diseñados por separado) + el estándar de landing/dominios.

**Para quién:** portable a todo el ecosistema (REPORTA, IMPULSAR, …). Lo agnóstico va acá;
el detalle técnico vive en los specs/planes por sub-proyecto y en los dos playbooks.

**Estado global:** 🟡 **todo diseñado, nada implementado.** Orden de construcción:
**A → C → D → (B en cualquier momento tras A) → E.**

> Docs base: [PLAYBOOK-GROWTH-ENGINE.md](./PLAYBOOK-GROWTH-ENGINE.md) (arquitectura) ·
> [PLAYBOOK-DOMAIN-STRATEGY.md](./PLAYBOOK-DOMAIN-STRATEGY.md) (landing/dominios) ·
> specs en `docs/superpowers/specs/` · planes en `docs/superpowers/plans/`.

---

## El journey en una línea

```
Landing → Alta trial → 15d ACTIVE → 7d DECISION → (Pago cuando quiera) → Servicios
                          │            │              │                      │
                    onboarding    countdown +      Stripe               onboarding
                    adaptativo    hot-lead alert    checkout             definitivo
                    (correo diario dinámico)                             (post-pago)
                                     │
                              si no paga → 3d WARNING → auto-borrado (datos)
        ┌───────────────────────────────────────────────────────────────────┐
   IA:  │  ventas (chat en landing/trial)          soporte 1er nivel (operación)  │
        └───────────────────────────────────────────────────────────────────┘
```

## Etapas → qué vive el usuario → qué lo implementa

| # | Etapa | Qué experimenta el usuario | Implementa | Estado tenant |
|---|-------|----------------------------|------------|---------------|
| **0** | **Landing / descubrimiento** | Entra a `<dominio>` (home): propuesta de valor, `/novedades`, landings de campaña por ads, **chat de IA pre-venta**; login embebido para clientes actuales | Estándar dominios ([PLAYBOOK-DOMAIN-STRATEGY](./PLAYBOOK-DOMAIN-STRATEGY.md)) + **E** (IA ventas) | — (visitante) |
| **1** | **Alta de trial** | Desde la home elige "empezá tu prueba" → `/registro` **secuencial, sin forzar**; se crea su cuenta al instante | **A** (registro) | `trial_status = ACTIVE` |
| **2** | **Fase ACTIVE (15 d)** | **Acceso total** al producto; onboarding **adaptativo al avance real** (no drip por calendario) | **A** (motor adaptativo, §3 spec) | ACTIVE |
| **3** | **Seguimiento diario por correo (dinámico)** | Un correo por día **elegido por su avance**: al día → plan del día · adelantado → felicita y salta · atrasado → recuerda pendientes · terminó → tramo avanzado | **A** (`trial_plan_steps` × `trial_module_progress`, idempotente por paso) | ACTIVE |
| **4** | **Fase DECISION (7 d)** | Countdown suave; sigue con acceso total; si se engancha, el sistema **avisa al admin (Telegram)** por engagement score | **A** + **B** (score + alerta) | `DECISION` |
| **5** | **Pago (cuando quiera o al final)** | Checkout **self-service** (Stripe); el trial se convierte en cliente **cambiando un estado** (single-schema, sin migrar datos) | **C** (Stripe) | `trial_status → NULL` (cliente) |
| **6** | **Fase WARNING (3 d)** *(solo si no pagó)* | "Pagá para **conservar tus datos**" — la urgencia es el riesgo de perderlos, no un bloqueo | **A** (auto-borrado con guardas de BD) | `WARNING` → borrado |
| **7** | **Fase de servicios (post-pago)** | Onboarding **definitivo**: configuración completa, activación del equipo | **D** (depende de C) | Cliente activo |
| **∞** | **Soporte en operación** | La **misma IA** que lo atendió en ventas ahora resuelve dudas de 1er nivel dentro de la app | **E** (IA soporte) | Cliente activo |

## Decisiones cerradas (no reabrir sin motivo)

- **Single-schema:** un lead es un **tenant con estado** (`trial_status`), no una BD aparte →
  pagar = flip de estado, sin migrar datos; borrado seguro scopeado a la fase WARNING.
- **Ciclo 15 + 7 + 3** con **acceso total en las 3 fases** (el estado controla comunicación y
  countdown, **no permisos**; sin modo solo-lectura).
- **Onboarding por engagement, no por calendario** (correo elegido por avance real).
- **Canales:** Telegram para el admin (alertas + aprobación 1-clic) · web + correo para el
  cliente · WhatsApp futuro.
- **Precios (C, definidos para Reporta):** STANDARD **$29.99** / OWN BRAND **$49.99** por
  asiento, mín. **10**, USD; semestral **−10%**, anual **−20%**; cuotas = asientos pagados.
- **IA (E)** cubre **ventas + operación** con el mismo asistente (chat web pre-venta →
  soporte 1er nivel in-app).

## Qué falta para ejecutar (por sub-proyecto)

| # | Sub-proyecto | Spec | Plan | Falta |
|---|--------------|------|------|-------|
| A | Ciclo de vida trial v2 | ✅ | ✅ (13 tasks) | **Implementar** (empezar por migración en Supabase TEST) + **copy** de los 15+7 correos |
| B | Alta sales-led + Telegram | ✅ | — | Plan de implementación + bot |
| C | Cobro Stripe | ✅ | ✅ | Implementar checkout + webhooks |
| D | Onboarding post-pago | ✅ | ✅ | Implementar (depende de C) + copy tramo `paid` |
| E | Asistente virtual (IA) | ✅ | ✅ | Implementar (último: cuando haya leads a atender) |
| 0 | Landing/home | estándar ✅ | — | **Diseño de home/novedades/landings** (marketing) + andamiaje de rutas + `/login`→`/` |

## Portar a otro sistema (checklist)

1. Verificar single-schema multi-tenant (`tenant_id` + RLS) — requisito de A.
2. Aplicar el **estándar de landing/dominios** (`<dominio>` apex = home + login + `/registro`;
   ver [PLAYBOOK-DOMAIN-STRATEGY](./PLAYBOOK-DOMAIN-STRATEGY.md)). En stacks Flutter (Impulsar)
   adaptar la mecánica (Pages, no Workers).
3. Copiar la migración de **A** adaptando tablas/IDs de tenants reales/módulos del plan.
4. Escribir el **copy propio** de `trial_plan_steps` (correos por día) y del tramo post-pago.
5. Ajustar **precios** (C) y **duraciones del ciclo** + ponderación de engagement.
6. Configurar Cron Trigger + secrets del worker (CRON_SECRET, Stripe, Telegram bot).
7. Entrenar/ajustar la **IA (E)** con el dominio del negocio (ventas + soporte).

## Coordinación / lane

- **Diseño de home/novedades/landings + copy de correos + entrenamiento de la IA = marketing
  / Growth Engine (track de ventas).**
- **Implementación técnica de A–E** = ejecutar los planes de `docs/superpowers/plans/`.
- **Infra/dominios/rutas** (landing en `<dominio>`, `/login`→`/`, campañas) = plataforma.
- Este doc es la **vista consolidada**; no reemplaza los specs — los enlaza.
