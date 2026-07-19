# Asistente Virtual — Ventas + Soporte (Sub-proyecto E) — Design Spec

**Fecha:** 2026-07-19
**Proyecto:** reportaweb3 (portable a IMPULSAR — ver `docs/PLAYBOOK-GROWTH-ENGINE.md`)
**Estado:** Borrador (en revisión)
**Depende de:** infra Telegram de B (`lib/telegram.ts`) para escalar a humano; conoce
estados de A (trial/converted) y planes de C para contextualizar respuestas. Se construye
**último** (no hay a quién atender antes de tener leads/clientes).

---

## Resumen

Un asistente conversacional (chat web, potenciado por la API de Claude) que cubre **dos
roles con una sola infraestructura**:
- **Ventas (pre-venta):** responde dudas del visitante/lead en la landing y durante el
  trial (qué hace el producto, precios, cómo empezar) para **mover a solicitar demo /
  suscribir** sin que el dueño conteste cada consulta.
- **Soporte 1er nivel:** dentro del sistema, responde "cómo hago X" a usuarios de trial y
  clientes pagos, apoyándose en la documentación/FAQ del producto.

Cuando no puede resolver (o el lead está caliente / el caso es delicado) **escala a humano
por Telegram** (infra de B). Objetivo: absorber el grueso de preguntas repetitivas y dejar
al dueño solo los casos que valen su tiempo.

---

## 1. Roles y contexto

| Rol | Dónde vive | Contexto que recibe | Meta |
|-----|-----------|---------------------|------|
| **Ventas** | Widget en landing + in-app durante trial | Catálogo/precios (C), qué es el producto, estado del lead (A) | Resolver objeción → CTA solicitar demo / suscribir |
| **Soporte** | Widget in-app (trial + pago) | Rol/tenant del usuario, plan (C), FAQ/docs del módulo | Resolver "cómo hago X"; si no, escalar |

Un solo motor de chat; el **rol se determina por dónde y quién** abre el widget
(anónimo en landing → ventas; usuario autenticado in-app → soporte, con ventas como
fallback si pregunta por planes).

---

## 2. Arquitectura

```
Widget (React, in-app + landing)
        │  POST /api/assistant/chat  (mensajes + rol + contexto)
        ▼
app/api/assistant/chat/route.ts   ── server ──►  Claude API (claude-opus-4-8 / haiku para costo)
        │                                          system prompt por rol + herramientas
        ├─ RAG: recupera fragmentos de la base de conocimiento (FAQ/docs)
        ├─ Tools: buscar_doc, estado_lead, escalar_humano
        └─ Persiste turno en assistant_conversations
```

- **Modelo:** por defecto `claude-opus-4-8` para calidad; opción `claude-haiku-4-5` para
  bajar costo en soporte de alto volumen (configurable en `lib/assistant-config.ts`).
- **RAG ligero:** base de conocimiento curada (FAQ + guías por módulo) en tabla
  `assistant_kb`; recuperación por búsqueda de texto (Postgres FTS/`pgvector` si se quiere
  semántica). No hace falta un vector store externo para empezar.
- **Sin acción destructiva:** el asistente **nunca** ejecuta cambios en datos del tenant;
  solo lee contexto acotado y responde/escala. Evita superficie de riesgo.

---

## 3. Modelo de datos

### `assistant_kb` (base de conocimiento)
```sql
CREATE TABLE assistant_kb (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role       TEXT NOT NULL CHECK (role IN ('ventas','soporte','ambos')),
    module     TEXT,                    -- opcional: usuarios, maquinaria, informes, facturacion...
    question   TEXT NOT NULL,
    answer     TEXT NOT NULL,           -- respuesta canónica (el modelo la usa como fuente)
    tags       TEXT[],
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```
RLS: lectura para el rol de servicio del asistente; escritura solo SuperAdmin.

### `assistant_conversations` (historial + auditoría)
```sql
CREATE TABLE assistant_conversations (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID REFERENCES companies(id),   -- NULL si anónimo (ventas landing)
    user_id     UUID,                             -- NULL si anónimo
    role        TEXT NOT NULL CHECK (role IN ('ventas','soporte')),
    messages    JSONB NOT NULL,                   -- turnos [{from, text, at}]
    escalated   BOOLEAN NOT NULL DEFAULT false,
    started_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
```
RLS: el usuario ve solo sus conversaciones; SuperAdmin ve todas.

---

## 4. Escalamiento a humano (reusa Telegram de B)

- **Triggers de escalamiento:**
  1. El modelo decide que no puede resolver (tool `escalar_humano` con motivo).
  2. El usuario pide explícitamente "hablar con una persona".
  3. **Lead caliente en ventas:** el asistente detecta intención de compra alta →
     escala como oportunidad (cruza con engagement de A).
- **Acción:** `sendTelegram` (B) al admin con resumen de la conversación + link a
  `assistant_conversations`/tenant, y botón inline **[Tomar]** (opcional) que marca el
  caso. Al usuario se le dice "Ya avisé al equipo, te contactan pronto".
