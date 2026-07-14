'use client'

import { Column } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuCheckboxItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { ArrowDownIcon, ArrowUpIcon, ChevronsUpDown, EyeOff, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DataTableColumnFilterProps<TData, TValue> {
    column: Column<TData, TValue>
    title: string
    options?: Array<{ label: string; value: string | boolean }>
}

export function DataTableColumnFilter<TData, TValue>({
    column,
    title,
    options,
}: DataTableColumnFilterProps<TData, TValue>) {
    const filterValue = column.getFilterValue() as Array<string | boolean> | string | boolean | undefined
    const hasFilter = filterValue !== undefined && filterValue !== null && (Array.isArray(filterValue) ? filterValue.length > 0 : true)

    return (
        <div className="flex items-center space-x-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="-ml-3 h-8 data-[state=open]:bg-accent"
                    >
                        <span>{title}</span>
                        {column.getIsSorted() === "desc" ? (
                            <ArrowDownIcon className="ml-2 h-4 w-4" />
                        ) : column.getIsSorted() === "asc" ? (
                            <ArrowUpIcon className="ml-2 h-4 w-4" />
                        ) : (
                            <ChevronsUpDown className="ml-2 h-4 w-4" />
                        )}
                        {hasFilter && <Filter className="ml-1 h-4 w-4 text-blue-500" />}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[200px]">
                    {/* Sort Options */}
                    {column.getCanSort() && (
                        <>
                            <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
                                <ArrowUpIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                                Asc
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
                                <ArrowDownIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                                Desc
                            </DropdownMenuItem>
                        </>
                    )}

                    {/* Filter Options */}
                    {options && options.length > 0 && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel className="text-xs font-medium text-muted-foreground px-2 py-1.5">
                                Filtrar por
                            </DropdownMenuLabel>
                            {options.map((opt) => (
                                <DropdownMenuCheckboxItem
                                    key={String(opt.value)}
                                    checked={
                                        Array.isArray(filterValue)
                                            ? filterValue.includes(opt.value)
                                            : filterValue === opt.value
                                    }
                                    onCheckedChange={(checked) => {
                                        if (Array.isArray(filterValue)) {
                                            if (checked) {
                                                column.setFilterValue([...filterValue, opt.value])
                                            } else {
                                                column.setFilterValue(filterValue.filter(v => v !== opt.value))
                                            }
                                        } else {
                                            if (checked) {
                                                column.setFilterValue([opt.value])
                                            } else {
                                                column.setFilterValue(undefined)
                                            }
                                        }
                                    }}
                                >
                                    {opt.label}
                                </DropdownMenuCheckboxItem>
                            ))}
                            {hasFilter && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => column.setFilterValue(undefined)} className="text-xs">
                                        Limpiar filtro
                                    </DropdownMenuItem>
                                </>
                            )}
                        </>
                    )}

                    {/* Visibility Option */}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
                        <EyeOff className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                        Ocultar
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}
