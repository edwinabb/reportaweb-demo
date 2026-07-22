'use server';

import { revalidatePath } from 'next/cache';
import { getTenantContext } from '@/lib/utils/tenant-context';
import { randomUUID } from 'crypto';

// ============================================================
// PANEL — KPIs + Pendientes Valorizar + Pendientes Facturar
// ============================================================

export interface PanelComprasParams {
    valuationPage?: number;
    valuationSort?: string;
    invoicingPage?: number;
    invoicingSort?: string;
}

export interface ProveedorGroupMetric {
    proveedor_id: string;
    proveedor_nombre: string;
    cantidad: number;
    oldest_date: string;
    total_value: number;
}

export interface PanelComprasData {
    kpis: {
        total_informes: number;
        total_horas: number;
        total_valoraciones: number;
        total_monto: number;
    };
    valuationList: {
        data: ProveedorGroupMetric[];
        total: number;
        page: number;
        limit: number;
    };
    invoicingList: {
        data: ProveedorGroupMetric[];
        total: number;
        page: number;
        limit: number;
    };
}

function emptyPanelData(valPage: number, invPage: number, limit: number): PanelComprasData {
    return {
        kpis: { total_informes: 0, total_horas: 0, total_valoraciones: 0, total_monto: 0 },
        valuationList: { data: [], total: 0, page: valPage, limit },
        invoicingList: { data: [], total: 0, page: invPage, limit },
    };
}

function proveedorSort(sortKey: string) {
    return (a: ProveedorGroupMetric, b: ProveedorGroupMetric) => {
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

export async function getPanelComprasData(params: PanelComprasParams): Promise<PanelComprasData> {
    const limit = 10;
    const valPage = params.valuationPage || 1;
    const invPage = params.invoicingPage || 1;

    const { adminClient: supabase, tenantId } = await getTenantContext();
    if (!tenantId || !supabase) return emptyPanelData(valPage, invPage, limit);

    const [{ data: pendientes }, { data: valorados }] = await Promise.all([
        supabase
            .from('view_valoraciones_compras')
            .select('proveedor_id, proveedor, fecha, hrs_trab, total')
            .eq('tenant_id', tenantId)
            .eq('estado', 'PENDIENTE'),
        supabase
            .from('view_valoraciones_compras')
            .select('proveedor_id, proveedor, fecha, hrs_trab, total')
            .eq('tenant_id', tenantId)
            .eq('estado', 'VALORADO'),
    ]);

    // Aggregate PENDIENTE by proveedor → valuation list
    const valMap = new Map<string, ProveedorGroupMetric>();
    for (const row of pendientes || []) {
        const key = row.proveedor_id || 'sin-proveedor';
        const ex = valMap.get(key);
        if (ex) {
            ex.cantidad += 1;
            ex.total_value += Number(row.hrs_trab || 0);
            if (row.fecha && row.fecha < ex.oldest_date) ex.oldest_date = row.fecha;
        } else {
            valMap.set(key, { proveedor_id: key, proveedor_nombre: row.proveedor || 'Sin Proveedor', cantidad: 1, oldest_date: row.fecha || '', total_value: Number(row.hrs_trab || 0) });
        }
    }

    // Aggregate VALORADO by proveedor → invoicing list
    const invMap = new Map<string, ProveedorGroupMetric>();
    for (const row of valorados || []) {
        const key = row.proveedor_id || 'sin-proveedor';
        const ex = invMap.get(key);
        if (ex) {
            ex.cantidad += 1;
            ex.total_value += Number(row.total || 0);
            if (row.fecha && row.fecha < ex.oldest_date) ex.oldest_date = row.fecha;
        } else {
            invMap.set(key, { proveedor_id: key, proveedor_nombre: row.proveedor || 'Sin Proveedor', cantidad: 1, oldest_date: row.fecha || '', total_value: Number(row.total || 0) });
        }
    }

    const valArray = Array.from(valMap.values());
    const invArray = Array.from(invMap.values());

    const totalInformes = valArray.reduce((a, c) => a + c.cantidad, 0);
    const totalHoras = valArray.reduce((a, c) => a + c.total_value, 0);
    const totalValoraciones = invArray.reduce((a, c) => a + c.cantidad, 0);
    const totalMonto = invArray.reduce((a, c) => a + c.total_value, 0);

    const sortVal = params.valuationSort || 'value_desc';
    valArray.sort(proveedorSort(sortVal));
    const vPageNum = Number(valPage) || 1;
    const paginatedVal = valArray.slice((vPageNum - 1) * limit, vPageNum * limit);

    const sortInv = params.invoicingSort || 'value_desc';
    invArray.sort(proveedorSort(sortInv));
    const iPageNum = Number(invPage) || 1;
    const paginatedInv = invArray.slice((iPageNum - 1) * limit, iPageNum * limit);

    return {
        kpis: { total_informes: totalInformes, total_horas: totalHoras, total_valoraciones: totalValoraciones, total_monto: totalMonto },
        valuationList: { data: paginatedVal, total: valArray.length, page: vPageNum, limit },
        invoicingList: { data: paginatedInv, total: invArray.length, page: iPageNum, limit },
    };
}

// ============================================================
// VALORACIONES — listado
// ============================================================

export interface ValoracionesComprasParams {
    page?: number;
    limit?: number;
    fecha_inicio?: string;
    fecha_fin?: string;
    proveedor_id?: string;
    estado?: 'PENDIENTE' | 'VALORADO' | 'FACTURADO' | 'ALL';
}

export interface ValoracionCompraItem {
    id: string;
    id_reporte: string;
    fecha_reporte: string;
    dia_semana: string;
    proveedor_id: string | null;
    proveedor_nombre: string;
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
    precio_compra: number;
    total_compra: number;
    valoracion_codigo: string;
    factura_codigo: string;
    estado: 'PENDIENTE' | 'VALORADO' | 'FACTURADO';
    pdf_reporte?: string;
}

export async function getValoracionesComprasData(params: ValoracionesComprasParams) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const { adminClient: supabase, tenantId } = await getTenantContext();
    if (!tenantId || !supabase) return { data: [] as ValoracionCompraItem[], total: 0, page, limit };

    let query = supabase
        .from('view_valoraciones_compras')
        .select('*', { count: 'exact' })
        .eq('tenant_id', tenantId);

    if (params.fecha_inicio) query = query.gte('fecha', params.fecha_inicio);
    if (params.fecha_fin) query = query.lte('fecha', params.fecha_fin);
    if (params.proveedor_id) query = query.eq('proveedor_id', params.proveedor_id);
    if (params.estado && params.estado !== 'ALL') query = query.eq('estado', params.estado);

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to).order('fecha', { ascending: false });

    const { data, error, count } = await query;
    if (error) {
        console.error('[getValoracionesComprasData]', error);
        return { data: [] as ValoracionCompraItem[], total: 0, page, limit };
    }

    const formatted: ValoracionCompraItem[] = (data || []).map((r) => ({
        id: r.id as string,
        id_reporte: r.informe || '',
        fecha_reporte: r.fecha || '',
        dia_semana: r.dia || '',
        proveedor_id: r.proveedor_id || null,
        proveedor_nombre: r.proveedor || 'Sin Proveedor',
        cliente_nombre: r.cliente || '',
        lugar: r.lugar || '',
        descripcion: r.descripcion || '',
        maquinaria: r.maquinaria || '',
        cotizacion_numero: r.cotizacion || '',
        horas_recorrido: Number(r.hrs_recc || 0),
        jornada: r.jornada || '',
        horas_trabajo: Number(r.hrs_trab || 0),
        horas_minima: Number(r.hrs_min || 0),
        cantidad_facturar: Number(r.cant_fact || 0),
        moneda: r.moneda || 'USD',
        precio_compra: Number(r.precio_unit || 0),
        total_compra: Number(r.total || 0),
        valoracion_codigo: r.valoracion || '',
        factura_codigo: r.factura || '',
        estado: (r.estado as ValoracionCompraItem['estado']) || 'PENDIENTE',
        pdf_reporte: r.reporte_id ? `/reportes/${r.reporte_id}/pdf` : undefined,
    }));

    return { data: formatted, total: count || 0, page, limit };
}

