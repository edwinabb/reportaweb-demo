export type TerceroTipo = 'cliente' | 'proveedor' | 'ambos'

export interface Tercero {
    id: string
    tenant_id: string
    tipo: TerceroTipo
    razon_social: string
    nombre_comercial?: string
    ruc?: string
    direccion?: string
    telefono?: string
    email?: string
    rubro?: string
    rubro_id?: string
    pais_id?: string
    ubigeo_codigo?: string
    condicionsunat?: string
    estadosunat?: string
    logo_url?: string
    ubicacion_ciudad?: string
    ubicacion_departamento?: string
    ubicacion_pais?: string
    is_active: boolean
    created_at?: string
    updated_at?: string
    // Joined relations
    rubros?: { nombre: string }
    paises?: { nombre: string }
    ubigeo?: { departamento: string, provincia: string, distrito: string }
}

export interface TerceroContacto {
    id: string
    tercero_id: string
    tenant_id: string
    nombre_completo: string
    cargo?: string
    area?: string
    telefono?: string
    email?: string
    is_active: boolean
    // Joined relations
    tercero?: Tercero
}

export interface TerceroSitio {
    id: string
    tenant_id: string
    nombre: string
    codigo?: string
    direccion?: string
    ciudad?: string
    tipo_id?: string  // UUID reference to sitios_tipo
    tipo?: string // Name from join
    is_active: boolean
    latitud?: number
    longitud?: number
    comentarios?: string
    pais?: string
    // For joined data from query
    terceros?: Tercero[]
    // For form handling (array of tercero IDs)
    tercero_ids?: string[]
}

/**
 * Personal de terceros = Users del sistema vinculados a una empresa tercera
 * (profiles.tercero_id / personal_externo). Ver getPersonalExterno().
 */
export interface PersonalExterno {
    id: string
    nombres: string
    apellidos: string
    email: string | null
    telefono: string | null
    tipo_doc: string | null
    numero_doc: string | null
    cargo: string | null
    empresa: string | null
    is_active: boolean
}

/** @deprecated La tabla terceros_personal queda deprecada — usar PersonalExterno (profiles). */
export interface TerceroPersonal {
    id: string
    tercero_id: string
    tenant_id: string
    nombres: string
    apellidos: string
    pais_nacionalidad?: string
    tipo_doc?: string
    numero_doc?: string
    cargo?: string
    email?: string
    telefono?: string
    firma_url?: string
    foto_url?: string
    pin?: string
    is_active: boolean
}
