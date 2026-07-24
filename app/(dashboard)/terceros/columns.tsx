"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Tercero } from "@/types/terceros"
import { Badge } from "@/components/ui/badge"
import { ColumnFilterHeader, ColumnFilterOption } from "@/components/ui/column-filter-header"
import { TerceroActions } from "@/components/terceros/tercero-actions"
import { cn } from "@/lib/utils"

interface TerceroFilterOptions {
    tipoOptions: ColumnFilterOption[]
    rubroOptions: ColumnFilterOption[]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const includesFilter = (row: any, id: string, value: string[]) => {
    if (!value || value.length === 0) return true
    return value.includes(String(row.getValue(id) ?? ''))
}

export const getColumns = (filters: TerceroFilterOptions): ColumnDef<Tercero>[] => [
    {
        accessorKey: "logo_url",
        header: "Logo",
        cell: ({ row }) => {
            const logo = row.getValue("logo_url") as string
            if (!logo) return <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center text-xs">Sin</div>
            // Path relativo → construir URL pública de Supabase Storage (bucket 'tercero')
            const src = logo.startsWith('http')
                ? logo
                : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/tercero/${logo}`
            // eslint-disable-next-line @next/next/no-img-element
            return <img src={src} alt="Logo" className="w-10 h-10 object-contain rounded-md border" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
        }
    },
    {
        accessorKey: "razon_social",
        header: "Razón Social",
        cell: ({ row }) => (
            // Estándar: nombre en rojo cuando el registro está inactivo
            <span className={cn(!row.original.is_active && "text-red-600 font-medium")}>
                {row.original.razon_social}
            </span>
        ),
    },
    {
        accessorKey: "ruc",
        header: "ID Tributario",
    },
    {
        id: "rubro",
        accessorFn: (row) => row.rubros?.nombre ?? '',
        header: ({ column }) => (
            <ColumnFilterHeader
                title="Rubro"
                options={filters.rubroOptions}
                selected={(column.getFilterValue() as string[]) ?? []}
                onChange={(v) => column.setFilterValue(v.length ? v : undefined)}
            />
        ),
        cell: ({ row }) => row.original.rubros?.nombre || "N/A",
        filterFn: includesFilter,
    },
    {
        accessorKey: "pais_id",
        header: "País",
        cell: ({ row }) => row.original.paises?.nombre.toUpperCase() || row.getValue("pais_id") || "N/A"
    },
    {
        accessorKey: "tipo",
        header: ({ column }) => (
            <ColumnFilterHeader
                title="Tipo"
                options={filters.tipoOptions}
                selected={(column.getFilterValue() as string[]) ?? []}
                onChange={(v) => column.setFilterValue(v.length ? v : undefined)}
            />
        ),
        cell: ({ row }) => {
            const tipo = row.getValue("tipo") as string
            return (
                <Badge variant="secondary" className="uppercase">
                    {tipo?.toLowerCase() === 'ambos' ? 'CL/PR' : tipo?.substring(0, 2)}
                </Badge>
            )
        },
        filterFn: includesFilter,
    },
    {
        // Estado del contribuyente (SUNAT) — campo de negocio, distinto de is_active;
        // no cae bajo la regla 6b del template (docs/auditoria-ui/03-terceros.md)
        accessorKey: "estadosunat",
        header: "Estado SUNAT",
        cell: ({ row }) => {
            const estado = row.getValue("estadosunat") as string | null
            return estado ? <Badge variant="outline">{estado}</Badge> : "—"
        }
    },
    {
        accessorKey: "direccion",
        header: "Dirección",
        cell: ({ row }) => <div className="max-w-[150px] truncate">{row.getValue("direccion")}</div>
    },
    {
        id: "ubicacion",
        header: "Ubicación",
        cell: ({ row }) => {
            const u = row.original.ubigeo
            if (u) return `${u.distrito}, ${u.departamento}`
            return row.original.ubicacion_ciudad || "N/A"
        }
    },
    {
        id: "actions",
        cell: ({ row }) => <TerceroActions tercero={row.original} />,
    },
]
