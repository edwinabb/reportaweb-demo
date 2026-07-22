'use server';

import { revalidatePath } from 'next/cache';
import { getTenantContext } from '@/lib/utils/tenant-context';
import { randomUUID } from 'crypto';

export interface PanelVentasParams {
    valuationPage?: number;
    valuationSort?: string; // 'count_desc', 'hours_desc', 'oldest_asc'
    invoicingPage?: number;
    invoicingSort?: string;
}

export interface ClientGroupMetric {
    cliente_id: string;
    cliente_nombre: string;
    cantidad: number;
    oldest_date: string;
    total_value: number; // hours for valuation, amount for invoicing
}

export interface PanelVentasData {
    kpis: {
        total_informes: number;
        total_horas: number;
        total_valoraciones: number;
        total_monto: number;
    };
    valuationList: {
        data: ClientGroupMetric[];
        total: number;
        page: number;
        limit: number;
    };
    invoicingList: {
        data: ClientGroupMetric[];
        total: number;
        page: number;
        limit: number;
    };
}

export async function getPanelVentasData(params: PanelVentasParams): Promise<PanelVentasData> {
    const limit = 10;
    const valPage = params.valuationPage || 1;
    const invPage = params.invoicingPage || 1;

    const { adminClient: supabase, tenantId } = await getTenantContext();
    if (!tenantId || !supabase) return emptyData(valPage, invPage, limit);

    const [{ data: pendientes }, { data: valorados }] = await Promise.all([
        supabase
            .from('view_valoraciones_ventas')
            .select('cliente_id, cliente, fecha, hrs_trab, total')
            .eq('tenant_id', tenantId)
            .eq('estado', 'PENDIENTE'),
        supabase
            .from('view_valoraciones_ventas')
            .select('cliente_id, cliente, fecha, hrs_trab, total')
            .eq('tenant_id', tenantId)
            .eq('estado', 'VALORADO'),
    ]);

    // Aggregate PENDIENTE by cliente → valuation list
    const valMap = new Map<string, ClientGroupMetric>();
    for (const row of pendientes || []) {
        const key = row.cliente_id || 'sin-cliente';
        const ex = valMap.get(key);
        if (ex) {
            ex.cantidad += 1;
            ex.total_value += Number(row.hrs_trab || 0);
            if (row.fecha && row.fecha < ex.oldest_date) ex.oldest_date = row.fecha;
        } else {
            valMap.set(key, { cliente_id: key, cliente_nombre: row.cliente || 'Sin Cliente', cantidad: 1, oldest_date: row.fecha || '', total_value: Number(row.hrs_trab || 0) });
        }
    }

    // Aggregate VALORADO by cliente → invoicing list
    const invMap = new Map<string, ClientGroupMetric>();
    for (const row of valorados || []) {
        const key = row.cliente_id || 'sin-cliente';
        const ex = invMap.get(key);
        if (ex) {
            ex.cantidad += 1;
            ex.total_value += Number(row.total || 0);
            if (row.fecha && row.fecha < ex.oldest_date) ex.oldest_date = row.fecha;
        } else {
            invMap.set(key, { cliente_id: key, cliente_nombre: row.cliente || 'Sin Cliente', cantidad: 1, oldest_date: row.fecha || '', total_value: Number(row.total || 0) });
        }
    }

    const valuationArray = Array.from(valMap.values());
    const invoicingArray = Array.from(invMap.values());

    const totalInformes = valuationArray.reduce((a, c) => a + c.cantidad, 0);
    const totalHoras = valuationArray.reduce((a, c) => a + c.total_value, 0);
    const totalValoraciones = invoicingArray.reduce((a, c) => a + c.cantidad, 0);
    const totalMonto = invoicingArray.reduce((a, c) => a + c.total_value, 0);

    const sortVal = params.valuationSort || 'value_desc';
    valuationArray.sort(clientSort(sortVal));
    const vPageNum = Number(valPage) || 1;
    const paginatedValuation = valuationArray.slice((vPageNum - 1) * limit, vPageNum * limit);

    const sortInv = params.invoicingSort || 'value_desc';
    invoicingArray.sort(clientSort(sortInv));
    const iPageNum = Number(invPage) || 1;
    const paginatedInvoicing = invoicingArray.slice((iPageNum - 1) * limit, iPageNum * limit);

    return {
        kpis: { total_informes: totalInformes, total_horas: totalHoras, total_valoraciones: totalValoraciones, total_monto: totalMonto },
        valuationList: { data: paginatedValuation, total: valuationArray.length, page: vPageNum, limit },
        invoicingList: { data: paginatedInvoicing, total: invoicingArray.length, page: iPageNum, limit },
    };
}

function clientSort(sortKey: string) {
    return (a: ClientGroupMetric, b: ClientGroupMetric) => {
        switch (sortKey) {
            case 'qty_asc': return a.cantidad - b.cantidad;
            case 'qty_desc': return b.cantidad - a.cantidad;
            case 'value_asc': return a.total_value - b.total_value;
            case 'value_desc': return b.total_value - a.total_value;
            case 'oldest_asc': return new Date(a.oldest_date).getTime() - new Date(b.oldest_date).getTime();
            case 'oldest_desc': return new Date(b.oldest_date).getTime() - new Date(a.oldest_date).getTime();
            default: return b.cantidad - a.cantidad;
        }
    };
}

function emptyData(valPage: number, invPage: number, limit: number): PanelVentasData {
    return {
        kpis: { total_informes: 0, total_horas: 0, total_valoraciones: 0, total_monto: 0 },
        valuationList: { data: [], total: 0, page: valPage, limit },
        invoicingList: { data: [], total: 0, page: invPage, limit }
    };
}

