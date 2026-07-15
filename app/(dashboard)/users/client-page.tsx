'use client'

import { useMemo, useState } from "react"
import { Profile } from "@/types"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Trash, RotateCcw, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { DataTableColumnFilter } from "@/components/ui/data-table-column-filter"
import { restoreProfile } from "@/lib/actions/users"
import { UserActions } from "@/components/users/user-actions"

interface UsersClientProps {
    users: Profile[]
    isTrash?: boolean
}

export function UsersClientPage({ users, isTrash = false }: UsersClientProps) {
    const router = useRouter()
    const [globalSearch, setGlobalSearch] = useState("")

    // Búsqueda multicampo: nombre completo o nro de documento,
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
            return name.includes(search) || doc.includes(search)
        })
    }, [users, isTrash, globalSearch])

    const columns: ColumnDef<Profile>[] = [
        {
            accessorKey: "doc_number",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Nro. Documento" />
            ),
            cell: ({ row }) => row.original.doc_number
                ? <span>{row.original.doc_number}</span>
                : <span className="text-muted-foreground text-xs">—</span>
        },
        {
            accessorKey: "email",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Email" />
            ),
        },
        {
            accessorKey: "full_name",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Nombre" />
            ),
            cell: ({ row }) => {
                const u = row.original
                return <span>{u.full_name || `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email || '—'}</span>
            }
        },
        {
            accessorKey: "cargo",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Cargo" />
            ),
            cell: ({ row }) => row.original.cargo
                ? <span className="text-sm">{row.original.cargo}</span>
                : <span className="text-muted-foreground text-xs">—</span>
        },
        {
            accessorKey: "role",
            header: ({ column }) => (
                <DataTableColumnFilter
                    column={column}
                    title="Rol"
                    options={[
                        { label: "Admin Tenant", value: "admin_tenant" },
                        { label: "Supervisor", value: "supervisor" },
                        { label: "Planner", value: "planner" },
                        { label: "Member", value: "member" },
                        { label: "Viewer", value: "viewer" },
                    ]}
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
            filterFn: (row, id, value: Array<string | boolean>) => {
                if (!value || value.length === 0) return true
                return value.includes(row.getValue(id))
            },
        },
        {
            id: "tercero",
            accessorFn: (row) => (row as any).tercero?.razon_social,
            header: ({ column }) => (
                <DataTableColumnFilter column={column} title="Proveedor" />
            ),
            cell: ({ row }) => {
                const proveedor = (row.original as any).tercero?.razon_social
                return proveedor
                    ? <span>{proveedor}</span>
                    : <span className="text-muted-foreground text-xs">—</span>
            },
            filterFn: (row, id, value: Array<string | boolean>) => {
                if (!value || value.length === 0) return true
                return value.includes((row.original as any).tercero?.razon_social)
            },
        },
        {
            accessorKey: "is_active",
            header: ({ column }) => (
                <DataTableColumnFilter
                    column={column}
                    title="Estado"
                    options={[
                        { label: "Activo", value: true },
                        { label: "Inactivo", value: false },
                    ]}
                />
            ),
            cell: ({ row }) => row.original.is_active
                ? <Badge className="bg-green-500">Activo</Badge>
                : <Badge variant="destructive">Inactivo</Badge>,
            filterFn: (row, id, value: Array<string | boolean>) => {
                if (!value || value.length === 0) return true
                return value.includes(row.getValue(id))
            },
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

            <div className="rounded-lg border p-6 bg-background">
                <DataTable
                    columns={columns}
                    data={filteredUsers}
                    toolbarContent={() => (
                        <Input
                            placeholder="Buscar por nombre o nro documento..."
                            value={globalSearch}
                            onChange={(e) => setGlobalSearch(e.target.value)}
                            className="h-8 w-[250px]"
                        />
                    )}
                    customAction={
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
                            {!isTrash && (
                                <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white" onClick={() => router.push('/users/create')}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Nuevo Usuario
                                </Button>
                            )}
                        </div>
                    }
                />
            </div>
        </div>
    )
}
