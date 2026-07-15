'use client'

import { useState, useTransition } from 'react'
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
    Eraser
} from 'lucide-react'
import { toast } from 'sonner'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { cn } from '@/lib/utils'

import { DocumentType, UserDocument } from '@/types/user-documents'
import { getSignedUrls } from '@/lib/actions/user-documents-query'
import { toggleUserDocumentStatus } from '@/lib/actions/user-documents'
import { exportToExcel } from '@/lib/utils/export-excel'

import { Input } from '@/components/ui/input'
import { BulkUploadDocumentDialog } from './bulk-upload-document-dialog'
import { EditDocumentDialog } from './edit-document-dialog'
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
import { Badge } from '@/components/ui/badge'
import { ColumnFilterHeader } from '@/components/ui/column-filter-header'
import { TablePaginationBar } from '@/components/ui/table-pagination-bar'

interface GlobalDocumentsTableProps {
    documents: UserDocument[]
    documentTypes: DocumentType[]
    totalCount: number
    currentPage: number
    pageSize: number
}

export function GlobalDocumentsTable({
    documents,
    documentTypes,
    totalCount,
    currentPage,
    pageSize
}: GlobalDocumentsTableProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    // Selection state
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [isDownloading, setIsDownloading] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [editingDoc, setEditingDoc] = useState<UserDocument | null>(null)

    // Estado de filtros (URL = fuente de verdad; el servidor filtra y pagina)
    const searchTerm = searchParams.get('search') || ''
    const currentDocType = searchParams.get('documentTypeId') || ''
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

    // Download Helpers
    const handleDownloadExcel = () => {
        const rows = documents.map(doc => ({
            'Usuario': `${doc.user?.first_name || ''} ${doc.user?.last_name || ''}`.trim(),
            'Nro. Documento Identidad': doc.user?.doc_number || '',
            'Documento': doc.document_type?.name,
            'Válido Desde': doc.valid_from || '-',
            'Válido Hasta': doc.valid_until || '-',
            'Vencimiento': getStatusText(doc),
            'Estado': doc.is_active ? 'Activo' : 'Inactivo',
            'Nombre Archivo': doc.file_name,
        }))
        if (!exportToExcel('DOCUMENTACION', rows)) toast.error('No hay registros para exportar')
    }

    const handleDownloadZip = async () => {
        setIsDownloading(true)
        try {
            const selectedDocs = selectedIds.size > 0
                ? documents.filter(d => selectedIds.has(d.id))
                : documents

            if (selectedDocs.length === 0) {
                toast.error("No hay documentos para descargar")
                return
            }

            const paths = selectedDocs.map(d => d.file_path)

            // Get Signed URLs
            const signedUrls = await getSignedUrls(paths)
            if (!signedUrls) throw new Error("Error obteniendo enlaces")

            const zip = new JSZip()
            const folder = zip.folder("documentos")

            await Promise.all(selectedDocs.map(async (doc) => {
                const signedData = signedUrls.find(s => s.path === doc.file_path)
                if (!signedData?.signedUrl) return

                const response = await fetch(signedData.signedUrl)
                const blob = await response.blob()

                // Naming: (tipo de documento) - nombre del usuario
                const ext = doc.file_name.split('.').pop()
                const safeName = `(${doc.document_type?.name}) - ${doc.user?.first_name} ${doc.user?.last_name}`.replace(/[/\\?%*:|"<>]/g, '-')

                folder?.file(`${safeName}.${ext}`, blob)
            }))

            const content = await zip.generateAsync({ type: "blob" })
            saveAs(content, `Documentos_${format(new Date(), 'yyyyMMdd')}.zip`)
            toast.success("Descarga completada")

        } catch (error) {
            console.error(error)
            toast.error("Error al generar el ZIP")
        } finally {
            setIsDownloading(false)
        }
    }

    const handleToggleStatus = (docId: string, currentStatus: boolean, userId: string) => {
        startTransition(async () => {
            const res = await toggleUserDocumentStatus(docId, currentStatus, userId)
            if (res?.success) toast.success(res.message)
            else toast.error(res?.message || "Error al cambiar estado")
        })
    }

    // Helpers
    const getStatusText = (doc: UserDocument) => {
        if (!doc.valid_until) return 'No vence'
        const today = new Date()
        const validUntil = parseISO(doc.valid_until)
        if (validUntil < today) return 'Vencido'
        return 'Vigente'
    }

    const getExpiryBadge = (doc: UserDocument) => {
        if (!doc.valid_until) {
            return <Badge variant="secondary" className="bg-gray-100 text-gray-600 hover:bg-gray-200">NO VENCE</Badge>
        }

        const today = new Date()
        const validUntil = parseISO(doc.valid_until)
        const diff = differenceInDays(validUntil, today)
        const alertDays = doc.document_type?.expiration_alert_days || 30

        if (diff < 0) {
            return <Badge variant="destructive">VENCIDO</Badge>
        } else if (diff <= alertDays) {
            return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-300">POR VENCER</Badge>
        } else {
            return <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-green-300">VIGENTE</Badge>
        }
    }

    return (
        <div className="space-y-4">
            {/* Toolbar estándar: buscador | Depurar | Activos/Papelera | XLS | ZIP | + Nuevo */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-lg border shadow-sm">
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar usuario o DNI..."
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
                        onClick={() => router.push('/users/documents/depurar')}
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
                    <Button variant="outline" size="sm" onClick={handleDownloadZip} title="Descargar Seleccionados (ZIP)" disabled={isDownloading}>
                        {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileArchive className="h-4 w-4 text-orange-600" />}
                    </Button>

                    <BulkUploadDocumentDialog
                        documentTypes={documentTypes}
                        onSuccess={() => router.refresh()}
                    />
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
                            <TableHead>USUARIO</TableHead>
                            <TableHead>
                                <ColumnFilterHeader
                                    title="DOCUMENTO"
                                    options={documentTypes.map(t => ({ label: t.name, value: t.id }))}
                                    selected={currentDocType ? [currentDocType] : []}
                                    onChange={(v) => setParam('documentTypeId', v[0] ?? null)}
                                    multiple={false}
                                />
                            </TableHead>
                            <TableHead>VÁLIDO DESDE</TableHead>
                            <TableHead>
                                <ColumnFilterHeader
                                    title="VENCIMIENTO"
                                    options={[
                                        { label: 'Por vencer', value: 'expiring' },
                                        { label: 'Vencidos', value: 'expired' },
                                    ]}
                                    selected={currentExpiryStatus ? [currentExpiryStatus] : []}
                                    onChange={(v) => setParam('expiryStatus', v[0] ?? null)}
                                    multiple={false}
                                />
                            </TableHead>
                            <TableHead>VÁLIDO HASTA</TableHead>
                            <TableHead>ARCHIVO</TableHead>
                            <TableHead className="text-right"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {documents.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
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
                                            <span className={cn("font-medium text-sm", !doc.is_active && "text-red-600")}>
                                                {doc.user?.first_name} {doc.user?.last_name}
                                            </span>
                                            <span className="text-xs text-muted-foreground">{doc.user?.doc_number}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm">{doc.document_type?.name}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {doc.valid_from ? format(parseISO(doc.valid_from), 'dd/MM/yyyy') : '-'}
                                    </TableCell>
                                    <TableCell>
                                        {getExpiryBadge(doc)}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {doc.valid_until ? format(parseISO(doc.valid_until), 'dd/MM/yyyy') : '-'}
                                    </TableCell>
                                    <TableCell>
                                        <a
                                            href="#"
                                            onClick={async (e) => {
                                                e.preventDefault()
                                                const urlData = await getSignedUrls([doc.file_path])
                                                if (urlData?.[0]?.signedUrl) window.open(urlData[0].signedUrl, '_blank')
                                            }}
                                            className="text-sm text-orange-500 hover:underline flex items-center gap-1"
                                        >
                                            Link del archivo
                                        </a>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isPending}>
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => setEditingDoc(doc)}>
                                                    <Pencil className="mr-2 h-4 w-4" /> Editar
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleToggleStatus(doc.id, doc.is_active, doc.user_id)}>
                                                    <Trash2 className="mr-2 h-4 w-4" /> {doc.is_active ? 'Deshabilitar' : 'Habilitar'}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {editingDoc && (
                <EditDocumentDialog
                    document={editingDoc}
                    documentTypes={documentTypes}
                    open={!!editingDoc}
                    onOpenChange={(open) => !open && setEditingDoc(null)}
                    onSuccess={() => router.refresh()}
                />
            )}

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