// ============================================================
// VALORIZAR — preview + ejecución
// ============================================================

export interface ValorizacionCompraPreviewItem {
    reporte_id: string;
    informe: string | null;
    fecha: string | null;
    proveedor_id: string | null;
    proveedor: string | null;
    maquinaria: string | null;
    cant_fact: number;
    precio_unit: number;
    total: number;
    moneda: string | null;
    cotizacion: string | null;
    descripcion: string | null;
}

export interface ValorizacionCompraPreview {
    items: ValorizacionCompraPreviewItem[];
    proveedor_id: string | null;
    proveedor_nombre: string | null;
    moneda: string;
    subtotal: number;
    igv_pct: number;
    igv_monto: number;
    detraccion_pct: number;
    detraccion_monto: number;
    total_pagar: number;
    warnings: string[];
    codigo_next_preview: string;
}

async function peekNextCodigoValorizacionCompra(
    adminClient: NonNullable<Awaited<ReturnType<typeof getTenantContext>>['adminClient']>,
    tenantId: string,
): Promise<string> {
    const year = new Date().getFullYear();
    const { data } = await adminClient
        .from('valorizaciones')
        .select('codigo')
        .eq('tenant_id', tenantId)
        .like('codigo', `C-${year}-%`)
        .order('codigo', { ascending: false })
        .limit(1);

    let next = 1;
    if (data && data.length > 0 && data[0].codigo) {
        const m = data[0].codigo.match(/^C-(\d{4})-(\d+)/);
        if (m) next = Number(m[2]) + 1;
    }
    return `C-${year}-${String(next).padStart(5, '0')}`;
}

