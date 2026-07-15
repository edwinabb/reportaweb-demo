'use client'

import { useMemo, useState } from "react"
import { Profile } from "@/types"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Trash, RotateCcw, Plus, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { ColumnFilterHeader } from "@/components/ui/column-filter-header"
import { exportToExcel } from "@/lib/utils/export-excel"
import { restoreProfile } from "@/lib/actions/users"
import { UserActions } from "@/components/users/user-actions"

interface UsersClientProps {
    users: Profile[]
    isTrash?: boolean
}

export function UsersClientPage({ users, isTrash = false }: UsersClientProps) {
    const router = useRouter()
    const [globalSearch, setGlobalSearch] = useState("")

    // Búsqueda multicampo: nombre completo, nro de documento o email,
    // case-insensitive y con coincidencia en cualquier posición.
    const filteredUsers = useMemo(() => {
        const byView = isTrash
            ? users.filter(u => !u.is_active)
            : users.filter(u => u.is_active)

        const search = globalSearch.trim().toLowerCase()
        if (!search) return byView

        return byView.filter((user) => {
            const name = (user.full_name || `${user.first_name || ''} ${user.last_name || ''}`).toLowerCase()
            const doc = user.doc_number?.toLowerCase() ?? ''
            const email = user.email?.toLowerCase() ?? ''
            return name.includes(search) || doc.includes(search) || email.includes(search)
        })
    }, [users, isTrash, globalSearch])

    // Opciones de filtro derivadas de los datos
    const cargoOptions = useMemo(() =>
        Array.from(new Set(filteredUsers.map(u => u.cargo).filter(Boolean) as string[]))
            .sort().map(c => ({ label: c, value: c })),
        [filteredUsers])
    const proveedorOptions = useMemo(() =>
        Array.from(new Set(filteredUsers.map(u => (u as any).tercero?.razon_social).filter(Boolean) as string[]))
            .sort().map(p => ({ label: p, value: p })),
        [filteredUsers])

    const includesFilter = (row: any, id: string, value: string[]) => {
        if (!value || value.length === 0) return true
        return value.includes(String(row.getValue(id) ?? ''))
    }

    const columns: ColumnDef<Profile>[] = [
        {
            accessorKey: "doc_number",
            header: "Nro. Documento",
            cell: ({ row }) => row.original.doc_number
                ? <span>{row.original.doc_number}</span>
                : <span className="text-muted-foreground text-xs">—</span>
        },
        {
            accessorKey: "email",
            header: "Email",
        },
        {
            accessorKey: "full_name",
            header: "Nombre",
            cell: ({ row }) => {
                const u = row.original
                const name = u.full_name || `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email || '—'
                // Estándar: nombre en rojo cuando el registro está inactivo
                return <span className={cn(!u.is_active && "text-red-600 font-medium")}>{name}</span>
            }
        },
        {
            accessorKey: "cargo",
            header: ({ column }) => (
                <ColumnFilterHeader
                    title="Cargo"
                    options={cargoOptions}
                    selected={(column.getFilterValue() as string[]) ?? []}
                    onChange={(v) => column.setFilterValue(v.length ? v : undefined)}
                />
            ),
            cell: ({ row }) => row.original.cargo
                ? <span className="text-sm">{row.original.cargo}</span>
                : <span className="text-muted-foreground text-xs">—</span>,
            filterFn: includesFilter,
        },
        {
            accessorKey: "role",
            header: ({ column }) => (
                <ColumnFilterHeader
                    title="Rol"
                    options={[
                        { label: "Admin Tenant", value: "admin_tenant" },
                        { label: "Supervisor", value: "supervisor" },
                        { label: "Planner", value: "planner" },
                        { label: "Member", value: "member" },
                        { label: "Viewer", value: "viewer" },
                    ]}
                    selected={(column.getFilterValue() as string[]) ?? []}
                    onChange={(v) => column.setFilterValue(v.length ? v : undefined)}
                />
            ),
            cell: ({ row }) => {
                const role = row.getValue("role") as string
                return (
                    <Badge variant="outline" className="capitalize">
                        {role?.replace('_', ' ') || 'N/A'}
                    </Badge>
                )
            },
            filterFn: includesFilter,
        },
        {
            id: "tercero",
            accessorFn: (row) => (row as any).tercero?.razon_social ?? '',
            header: ({ column }) => (
                <ColumnFilterHeader
                    title="Proveedor"
                    options={proveedorOptions}
                    selected={(column.getFilterValue() as string[]) ?? []}
                    onChange={(v) => column.setFilterValue(v.length ? v : undefined)}
                />
            ),
            cell: ({ row }) => {
                const proveedor = (row.original as any).tercero?.razon_social
                return proveedor
                    ? <span>{proveedor}</span>
                    : <span className="text-muted-foreground text-xs">—</span>
            },
            filterFn: includesFilter,
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const user = row.original

                const handleRestore = async () => {
                    if (confirm("¿Restaurar este usuario?")) {
                        const res = await restoreProfile(user.id)
                        if (res.success) {
                            toast.success("Usuario restaurado")
                            router.refresh()
                        } else {
                            toast.error(res.message)
                        }
                    }
                }

                if (isTrash) {
                    return (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleRestore}
                            className="bg-green-50 hover:bg-green-100 text-green-700"
                        >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Restaurar
                        </Button>
                    )
                }

                return <UserActions user={user} />
            }
        }
    ]

    return (
        <div className="flex flex-col gap-4">

            <div>
                <DataTable
                    columns={columns}
                    data={filteredUsers}
                    hideViewOptions
                    toolbarContent={() => (
                        <Input
                            placeholder="Buscar por nombre, documento o email..."
                            value={globalSearch}
                            onChange={(e) => setGlobalSearch(e.target.value)}
                            className="h-8 w-full md:w-[280px]"
                        />
                    )}
                    customAction={(table) => (
                        <div className="flex items-center gap-2">
                            <Button
                                variant={!isTrash ? "default" : "outline"}
                                size="sm"
                                onClick={() => router.push('/users')}
                            >
                                Activos
                            </Button>
                            <Button
                                variant={isTrash ? "default" : "outline"}
                                size="sm"
                                onClick={() => router.push('/users?view=trash')}
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
                                        const u = r.original as Profile
                                        return {
                                            'Nro. Documento': u.doc_number ?? '',
                                            'Email': u.email,
                                            'Nombre': u.full_name || `${u.first_name || ''} ${u.last_name || ''}`.trim(),
                                            'Cargo': u.cargo ?? '',
                                            'Rol': u.role ?? '',
                                            'Proveedor': (u as any).tercero?.razon_social ?? '',
                                            'Estado': u.is_active ? 'Activo' : 'Inactivo',
                                        }
                                    })
                                    if (!exportToExcel('USUARIOS', rows)) toast.error('No hay registros para exportar')
                                }}
                            >
                                <FileText className="h-4 w-4 text-green-600" />
                            </Button>
                            {!isTrash && (
                                <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white" onClick={() => router.push('/users/create')}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Nuevo Usuario
                                </Button>
                            )}
                        </div>
                    )}
                />
            </div>
        </div>
    )
}
