"use server"

import { createClient } from "@/utils/supabase/server"
import { getSupabaseContext } from '@/lib/action-context'

/**
 * REP-3.11-006: Catalog Synchronization Validation & Audit
 *
 * This module provides:
 * 1. Catalog count validation
 * 2. Missing catalog detection
 * 3. Catalog seeding for missing values
 * 4. UI dropdown completeness checks
 */

interface CatalogAudit {
  tableName: string
  expectedCount: number
  actualCount: number
  missingItems: string[]
  inactive: number
  status: 'OK' | 'MISSING' | 'INCOMPLETE' | 'ERROR'
}

interface AuditReport {
  timestamp: string
  tenant: string
  catalogs: CatalogAudit[]
  summary: {
    totalCatalogs: number
    completeCatalogs: number
    missingCatalogs: number
    totalGaps: number
  }
}

/**
 * Validate all catalogs and return audit report
 */
export async function auditAllCatalogs(): Promise<AuditReport> {
  const { adminClient, tenantId } = await getSupabaseContext()
  if (!adminClient || !tenantId) {
    throw new Error('Not authorized')
  }

  const catalogs: CatalogAudit[] = []
  let completeCatalogs = 0
  let missingCatalogs = 0

  // 1. Audit RUBROS (tenant-scoped)
  const rubrosAudit = await auditRubros(adminClient, tenantId)
  catalogs.push(rubrosAudit)
  if (rubrosAudit.status === 'OK') completeCatalogs++
  else missingCatalogs++

  // 2. Audit SERVICIOS_TIPO_PRECIOS (tenant-scoped)
  const serviciosAudit = await auditServiciosTipoPrecios(adminClient, tenantId)
  catalogs.push(serviciosAudit)
  if (serviciosAudit.status === 'OK') completeCatalogs++
  else missingCatalogs++

  // 3. Audit CONTACTOS_CARGO (tenant-scoped)
  const contactosCargo = await auditContactosCargo(adminClient, tenantId)
  catalogs.push(contactosCargo)
  if (contactosCargo.status === 'OK') completeCatalogs++
  else missingCatalogs++

  // 4. Audit PERSONAL_CARGOS (tenant-scoped)
  const personalCargos = await auditPersonalCargos(adminClient, tenantId)
  catalogs.push(personalCargos)
  if (personalCargos.status === 'OK') completeCatalogs++
  else missingCatalogs++

  // 5. Audit CONTACTOS_AREA (tenant-scoped)
  const contactosArea = await auditContactosArea(adminClient, tenantId)
  catalogs.push(contactosArea)
  if (contactosArea.status === 'OK') completeCatalogs++
  else missingCatalogs++

  // 6. Audit SITIOS_TIPO (tenant-scoped)
  const sitiosTipo = await auditSitiosTipo(adminClient, tenantId)
  catalogs.push(sitiosTipo)
  if (sitiosTipo.status === 'OK') completeCatalogs++
  else missingCatalogs++

  // 7. Audit PAISES (global)
  const paisesAudit = await auditPaises(adminClient)
  catalogs.push(paisesAudit)
  if (paisesAudit.status === 'OK') completeCatalogs++
  else missingCatalogs++

  const totalGaps = catalogs.reduce((sum, c) => sum + c.missingItems.length, 0)

  // Get tenant name
  const { data: company } = await adminClient
    .from('companies')
    .select('nombre')
    .eq('id', tenantId)
    .single()

  return {
    timestamp: new Date().toISOString(),
    tenant: company?.nombre || 'Unknown',
    catalogs,
    summary: {
      totalCatalogs: catalogs.length,
      completeCatalogs,
      missingCatalogs,
      totalGaps
    }
  }
}

/**
 * Audit RUBROS catalog
 * Expected: 10-15 items per tenant (based on Bubble data)
 */
async function auditRubros(adminClient: any, tenantId: string): Promise<CatalogAudit> {
  const { data: rubros } = await adminClient
    .from('rubros')
    .select('id, nombre, is_active')
    .eq('tenant_id', tenantId)

  const expectedCount = 12 // Conservative estimate
  const actualCount = rubros?.length || 0
  const missingItems: string[] = []

  // Check for common rubros that should exist
  const commonRubros = ['Transportes', 'Construcción', 'Minería', 'Manufactura']
  const existingNames = (rubros || []).map((r: { nombre: string }) => r.nombre.toLowerCase())

  commonRubros.forEach(rubro => {
    if (!existingNames.includes(rubro.toLowerCase())) {
      missingItems.push(rubro)
    }
  })

  const inactive = (rubros || []).filter((r: { is_active: boolean }) => !r.is_active).length

  return {
    tableName: 'rubros',
    expectedCount,
    actualCount,
    missingItems,
    inactive,
    status: actualCount >= 8 ? 'OK' : 'INCOMPLETE'
  }
}

