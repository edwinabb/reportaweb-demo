'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { format, parseISO, differenceInCalendarMonths } from 'date-fns'
import { ArrowLeft, Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { deactivateMaquinariaDocuments } from '@/lib/actions/maquinaria-docs-depuracion'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { TablePaginationBar } from '@/components/ui/table-pagination-bar'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
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

interface DepurableDoc {
    id: string
    numero_doc: string | null
    archivo_url: string | null
    fecha_vencimiento: string
    tipo_doc: { id: string, nombre: string } | null
    maquinaria: { id: string, nombre: string | null, codigo_interno: string | null } | null
}

interface DepurarClientProps {
    documents: DepurableDoc[]
    totalCount: number
    currentPage: number
    pageSize: number
}

export function DepurarClient({ documents, totalCount, currentPage, pageSize }: DepurarClientProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [isPending, startTransition] = useTransition()

    // Agrupar por meses de vencimiento: "+6" agrupa 6 o más.
    const groups = useMemo(() => {
        const today = new Date()
        const map = new Map<number, DepurableDoc[]>()
        for (const doc of documents) {
            const months = Math.min(6, Math.max(1, differenceInCalendarMonths(today, parseISO(doc.fecha_vencimiento))))
            if (!map.has(months)) map.set(months, [])
            map.get(months)!.push(doc)
        }
        // Grupos del más antiguo (+6) al más reciente (+1);
        // dentro de cada grupo, del más reciente al más antiguo.
        return Array.from(map.entries())
            .sort((a, b) => b[0] - a[0])
            .map(([months, docs]) => ({
                months,
                docs: docs.sort((a, b) => b.fecha_vencimiento.localeCompare(a.fecha_vencimiento)),
            }))
    }, [documents])

    const setPageParam = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams)
        params.set(key, value)
        router.push(`${pathname}?${params.toString()}`)
    }

    const toggleSelect = (id: string) => {
        const next = new Set(selectedIds)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        setSelectedIds(next)
    }

    const toggleGroup = (docs: DepurableDoc[], checked: boolean) => {
        const next = new Set(selectedIds)
        for (const d of docs) {
            if (checked) next.add(d.id)
            else next.delete(d.id)
        }
        setSelectedIds(next)
    }

    const handleConfirm = () => {
        startTransition(async () => {
            const res = await deactivateMaquinariaDocuments(Array.from(selectedIds))
            if (res.success) {
                toast.success(res.message)
                setSelectedIds(new Set())
                router.refresh()
            } else {
                toast.error(res.message)
            }
            setConfirmOpen(false)
        })
    }

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-4 rounded-lg border shadow-sm">
                <Button variant="outline" size="sm" onClick={() => router.push('/maquinarias/documentos')}>
                    <ArrowLeft className="h-4 w-4 mr-1" /> Volver a Documentación
                </Button>
                <Button
                    size="sm"
                    variant="destructive"
                    disabled={selectedIds.size === 0 || isPending}
                    onClick={() => setConfirmOpen(true)}
                >
                    {isPending
                        ? <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        : <Trash2 className="h-4 w-4 mr-2" />}
                    Pasar a INACTIVO ({selectedIds.size})
                </Button>
            </div>

            {documents.length === 0 ? (
                <div className="rounded-md border bg-white p-12 text-center text-muted-foreground">
                    🎉 No hay documentos activos con más de 1 mes de vencidos.
                </div>
            ) : (
                groups.map(({ months, docs }) => {
                    const allSelected = docs.every(d => selectedIds.has(d.id))
                    return (
                        <div key={months} className="space-y-2">
                            <h2 className="text-sm font-bold tracking-wide text-muted-foreground uppercase">
                                Documentos con +{months} {months === 1 ? 'mes' : 'meses'} de vencimiento
                                <Badge variant="secondary" className="ml-2">{docs.length}</Badge>
                            </h2>
                            <div className="rounded-md border bg-white shadow-sm overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-muted/50">
                                        <TableRow>
                                            <TableHead className="w-[40px]">
                                                <Checkbox
                                                    checked={allSelected && docs.length > 0}
                                                    onCheckedChange={(c) => toggleGroup(docs, !!c)}
                                                />
                                            </TableHead>
                                            <TableHead>EQUIPO</TableHead>
                                            <TableHead>DOCUMENTO</TableHead>
                                            <TableHead>VENCIÓ EL</TableHead>
                                            <TableHead>ARCHIVO</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {docs.map(doc => (
                                            <TableRow key={doc.id} data-state={selectedIds.has(doc.id) ? 'selected' : undefined}>
                                                <TableCell>
                                                    <Checkbox
                                                        checked={selectedIds.has(doc.id)}
                                                        onCheckedChange={() => toggleSelect(doc.id)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-sm">
                                                            {doc.maquinaria?.nombre || '-'}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">{doc.maquinaria?.codigo_interno}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    <div className="flex flex-col">
                                                        <span>{doc.tipo_doc?.nombre}</span>
                                                        {doc.numero_doc && (
                                                            <span className="text-xs text-muted-foreground font-mono">{doc.numero_doc}</span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="destructive">
                                                        {format(parseISO(doc.fecha_vencimiento), 'dd/MM/yyyy')}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {doc.archivo_url ? (
                                                        <a
                                                            href={doc.archivo_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-orange-500 hover:underline"
                                                        >
                                                            Link del archivo
                                                        </a>
                                                    ) : (
                                                        <span className="text-muted-foreground">-</span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )
                })
            )}

            <TablePaginationBar
                totalCount={totalCount}
                page={currentPage}
                pageSize={pageSize}
                onPageChange={(p) => setPageParam('page', String(p))}
                onPageSizeChange={(size) => { setPageParam('perPage', String(size)) }}
            />

            <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Pasar {selectedIds.size} documento(s) a INACTIVO?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Los documentos seleccionados dejarán de aparecer en la vista de Activos.
                            Podrás reactivarlos individualmente desde la Papelera de Documentación.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirm} disabled={isPending} className="bg-destructive text-white hover:bg-destructive/90">
                            Confirmar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
