import { Suspense } from 'react'
import { getDocumentTypes } from '@/lib/actions/document-types'
import { Skeleton } from '@/components/ui/skeleton'
import { PageDescription } from '@/components/ui/page-description'
import { DocumentTypesPageClient } from './page-client'

export default async function DocumentTypesPage() {
    // Server Component fetches data
    const { data: documentTypes, error } = await getDocumentTypes()

    if (error) {
        return <div className="p-8 text-destructive">Error al cargar tipos de documentos: {error}</div>
    }

    return (
        <div className="flex flex-col h-full space-y-4 p-8">
            <h1 className="sr-only">Tipos de Documentos</h1>
            <PageDescription>
                Catálogo de documentos requeridos para el personal. Desde aquí gestionas tipos, alertas de vencimiento y descargas.
            </PageDescription>

            <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
                <DocumentTypesPageClient initialData={documentTypes || []} />
            </Suspense>
        </div>
    )
}