/**
 * Audit SERVICIOS_TIPO_PRECIOS catalog
 * Expected: 3-5 items per tenant (based on Bubble data - 58 total for CISE+GRUAS)
 */
async function auditServiciosTipoPrecios(adminClient: any, tenantId: string): Promise<CatalogAudit> {
  const { data: servicios } = await adminClient
    .from('servicios_tipo_precios')
    .select('id, nombre')
    .eq('tenant_id', tenantId)

  const expectedCount = 5
  const actualCount = servicios?.length || 0
  const missingItems: string[] = []

  // Common service types
  const commonServicios = ['Por hora', 'Por día', 'Por mes', 'Fijo', 'Variable']
  const existingNames = (servicios || []).map((s: { nombre: string }) => s.nombre.toLowerCase())

  commonServicios.forEach(servicio => {
    if (!existingNames.includes(servicio.toLowerCase())) {
      missingItems.push(servicio)
    }
  })

  return {
    tableName: 'servicios_tipo_precios',
    expectedCount,
    actualCount,
    missingItems,
    inactive: 0,
    status: actualCount >= 3 ? 'OK' : 'INCOMPLETE'
  }
}

/**
 * Audit CONTACTOS_CARGO catalog
 * Expected: 3-5 items per tenant
 */
async function auditContactosCargo(adminClient: any, tenantId: string): Promise<CatalogAudit> {
  const { data: cargos } = await adminClient
    .from('contactos_cargo')
    .select('id, nombre, is_active')
    .eq('tenant_id', tenantId)

  const expectedCount = 4
  const actualCount = cargos?.length || 0
  const missingItems: string[] = []

  const commonCargos = ['Gerente', 'Jefe', 'Coordinador', 'Operario']
  const existingNames = (cargos || []).map((c: { nombre: string }) => c.nombre.toLowerCase())

  commonCargos.forEach(cargo => {
    if (!existingNames.includes(cargo.toLowerCase())) {
      missingItems.push(cargo)
    }
  })

  const inactive = (cargos || []).filter((c: { is_active: boolean }) => !c.is_active).length

  return {
    tableName: 'contactos_cargo',
    expectedCount,
    actualCount,
    missingItems,
    inactive,
    status: actualCount >= 2 ? 'OK' : 'INCOMPLETE'
  }
}

/**
 * Audit PERSONAL_CARGOS catalog
 * Expected: 5-8 items per tenant
 */
async function auditPersonalCargos(adminClient: any, tenantId: string): Promise<CatalogAudit> {
  const { data: cargos } = await adminClient
    .from('personal_cargos')
    .select('id, nombre, is_active')
    .eq('tenant_id', tenantId)

  const expectedCount = 6
  const actualCount = cargos?.length || 0
  const missingItems: string[] = []

  const commonCargos = ['Operario', 'Supervisor', 'Chofer', 'Técnico', 'Ayudante']
  const existingNames = (cargos || []).map(c => c.nombre.toLowerCase())

  commonCargos.forEach(cargo => {
    if (!existingNames.includes(cargo.toLowerCase())) {
      missingItems.push(cargo)
    }
  })

  const inactive = (cargos || []).filter(c => !c.is_active).length

  return {
    tableName: 'personal_cargos',
    expectedCount,
    actualCount,
    missingItems,
    inactive,
    status: actualCount >= 3 ? 'OK' : 'INCOMPLETE'
  }
}

/**
 * Audit CONTACTOS_AREA catalog
 * Expected: 3-5 items per tenant
 */
async function auditContactosArea(adminClient: any, tenantId: string): Promise<CatalogAudit> {
  const { data: areas } = await adminClient
    .from('contactos_area')
    .select('id, nombre, is_active')
    .eq('tenant_id', tenantId)

  const expectedCount = 4
  const actualCount = areas?.length || 0
  const missingItems: string[] = []

  const commonAreas = ['Ventas', 'Operaciones', 'Administración', 'Finanzas']
  const existingNames = (areas || []).map(a => a.nombre.toLowerCase())

  commonAreas.forEach(area => {
    if (!existingNames.includes(area.toLowerCase())) {
      missingItems.push(area)
    }
  })

  const inactive = (areas || []).filter(a => !a.is_active).length

  return {
    tableName: 'contactos_area',
    expectedCount,
    actualCount,
    missingItems,
    inactive,
    status: actualCount >= 2 ? 'OK' : 'INCOMPLETE'
  }
}

