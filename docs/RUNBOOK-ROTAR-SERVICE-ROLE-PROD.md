# Runbook — Rotar SERVICE_ROLE_KEY de PROD (DUDA-SEC-001)

**Objetivo:** invalidar la `service_role` legacy de PROD que estuvo expuesta en git,
sin romper la `anon` key embebida en los APKs instalados de reporta-app.

**Proyecto PROD:** `fqwhagryqkkhbgznxtwf` (Brazil)
**Worker que la consume:** `reportaweb-live` (Cloudflare) · secret `SUPABASE_SERVICE_ROLE_KEY`
**Prioridad:** ALTA · **Esfuerzo:** ~15–20 min

---

## 📍 Estado actual (2026-07-22)

- [x] **Paso 1** — proyecto ofrece el sistema nuevo de API keys ✅
- [x] **Paso 2** — `sb_secret_` creada por el usuario ✅ · `sb_publishable_` también ✅
- [x] **anon → `sb_publishable_`** aplicada en `.env.production` **y** `wrangler.live.toml`
      (la anon vivía en 2 archivos) — release **v3.11.5** pusheado a `origin`/`demo`/`live`
- [ ] **Paso 3** — cargar `SUPABASE_SERVICE_ROLE_KEY=sb_secret_` en el worker `reportaweb-live`
      *(dashboard, usuario)* — **acoplado a crear el entorno Cloudflare de prod** (`reportar.app`
      apex aún no existe en Cloudflare; ver TECHNICAL_DEBTS)
- [ ] **Paso 4** — verificar login + acción admin server-side sin 401/403
- [ ] **Paso 5** — deshabilitar las legacy keys (⚠️ solo DESPUÉS del Paso 4)
- [ ] **Paso 6** — cerrar DUDA-SEC-001 ✅ + `git grep sb_secret_` vacío (ya está vacío)

> **Nota:** como no hay clientes en prod, si el dashboard no deja deshabilitar solo la
> `service_role`, es seguro deshabilitar las legacy en bloque (Ruta B no requiere esperar
> adopción de APK). Confirmar con el usuario antes de ejecutar.

---

## ⚠️ Regla de oro (leer antes de tocar nada)

**NUNCA uses "Reset JWT secret" / "Legacy JWT Secret → Roll".**
La `anon` y la `service_role` legacy derivan del **mismo** JWT secret. Resetearlo
invalida también la `anon` key que está **embebida en los APKs ya instalados** de
reporta-app → todos los usuarios de la app móvil quedan sin poder autenticar hasta
que actualicen el APK. Eso es un incidente, no una rotación.

La ruta segura usa el **nuevo sistema de API keys** de Supabase (`sb_secret_…` /
`sb_publishable_…`), que permite rotar la parte server-side sin tocar la anon legacy.

---

## Paso 0 — Preparación (5 min)

1. Confirma quién más consume la `service_role` de PROD además del worker `reportaweb-live`:
   - Cloudflare worker `reportaweb-live` (secret `SUPABASE_SERVICE_ROLE_KEY`). ✅ principal
   - `.env.local` local, línea ~20 (`PROD_SUPABASE_SERVICE_ROLE_KEY`, copia comentada).
   - ¿Algún cron job / n8n / edge function que use la key de PROD? Revisar antes de deshabilitar.
   > Si aparece otro consumidor, súmalo a la lista del Paso 4 antes de deshabilitar la legacy.
2. Ten a mano acceso a: **Supabase Dashboard** (PROD) y **Cloudflare Dashboard**
   (Workers & Pages → reportaweb-live).

---

## Paso 1 — Verificar que el proyecto ofrece el nuevo sistema de API keys

Supabase Dashboard → proyecto **PROD** → **Settings → API Keys**.

Deberías ver dos zonas:
- **API keys** (nuevas): `Publishable key` (`sb_publishable_…`) y opción de crear
  `Secret keys` (`sb_secret_…`).
- **Legacy API keys**: la `anon` y la `service_role` clásicas (JWT).

**Punto de decisión:**
- ✅ Si ves la sección de **Secret keys** nuevas → continúa al Paso 2 (ruta segura).
- ❌ Si el proyecto **todavía no** ofrece secret keys nuevas → **NO** resetees el JWT
  secret. Detente y evalúa la ruta alternativa (ver "Ruta B" al final). El riesgo de
  la fuga (repos privados, key ya retirada del árbol) es acotado; es preferible esperar
  a tener el sistema nuevo que romper los APKs.

---

## Paso 2 — Crear la nueva Secret key server-side (ruta segura)

1. En **Settings → API Keys → Secret keys** → **Create new secret key**.
2. Nombre sugerido: `reportaweb-live-server` (para saber quién la usa).
3. Copia el valor `sb_secret_…` **una sola vez** (no se vuelve a mostrar).
   Guárdalo temporalmente en un gestor seguro, **no** en git ni en `.env` commiteado.

