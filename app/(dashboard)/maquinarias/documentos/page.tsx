import { getMaquinarias } from '@/lib/actions/maquinarias'
import { getMaquinariaTipos } from '@/lib/actions/maquinaria-types'
import { getGlobalMaquinariaDocumentsPaged, MaquinariaDocExpiryStatus } from '@/lib/actions/maquinaria-docs-query'
import { GlobalMaquinariaDocumentsTable } from '@/components/maquinaria/global-documents-table'
import { PageDescription } from '@/components/ui/page-description'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Maquinaria - Documentación' }

export default async function GlobalDocumentsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams
    const search = typeof params.search === 'string' ? params.search : undefined
    const tipoDocId = typeof params.tipoDocId === 'string' ? params.tipoDocId : undefined
    const isActiveParam = typeof params.is_active === 'string' ? params.is_active : 'true'
    const isActive = isActiveParam !== 'false'
    const expiryStatus = typeof params.expiryStatus === 'string' ? params.expiryStatus as MaquinariaDocExpiryStatus : 'all'
    const page = typeof params.page === 'string' ? parseInt(params.page) : 1
    const limit = typeof params.perPage === 'string' ? Math.min(parseInt(params.perPage) || 20, 100) : 20

    const [{ data: documents, count }, tipos, maquinarias] = await Promise.all([
        getGlobalMaquinariaDocumentsPaged({
            search,
            tipoDocId,
            isActive,
            expiryStatus,
            page,
            limit,
        }),
        getMaquinariaTipos(),
        getMaquinarias(),
    ])

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <h1 className="sr-only">Maquinaria - Documentación</h1>
            <PageDescription>
                Listado de documentos de los equipos. Desde aquí puedes realizar gestiones y descargas masivas.
            </PageDescription>

            <GlobalMaquinariaDocumentsTable
                documents={documents || []}
                tipos={tipos || []}
                maquinarias={maquinarias || []}
                totalCount={count || 0}
                currentPage={page}
                pageSize={limit}
            />
        </div>
    )
}
