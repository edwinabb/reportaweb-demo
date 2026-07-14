
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Profile } from "@/types"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { DataTableColumnFilter } from "@/components/ui/data-table-column-filter"
import { UserActions } from "@/components/users/user-actions"

export const columns: ColumnDef<Profile>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "doc_number",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Nro. Documento" />
        ),
    },
    {
        accessorKey: "email",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Email" />
        ),
    },
    {
        accessorKey: "first_name",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Nombre" />
        ),
        cell: ({ row }) => {
            const u = row.original
            const name = u.full_name || `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email || '—'
            return <span>{name}</span>
        }
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
                    { label: "Member", value: "member" },
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
            <DataTableColumnFilter
                column={column}
                title="Proveedor"
            />
        ),
        cell: ({ row }) => {
            const u = row.original as any
            const proveedor = u.tercero?.razon_social || '—'
            return <span>{proveedor}</span>
        },
        filterFn: (row, id, value: Array<string | boolean>) => {
            if (!value || value.length === 0) return true
            const rowValue = (row.original as any).tercero?.razon_social
            return value.includes(rowValue)
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
        cell: ({ row }) => {
            const isActive = row.getValue("is_active") as boolean
            return (
                <Badge variant={isActive ? "default" : "destructive"}>
                    {isActive ? "Activo" : "Inactivo"}
                </Badge>
            )
        },
        filterFn: (row, id, value: Array<string | boolean>) => {
            if (!value || value.length === 0) return true
            return value.includes(row.getValue(id))
        },
    },
    {
        id: "actions",
        cell: ({ row }) => <UserActions user={row.original} />,
    },
]