// ==========================================
// VALORACIONES DATA FETCHING
// ==========================================

export interface ValoracionesParams {
    page?: number;
    limit?: number;
    fecha_inicio?: string;
    fecha_fin?: string;
    cliente_id?: string;
    estado?: 'PENDIENTE' | 'VALORADO' | 'FACTURADO' | 'ALL';
}

export interface ValoracionItem {
    id: string; // ID of the source record (reporte_maquinaria.id)
    id_reporte: string;
    fecha_reporte: string;
    dia_semana: string;
    cliente_nombre: string;
    lugar: string;
    descripcion: string;
    maquinaria: string;
    cotizacion_numero: string;
    horas_recorrido: number;
    jornada: string;
    horas_trabajo: number;
    horas_minima: number;
    cantidad_facturar: number;
    moneda: string;
    precio_venta: number;
    total_venta: number;
    valoracion_codigo: string;
    factura_codigo: string;
    proveedor: string;
    estado: 'PENDIENTE' | 'VALORADO' | 'FACTURADO';
    pdf_reporte?: string;
    pdf_cotizacion?: string;
    pdf_valoracion?: string;
    pdf_factura?: string;
}

export async function getValoracionesData(params: ValoracionesParams) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    // 0. Get User Tenant
    const { adminClient: supabase, tenantId } = await getTenantContext();

    if (!tenantId || !supabase) {
        console.error('[getValoracionesData] No tenant_id found');
        return { data: [], total: 0, page, limit };
    }

    let query = supabase
        .from('view_valoraciones_ventas')
        .select('*', { count: 'exact' })
        .eq('tenant_id', tenantId);

    // Apply Filters
    if (params.fecha_inicio) {
        query = query.gte('fecha', params.fecha_inicio);
    }
    if (params.fecha_fin) {
        query = query.lte('fecha', params.fecha_fin);
    }
    if (params.cliente_id) {
        query = query.eq('cliente_id', params.cliente_id);
    }

    if (params.estado && params.estado !== 'ALL') {
        if (params.estado === 'PENDIENTE') {
            query = query.eq('estado', 'PENDIENTE');
        } else if (params.estado === 'VALORADO') {
            query = query.eq('estado', 'VALORADO');
        } else if (params.estado === 'FACTURADO') {
            query = query.eq('estado', 'FACTURADO'); // Or check logic if 'FACTURADO' means factura not null
        }
    }

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to).order('fecha', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
        console.error('Error getValoracionesData', JSON.stringify(error, null, 2));
        return { data: [], total: 0, page, limit };
    }

    // Map to View Model (ValoracionItem)
    const formattedData: ValoracionItem[] = data.map((r: any) => {
        return {
            id: r.id,
            id_reporte: r.informe,
            fecha_reporte: r.fecha,
            dia_semana: r.dia,
            cliente_nombre: r.cliente,
            lugar: r.lugar,
            descripcion: r.descripcion,
            maquinaria: r.maquinaria,
            cotizacion_numero: r.cotizacion,
            horas_recorrido: Number(r.hrs_recc || 0),
            jornada: r.jornada,
            horas_trabajo: Number(r.hrs_trab || 0),
            horas_minima: Number(r.hrs_min || 0),
            cantidad_facturar: Number(r.cant_fact || 0),
            moneda: r.moneda,
            precio_venta: Number(r.precio_unit || 0),
            total_venta: Number(r.total || 0),
            valoracion_codigo: r.valoracion || '',
            factura_codigo: r.factura || '',
            proveedor: 'N/A', // View doesn't have provider yet, maybe not needed for Sales Valuation
            estado: r.estado,
            pdf_reporte: r.reporte_id ? `/api/reportes-maquinaria/${r.reporte_id}/pdf` : undefined,
            pdf_cotizacion: r.pdf_cotizacion_url || (r.cotizacion_id ? `/cotizaciones/${r.cotizacion_id}` : undefined),
            pdf_valoracion: r.pdf_valoracion_url || undefined,
            pdf_factura: r.pdf_factura_url || undefined,
        };
    });

    return {
        data: formattedData,
        total: count || 0,
        page,
        limit
    };
}

// ==========================================
// VALORIZAR — Fase F.1
// ==========================================

export interface ValorizacionPreviewItem {
    reporte_id: string
    informe: string | null
    fecha: string | null
    cliente_id: string | null
    cliente: string | null
    maquinaria: string | null
    cant_fact: number
    precio_unit: number
    total: number
    moneda: string | null
    cotizacion: string | null
    descripcion: string | null
}

export interface ValorizacionPreview {
    items: ValorizacionPreviewItem[]
    cliente_id: string | null
    cliente_nombre: string | null
    moneda: string
    subtotal: number
    igv_pct: number
    igv_monto: number
    detraccion_pct: number
    detraccion_monto: number
    total_facturar: number
    warnings: string[]
    codigo_next_preview: string
}

/**
 * Preview de la valorización sin persistir. Toma IDs de reportes pendientes y
 * devuelve los totales calculados (subtotal/IGV/detracción) leyendo los
 * defaults de `config_valorizacion_venta` del tenant. Usado por el dialog
 * "Valorizar Venta" para mostrar al usuario qué se va a crear antes de
 * confirmar.
 *
 * Valida:
 *  - Todos los reportes son del mismo cliente y misma moneda (si no, warnings).
 *  - Ningún reporte ya fue valorizado (estado_venta !== 'PENDIENTE').
 */
