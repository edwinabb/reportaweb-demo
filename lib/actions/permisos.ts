'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export type SistemaRecurso = {
    id: string
    nombre: string
    ruta_base: string
    seccion: string
    orden: number
}

export type CargoPermiso = {
    recurso_id: string
    cargo_id: string
    puede_ver: boolean
    puede_ingresar: boolean
    puede_editar: boolean
    puede_eliminar: boolean
    sistema_recursos: SistemaRecurso
}

export type ViedCampo = 'puede_ver' | 'puede_ingresar' | 'puede_editar' | 'puede_eliminar'

export async function getPermisosParaCargo(cargoId: string): Promise<CargoPermiso[]> {
    const supabase = await createClient()
    const { data } = await supabase
        .from('cargo_permisos')
        .select(`
            recurso_id,
            cargo_id,
            puede_ver,
            puede_ingresar,
            puede_editar,
            puede_eliminar,
            sistema_recursos ( id, nombre, ruta_base, seccion, orden )
        `)
        .eq('cargo_id', cargoId)

    if (!data?.length) return []

    return data.map(p => ({
        recurso_id: p.recurso_id,
        cargo_id:   p.cargo_id,
        puede_ver:       p.puede_ver,
        puede_ingresar:  p.puede_ingresar,
        puede_editar:    p.puede_editar,
        puede_eliminar:  p.puede_eliminar,
        sistema_recursos: p.sistema_recursos as unknown as SistemaRecurso,
    }))
}

export async function upsertCargoPermiso(
    cargoId:   string,
    recursoId: string,
    campo:     ViedCampo,
    valor:     boolean
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'No autenticado' }

    const { data: prof } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (!['reporta_admin', 'admin_tenant'].includes(prof?.role ?? '')) {
        return { success: false, error: 'Sin permiso' }
    }

    const { data: tenantId } = await supabase.rpc('get_auth_tenant_id')
    if (!tenantId) return { success: false, error: 'Sin tenant' }

    const { error } = await supabase
        .from('cargo_permisos')
        .upsert(
            {
                tenant_id:  tenantId,
                cargo_id:   cargoId,
                recurso_id: recursoId,
                [campo]:    valor,
                updated_at: new Date().toISOString(),
            },
            { onConflict: 'tenant_id,cargo_id,recurso_id' }
        )

    if (error) return { success: false, error: error.message }

    revalidatePath('/sistema/permisos')
    return { success: true }
}

/** Inicializa cargo_permisos para un cargo nuevo (todos true, excepto eliminar). */
export async function seedPermisosParaCargo(
    cargoId:  string,
    tenantId: string
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()

    const { data: recursos } = await supabase
        .from('sistema_recursos')
        .select('id')

    if (!recursos?.length) return { success: false, error: 'Sin recursos configurados' }

    const rows = recursos.map(r => ({
        tenant_id:      tenantId,
        cargo_id:       cargoId,
        recurso_id:     r.id,
        puede_ver:      true,
        puede_ingresar: true,
        puede_editar:   true,
        puede_eliminar: false,
    }))

    const { error } = await supabase
        .from('cargo_permisos')
        .upsert(rows, { onConflict: 'tenant_id,cargo_id,recurso_id', ignoreDuplicates: true })

    if (error) return { success: false, error: error.message }

    revalidatePath('/sistema/permisos')
    return { success: true }
}
