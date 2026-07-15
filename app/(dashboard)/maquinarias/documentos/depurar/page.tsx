import { getDepurableMaquinariaDocuments } from '@/lib/actions/maquinaria-docs-depuracion'
import { PageDescription } from '@/components/ui/page-description'
import { DepurarClient } from './depurar-client'

export const dynamic = 'force-dynamic'

export default async function DepurarDocumentosMaquinariaPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams
    const page = typeof params.page === 'string' ? parseInt(params.page) : 1
    const limit = typeof params.perPage === 'string' ? Math.min(parseInt(params.perPage) || 20, 100) : 20

    const { data: documents, count } = await getDepurableMaquinariaDocuments({ page, limit })

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <h1 className="sr-only">Depurar documentos vencidos de maquinaria</h1>
            <PageDescription>
                Documentos activos con más de 1 mes de vencidos. Selecciona los que el cliente confirme y pásalos a inactivos.
            </PageDescription>

            <DepurarClient
                documents={documents}
                totalCount={count}
                currentPage={page}
                pageSize={limit}
            />
        </div>
    )
}
