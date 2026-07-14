'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { format, parseISO, differenceInDays } from 'date-fns'
import { es } from 'date-fns/locale'
import {
    Download,
    FileText,
    Filter,
    Search,
    MoreVertical,
    Trash2,
    Eye,
    CheckCircle,
    AlertCircle,
    FileArchive,
    Loader2,
    Pencil
} from 'lucide-react'
import { toast } from 'sonner'
import * as XLSX from 'xlsx'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { cn } from '@/lib/utils'

import { DocumentType, UserDocument } from '@/types/user-documents'
import { getSignedUrls } from '@/lib/actions/user-documents-query'
import { deleteUserDocument, toggleUserDocumentStatus } from '@/lib/actions/user-documents'

import { Input } from '@/components/ui/input'
import { BulkUploadDocumentDialog } from './bulk-upload-document-dialog'
import { EditDocumentDialog } from './edit-document-dialog'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
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

interface GlobalDocumentsTableProps {
    documents: UserDocument[]
    documentTypes: DocumentType[]
    totalCount: number
    currentPage: number
    totalPages: number
}

export function GlobalDocumentsTable({
    documents,
    documentTypes,
    totalCount,
    currentPage,
    totalPages
}: GlobalDocumentsTableProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    // Selection state
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [isDownloading, setIsDownloading] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [editingDoc, setEditingDoc] = useState<UserDocument | null>(null)

    // Filter states
    const searchTerm = searchParams.get('search') || ''
    const currentDocType = searchParams.get('documentTypeId') || 'all'
    const currentExpiryStatus = searchParams.get('expiryStatus') || 'all'
    const currentStatus = searchParams.get('status') || 'all'

    // Handlers
    const handleSearch = (term: string) => {
        const params = new URLSearchParams(searchParams)
        if (term) params.set('search', term)
        else params.delete('search')
        params.set('page', '1')
        router.push(`${pathname}?${params.toString()}`)
    }

    const handleTypeFilter = (typeId: string) => {
        const params = new URLSearchParams(searchParams)
        if (typeId && typeId !== 'all') params.set('documentTypeId', typeId)
        else params.delete('documentTypeId')
        params.set('page', '1')
        router.push(`${pathname}?${params.toString()}`)
    }

    const handleExpiryFilter = (status: string) => {
        const params = new URLSearchParams(searchParams)
        if (status && status !== 'all') params.set('expiryStatus', status)
        else params.delete('expiryStatus')
        params.set('page', '1')
        router.push(`${pathname}?${params.toString()}`)
    }

    const handleStatusFilter = (status: string) => {
        const params = new URLSearchParams(searchParams)
        if (status && status !== 'all') params.set('status', status)
        else params.delete('status')
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
        const dataToExport = documents.map(doc => ({
            'Usuario Nombre': doc.user?.first_name || '',
            'Usuario Apellido': doc.user?.last_name || '',
            'Tipo Documento': doc.document_type?.name,
            'Num. Documento Identidad': doc.user?.doc_number || '',
            'Válido Desde': doc.valid_from || '-',
            'Válido Hasta': doc.valid_until || '-',
            'Estado': getStatusText(doc),
            'Nombre Archivo': doc.file_name,
            'Tamaño (Bytes)': doc.file_size
        }))

        const ws = XLSX.utils.json_to_sheet(dataToExport)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, "Documentos")
        XLSX.writeFile(wb, `Reporte_Documentos_${format(new Date(), 'yyyyMMdd')}.xls`, { bookType: 'xls' })
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

            // Fetch and add to zip
            await Promise.all(signedUrls.map(async (item, index) => {
                const doc = selectedDocs[index] // Assuming order is preserved, usually is.
                // To be safe, we can match by path if needed, but array order is usually sync
                // Actually supabase returns array of objects { error, signedUrl, path }

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
        if (!doc.valid_until) return 'Permanente'
        const today = new Date()
        const validUntil = parseISO(doc.valid_until)
        if (validUntil < today) return 'Vencido'
        return 'Vigente'
    }

    const getStatusBadge = (doc: UserDocument) => {
        if (!doc.is_active) {
            return <Badge variant="outline" className="bg-gray-50 text-gray-400 border-gray-200 uppercase">Deshabilitado</Badge>
        }

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
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-lg border shadow-sm">
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto flex-1">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar usuario o DNI..."
                            className="pl-8"
                            defaultValue={searchTerm}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSearch(e.currentTarget.value)
                            }}
                        />
                    </div>
                    <Select value={currentDocType} onValueChange={handleTypeFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Tipo Documento" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los tipos</SelectItem>
                            {documentTypes.map(t => (
                                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={currentExpiryStatus} onValueChange={handleExpiryFilter}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Vencimiento" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos (Vencimiento)</SelectItem>
                            <SelectItem value="expiring">Por vencer</SelectItem>
                            <SelectItem value="expired">Vencidos</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={currentStatus} onValueChange={handleStatusFilter}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos (Estado)</SelectItem>
                            <SelectItem value="active">Activos</SelectItem>
                            <SelectItem value="inactive">Inactivos</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center bg-muted/50 p-1 rounded-md border mr-2">
                        <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs">
                            <Filter className="h-3.5 w-3.5" /> Vista
                        </Button>
                        <Button
                            variant={!searchParams.get('is_active') || searchParams.get('is_active') === 'true' ? 'default' : 'ghost'}
                            size="sm"
                            className={cn("h-8 text-xs px-4", (!searchParams.get('is_active') || searchParams.get('is_active') === 'true') && "bg-[#FF5A1F] hover:bg-[#FF5A1F]/90 text-white")}
                            onClick={() => {
                                const params = new URLSearchParams(searchParams)
                                params.set('is_active', 'true')
                                params.set('page', '1')
                                router.push(`${pathname}?${params.toString()}`)
                            }}
                        >
                            Activos
                        </Button>
                        <Button
                            variant={searchParams.get('is_active') === 'false' ? 'default' : 'ghost'}
                            size="sm"
                            className={cn("h-8 text-xs px-4", searchParams.get('is_active') === 'false' && "bg-[#FF5A1F] hover:bg-[#FF5A1F]/90 text-white")}
                            onClick={() => {
                                const params = new URLSearchParams(searchParams)
                                params.set('is_active', 'false')
                                params.set('page', '1')
                                router.push(`${pathname}?${params.toString()}`)
                            }}
                        >
                            <Trash2 className="h-3.5 w-3.5 mr-1" /> Papelera
                        </Button>
                    </div>

                    <Button variant="outline" size="icon" onClick={handleDownloadExcel} title="Descargar Excel" className="h-9 w-9">
                        <FileText className="h-4 w-4 text-green-600" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={handleDownloadZip} title="Descargar Seleccionados (ZIP)" disabled={isDownloading} className="h-9 w-9">
                        {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileArchive className="h-4 w-4 text-orange-600" />}
                    </Button>

                    <BulkUploadDocumentDialog
                        documentTypes={documentTypes}
                        onSuccess={() => router.refresh()}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="rounded-md border bg-white shadow-sm overflow-hidden">
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
                            <TableHead>DOCUMENTO</TableHead>
                            <TableHead>VÁLIDO DESDE</TableHead>
                            <TableHead>ESTADO</TableHead>
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
                                            <span className="font-medium text-sm">
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
                                        {getStatusBadge(doc)}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {doc.valid_until ? format(parseISO(doc.valid_until), 'dd/MM/yyyy') : '-'}
                                    </TableCell>
                                    <TableCell>
                                        <a
                                            href="#"
                                            onClick={async (e) => {
                                                e.preventDefault()
                                                // Quick view logic
                                                // Ideally use the same getSignedUrls logic or single
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
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
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

            {/* Pagination (Simple) */}
            <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                >
                    Anterior
                </Button>
                <div className="text-sm text-muted-foreground">
                    Página {currentPage} de {totalPages || 1}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                >
                    Siguiente
                </Button>
            </div>
        </div >
    )
}