export async function getValorizacionPreview(reporteIds: string[]): Promise<ValorizacionPreview> {
    const { adminClient, tenantId } = await getTenantContext()
    const empty: ValorizacionPreview = {
        items: [], cliente_id: null, cliente_nombre: null, moneda: 'USD',
        subtotal: 0, igv_pct: 18, igv_monto: 0, detraccion_pct: 10,
        detraccion_monto: 0, total_facturar: 0, warnings: [],
        codigo_next_preview: '',
    }
    if (!adminClient || !tenantId || reporteIds.length === 0) return empty

    // Items desde la vista (ya tiene cliente, precio, horas)
    const { data: rows, error } = await adminClient
        .from('view_valoraciones_ventas')
        .select('*')
        .eq('tenant_id', tenantId)
        .in('id', reporteIds)

    if (error || !rows) {
        console.error('[getValorizacionPreview] error:', error)
        return empty
    }

    const warnings: string[] = []
    const items: ValorizacionPreviewItem[] = rows.map((r: Record<string, unknown>) => ({
        reporte_id: (r.id as string),
        informe: (r.informe as string | null) ?? null,
        fecha: (r.fecha as string | null) ?? null,
        cliente_id: (r.cliente_id as string | null) ?? null,
        cliente: (r.cliente as string | null) ?? null,
        maquinaria: (r.maquinaria as string | null) ?? null,
        cant_fact: Number(r.cant_fact ?? 0),
        precio_unit: Number(r.precio_unit ?? 0),
        total: Number(r.total ?? 0),
        moneda: (r.moneda as string | null) ?? 'USD',
        cotizacion: (r.cotizacion as string | null) ?? null,
        descripcion: (r.descripcion as string | null) ?? null,
    }))

    if (items.length !== reporteIds.length) {
        warnings.push(`Algunos reportes no se encontraron o no pertenecen al tenant`)
    }

    const estadosUnicos = new Set(rows.map((r: Record<string, unknown>) => r.estado))
    if (estadosUnicos.has('VALORADO') || estadosUnicos.has('FACTURADO')) {
        warnings.push('Algunos reportes ya fueron valorizados. Solo PENDIENTE puede valorizarse.')
    }

    const clienteIds = new Set(items.map((i) => i.cliente_id).filter(Boolean))
    if (clienteIds.size > 1) {
        warnings.push(`Los reportes pertenecen a ${clienteIds.size} clientes distintos. Valorizá uno por vez.`)
    }
    const monedas = new Set(items.map((i) => i.moneda))
    if (monedas.size > 1) {
        warnings.push(`Los reportes tienen monedas distintas (${Array.from(monedas).join(', ')}).`)
    }

    // Config por tenant para IGV/detracción defaults
    const { data: cfg } = await adminClient
        .from('config_valorizacion_venta')
        .select('igv_default, detraccion_default')
        .eq('tenant_id', tenantId)
        .maybeSingle()

    const igvPct = Number(cfg?.igv_default ?? 18)
    const detrPct = Number(cfg?.detraccion_default ?? 10)
    const subtotal = items.reduce((s, it) => s + it.total, 0)
    const igvMonto = subtotal * (igvPct / 100)
    const detrMonto = subtotal * (detrPct / 100)
    const total = subtotal + igvMonto

    const codigoNextPreview = await peekNextCodigoValorizacion(adminClient, tenantId)

    return {
        items,
        cliente_id: items[0]?.cliente_id ?? null,
        cliente_nombre: items[0]?.cliente ?? null,
        moneda: items[0]?.moneda ?? 'USD',
        subtotal,
        igv_pct: igvPct,
        igv_monto: igvMonto,
        detraccion_pct: detrPct,
        detraccion_monto: detrMonto,
        total_facturar: total,
        warnings,
        codigo_next_preview: codigoNextPreview,
    }
}

/**
 * Peek del siguiente código de valorización `YYYY-NNNNN` sin reservarlo. No
 * hay locking — entre preview y `valorizarReportes` otra valorización podría
 * consumirlo; no pasa nada, el insert final recalcula.
 */
async function peekNextCodigoValorizacion(
    adminClient: NonNullable<Awaited<ReturnType<typeof getTenantContext>>['adminClient']>,
    tenantId: string,
): Promise<string> {
    const year = new Date().getFullYear()
    const { data } = await adminClient
        .from('valorizaciones')
        .select('codigo')
        .eq('tenant_id', tenantId)
        .like('codigo', `${year}-%`)
        .order('codigo', { ascending: false })
        .limit(1)
    let next = 1
    if (data && data.length > 0 && data[0].codigo) {
        const m = data[0].codigo.match(/^(\d{4})-(\d+)/)
        if (m) next = Number(m[2]) + 1
    }
    return `${year}-${String(next).padStart(5, '0')}`
}

