'use client'

import { useState } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { format, parseISO, differenceInDays } from 'date-fns'
import {
    FileText,
    Search,
    MoreVertical,
    Trash2,
    FileArchive,
    Loader2,
    Pencil,
    Eraser,
    Plus,
    RotateCcw,
    Download,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

import { Maquinaria, MaquinariaTipoDoc } from '@/types/maquinaria'
import { GlobalMaquinariaDoc } from '@/lib/actions/maquinaria-docs-query'
import { deleteMaquinariaDocumento, restoreMaquinariaDocumento } from '@/lib/actions/maquinaria-docs'
import { exportToExcel } from '@/lib/utils/export-excel'
import { GlobalDocumentDialog } from '@/components/maquinaria/global-document-dialog'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { ColumnFilterHeader } from '@/components/ui/column-filter-header'
import { TablePaginationBar } from '@/components/ui/table-pagination-bar'

const DEFAULT_ALERT_DAYS = 30

interface GlobalMaquinariaDocumentsTableProps {
    documents: GlobalMaquinariaDoc[]
    tipos: MaquinariaTipoDoc[]
    maquinarias: Maquinaria[]
    totalCount: number
    currentPage: number
    pageSize: number
}

export function GlobalMaquinariaDocumentsTable({
    documents,
    tipos,
    maquinarias,
    totalCount,
    currentPage,
    pageSize,
}: GlobalMaquinariaDocumentsTableProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [isDownloading, setIsDownloading] = useState(false)
    const [editingDoc, setEditingDoc] = useState<GlobalMaquinariaDoc | null>(null)
    const [createOpen, setCreateOpen] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState<GlobalMaquinariaDoc | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    // Estado de filtros (URL = fuente de verdad; el servidor filtra y pagina)
    const searchTerm = searchParams.get('search') || ''
    const currentTipoDoc = searchParams.get('tipoDocId') || ''
    const currentExpiryStatus = searchParams.get('expiryStatus') || ''
    const isTrash = searchParams.get('is_active') === 'false'

    const setParam = (key: string, value: string | null) => {
        const params = new URLSearchParams(searchParams)
        if (value) params.set(key, value)
        else params.delete(key)
        params.set('page', '1')
        router.push(`${pathname}?${params.toString()}`)
    }

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(searchParams)
        params.set('page', page.toString())
        router.push(`${pathname}?${params.toString()}`)
    }

    // Selection Handlers
    const toggleSelectAll = () => {
        if (selectedIds.size === documents.length) {
            setSelectedIds(new Set())
        } else {
            setSelectedIds(new Set(documents.map(d => d.id)))
        }
    }

    const toggleSelect = (id: string) => {
        const newSet = new Set(selectedIds)
        if (newSet.has(id)) newSet.delete(id)
        else newSet.add(id)
        setSelectedIds(newSet)
    }

    // Helpers de estado de vencimiento (misma fórmula que el filtro server-side)
    const getStatusText = (doc: GlobalMaquinariaDoc) => {
        if (!doc.fecha_vencimiento) return 'No vence'
        const diff = differenceInDays(parseISO(doc.fecha_vencimiento), new Date())
        const alertDays = doc.tipo_doc?.dias_alerta ?? DEFAULT_ALERT_DAYS
        if (diff < 0) return 'Vencido'
        if (diff <= alertDays) return 'Por vencer'
        return 'Vigente'
    }

    const getExpiryBadge = (doc: GlobalMaquinariaDoc) => {
        if (!doc.fecha_vencimiento) {
            return <Badge variant="secondary" className="bg-gray-100 text-gray-600 hover:bg-gray-200">NO VENCE</Badge>
        }

        const diff = differenceInDays(parseISO(doc.fecha_vencimiento), new Date())
        const alertDays = doc.tipo_doc?.dias_alerta ?? DEFAULT_ALERT_DAYS

        if (diff < 0) {
            return <Badge variant="destructive">VENCIDO</Badge>
        } else if (diff <= alertDays) {
            return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-300">POR VENCER</Badge>
        } else {
            return <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-green-300">VIGENTE</Badge>
        }
    }

    // Download Helpers
    const handleDownloadExcel = () => {
        const rows = documents.map(doc => ({
            'Equipo': doc.maquinaria?.nombre || '-',
            'Código Interno': doc.maquinaria?.codigo_interno || '-',
            'Tipo Documento': doc.tipo_doc?.nombre || '-',
            'Nº Documento': doc.numero_doc || '-',
            'Válido Desde': doc.fecha_emision || '-',
            'Vencimiento': doc.fecha_vencimiento || '-',
            'Estado': getStatusText(doc),
            'Archivo': doc.archivo_url || 'No adjunto',
        }))
        if (!exportToExcel('DOCUMENTOS MAQUINARIA', rows)) toast.error('No hay registros para exportar')
    }

    const handleDownloadZip = async () => {
        setIsDownloading(true)
        try {
            const JSZip = (await import('jszip')).default
            const { saveAs } = await import('file-saver')

            const selectedDocs = selectedIds.size > 0
                ? documents.filter(d => selectedIds.has(d.id))
                : documents

            if (selectedDocs.length === 0) {
                toast.error('No hay documentos para descargar')
                return
            }

            const zip = new JSZip()
            const folder = zip.folder('documentos_maquinaria')

            let count = 0
            await Promise.all(selectedDocs.map(async (doc) => {
                if (!doc.archivo_url) return
                try {
                    const response = await fetch(doc.archivo_url)
                    if (!response.ok) throw new Error('Fetch failed')
                    const blob = await response.blob()

                    // Naming: [Equipo]_[Tipo]_[NumDoc].ext
                    const equipo = (doc.maquinaria?.nombre || doc.maquinaria?.codigo_interno || 'Equipo').replace(/[^a-zA-Z0-9]/g, '_')
                    const tipo = (doc.tipo_doc?.nombre || 'Doc').replace(/[^a-zA-Z0-9]/g, '_')
                    const ext = doc.archivo_url.split('.').pop()?.split('?')[0] || 'pdf'

                    folder?.file(`${equipo}_${tipo}_${doc.numero_doc || 'SF'}.${ext}`, blob)
                    count++
                } catch {
                    // Archivo inaccesible: se omite del ZIP
                }
            }))

            if (count === 0) {
                toast.error('No se pudieron descargar los archivos')
                return
            }

            const content = await zip.generateAsync({ type: 'blob' })
            saveAs(content, `Documentos_Maquinaria_${format(new Date(), 'yyyyMMdd')}.zip`)
            toast.success(`Descargados ${count} documentos`)
        } catch (error) {
            console.error(error)
            toast.error('Error al generar el ZIP')
        } finally {
            setIsDownloading(false)
        }
    }

    const confirmDelete = async () => {
        if (!deleteTarget?.maquinaria_id) return
        setIsDeleting(true)
        try {
            const res = await deleteMaquinariaDocumento(deleteTarget.id, deleteTarget.maquinaria_id)
            if (res.message?.includes('eliminado')) {
                toast.success('Documento eliminado')
                router.refresh()
            } else {
                toast.error(res.message || 'Error al eliminar')
            }
        } catch {
            toast.error('Error al eliminar')
        } finally {
            setIsDeleting(false)
            setDeleteTarget(null)
        }
    }

    const handleRestore = async (doc: GlobalMaquinariaDoc) => {
        const res = await restoreMaquinariaDocumento(doc.id, doc.maquinaria_id || undefined)
        if (res.success) {
            toast.success('Documento restaurado')
            router.refresh()
        } else {
            toast.error(res.message)
        }
    }

    return (
        <div className="space-y-4">
            {/* Toolbar estándar: buscador | Depurar | Activos/Papelera | XLS | ZIP | + Nuevo */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-lg border shadow-sm">
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar equipo, código, tipo o nº doc..."
                        className="pl-8"
                        defaultValue={searchTerm}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') setParam('search', e.currentTarget.value || null)
                        }}
                    />
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push('/maquinarias/documentos/depurar')}
                        title="Documentos activos con más de 1 mes de vencidos"
                    >
                        <Eraser className="h-4 w-4 mr-1" /> Depurar vencidos
                    </Button>

                    <Button
                        variant={!isTrash ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setParam('is_active', null)}
                    >
                        Activos
                    </Button>
                    <Button
                        variant={isTrash ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setParam('is_active', 'false')}
                    >
                        <Trash2 className="h-3.5 w-3.5 mr-1" /> Papelera
                    </Button>

                    <Button variant="outline" size="sm" onClick={handleDownloadExcel} title="Descargar Excel (lo filtrado)">
                        <FileText className="h-4 w-4 text-green-600" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleDownloadZip} title="Descargar adjuntos (ZIP)" disabled={isDownloading}>
                        {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileArchive className="h-4 w-4 text-orange-600" />}
                    </Button>

                    <Button className="bg-orange-600 hover:bg-orange-700" onClick={() => setCreateOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Subir Documento
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-md border bg-white shadow-sm overflow-x-auto">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="w-[40px]">
                                <Checkbox
                                    checked={selectedIds.size === documents.length && documents.length > 0}
                                    onCheckedChange={toggleSelectAll}
                                />
                            </TableHead>
                            <TableHead>EQUIPO</TableHead>
                            <TableHead>
                                <ColumnFilterHeader
                                    title="TIPO DOCUMENTO"
                                    options={tipos.map(t => ({ label: t.nombre, value: t.id }))}
                                    selected={currentTipoDoc ? [currentTipoDoc] : []}
                                    onChange={(v) => setParam('tipoDocId', v[0] ?? null)}
                                    multiple={false}
                                />
                            </TableHead>
                            <TableHead>Nº DOCUMENTO</TableHead>
                            <TableHead>
                                <ColumnFilterHeader
                                    title="ESTADO"
                                    options={[
                                        { label: 'Vigente', value: 'vigente' },
                                        { label: 'Por vencer', value: 'por_vencer' },
                                        { label: 'Vencido', value: 'vencido' },
                                    ]}
                                    selected={currentExpiryStatus ? [currentExpiryStatus] : []}
                                    onChange={(v) => setParam('expiryStatus', v[0] ?? null)}
                                    multiple={false}
                                />
                            </TableHead>
                            <TableHead>VÁLIDO DESDE</TableHead>
                            <TableHead>VENCIMIENTO</TableHead>
                            <TableHead>ARCHIVO</TableHead>
                            <TableHead className="text-right"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {documents.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                                    No se encontraron documentos
                                </TableCell>
                            </TableRow>
                        ) : (
                            documents.map(doc => (
                                <TableRow key={doc.id}>
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedIds.has(doc.id)}
                                            onCheckedChange={() => toggleSelect(doc.id)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            {/* Estándar: nombre en rojo cuando el registro está inactivo */}
                                            <span className={cn('font-medium text-sm', !doc.is_active && 'text-red-600')}>
                                                {doc.maquinaria?.nombre || '-'}
                                            </span>
                                            <span className="text-xs text-muted-foreground">{doc.maquinaria?.codigo_interno}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm">{doc.tipo_doc?.nombre}</TableCell>
                                    <TableCell className="font-mono text-xs">{doc.numero_doc || '-'}</TableCell>
                                    <TableCell>
                                        {getExpiryBadge(doc)}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {doc.fecha_emision ? format(parseISO(doc.fecha_emision), 'dd/MM/yyyy') : '-'}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {doc.fecha_vencimiento ? format(parseISO(doc.fecha_vencimiento), 'dd/MM/yyyy') : '-'}
                                    </TableCell>
                                    <TableCell>
                                        {doc.archivo_url ? (
                                            <a
                                                href={doc.archivo_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-orange-500 hover:underline flex items-center gap-1"
                                            >
                                                Link del archivo
                                            </a>
                                        ) : (
                                            <span className="text-sm text-muted-foreground">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {isTrash ? (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRestore(doc)}
                                                className="bg-green-50 hover:bg-green-100 text-green-700"
                                            >
                                                <RotateCcw className="h-4 w-4 mr-2" />
                                                Restaurar
                                            </Button>
                                        ) : (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => setEditingDoc(doc)}>
                                                        <Pencil className="mr-2 h-4 w-4" /> Editar
                                                    </DropdownMenuItem>
                                                    {doc.archivo_url && (
                                                        <DropdownMenuItem onClick={() => doc.archivo_url && window.open(doc.archivo_url, '_blank')}>
                                                            <Download className="mr-2 h-4 w-4" /> Descargar
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuItem
                                                        onClick={() => setDeleteTarget(doc)}
                                                        className="text-red-600 focus:text-red-600"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Alta (dialog controlado para respetar el label estándar del botón) */}
            {createOpen && (
                <GlobalDocumentDialog
                    maquinarias={maquinarias}
                    tipos={tipos}
                    open={createOpen}
                    onOpenChange={setCreateOpen}
                    triggerless
                />
            )}

            {/* Edición */}
            {editingDoc && editingDoc.maquinaria_id && editingDoc.tipo_doc_id && (
                <GlobalDocumentDialog
                    maquinarias={maquinarias}
                    tipos={tipos}
                    initial={{
                        id: editingDoc.id,
                        maquinaria_id: editingDoc.maquinaria_id,
                        tipo_doc_id: editingDoc.tipo_doc_id,
                        numero_doc: editingDoc.numero_doc,
                        fecha_emision: editingDoc.fecha_emision,
                        fecha_vencimiento: editingDoc.fecha_vencimiento,
                        archivo_url: editingDoc.archivo_url,
                    }}
                    open={!!editingDoc}
                    onOpenChange={(open) => !open && setEditingDoc(null)}
                    triggerless
                />
            )}

            {/* Confirmación de eliminación (pasa a Papelera) */}
            <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción eliminará el documento. Podrás restaurarlo desde la papelera.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => { e.preventDefault(); confirmDelete() }}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isDeleting ? 'Eliminando...' : 'Eliminar'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Paginación estándar (servidor, vía URL) */}
            <TablePaginationBar
                totalCount={totalCount}
                page={currentPage}
                pageSize={pageSize}
                onPageChange={handlePageChange}
                onPageSizeChange={(size) => setParam('perPage', String(size))}
            />
        </div>
    )
}