export async function getValorizacionCompraPreview(reporteIds: string[]): Promise<ValorizacionCompraPreview> {
    const { adminClient, tenantId } = await getTenantContext();
    const empty: ValorizacionCompraPreview = {
        items: [], proveedor_id: null, proveedor_nombre: null, moneda: 'USD',
        subtotal: 0, igv_pct: 18, igv_monto: 0, detraccion_pct: 10,
        detraccion_monto: 0, total_pagar: 0, warnings: [], codigo_next_preview: '',
    };
    if (!adminClient || !tenantId || reporteIds.length === 0) return empty;

    const { data: rows, error } = await adminClient
        .from('view_valoraciones_compras')
        .select('*')
        .eq('tenant_id', tenantId)
        .in('id', reporteIds);

    if (error || !rows) {
        console.error('[getValorizacionCompraPreview]', error);
        return empty;
    }

    const warnings: string[] = [];
    const items: ValorizacionCompraPreviewItem[] = rows.map((r) => ({
        reporte_id: (r.id as string),
        informe: r.informe ?? null,
        fecha: r.fecha ?? null,
        proveedor_id: r.proveedor_id ?? null,
        proveedor: r.proveedor ?? null,
        maquinaria: r.maquinaria ?? null,
        cant_fact: Number(r.cant_fact ?? 0),
        precio_unit: Number(r.precio_unit ?? 0),
        total: Number(r.total ?? 0),
        moneda: r.moneda ?? 'USD',
        cotizacion: r.cotizacion ?? null,
        descripcion: r.descripcion ?? null,
    }));

    if (items.length !== reporteIds.length) warnings.push('Algunos reportes no se encontraron o no pertenecen al tenant.');

    const estados = new Set(rows.map((r) => r.estado));
    if (estados.has('VALORADO') || estados.has('FACTURADO')) {
        warnings.push('Algunos reportes ya fueron valorizados. Solo PENDIENTE puede valorizarse.');
    }

    const proveedorIds = new Set(items.map((i) => i.proveedor_id).filter(Boolean));
    if (proveedorIds.size > 1) warnings.push(`Los reportes pertenecen a ${proveedorIds.size} proveedores distintos. Valorizá uno por vez.`);

    const monedas = new Set(items.map((i) => i.moneda));
    if (monedas.size > 1) warnings.push(`Los reportes tienen monedas distintas (${Array.from(monedas).join(', ')}).`);

    const { data: cfg } = await adminClient
        .from('config_valorizacion_compra')
        .select('igv_default, detraccion_default')
        .eq('tenant_id', tenantId)
        .maybeSingle();

    const igvPct = Number(cfg?.igv_default ?? 18);
    const detrPct = Number(cfg?.detraccion_default ?? 10);
    const subtotal = items.reduce((s, it) => s + it.total, 0);
    const igvMonto = subtotal * (igvPct / 100);
    const detrMonto = subtotal * (detrPct / 100);
    const total = subtotal + igvMonto;

    const codigoNext = await peekNextCodigoValorizacionCompra(adminClient, tenantId);

    return {
        items,
        proveedor_id: items[0]?.proveedor_id ?? null,
        proveedor_nombre: items[0]?.proveedor ?? null,
        moneda: items[0]?.moneda ?? 'USD',
        subtotal, igv_pct: igvPct, igv_monto: igvMonto,
        detraccion_pct: detrPct, detraccion_monto: detrMonto,
        total_pagar: total,
        warnings, codigo_next_preview: codigoNext,
    };
}

export async function valorizarReportesCompra(
    reporteIds: string[],
    fechaValorizacion: string,
): Promise<{ success: boolean; message: string; codigo?: string }> {
    const { adminClient, tenantId, user } = await getTenantContext();
    if (!adminClient || !tenantId || !user) return { success: false, message: 'No autorizado' };
    if (reporteIds.length === 0) return { success: false, message: 'Seleccioná al menos un reporte' };

    const preview = await getValorizacionCompraPreview(reporteIds);
    if (preview.warnings.length > 0) return { success: false, message: preview.warnings[0] };
    if (preview.items.length !== reporteIds.length) return { success: false, message: 'Algunos reportes no se encontraron' };

    const codigo = await peekNextCodigoValorizacionCompra(adminClient, tenantId);

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
    }));

    const { error: insErr } = await adminClient.from('valorizaciones').insert(rows);
    if (insErr) {
        console.error('[valorizarReportesCompra] insert error:', insErr);
        return { success: false, message: `Error al guardar: ${insErr.message}` };
    }

    const { error: updErr } = await adminClient
        .from('reportes_maquinaria')
        .update({ estado_compra: 'VALORADO', valorizacion_compra: codigo })
        .in('id', reporteIds)
        .eq('tenant_id', tenantId);

    if (updErr) {
        console.error('[valorizarReportesCompra] update error:', updErr);
        await adminClient.from('valorizaciones').delete().eq('codigo', codigo).eq('tenant_id', tenantId);
        return { success: false, message: `Error al marcar reportes: ${updErr.message}` };
    }

    revalidatePath('/compras/valoraciones');
    revalidatePath('/compras/panel');
    return { success: true, message: `Valorización ${codigo} creada (${rows.length} reportes)`, codigo };
}