export async function valorizarReportes(
    reporteIds: string[],
    fechaValorizacion: string,
): Promise<{ success: boolean; message: string; codigo?: string }> {
    const { adminClient, tenantId, user } = await getTenantContext()
    if (!adminClient || !tenantId || !user) {
        return { success: false, message: 'No autorizado' }
    }
    if (reporteIds.length === 0) {
        return { success: false, message: 'Seleccioná al menos un reporte' }
    }

    const preview = await getValorizacionPreview(reporteIds)
    if (preview.warnings.length > 0) {
        return { success: false, message: preview.warnings[0] }
    }
    if (preview.items.length !== reporteIds.length) {
        return { success: false, message: 'Algunos reportes no se encontraron' }
    }

    const codigo = await peekNextCodigoValorizacion(adminClient, tenantId)

    // Insert una fila por reporte, todas con el mismo `codigo` — el código
    // actúa como header lógico. El subtotal es precio_unit * cant_fact.
    const rows = preview.items.map((it) => ({
        tenant_id: tenantId,
        codigo,
        fecha: fechaValorizacion,
        reporte_maquinaria_id: it.reporte_id,
        cantidad_a_facturar: it.cant_fact,
        precio_unitario: it.precio_unit,
        subtotal: it.total,
        servicio: it.descripcion ?? null,
        moneda: it.moneda ?? 'USD',
        estado: 'VALORADO',
        created_by: user.id,
    }))

    const { error: insErr } = await adminClient.from('valorizaciones').insert(rows)
    if (insErr) {
        console.error('[valorizarReportes] insert error:', insErr)
        return { success: false, message: `Error al guardar: ${insErr.message}` }
    }

    // Mark reports as VALORADO with the code. RLS ya protege por tenant.
    const { error: updErr } = await adminClient
        .from('reportes_maquinaria')
        .update({ estado_venta: 'VALORADO', valorizacion_venta: codigo })
        .in('id', reporteIds)
        .eq('tenant_id', tenantId)

    if (updErr) {
        console.error('[valorizarReportes] update reportes error:', updErr)
        // Best-effort rollback: si falló marcar reportes, borrar las filas
        await adminClient.from('valorizaciones').delete().eq('codigo', codigo).eq('tenant_id', tenantId)
        return { success: false, message: `Error al marcar reportes: ${updErr.message}` }
    }

    revalidatePath('/ventas/valoraciones')
    revalidatePath('/ventas/panel')
    return { success: true, message: `Valorización ${codigo} creada (${rows.length} reportes)`, codigo }
}

/**
 * Deshacer valorización: borra todas las filas con ese `codigo` y devuelve
 * los reportes a PENDIENTE. Solo admite códigos sin factura asociada.
 */
export async function deshacerValorizacion(codigo: string): Promise<{ success: boolean; message: string }> {
    const { adminClient, tenantId } = await getTenantContext()
    if (!adminClient || !tenantId) return { success: false, message: 'No autorizado' }

    // Buscar reportes de esta valorización — si alguno tiene factura, abortar
    const { data: reportes } = await adminClient
        .from('reportes_maquinaria')
        .select('id, factura_venta_item')
        .eq('tenant_id', tenantId)
        .eq('valorizacion_venta', codigo)

    if (!reportes || reportes.length === 0) {
        return { success: false, message: 'Valorización no encontrada' }
    }
    if (reportes.some((r) => r.factura_venta_item)) {
        return { success: false, message: 'No se puede deshacer: algunos reportes ya están facturados' }
    }

    // Borrar filas de `valorizaciones` con ese código
    const { error: delErr } = await adminClient
        .from('valorizaciones')
        .delete()
        .eq('codigo', codigo)
        .eq('tenant_id', tenantId)

    if (delErr) return { success: false, message: `Error al borrar: ${delErr.message}` }

    // Volver reportes a PENDIENTE
    await adminClient
        .from('reportes_maquinaria')
        .update({ estado_venta: 'PENDIENTE', valorizacion_venta: null })
        .in('id', reportes.map((r) => r.id))
        .eq('tenant_id', tenantId)

    revalidatePath('/ventas/valoraciones')
    revalidatePath('/ventas/panel')
    return { success: true, message: `Valorización ${codigo} deshecha` }
}

// ==========================================
// FACTURAS — Fase F.4 + F.5
// ==========================================

export interface FacturaVentaItem {
    id: string
    codigo_factura: string | null
    codigo_valoracion: string | null
    fecha_factura: string | null
    fecha_vencimiento: string | null
    cliente_id: string | null
    cliente_nombre: string | null
    cliente_ruc: string | null
    subtotal: number | null
    igv_monto: number | null
    igv_porcentaje: number | null
    total_usd: number | null
    monto_a_cobrar_usd: number | null
    monto_a_cobrar_soles: number | null
    monto_pagado_factura: number | null
    pendiente_por_cobrar_usd: number | null
    pendiente_por_cobrar_sol: number | null
    detraccion_porcentaje: number | null
    detraccion_monto_sol: number | null
    detraccion_a_cargo_de: string | null
    detraccion_numero_constancia: string | null
    detraccion_fecha_pago: string | null
    estado: string | null
    estado_pago: string | null
    pdf_factura_url: string | null
    dias_para_pago: number | null
}

export interface FacturasVentaParams {
    page?: number
    limit?: number
    cliente_id?: string
    estado?: string
    fecha_inicio?: string
    fecha_fin?: string
    search?: string
}

/**
 * Listado de facturas de venta emitidas. Enriquece con cliente (razón social +
 * RUC) via join. Filtros opcionales client-side amigables.
 */