/**
 * Audit SITIOS_TIPO catalog
 * Expected: 3-5 items per tenant
 */
async function auditSitiosTipo(adminClient: any, tenantId: string): Promise<CatalogAudit> {
  const { data: tipos } = await adminClient
    .from('sitios_tipo')
    .select('id, nombre, is_active')
    .eq('tenant_id', tenantId)

  const expectedCount = 4
  const actualCount = tipos?.length || 0
  const missingItems: string[] = []

  const commonTipos = ['Oficina', 'Almacén', 'Obra', 'Taller']
  const existingNames = (tipos || []).map(t => t.nombre.toLowerCase())

  commonTipos.forEach(tipo => {
    if (!existingNames.includes(tipo.toLowerCase())) {
      missingItems.push(tipo)
    }
  })

  const inactive = (tipos || []).filter(t => !t.is_active).length

  return {
    tableName: 'sitios_tipo',
    expectedCount,
    actualCount,
    missingItems,
    inactive,
    status: actualCount >= 2 ? 'OK' : 'INCOMPLETE'
  }
}

/**
 * Audit PAISES catalog (global, not tenant-scoped)
 * Expected: 50+ countries
 */
async function auditPaises(adminClient: any): Promise<CatalogAudit> {
  const { data: paises } = await adminClient
    .from('paises')
    .select('id, nombre, is_active')
    .eq('is_active', true)

  const expectedCount = 50
  const actualCount = paises?.length || 0
  const missingItems: string[] = []

  // Check for key countries
  const keyCountries = ['PE', 'CO', 'CL', 'AR', 'MX']
  const existingCodes = (paises || []).map(p => p.id)

  keyCountries.forEach(code => {
    if (!existingCodes.includes(code)) {
      missingItems.push(`Country: ${code}`)
    }
  })

  return {
    tableName: 'paises',
    expectedCount,
    actualCount,
    missingItems,
    inactive: 0,
    status: actualCount >= 30 ? 'OK' : 'INCOMPLETE'
  }
}

/**
 * Seed missing catalog items (if audit found gaps)
 */
export async function seedMissingCatalogs(catalogName: string, missingItems: string[]): Promise<{ success: boolean; inserted: number; errors: string[] }> {
  const { adminClient, tenantId, user } = await getSupabaseContext()
  if (!adminClient || !tenantId || !user) {
    return { success: false, inserted: 0, errors: ['Not authorized'] }
  }

  const errors: string[] = []
  let inserted = 0

  for (const item of missingItems) {
    try {
      const { error } = await adminClient
        .from(catalogName)
        .insert({
          tenant_id: tenantId,
          nombre: item.toUpperCase(),
          is_active: true,
          created_by: user.id
        })

      if (error) {
        errors.push(`Failed to insert "${item}": ${error.message}`)
      } else {
        inserted++
      }
    } catch (err: any) {
      errors.push(`Error inserting "${item}": ${err.message}`)
    }
  }

  return {
    success: errors.length === 0,
    inserted,
    errors
  }
}

/**
 * Get active catalog items for UI dropdown rendering
 * Returns counts and sample items
 */
export async function getCatalogSummary(tableName: string): Promise<{
  tableName: string
  activeCount: number
  inactiveCount: number
  items: Array<{ id: string; nombre: string }>
}> {
  const { adminClient, tenantId } = await getSupabaseContext()
  if (!adminClient || !tenantId) {
    return { tableName, activeCount: 0, inactiveCount: 0, items: [] }
  }

  const { data: items, error } = await adminClient
    .from(tableName)
    .select('id, nombre, is_active')
    .eq('tenant_id', tenantId)
    .order('nombre')

  if (error) {
    return { tableName, activeCount: 0, inactiveCount: 0, items: [] }
  }

  const activeCount = (items || []).filter(i => i.is_active).length
  const inactiveCount = (items || []).filter(i => !i.is_active).length
  const activeItems = (items || [])
    .filter(i => i.is_active)
    .map(i => ({ id: i.id, nombre: i.nombre }))

  return {
    tableName,
    activeCount,
    inactiveCount,
    items: activeItems
  }
}