export async function deshacerValorizacionCompra(codigo: string): Promise<{ success: boolean; message: string }> {
    const { adminClient, tenantId } = await getTenantContext();
    if (!adminClient || !tenantId) return { success: false, message: 'No autorizado' };

    const { data: reportes } = await adminClient
        .from('reportes_maquinaria')
        .select('id, factura_compra_item')
        .eq('tenant_id', tenantId)
        .eq('valorizacion_compra', codigo);

    if (!reportes || reportes.length === 0) return { success: false, message: 'Valorización no encontrada' };
    if (reportes.some((r) => r.factura_compra_item)) {
        return { success: false, message: 'No se puede deshacer: algunos reportes ya están facturados' };
    }

    const { error: delErr } = await adminClient
        .from('valorizaciones')
        .delete()
        .eq('codigo', codigo)
        .eq('tenant_id', tenantId);
    if (delErr) return { success: false, message: `Error al borrar: ${delErr.message}` };

    await adminClient
        .from('reportes_maquinaria')
        .update({ estado_compra: 'PENDIENTE', valorizacion_compra: null })
        .in('id', reportes.map((r) => r.id))
        .eq('tenant_id', tenantId);

    revalidatePath('/compras/valoraciones');
    revalidatePath('/compras/panel');
    return { success: true, message: `Valorización ${codigo} deshecha` };
}

// ============================================================
// FACTURAS COMPRA — listado + registro (upload PDF del proveedor)
// ============================================================

export interface FacturaCompraItem {
    id: string;
    codigo_factura: string | null;
    codigo_valoracion: string | null;
    fecha_factura: string | null;
    fecha_vencimiento: string | null;
    proveedor_id: string | null;
    proveedor_nombre: string | null;
    proveedor_ruc: string | null;
    subtotal: number | null;
    igv_monto: number | null;
    igv_porcentaje: number | null;
    total_usd: number | null;
    total_sol: number | null;
    monto_a_cobrar_usd: number | null;
    monto_a_cobrar_soles: number | null;
    monto_pagado_usd: number | null;
    monto_pagado_soles: number | null;
    pendiente_por_cobrar_usd: number | null;
    pendiente_por_cobrar_sol: number | null;
    detraccion_porcentaje: number | null;
    detraccion_soles: number | null;
    detraccion_usd: number | null;
    detraccion_paga_por: string | null;
    detraccion_constancia: number | null;
    detraccion_fecha_pago: string | null;
    detraccion_pago_monto_soles: number | null;
    estado: string | null;
    estado_pago: string | null;
    pdf_factura_url: string | null;
    dias_para_pago: number | null;
}

export interface FacturasComprasParams {
    page?: number;
    limit?: number;
    proveedor_id?: string;
    estado?: string;
    fecha_inicio?: string;
    fecha_fin?: string;
    search?: string;
}

function emptyFacturaComprasKpis() {
    return { total_facturado_usd: 0, total_pagado_usd: 0, total_pendiente_usd: 0 };
}

export async function getFacturasComprasData(params: FacturasComprasParams = {}) {
    const page = params.page || 1;
    const limit = params.limit || 50;
    const { adminClient, tenantId } = await getTenantContext();
    if (!adminClient || !tenantId) {
        return { data: [] as FacturaCompraItem[], total: 0, page, limit, kpis: emptyFacturaComprasKpis() };
    }

    let query = adminClient
        .from('facturas_compra')
        .select(`*, proveedor:terceros!facturas_compra_proveedor_id_fkey(razon_social, ruc)`, { count: 'exact' })
        .eq('tenant_id', tenantId)
        .eq('esta_activa', true);

    if (params.proveedor_id) query = query.eq('proveedor_id', params.proveedor_id);
    if (params.estado && params.estado !== 'ALL') query = query.eq('estado_pago', params.estado);
    if (params.fecha_inicio) query = query.gte('fecha_factura', params.fecha_inicio);
    if (params.fecha_fin) query = query.lte('fecha_factura', params.fecha_fin);
    if (params.search) query = query.ilike('codigo_factura', `%${params.search}%`);

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to).order('fecha_factura', { ascending: false, nullsFirst: false });

    const { data, error, count } = await query;
    if (error) {
        console.error('[getFacturasComprasData]', error);
        return { data: [] as FacturaCompraItem[], total: 0, page, limit, kpis: emptyFacturaComprasKpis() };
    }

    type Row = Record<string, unknown> & {
        proveedor?: { razon_social?: string | null; ruc?: string | null } | null;
    };

    const formatted: FacturaCompraItem[] = (data as unknown as Row[]).map((r) => ({
        id: r.id as string,
        codigo_factura: (r.codigo_factura as string | null) ?? null,
        codigo_valoracion: (r.codigo_valoracion as string | null) ?? null,
        fecha_factura: (r.fecha_factura as string | null) ?? null,
        fecha_vencimiento: (r.fecha_vencimiento as string | null) ?? null,
        proveedor_id: (r.proveedor_id as string | null) ?? null,
        proveedor_nombre: r.proveedor?.razon_social ?? null,
        proveedor_ruc: r.proveedor?.ruc ?? null,
        subtotal: (r.subtotal as number | null) ?? null,
        igv_monto: (r.igv_monto as number | null) ?? null,
        igv_porcentaje: (r.igv_porcentaje as number | null) ?? null,
        total_usd: (r.total_usd as number | null) ?? null,
        total_sol: (r.total_sol as number | null) ?? null,
        monto_a_cobrar_usd: (r.monto_a_cobrar_usd as number | null) ?? null,
        monto_a_cobrar_soles: (r.monto_a_cobrar_soles as number | null) ?? null,
        monto_pagado_usd: (r.monto_pagado_usd as number | null) ?? null,
        monto_pagado_soles: (r.monto_pagado_soles as number | null) ?? null,
        pendiente_por_cobrar_usd: (r.pendiente_por_cobrar_usd as number | null) ?? null,
        pendiente_por_cobrar_sol: (r.pendiente_por_cobrar_sol as number | null) ?? null,
        detraccion_porcentaje: (r.detraccion_porcentaje as number | null) ?? null,
        detraccion_soles: (r.detraccion_soles as number | null) ?? null,
        detraccion_usd: (r.detraccion_usd as number | null) ?? null,
        detraccion_paga_por: (r.detraccion_paga_por as string | null) ?? null,
        detraccion_constancia: (r.detraccion_constancia as number | null) ?? null,
        detraccion_fecha_pago: (r.detraccion_fecha_pago as string | null) ?? null,
        detraccion_pago_monto_soles: (r.detraccion_pago_monto_soles as number | null) ?? null,
        estado: (r.estado as string | null) ?? null,
        estado_pago: (r.estado_pago as string | null) ?? null,
        pdf_factura_url: (r.pdf_factura_url as string | null) ?? null,
        dias_para_pago: (r.dias_para_pago as number | null) ?? null,
    }));

    const kpis = formatted.reduce(
        (acc, f) => {
            acc.total_facturado_usd += f.total_usd ?? 0;
            acc.total_pagado_usd += f.monto_pagado_usd ?? 0;
            acc.total_pendiente_usd += f.pendiente_por_cobrar_usd ?? 0;
            return acc;
        },
        emptyFacturaComprasKpis(),
    );

    return { data: formatted, total: count || 0, page, limit, kpis };
}