export async function getFacturasVentaData(params: FacturasVentaParams = {}) {
    const page = params.page || 1
    const limit = params.limit || 50
    const { adminClient, tenantId } = await getTenantContext()
    if (!adminClient || !tenantId) {
        return { data: [] as FacturaVentaItem[], total: 0, page, limit, kpis: emptyFacturaKpis() }
    }

    let query = adminClient
        .from('facturas_venta')
        .select(`
            *,
            cliente:terceros!facturas_venta_cliente_id_fkey(razon_social, ruc)
        `, { count: 'exact' })
        .eq('tenant_id', tenantId)
        .eq('esta_activa', true)

    if (params.cliente_id) query = query.eq('cliente_id', params.cliente_id)
    if (params.estado && params.estado !== 'ALL') query = query.eq('estado_pago', params.estado)
    if (params.fecha_inicio) query = query.gte('fecha_factura', params.fecha_inicio)
    if (params.fecha_fin) query = query.lte('fecha_factura', params.fecha_fin)
    if (params.search) query = query.ilike('codigo_factura', `%${params.search}%`)

    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to).order('fecha_factura', { ascending: false, nullsFirst: false })

    const { data, error, count } = await query

    if (error) {
        console.error('[getFacturasVentaData] error:', error)
        return { data: [] as FacturaVentaItem[], total: 0, page, limit, kpis: emptyFacturaKpis() }
    }

    type Row = Record<string, unknown> & {
        cliente?: { razon_social?: string | null; ruc?: string | null } | null
    }

    const formatted: FacturaVentaItem[] = (data as unknown as Row[]).map((r) => ({
        id: r.id as string,
        codigo_factura: (r.codigo_factura as string | null) ?? null,
        codigo_valoracion: (r.codigo_valoracion as string | null) ?? null,
        fecha_factura: (r.fecha_factura as string | null) ?? null,
        fecha_vencimiento: (r.fecha_vencimiento as string | null) ?? null,
        cliente_id: (r.cliente_id as string | null) ?? null,
        cliente_nombre: r.cliente?.razon_social ?? null,
        cliente_ruc: r.cliente?.ruc ?? null,
        subtotal: (r.subtotal as number | null) ?? null,
        igv_monto: (r.igv_monto as number | null) ?? null,
        igv_porcentaje: (r.igv_porcentaje as number | null) ?? null,
        total_usd: (r.total_usd as number | null) ?? null,
        monto_a_cobrar_usd: (r.monto_a_cobrar_usd as number | null) ?? null,
        monto_a_cobrar_soles: (r.monto_a_cobrar_soles as number | null) ?? null,
        monto_pagado_factura: (r.monto_pagado_factura as number | null) ?? null,
        pendiente_por_cobrar_usd: (r.pendiente_por_cobrar_usd as number | null) ?? null,
        pendiente_por_cobrar_sol: (r.pendiente_por_cobrar_sol as number | null) ?? null,
        detraccion_porcentaje: (r.detraccion_porcentaje as number | null) ?? null,
        detraccion_monto_sol: (r.detraccion_monto_sol as number | null) ?? null,
        detraccion_a_cargo_de: (r.detraccion_a_cargo_de as string | null) ?? null,
        detraccion_numero_constancia: (r.detraccion_numero_constancia as string | null) ?? null,
        detraccion_fecha_pago: (r.detraccion_fecha_pago as string | null) ?? null,
        estado: (r.estado as string | null) ?? null,
        estado_pago: (r.estado_pago as string | null) ?? null,
        pdf_factura_url: (r.pdf_factura_url as string | null) ?? null,
        dias_para_pago: (r.dias_para_pago as number | null) ?? null,
    }))

    const kpis = formatted.reduce(
        (acc, f) => {
            acc.total_facturado_usd += f.total_usd ?? 0
            acc.total_cobrado_usd += f.monto_pagado_factura ?? 0
            acc.total_pendiente_usd += f.pendiente_por_cobrar_usd ?? 0
            return acc
        },
        { total_facturado_usd: 0, total_cobrado_usd: 0, total_pendiente_usd: 0 },
    )

    return { data: formatted, total: count || 0, page, limit, kpis }
}

function emptyFacturaKpis() {
    return { total_facturado_usd: 0, total_cobrado_usd: 0, total_pendiente_usd: 0 }
}

/**
 * Trae una factura con todos sus campos + cliente. Usada por el dialog de
 * Ver/Editar.
 */
export async function getFacturaVentaById(id: string): Promise<FacturaVentaItem | null> {
    const { adminClient, tenantId } = await getTenantContext()
    if (!adminClient || !tenantId) return null

    const { data, error } = await adminClient
        .from('facturas_venta')
        .select(`*, cliente:terceros!facturas_venta_cliente_id_fkey(razon_social, ruc)`)
        .eq('id', id)
        .eq('tenant_id', tenantId)
        .maybeSingle()

    if (error || !data) {
        if (error) console.error('[getFacturaVentaById] error:', error)
        return null
    }

    type Row = Record<string, unknown> & {
        cliente?: { razon_social?: string | null; ruc?: string | null } | null
    }
    const r = data as unknown as Row

    return {
        id: r.id as string,
        codigo_factura: (r.codigo_factura as string | null) ?? null,
        codigo_valoracion: (r.codigo_valoracion as string | null) ?? null,
        fecha_factura: (r.fecha_factura as string | null) ?? null,
        fecha_vencimiento: (r.fecha_vencimiento as string | null) ?? null,
        cliente_id: (r.cliente_id as string | null) ?? null,
        cliente_nombre: r.cliente?.razon_social ?? null,
        cliente_ruc: r.cliente?.ruc ?? null,
        subtotal: (r.subtotal as number | null) ?? null,
        igv_monto: (r.igv_monto as number | null) ?? null,
        igv_porcentaje: (r.igv_porcentaje as number | null) ?? null,
        total_usd: (r.total_usd as number | null) ?? null,
        monto_a_cobrar_usd: (r.monto_a_cobrar_usd as number | null) ?? null,
        monto_a_cobrar_soles: (r.monto_a_cobrar_soles as number | null) ?? null,
        monto_pagado_factura: (r.monto_pagado_factura as number | null) ?? null,
        pendiente_por_cobrar_usd: (r.pendiente_por_cobrar_usd as number | null) ?? null,
        pendiente_por_cobrar_sol: (r.pendiente_por_cobrar_sol as number | null) ?? null,
        detraccion_porcentaje: (r.detraccion_porcentaje as number | null) ?? null,
        detraccion_monto_sol: (r.detraccion_monto_sol as number | null) ?? null,
        detraccion_a_cargo_de: (r.detraccion_a_cargo_de as string | null) ?? null,
        detraccion_numero_constancia: (r.detraccion_numero_constancia as string | null) ?? null,
        detraccion_fecha_pago: (r.detraccion_fecha_pago as string | null) ?? null,
        estado: (r.estado as string | null) ?? null,
        estado_pago: (r.estado_pago as string | null) ?? null,
        pdf_factura_url: (r.pdf_factura_url as string | null) ?? null,
        dias_para_pago: (r.dias_para_pago as number | null) ?? null,
    }
}

