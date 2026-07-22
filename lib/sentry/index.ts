'use client'

import * as Sentry from '@sentry/nextjs'

// ── Mapeo de rutas → sección del sidebar ──────────────────────────────────────

export function seccionDesdePath(path: string): string {
    const p = path.toLowerCase()

    if (p.startsWith('/planificacion'))  return 'PLANIFICACION'
    if (p.startsWith('/cotizaciones'))   return 'COTIZACIONES'
    if (p.startsWith('/ventas'))         return 'VENTAS'
    if (p.startsWith('/compras'))        return 'COMPRAS'
    if (p.startsWith('/formatos') ||
        p.startsWith('/informes'))       return 'FORMATOS'
    if (p.startsWith('/epp'))            return 'EPP'
    if (p.startsWith('/terceros'))       return 'TERCEROS'
    if (p.startsWith('/maquinarias'))    return 'MAQUINARIA'
    if (p.startsWith('/planes-accion'))  return 'PLANES_ACCION'
    if (p.startsWith('/users'))          return 'USUARIOS'
    if (p.startsWith('/settings'))       return 'SETTINGS'
    if (p.startsWith('/sistema') ||
        p.startsWith('/admin'))          return 'SISTEMA'
    if (p.startsWith('/aprobacion'))     return 'APROBACION'
    if (p.startsWith('/login') ||
        p.startsWith('/select-tenant') ||
        p.startsWith('/auth'))           return 'AUTH'

    return 'GENERAL'
}

// ── Actualiza el scope global con el contexto de la ruta actual ───────────────

export function setSentryRouteContext(pathname: string) {
    const section = seccionDesdePath(pathname)
    Sentry.setTag('page', pathname)
    Sentry.setTag('section', section)
}

// ── Encabezado legible para mensajes manuales ─────────────────────────────────
// Formato: "[Reporta Web | SECCION | /ruta]"

// ── Captura de excepción con contexto completo ────────────────────────────────

export function captureWithContext(
    error: unknown,
    pathname: string,
    extra?: Record<string, unknown>,
) {
    const section = seccionDesdePath(pathname)
    Sentry.withScope((scope) => {
        scope.setTag('project', 'Reporta Web')
        scope.setTag('section', section)
        scope.setTag('page', pathname)
        if (extra) scope.setContext('debug', extra)
        scope.captureException(error)
    })
}