export async function getFacturaCompraById(id: string): Promise<FacturaCompraItem | null> {
    const { adminClient, tenantId } = await getTenantContext();
    if (!adminClient || !tenantId) return null;

    const { data, error } = await adminClient
        .from('facturas_compra')
        .select(`*, proveedor:terceros!facturas_compra_proveedor_id_fkey(razon_social, ruc)`)
        .eq('id', id)
        .eq('tenant_id', tenantId)
        .maybeSingle();

    if (error || !data) {
        if (error) console.error('[getFacturaCompraById]', error);
        return null;
    }

    type Row = Record<string, unknown> & { proveedor?: { razon_social?: string | null; ruc?: string | null } | null };
    const r = data as unknown as Row;
    return {
        id: r.id as string,
        codigo_factura: (r.codigo_factura as string | null) ?? null,
        codigo_valoracion: (r.codigo_valoracion as string | null) ?? null,
        fecha_factura: (r.fecha_factura as string | null) ?? null,
        fecha_vencimiento: (r.fecha_vencimiento as string | null) ?? null,
        proveedor_id: (r.proveedor_id as string | null) ?? null,
        proveedor_nombre: r.proveedor?.razon_social ?? null,
        proveedor_ruc: r.proveedor?.ruc ?? null,
        subtotal: (r.subtotal as number | null) ?? null,
        igv_monto: (r.igv_monto as number | null) ?? null,
        igv_porcentaje: (r.igv_porcentaje as number | null) ?? null,
        total_usd: (r.total_usd as number | null) ?? null,
        total_sol: (r.total_sol as number | null) ?? null,
        monto_a_cobrar_usd: (r.monto_a_cobrar_usd as number | null) ?? null,
        monto_a_cobrar_soles: (r.monto_a_cobrar_soles as number | null) ?? null,
        monto_pagado_usd: (r.monto_pagado_usd as number | null) ?? null,
        monto_pagado_soles: (r.monto_pagado_soles as number | null) ?? null,
        pendiente_por_cobrar_usd: (r.pendiente_por_cobrar_usd as number | null) ?? null,
        pendiente_por_cobrar_sol: (r.pendiente_por_cobrar_sol as number | null) ?? null,
        detraccion_porcentaje: (r.detraccion_porcentaje as number | null) ?? null,
        detraccion_soles: (r.detraccion_soles as number | null) ?? null,
        detraccion_usd: (r.detraccion_usd as number | null) ?? null,
        detraccion_paga_por: (r.detraccion_paga_por as string | null) ?? null,
        detraccion_constancia: (r.detraccion_constancia as number | null) ?? null,
        detraccion_fecha_pago: (r.detraccion_fecha_pago as string | null) ?? null,
        detraccion_pago_monto_soles: (r.detraccion_pago_monto_soles as number | null) ?? null,
        estado: (r.estado as string | null) ?? null,
        estado_pago: (r.estado_pago as string | null) ?? null,
        pdf_factura_url: (r.pdf_factura_url as string | null) ?? null,
        dias_para_pago: (r.dias_para_pago as number | null) ?? null,
    };
}

export interface CreateFacturaCompraPayload {
    codigo_valoracion: string;
    codigo_factura: string;
    proveedor_id: string;
    fecha_factura: string;
    fecha_vencimiento?: string | null;
    dias_para_pago?: number | null;
    moneda: 'USD' | 'PEN';
    subtotal: number;
    igv_porcentaje: number;
    igv_monto: number;
    total: number;
    tasa_cambio_id?: string | null;
    detraccion_porcentaje?: number | null;
    detraccion_soles?: number | null;
    detraccion_usd?: number | null;
    pdf_factura_url: string; // obligatorio en compras: PDF recibido del proveedor
}