export interface UpdateFacturaVentaPayload {
    codigo_factura?: string | null
    fecha_factura?: string | null
    fecha_vencimiento?: string | null
    dias_para_pago?: number | null
    pdf_factura_url?: string | null
    detraccion_numero_constancia?: string | null
    detraccion_fecha_pago?: string | null
    detraccion_a_cargo_de?: string | null
}

/**
 * Actualiza campos editables de una factura. No recalcula subtotal/IGV
 * (eso requiere re-valorizar). Solo metadata + detracción + PDF.
 */
export async function updateFacturaVenta(id: string, payload: UpdateFacturaVentaPayload) {
    const { adminClient, tenantId } = await getTenantContext()
    if (!adminClient || !tenantId) {
        return { success: false as const, message: 'No autorizado' }
    }

    const clean = Object.fromEntries(
        Object.entries(payload).filter(([, v]) => v !== undefined),
    )
    clean.updated_at = new Date().toISOString()

    const { error } = await adminClient
        .from('facturas_venta')
        .update(clean)
        .eq('id', id)
        .eq('tenant_id', tenantId)

    if (error) {
        console.error('[updateFacturaVenta] error:', error)
        return { success: false as const, message: error.message }
    }

    revalidatePath('/ventas/facturas')
    return { success: true as const, message: 'Factura actualizada' }
}

// ==========================================
// COBROS, DETRACCIÓN, DESHACER FACTURA — Fase F.6 + F.7 + F.8
// ==========================================

export interface BancoItem {
    id: string
    nombre: string
    numero_cuenta: string | null
    moneda: string | null
}

export async function getBancosActivos(): Promise<BancoItem[]> {
    const { adminClient, tenantId } = await getTenantContext()
    if (!adminClient || !tenantId) return []
    const { data, error } = await adminClient
        .from('bancos')
        .select('id, nombre, numero_cuenta, moneda')
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .order('nombre')
    if (error) {
        console.error('[getBancosActivos] error:', error)
        return []
    }
    return data ?? []
}

export interface CobroVentaItem {
    id: string
    factura_venta_id: string
    tipo: string
    monto: number
    moneda: string
    fecha_cobro: string
    comentarios: string | null
    banco_id: string | null
    banco_nombre: string | null
    created_at: string
}

export async function getCobrosByFactura(facturaId: string): Promise<CobroVentaItem[]> {
    const { adminClient, tenantId } = await getTenantContext()
    if (!adminClient || !tenantId) return []

    const { data, error } = await adminClient
        .from('cobros_venta')
        .select(`*, banco:bancos!cobros_venta_banco_id_fkey(nombre)`)
        .eq('factura_venta_id', facturaId)
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .order('fecha_cobro', { ascending: false })

    if (error) {
        console.error('[getCobrosByFactura] error:', error)
        return []
    }

    type Row = Record<string, unknown> & { banco?: { nombre?: string | null } | null }
    return (data as unknown as Row[]).map((r) => ({
        id: r.id as string,
        factura_venta_id: r.factura_venta_id as string,
        tipo: (r.tipo as string) ?? '',
        monto: Number(r.monto ?? 0),
        moneda: (r.moneda as string) ?? 'USD',
        fecha_cobro: (r.fecha_cobro as string) ?? '',
        comentarios: (r.comentarios as string | null) ?? null,
        banco_id: (r.banco_id as string | null) ?? null,
        banco_nombre: r.banco?.nombre ?? null,
        created_at: (r.created_at as string) ?? '',
    }))
}

export interface CreateCobroPayload {
    factura_venta_id: string
    tipo: string // EFECTIVO | TRANSFERENCIA | CHEQUE
    monto: number
    moneda: 'USD' | 'PEN'
    fecha_cobro: string
    banco_id?: string | null
    comentarios?: string | null
}

/**
 * Registra un cobro parcial o total sobre una factura. Tras insertar,
 * recalcula `monto_pagado_factura` y `pendiente_por_cobrar_*` en la factura.
 */
export async function registrarCobroVenta(payload: CreateCobroPayload) {
    const { adminClient, tenantId, user } = await getTenantContext()
    if (!adminClient || !tenantId || !user) {
        return { success: false as const, message: 'No autorizado' }
    }
    if (payload.monto <= 0) {
        return { success: false as const, message: 'El monto debe ser mayor a 0' }
    }

    const { error: insErr } = await adminClient.from('cobros_venta').insert({
        tenant_id: tenantId,
        factura_venta_id: payload.factura_venta_id,
        tipo: payload.tipo,
        monto: payload.monto,
        moneda: payload.moneda,
        fecha_cobro: payload.fecha_cobro,
        banco_id: payload.banco_id ?? null,
        comentarios: payload.comentarios ?? null,
        created_by: user.id,
        is_active: true,
    })

    if (insErr) {
        console.error('[registrarCobroVenta] insert error:', insErr)
        return { success: false as const, message: insErr.message }
    }

    await recalcularCobrosFactura(payload.factura_venta_id)
    revalidatePath('/ventas/facturas')
    return { success: true as const, message: 'Cobro registrado' }
}

export async function deshacerCobroVenta(cobroId: string) {
    const { adminClient, tenantId } = await getTenantContext()
    if (!adminClient || !tenantId) {
        return { success: false as const, message: 'No autorizado' }
    }
    // Soft-delete: dejamos rastro (papelera).
    const { data: cobro, error: fetchErr } = await adminClient
        .from('cobros_venta')
        .select('factura_venta_id')
        .eq('id', cobroId)
        .eq('tenant_id', tenantId)
        .maybeSingle()
    if (fetchErr || !cobro) return { success: false as const, message: 'Cobro no encontrado' }

    const { error } = await adminClient
        .from('cobros_venta')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', cobroId)
        .eq('tenant_id', tenantId)

    if (error) return { success: false as const, message: error.message }

    await recalcularCobrosFactura(cobro.factura_venta_id)
    revalidatePath('/ventas/facturas')
    return { success: true as const, message: 'Cobro anulado' }
}

