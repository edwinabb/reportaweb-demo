'use client'

import { useState, useTransition, useMemo } from 'react'
import { toast } from 'sonner'
import { Edit2, MoreHorizontal, FileText, AlertCircle, Shield, File, Power, PowerOff, Trash, Plus } from 'lucide-react'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { ColumnFilterHeader } from '@/components/ui/column-filter-header'
import { TablePaginationBar } from '@/components/ui/table-pagination-bar'
import { exportToExcel } from '@/lib/utils/export-excel'
import { DocumentType } from '@/types/user-documents'
import { toggleDocumentTypeStatus } from '@/lib/actions/document-types'
import { DocumentTypeDialog } from './document-type-dialog'

interface DocumentTypesTableProps {
    data: DocumentType[]
    onNew?: () => void
}

const CATEGORY_LABELS: Record<string, string> = {
    con_vencimiento: 'Con Vencimiento',
    seguro: 'Seguro',
    sin_vencimiento: 'Sin Vencimiento',
}

export function DocumentTypesTable({ data, onNew }: DocumentTypesTableProps) {
    const [isPending, startTransition] = useTransition()
    const [editingDoc, setEditingDoc] = useState<DocumentType | undefined>(undefined)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [categoryFilter, setCategoryFilter] = useState<string[]>([])
    const [statusFilter, setStatusFilter] = useState<string[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [isTrash, setIsTrash] = useState(false)
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    const filteredData = useMemo(() => {
        const search = searchTerm.trim().toLowerCase()
        return data.filter((doc) => {
            if (isTrash ? doc.is_active : !doc.is_active) return false
            if (search && !doc.name.toLowerCase().includes(search)) return false
            if (categoryFilter.length > 0 && !categoryFilter.includes(doc.category)) return false
            if (statusFilter.length > 0 && !statusFilter.includes(String(doc.is_active))) return false
            return true
        })
    }, [data, isTrash, categoryFilter, statusFilter, searchTerm])

    const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize))
    const safePage = Math.min(page, totalPages)
    const paginatedData = filteredData.slice((safePage - 1) * pageSize, safePage * pageSize)

    const resetPage = () => setPage(1)

    const handleToggleStatus = (doc: DocumentType) => {
        startTransition(async () => {
            const result = await toggleDocumentTypeStatus(doc.id, doc.is_active)
            if (result?.success) {
                toast.success(result.message)
            } else {
                toast.error(result?.message || 'Error al cambiar estado')
            }
        })
    }

    const handleExcel = () => {
        const rows = filteredData.map((doc) => ({
            'Nombre': doc.name,
            'Categoría': CATEGORY_LABELS[doc.category] ?? doc.category,
            'Estado': doc.is_active ? 'Activo' : 'Inactivo',
            'Días Alerta': doc.expiration_alert_days ?? '',
        }))
        if (!exportToExcel('TIPOS DE DOCUMENTOS', rows)) toast.error('No hay registros para exportar')
    }

    const getCategoryBadge = (cat: string) => {
        switch (cat) {
            case 'con_vencimiento':
                return <Badge variant="secondary" className="gap-1"><AlertCircle className="w-3 h-3" /> Con Vencimiento</Badge>
            case 'seguro':
                return <Badge variant="outline" className="gap-1 border-blue-200 text-blue-700 bg-blue-50"><Shield className="w-3 h-3" /> Seguro</Badge>
            default:
                return <Badge variant="outline" className="gap-1"><File className="w-3 h-3" /> Sin Vencimiento</Badge>
        }
    }

    return (
        <div className="space-y-4">
            {/* Toolbar estándar: buscador | Activos/Papelera | XLS | + Nuevo */}
            <div className="flex items-center justify-between gap-2">
                <Input
                    placeholder="Buscar tipo de documento..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); resetPage() }}
                    className="h-8 w-[250px]"
                />
                <div className="flex items-center gap-2">
                    <Button
                        variant={!isTrash ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => { setIsTrash(false); resetPage() }}
                    >
                        Activos
                    </Button>
                    <Button
                        variant={isTrash ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => { setIsTrash(true); resetPage() }}
                    >
                        <Trash className="w-4 h-4 mr-2" />
                        Papelera
                    </Button>
                    <Button variant="outline" size="sm" title="Descargar Excel (lo filtrado)" onClick={handleExcel}>
                        <FileText className="h-4 w-4 text-green-600" />
                    </Button>
                    {onNew && (
                        <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white" onClick={onNew}>
                            <Plus className="mr-2 h-4 w-4" /> Nuevo Tipo
                        </Button>
                    )}
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[300px]">Nombre</TableHead>
                            <TableHead>
                                <ColumnFilterHeader
                                    title="Categoría"
                                    options={[
                                        { label: 'Con Vencimiento', value: 'con_vencimiento' },
                                        { label: 'Seguro', value: 'seguro' },
                                        { label: 'Sin Vencimiento', value: 'sin_vencimiento' },
                                    ]}
                                    selected={categoryFilter}
                                    onChange={(v) => { setCategoryFilter(v); resetPage() }}
                                />
                            </TableHead>
                            <TableHead>
                                <ColumnFilterHeader
                                    title="Estado"
                                    options={[
                                        { label: 'Activo', value: 'true' },
                                        { label: 'Inactivo', value: 'false' },
                                    ]}
                                    selected={statusFilter}
                                    onChange={(v) => { setStatusFilter(v); resetPage() }}
                                />
                            </TableHead>
                            <TableHead className="text-right">Días Alerta</TableHead>
                            <TableHead className="w-[70px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                    No hay tipos de documentos{isTrash ? ' en la papelera' : ' configurados'}.
                                </TableCell>
                            </TableRow>
                        ) : paginatedData.map((doc) => (
                            <TableRow key={doc.id}>
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 bg-muted rounded-md">
                                            <FileText className="w-4 h-4 text-muted-foreground" />
                                        </div>
                                        {/* Estándar: nombre en rojo cuando el registro está inactivo */}
                                        <span className={cn(!doc.is_active && 'text-red-600')}>{doc.name}</span>
                                    </div>
                                    {doc.tenant_id === null && (
                                        <span className="text-[10px] text-muted-foreground ml-9 block">Global del Sistema</span>
                                    )}
                                </TableCell>

                                <TableCell>{getCategoryBadge(doc.category)}</TableCell>
                                <TableCell>
                                    <Badge variant={doc.is_active ? "default" : "secondary"}>
                                        {doc.is_active ? 'Activo' : 'Inactivo'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    {(doc.category === 'con_vencimiento' || doc.category === 'seguro') ? (
                                        <Badge variant="outline" className={`
                                            ${doc.category === 'seguro' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-orange-50 text-orange-700 border-orange-200'}
                                        `}>
                                            {doc.expiration_alert_days} días
                                        </Badge>
                                    ) : (
                                        <span className="text-muted-foreground text-xs">-</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0" disabled={isPending}>
                                                <span className="sr-only">Abrir menú</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => {
                                                setEditingDoc(doc)
                                                setDialogOpen(true)
                                            }}>
                                                <Edit2 className="mr-2 h-4 w-4" /> Editar
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                onClick={() => handleToggleStatus(doc)}
                                                className={doc.is_active ? "text-destructive" : "text-green-600"}
                                            >
                                                {doc.is_active ? (
                                                    <><PowerOff className="mr-2 h-4 w-4" /> Desactivar</>
                                                ) : (
                                                    <><Power className="mr-2 h-4 w-4" /> Activar</>
                                                )}
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <TablePaginationBar
                totalCount={filteredData.length}
                page={safePage}
                pageSize={pageSize}
                onPageChange={setPage}
                onPageSizeChange={(size) => { setPageSize(size); resetPage() }}
            />

            {/* Edit/Create Dialog (controlled by parent usually, but here by internal state for edit) */}
            {
                dialogOpen && (
                    <DocumentTypeDialog
                        open={dialogOpen}
                        onOpenChange={(v) => {
                            setDialogOpen(v)
                            if (!v) setEditingDoc(undefined) // reset on close
                        }}
                        documentType={editingDoc}
                    />
                )
            }

        </div>
    )
}
