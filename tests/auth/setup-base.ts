import { test as setup, expect } from '@playwright/test'
import path from 'path'
import fs from 'fs'

const MAX_AUTH_AGE_HOURS = 0.75 // 45 min — Supabase JWT TTL = 60 min; suite runs ~26 min

/**
 * Lógica compartida de login para los 3 setups de rol.
 * Guarda el storageState en el archivo indicado.
 * Salta el login si el archivo es reciente (< MAX_AUTH_AGE_HOURS).
 */
export function createAuthSetup(opts: {
    emailEnvVar: string
    passwordEnvVar: string
    storageFile: string
}) {
    setup(`authenticate [${opts.emailEnvVar}]`, async ({ page }) => {
        // Admin tenant needs more time due to multiple tenants/perms
        if (opts.emailEnvVar === 'TEST_REPORTA_ADMIN_EMAIL') {
            setup.setTimeout(60_000) // 60s for admin tenant
        }
        // Skip re-login if storage state is still fresh
        try {
            const stat = fs.statSync(opts.storageFile)
            if ((Date.now() - stat.mtimeMs) < MAX_AUTH_AGE_HOURS * 3600_000) {
                console.log(`[setup] Auth file fresh — skipping login for ${opts.emailEnvVar}`)
                return
            }
        } catch { /* file doesn't exist — proceed with login */ }

        const email = process.env[opts.emailEnvVar]
        const password = process.env[opts.passwordEnvVar]

        if (!email || !password) {
            throw new Error(
                `Missing ${opts.emailEnvVar} / ${opts.passwordEnvVar}. ` +
                'Completá .env.test con las credenciales del usuario de test. ' +
                'Ver TESTING.md para detalles.',
            )
        }

        // Asegurarse de que el directorio .auth existe
        const dir = path.dirname(opts.storageFile)
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

        await page.goto('/login')
        await page.fill('input[name="email"], input[type="email"]', email)
        await page.fill('input[name="password"], input[type="password"]', password)
        await page.click('button[type="submit"]')

        // Después del login el action redirige a /planificacion (usuarios normales)
        // o a /select-tenant (admin_tenant de REPORTA). Cualquier URL fuera de /login es válida.
        // Admin tenant (info@reporta.la) tarda más por múltiples tenants/permisos
        const isAdminTenant = email === 'info@reporta.la'
        const timeout = isAdminTenant ? 45_000 : 15_000
        await page.waitForURL(url => !url.pathname.startsWith('/login'), { timeout })

        if (page.url().endsWith('/select-tenant')) {
            const firstTenant = page.locator('[data-testid="tenant-card"], button:has-text("Entrar")').first()
            await firstTenant.click()
            await page.waitForURL('/', { timeout: 10_000 })
        }

        await expect(page.locator('body')).not.toContainText('Application error', { timeout: 5_000 })

        // Strip permission/timezone cookies so each test fetches fresh state via RPC.
        // If rw3_bloqueadas is saved here it reflects DB state at login time and becomes stale.
        const allCookies = await page.context().cookies()
        const authOnly = allCookies.filter(c => !['rw3_bloqueadas', 'rw3_timezone'].includes(c.name))
        await page.context().clearCookies()
        await page.context().addCookies(authOnly)

        await page.context().storageState({ path: opts.storageFile })
    })
}