/**
 * Recalcula los campos derivados de la factura a partir de sus cobros activos.
 * Se llama tras insert/soft-delete de cobro o tras registrar detracción.
 */
async function recalcularCobrosFactura(facturaId: string) {
    const { adminClient, tenantId } = await getTenantContext()
    if (!adminClient || !tenantId) return

    const { data: cobros } = await adminClient
        .from('cobros_venta')
        .select('monto, moneda')
        .eq('factura_venta_id', facturaId)
        .eq('tenant_id', tenantId)
        .eq('is_active', true)

    const totalUSD = (cobros ?? []).filter((c) => c.moneda === 'USD').reduce((s, c) => s + Number(c.monto ?? 0), 0)
    const totalPEN = (cobros ?? []).filter((c) => c.moneda === 'PEN').reduce((s, c) => s + Number(c.monto ?? 0), 0)

    const { data: factura } = await adminClient
        .from('facturas_venta')
        .select('total_usd, monto_a_cobrar_usd, monto_a_cobrar_soles')
        .eq('id', facturaId)
        .eq('tenant_id', tenantId)
        .maybeSingle()
    if (!factura) return

    const totalPagado = totalUSD // primaria en USD
    const aCobrarUSD = Number(factura.monto_a_cobrar_usd ?? factura.total_usd ?? 0)
    const aCobrarPEN = Number(factura.monto_a_cobrar_soles ?? 0)
    const pendUSD = Math.max(0, aCobrarUSD - totalUSD)
    const pendPEN = Math.max(0, aCobrarPEN - totalPEN)

    const estadoPago =
        totalPagado <= 0 ? 'PENDIENTE' :
        totalPagado + 0.01 < aCobrarUSD ? 'PARCIAL' :
        'PAGADA'

    await adminClient
        .from('facturas_venta')
        .update({
            monto_pagado_factura: totalPagado,
            pendiente_por_cobrar_usd: pendUSD,
            pendiente_por_cobrar_sol: pendPEN,
            estado_pago: estadoPago,
            updated_at: new Date().toISOString(),
        })
        .eq('id', facturaId)
        .eq('tenant_id', tenantId)
}

// --- F.7: Registro de Detracción ---

export interface DetraccionPayload {
    factura_venta_id: string
    porcentaje: number
    monto_sol: number
    a_cargo_de: 'CLIENTE' | 'EMPRESA'
    numero_constancia: string
    fecha_pago: string
}

export async function registrarDetraccion(payload: DetraccionPayload) {
    const { adminClient, tenantId } = await getTenantContext()
    if (!adminClient || !tenantId) {
        return { success: false as const, message: 'No autorizado' }
    }

    const { error } = await adminClient
        .from('facturas_venta')
        .update({
            detraccion_porcentaje: payload.porcentaje,
            detraccion_monto_sol: payload.monto_sol,
            detraccion_a_cargo_de: payload.a_cargo_de,
            detraccion_numero_constancia: payload.numero_constancia,
            detraccion_fecha_pago: payload.fecha_pago,
            updated_at: new Date().toISOString(),
        })
        .eq('id', payload.factura_venta_id)
        .eq('tenant_id', tenantId)

    if (error) return { success: false as const, message: error.message }
    revalidatePath('/ventas/facturas')
    return { success: true as const, message: 'Detracción registrada' }
}

// --- F.8: Deshacer Factura (cascade) ---

/**
 * Deshace una factura: soft-delete en facturas_venta, libera el código de
 * valorización asociado (reportes vuelven a estado VALORADO, queda la
 * valorización disponible para refacturar), y soft-deletea cobros.
 *
 * Si la valorización asociada tiene algún reporte que también está en OTRA
 * factura, no se toca (caso improbable pero protección).
 */
export async function deshacerFacturaVenta(facturaId: string) {
    const { adminClient, tenantId } = await getTenantContext()
    if (!adminClient || !tenantId) {
        return { success: false as const, message: 'No autorizado' }
    }

    const { data: factura } = await adminClient
        .from('facturas_venta')
        .select('id, codigo_factura, codigo_valoracion')
        .eq('id', facturaId)
        .eq('tenant_id', tenantId)
        .maybeSingle()

    if (!factura) return { success: false as const, message: 'Factura no encontrada' }

    // Soft-delete factura
    const { error: updErr } = await adminClient
        .from('facturas_venta')
        .update({ esta_activa: false, estado: 'DESHABILITADA', updated_at: new Date().toISOString() })
        .eq('id', facturaId)
        .eq('tenant_id', tenantId)
    if (updErr) return { success: false as const, message: updErr.message }

    // Soft-delete cobros asociados
    await adminClient
        .from('cobros_venta')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('factura_venta_id', facturaId)
        .eq('tenant_id', tenantId)

    // Los reportes vinculados a la valorización vuelven a VALORADO (refacturable)
    if (factura.codigo_valoracion) {
        await adminClient
            .from('reportes_maquinaria')
            .update({ estado_venta: 'VALORADO', factura_venta_item: null })
            .eq('factura_venta_item', factura.codigo_factura)
            .eq('tenant_id', tenantId)
    }

    revalidatePath('/ventas/facturas')
    revalidatePath('/ventas/valoraciones')
    return { success: true as const, message: `Factura ${factura.codigo_factura ?? ''} deshecha` }
}

