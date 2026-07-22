# Runbook — Rotar tokens expuestos en los settings de Claude Code

**Fecha:** 2026-07-19
**Motivo:** durante la limpieza de reglas de permisos se detectaron **secretos en texto plano**
dentro de los archivos de settings de Claude Code (allowlist de comandos y config del MCP).
Aunque son archivos locales, un secreto que quedó en un allowlist ya "se usó en claro" y
conviene rotarlo. Algunos pertenecen a **otros proyectos** (SerIA, Bubble) — se listan igual.

**Regla de trabajo:** cada rotación de abajo la ejecuta el usuario (implica dashboards y,
en algunos casos, credenciales de otros proyectos). Claude no debe deshabilitar/rotar keys
sin confirmación explícita. Los valores de los tokens NO se repiten completos aquí (solo
prefijo/últimos dígitos) para no re-exponerlos; los valores completos están en los archivos
de settings hasta que se editen (Paso final de cada sección).

---

## Inventario de lo detectado

| # | Secreto | Prefijo…final | Dónde aparece | Proyecto | Riesgo |
|---|---------|---------------|---------------|----------|--------|
| 1 | Supabase PAT (personal access token) | `sbp_bd7c…b370d2` | `~/.claude/settings.json` (regla `Bash(SUPABASE_ACCESS_TOKEN=… npx supabase gen types…)`) | Reporta (project-id `wioozisskjjgjjybsoqo`) | **Alto** — un PAT da acceso a la cuenta Supabase vía CLI/API |
| 2 | Supabase PAT del MCP | `sbp_2135…c4fa0` | `~/.claude/settings.json` → `mcpServers.supabase.args` | Reporta (MCP en uso) | **Alto** — igual que arriba; además está **activo** (lo usa el MCP) |
| 3 | Password de BD Postgres | `BcJ*19n104Sup4b4s3` | `~/.claude/settings.json` (varias reglas `DATABASE_URL=…prisma…`) | **SerIA** (project-ref `ozyxsuayrzreaigqffsq`) | **Alto** — password directo a la BD |
| 4 | Bubble API bearer token | `2539…dbd9` | `reportaweb3/.claude/settings.json` (reglas `curl … reporta.la … Authorization: Bearer …`) | Bubble legacy `reporta.la` | Medio — acceso de lectura a la API Bubble del sistema viejo |
| 5 | JWT `anon` (demo local / SerIA) | `eyJ…` (2 ocurrencias) | `~/.claude/settings.json` (reglas curl con `apikey:`) | demo local / SerIA | **Bajo** — la `anon` es clave pública por diseño; rotarla es opcional |

> **Nota:** el `SUPABASE_SERVICE_ROLE_KEY` / `sb_secret_` de PROD de Reporta NO está aquí;
> su rotación va por el runbook aparte `docs/RUNBOOK-ROTAR-SERVICE-ROLE-PROD.md`
> (DUDA-SEC-001). Este runbook cubre solo lo que apareció en los settings.

---

## 1 y 2 — Supabase PATs (`sbp_…`) de Reporta

Los PAT de Supabase se rotan igual (son tokens de cuenta, no de proyecto).

