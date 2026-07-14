
"use client"

import { DataTable } from "@/components/ui/data-table"
import { useRouter } from "next/navigation"
import { useState, useMemo } from "react"
import { Profile } from "@/types"

export function UsersTable({ columns, data }: { columns: any, data: Profile[] }) {
    const router = useRouter()
    const [globalSearch, setGlobalSearch] = useState("")

    const filteredData = useMemo(() => {
        if (!globalSearch.trim()) return data

        const search = globalSearch.toLowerCase()
        return data.filter((user) => {
            const nameMatch = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase().includes(search)
            const docMatch = user.doc_number?.toLowerCase().includes(search)
            return nameMatch || docMatch
        })
    }, [data, globalSearch])

    return (
        <DataTable
            columns={columns}
            data={filteredData}
            searchKey={null as any}
            searchPlaceholder="Buscar por nombre o nro documento..."
            newActionLabel="+ Nuevo Usuario"
            newAction={() => router.push('/users/create')}
            toolbarContent={(table) => (
                <input
                    type="text"
                    placeholder="Buscar por nombre o nro documento..."
                    value={globalSearch}
                    onChange={(e) => setGlobalSearch(e.target.value)}
                    className="h-8 w-[250px] px-3 py-1 border rounded-md text-sm"
                />
            )}
        />
    )
}
