'use client'

import { Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export interface ColumnFilterOption {
    label: string
    value: string
}

interface ColumnFilterHeaderProps {
    title: string
    options: ColumnFilterOption[]
    selected: string[]
    onChange: (values: string[]) => void
    /** false = seleccionar una opción reemplaza a la anterior (para filtros de servidor de valor único) */
    multiple?: boolean
}

/**
 * Encabezado de columna estándar: título fijo (sin ordenamiento) + filtro embudo.
 * Ver docs/UI-TEMPLATE-LISTADOS.md.
 */
export function ColumnFilterHeader({
    title,
    options,
    selected,
    onChange,
    multiple = true,
}: ColumnFilterHeaderProps) {
    const toggle = (value: string, checked: boolean) => {
        if (!multiple) {
            onChange(checked ? [value] : [])
            return
        }
        const next = new Set(selected)
        if (checked) next.add(value)
        else next.delete(value)
        onChange(Array.from(next))
    }

    return (
        <div className="flex items-center space-x-2">
            <span>{title}</span>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Filter className={`w-4 h-4 ${selected.length > 0 ? 'text-blue-500' : ''}`} />
                        <span className="sr-only">Filtrar por {title}</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                    <DropdownMenuLabel className="text-xs">Filtrar por {title.toLowerCase()}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {options.map((opt) => (
                        <DropdownMenuCheckboxItem
                            key={opt.value}
                            checked={selected.includes(opt.value)}
                            onCheckedChange={(c) => toggle(opt.value, !!c)}
                        >
                            {opt.label}
                        </DropdownMenuCheckboxItem>
                    ))}
                    {selected.length > 0 && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onChange([])} className="text-xs">
                                Limpiar filtro
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}