1. **Supabase Dashboard** → esquina superior derecha → **Account** → **Access Tokens**
   (https://supabase.com/dashboard/account/tokens).
2. Identificá los dos tokens por su fecha/nombre. Si no sabés cuál es cuál, **revocá ambos**
   y creá uno nuevo por uso (uno para el MCP, uno para el CLI si lo seguís usando).
3. **Revoke** los tokens `sbp_bd7c…` (#1) y `sbp_2135…` (#2).
4. **Generate new token** → nombre `mcp-claude-reporta` → copiá el nuevo `sbp_…` (una sola vez).
5. **Actualizar el MCP** (#2, es el que está activo): en `~/.claude/settings.json`,
   `mcpServers.supabase.args`, reemplazar el valor viejo por el nuevo. Alternativa más
   segura: no ponerlo en el arg — usar variable de entorno del MCP:
   ```json
   "mcpServers": {
     "supabase": {
       "command": "npx",
       "args": ["-y", "@supabase/mcp-server-supabase@latest"],
       "env": { "SUPABASE_ACCESS_TOKEN": "sbp_nuevo…" }
     }
   }
   ```
   (revisá la doc del server por si el flag es `--access-token` obligatorio; si lo es, dejalo
   como arg pero con el valor nuevo.)
6. **Borrar la regla con el PAT viejo** (#1): en `~/.claude/settings.json`, eliminar la regla
   `Bash(SUPABASE_ACCESS_TOKEN=sbp_bd7c… npx supabase gen types…)`. Ya no sirve (token
   revocado) y no debe quedar un secreto en el allowlist. Si querés seguir regenerando tipos
   sin prompt, agregá una regla genérica sin secreto: `Bash(npx supabase gen types:*)` y pasá
   el token por env en el momento.
7. Reiniciar Claude Code para que tome el MCP con el token nuevo.

---

## 3 — Password de BD Postgres de SerIA (`BcJ*…`)

Pertenece al proyecto **SerIA** (`ozyxsuayrzreaigqffsq`), no a Reporta. Rotarlo:

1. **Supabase Dashboard** → proyecto SerIA → **Settings → Database** → **Database password**
   → **Reset database password** → generar uno nuevo (guardar en gestor seguro).
2. Actualizar donde se use ese `DATABASE_URL` en SerIA: `.env` locales, secrets de deploy
   (Vercel/Cloudflare/GitHub Actions), Prisma. **No** en un allowlist.
3. **Borrar del allowlist**: en `~/.claude/settings.json`, eliminar las **cuatro** reglas
   `Bash(DATABASE_URL="postgresql://…ozyxsuayrzreaigqffsq:BcJ*…" … prisma …)`. Quedan
   inservibles tras el reset y no deben conservar el password.
4. Si Prisma se sigue corriendo desde acá, agregar una regla genérica sin secreto
   (`Bash(npx prisma migrate deploy)` etc.) y pasar `DATABASE_URL` por env en el momento.

> El `%2A` que aparece en algunas URLs es el `*` URL-encoded (mismo password).

---

## 4 — Bubble API bearer token (`2539…dbd9`)

Token de la API de Bubble del sistema viejo `reporta.la`. Aunque el sistema viejo sigue
operando (no tocar `reporta.la`), el token quedó expuesto:

1. **Bubble** → app `reporta.la` → **Settings → API** → sección **API Tokens**.
2. Revocar/regenerar el token `2539…dbd9`.
3. Si algún script de migración lo usa todavía, actualizarlo por env (`BUBBLE_API_TOKEN`),
   nunca inline.
4. **Borrar del allowlist**: en `reportaweb3/.claude/settings.json`, eliminar las dos reglas
   `Bash(curl … reporta.la … Authorization: Bearer 2539…)`.

> ⚠️ Verificar si `reportaweb3/.claude/settings.json` está **trackeado en git** (ver abajo).
> Si lo está y el token viajó a un commit, además de rotarlo conviene confirmar que el repo
> es privado.

---

## 5 — JWT `anon` (opcional, riesgo bajo)

Las claves `anon` (`eyJ…role":"anon"…`) son **públicas por diseño** (van embebidas en clientes).
No hace falta rotarlas por haber aparecido acá. Solo aplicaría rotarlas si además se planea
migrar a las API keys nuevas (`sb_publishable_`) — y eso, para Reporta PROD, va por el runbook
de DUDA-SEC-001. Para las de demo local / SerIA: dejar como está salvo que se migre el proyecto.

Acción recomendada: **ninguna** (o borrar las reglas curl con `apikey:` del allowlist por
higiene, sin urgencia).

---

## Verificación final (tras rotar y editar los settings)

1. Confirmar que ya no quedan secretos en los settings:
   ```bash
   grep -REn "sbp_|sb_secret_|BcJ\*19n104|2539208d3baeaade" \
     "$HOME/.claude/settings.json" "C:/Proyectos/reportaweb3/.claude/settings.json" \
     "C:/Proyectos/reportaweb3/.claude/settings.local.json"
   ```
   Esperado: **sin resultados** (salvo, si se decide conservar, las `anon` públicas del #5).
2. Validar que los JSON siguen bien formados:
   ```bash
   for f in "$HOME/.claude/settings.json" "C:/Proyectos/reportaweb3/.claude/settings.json" "C:/Proyectos/reportaweb3/.claude/settings.local.json"; do node -e "JSON.parse(require('fs').readFileSync('$f','utf8')); console.log('$f OK')"; done
   ```
3. Reiniciar Claude Code (para el MCP con token nuevo) y probar una operación del MCP Supabase.
4. ¿`reportaweb3/.claude/settings.json` trackeado en git? `git ls-files --error-unmatch .claude/settings.json`
   - Si **sí** y el token de Bubble viajó a commits: rotado el token queda inservible; evaluar
     si vale reescribir historia (probablemente no, si el repo es privado).
   - Si **no**: no hay exposición en git, solo local.

---

## Checklist rápido

> Estado al 2026-07-22 — ejecución del día en [plan-2026-07-22.md](./plan-2026-07-22.md).

- [x] Bloque MCP (`sbp_2135…`) y regla con PAT viejo (`sbp_bd7c…`) **borrados** del allowlist global
- [ ] #1/#2 PATs Supabase **revocados en dashboard** (`sbp_2135…`, `sbp_bd7c…`) — DUDA-SEC-003
- [x] CLI Supabase rotado: `sbp_6fb2…` revocado + reemplazado en `.env.local` + verificado
- [x] `sbp_4832…` revocado (huérfano)
- [ ] #3 Password BD SerIA reseteado + 4 reglas `DATABASE_URL` borradas del allowlist global
- [x] #4 Reglas curl con token Bubble (`2539…`) borradas del allowlist del proyecto
- [ ] #4 **Ampliado (DUDA-SEC-002):** hay 2 tokens Bubble y ambos en git. Rotar en Bubble
      (`2539…` + `5532c3bb…`), poner el nuevo solo en `.env.local`, y limpiar `5532c3bb…`
      de los 4 docs trackeados (ver DUDA-SEC-002 en TECHNICAL_DEBTS.md)
- [ ] #5 (opcional) reglas con `apikey:` anon borradas
- [x] `grep` de verificación sin secretos `sbp_`/Bubble/`BcJ` en settings + JSON válidos
- [x] Confirmado: `reportaweb3/.claude/settings.json` **SÍ trackeado en git** (token Bubble en historia)
