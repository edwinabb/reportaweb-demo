import { getProfiles } from "@/lib/actions/users"
import { UsersClientPage } from "./client-page"
import { PageDescription } from "@/components/ui/page-description"

export default async function UsersPage({
    searchParams,
}: {
    searchParams: Promise<{ view?: string }>
}) {
    const params = await searchParams
    const isTrash = params.view === 'trash'

    // getProfiles(onlyActive)
    const OnlyActive = !isTrash
    const users = await getProfiles(OnlyActive)

    return (
        <div className="flex flex-col gap-4">
            <h1 className="sr-only">Usuarios</h1>
            <PageDescription>
                Listado del personal de la empresa. Desde aquí gestionas usuarios, sus datos y descargas masivas.
            </PageDescription>
            <UsersClientPage users={users} isTrash={isTrash} />
        </div>
    )
}