/**
 * Crea una factura de compra a partir de una valorización.
 * Workaround: `facturas_compra.bubble_id` es NOT NULL legacy — generamos un UUID.
 */
export async function createFacturaCompra(payload: CreateFacturaCompraPayload) {
    const { adminClient, tenantId, user } = await getTenantContext();
    if (!adminClient || !tenantId || !user) return { success: false as const, message: 'No autorizado' };

    if (!payload.pdf_factura_url) {
        return { success: false as const, message: 'El PDF de la factura del proveedor es obligatorio' };
    }

    // Traer reportes de la valorización
    const { data: reportes } = await adminClient
        .from('reportes_maquinaria')
        .select('id')
        .eq('tenant_id', tenantId)
        .eq('valorizacion_compra', payload.codigo_valoracion);

    if (!reportes || reportes.length === 0) {
        return { success: false as const, message: 'Valorización no encontrada o sin reportes' };
    }

    const totalUSD = payload.moneda === 'USD' ? payload.total : null;
    const totalSOL = payload.moneda === 'PEN' ? payload.total : null;

    const { data: factura, error: insErr } = await adminClient
        .from('facturas_compra')
        .insert({
            bubble_id: randomUUID(),
            tenant_id: tenantId,
            codigo_factura: payload.codigo_factura,
            codigo_valoracion: payload.codigo_valoracion,
            proveedor_id: payload.proveedor_id,
            fecha_factura: payload.fecha_factura,
            fecha_vencimiento: payload.fecha_vencimiento ?? null,
            dias_para_pago: payload.dias_para_pago ?? null,
            subtotal: payload.subtotal,
            igv_porcentaje: payload.igv_porcentaje,
            igv_monto: payload.igv_monto,
            total_usd: totalUSD,
            total_sol: totalSOL,
            monto_a_cobrar_usd: totalUSD,
            monto_a_cobrar_soles: totalSOL,
            pendiente_por_cobrar_usd: totalUSD,
            pendiente_por_cobrar_sol: totalSOL,
            monto_pagado_usd: 0,
            monto_pagado_soles: 0,
            moneda_id: null,
            tasa_cambio_id: payload.tasa_cambio_id ?? null,
            detraccion_porcentaje: payload.detraccion_porcentaje ?? null,
            detraccion_soles: payload.detraccion_soles ?? null,
            detraccion_usd: payload.detraccion_usd ?? null,
            pdf_factura_url: payload.pdf_factura_url,
            estado: 'ACTIVA',
            estado_pago: 'PENDIENTE',
            esta_activa: true,
            fecha_valorado: new Date().toISOString(),
            created_by: user.id,
        })
        .select('id, codigo_factura')
        .single();

    if (insErr || !factura) {
        console.error('[createFacturaCompra]', insErr);
        return { success: false as const, message: insErr?.message || 'Error al crear factura' };
    }

    // Marcar reportes como FACTURADO y vincular código factura
    const { error: updErr } = await adminClient
        .from('reportes_maquinaria')
        .update({ estado_compra: 'FACTURADO', factura_compra_item: payload.codigo_factura })
        .in('id', reportes.map((r) => r.id))
        .eq('tenant_id', tenantId);

    if (updErr) {
        console.error('[createFacturaCompra] update reportes', updErr);
        await adminClient.from('facturas_compra').delete().eq('id', factura.id).eq('tenant_id', tenantId);
        return { success: false as const, message: `Error marcando reportes: ${updErr.message}` };
    }

    revalidatePath('/compras/facturas');
    revalidatePath('/compras/valoraciones');
    return { success: true as const, message: `Factura ${payload.codigo_factura} registrada`, id: factura.id };
}

export interface UpdateFacturaCompraPayload {
    codigo_factura?: string | null;
    fecha_factura?: string | null;
    fecha_vencimiento?: string | null;
    dias_para_pago?: number | null;
    pdf_factura_url?: string | null;
    detraccion_porcentaje?: number | null;
    detraccion_soles?: number | null;
    detraccion_usd?: number | null;
    detraccion_paga_por?: string | null;
    detraccion_constancia?: number | null;
    detraccion_fecha_pago?: string | null;
    detraccion_pago_monto_soles?: number | null;
}

export async function updateFacturaCompra(id: string, payload: UpdateFacturaCompraPayload) {
    const { adminClient, tenantId } = await getTenantContext();
    if (!adminClient || !tenantId) return { success: false as const, message: 'No autorizado' };

    const clean = Object.fromEntries(Object.entries(payload).filter(([, v]) => v !== undefined));
    clean.updated_at = new Date().toISOString();

    const { error } = await adminClient
        .from('facturas_compra')
        .update(clean)
        .eq('id', id)
        .eq('tenant_id', tenantId);

    if (error) return { success: false as const, message: error.message };
    revalidatePath('/compras/facturas');
    return { success: true as const, message: 'Factura actualizada' };
}

