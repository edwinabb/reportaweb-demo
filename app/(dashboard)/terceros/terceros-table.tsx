"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Trash, FileText, Plus } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTable } from "@/components/ui/data-table"
import { exportToExcel } from "@/lib/utils/export-excel"
import { getColumns } from "./columns"
import { Tercero } from "@/types/terceros"

interface TercerosTableProps {
    data: Tercero[]
    isTrash?: boolean
}

export function TercerosTable({ data, isTrash = false }: TercerosTableProps) {
    const router = useRouter()
    const [globalSearch, setGlobalSearch] = useState("")

    // Búsqueda multicampo: razón social, RUC o nombre comercial,
    // case-insensitive y con coincidencia en cualquier posición.
    const filteredData = useMemo(() => {
        // Vista Papelera: el fetch trae TODO → filtrar inactivos
        const byView = isTrash ? data.filter(t => !t.is_active) : data

        const search = globalSearch.trim().toLowerCase()
        if (!search) return byView

        return byView.filter((t) => {
            const razon = t.razon_social?.toLowerCase() ?? ''
            const ruc = t.ruc?.toLowerCase() ?? ''
            const comercial = t.nombre_comercial?.toLowerCase() ?? ''
            return razon.includes(search) || ruc.includes(search) || comercial.includes(search)
        })
    }, [data, isTrash, globalSearch])

    // Opciones de filtro derivadas de los datos
    const toOptions = (values: (string | undefined)[]) =>
        Array.from(new Set(values.filter(Boolean) as string[]))
            .sort().map(v => ({ label: v, value: v }))

    const tipoOptions = useMemo(() =>
        Array.from(new Set(filteredData.map(t => t.tipo).filter(Boolean) as string[]))
            .sort().map(v => ({ label: v.toUpperCase(), value: v })),
        [filteredData])
    const rubroOptions = useMemo(() => toOptions(filteredData.map(t => t.rubros?.nombre)), [filteredData])

    const columns = useMemo(() => getColumns({ tipoOptions, rubroOptions }), [tipoOptions, rubroOptions])

    return (
        <div className="flex flex-col gap-4">
            <DataTable
                columns={columns}
                data={filteredData}
                hideViewOptions
                toolbarContent={() => (
                    <Input
                        placeholder="Buscar por razón social, RUC o nombre comercial..."
                        value={globalSearch}
                        onChange={(e) => setGlobalSearch(e.target.value)}
                        className="h-8 w-full md:w-[320px]"
                    />
                )}
                customAction={(table) => (
                    <div className="flex items-center gap-2">
                        <Button
                            variant={!isTrash ? "default" : "outline"}
                            size="sm"
                            onClick={() => router.push('/terceros')}
                        >
                            Activos
                        </Button>
                        <Button
                            variant={isTrash ? "default" : "outline"}
                            size="sm"
                            onClick={() => router.push('/terceros?view=trash')}
                        >
                            <Trash className="w-4 h-4 mr-2" />
                            Papelera
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            title="Descargar Excel (lo filtrado)"
                            onClick={() => {
                                const rows = table.getFilteredRowModel().rows.map(r => {
                                    const t = r.original as Tercero
                                    return {
                                        'Razón Social': t.razon_social ?? '',
                                        'ID Tributario': t.ruc ?? '',
                                        'Nombre Comercial': t.nombre_comercial ?? '',
                                        'Tipo': t.tipo ?? '',
                                        'Rubro': t.rubros?.nombre ?? '',
                                        'País': t.paises?.nombre ?? '',
                                        'Dirección': t.direccion ?? '',
                                        'Ubicación': t.ubigeo
                                            ? `${t.ubigeo.distrito}, ${t.ubigeo.departamento}`
                                            : (t.ubicacion_ciudad ?? ''),
                                        'Estado SUNAT': t.estadosunat ?? '',
                                        'Estado': t.is_active ? 'Activo' : 'Inactivo',
                                    }
                                })
                                if (!exportToExcel('TERCEROS', rows)) toast.error('No hay registros para exportar')
                            }}
                        >
                            <FileText className="h-4 w-4 text-green-600" />
                        </Button>
                        {!isTrash && (
                            <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white" onClick={() => router.push('/terceros/new')}>
                                <Plus className="mr-2 h-4 w-4" />
                                Nuevo Tercero
                            </Button>
                        )}
                    </div>
                )}
            />
        </div>
    )
}