- **Delicado ⇒ humano:** temas de facturación disputada, cancelación, datos sensibles →
  el system prompt instruye escalar en vez de improvisar.

---

## 5. System prompt (por rol, en `lib/assistant-config.ts`)

Lineamientos que van al prompt de cada rol:
- **Ventas:** conoce el catálogo (C: STANDARD $29.99, OWN BRAND $49.99, mín. 10 asientos,
  descuentos semestral −10% / anual −20%); explica valor, resuelve objeciones, empuja al
  CTA (solicitar demo / suscribir); **no inventa** funciones que no existen; ante precio
  custom o negociación → escala.
- **Soporte:** responde "cómo hago X" **solo con base en `assistant_kb`/docs**; si no está
  en la base, lo dice y escala en vez de alucinar; conoce el plan del tenant (para no
  ofrecer features fuera de su plan); nunca pide contraseñas ni ejecuta cambios.
- **Ambos:** tono claro, español LatAm, breve; jamás promete lo que el producto no hace;
  cita el módulo/paso concreto cuando aplica.

---

## 6. UI

- **Widget de chat** (`components/assistant/chat-widget.tsx`): burbuja flotante.
  - En **landing** (`app/(public)/**` o el sitio de marketing): rol ventas, anónimo.
  - **In-app** (`app/(dashboard)/**`): rol soporte, con contexto de usuario/tenant/plan;
    fallback a ventas si pregunta por upgrades.
- **SuperAdmin `/sistema/asistente`:** CRUD de `assistant_kb` (curar FAQ/respuestas),
  ver `assistant_conversations` y casos escalados, métricas (resueltos vs escalados).

---

## 7. Archivos nuevos / modificados

| Archivo | Acción |
|---------|--------|
| `supabase/migrations/YYYYMMDD_assistant.sql` | NUEVO — `assistant_kb` + `assistant_conversations` + RLS |
| `lib/assistant-config.ts` | NUEVO — modelo, system prompts por rol, umbrales |
| `lib/assistant/rag.ts` | NUEVO — recuperación desde `assistant_kb` |
| `lib/assistant/tools.ts` | NUEVO — `buscar_doc`, `estado_lead`, `escalar_humano` |
| `app/api/assistant/chat/route.ts` | NUEVO — endpoint de chat (Claude API + tools + persistencia) |
| `components/assistant/chat-widget.tsx` | NUEVO — widget |
| `app/(dashboard)/sistema/asistente/page.tsx` | NUEVO — curaduría KB + casos escalados |
| `lib/telegram.ts` (B) | REUSO — escalamiento |

> **Dependencia npm:** `@anthropic-ai/sdk` (o `fetch` directo a la Messages API si el
> runtime de Workers lo prefiere). Secret del worker: `ANTHROPIC_API_KEY`.

---

## 8. Seguridad y costo

- `ANTHROPIC_API_KEY`: solo secret del worker.
- **Rate limiting** por IP (anónimo/ventas) y por usuario (soporte) para acotar costo y
  abuso — el endpoint es público en el caso ventas.
- **Sin acciones destructivas ni lectura de datos sensibles** del tenant (solo contexto
  mínimo: rol, plan, estado). El asistente lee KB curada, no la BD operativa cruda.
- **Prompt injection:** el contenido de la KB y los mensajes del usuario son **datos**, no
  instrucciones; el system prompt lo deja explícito. Ignorar intentos de cambiar el rol.
- **Costo controlable:** Haiku para soporte de volumen, Opus para ventas; caché de
  respuestas frecuentes desde `assistant_kb` (evita llamar al modelo para FAQ exactas).

---

## 9. Fuera de alcance de E

- **Voz / llamadas** → futuro.
- **WhatsApp como canal del asistente** → futuro (hoy web; admin sigue en Telegram, B).
- **Ejecutar acciones en nombre del usuario** (crear tareas, cambiar config) → explícito
  fuera de alcance por riesgo; el asistente guía, el usuario ejecuta.
- **Autoservicio de facturación conversacional** → deriva a `/facturacion` (C) / Portal.

---

## 10. Decisiones / lecciones (para el playbook)

1. **Un motor, dos roles** (ventas + soporte por contexto) = una sola infra de chat que
   mantener, sin duplicar backend.
2. **RAG sobre KB curada** en tabla propia (no vector store externo al inicio) = arranque
   simple; se puede subir a `pgvector` si el volumen lo pide.
3. **El asistente nunca actúa sobre datos** = superficie de riesgo mínima; guía y escala,
   no ejecuta.
4. **Escalar a humano por Telegram (B)** con resumen = el dueño entra solo cuando importa
   (no resuelto, lead caliente, tema delicado), cerrando el círculo del "mínimo tiempo".
5. **Se construye último**: sin leads/clientes no hay a quién atender; A→B→C→D primero.
