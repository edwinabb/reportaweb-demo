'use client'

import { useState, useTransition, useMemo } from 'react'
import { toast } from 'sonner'
import { Edit2, MoreHorizontal, FileText, AlertCircle, Shield, File, Loader2, Power, PowerOff, Filter, X } from 'lucide-react'

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
    DropdownMenuCheckboxItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { DocumentType } from '@/types/user-documents'
import { toggleDocumentTypeStatus } from '@/lib/actions/document-types'
import { DocumentTypeDialog } from './document-type-dialog'

interface DocumentTypesTableProps {
    data: DocumentType[]
}

export function DocumentTypesTable({ data }: DocumentTypesTableProps) {
    const [isPending, startTransition] = useTransition()
    const [editingDoc, setEditingDoc] = useState<DocumentType | undefined>(undefined)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [categoryFilter, setCategoryFilter] = useState<Set<string>>(new Set())
    const [statusFilter, setStatusFilter] = useState<Set<boolean>>(new Set())
    const [searchTerm, setSearchTerm] = useState('')

    const filteredData = useMemo(() => {
        const search = searchTerm.trim().toLowerCase()
        return data.filter((doc) => {
            if (search && !doc.name.toLowerCase().includes(search)) return false
            if (categoryFilter.size > 0 && !categoryFilter.has(doc.category)) return false
            if (statusFilter.size > 0 && !statusFilter.has(doc.is_active)) return false
            return true
        })
    }, [data, categoryFilter, statusFilter, searchTerm])

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
        <>
            <div className="flex items-center pb-4">
                <Input
                    placeholder="Buscar tipo de documento..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-8 w-[250px]"
                />
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[300px]">Nombre</TableHead>
                            <TableHead>
                                <div className="flex items-center space-x-2">
                                    <span>Categoría</span>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                                <Filter className={`w-4 h-4 ${categoryFilter.size > 0 ? 'text-blue-500' : ''}`} />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="start">
                                            <DropdownMenuLabel className="text-xs">Filtrar por categoría</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuCheckboxItem
                                                checked={categoryFilter.has('con_vencimiento')}
                                                onCheckedChange={(c) => {
                                                    const newFilter = new Set(categoryFilter)
                                                    if (c) newFilter.add('con_vencimiento')
                                                    else newFilter.delete('con_vencimiento')
                                                    setCategoryFilter(newFilter)
                                                }}
                                            >
                                                Con Vencimiento
                                            </DropdownMenuCheckboxItem>
                                            <DropdownMenuCheckboxItem
                                                checked={categoryFilter.has('seguro')}
                                                onCheckedChange={(c) => {
                                                    const newFilter = new Set(categoryFilter)
                                                    if (c) newFilter.add('seguro')
                                                    else newFilter.delete('seguro')
                                                    setCategoryFilter(newFilter)
                                                }}
                                            >
                                                Seguro
                                            </DropdownMenuCheckboxItem>
                                            <DropdownMenuCheckboxItem
                                                checked={categoryFilter.has('sin_vencimiento')}
                                                onCheckedChange={(c) => {
                                                    const newFilter = new Set(categoryFilter)
                                                    if (c) newFilter.add('sin_vencimiento')
                                                    else newFilter.delete('sin_vencimiento')
                                                    setCategoryFilter(newFilter)
                                                }}
                                            >
                                                Sin Vencimiento
                                            </DropdownMenuCheckboxItem>
                                            {categoryFilter.size > 0 && (
                                                <>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => setCategoryFilter(new Set())} className="text-xs">
                                                        Limpiar filtro
                                                    </DropdownMenuItem>
                                                </>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </TableHead>
                            <TableHead>
                                <div className="flex items-center space-x-2">
                                    <span>Estado</span>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                                <Filter className={`w-4 h-4 ${statusFilter.size > 0 ? 'text-blue-500' : ''}`} />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="start">
                                            <DropdownMenuLabel className="text-xs">Filtrar por estado</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuCheckboxItem
                                                checked={statusFilter.has(true)}
                                                onCheckedChange={(c) => {
                                                    const newFilter = new Set(statusFilter)
                                                    if (c) newFilter.add(true)
                                                    else newFilter.delete(true)
                                                    setStatusFilter(newFilter)
                                                }}
                                            >
                                                Activo
                                            </DropdownMenuCheckboxItem>
                                            <DropdownMenuCheckboxItem
                                                checked={statusFilter.has(false)}
                                                onCheckedChange={(c) => {
                                                    const newFilter = new Set(statusFilter)
                                                    if (c) newFilter.add(false)
                                                    else newFilter.delete(false)
                                                    setStatusFilter(newFilter)
                                                }}
                                            >
                                                Inactivo
                                            </DropdownMenuCheckboxItem>
                                            {statusFilter.size > 0 && (
                                                <>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => setStatusFilter(new Set())} className="text-xs">
                                                        Limpiar filtro
                                                    </DropdownMenuItem>
                                                </>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </TableHead>
                            <TableHead className="text-right">Días Alerta</TableHead>
                            <TableHead className="w-[70px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                    No hay tipos de documentos configurados.
                                </TableCell>
                            </TableRow>
                        ) : filteredData.map((doc) => (
                            <TableRow key={doc.id}>
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 bg-muted rounded-md">
                                            <FileText className="w-4 h-4 text-muted-foreground" />
                                        </div>
                                        <span>{doc.name}</span>
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
            </div >

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

        </>
    )
}
