# Playbook — Estrategia de dominios y home de un SaaS (portable)

> Definido en **Reporta** (2026-07-22). Reusable en **Impulsar** y cualquier otro SaaS del
> ecosistema. Reemplazá `<dominio>` por el apex del proyecto (`reportar.app`, `impulsar.app`, …).

## Principios

1. **Un solo dominio de cara al cliente.** Landing + login + app conviven en el **apex**
   `<dominio>`. **No** usar subdominio `app.<dominio>`: dos destinos ("doble app") confunden
   al cliente. El cliente conoce un solo lugar.
2. **Login embebido en la home, no en `/login` aislado.** Si el login vive en `/login`, el
   usuario lo bookmarkea y nunca más ve la vitrina. Poniéndolo en `/` lo obligás a pasar por
   la portada (novedades, campañas) en cada regreso. `/login` se mantiene como **301 → `/`**
   por compatibilidad (bookmarks viejos, APK, reset de contraseña, "sesión expirada").
3. **Novedades / changelog público** (`/novedades`) para que clientes y leads vean qué
   cambió. Sumar un **badge de novedades dentro de la app** (post-login) para el power-user
   que pasa la home de largo.
4. **Landings de campaña bajo namespace propio** (`/<pfx>-<campaña>` o `/<carpeta>/<campaña>`).
   El namespace evita colisión con las rutas de módulos de la app (`/planificacion`,
   `/valoraciones`, …) — así **no hay que mover ni refactorizar la app**, y medís tráfico de
   ads por el prefijo. **El prefijo exacto es decisión de marca/marketing** (que suene a "info
   clave", no a embudo): candidatos `soluciones/`, `conoce-`, `guia-`. El constraint técnico
   (namespace no-colisionante) es lo que está fijo; el nombre es cosmético.
5. **Trial secuencial, sin forzar** (`/registro`): el visitante puede arrancar su prueba
   desde la home sin fricción; los usuarios actuales entran por el login de la misma home.
6. **URL base por entorno, nunca hardcodeada.** Toda referencia al dominio sale de
   `NEXT_PUBLIC_SITE_URL` (build-time, cliente) y de las `[vars]` del worker (runtime,
   server: crons, emails). Fallback en código al apex de prod. Un dominio hardcodeado =
   emails/OG/links rotos al cambiar de entorno.
7. **Entorno interno = `dev.<dominio>`, no `demo.`** "dev" comunica que es interno del
   equipo; "demo" sugiere algo para mostrar a clientes.

## Estándar de rutas (apex `<dominio>`)

| Ruta | Qué | Acceso |
|---|---|---|
| `/` | Home: login embebido + novedades + CTA trial | Público |
| `/login` | 301 → `/` | Público |
| `/novedades` | Changelog | Público |
| `/<pfx>-<campaña>` | Landing de campaña (ads); prefijo = decisión de marca | Público |
| `/registro` | Alta de trial secuencial | Público |
| rutas de módulos | La app | Auth |

- `www.<dominio>` → 301 → apex.
- Middleware: redirigir no-autenticados a `/` (no a `/login`).

## Infra / costos (Cloudflare Workers + OpenNext)

- **Medir el tamaño real del worker** antes de asumir plan: el build **remoto** puede ser
  ~6-7x el local (source maps de CI inflan el bundle). Número que cuenta = **gzip** del
  build remoto, visible en el dashboard (Workers & Pages → worker → Builds → build → log:
  `Total Upload / gzip`). Local se mide con `wrangler deploy --dry-run` pero **no representa
  al remoto**.
- **Límites:** Free ≤ **1 MB** gzip · Paid ≤ **10 MB** gzip. Con SSR de Next + source maps,
  es normal superar 1 MB → **Workers Paid** ($5/mes).
- **Workers Paid es por CUENTA, no por worker.** Una suscripción cubre **todos** los workers
  (dev + prod). No existe "dev free + prod paid" en la misma cuenta. Prod SSR necesita Paid
  igual por el límite de **CPU 10ms/request** del Free → asumí Paid y dev viaja incluido.
- `minify = true` en `wrangler.toml` es obligatorio para no exceder el límite.
- Deploy = push al repo GitHub conectado (Workers Builds), no `wrangler deploy` local.

## Checklist para aplicar a un proyecto nuevo

- [ ] Definir apex `<dominio>` (prod) y `dev.<dominio>` (interno).
- [ ] `NEXT_PUBLIC_SITE_URL` + `NEXT_PUBLIC_APP_URL` en: `.env.production`, `.env.demo`/dev,
      y las `[vars]` de cada `wrangler.<env>.toml`.
- [ ] `git grep` de cualquier dominio hardcodeado → reemplazar por
      `process.env.NEXT_PUBLIC_SITE_URL ?? 'https://<dominio>'` (layout/metadata, OG, emails,
      crons, links).
- [ ] `app/page.tsx` = home con login embebido + novedades + CTA trial.
- [ ] `/login` → 301 a `/`; middleware redirige no-auth a `/`.
- [ ] `app/novedades/`, `app/<pfx>-<campaña>/` (contenido + prefijo = track de marketing/ventas).
- [ ] Cloudflare: importar repo a Workers Builds, secret `service_role`, bindear apex +
      `dev.` + redirect `www`.
- [ ] Medir gzip del build remoto en el dashboard; confirmar plan (Free vs Paid por cuenta).

## Límite de responsabilidad

La **infra/dominios** (env vars, rutas, redirects, binding) es trabajo de plataforma. El
**diseño de home, novedades, landings y la UX del trial** es **marketing/ventas (Growth
Engine)** — coordinar con ese track para no colisionar. Enganche técnico: `app/page.tsx`,
`app/novedades/`, `app/<pfx>-*/` (campañas) → CTAs a `/registro` y `/login`.