> Esta key tiene privilegios equivalentes a `service_role` (bypassa RLS). Trátala igual.

---

## Paso 3 — Actualizar el secret del worker `reportaweb-live`

1. Cloudflare Dashboard → **Workers & Pages → reportaweb-live → Settings → Variables and Secrets**.
2. Edita el secret **`SUPABASE_SERVICE_ROLE_KEY`** → pega el nuevo valor `sb_secret_…`.
   - (El código usa la misma variable de entorno; solo cambia el valor, no el nombre.)
3. Guarda. Cloudflare re-despliega el worker con el nuevo secret.
4. Actualiza también tu **`.env.local`** local:
   - `PROD_SUPABASE_SERVICE_ROLE_KEY=sb_secret_…` (reemplaza la copia comentada de la línea ~20).
   - ⚠️ Verifica que `.env.local` esté en `.gitignore` (lo está) — **no** commitear.

> Alternativa CLI (si prefieres terminal):
> `npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY --config wrangler.live.toml`
> (pega el valor cuando lo pida). Requiere estar logueado en wrangler.

---

## Paso 4 — Verificar que live funciona con la nueva key ANTES de deshabilitar la vieja

**No deshabilites la legacy hasta confirmar esto.** Orden importa.

1. Espera a que el worker `reportaweb-live` termine de re-desplegar (~1 min).
2. Prueba una operación server-side que use la service_role en live.reportar.app
   (o el entorno donde esté enrutado el worker): login + una acción admin (ej. listar
   usuarios / generar un informe). Si live aún no tiene dominio enrutado, prueba el
   worker por su URL `*.workers.dev`.
3. Revisa logs del worker (Cloudflare → reportaweb-live → Logs) buscando errores
   401/403 de Supabase. Cero errores = la nueva key funciona.

---

## Paso 5 — Deshabilitar / revocar la legacy `service_role`

Solo cuando el Paso 4 esté ✅.

1. Supabase Dashboard → **Settings → API Keys → Legacy API keys**.
2. Busca la opción para **la `service_role` legacy específicamente**:
   - Si el Dashboard permite **deshabilitar/revocar solo la `service_role`** → hazlo.
     La `anon` legacy sigue viva → los APKs no se rompen. ✅ Fin de la rotación.
   - ⚠️ Si la única opción es **"Disable legacy API keys"** en bloque (anon + service_role
     juntas) → **NO** la deshabilites todavía: eso también mataría la `anon` de los APKs.
     En ese caso ve a "Ruta B".

---

## Paso 6 — Cierre

1. Actualiza `docs/TECHNICAL_DEBTS.md` → DUDA-SEC-001 a **✅ RESUELTO** con fecha.
2. Confirma que la nueva `sb_secret_…` **no** quedó en ningún archivo commiteado
   (`git grep sb_secret_` debe dar vacío).
3. La key vieja sigue en el **historial de git**, pero ya está **revocada** → inservible.
   No hace falta reescribir historia (repos privados + key muerta).

---

## Ruta B — Si NO se puede deshabilitar la `service_role` legacy por separado

Esto ocurre si el proyecto solo ofrece el toggle en bloque, o aún no tiene secret keys
nuevas. La `anon` legacy está en los APKs, así que hay que migrar la app **antes** de
apagar las legacy:

1. Crea `sb_publishable_…` (reemplazo de `anon`) y `sb_secret_…` (reemplazo de `service_role`).
2. **reporta-app:** cambia la `anon` embebida por la `sb_publishable_…`, publica un nuevo
   APK/AAB y **espera adopción** (usa `min_app_version` para forzar actualización si aplica).
3. Actualiza el worker `reportaweb-live` con la `sb_secret_…` (Paso 3).
4. Cuando la telemetría muestre que casi nadie usa la `anon` legacy (logs de auth),
   recién ahí **deshabilita las legacy en bloque**.

> Ruta B es más larga (depende de release de app). Mientras tanto la fuga sigue mitigada
> por ser repos privados. Documentar el estado intermedio en DUDA-SEC-001.

---

## Checklist rápido

- [ ] Confirmados todos los consumidores de la service_role PROD (Paso 0)
- [ ] Proyecto ofrece Secret keys nuevas (Paso 1)
- [ ] Creada `sb_secret_…` (Paso 2)
- [ ] Secret del worker `reportaweb-live` actualizado (Paso 3)
- [ ] `.env.local` local actualizado, sin commitear (Paso 3)
- [ ] Live probado OK con la nueva key, sin 401/403 (Paso 4)
- [ ] Legacy `service_role` deshabilitada individualmente (Paso 5) — o Ruta B en curso
- [ ] DUDA-SEC-001 marcada ✅ y `git grep sb_secret_` vacío (Paso 6)
