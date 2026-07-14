import path from "node:path";
import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  // Pin del root de Turbopack al directorio del proyecto. Sin esto Next 16
  // asciende hasta `c:\Proyectos` buscando un workspace y rompe el resolver
  // de PostCSS: "Can't resolve 'tailwindcss' in 'c:\\Proyectos'" porque
  // ese parent tiene varios proyectos sueltos pero ningún package.json.
  turbopack: {
    root: path.resolve(__dirname),
  },

  async headers() {
    return [
      // Cloudflare cache headers for static assets
      {
        source: '/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // Cloudflare cache headers for images
      {
        source: '/:path*.(jpg|jpeg|png|gif|svg|webp|avif)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // Cloudflare cache headers for fonts
      {
        source: '/fonts/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // Cache HTML for 5 minutes, then revalidate with Cloudflare
      // See: docs/TECHNICAL_DEBTS.md § DUDA-CACHE-001
      {
        source: '/:path*\\.html',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=300, must-revalidate' },
        ],
      },
      // Cache HTML routes (app directory) for 5 minutes, then revalidate
      {
        source: '/((?!_next|static|api).*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=300, must-revalidate' },
        ],
      },
      // No cache for API routes
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'private, no-cache, no-store, must-revalidate' },
        ],
      },
      // Security and CSP headers
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.supabase.co https://o4507*.ingest.sentry.io",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://*.supabase.co",
              "font-src 'self' data:",
              "connect-src 'self' https://*.supabase.co https://*.sentry.io wss://*.supabase.co",
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'timbhcrbisxeniquwwmm.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'wioozisskjjgjjybsoqo.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  sourcemaps: { disable: true },
  // disableLogger fue deprecado; su reemplazo (webpack.treeshake.removeDebugLogging)
  // no funciona con Turbopack, así que se omite. Solo afecta tree-shaking de logs
  // internos de Sentry (~1-2 KB en el bundle).
});
