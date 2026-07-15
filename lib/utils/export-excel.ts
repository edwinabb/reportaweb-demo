import * as XLSX from 'xlsx'
import { format } from 'date-fns'

/**
 * Exporta filas a Excel con el nombre estándar: PAGINA-AAAA-MM-DD-HH-MM.xls
 * (ej: USUARIOS-2026-07-14-20-06.xls). Solo cliente (dispara descarga).
 * Ver docs/UI-TEMPLATE-LISTADOS.md.
 */
export function exportToExcel(pageName: string, rows: Record<string, unknown>[]): boolean {
    if (!rows.length) return false

    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    // Nombre de hoja: máx 31 caracteres (límite de Excel)
    XLSX.utils.book_append_sheet(wb, ws, pageName.slice(0, 31))

    const slug = pageName
        .normalize('NFD').replace(/[̀-ͯ]/g, '') // sin tildes
        .toUpperCase().replace(/\s+/g, '-')
    const fileName = `${slug}-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.xls`
    XLSX.writeFile(wb, fileName, { bookType: 'xls' })
    return true
}