export async function deshacerFacturaCompra(facturaId: string) {
    const { adminClient, tenantId } = await getTenantContext();
    if (!adminClient || !tenantId) return { success: false as const, message: 'No autorizado' };

    const { data: factura } = await adminClient
        .from('facturas_compra')
        .select('id, codigo_factura, codigo_valoracion')
        .eq('id', facturaId)
        .eq('tenant_id', tenantId)
        .maybeSingle();

    if (!factura) return { success: false as const, message: 'Factura no encontrada' };

    // Soft-delete factura
    const { error: updErr } = await adminClient
        .from('facturas_compra')
        .update({ esta_activa: false, estado: 'DESHABILITADA', updated_at: new Date().toISOString() })
        .eq('id', facturaId)
        .eq('tenant_id', tenantId);
    if (updErr) return { success: false as const, message: updErr.message };

    // Hard-delete pagos (no tenemos is_active en facturas_compra_pagos)
    await adminClient
        .from('facturas_compra_pagos')
        .delete()
        .eq('factura_compra_id', facturaId)
        .eq('tenant_id', tenantId);

    // Reportes vuelven a VALORADO
    if (factura.codigo_factura) {
        await adminClient
            .from('reportes_maquinaria')
            .update({ estado_compra: 'VALORADO', factura_compra_item: null })
            .eq('factura_compra_item', factura.codigo_factura)
            .eq('tenant_id', tenantId);
    }

    revalidatePath('/compras/facturas');
    revalidatePath('/compras/valoraciones');
    return { success: true as const, message: `Factura ${factura.codigo_factura ?? ''} deshecha` };
}

// ============================================================
// PAGOS AL PROVEEDOR — facturas_compra_pagos
// ============================================================

export interface PagoCompraItem {
    id: string;
    factura_compra_id: string;
    tipo_pago: string;
    monto_usd: number;
    monto_sol: number;
    moneda: string;
    fecha_pago: string;
    comentarios: string | null;
    banco: string | null;
    created_at: string;
}

export async function getPagosByFacturaCompra(facturaId: string): Promise<PagoCompraItem[]> {
    const { adminClient, tenantId } = await getTenantContext();
    if (!adminClient || !tenantId) return [];

    const { data, error } = await adminClient
        .from('facturas_compra_pagos')
        .select('*')
        .eq('factura_compra_id', facturaId)
        .eq('tenant_id', tenantId)
        .order('fecha_cobro', { ascending: false });

    if (error) {
        console.error('[getPagosByFacturaCompra]', error);
        return [];
    }

    return (data || []).map((r) => ({
        id: r.id as string,
        factura_compra_id: (r.factura_compra_id as string) || '',
        tipo_pago: (r.tipo_pago as string) || '',
        monto_usd: Number(r.monto_usd ?? 0),
        monto_sol: Number(r.monto_sol ?? 0),
        moneda: (r.moneda as string) ?? 'USD',
        fecha_pago: (r.fecha_cobro as string) ?? '', // columna legacy de bubble se llama fecha_cobro
        comentarios: (r.comentarios as string | null) ?? null,
        banco: (r.banco as string | null) ?? null,
        created_at: (r.created_at as string) ?? '',
    }));
}

export interface CreatePagoCompraPayload {
    factura_compra_id: string;
    tipo_pago: string; // TRANSFERENCIA | CHEQUE | EFECTIVO
    monto: number;
    moneda: 'USD' | 'PEN';
    fecha_pago: string;
    banco?: string | null; // guardamos el nombre o id del banco en el campo TEXT
    comentarios?: string | null;
}

async function recalcularPagosFacturaCompra(facturaId: string) {
    const { adminClient, tenantId } = await getTenantContext();
    if (!adminClient || !tenantId) return;

    const { data: pagos } = await adminClient
        .from('facturas_compra_pagos')
        .select('monto_usd, monto_sol, moneda')
        .eq('factura_compra_id', facturaId)
        .eq('tenant_id', tenantId);

    const totalUSD = (pagos ?? []).reduce((s, p) => s + Number(p.monto_usd ?? 0), 0);
    const totalSOL = (pagos ?? []).reduce((s, p) => s + Number(p.monto_sol ?? 0), 0);

    const { data: factura } = await adminClient
        .from('facturas_compra')
        .select('total_usd, total_sol, monto_a_cobrar_usd, monto_a_cobrar_soles')
        .eq('id', facturaId)
        .eq('tenant_id', tenantId)
        .maybeSingle();
    if (!factura) return;

    const aPagarUSD = Number(factura.monto_a_cobrar_usd ?? factura.total_usd ?? 0);
    const aPagarSOL = Number(factura.monto_a_cobrar_soles ?? factura.total_sol ?? 0);
    const pendUSD = Math.max(0, aPagarUSD - totalUSD);
    const pendSOL = Math.max(0, aPagarSOL - totalSOL);

    const totalPagadoRef = aPagarUSD > 0 ? totalUSD : totalSOL;
    const aPagarRef = aPagarUSD > 0 ? aPagarUSD : aPagarSOL;
    const estadoPago =
        totalPagadoRef <= 0 ? 'PENDIENTE' :
        totalPagadoRef + 0.01 < aPagarRef ? 'PARCIAL' :
        'PAGADA';

    await adminClient
        .from('facturas_compra')
        .update({
            monto_pagado_usd: totalUSD,
            monto_pagado_soles: totalSOL,
            pendiente_por_cobrar_usd: pendUSD,
            pendiente_por_cobrar_sol: pendSOL,
            estado_pago: estadoPago,
            updated_at: new Date().toISOString(),
        })
        .eq('id', facturaId)
        .eq('tenant_id', tenantId);
}