// ==========================================
// CREAR FACTURA VENTA — Fase F.4
// ==========================================

export interface CreateFacturaVentaPayload {
    codigo_valoracion: string
    codigo_factura: string
    cliente_id: string
    fecha_factura: string
    fecha_vencimiento?: string | null
    dias_para_pago?: number | null
    moneda: 'USD' | 'PEN'
    subtotal: number
    igv_porcentaje: number
    igv_monto: number
    total: number
    tasa_cambio_id?: string | null
    detraccion_porcentaje?: number | null
    detraccion_monto_sol?: number | null
    pdf_factura_url?: string | null
}

/**
 * Crea una factura de venta a partir de una valorización.
 * Inserta en `facturas_venta` y marca los reportes como FACTURADO.
 * Rollback manual si el update de reportes falla.
 */
export async function createFacturaVenta(payload: CreateFacturaVentaPayload) {
    const { adminClient, tenantId, user } = await getTenantContext()
    if (!adminClient || !tenantId || !user) {
        return { success: false as const, message: 'No autorizado' }
    }

    // Traer reportes de la valorización
    const { data: reportes } = await adminClient
        .from('reportes_maquinaria')
        .select('id')
        .eq('tenant_id', tenantId)
        .eq('valorizacion_venta', payload.codigo_valoracion)

    if (!reportes || reportes.length === 0) {
        return { success: false as const, message: 'Valorización no encontrada o sin reportes' }
    }

    const totalUSD = payload.moneda === 'USD' ? payload.total : null
    const totalSOL = payload.moneda === 'PEN' ? payload.total : null

    const { data: factura, error: insErr } = await adminClient
        .from('facturas_venta')
        .insert({
            bubble_id: randomUUID(),
            tenant_id: tenantId,
            codigo_factura: payload.codigo_factura,
            codigo_valoracion: payload.codigo_valoracion,
            cliente_id: payload.cliente_id,
            fecha_factura: payload.fecha_factura,
            fecha_vencimiento: payload.fecha_vencimiento ?? null,
            dias_para_pago: payload.dias_para_pago ?? null,
            subtotal: payload.subtotal,
            igv_porcentaje: payload.igv_porcentaje,
            igv_monto: payload.igv_monto,
            total_usd: totalUSD,
            monto_a_cobrar_usd: totalUSD,
            monto_a_cobrar_soles: totalSOL,
            pendiente_por_cobrar_usd: totalUSD,
            pendiente_por_cobrar_sol: totalSOL,
            monto_pagado_factura: 0,
            tasa_cambio_id: payload.tasa_cambio_id ?? null,
            detraccion_porcentaje: payload.detraccion_porcentaje ?? null,
            detraccion_monto_sol: payload.detraccion_monto_sol ?? null,
            pdf_factura_url: payload.pdf_factura_url ?? null,
            estado: 'ACTIVA',
            estado_pago: 'PENDIENTE',
            esta_activa: true,
            fecha_valorado: new Date().toISOString(),
            created_by: user.id,
        })
        .select('id, codigo_factura')
        .single()

    if (insErr || !factura) {
        console.error('[createFacturaVenta]', insErr)
        return { success: false as const, message: insErr?.message || 'Error al crear factura' }
    }

    // Marcar reportes como FACTURADO y vincular código factura
    const { error: updErr } = await adminClient
        .from('reportes_maquinaria')
        .update({ estado_venta: 'FACTURADO', factura_venta_item: payload.codigo_factura })
        .in('id', reportes.map((r) => r.id))
        .eq('tenant_id', tenantId)

    if (updErr) {
        console.error('[createFacturaVenta] update reportes', updErr)
        // Rollback: borrar la factura recién creada
        await adminClient.from('facturas_venta').delete().eq('id', factura.id).eq('tenant_id', tenantId)
        return { success: false as const, message: `Error marcando reportes: ${updErr.message}` }
    }

    revalidatePath('/ventas/facturas')
    revalidatePath('/ventas/valoraciones')
    return { success: true as const, message: `Factura ${payload.codigo_factura} registrada`, id: factura.id }
}

// ==========================================
// ACCIONES INDIVIDUALES POR INFORME — Fase F.9
// ==========================================

/**
 * Soft-delete de un reporte de maquinaria. Solo se permite si el reporte
 * NO está en una valorización ni factura activa — eso evitaría romper
 * la consistencia cross-module. Si hay dependencias, devuelve error
 * con contexto para que el UI explique por qué.
 */
export async function deshabilitarReporteMaquinaria(reporteId: string) {
    const { adminClient, tenantId } = await getTenantContext()
    if (!adminClient || !tenantId) {
        return { success: false as const, message: 'No autorizado' }
    }

    const { data: reporte } = await adminClient
        .from('reportes_maquinaria')
        .select('id, estado_venta, valorizacion_venta, factura_venta_item')
        .eq('id', reporteId)
        .eq('tenant_id', tenantId)
        .maybeSingle()

    if (!reporte) return { success: false as const, message: 'Reporte no encontrado' }
    if (reporte.factura_venta_item) {
        return { success: false as const, message: `Reporte ya facturado (${reporte.factura_venta_item}). Deshacé la factura primero.` }
    }
    if (reporte.valorizacion_venta) {
        return { success: false as const, message: `Reporte está valorizado (${reporte.valorizacion_venta}). Deshacé la valorización primero.` }
    }

    const { error } = await adminClient
        .from('reportes_maquinaria')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', reporteId)
        .eq('tenant_id', tenantId)

    if (error) return { success: false as const, message: error.message }

    revalidatePath('/ventas/valoraciones')
    return { success: true as const, message: 'Reporte deshabilitado' }
}

// End of file
