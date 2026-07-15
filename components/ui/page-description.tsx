/**
 * Descripción breve estándar de página. Reemplaza breadcrumb + título.
 * Ver docs/UI-TEMPLATE-LISTADOS.md.
 */
export function PageDescription({ children }: { children: React.ReactNode }) {
    return <p className="text-sm text-muted-foreground">{children}</p>
}