export async function registrarPagoCompra(payload: CreatePagoCompraPayload) {
    const { adminClient, tenantId, user } = await getTenantContext();
    if (!adminClient || !tenantId || !user) return { success: false as const, message: 'No autorizado' };
    if (payload.monto <= 0) return { success: false as const, message: 'El monto debe ser mayor a 0' };

    const montoUSD = payload.moneda === 'USD' ? payload.monto : 0;
    const montoSOL = payload.moneda === 'PEN' ? payload.monto : 0;

    const { error: insErr } = await adminClient.from('facturas_compra_pagos').insert({
        bubble_id: randomUUID(),
        tenant_id: tenantId,
        factura_compra_id: payload.factura_compra_id,
        tipo_pago: payload.tipo_pago,
        monto_usd: montoUSD,
        monto_sol: montoSOL,
        moneda: payload.moneda,
        fecha_cobro: payload.fecha_pago,
        banco: payload.banco ?? null,
        comentarios: payload.comentarios ?? null,
        created_by: user.id,
    });

    if (insErr) {
        console.error('[registrarPagoCompra]', insErr);
        return { success: false as const, message: insErr.message };
    }

    await recalcularPagosFacturaCompra(payload.factura_compra_id);
    revalidatePath('/compras/facturas');
    return { success: true as const, message: 'Pago registrado' };
}

export async function deshacerPagoCompra(pagoId: string) {
    const { adminClient, tenantId } = await getTenantContext();
    if (!adminClient || !tenantId) return { success: false as const, message: 'No autorizado' };

    const { data: pago } = await adminClient
        .from('facturas_compra_pagos')
        .select('factura_compra_id')
        .eq('id', pagoId)
        .eq('tenant_id', tenantId)
        .maybeSingle();
    if (!pago) return { success: false as const, message: 'Pago no encontrado' };

    // Hard-delete (no hay is_active)
    const { error } = await adminClient
        .from('facturas_compra_pagos')
        .delete()
        .eq('id', pagoId)
        .eq('tenant_id', tenantId);
    if (error) return { success: false as const, message: error.message };

    await recalcularPagosFacturaCompra(pago.factura_compra_id || '');
    revalidatePath('/compras/facturas');
    return { success: true as const, message: 'Pago anulado' };
}

// ============================================================
// DETRACCIÓN RETENIDA AL PROVEEDOR
// ============================================================

export interface DetraccionCompraPayload {
    factura_compra_id: string;
    porcentaje: number;
    monto_sol: number;
    paga_por: 'PROVEEDOR' | 'EMPRESA'; // normalmente EMPRESA en compras
    constancia: number;
    fecha_pago: string;
    monto_pagado_soles?: number | null;
}

export async function registrarDetraccionCompra(payload: DetraccionCompraPayload) {
    const { adminClient, tenantId } = await getTenantContext();
    if (!adminClient || !tenantId) return { success: false as const, message: 'No autorizado' };

    const { error } = await adminClient
        .from('facturas_compra')
        .update({
            detraccion_porcentaje: payload.porcentaje,
            detraccion_soles: payload.monto_sol,
            detraccion_paga_por: payload.paga_por,
            detraccion_constancia: payload.constancia,
            detraccion_fecha_pago: payload.fecha_pago,
            detraccion_pago_monto_soles: payload.monto_pagado_soles ?? payload.monto_sol,
            updated_at: new Date().toISOString(),
        })
        .eq('id', payload.factura_compra_id)
        .eq('tenant_id', tenantId);

    if (error) return { success: false as const, message: error.message };
    revalidatePath('/compras/facturas');
    return { success: true as const, message: 'Detracción registrada' };
}

// ============================================================
// ACCIONES INDIVIDUALES POR INFORME
// ============================================================

export async function deshabilitarReporteMaquinariaCompra(reporteId: string) {
    const { adminClient, tenantId } = await getTenantContext();
    if (!adminClient || !tenantId) return { success: false as const, message: 'No autorizado' };

    const { data: reporte } = await adminClient
        .from('reportes_maquinaria')
        .select('id, estado_compra, valorizacion_compra, factura_compra_item')
        .eq('id', reporteId)
        .eq('tenant_id', tenantId)
        .maybeSingle();

    if (!reporte) return { success: false as const, message: 'Reporte no encontrado' };
    if (reporte.factura_compra_item) {
        return { success: false as const, message: `Reporte ya facturado (${reporte.factura_compra_item}). Deshacé la factura primero.` };
    }
    if (reporte.valorizacion_compra) {
        return { success: false as const, message: `Reporte está valorizado (${reporte.valorizacion_compra}). Deshacé la valorización primero.` };
    }

    const { error } = await adminClient
        .from('reportes_maquinaria')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', reporteId)
        .eq('tenant_id', tenantId);

    if (error) return { success: false as const, message: error.message };
    revalidatePath('/compras/valoraciones');
    return { success: true as const, message: 'Reporte deshabilitado' };
}

