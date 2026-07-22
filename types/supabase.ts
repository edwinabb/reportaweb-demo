export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      _bk_cotizaciones: {
        Row: {
          anio: number | null
          aprobado_por: string | null
          aprobado_por_id: string | null
          bubble_id: string | null
          cliente_id: string | null
          comentarios_cliente: string | null
          condiciones_id: string | null
          contacto_id: string | null
          cotizacion_padre_id: string | null
          created_at: string | null
          created_by: string | null
          descripcion_requerimiento: string | null
          dias_validez: number | null
          estado: string | null
          fecha_aprobacion: string | null
          fecha_emision: string | null
          fecha_envio: string | null
          fecha_inicio_estimada: string | null
          fecha_solicitud: string | null
          fecha_vencimiento: string | null
          forma_pago: string | null
          id: string | null
          igv: number | null
          is_active: boolean | null
          maquinaria_id: string | null
          mes: number | null
          moneda: string | null
          notas_internas: string | null
          notas_precios: string | null
          numero: string | null
          observaciones_cliente: string | null
          pdf_generado_at: string | null
          pdf_url: string | null
          periodo: string | null
          periodo_cantidad: number | null
          periodo_unidad: string | null
          pin_aprobacion: string | null
          pin_attempts: number | null
          pin_locked_until: string | null
          plazo_pago: string | null
          sitio_id: string | null
          subtotal: number | null
          tarea_id: string | null
          tasa_cambio_id: string | null
          tenant_id: string | null
          terminos_condiciones: string | null
          token_aprobacion: string | null
          total: number | null
          updated_at: string | null
          updated_by: string | null
          vendedor_id: string | null
          version: number | null
        }
        Insert: {
          anio?: number | null
          aprobado_por?: string | null
          aprobado_por_id?: string | null
          bubble_id?: string | null
          cliente_id?: string | null
          comentarios_cliente?: string | null
          condiciones_id?: string | null
          contacto_id?: string | null
          cotizacion_padre_id?: string | null
          created_at?: string | null
          created_by?: string | null
          descripcion_requerimiento?: string | null
          dias_validez?: number | null
          estado?: string | null
          fecha_aprobacion?: string | null
          fecha_emision?: string | null
          fecha_envio?: string | null
          fecha_inicio_estimada?: string | null
          fecha_solicitud?: string | null
          fecha_vencimiento?: string | null
          forma_pago?: string | null
          id?: string | null
          igv?: number | null
          is_active?: boolean | null
          maquinaria_id?: string | null
          mes?: number | null
          moneda?: string | null
          notas_internas?: string | null
          notas_precios?: string | null
          numero?: string | null
          observaciones_cliente?: string | null
          pdf_generado_at?: string | null
          pdf_url?: string | null
          periodo?: string | null
          periodo_cantidad?: number | null
          periodo_unidad?: string | null
          pin_aprobacion?: string | null
          pin_attempts?: number | null
          pin_locked_until?: string | null
          plazo_pago?: string | null
          sitio_id?: string | null
          subtotal?: number | null
          tarea_id?: string | null
          tasa_cambio_id?: string | null
          tenant_id?: string | null
          terminos_condiciones?: string | null
          token_aprobacion?: string | null
          total?: number | null
          updated_at?: string | null
          updated_by?: string | null
          vendedor_id?: string | null
          version?: number | null
        }
        Update: {
          anio?: number | null
          aprobado_por?: string | null
          aprobado_por_id?: string | null
          bubble_id?: string | null
          cliente_id?: string | null
          comentarios_cliente?: string | null
          condiciones_id?: string | null
          contacto_id?: string | null
          cotizacion_padre_id?: string | null
          created_at?: string | null
          created_by?: string | null
          descripcion_requerimiento?: string | null
          dias_validez?: number | null
          estado?: string | null
          fecha_aprobacion?: string | null
          fecha_emision?: string | null
          fecha_envio?: string | null
          fecha_inicio_estimada?: string | null
          fecha_solicitud?: string | null
          fecha_vencimiento?: string | null
          forma_pago?: string | null
          id?: string | null
          igv?: number | null
          is_active?: boolean | null
          maquinaria_id?: string | null
          mes?: number | null
          moneda?: string | null
          notas_internas?: string | null
          notas_precios?: string | null
          numero?: string | null
          observaciones_cliente?: string | null
          pdf_generado_at?: string | null
          pdf_url?: string | null
          periodo?: string | null
          periodo_cantidad?: number | null
          periodo_unidad?: string | null
          pin_aprobacion?: string | null
          pin_attempts?: number | null
          pin_locked_until?: string | null
          plazo_pago?: string | null
          sitio_id?: string | null
          subtotal?: number | null
          tarea_id?: string | null
          tasa_cambio_id?: string | null
          tenant_id?: string | null
          terminos_condiciones?: string | null
          token_aprobacion?: string | null
          total?: number | null
          updated_at?: string | null
          updated_by?: string | null
          vendedor_id?: string | null
          version?: number | null
        }
        Relationships: []
      }
      _bk_facturas_compra: {
        Row: {
          bubble_id: string | null
          codigo_factura: string | null
          codigo_valoracion: string | null
          cotizacion_contratista_id: string | null
          cotizacion_id: string | null
          created_at: string | null
          created_by: string | null
          detraccion_constancia: number | null
          detraccion_constancia_bubble: string | null
          detraccion_fecha_pago: string | null
          detraccion_fecha_pago_bubble: string | null
          detraccion_paga_por: string | null
          detraccion_paga_por_bubble: string | null
          detraccion_pago_monto_soles: number | null
          detraccion_pago_monto_soles_bubble: number | null
          detraccion_porcentaje: number | null
          detraccion_soles: number | null
          detraccion_usd: number | null
          dias_para_pago: number | null
          dias_para_pago_bubble: number | null
          editor_id: string | null
          esta_activa: boolean | null
          estado: string | null
          estado_pago: string | null
          estado_pago_bubble: string | null
          factura_paga: boolean | null
          factura_paga_bubble: boolean | null
          fecha_factura: string | null
          fecha_factura_bubble: string | null
          fecha_valorado: string | null
          fecha_vencimiento: string | null
          fecha_vencimiento_bubble: string | null
          id: string | null
          igv_monto: number | null
          igv_porcentaje: number | null
          lista_cobros: string[] | null
          lista_items: string[] | null
          maquinaria_id: string | null
          moneda_id: string | null
          monto_a_cobrar_soles: number | null
          monto_a_cobrar_usd: number | null
          monto_pagado_soles: number | null
          monto_pagado_usd: number | null
          pdf_factura: string | null
          pdf_factura_url: string | null
          pdf_valorizacion: string | null
          pendiente_por_cobrar_sol: number | null
          pendiente_por_cobrar_usd: number | null
          proveedor_id: string | null
          subtotal: number | null
          tasa_cambio_id: string | null
          tenant_id: string | null
          total_cant_facturar: number | null
          total_horas: number | null
          total_sol: number | null
          total_usd: number | null
          updated_at: string | null
        }
        Insert: {
          bubble_id?: string | null
          codigo_factura?: string | null
          codigo_valoracion?: string | null
          cotizacion_contratista_id?: string | null
          cotizacion_id?: string | null
          created_at?: string | null
          created_by?: string | null
          detraccion_constancia?: number | null
          detraccion_constancia_bubble?: string | null
          detraccion_fecha_pago?: string | null
          detraccion_fecha_pago_bubble?: string | null
          detraccion_paga_por?: string | null
          detraccion_paga_por_bubble?: string | null
          detraccion_pago_monto_soles?: number | null
          detraccion_pago_monto_soles_bubble?: number | null
          detraccion_porcentaje?: number | null
          detraccion_soles?: number | null
          detraccion_usd?: number | null
          dias_para_pago?: number | null
          dias_para_pago_bubble?: number | null
          editor_id?: string | null
          esta_activa?: boolean | null
          estado?: string | null
          estado_pago?: string | null
          estado_pago_bubble?: string | null
          factura_paga?: boolean | null
          factura_paga_bubble?: boolean | null
          fecha_factura?: string | null
          fecha_factura_bubble?: string | null
          fecha_valorado?: string | null
          fecha_vencimiento?: string | null
          fecha_vencimiento_bubble?: string | null
          id?: string | null
          igv_monto?: number | null
          igv_porcentaje?: number | null
          lista_cobros?: string[] | null
          lista_items?: string[] | null
          maquinaria_id?: string | null
          moneda_id?: string | null
          monto_a_cobrar_soles?: number | null
          monto_a_cobrar_usd?: number | null
          monto_pagado_soles?: number | null
          monto_pagado_usd?: number | null
          pdf_factura?: string | null
          pdf_factura_url?: string | null
          pdf_valorizacion?: string | null
          pendiente_por_cobrar_sol?: number | null
          pendiente_por_cobrar_usd?: number | null
          proveedor_id?: string | null
          subtotal?: number | null
          tasa_cambio_id?: string | null
          tenant_id?: string | null
          total_cant_facturar?: number | null
          total_horas?: number | null
          total_sol?: number | null
          total_usd?: number | null
          updated_at?: string | null
        }
        Update: {
          bubble_id?: string | null
          codigo_factura?: string | null
          codigo_valoracion?: string | null
          cotizacion_contratista_id?: string | null
          cotizacion_id?: string | null
          created_at?: string | null
          created_by?: string | null
          detraccion_constancia?: number | null
          detraccion_constancia_bubble?: string | null
          detraccion_fecha_pago?: string | null
          detraccion_fecha_pago_bubble?: string | null
          detraccion_paga_por?: string | null
          detraccion_paga_por_bubble?: string | null
          detraccion_pago_monto_soles?: number | null
          detraccion_pago_monto_soles_bubble?: number | null
          detraccion_porcentaje?: number | null
          detraccion_soles?: number | null
          detraccion_usd?: number | null
          dias_para_pago?: number | null
          dias_para_pago_bubble?: number | null
          editor_id?: string | null
          esta_activa?: boolean | null
          estado?: string | null
          estado_pago?: string | null
          estado_pago_bubble?: string | null
          factura_paga?: boolean | null
          factura_paga_bubble?: boolean | null
          fecha_factura?: string | null
          fecha_factura_bubble?: string | null
          fecha_valorado?: string | null
          fecha_vencimiento?: string | null
          fecha_vencimiento_bubble?: string | null
          id?: string | null
          igv_monto?: number | null
          igv_porcentaje?: number | null
          lista_cobros?: string[] | null
          lista_items?: string[] | null
          maquinaria_id?: string | null
          moneda_id?: string | null
          monto_a_cobrar_soles?: number | null
          monto_a_cobrar_usd?: number | null
          monto_pagado_soles?: number | null
          monto_pagado_usd?: number | null
          pdf_factura?: string | null
          pdf_factura_url?: string | null
          pdf_valorizacion?: string | null
          pendiente_por_cobrar_sol?: number | null
          pendiente_por_cobrar_usd?: number | null
          proveedor_id?: string | null
          subtotal?: number | null
          tasa_cambio_id?: string | null
          tenant_id?: string | null
          total_cant_facturar?: number | null
          total_horas?: number | null
          total_sol?: number | null
          total_usd?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      _bk_facturas_compra_item: {
        Row: {
          bubble_id: string | null
          cant_facturar: number | null
          codigo_virtual: string | null
          concepto: string | null
          created_at: string | null
          created_by: string | null
          editor_id: string | null
          estado: string | null
          factura_id: string | null
          horas_total: number | null
          id: string | null
          maquinaria_reporte_id: string | null
          precio_unitario: number | null
          servicio_id: string | null
          subtotal: number | null
          tenant_id: string | null
          total_soles: number | null
          total_usd: number | null
          updated_at: string | null
        }
        Insert: {
          bubble_id?: string | null
          cant_facturar?: number | null
          codigo_virtual?: string | null
          concepto?: string | null
          created_at?: string | null
          created_by?: string | null
          editor_id?: string | null
          estado?: string | null
          factura_id?: string | null
          horas_total?: number | null
          id?: string | null
          maquinaria_reporte_id?: string | null
          precio_unitario?: number | null
          servicio_id?: string | null
          subtotal?: number | null
          tenant_id?: string | null
          total_soles?: number | null
          total_usd?: number | null
          updated_at?: string | null
        }
        Update: {
          bubble_id?: string | null
          cant_facturar?: number | null
          codigo_virtual?: string | null
          concepto?: string | null
          created_at?: string | null
          created_by?: string | null
          editor_id?: string | null
          estado?: string | null
          factura_id?: string | null
          horas_total?: number | null
          id?: string | null
          maquinaria_reporte_id?: string | null
          precio_unitario?: number | null
          servicio_id?: string | null
          subtotal?: number | null
          tenant_id?: string | null
          total_soles?: number | null
          total_usd?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      _bk_facturas_venta: {
        Row: {
          bubble_id: string | null
          cliente_id: string | null
          codigo_factura: string | null
          codigo_valoracion: string | null
          cotizacion_id: string | null
          created_at: string | null
          created_by: string | null
          deshabilitada: boolean | null
          detraccion_a_cargo_de: string | null
          detraccion_constancia: string | null
          detraccion_fecha_pago: string | null
          detraccion_monto_sol: number | null
          detraccion_numero_constancia: string | null
          detraccion_paga_por: string | null
          detraccion_porcentaje: number | null
          detraccion_soles: number | null
          detraccion_usd: number | null
          dias_para_pago: number | null
          editor_id: string | null
          esta_activa: boolean | null
          estado: string | null
          estado_pago: string | null
          fecha_factura: string | null
          fecha_valorado: string | null
          fecha_vencimiento: string | null
          id: string | null
          igv_monto: number | null
          igv_porcentaje: number | null
          lista_items: string[] | null
          margen: number | null
          margen_porcentaje: number | null
          monto_a_cobrar_soles: number | null
          monto_a_cobrar_usd: number | null
          monto_pagado_detraccion: number | null
          monto_pagado_factura: number | null
          pdf_factura_url: string | null
          pdf_valorizacion: string | null
          pendiente_por_cobrar_sol: number | null
          pendiente_por_cobrar_usd: number | null
          subtotal: number | null
          tenant_id: string | null
          total_cant_facturar: number | null
          total_horas: number | null
          total_usd: number | null
          updated_at: string | null
          varias_valoraciones: boolean | null
          vendedor_id: string | null
        }
        Insert: {
          bubble_id?: string | null
          cliente_id?: string | null
          codigo_factura?: string | null
          codigo_valoracion?: string | null
          cotizacion_id?: string | null
          created_at?: string | null
          created_by?: string | null
          deshabilitada?: boolean | null
          detraccion_a_cargo_de?: string | null
          detraccion_constancia?: string | null
          detraccion_fecha_pago?: string | null
          detraccion_monto_sol?: number | null
          detraccion_numero_constancia?: string | null
          detraccion_paga_por?: string | null
          detraccion_porcentaje?: number | null
          detraccion_soles?: number | null
          detraccion_usd?: number | null
          dias_para_pago?: number | null
          editor_id?: string | null
          esta_activa?: boolean | null
          estado?: string | null
          estado_pago?: string | null
          fecha_factura?: string | null
          fecha_valorado?: string | null
          fecha_vencimiento?: string | null
          id?: string | null
          igv_monto?: number | null
          igv_porcentaje?: number | null
          lista_items?: string[] | null
          margen?: number | null
          margen_porcentaje?: number | null
          monto_a_cobrar_soles?: number | null
          monto_a_cobrar_usd?: number | null
          monto_pagado_detraccion?: number | null
          monto_pagado_factura?: number | null
          pdf_factura_url?: string | null
          pdf_valorizacion?: string | null
          pendiente_por_cobrar_sol?: number | null
          pendiente_por_cobrar_usd?: number | null
          subtotal?: number | null
          tenant_id?: string | null
          total_cant_facturar?: number | null
          total_horas?: number | null
          total_usd?: number | null
          updated_at?: string | null
          varias_valoraciones?: boolean | null
          vendedor_id?: string | null
        }
        Update: {
          bubble_id?: string | null
          cliente_id?: string | null
          codigo_factura?: string | null
          codigo_valoracion?: string | null
          cotizacion_id?: string | null
          created_at?: string | null
          created_by?: string | null
          deshabilitada?: boolean | null
          detraccion_a_cargo_de?: string | null
          detraccion_constancia?: string | null
          detraccion_fecha_pago?: string | null
          detraccion_monto_sol?: number | null
          detraccion_numero_constancia?: string | null
          detraccion_paga_por?: string | null
          detraccion_porcentaje?: number | null
          detraccion_soles?: number | null
          detraccion_usd?: number | null
          dias_para_pago?: number | null
          editor_id?: string | null
          esta_activa?: boolean | null
          estado?: string | null
          estado_pago?: string | null
          fecha_factura?: string | null
          fecha_valorado?: string | null
          fecha_vencimiento?: string | null
          id?: string | null
          igv_monto?: number | null
          igv_porcentaje?: number | null
          lista_items?: string[] | null
          margen?: number | null
          margen_porcentaje?: number | null
          monto_a_cobrar_soles?: number | null
          monto_a_cobrar_usd?: number | null
          monto_pagado_detraccion?: number | null
          monto_pagado_factura?: number | null
          pdf_factura_url?: string | null
          pdf_valorizacion?: string | null
          pendiente_por_cobrar_sol?: number | null
          pendiente_por_cobrar_usd?: number | null
          subtotal?: number | null
          tenant_id?: string | null
          total_cant_facturar?: number | null
          total_horas?: number | null
          total_usd?: number | null
          updated_at?: string | null
          varias_valoraciones?: boolean | null
          vendedor_id?: string | null
        }
        Relationships: []
      }
      _bk_facturas_venta_item: {
        Row: {
          bubble_id: string | null
          cant_facturar: number | null
          capacidad: string | null
          codigo_virtual: string | null
          concepto: string | null
          created_at: string | null
          created_by: string | null
          editor_id: string | null
          estado: string | null
          factura_venta_id: string | null
          horas_total: number | null
          id: string | null
          maquinaria_id: string | null
          maquinaria_reporte_id: string | null
          minimo: number | null
          precio_unitario: number | null
          servicio_id: string | null
          subtotal: number | null
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          bubble_id?: string | null
          cant_facturar?: number | null
          capacidad?: string | null
          codigo_virtual?: string | null
          concepto?: string | null
          created_at?: string | null
          created_by?: string | null
          editor_id?: string | null
          estado?: string | null
          factura_venta_id?: string | null
          horas_total?: number | null
          id?: string | null
          maquinaria_id?: string | null
          maquinaria_reporte_id?: string | null
          minimo?: number | null
          precio_unitario?: number | null
          servicio_id?: string | null
          subtotal?: number | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          bubble_id?: string | null
          cant_facturar?: number | null
          capacidad?: string | null
          codigo_virtual?: string | null
          concepto?: string | null
          created_at?: string | null
          created_by?: string | null
          editor_id?: string | null
          estado?: string | null
          factura_venta_id?: string | null
          horas_total?: number | null
          id?: string | null
          maquinaria_id?: string | null
          maquinaria_reporte_id?: string | null
          minimo?: number | null
          precio_unitario?: number | null
          servicio_id?: string | null
          subtotal?: number | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      _bk_inspecciones: {
        Row: {
          archivo_nombre: string | null
          archivo_pdf_url: string | null
          bubble_id: string | null
          cliente_id: string | null
          codigo: string | null
          codigo_interno: string | null
          conductor_id: string | null
          cotizacion_id: string | null
          created_at: string | null
          created_by: string | null
          estado: string | null
          fecha_finalizacion: string | null
          fecha_inspeccion: string | null
          firma_conductor_url: string | null
          firma_supervisor_url: string | null
          foto_horometro_final_url: string | null
          foto_horometro_inicio_url: string | null
          foto_odometro_final_url: string | null
          foto_odometro_inicio_url: string | null
          foto_tablero_fin_url: string | null
          foto_tablero_inicio_url: string | null
          horometro_actual: number | null
          horometro_fin: number | null
          horometro_final: number | null
          horometro_inicio: number | null
          id: string | null
          is_active: boolean | null
          kilometraje_actual: number | null
          kilometraje_fin: number | null
          kilometraje_inicio: number | null
          km_final: number | null
          km_inicio: number | null
          maquinaria_id: string | null
          nivel_tanque_gasolina: number | null
          observaciones: string | null
          pdf_url: string | null
          plantilla_id: string | null
          puntaje: number | null
          supervisor_id: string | null
          tarea_id: string | null
          tenant_id: string | null
          tiene_fallas: boolean | null
          tiene_plan_de_accion: boolean | null
          tiene_respuestas_criticas: boolean | null
          tiene_respuestas_erroneas: boolean | null
          ubicacion_gps: Json | null
          updated_at: string | null
          version_formato: string | null
        }
        Insert: {
          archivo_nombre?: string | null
          archivo_pdf_url?: string | null
          bubble_id?: string | null
          cliente_id?: string | null
          codigo?: string | null
          codigo_interno?: string | null
          conductor_id?: string | null
          cotizacion_id?: string | null
          created_at?: string | null
          created_by?: string | null
          estado?: string | null
          fecha_finalizacion?: string | null
          fecha_inspeccion?: string | null
          firma_conductor_url?: string | null
          firma_supervisor_url?: string | null
          foto_horometro_final_url?: string | null
          foto_horometro_inicio_url?: string | null
          foto_odometro_final_url?: string | null
          foto_odometro_inicio_url?: string | null
          foto_tablero_fin_url?: string | null
          foto_tablero_inicio_url?: string | null
          horometro_actual?: number | null
          horometro_fin?: number | null
          horometro_final?: number | null
          horometro_inicio?: number | null
          id?: string | null
          is_active?: boolean | null
          kilometraje_actual?: number | null
          kilometraje_fin?: number | null
          kilometraje_inicio?: number | null
          km_final?: number | null
          km_inicio?: number | null
          maquinaria_id?: string | null
          nivel_tanque_gasolina?: number | null
          observaciones?: string | null
          pdf_url?: string | null
          plantilla_id?: string | null
          puntaje?: number | null
          supervisor_id?: string | null
          tarea_id?: string | null
          tenant_id?: string | null
          tiene_fallas?: boolean | null
          tiene_plan_de_accion?: boolean | null
          tiene_respuestas_criticas?: boolean | null
          tiene_respuestas_erroneas?: boolean | null
          ubicacion_gps?: Json | null
          updated_at?: string | null
          version_formato?: string | null
        }
        Update: {
          archivo_nombre?: string | null
          archivo_pdf_url?: string | null
          bubble_id?: string | null
          cliente_id?: string | null
          codigo?: string | null
          codigo_interno?: string | null
          conductor_id?: string | null
          cotizacion_id?: string | null
          created_at?: string | null
          created_by?: string | null
          estado?: string | null
          fecha_finalizacion?: string | null
          fecha_inspeccion?: string | null
          firma_conductor_url?: string | null
          firma_supervisor_url?: string | null
          foto_horometro_final_url?: string | null
          foto_horometro_inicio_url?: string | null
          foto_odometro_final_url?: string | null
          foto_odometro_inicio_url?: string | null
          foto_tablero_fin_url?: string | null
          foto_tablero_inicio_url?: string | null
          horometro_actual?: number | null
          horometro_fin?: number | null
          horometro_final?: number | null
          horometro_inicio?: number | null
          id?: string | null
          is_active?: boolean | null
          kilometraje_actual?: number | null
          kilometraje_fin?: number | null
          kilometraje_inicio?: number | null
          km_final?: number | null
          km_inicio?: number | null
          maquinaria_id?: string | null
          nivel_tanque_gasolina?: number | null
          observaciones?: string | null
          pdf_url?: string | null
          plantilla_id?: string | null
          puntaje?: number | null
          supervisor_id?: string | null
          tarea_id?: string | null
          tenant_id?: string | null
          tiene_fallas?: boolean | null
          tiene_plan_de_accion?: boolean | null
          tiene_respuestas_criticas?: boolean | null
          tiene_respuestas_erroneas?: boolean | null
          ubicacion_gps?: Json | null
          updated_at?: string | null
          version_formato?: string | null
        }
        Relationships: []
      }
      _bk_reportes_maquinaria: {
        Row: {
          aceptacion: string | null
          aceptado_por: string | null
          autor_id: string | null
          bubble_id: string | null
          cargo_cliente_firmante: string | null
          cliente_cargo: string | null
          cliente_id: string | null
          cliente_nombre: string | null
          codigo_documento_interno: string | null
          cotizacion_compra_item_id: string | null
          cotizacion_venta_item_id: string | null
          created_at: string | null
          created_by: string | null
          editor_id: string | null
          estado_compra: string | null
          estado_venta: string | null
          factura_compra_item: string | null
          factura_compra_item_id: string | null
          factura_venta_item: string | null
          factura_venta_item_id: string | null
          fecha_reporte: string | null
          firma: string | null
          firma_cliente_url: string | null
          foto_actividad_url: string | null
          foto_reporte_escrito_url: string | null
          fotos_adicionales: Json | null
          guia_transporte: string | null
          horas_alquiler: number | null
          horas_facturar: number | null
          horas_recorrido: number | null
          horas_trabajadas: number | null
          id: string | null
          id_documento_interno: string | null
          is_active: boolean | null
          jornada1_fin: string | null
          jornada1_inicio: string | null
          jornada2_fin: string | null
          jornada2_inicio: string | null
          jornada3_fin: string | null
          jornada3_inicio: string | null
          maquinaria_id: string | null
          nombre_cliente_firmante: string | null
          operador_id: string | null
          pdf_url: string | null
          proveedor_id: string | null
          rigger1_id: string | null
          rigger2_id: string | null
          salida_autorizada_por: string | null
          segunda_jornada: boolean | null
          tarea_id: string | null
          tenant_id: string | null
          tipo_recorrido: string | null
          tipo_uso: string | null
          tonelaje_solicitado: number | null
          total_horas: number | null
          trabajo_realizado: string | null
          updated_at: string | null
          updated_by: string | null
          valorizacion_compra: string | null
          valorizacion_compra_id: string | null
          valorizacion_venta: string | null
          valorizacion_venta_id: string | null
          version_formato: string | null
        }
        Insert: {
          aceptacion?: string | null
          aceptado_por?: string | null
          autor_id?: string | null
          bubble_id?: string | null
          cargo_cliente_firmante?: string | null
          cliente_cargo?: string | null
          cliente_id?: string | null
          cliente_nombre?: string | null
          codigo_documento_interno?: string | null
          cotizacion_compra_item_id?: string | null
          cotizacion_venta_item_id?: string | null
          created_at?: string | null
          created_by?: string | null
          editor_id?: string | null
          estado_compra?: string | null
          estado_venta?: string | null
          factura_compra_item?: string | null
          factura_compra_item_id?: string | null
          factura_venta_item?: string | null
          factura_venta_item_id?: string | null
          fecha_reporte?: string | null
          firma?: string | null
          firma_cliente_url?: string | null
          foto_actividad_url?: string | null
          foto_reporte_escrito_url?: string | null
          fotos_adicionales?: Json | null
          guia_transporte?: string | null
          horas_alquiler?: number | null
          horas_facturar?: number | null
          horas_recorrido?: number | null
          horas_trabajadas?: number | null
          id?: string | null
          id_documento_interno?: string | null
          is_active?: boolean | null
          jornada1_fin?: string | null
          jornada1_inicio?: string | null
          jornada2_fin?: string | null
          jornada2_inicio?: string | null
          jornada3_fin?: string | null
          jornada3_inicio?: string | null
          maquinaria_id?: string | null
          nombre_cliente_firmante?: string | null
          operador_id?: string | null
          pdf_url?: string | null
          proveedor_id?: string | null
          rigger1_id?: string | null
          rigger2_id?: string | null
          salida_autorizada_por?: string | null
          segunda_jornada?: boolean | null
          tarea_id?: string | null
          tenant_id?: string | null
          tipo_recorrido?: string | null
          tipo_uso?: string | null
          tonelaje_solicitado?: number | null
          total_horas?: number | null
          trabajo_realizado?: string | null
          updated_at?: string | null
          updated_by?: string | null
          valorizacion_compra?: string | null
          valorizacion_compra_id?: string | null
          valorizacion_venta?: string | null
          valorizacion_venta_id?: string | null
          version_formato?: string | null
        }
        Update: {
          aceptacion?: string | null
          aceptado_por?: string | null
          autor_id?: string | null
          bubble_id?: string | null
          cargo_cliente_firmante?: string | null
          cliente_cargo?: string | null
          cliente_id?: string | null
          cliente_nombre?: string | null
          codigo_documento_interno?: string | null
          cotizacion_compra_item_id?: string | null
          cotizacion_venta_item_id?: string | null
          created_at?: string | null
          created_by?: string | null
          editor_id?: string | null
          estado_compra?: string | null
          estado_venta?: string | null
          factura_compra_item?: string | null
          factura_compra_item_id?: string | null
          factura_venta_item?: string | null
          factura_venta_item_id?: string | null
          fecha_reporte?: string | null
          firma?: string | null
          firma_cliente_url?: string | null
          foto_actividad_url?: string | null
          foto_reporte_escrito_url?: string | null
          fotos_adicionales?: Json | null
          guia_transporte?: string | null
          horas_alquiler?: number | null
          horas_facturar?: number | null
          horas_recorrido?: number | null
          horas_trabajadas?: number | null
          id?: string | null
          id_documento_interno?: string | null
          is_active?: boolean | null
          jornada1_fin?: string | null
          jornada1_inicio?: string | null
          jornada2_fin?: string | null
          jornada2_inicio?: string | null
          jornada3_fin?: string | null
          jornada3_inicio?: string | null
          maquinaria_id?: string | null
          nombre_cliente_firmante?: string | null
          operador_id?: string | null
          pdf_url?: string | null
          proveedor_id?: string | null
          rigger1_id?: string | null
          rigger2_id?: string | null
          salida_autorizada_por?: string | null
          segunda_jornada?: boolean | null
          tarea_id?: string | null
          tenant_id?: string | null
          tipo_recorrido?: string | null
          tipo_uso?: string | null
          tonelaje_solicitado?: number | null
          total_horas?: number | null
          trabajo_realizado?: string | null
          updated_at?: string | null
          updated_by?: string | null
          valorizacion_compra?: string | null
          valorizacion_compra_id?: string | null
          valorizacion_venta?: string | null
          valorizacion_venta_id?: string | null
          version_formato?: string | null
        }
        Relationships: []
      }
      _bk_reportes_personal: {
        Row: {
          bubble_id: string | null
          cargo_cliente_firmante: string | null
          created_at: string | null
          created_by: string | null
          domingo_al_que_corresponde: string | null
          es_descanso_por_domingo: boolean | null
          es_domingo_o_festivo: boolean | null
          fecha_descanso_compensatorio: string | null
          fecha_reporte: string | null
          firma_cliente_url: string | null
          firma_trabajador_url: string | null
          firmado_por: string | null
          foto_trabajo_url: string | null
          gasto_almuerzo: number | null
          gasto_cena: number | null
          gasto_desayuno: number | null
          gasto_movilidad: number | null
          gasto_total: number | null
          horas_dominicales: number | null
          horas_extras: number | null
          horas_extras_extraordinarias: number | null
          id: string | null
          id_documento_interno: string | null
          is_active: boolean | null
          jornada1_fin: string | null
          jornada1_inicio: string | null
          jornada2_fin: string | null
          jornada2_inicio: string | null
          jornada3_fin: string | null
          jornada3_inicio: string | null
          maquinaria_id: string | null
          nombre_cliente_firmante: string | null
          pdf_url: string | null
          personal_id: string | null
          tarea_id: string | null
          tenant_id: string | null
          tercero_personal_id: string | null
          tiene_descanso_compensatorio: boolean | null
          tipo_personal: string | null
          total_horas: number | null
          trabajo_realizado: string | null
          updated_at: string | null
        }
        Insert: {
          bubble_id?: string | null
          cargo_cliente_firmante?: string | null
          created_at?: string | null
          created_by?: string | null
          domingo_al_que_corresponde?: string | null
          es_descanso_por_domingo?: boolean | null
          es_domingo_o_festivo?: boolean | null
          fecha_descanso_compensatorio?: string | null
          fecha_reporte?: string | null
          firma_cliente_url?: string | null
          firma_trabajador_url?: string | null
          firmado_por?: string | null
          foto_trabajo_url?: string | null
          gasto_almuerzo?: number | null
          gasto_cena?: number | null
          gasto_desayuno?: number | null
          gasto_movilidad?: number | null
          gasto_total?: number | null
          horas_dominicales?: number | null
          horas_extras?: number | null
          horas_extras_extraordinarias?: number | null
          id?: string | null
          id_documento_interno?: string | null
          is_active?: boolean | null
          jornada1_fin?: string | null
          jornada1_inicio?: string | null
          jornada2_fin?: string | null
          jornada2_inicio?: string | null
          jornada3_fin?: string | null
          jornada3_inicio?: string | null
          maquinaria_id?: string | null
          nombre_cliente_firmante?: string | null
          pdf_url?: string | null
          personal_id?: string | null
          tarea_id?: string | null
          tenant_id?: string | null
          tercero_personal_id?: string | null
          tiene_descanso_compensatorio?: boolean | null
          tipo_personal?: string | null
          total_horas?: number | null
          trabajo_realizado?: string | null
          updated_at?: string | null
        }
        Update: {
          bubble_id?: string | null
          cargo_cliente_firmante?: string | null
          created_at?: string | null
          created_by?: string | null
          domingo_al_que_corresponde?: string | null
          es_descanso_por_domingo?: boolean | null
          es_domingo_o_festivo?: boolean | null
          fecha_descanso_compensatorio?: string | null
          fecha_reporte?: string | null
          firma_cliente_url?: string | null
          firma_trabajador_url?: string | null
          firmado_por?: string | null
          foto_trabajo_url?: string | null
          gasto_almuerzo?: number | null
          gasto_cena?: number | null
          gasto_desayuno?: number | null
          gasto_movilidad?: number | null
          gasto_total?: number | null
          horas_dominicales?: number | null
          horas_extras?: number | null
          horas_extras_extraordinarias?: number | null
          id?: string | null
          id_documento_interno?: string | null
          is_active?: boolean | null
          jornada1_fin?: string | null
          jornada1_inicio?: string | null
          jornada2_fin?: string | null
          jornada2_inicio?: string | null
          jornada3_fin?: string | null
          jornada3_inicio?: string | null
          maquinaria_id?: string | null
          nombre_cliente_firmante?: string | null
          pdf_url?: string | null
          personal_id?: string | null
          tarea_id?: string | null
          tenant_id?: string | null
          tercero_personal_id?: string | null
          tiene_descanso_compensatorio?: boolean | null
          tipo_personal?: string | null
          total_horas?: number | null
          trabajo_realizado?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      _bk_tareas: {
        Row: {
          asignado_a: string | null
          bubble_id: string | null
          cliente_id: string | null
          cliente_nombre: string | null
          codigo: string | null
          contacto_id: string | null
          cotizacion_id: string | null
          cotizacion_item_id: string | null
          cotizacion_ref: string | null
          created_at: string | null
          created_by: string | null
          descripcion: string | null
          estado: string | null
          hora_fin: string | null
          hora_inicio: string | null
          id: string | null
          is_active: boolean | null
          prioridad: string | null
          servicio_ref: string | null
          sitio: string | null
          sitio_id: string | null
          tenant_id: string | null
          tipo_tarea: string | null
          titulo: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          asignado_a?: string | null
          bubble_id?: string | null
          cliente_id?: string | null
          cliente_nombre?: string | null
          codigo?: string | null
          contacto_id?: string | null
          cotizacion_id?: string | null
          cotizacion_item_id?: string | null
          cotizacion_ref?: string | null
          created_at?: string | null
          created_by?: string | null
          descripcion?: string | null
          estado?: string | null
          hora_fin?: string | null
          hora_inicio?: string | null
          id?: string | null
          is_active?: boolean | null
          prioridad?: string | null
          servicio_ref?: string | null
          sitio?: string | null
          sitio_id?: string | null
          tenant_id?: string | null
          tipo_tarea?: string | null
          titulo?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          asignado_a?: string | null
          bubble_id?: string | null
          cliente_id?: string | null
          cliente_nombre?: string | null
          codigo?: string | null
          contacto_id?: string | null
          cotizacion_id?: string | null
          cotizacion_item_id?: string | null
          cotizacion_ref?: string | null
          created_at?: string | null
          created_by?: string | null
          descripcion?: string | null
          estado?: string | null
          hora_fin?: string | null
          hora_inicio?: string | null
          id?: string | null
          is_active?: boolean | null
          prioridad?: string | null
          servicio_ref?: string | null
          sitio?: string | null
          sitio_id?: string | null
          tenant_id?: string | null
          tipo_tarea?: string | null
          titulo?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      _migrations_applied: {
        Row: {
          applied_at: string
          name: string
        }
        Insert: {
          applied_at?: string
          name: string
        }
        Update: {
          applied_at?: string
          name?: string
        }
        Relationships: []
      }
      actividades_matriz: {
        Row: {
          bubble_id: string | null
          created_at: string | null
          created_by: string | null
          descripcion: string | null
          id: string
          is_active: boolean | null
          nombre: string
          orden: number | null
          responsable_default: string | null
          tenant_id: string
        }
        Insert: {
          bubble_id?: string | null
          created_at?: string | null
          created_by?: string | null
          descripcion?: string | null
          id?: string
          is_active?: boolean | null
          nombre: string
          orden?: number | null
          responsable_default?: string | null
          tenant_id: string
        }
        Update: {
          bubble_id?: string | null
          created_at?: string | null
          created_by?: string | null
          descripcion?: string | null
          id?: string
          is_active?: boolean | null
          nombre?: string
          orden?: number | null
          responsable_default?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "actividades_matriz_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      apks: {
        Row: {
          archivo: string
          commit: string | null
          created_at: string
          created_by: string | null
          id: string
          version: string
        }
        Insert: {
          archivo: string
          commit?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          version: string
        }
        Update: {
          archivo?: string
          commit?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          version?: string
        }
        Relationships: []
      }
      app_allowances: {
        Row: {
          created_at: string | null
          device_ref: string | null
          fecha: string
          foto_url: string | null
          id: string
          monto: number | null
          personal_id: string | null
          tarea_id: string | null
          tenant_id: string
          tipo: string
        }
        Insert: {
          created_at?: string | null
          device_ref?: string | null
          fecha: string
          foto_url?: string | null
          id?: string
          monto?: number | null
          personal_id?: string | null
          tarea_id?: string | null
          tenant_id: string
          tipo: string
        }
        Update: {
          created_at?: string | null
          device_ref?: string | null
          fecha?: string
          foto_url?: string | null
          id?: string
          monto?: number | null
          personal_id?: string | null
          tarea_id?: string | null
          tenant_id?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_allowances_personal_id_fkey"
            columns: ["personal_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_allowances_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "tareas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_allowances_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_app_historial"
            referencedColumns: ["tarea_id"]
          },
          {
            foreignKeyName: "app_allowances_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_app_plan"
            referencedColumns: ["tarea_id"]
          },
          {
            foreignKeyName: "app_allowances_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_tareas_agenda_diaria"
            referencedColumns: ["tarea_id"]
          },
          {
            foreignKeyName: "app_allowances_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_valoraciones_compras"
            referencedColumns: ["tarea_id"]
          },
          {
            foreignKeyName: "app_allowances_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_valoraciones_ventas"
            referencedColumns: ["tarea_id"]
          },
          {
            foreignKeyName: "app_allowances_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      app_asistencias: {
        Row: {
          created_at: string | null
          device_ref: string | null
          dispositivo_id: string | null
          fecha_hora: string
          fotos_urls: string[] | null
          id: string
          notas: string | null
          personal_id: string | null
          sincronizado_at: string | null
          tarea_id: string | null
          tenant_id: string
          tercero_personal_id: string | null
          tipo: string
          ubicacion_gps: Json | null
          uuid_local: string | null
        }
        Insert: {
          created_at?: string | null
          device_ref?: string | null
          dispositivo_id?: string | null
          fecha_hora: string
          fotos_urls?: string[] | null
          id?: string
          notas?: string | null
          personal_id?: string | null
          sincronizado_at?: string | null
          tarea_id?: string | null
          tenant_id: string
          tercero_personal_id?: string | null
          tipo: string
          ubicacion_gps?: Json | null
          uuid_local?: string | null
        }
        Update: {
          created_at?: string | null
          device_ref?: string | null
          dispositivo_id?: string | null
          fecha_hora?: string
          fotos_urls?: string[] | null
          id?: string
          notas?: string | null
          personal_id?: string | null
          sincronizado_at?: string | null
          tarea_id?: string | null
          tenant_id?: string
          tercero_personal_id?: string | null
          tipo?: string
          ubicacion_gps?: Json | null
          uuid_local?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "app_asistencias_personal_id_fkey"
            columns: ["personal_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_asistencias_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "tareas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_asistencias_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_app_historial"
            referencedColumns: ["tarea_id"]
          },
          {
            foreignKeyName: "app_asistencias_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_app_plan"
            referencedColumns: ["tarea_id"]
          },
          {
            foreignKeyName: "app_asistencias_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_tareas_agenda_diaria"
            referencedColumns: ["tarea_id"]
          },
          {
            foreignKeyName: "app_asistencias_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_valoraciones_compras"
            referencedColumns: ["tarea_id"]
          },
          {
            foreignKeyName: "app_asistencias_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_valoraciones_ventas"
            referencedColumns: ["tarea_id"]
          },
        ]
      }
      app_calendario_festivos: {
        Row: {
          created_at: string | null
          descripcion: string | null
          fecha: string
          id: string
          is_active: boolean | null
          pais_id: string | null
        }
        Insert: {
          created_at?: string | null
          descripcion?: string | null
          fecha: string
          id?: string
          is_active?: boolean | null
          pais_id?: string | null
        }
        Update: {
          created_at?: string | null
          descripcion?: string | null
          fecha?: string
          id?: string
          is_active?: boolean | null
          pais_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "app_calendario_festivos_pais_id_fkey"
            columns: ["pais_id"]
            isOneToOne: false
            referencedRelation: "paises"
            referencedColumns: ["id"]
          },
        ]
      }
      app_combustible: {
        Row: {
          cantidad_galones: number | null
          created_at: string | null
          device_ref: string | null
          fecha_hora: string
          foto_horometro_url: string | null
          foto_medidor_antes_url: string | null
          foto_medidor_despues_url: string | null
          foto_voucher_url: string | null
          horometro_actual: number | null
          id: string
          maquinaria_id: string | null
          monto: number | null
          nombre_grifo: string | null
          personal_id: string | null
          sincronizado_at: string | null
          tarea_id: string | null
          tenant_id: string
          tipo_combustible: string | null
          ubicacion_gps: Json | null
          uuid_local: string | null
          velocimetro_actual: number | null
        }
        Insert: {
          cantidad_galones?: number | null
          created_at?: string | null
          device_ref?: string | null
          fecha_hora: string
          foto_horometro_url?: string | null
          foto_medidor_antes_url?: string | null
          foto_medidor_despues_url?: string | null
          foto_voucher_url?: string | null
          horometro_actual?: number | null
          id?: string
          maquinaria_id?: string | null
          monto?: number | null
          nombre_grifo?: string | null
          personal_id?: string | null
          sincronizado_at?: string | null
          tarea_id?: string | null
          tenant_id: string
          tipo_combustible?: string | null
          ubicacion_gps?: Json | null
          uuid_local?: string | null
          velocimetro_actual?: number | null
        }
        Update: {
          cantidad_galones?: number | null
          created_at?: string | null
          device_ref?: string | null
          fecha_hora?: string
          foto_horometro_url?: string | null
          foto_medidor_antes_url?: string | null
          foto_medidor_despues_url?: string | null
          foto_voucher_url?: string | null
          horometro_actual?: number | null
          id?: string
          maquinaria_id?: string | null
          monto?: number | null
          nombre_grifo?: string | null
          personal_id?: string | null
          sincronizado_at?: string | null
          tarea_id?: string | null
          tenant_id?: string
          tipo_combustible?: string | null
          ubicacion_gps?: Json | null
          uuid_local?: string | null
          velocimetro_actual?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "app_combustible_maquinaria_id_fkey"
            columns: ["maquinaria_id"]
            isOneToOne: false
            referencedRelation: "maquinarias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_combustible_maquinaria_id_fkey"
            columns: ["maquinaria_id"]
            isOneToOne: false
            referencedRelation: "view_valoraciones_compras"
            referencedColumns: ["maquinaria_id"]
          },
          {
            foreignKeyName: "app_combustible_maquinaria_id_fkey"
            columns: ["maquinaria_id"]
            isOneToOne: false
            referencedRelation: "view_valoraciones_ventas"
            referencedColumns: ["maquinaria_id"]
          },
          {
            foreignKeyName: "app_combustible_personal_id_fkey"
            columns: ["personal_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_combustible_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "tareas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_combustible_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_app_historial"
            referencedColumns: ["tarea_id"]
          },
          {
            foreignKeyName: "app_combustible_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_app_plan"
            referencedColumns: ["tarea_id"]
          },
          {
            foreignKeyName: "app_combustible_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_tareas_agenda_diaria"
            referencedColumns: ["tarea_id"]
          },
          {
            foreignKeyName: "app_combustible_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_valoraciones_compras"
            referencedColumns: ["tarea_id"]
          },
          {
            foreignKeyName: "app_combustible_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_valoraciones_ventas"
            referencedColumns: ["tarea_id"]
          },
        ]
      }
      app_eventos_clima: {
        Row: {
          created_at: string | null
          descripcion: string
          device_ref: string | null
          fecha_hora: string
          fotos: string[] | null
          id: string
          personal_id: string | null
          tarea_id: string | null
          tenant_id: string
          ubicacion_gps: Json | null
        }
        Insert: {
          created_at?: string | null
          descripcion: string
          device_ref?: string | null
          fecha_hora: string
          fotos?: string[] | null
          id?: string
          personal_id?: string | null
          tarea_id?: string | null
          tenant_id: string
          ubicacion_gps?: Json | null
        }
        Update: {
          created_at?: string | null
          descripcion?: string
          device_ref?: string | null
          fecha_hora?: string
          fotos?: string[] | null
          id?: string
          personal_id?: string | null
          tarea_id?: string | null
          tenant_id?: string
          ubicacion_gps?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "app_eventos_clima_personal_id_fkey"
            columns: ["personal_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_eventos_clima_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "tareas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_eventos_clima_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_app_historial"
            referencedColumns: ["tarea_id"]
          },
          {
            foreignKeyName: "app_eventos_clima_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_app_plan"
            referencedColumns: ["tarea_id"]
          },
          {
            foreignKeyName: "app_eventos_clima_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_tareas_agenda_diaria"
            referencedColumns: ["tarea_id"]
          },
          {
            foreignKeyName: "app_eventos_clima_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_valoraciones_compras"
            referencedColumns: ["tarea_id"]
          },
          {
            foreignKeyName: "app_eventos_clima_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_valoraciones_ventas"
            referencedColumns: ["tarea_id"]
          },
          {
            foreignKeyName: "app_eventos_clima_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      app_eventos_operacionales: {
        Row: {
          created_at: string | null
          device_ref: string | null
          fecha_hora: string
          foto_url: string | null
          horometro_inicio: number | null
          id: string
          kilometraje_inicio: number | null
          notas: string | null
          personal_id: string | null
          tarea_id: string | null
          tenant_id: string
          tipo: string
          ubicacion_gps: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          device_ref?: string | null
          fecha_hora: string
          foto_url?: string | null
          horometro_inicio?: number | null
          id?: string
          kilometraje_inicio?: number | null
          notas?: string | null
          personal_id?: string | null
          tarea_id?: string | null
          tenant_id: string
          tipo: string
          ubicacion_gps?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          device_ref?: string | null
          fecha_hora?: string
          foto_url?: string | null
          horometro_inicio?: number | null
          id?: string
          kilometraje_inicio?: number | null
          notas?: string | null
          personal_id?: string | null
          tarea_id?: string | null
          tenant_id?: string
          tipo?: string
          ubicacion_gps?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "app_eventos_operacionales_personal_id_fkey"
            columns: ["personal_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_eventos_operacionales_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "tareas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_eventos_operacionales_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_app_historial"
            referencedColumns: ["tarea_id"]
          },
          {
            foreignKeyName: "app_eventos_operacionales_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_app_plan"
            referencedColumns: ["tarea_id"]
          },
          {
            foreignKeyName: "app_eventos_operacionales_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_tareas_agenda_diaria"
            referencedColumns: ["tarea_id"]
          },
          {
            foreignKeyName: "app_eventos_operacionales_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_valoraciones_compras"
            referencedColumns: ["tarea_id"]
          },
          {
            foreignKeyName: "app_eventos_operacionales_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_valoraciones_ventas"
            referencedColumns: ["tarea_id"]
          },
          {
            foreignKeyName: "app_eventos_operacionales_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      app_hora_intervalos: {
        Row: {
          etiqueta: string
          hora_fin: string
          hora_inicio: string
          id: string
          is_active: boolean | null
          orden: number | null
        }
        Insert: {
          etiqueta: string
          hora_fin: string
          hora_inicio: string
          id?: string
          is_active?: boolean | null
          orden?: number | null
        }
        Update: {
          etiqueta?: string
          hora_fin?: string
          hora_inicio?: string
          id?: string
          is_active?: boolean | null
          orden?: number | null
        }
        Relationships: []
      }
      app_imprevistos: {
        Row: {
          created_at: string | null
          descripcion: string
          fecha_hora: string
          foto_url: string | null
          id: string
          monto: number | null
          personal_id: string | null
          tarea_id: string | null
          tenant_id: string
          ubicacion_gps: Json | null
        }
        Insert: {
          created_at?: string | null
          descripcion: string
          fecha_hora: string
          foto_url?: string | null
          id?: string
          monto?: number | null
          personal_id?: string | null
          tarea_id?: string | null
          tenant_id: string
          ubicacion_gps?: Json | null
        }
        Update: {
          created_at?: string | null
          descripcion?: string
          fecha_hora?: string
          foto_url?: string | null
          id?: string
          monto?: number | null
          personal_id?: string | null
          tarea_id?: string | null
          tenant_id?: string
          ubicacion_gps?: Json | null
        }
        Relationships: []
      }
      app_kpi_snapshots: {
        Row: {
          checklists_count: number | null
          computed_at: string | null
          galones_totales: number | null
          gasto_almuerzo_total: number | null
          gasto_cena_total: number | null
          gasto_desayuno_total: number | null
          gasto_movilidad_total: number | null
          gasto_viaticos_total: number | null
          horas_dominicales: number | null
          horas_extras: number | null
          horas_reportadas: number | null
          id: string
          informes_maquinaria_count: number | null
          informes_personal_count: number | null
          paradas_count: number | null
          paradas_minutos: number | null
          periodo_anio: number
          periodo_mes: number
          personal_id: string | null
          puntaje_checklist_promedio: number | null
          puntaje_puntualidad: number | null
          tenant_id: string
        }
        Insert: {
          checklists_count?: number | null
          computed_at?: string | null
          galones_totales?: number | null
          gasto_almuerzo_total?: number | null
          gasto_cena_total?: number | null
          gasto_desayuno_total?: number | null
          gasto_movilidad_total?: number | null
          gasto_viaticos_total?: number | null
          horas_dominicales?: number | null
          horas_extras?: number | null
          horas_reportadas?: number | null
          id?: string
          informes_maquinaria_count?: number | null
          informes_personal_count?: number | null
          paradas_count?: number | null
          paradas_minutos?: number | null
          periodo_anio: number
          periodo_mes: number
          personal_id?: string | null
          puntaje_checklist_promedio?: number | null
          puntaje_puntualidad?: number | null
          tenant_id: string
        }
        Update: {
          checklists_count?: number | null
          computed_at?: string | null
          galones_totales?: number | null
          gasto_almuerzo_total?: number | null
          gasto_cena_total?: number | null
          gasto_desayuno_total?: number | null
          gasto_movilidad_total?: number | null
          gasto_viaticos_total?: number | null
          horas_dominicales?: number | null
          horas_extras?: number | null
          horas_reportadas?: number | null
          id?: string
          informes_maquinaria_count?: number | null
          informes_personal_count?: number | null
          paradas_count?: number | null
          paradas_minutos?: number | null
          periodo_anio?: number
          periodo_mes?: number
          personal_id?: string | null
          puntaje_checklist_promedio?: number | null
          puntaje_puntualidad?: number | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_kpi_snapshots_personal_id_fkey"
            columns: ["personal_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_mantenimiento_np: {
        Row: {
          created_at: string | null
          descripcion: string
          device_ref: string | null
          fecha_hora: string
          foto_factura_url: string | null
          foto_repuesto_url: string | null
          foto_url: string | null
          id: string
          maquinaria_id: string | null
          monto: number | null
          personal_id: string | null
          tarea_id: string | null
          tenant_id: string
        }
        Insert: {
          created_at?: string | null
          descripcion: string
          device_ref?: string | null
          fecha_hora: string
          foto_factura_url?: string | null
          foto_repuesto_url?: string | null
          foto_url?: string | null
          id?: string
          maquinaria_id?: string | null
          monto?: number | null
          personal_id?: string | null
          tarea_id?: string | null
          tenant_id: string
        }
        Update: {
          created_at?: string | null
          descripcion?: string
          device_ref?: string | null
          fecha_hora?: string
          foto_factura_url?: string | null
          foto_repuesto_url?: string | null
          foto_url?: string | null
          id?: string
          maquinaria_id?: string | null
          monto?: number | null
          personal_id?: string | null
          tarea_id?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_mantenimiento_np_maquinaria_id_fkey"
            columns: ["maquinaria_id"]
            isOneToOne: false
            referencedRelation: "maquinarias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_mantenimiento_np_maquinaria_id_fkey"
            columns: ["maquinaria_id"]
            isOneToOne: false
            referencedRelation: "view_valoraciones_compras"
            referencedColumns: ["maquinaria_id"]
          },
          {
            foreignKeyName: "app_mantenimiento_np_maquinaria_id_fkey"
            columns: ["maquinaria_id"]
            isOneToOne: false
            referencedRelation: "view_valoraciones_ventas"
            referencedColumns: ["maquinaria_id"]
          },
          {
            foreignKeyName: "app_mantenimiento_np_personal_id_fkey"
            columns: ["personal_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_mantenimiento_np_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "tareas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_mantenimiento_np_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_app_historial"
            referencedColumns: ["tarea_id"]
          },
          {
            foreignKeyName: "app_mantenimiento_np_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_app_plan"
            referencedColumns: ["tarea_id"]
          },
          {
            foreignKeyName: "app_mantenimiento_np_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_tareas_agenda_diaria"
            referencedColumns: ["tarea_id"]
          },
          {
            foreignKeyName: "app_mantenimiento_np_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_valoraciones_compras"
            referencedColumns: ["tarea_id"]
          },
          {
            foreignKeyName: "app_mantenimiento_np_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_valoraciones_ventas"
            referencedColumns: ["tarea_id"]
          },
          {
            foreignKeyName: "app_mantenimiento_np_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      app_paradas: {
        Row: {
          created_at: string | null
          descripcion: string | null
          duracion_minutos: number | null
          fecha_hora_fin: string | null
          fecha_hora_inicio: string
          fotos_urls: string[] | null
          id: string
          maquinaria_id: string | null
          motivo_categoria: string | null
          personal_id: string | null
          sincronizado_at: string | null
          tarea_id: string | null
          tenant_id: string
          ubicacion_gps: Json | null
          uuid_local: string | null
        }
        Insert: {
          created_at?: string | null
          descripcion?: string | null
          duracion_minutos?: number | null
          fecha_hora_fin?: string | null
          fecha_hora_inicio: string
          fotos_urls?: string[] | null
          id?: string
          maquinaria_id?: string | null
          motivo_categoria?: string | null
          personal_id?: string | null
          sincronizado_at?: string | null
          tarea_id?: string | null
          tenant_id: string
          ubicacion_gps?: Json | null
          uuid_local?: string | null
        }
        Update: {
          created_at?: string | null
          descripcion?: string | null
          duracion_minutos?: number | null
          fecha_hora_fin?: string | null
          fecha_hora_inicio?: string
          fotos_urls?: string[] | null
          id?: string
          maquinaria_id?: string | null
          motivo_categoria?: string | null
          personal_id?: string | null
          sincronizado_at?: string | null
          tarea_id?: string | null
          tenant_id?: string
          ubicacion_gps?: Json | null
          uuid_local?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "app_paradas_maquinaria_id_fkey"
            columns: ["maquinaria_id"]
            isOneToOne: false
            referencedRelation: "maquinarias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_paradas_maquinaria_id_fkey"
            columns: ["maquinaria_id"]
            isOneToOne: false
            referencedRelation: "view_valoraciones_compras"
            referencedColumns: ["maquinaria_id"]
          },
          {
            foreignKeyName: "app_paradas_maquinaria_id_fkey"
            columns: ["maquinaria_id"]
            isOneToOne: false
            referencedRelation: "view_valoraciones_ventas"
            referencedColumns: ["maquinaria_id"]
          },
          {
            foreignKeyName: "app_paradas_personal_id_fkey"
            columns: ["personal_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_paradas_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "tareas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_paradas_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_app_historial"
            referencedColumns: ["tarea_id"]
          },
          {
            foreignKeyName: "app_paradas_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_app_plan"
            referencedColumns: ["tarea_id"]
          },
          {
            foreignKeyName: "app_paradas_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_tareas_agenda_diaria"
            referencedColumns: ["tarea_id"]
          },
          {
            foreignKeyName: "app_paradas_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_valoraciones_compras"
            referencedColumns: ["tarea_id"]
          },
          {
            foreignKeyName: "app_paradas_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_valoraciones_ventas"
            referencedColumns: ["tarea_id"]
          },
        ]
      }
      app_releases: {
        Row: {
          activo: boolean
          apk_filename: string | null
          apk_url: string
          build_number: number
          created_at: string
          created_by: string | null
          forzar_actualizacion: boolean
          id: string
          notas_cambios: string
          platform: string
          version: string
        }
        Insert: {
          activo?: boolean
          apk_filename?: string | null
          apk_url: string
          build_number: number
          created_at?: string
          created_by?: string | null
          forzar_actualizacion?: boolean
          id?: string
          notas_cambios?: string
          platform?: string
          version: string
        }
        Update: {
          activo?: boolean
          apk_filename?: string | null
          apk_url?: string
          build_number?: number
          created_at?: string
          created_by?: string | null
          forzar_actualizacion?: boolean
          id?: string
          notas_cambios?: string
          platform?: string
          version?: string
        }
        Relationships: []
      }
      areas: {
        Row: {
          bubble_id: string | null
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          name: string
          tenant_id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          bubble_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          tenant_id: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          bubble_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          tenant_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "areas_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      bancos: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          moneda: string | null
          nombre: string
          numero_cuenta: string | null
          tenant_id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          moneda?: string | null
          nombre: string
          numero_cuenta?: string | null
          tenant_id: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          moneda?: string | null
          nombre?: string
          numero_cuenta?: string | null
          tenant_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bancos_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bancos_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bancos_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bitacora_operaciones: {
        Row: {
          created_at: string | null
          created_by: string | null
          fecha_hora_evento: string
          geolocalizacion: Json | null
          id: string
          is_active: boolean | null
          lectura_dato: number | null
          multimedia_url: string | null
          observaciones: string | null
          tarea_id: string
          tenant_id: string
          tipo_evento: Database["public"]["Enums"]["tipo_evento_bitacora"]
          updated_at: string | null
          usuario_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          fecha_hora_evento?: string
          geolocalizacion?: Json | null
          id?: string
          is_active?: boolean | null
          lectura_dato?: number | null
          multimedia_url?: string | null
          observaciones?: string | null
          tarea_id: string
          tenant_id: string
          tipo_evento: Database["public"]["Enums"]["tipo_evento_bitacora"]
          updated_at?: string | null
          usuario_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          fecha_hora_evento?: string
          geolocalizacion?: Json | null
          id?: string
          is_active?: boolean | null
          lectura_dato?: number | null
          multimedia_url?: string | null
          observaciones?: string | null
          tarea_id?: string
          tenant_id?: string
          tipo_evento?: Database["public"]["Enums"]["tipo_evento_bitacora"]
          updated_at?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bitacora_operaciones_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "tareas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bitacora_operaciones_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_app_historial"
            referencedColumns: ["tarea_id"]
          },
          {
            foreignKeyName: "bitacora_operaciones_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_app_plan"
            referencedColumns: ["tarea_id"]
          },
          {
            foreignKeyName: "bitacora_operaciones_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_tareas_agenda_diaria"
            referencedColumns: ["tarea_id"]
          },
          {
            foreignKeyName: "bitacora_operaciones_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_valoraciones_compras"
            referencedColumns: ["tarea_id"]
          },
          {
            foreignKeyName: "bitacora_operaciones_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_valoraciones_ventas"
            referencedColumns: ["tarea_id"]
          },
        ]
      }
      branches: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          is_main: boolean | null
          name: string
          tenant_id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          is_main?: boolean | null
          name: string
          tenant_id: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          is_main?: boolean | null
          name?: string
          tenant_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "branches_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      cargo_permisos: {
        Row: {
          cargo_id: string
          id: string
          puede_editar: boolean
          puede_eliminar: boolean
          puede_ingresar: boolean
          puede_ver: boolean
          recurso_id: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          cargo_id: string
          id?: string
          puede_editar?: boolean
          puede_eliminar?: boolean
          puede_ingresar?: boolean
          puede_ver?: boolean
          recurso_id: string
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          cargo_id?: string
          id?: string
          puede_editar?: boolean
          puede_eliminar?: boolean
          puede_ingresar?: boolean
          puede_ver?: boolean
          recurso_id?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cargo_permisos_cargo_id_fkey"
            columns: ["cargo_id"]
            isOneToOne: false
            referencedRelation: "job_titles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cargo_permisos_recurso_id_fkey"
            columns: ["recurso_id"]
            isOneToOne: false
            referencedRelation: "sistema_recursos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cargo_permisos_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      catalogos: {
        Row: {
          categoria: string
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          nombre: string
          tenant_id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          categoria: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          nombre: string
          tenant_id: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          categoria?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          nombre?: string
          tenant_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "catalogos_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      cobros_venta: {
        Row: {
          banco_id: string | null
          comentarios: string | null
          created_at: string
          created_by: string | null
          factura_venta_id: string
          fecha_cobro: string
          id: string
          is_active: boolean
          moneda: string
          monto: number
          tenant_id: string
          tipo: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          banco_id?: string | null
          comentarios?: string | null
          created_at?: string
          created_by?: string | null
          factura_venta_id: string
          fecha_cobro: string
          id?: string
          is_active?: boolean
          moneda?: string
          monto: number
          tenant_id: string
          tipo: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          banco_id?: string | null
          comentarios?: string | null
          created_at?: string
          created_by?: string | null
          factura_venta_id?: string
          fecha_cobro?: string
          id?: string
          is_active?: boolean
          moneda?: string
          monto?: number
          tenant_id?: string
          tipo?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cobros_venta_banco_id_fkey"
            columns: ["banco_id"]
            isOneToOne: false
            referencedRelation: "bancos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cobros_venta_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cobros_venta_factura_venta_id_fkey"
            columns: ["factura_venta_id"]
            isOneToOne: false
            referencedRelation: "facturas_venta"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cobros_venta_factura_venta_id_fkey"
            columns: ["factura_venta_id"]
            isOneToOne: false
            referencedRelation: "view_valoraciones_ventas"
            referencedColumns: ["valoracion_fv_id"]
          },
          {
            foreignKeyName: "cobros_venta_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cobros_venta_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          bubble_id: string | null
          created_at: string | null
          created_by: string | null
          direccion: string | null
          email: string | null
          epp_notificar_observaciones_a: string[] | null
          fleet_size: number | null
          fleet_type: string | null
          gerente_general: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          phone: string | null
          razon_social: string | null
          ruc: string | null
          telefono: string | null
          timezone: string | null
          trial_expires_at: string | null
          trial_start_at: string | null
          trial_status: string | null
          ubicacion_ciudad: string | null
          ubicacion_pais: string | null
          updated_at: string | null
          updated_by: string | null
          website: string | null
        }
        Insert: {
          bubble_id?: string | null
          created_at?: string | null
          created_by?: string | null
          direccion?: string | null
          email?: string | null
          epp_notificar_observaciones_a?: string[] | null
          fleet_size?: number | null
          fleet_type?: string | null
          gerente_general?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          phone?: string | null
          razon_social?: string | null
          ruc?: string | null
          telefono?: string | null
          timezone?: string | null
          trial_expires_at?: string | null
          trial_start_at?: string | null
          trial_status?: string | null
          ubicacion_ciudad?: string | null
          ubicacion_pais?: string | null
          updated_at?: string | null
          updated_by?: string | null
          website?: string | null
        }
        Update: {
          bubble_id?: string | null
          created_at?: string | null
          created_by?: string | null
          direccion?: string | null
          email?: string | null
          epp_notificar_observaciones_a?: string[] | null
          fleet_size?: number | null
          fleet_type?: string | null
          gerente_general?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          phone?: string | null
          razon_social?: string | null
          ruc?: string | null
          telefono?: string | null
          timezone?: string | null
          trial_expires_at?: string | null
          trial_start_at?: string | null
          trial_status?: string | null
          ubicacion_ciudad?: string | null
          ubicacion_pais?: string | null
          updated_at?: string | null
          updated_by?: string | null
          website?: string | null
        }
        Relationships: []
      }
      companies_consecutives: {
        Row: {
          created_at: string | null
          created_by: string | null
          documento_tipo: string
          id: string
          is_active: boolean | null
          longitud_numero: number | null
          prefijo: string | null
          tenant_id: string
          ultimo_numero: number | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          documento_tipo: string
          id?: string
          is_active?: boolean | null
          longitud_numero?: number | null
          prefijo?: string | null
          tenant_id: string
          ultimo_numero?: number | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          documento_tipo?: string
          id?: string
          is_active?: boolean | null
          longitud_numero?: number | null
          prefijo?: string | null
          tenant_id?: string
          ultimo_numero?: number | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_consecutives_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      config_checklist: {
        Row: {
          created_at: string | null
          id: string
          label_footer: string | null
          mostrar_cliente: boolean | null
          mostrar_empresa: boolean | null
          mostrar_medidores: boolean | null
          mostrar_observaciones: boolean | null
          mostrar_tarea: boolean | null
          planes_accion_notificar_a: string[] | null
          tenant_id: string
          texto_declaracion: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          label_footer?: string | null
          mostrar_cliente?: boolean | null
          mostrar_empresa?: boolean | null
          mostrar_medidores?: boolean | null
          mostrar_observaciones?: boolean | null
          mostrar_tarea?: boolean | null
          planes_accion_notificar_a?: string[] | null
          tenant_id: string
          texto_declaracion?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          label_footer?: string | null
          mostrar_cliente?: boolean | null
          mostrar_empresa?: boolean | null
          mostrar_medidores?: boolean | null
          mostrar_observaciones?: boolean | null
          mostrar_tarea?: boolean | null
          planes_accion_notificar_a?: string[] | null
          tenant_id?: string
          texto_declaracion?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "config_checklist_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      config_informe_maquinaria: {
        Row: {
          cantidad_riggers: number
          cantidad_turnos: number
          codigo_formato: string
          created_at: string
          etiquetas_fotos_adicionales: Json | null
          fecha_formato: string
          incluye_firma_cliente: boolean
          incluye_foto_reporte_escrito: boolean
          incluye_foto_trabajo: boolean
          incluye_fotos_adicionales: boolean | null
          incluye_guia_transporte: boolean | null
          incluye_salida_autorizada: boolean
          incluye_tipo_recorrido: boolean
          incluye_tonelaje_placa: boolean
          tenant_id: string
          updated_at: string | null
          updated_by: string | null
          version_formato: string
        }
        Insert: {
          cantidad_riggers?: number
          cantidad_turnos?: number
          codigo_formato?: string
          created_at?: string
          etiquetas_fotos_adicionales?: Json | null
          fecha_formato?: string
          incluye_firma_cliente?: boolean
          incluye_foto_reporte_escrito?: boolean
          incluye_foto_trabajo?: boolean
          incluye_fotos_adicionales?: boolean | null
          incluye_guia_transporte?: boolean | null
          incluye_salida_autorizada?: boolean
          incluye_tipo_recorrido?: boolean
          incluye_tonelaje_placa?: boolean
          tenant_id: string
          updated_at?: string | null
          updated_by?: string | null
          version_formato?: string
        }
        Update: {
          cantidad_riggers?: number
          cantidad_turnos?: number
          codigo_formato?: string
          created_at?: string
          etiquetas_fotos_adicionales?: Json | null
          fecha_formato?: string
          incluye_firma_cliente?: boolean
          incluye_foto_reporte_escrito?: boolean
          incluye_foto_trabajo?: boolean
          incluye_fotos_adicionales?: boolean | null
          incluye_guia_transporte?: boolean | null
          incluye_salida_autorizada?: boolean
          incluye_tipo_recorrido?: boolean
          incluye_tonelaje_placa?: boolean
          tenant_id?: string
          updated_at?: string | null
          updated_by?: string | null
          version_formato?: string
        }
        Relationships: [
          {
            foreignKeyName: "config_informe_maquinaria_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "config_informe_maquinaria_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      config_informe_personal: {
        Row: {
          cantidad_turnos: number
          codigo_formato: string
          created_at: string
          fecha_formato: string
          incluye_firma_cliente_horas: boolean
          incluye_firma_trabajador: boolean
          incluye_foto_trabajo: boolean
          incluye_gastos: boolean
          incluye_horas_dominicales: boolean
          incluye_horas_extras: boolean
          incluye_horas_extras_extraord: boolean
          tenant_id: string
          updated_at: string | null
          updated_by: string | null
          version_formato: string
        }
        Insert: {
          cantidad_turnos?: number
          codigo_formato?: string
          created_at?: string
          fecha_formato?: string
          incluye_firma_cliente_horas?: boolean
          incluye_firma_trabajador?: boolean
          incluye_foto_trabajo?: boolean
          incluye_gastos?: boolean
          incluye_horas_dominicales?: boolean
          incluye_horas_extras?: boolean
          incluye_horas_extras_extraord?: boolean
          tenant_id: string
          updated_at?: string | null
          updated_by?: string | null
          version_formato?: string
        }
        Update: {
          cantidad_turnos?: number
          codigo_formato?: string
          created_at?: string
          fecha_formato?: string
          incluye_firma_cliente_horas?: boolean
          incluye_firma_trabajador?: boolean
          incluye_foto_trabajo?: boolean
          incluye_gastos?: boolean
          incluye_horas_dominicales?: boolean
          incluye_horas_extras?: boolean
          incluye_horas_extras_extraord?: boolean
          tenant_id?: string
          updated_at?: string | null
          updated_by?: string | null
          version_formato?: string
        }
        Relationships: [
          {
            foreignKeyName: "config_informe_personal_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "config_informe_personal_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      config_valorizacion_compra: {
        Row: {
          codigo_formato: string
          created_at: string
          detraccion_default: number
          fecha_formato: string
          igv_default: number
          tenant_id: string
          updated_at: string | null
          updated_by: string | null
          version_formato: string
        }
        Insert: {
          codigo_formato?: string
          created_at?: string
          detraccion_default?: number
          fecha_formato?: string
          igv_default?: number
          tenant_id: string
          updated_at?: string | null
          updated_by?: string | null
          version_formato?: string
        }
        Update: {
          codigo_formato?: string
          created_at?: string
          detraccion_default?: number
          fecha_formato?: string
          igv_default?: number
          tenant_id?: string
          updated_at?: string | null
          updated_by?: string | null
          version_formato?: string
        }
        Relationships: [
          {
            foreignKeyName: "config_valorizacion_compra_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "config_valorizacion_compra_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      config_valorizacion_venta: {
        Row: {
          codigo_formato: string
          created_at: string
          detraccion_default: number
          fecha_formato: string
          igv_default: number
          tenant_id: string
          updated_at: string | null
          updated_by: string | null
          version_formato: string
        }
        Insert: {
          codigo_formato?: string
          created_at?: string
          detraccion_default?: number
          fecha_formato?: string
          igv_default?: number
          tenant_id: string
          updated_at?: string | null
          updated_by?: string | null
          version_formato?: string
        }
        Update: {
          codigo_formato?: string
          created_at?: string
          detraccion_default?: number
          fecha_formato?: string
          igv_default?: number
          tenant_id?: string
          updated_at?: string | null
          updated_by?: string | null
          version_formato?: string
        }
        Relationships: [
          {
            foreignKeyName: "config_valorizacion_venta_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "config_valorizacion_venta_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contactos_area: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          nombre: string
          tenant_id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          nombre: string
          tenant_id: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          nombre?: string
          tenant_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      contactos_cargo: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          nombre: string
          tenant_id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          nombre: string
          tenant_id: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          nombre?: string
          tenant_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      cotizaciones: {
        Row: {
          anio: number | null
          aprobado_por: string | null
          aprobado_por_id: string | null
          bubble_id: string | null
          cliente_id: string
          comentarios_cliente: string | null
          condiciones_id: string | null
          contacto_id: string | null
          cotizacion_padre_id: string | null
          created_at: string | null
          created_by: string | null
          descripcion_requerimiento: string | null
          dias_validez: number | null
          estado: string | null
          fecha_aprobacion: string | null
          fecha_emision: string
          fecha_envio: string | null
          fecha_inicio_estimada: string | null
          fecha_solicitud: string | null
          fecha_vencimiento: string
          forma_pago: string | null
          id: string
          igv: number | null
          is_active: boolean | null
          maquinaria_id: string | null
          mes: number | null
          moneda: string | null
          notas_internas: string | null
          notas_precios: string | null
          numero: string
          observaciones_cliente: string | null
          pdf_generado_at: string | null
          pdf_url: string | null
          periodo: string | null
          periodo_cantidad: number | null
          periodo_unidad: string | null
          pin_aprobacion: string | null
          pin_attempts: number | null
          pin_locked_until: string | null
          plazo_pago: string | null
          sitio_id: string | null
          subtotal: number | null
          tarea_id: string | null
          tasa_cambio_id: string | null
          tenant_id: string
          terminos_condiciones: string | null
          token_aprobacion: string | null
          total: number | null
          updated_at: string | null
          updated_by: string | null
          vendedor_id: string | null
          version: number | null
        }
        Insert: {
          anio?: number | null
          aprobado_por?: string | null
          aprobado_por_id?: string | null
          bubble_id?: string | null
          cliente_id: string
          comentarios_cliente?: string | null
          condiciones_id?: string | null
          contacto_id?: string | null
          cotizacion_padre_id?: string | null
          created_at?: string | null
          created_by?: string | null
          descripcion_requerimiento?: string | null
          dias_validez?: number | null
          estado?: string | null
          fecha_aprobacion?: string | null
          fecha_emision?: string
          fecha_envio?: string | null
          fecha_inicio_estimada?: string | null
          fecha_solicitud?: string | null
          fecha_vencimiento: string
          forma_pago?: string | null
          id?: string
          igv?: number | null
          is_active?: boolean | null
          maquinaria_id?: string | null
          mes?: number | null
          moneda?: string | null
          notas_internas?: string | null
          notas_precios?: string | null
          numero: string
          observaciones_cliente?: string | null
          pdf_generado_at?: string | null
          pdf_url?: string | null
          periodo?: string | null
          periodo_cantidad?: number | null
          periodo_unidad?: string | null
          pin_aprobacion?: string | null
          pin_attempts?: number | null
          pin_locked_until?: string | null
          plazo_pago?: string | null
          sitio_id?: string | null
          subtotal?: number | null
          tarea_id?: string | null
          tasa_cambio_id?: string | null
          tenant_id: string
          terminos_condiciones?: string | null
          token_aprobacion?: string | null
          total?: number | null
          updated_at?: string | null
          updated_by?: string | null
          vendedor_id?: string | null
          version?: number | null
        }
        Update: {
          anio?: number | null
          aprobado_por?: string | null
          aprobado_por_id?: string | null
          bubble_id?: string | null
          cliente_id?: string
          comentarios_cliente?: string | null
          condiciones_id?: string | null
          contacto_id?: string | null
          cotizacion_padre_id?: string | null
          created_at?: string | null
          created_by?: string | null
          descripcion_requerimiento?: string | null
          dias_validez?: number | null
          estado?: string | null
          fecha_aprobacion?: string | null
          fecha_emision?: string
          fecha_envio?: string | null
          fecha_inicio_estimada?: string | null
          fecha_solicitud?: string | null
          fecha_vencimiento?: string
          forma_pago?: string | null
          id?: string
          igv?: number | null
          is_active?: boolean | null
          maquinaria_id?: string | null
          mes?: number | null
          moneda?: string | null
          notas_internas?: string | null
          notas_precios?: string | null
          numero?: string
          observaciones_cliente?: string | null
          pdf_generado_at?: string | null
          pdf_url?: string | null
          periodo?: string | null
          periodo_cantidad?: number | null
          periodo_unidad?: string | null
          pin_aprobacion?: string | null
          pin_attempts?: number | null
          pin_locked_until?: string | null
          plazo_pago?: string | null
          sitio_id?: string | null
          subtotal?: number | null
          tarea_id?: string | null
          tasa_cambio_id?: string | null
          tenant_id?: string
          terminos_condiciones?: string | null
          token_aprobacion?: string | null
          total?: number | null
          updated_at?: string | null
          updated_by?: string | null
          vendedor_id?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cotizaciones_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "terceros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotizaciones_contacto_id_fkey"
            columns: ["contacto_id"]
            isOneToOne: false
            referencedRelation: "terceros_contactos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotizaciones_cotizacion_padre_id_fkey"
            columns: ["cotizacion_padre_id"]
            isOneToOne: false
            referencedRelation: "cotizaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotizaciones_cotizacion_padre_id_fkey"
            columns: ["cotizacion_padre_id"]
            isOneToOne: false
            referencedRelation: "view_valoraciones_ventas"
            referencedColumns: ["cotizacion_id"]
          },
          {
            foreignKeyName: "cotizaciones_sitio_id_fkey"
            columns: ["sitio_id"]
            isOneToOne: false
            referencedRelation: "terceros_sitios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotizaciones_tasa_cambio_id_fkey"
            columns: ["tasa_cambio_id"]
            isOneToOne: false
            referencedRelation: "tasas_cambio"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotizaciones_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      cotizaciones_configuracion: {
        Row: {
          banco: string | null
          bubble_id: string | null
          created_at: string | null
          created_by: string | null
          despedida: string | null
          firma_autorizada_usuario_id: string | null
          firma_autorizado_url: string | null
          firma_gerente_url: string | null
          firma_imagen_url: string | null
          forma_pago1: string | null
          forma_pago2: string | null
          id: string
          imagen_banco: string | null
          imagen_banco_url: string | null
          imagen_firma: string | null
          introduccion: string | null
          is_active: boolean | null
          mostrar_firma: boolean | null
          pie_pagina: string | null
          saludo: string | null
          tenant_id: string
          terminos_condiciones: string | null
          texto_aceptacion: string | null
          texto_forma_pago_1: string | null
          texto_forma_pago_2: string | null
          texto_introduccion: string | null
          texto_notas_precios: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          banco?: string | null
          bubble_id?: string | null
          created_at?: string | null
          created_by?: string | null
          despedida?: string | null
          firma_autorizada_usuario_id?: string | null
          firma_autorizado_url?: string | null
          firma_gerente_url?: string | null
          firma_imagen_url?: string | null
          forma_pago1?: string | null
          forma_pago2?: string | null
          id?: string
          imagen_banco?: string | null
          imagen_banco_url?: string | null
          imagen_firma?: string | null
          introduccion?: string | null
          is_active?: boolean | null
          mostrar_firma?: boolean | null
          pie_pagina?: string | null
          saludo?: string | null
          tenant_id: string
          terminos_condiciones?: string | null
          texto_aceptacion?: string | null
          texto_forma_pago_1?: string | null
          texto_forma_pago_2?: string | null
          texto_introduccion?: string | null
          texto_notas_precios?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          banco?: string | null
          bubble_id?: string | null
          created_at?: string | null
          created_by?: string | null
          despedida?: string | null
          firma_autorizada_usuario_id?: string | null
          firma_autorizado_url?: string | null
          firma_gerente_url?: string | null
          firma_imagen_url?: string | null
          forma_pago1?: string | null
          forma_pago2?: string | null
          id?: string
          imagen_banco?: string | null
          imagen_banco_url?: string | null
          imagen_firma?: string | null
          introduccion?: string | null
          is_active?: boolean | null
          mostrar_firma?: boolean | null
          pie_pagina?: string | null
          saludo?: string | null
          tenant_id?: string
          terminos_condiciones?: string | null
          texto_aceptacion?: string | null
          texto_forma_pago_1?: string | null
          texto_forma_pago_2?: string | null
          texto_introduccion?: string | null
          texto_notas_precios?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cotizaciones_configuracion_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      cotizaciones_configuracion_doc: {
        Row: {
          contenido: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          nombre: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          contenido?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          nombre: string
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          contenido?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          nombre?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cotizaciones_configuracion_doc_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      cotizaciones_detalle: {
        Row: {
          bubble_id: string | null
          cantidad: number | null
          cotizacion_id: string
          created_at: string | null
          created_by: string | null
          descripcion: string | null
          descuento_porcentaje: number | null
          estado_aprobacion: string | null
          id: string
          minimo1: number | null
          minimo2: number | null
          minimo3: number | null
          orden: number
          precio_campo_adicional: number | null
          precio_negociado: number | null
          precio_seleccionado: number | null
          precio_tipo: string | null
          precio_valor: number | null
          precio1_monto: number | null
          precio2_monto: number | null
          precio3_monto: number | null
          servicio_id: string | null
          subtotal: number | null
          tarea_id: string | null
          tenant_id: string
          unidad_medida: string | null
          updated_at: string | null
        }
        Insert: {
          bubble_id?: string | null
          cantidad?: number | null
          cotizacion_id: string
          created_at?: string | null
          created_by?: string | null
          descripcion?: string | null
          descuento_porcentaje?: number | null
          estado_aprobacion?: string | null
          id?: string
          minimo1?: number | null
          minimo2?: number | null
          minimo3?: number | null
          orden: number
          precio_campo_adicional?: number | null
          precio_negociado?: number | null
          precio_seleccionado?: number | null
          precio_tipo?: string | null
          precio_valor?: number | null
          precio1_monto?: number | null
          precio2_monto?: number | null
          precio3_monto?: number | null
          servicio_id?: string | null
          subtotal?: number | null
          tarea_id?: string | null
          tenant_id: string
          unidad_medida?: string | null
          updated_at?: string | null
        }
        Update: {
          bubble_id?: string | null
          cantidad?: number | null
          cotizacion_id?: string
          created_at?: string | null
          created_by?: string | null
          descripcion?: string | null
          descuento_porcentaje?: number | null
          estado_aprobacion?: string | null
          id?: string
          minimo1?: number | null
          minimo2?: number | null
          minimo3?: number | null
          orden?: number
          precio_campo_adicional?: number | null
          precio_negociado?: number | null
          precio_seleccionado?: number | null
          precio_tipo?: string | null
          precio_valor?: number | null
          precio1_monto?: number | null
          precio2_monto?: number | null
          precio3_monto?: number | null
          servicio_id?: string | null
          subtotal?: number | null
          tarea_id?: string | null
          tenant_id?: string
          unidad_medida?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cotizaciones_detalle_cotizacion_id_fkey"
            columns: ["cotizacion_id"]
            isOneToOne: false
            referencedRelation: "cotizaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotizaciones_detalle_cotizacion_id_fkey"
            columns: ["cotizacion_id"]
            isOneToOne: false
            referencedRelation: "view_valoraciones_ventas"
            referencedColumns: ["cotizacion_id"]
          },
          {
            foreignKeyName: "cotizaciones_detalle_servicio_id_fkey"
            columns: ["servicio_id"]
            isOneToOne: false
            referencedRelation: "servicios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotizaciones_detalle_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      cotizaciones_historial: {
        Row: {
          accion: string
          bubble_id: string | null
          cotizacion_id: string
          created_at: string | null
          estado_anterior: string | null
          estado_nuevo: string | null
          id: string
          metadata: Json | null
          observacion: string | null
          tenant_id: string
          usuario_email: string | null
          usuario_id: string | null
        }
        Insert: {
          accion: string
          bubble_id?: string | null
          cotizacion_id: string
          created_at?: string | null
          estado_anterior?: string | null
          estado_nuevo?: string | null
          id?: string
          metadata?: Json | null
          observacion?: string | null
          tenant_id: string
          usuario_email?: string | null
          usuario_id?: string | null
        }
        Update: {
          accion?: string
          bubble_id?: string | null
          cotizacion_id?: string
          created_at?: string | null
          estado_anterior?: string | null
          estado_nuevo?: string | null
          id?: string
          metadata?: Json | null
          observacion?: string | null
          tenant_id?: string
          usuario_email?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cotizaciones_historial_cotizacion_id_fkey"
            columns: ["cotizacion_id"]
            isOneToOne: false
            referencedRelation: "cotizaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotizaciones_historial_cotizacion_id_fkey"
            columns: ["cotizacion_id"]
            isOneToOne: false
            referencedRelation: "view_valoraciones_ventas"
            referencedColumns: ["cotizacion_id"]
          },
          {
            foreignKeyName: "cotizaciones_historial_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      cotizaciones_matriz_actividades: {
        Row: {
          bubble_id: string | null
          created_at: string
          descripcion: string | null
          id: string
          nombre: string | null
          tenant_id: string | null
        }
        Insert: {
          bubble_id?: string | null
          created_at?: string
          descripcion?: string | null
          id?: string
          nombre?: string | null
          tenant_id?: string | null
        }
        Update: {
          bubble_id?: string | null
          created_at?: string
          descripcion?: string | null
          id?: string
          nombre?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cotizaciones_matriz_actividades_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      cotizaciones_matriz_responsabilidad: {
        Row: {
          actividad: string | null
          bubble_id: string | null
          cotizacion_bubble_id: string | null
          cotizacion_id: string | null
          created_at: string | null
          created_by: string | null
          descripcion: string | null
          id: string
          observacion: string | null
          orden: number | null
          responsable: string | null
          tenant_bubble_id: string | null
          tenant_id: string
        }
        Insert: {
          actividad?: string | null
          bubble_id?: string | null
          cotizacion_bubble_id?: string | null
          cotizacion_id?: string | null
          created_at?: string | null
          created_by?: string | null
          descripcion?: string | null
          id?: string
          observacion?: string | null
          orden?: number | null
          responsable?: string | null
          tenant_bubble_id?: string | null
          tenant_id: string
        }
        Update: {
          actividad?: string | null
          bubble_id?: string | null
          cotizacion_bubble_id?: string | null
          cotizacion_id?: string | null
          created_at?: string | null
          created_by?: string | null
          descripcion?: string | null
          id?: string
          observacion?: string | null
          orden?: number | null
          responsable?: string | null
          tenant_bubble_id?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cotizaciones_matriz_responsabilidad_cotizacion_id_fkey"
            columns: ["cotizacion_id"]
            isOneToOne: false
            referencedRelation: "cotizaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotizaciones_matriz_responsabilidad_cotizacion_id_fkey"
            columns: ["cotizacion_id"]
            isOneToOne: false
            referencedRelation: "view_valoraciones_ventas"
            referencedColumns: ["cotizacion_id"]
          },
          {
            foreignKeyName: "cotizaciones_matriz_responsabilidad_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      cotizaciones_motivo_rechazo: {
        Row: {
          bubble_id: string | null
          cotizacion_id: string | null
          created_at: string | null
          created_by: string | null
          id: string
          motivo: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          bubble_id?: string | null
          cotizacion_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          motivo?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          bubble_id?: string | null
          cotizacion_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          motivo?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cotizaciones_motivo_rechazo_cotizacion_id_fkey"
            columns: ["cotizacion_id"]
            isOneToOne: false
            referencedRelation: "cotizaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotizaciones_motivo_rechazo_cotizacion_id_fkey"
            columns: ["cotizacion_id"]
            isOneToOne: false
            referencedRelation: "view_valoraciones_ventas"
            referencedColumns: ["cotizacion_id"]
          },
          {
            foreignKeyName: "cotizaciones_motivo_rechazo_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cotizaciones_ofertas_items: {
        Row: {
          aprobado: boolean | null
          bubble_id: string | null
          cantidad: number | null
          cotizacion_detalle_bubble_id: string | null
          cotizacion_detalle_id: string | null
          cotizacion_oferta_bubble_id: string | null
          cotizacion_oferta_id: string | null
          created_at: string | null
          created_by: string | null
          descripcion: string | null
          id: string
          minimo: number | null
          precio_monto: number | null
          servicio_bubble_id: string | null
          servicio_id: string | null
          tenant_bubble_id: string | null
          tenant_id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          aprobado?: boolean | null
          bubble_id?: string | null
          cantidad?: number | null
          cotizacion_detalle_bubble_id?: string | null
          cotizacion_detalle_id?: string | null
          cotizacion_oferta_bubble_id?: string | null
          cotizacion_oferta_id?: string | null
          created_at?: string | null
          created_by?: string | null
          descripcion?: string | null
          id?: string
          minimo?: number | null
          precio_monto?: number | null
          servicio_bubble_id?: string | null
          servicio_id?: string | null
          tenant_bubble_id?: string | null
          tenant_id: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          aprobado?: boolean | null
          bubble_id?: string | null
          cantidad?: number | null
          cotizacion_detalle_bubble_id?: string | null
          cotizacion_detalle_id?: string | null
          cotizacion_oferta_bubble_id?: string | null
          cotizacion_oferta_id?: string | null
          created_at?: string | null
          created_by?: string | null
          descripcion?: string | null
          id?: string
          minimo?: number | null
          precio_monto?: number | null
          servicio_bubble_id?: string | null
          servicio_id?: string | null
          tenant_bubble_id?: string | null
          tenant_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cotizaciones_ofertas_items_cotizacion_oferta_id_fkey"
            columns: ["cotizacion_oferta_id"]
            isOneToOne: false
            referencedRelation: "cotizaciones_ofertas_proveedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotizaciones_ofertas_items_servicio_id_fkey"
            columns: ["servicio_id"]
            isOneToOne: false
            referencedRelation: "servicios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotizaciones_ofertas_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      cotizaciones_ofertas_proveedores: {
        Row: {
          bubble_id: string | null
          contacto_bubble_id: string | null
          contacto_id: string | null
          cotizacion_bubble_id: string | null
          cotizacion_id: string | null
          created_at: string | null
          created_by: string | null
          descripcion_general: string | null
          fecha_inicio_preliminar: string | null
          fecha_oferta: string | null
          forma_pago: string | null
          id: string
          moneda: string | null
          observaciones: string | null
          plazo_pago: string | null
          precio: number | null
          proveedor_bubble_id: string | null
          proveedor_id: string | null
          proveedor_nombre: string | null
          servicio_bubble_id: string | null
          servicio_id: string | null
          tenant_bubble_id: string | null
          tenant_id: string
        }
        Insert: {
          bubble_id?: string | null
          contacto_bubble_id?: string | null
          contacto_id?: string | null
          cotizacion_bubble_id?: string | null
          cotizacion_id?: string | null
          created_at?: string | null
          created_by?: string | null
          descripcion_general?: string | null
          fecha_inicio_preliminar?: string | null
          fecha_oferta?: string | null
          forma_pago?: string | null
          id?: string
          moneda?: string | null
          observaciones?: string | null
          plazo_pago?: string | null
          precio?: number | null
          proveedor_bubble_id?: string | null
          proveedor_id?: string | null
          proveedor_nombre?: string | null
          servicio_bubble_id?: string | null
          servicio_id?: string | null
          tenant_bubble_id?: string | null
          tenant_id: string
        }
        Update: {
          bubble_id?: string | null
          contacto_bubble_id?: string | null
          contacto_id?: string | null
          cotizacion_bubble_id?: string | null
          cotizacion_id?: string | null
          created_at?: string | null
          created_by?: string | null
          descripcion_general?: string | null
          fecha_inicio_preliminar?: string | null
          fecha_oferta?: string | null
          forma_pago?: string | null
          id?: string
          moneda?: string | null
          observaciones?: string | null
          plazo_pago?: string | null
          precio?: number | null
          proveedor_bubble_id?: string | null
          proveedor_id?: string | null
          proveedor_nombre?: string | null
          servicio_bubble_id?: string | null
          servicio_id?: string | null
          tenant_bubble_id?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cotizaciones_ofertas_proveedores_contacto_id_fkey"
            columns: ["contacto_id"]
            isOneToOne: false
            referencedRelation: "terceros_contactos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotizaciones_ofertas_proveedores_cotizacion_id_fkey"
            columns: ["cotizacion_id"]
            isOneToOne: false
            referencedRelation: "cotizaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotizaciones_ofertas_proveedores_cotizacion_id_fkey"
            columns: ["cotizacion_id"]
            isOneToOne: false
            referencedRelation: "view_valoraciones_ventas"
            referencedColumns: ["cotizacion_id"]
          },
          {
            foreignKeyName: "cotizaciones_ofertas_proveedores_proveedor_id_fkey"
            columns: ["proveedor_id"]
            isOneToOne: false
            referencedRelation: "terceros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotizaciones_ofertas_proveedores_servicio_id_fkey"
            columns: ["servicio_id"]
            isOneToOne: false
            referencedRelation: "servicios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotizaciones_ofertas_proveedores_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      document_types: {
        Row: {
          bubble_id: string | null
          category: Database["public"]["Enums"]["document_category"]
          code: string | null
          created_at: string
          created_by: string | null
          expiration_alert_days: number | null
          id: string
          is_active: boolean | null
          modified_at: string | null
          modified_by: string | null
          name: string
          tenant_id: string | null
        }
        Insert: {
          bubble_id?: string | null
          category?: Database["public"]["Enums"]["document_category"]
          code?: string | null
          created_at?: string
          created_by?: string | null
          expiration_alert_days?: number | null
          id?: string
          is_active?: boolean | null
          modified_at?: string | null
          modified_by?: string | null
          name: string
          tenant_id?: string | null
        }
        Update: {
          bubble_id?: string | null
          category?: Database["public"]["Enums"]["document_category"]
          code?: string | null
          created_at?: string
          created_by?: string | null
          expiration_alert_days?: number | null
          id?: string
          is_active?: boolean | null
          modified_at?: string | null
          modified_by?: string | null
          name?: string
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_types_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_types_modified_by_fkey"
            columns: ["modified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_types_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      factura_venta_pagos: {
        Row: {
          banco: string | null
          bubble_id: string
          comentarios: string | null
          created_at: string | null
          created_by: string | null
          factura_venta_id: string | null
          fecha_cobro: string | null
          id: string
          id_editor: string | null
          id_empresa: string | null
          moneda: string | null
          moneda_id: string | null
          monto_sol: number | null
          monto_usd: number | null
          tenant_id: string | null
          tipo_pago: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          banco?: string | null
          bubble_id: string
          comentarios?: string | null
          created_at?: string | null
          created_by?: string | null
          factura_venta_id?: string | null
          fecha_cobro?: string | null
          id?: string
          id_editor?: string | null
          id_empresa?: string | null
          moneda?: string | null
          moneda_id?: string | null
          monto_sol?: number | null
          monto_usd?: number | null
          tenant_id?: string | null
          tipo_pago?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          banco?: string | null
          bubble_id?: string
          comentarios?: string | null
          created_at?: string | null
          created_by?: string | null
          factura_venta_id?: string | null
          fecha_cobro?: string | null
          id?: string
          id_editor?: string | null
          id_empresa?: string | null
          moneda?: string | null
          moneda_id?: string | null
          monto_sol?: number | null
          monto_usd?: number | null
          tenant_id?: string | null
          tipo_pago?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "factura_venta_pagos_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      facturas_compra: {
        Row: {
          bubble_id: string
          codigo_factura: string | null
          codigo_valoracion: string | null
          cotizacion_contratista_id: string | null
          cotizacion_id: string | null
          created_at: string | null
          created_by: string | null
          detraccion_constancia: number | null
          detraccion_constancia_bubble: string | null
          detraccion_fecha_pago: string | null
          detraccion_fecha_pago_bubble: string | null
          detraccion_paga_por: string | null
          detraccion_paga_por_bubble: string | null
          detraccion_pago_monto_soles: number | null
          detraccion_pago_monto_soles_bubble: number | null
          detraccion_porcentaje: number | null
          detraccion_soles: number | null
          detraccion_usd: number | null
          dias_para_pago: number | null
          dias_para_pago_bubble: number | null
          editor_id: string | null
          esta_activa: boolean | null
          estado: string | null
          estado_pago: string | null
          estado_pago_bubble: string | null
          factura_paga: boolean | null
          factura_paga_bubble: boolean | null
          fecha_factura: string | null
          fecha_factura_bubble: string | null
          fecha_valorado: string | null
          fecha_vencimiento: string | null
          fecha_vencimiento_bubble: string | null
          id: string
          igv_monto: number | null
          igv_porcentaje: number | null
          lista_cobros: string[] | null
          lista_items: string[] | null
          maquinaria_id: string | null
          moneda_id: string | null
          monto_a_cobrar_soles: number | null
          monto_a_cobrar_usd: number | null
          monto_pagado_soles: number | null
          monto_pagado_usd: number | null
          pdf_factura: string | null
          pdf_factura_url: string | null
          pdf_valorizacion: string | null
          pendiente_por_cobrar_sol: number | null
          pendiente_por_cobrar_usd: number | null
          proveedor_id: string | null
          subtotal: number | null
          tasa_cambio_id: string | null
          tenant_id: string | null
          total_cant_facturar: number | null
          total_horas: number | null
          total_sol: number | null
          total_usd: number | null
          updated_at: string | null
        }
        Insert: {
          bubble_id: string
          codigo_factura?: string | null
          codigo_valoracion?: string | null
          cotizacion_contratista_id?: string | null
          cotizacion_id?: string | null
          created_at?: string | null
          created_by?: string | null
          detraccion_constancia?: number | null
          detraccion_constancia_bubble?: string | null
          detraccion_fecha_pago?: string | null
          detraccion_fecha_pago_bubble?: string | null
          detraccion_paga_por?: string | null
          detraccion_paga_por_bubble?: string | null
          detraccion_pago_monto_soles?: number | null
          detraccion_pago_monto_soles_bubble?: number | null
          detraccion_porcentaje?: number | null
          detraccion_soles?: number | null
          detraccion_usd?: number | null
          dias_para_pago?: number | null
          dias_para_pago_bubble?: number | null
          editor_id?: string | null
          esta_activa?: boolean | null
          estado?: string | null
          estado_pago?: string | null
          estado_pago_bubble?: string | null
          factura_paga?: boolean | null
          factura_paga_bubble?: boolean | null
          fecha_factura?: string | null
          fecha_factura_bubble?: string | null
          fecha_valorado?: string | null
          fecha_vencimiento?: string | null
          fecha_vencimiento_bubble?: string | null
          id?: string
          igv_monto?: number | null
          igv_porcentaje?: number | null
          lista_cobros?: string[] | null
          lista_items?: string[] | null
          maquinaria_id?: string | null
          moneda_id?: string | null
          monto_a_cobrar_soles?: number | null
          monto_a_cobrar_usd?: number | null
          monto_pagado_soles?: number | null
          monto_pagado_usd?: number | null
          pdf_factura?: string | null
          pdf_factura_url?: string | null
          pdf_valorizacion?: string | null
          pendiente_por_cobrar_sol?: number | null
          pendiente_por_cobrar_usd?: number | null
          proveedor_id?: string | null
          subtotal?: number | null
          tasa_cambio_id?: string | null
          tenant_id?: string | null
          total_cant_facturar?: number | null
          total_horas?: number | null
          total_sol?: number | null
          total_usd?: number | null
          updated_at?: string | null
        }
        Update: {
          bubble_id?: string
          codigo_factura?: string | null
          codigo_valoracion?: string | null
          cotizacion_contratista_id?: string | null
          cotizacion_id?: string | null
          created_at?: string | null
          created_by?: string | null
          detraccion_constancia?: number | null
          detraccion_constancia_bubble?: string | null
          detraccion_fecha_pago?: string | null
          detraccion_fecha_pago_bubble?: string | null
          detraccion_paga_por?: string | null
          detraccion_paga_por_bubble?: string | null
          detraccion_pago_monto_soles?: number | null
          detraccion_pago_monto_soles_bubble?: number | null
          detraccion_porcentaje?: number | null
          detraccion_soles?: number | null
          detraccion_usd?: number | null
          dias_para_pago?: number | null
          dias_para_pago_bubble?: number | null
          editor_id?: string | null
          esta_activa?: boolean | null
          estado?: string | null
          estado_pago?: string | null
          estado_pago_bubble?: string | null
          factura_paga?: boolean | null
          factura_paga_bubble?: boolean | null
          fecha_factura?: string | null
          fecha_factura_bubble?: string | null
          fecha_valorado?: string | null
          fecha_vencimiento?: string | null
          fecha_vencimiento_bubble?: string | null
          id?: string
          igv_monto?: number | null
          igv_porcentaje?: number | null
          lista_cobros?: string[] | null
          lista_items?: string[] | null
          maquinaria_id?: string | null
          moneda_id?: string | null
          monto_a_cobrar_soles?: number | null
          monto_a_cobrar_usd?: number | null
          monto_pagado_soles?: number | null
          monto_pagado_usd?: number | null
          pdf_factura?: string | null
          pdf_factura_url?: string | null
          pdf_valorizacion?: string | null
          pendiente_por_cobrar_sol?: number | null
          pendiente_por_cobrar_usd?: number | null
          proveedor_id?: string | null
          subtotal?: number | null
          tasa_cambio_id?: string | null
          tenant_id?: string | null
          total_cant_facturar?: number | null
          total_horas?: number | null
          total_sol?: number | null
          total_usd?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      facturas_compra_item: {
        Row: {
          bubble_id: string
          cant_facturar: number | null
          codigo_virtual: string | null
          concepto: string | null
          created_at: string | null
          created_by: string | null
          editor_id: string | null
          estado: string | null
          factura_id: string | null
          horas_total: number | null
          id: string
          maquinaria_reporte_id: string | null
          precio_unitario: number | null
          servicio_id: string | null
          subtotal: number | null
          tenant_id: string | null
          total_soles: number | null
          total_usd: number | null
          updated_at: string | null
        }
        Insert: {
          bubble_id: string
          cant_facturar?: number | null
          codigo_virtual?: string | null
          concepto?: string | null
          created_at?: string | null
          created_by?: string | null
          editor_id?: string | null
          estado?: string | null
          factura_id?: string | null
          horas_total?: number | null
          id?: string
          maquinaria_reporte_id?: string | null
          precio_unitario?: number | null
          servicio_id?: string | null
          subtotal?: number | null
          tenant_id?: string | null
          total_soles?: number | null
          total_usd?: number | null
          updated_at?: string | null
        }
        Update: {
          bubble_id?: string
          cant_facturar?: number | null
          codigo_virtual?: string | null
          concepto?: string | null
          created_at?: string | null
          created_by?: string | null
          editor_id?: string | null
          estado?: string | null
          factura_id?: string | null
          horas_total?: number | null
          id?: string
          maquinaria_reporte_id?: string | null
          precio_unitario?: number | null
          servicio_id?: string | null
          subtotal?: number | null
          tenant_id?: string | null
          total_soles?: number | null
          total_usd?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      facturas_compra_pagos: {
        Row: {
          banco: string | null
          bubble_id: string
          comentarios: string | null
          created_at: string | null
          created_by: string | null
          factura_compra_id: string | null
          fecha_cobro: string | null
          id: string
          id_editor: string | null
          moneda: string | null
          moneda_id: string | null
          monto_sol: number | null
          monto_usd: number | null
          tenant_id: string | null
          tipo_pago: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          banco?: string | null
          bubble_id: string
          comentarios?: string | null
          created_at?: string | null
          created_by?: string | null
          factura_compra_id?: string | null
          fecha_cobro?: string | null
          id?: string
          id_editor?: string | null
          moneda?: string | null
          moneda_id?: string | null
          monto_sol?: number | null
          monto_usd?: number | null
          tenant_id?: string | null
          tipo_pago?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          banco?: string | null
          bubble_id?: string
          comentarios?: string | null
          created_at?: string | null
          created_by?: string | null
          factura_compra_id?: string | null
          fecha_cobro?: string | null
          id?: string
          id_editor?: string | null
          moneda?: string | null
          moneda_id?: string | null
          monto_sol?: number | null
          monto_usd?: number | null
          tenant_id?: string | null
          tipo_pago?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      facturas_venta: {
        Row: {
          bubble_id: string
          cliente_id: string | null
          codigo_factura: string | null
          codigo_valoracion: string | null
          cotizacion_id: string | null
          created_at: string | null
          created_by: string | null
          deshabilitada: boolean | null
          detraccion_a_cargo_de: string | null
          detraccion_constancia: string | null
          detraccion_fecha_pago: string | null
          detraccion_monto_sol: number | null
          detraccion_numero_constancia: string | null
          detraccion_paga_por: string | null
          detraccion_porcentaje: number | null
          detraccion_soles: number | null
          detraccion_usd: number | null
          dias_para_pago: number | null
          editor_id: string | null
          esta_activa: boolean | null
          estado: string | null
          estado_pago: string | null
          fecha_factura: string | null
          fecha_valorado: string | null
          fecha_vencimiento: string | null
          id: string
          igv_monto: number | null
          igv_porcentaje: number | null
          lista_items: string[] | null
          margen: number | null
          margen_porcentaje: number | null
          monto_a_cobrar_soles: number | null
          monto_a_cobrar_usd: number | null
          monto_pagado_detraccion: number | null
          monto_pagado_factura: number | null
          pdf_factura_url: string | null
          pdf_valorizacion: string | null
          pendiente_por_cobrar_sol: number | null
          pendiente_por_cobrar_usd: number | null
          subtotal: number | null
          tenant_id: string | null
          total_cant_facturar: number | null
          total_horas: number | null
          total_usd: number | null
          updated_at: string | null
          varias_valoraciones: boolean | null
          vendedor_id: string | null
        }
        Insert: {
          bubble_id: string
          cliente_id?: string | null
          codigo_factura?: string | null
          codigo_valoracion?: string | null
          cotizacion_id?: string | null
          created_at?: string | null
          created_by?: string | null
          deshabilitada?: boolean | null
          detraccion_a_cargo_de?: string | null
          detraccion_constancia?: string | null
          detraccion_fecha_pago?: string | null
          detraccion_monto_sol?: number | null
          detraccion_numero_constancia?: string | null
          detraccion_paga_por?: string | null
          detraccion_porcentaje?: number | null
          detraccion_soles?: number | null
          detraccion_usd?: number | null
          dias_para_pago?: number | null
          editor_id?: string | null
          esta_activa?: boolean | null
          estado?: string | null
          estado_pago?: string | null
          fecha_factura?: string | null
          fecha_valorado?: string | null
          fecha_vencimiento?: string | null
          id?: string
          igv_monto?: number | null
          igv_porcentaje?: number | null
          lista_items?: string[] | null
          margen?: number | null
          margen_porcentaje?: number | null
          monto_a_cobrar_soles?: number | null
          monto_a_cobrar_usd?: number | null
          monto_pagado_detraccion?: number | null
          monto_pagado_factura?: number | null
          pdf_factura_url?: string | null
          pdf_valorizacion?: string | null
          pendiente_por_cobrar_sol?: number | null
          pendiente_por_cobrar_usd?: number | null
          subtotal?: number | null
          tenant_id?: string | null
          total_cant_facturar?: number | null
          total_horas?: number | null
          total_usd?: number | null
          updated_at?: string | null
          varias_valoraciones?: boolean | null
          vendedor_id?: string | null
        }
        Update: {
          bubble_id?: string
          cliente_id?: string | null
          codigo_factura?: string | null
          codigo_valoracion?: string | null
          cotizacion_id?: string | null
          created_at?: string | null
          created_by?: string | null
          deshabilitada?: boolean | null
          detraccion_a_cargo_de?: string | null
          detraccion_constancia?: string | null
          detraccion_fecha_pago?: string | null
          detraccion_monto_sol?: number | null
          detraccion_numero_constancia?: string | null
          detraccion_paga_por?: string | null
          detraccion_porcentaje?: number | null
          detraccion_soles?: number | null
          detraccion_usd?: number | null
          dias_para_pago?: number | null
          editor_id?: string | null
          esta_activa?: boolean | null
          estado?: string | null
          estado_pago?: string | null
          fecha_factura?: string | null
          fecha_valorado?: string | null
          fecha_vencimiento?: string | null
          id?: string
          igv_monto?: number | null
          igv_porcentaje?: number | null
          lista_items?: string[] | null
          margen?: number | null
          margen_porcentaje?: number | null
          monto_a_cobrar_soles?: number | null
          monto_a_cobrar_usd?: number | null
          monto_pagado_detraccion?: number | null
          monto_pagado_factura?: number | null
          pdf_factura_url?: string | null
          pdf_valorizacion?: string | null
          pendiente_por_cobrar_sol?: number | null
          pendiente_por_cobrar_usd?: number | null
          subtotal?: number | null
          tenant_id?: string | null
          total_cant_facturar?: number | null
          total_horas?: number | null
          total_usd?: number | null
          updated_at?: string | null
          varias_valoraciones?: boolean | null
          vendedor_id?: string | null
        }
        Relationships: []
      }
      facturas_venta_item: {
        Row: {
          bubble_id: string
          cant_facturar: number | null
          capacidad: string | null
          codigo_virtual: string | null
          concepto: string | null
          created_at: string | null
          created_by: string | null
          editor_id: string | null
          estado: string | null
          factura_venta_id: string | null
          horas_total: number | null
          id: string
          maquinaria_id: string | null
          maquinaria_reporte_id: string | null
          minimo: number | null
          precio_unitario: number | null
          servicio_id: string | null
          subtotal: number | null
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          bubble_id: string
          cant_facturar?: number | null
          capacidad?: string | null
          codigo_virtual?: string | null
          concepto?: string | null
          created_at?: string | null
          created_by?: string | null
          editor_id?: string | null
          estado?: string | null
          factura_venta_id?: string | null
          horas_total?: number | null
          id?: string
          maquinaria_id?: string | null
          maquinaria_reporte_id?: string | null
          minimo?: number | null
          precio_unitario?: number | null
          servicio_id?: string | null
          subtotal?: number | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          bubble_id?: string
          cant_facturar?: number | null
          capacidad?: string | null
          codigo_virtual?: string | null
          concepto?: string | null
          created_at?: string | null
          created_by?: string | null
          editor_id?: string | null
          estado?: string | null
          factura_venta_id?: string | null
          horas_total?: number | null
          id?: string
          maquinaria_id?: string | null
          maquinaria_reporte_id?: string | null
          minimo?: number | null
          precio_unitario?: number | null
          servicio_id?: string | null
          subtotal?: number | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      file_migration_log: {
        Row: {
          attempts: number
          bubble_url: string
          content_type: string | null
          created_at: string
          error: string | null
          field: string
          public_url: string | null
          row_id: string
          size_bytes: number | null
          status: string
          storage_bucket: string | null
          storage_path: string | null
          table_name: string
          updated_at: string
        }
        Insert: {
          attempts?: number
          bubble_url: string
          content_type?: string | null
          created_at?: string
          error?: string | null
          field: string
          public_url?: string | null
          row_id: string
          size_bytes?: number | null
          status?: string
          storage_bucket?: string | null
          storage_path?: string | null
          table_name: string
          updated_at?: string
        }
        Update: {
          attempts?: number
          bubble_url?: string
          content_type?: string | null
          created_at?: string
          error?: string | null
          field?: string
          public_url?: string | null
          row_id?: string
          size_bytes?: number | null
          status?: string
          storage_bucket?: string | null
          storage_path?: string | null
          table_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      formas_pago: {
        Row: {
          bubble_id: string | null
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          nombre: string
          tenant_id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          bubble_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          nombre: string
          tenant_id: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          bubble_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          nombre?: string
          tenant_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "formas_pago_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      formatos: {
        Row: {
          bubble_id: string | null
          codigo: string
          created_at: string
          created_by: string | null
          descripcion: string | null
          id: string
          is_active: boolean
          nombre: string
          tenant_id: string
          updated_at: string | null
          updated_by: string | null
          version_actual_id: string | null
        }
        Insert: {
          bubble_id?: string | null
          codigo: string
          created_at?: string
          created_by?: string | null
          descripcion?: string | null
          id?: string
          is_active?: boolean
          nombre: string
          tenant_id: string
          updated_at?: string | null
          updated_by?: string | null
          version_actual_id?: string | null
        }
        Update: {
          bubble_id?: string | null
          codigo?: string
          created_at?: string
          created_by?: string | null
          descripcion?: string | null
          id?: string
          is_active?: boolean
          nombre?: string
          tenant_id?: string
          updated_at?: string | null
          updated_by?: string | null
          version_actual_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "formatos_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "formatos_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "formatos_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "formatos_version_actual_fkey"
            columns: ["version_actual_id"]
            isOneToOne: false
            referencedRelation: "formatos_versiones"
            referencedColumns: ["id"]
          },
        ]
      }
      formatos_correlativos: {
        Row: {
          anio: number
          formato_codigo: string
          tenant_id: string
          ultimo_numero: number
          updated_at: string
        }
        Insert: {
          anio: number
          formato_codigo: string
          tenant_id: string
          ultimo_numero?: number
          updated_at?: string
        }
        Update: {
          anio?: number
          formato_codigo?: string
          tenant_id?: string
          ultimo_numero?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "formatos_correlativos_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      formatos_informes: {
        Row: {
          app_version: string | null
          aprobado_at: string | null
          aprobado_por: string | null
          bubble_id: string | null
          cliente_id: string | null
          cliente_snapshot: Json | null
          codigo_informe: string | null
          contacto_id: string | null
          contacto_snapshot: Json | null
          correlativo_asignado_at: string | null
          cotizacion_id: string | null
          cotizacion_snapshot: Json | null
          created_at: string
          created_by: string | null
          dispositivo_id: string | null
          enviado_at: string | null
          estado: string
          fecha_fin: string | null
          fecha_inicio: string | null
          firma_hash: string | null
          firma_metadata: Json | null
          firma_url: string | null
          firmante_profile_id: string | null
          firmante_snapshot: Json | null
          id: string
          is_active: boolean
          numero_correlativo: number | null
          observaciones: string | null
          pdf_generado_at: string | null
          pdf_url: string | null
          pin_validado_at: string | null
          razon_rechazo: string | null
          rechazado_at: string | null
          rechazado_por: string | null
          sincronizado_at: string | null
          sitio_descripcion_override: string | null
          sitio_id: string | null
          sitio_snapshot: Json | null
          tarea_codigo_override: string | null
          tarea_descripcion_override: string | null
          tarea_id: string | null
          tarea_snapshot: Json | null
          tenant_id: string
          updated_at: string | null
          updated_by: string | null
          uuid_local: string | null
          version_id: string
        }
        Insert: {
          app_version?: string | null
          aprobado_at?: string | null
          aprobado_por?: string | null
          bubble_id?: string | null
          cliente_id?: string | null
          cliente_snapshot?: Json | null
          codigo_informe?: string | null
          contacto_id?: string | null
          contacto_snapshot?: Json | null
          correlativo_asignado_at?: string | null
          cotizacion_id?: string | null
          cotizacion_snapshot?: Json | null
          created_at?: string
          created_by?: string | null
          dispositivo_id?: string | null
          enviado_at?: string | null
          estado?: string
          fecha_fin?: string | null
          fecha_inicio?: string | null
          firma_hash?: string | null
          firma_metadata?: Json | null
          firma_url?: string | null
          firmante_profile_id?: string | null
          firmante_snapshot?: Json | null
          id?: string
          is_active?: boolean
          numero_correlativo?: number | null
          observaciones?: string | null
          pdf_generado_at?: string | null
          pdf_url?: string | null
          pin_validado_at?: string | null
          razon_rechazo?: string | null
          rechazado_at?: string | null
          rechazado_por?: string | null
          sincronizado_at?: string | null
          sitio_descripcion_override?: string | null
          sitio_id?: string | null
          sitio_snapshot?: Json | null
          tarea_codigo_override?: string | null
          tarea_descripcion_override?: string | null
          tarea_id?: string | null
          tarea_snapshot?: Json | null
          tenant_id: string
          updated_at?: string | null
          updated_by?: string | null
          uuid_local?: string | null
          version_id: string
        }
        Update: {
          app_version?: string | null
          aprobado_at?: string | null
          aprobado_por?: string | null
          bubble_id?: string | null
          cliente_id?: string | null
          cliente_snapshot?: Json | null
          codigo_informe?: string | null
          contacto_id?: string | null
          contacto_snapshot?: Json | null
          correlativo_asignado_at?: string | null
          cotizacion_id?: string | null
          cotizacion_snapshot?: Json | null
          created_at?: string
          created_by?: string | null
          dispositivo_id?: string | null
          enviado_at?: string | null
          estado?: string
          fecha_fin?: string | null
          fecha_inicio?: string | null
          firma_hash?: string | null
          firma_metadata?: Json | null
          firma_url?: string | null
          firmante_profile_id?: string | null
          firmante_snapshot?: Json | null
          id?: string
          is_active?: boolean
          numero_correlativo?: number | null
          observaciones?: string | null
          pdf_generado_at?: string | null
          pdf_url?: string | null
          pin_validado_at?: string | null
          razon_rechazo?: string | null
          rechazado_at?: string | null
          rechazado_por?: string | null
          sincronizado_at?: string | null
          sitio_descripcion_override?: string | null
          sitio_id?: string | null
          sitio_snapshot?: Json | null
          tarea_codigo_override?: string | null
          tarea_descripcion_override?: string | null
          tarea_id?: string | null
          tarea_snapshot?: Json | null
          tenant_id?: string
          updated_at?: string | null
          updated_by?: string | null
          uuid_local?: string | null
          version_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "formatos_informes_aprobado_por_fkey"
            columns: ["aprobado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "formatos_informes_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "terceros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "formatos_informes_contacto_id_fkey"
            columns: ["contacto_id"]
            isOneToOne: false
            referencedRelation: "terceros_contactos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "formatos_informes_cotizacion_id_fkey"
            columns: ["cotizacion_id"]
            isOneToOne: false
            referencedRelation: "cotizaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "formatos_informes_cotizacion_id_fkey"
            columns: ["cotizacion_id"]
            isOneToOne: false
            referencedRelation: "view_valoraciones_ventas"
            referencedColumns: ["cotizacion_id"]
          },
          {
            foreignKeyName: "formatos_informes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "formatos_informes_firmante_profile_id_fkey"
            columns: ["firmante_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "formatos_informes_rechazado_por_fkey"
            columns: ["rechazado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "formatos_informes_sitio_id_fkey"
            columns: ["sitio_id"]
            isOneToOne: false
            referencedRelation: "terceros_sitios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "formatos_informes_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "tareas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "formatos_informes_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_app_historial"
            referencedColumns: ["tarea_id"]
          },
          {
            foreignKeyName: "formatos_informes_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_app_plan"
            referencedColumns: ["tarea_id"]
          },
          {
            foreignKeyName: "formatos_informes_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_tareas_agenda_diaria"
            referencedColumns: ["tarea_id"]
          },
          {
            foreignKeyName: "formatos_informes_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_valoraciones_compras"
            referencedColumns: ["tarea_id"]
          },
          {
            foreignKeyName: "formatos_informes_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_valoraciones_ventas"
            referencedColumns: ["tarea_id"]
          },
          {
            foreignKeyName: "formatos_informes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "formatos_informes_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "formatos_informes_version_id_fkey"
            columns: ["version_id"]
            isOneToOne: false
            referencedRelation: "formatos_versiones"
            referencedColumns: ["id"]
          },
        ]
      }
      formatos_informes_comentarios: {
        Row: {
          autor_profile_id: string | null
          autor_tipo: string
          created_at: string
          id: string
          informe_id: string
          is_active: boolean
          pregunta_id: string | null
          tenant_id: string
          texto: string
        }
        Insert: {
          autor_profile_id?: string | null
          autor_tipo: string
          created_at?: string
          id?: string
          informe_id: string
          is_active?: boolean
          pregunta_id?: string | null
          tenant_id: string
          texto: string
        }
        Update: {
          autor_profile_id?: string | null
          autor_tipo?: string
          created_at?: string
          id?: string
          informe_id?: string
          is_active?: boolean
          pregunta_id?: string | null
          tenant_id?: string
          texto?: string
        }
        Relationships: [
          {
            foreignKeyName: "formatos_informes_comentarios_autor_profile_id_fkey"
            columns: ["autor_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "formatos_informes_comentarios_informe_id_fkey"
            columns: ["informe_id"]
            isOneToOne: false
            referencedRelation: "formatos_informes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "formatos_informes_comentarios_pregunta_id_fkey"
            columns: ["pregunta_id"]
            isOneToOne: false
            referencedRelation: "formatos_preguntas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "formatos_informes_comentarios_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      formatos_informes_maquinarias: {
        Row: {
          created_at: string
          id: string
          informe_id: string
          maquinaria_id: string
          maquinaria_snapshot: Json
          orden: number
          tenant_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          informe_id: string
          maquinaria_id: string
          maquinaria_snapshot: Json
          orden?: number
          tenant_id: string
        }
        Update: {
          created_at?: string
          id?: string
          informe_id?: string
          maquinaria_id?: string
          maquinaria_snapshot?: Json
          orden?: number
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "formatos_informes_maquinarias_informe_id_fkey"
            columns: ["informe_id"]
            isOneToOne: false
            referencedRelation: "formatos_informes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "formatos_informes_maquinarias_maquinaria_id_fkey"
            columns: ["maquinaria_id"]
            isOneToOne: false
            referencedRelation: "maquinarias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "formatos_informes_maquinarias_maquinaria_id_fkey"
            columns: ["maquinaria_id"]
            isOneToOne: false
            referencedRelation: "view_valoraciones_compras"
            referencedColumns: ["maquinaria_id"]
          },
          {
            foreignKeyName: "formatos_informes_maquinarias_maquinaria_id_fkey"
            columns: ["maquinaria_id"]
            isOneToOne: false
            referencedRelation: "view_valoraciones_ventas"
            referencedColumns: ["maquinaria_id"]
          },
          {
            foreignKeyName: "formatos_informes_maquinarias_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      formatos_informes_personal: {
        Row: {
          created_at: string
          id: string
          informe_id: string
          orden: number
          personal_snapshot: Json
          profile_id: string | null
          rol_en_trabajo: string | null
          tenant_id: string
          terceros_personal_id: string | null
          tipo_personal: string
        }
        Insert: {
          created_at?: string
          id?: string
          informe_id: string
          orden?: number
          personal_snapshot: Json
          profile_id?: string | null
          rol_en_trabajo?: string | null
          tenant_id: string
          terceros_personal_id?: string | null
          tipo_personal: string
        }
        Update: {
          created_at?: string
          id?: string
          informe_id?: string
          orden?: number
          personal_snapshot?: Json
          profile_id?: string | null
          rol_en_trabajo?: string | null
          tenant_id?: string
          terceros_personal_id?: string | null
          tipo_personal?: string
        }
        Relationships: [
          {
            foreignKeyName: "formatos_informes_personal_informe_id_fkey"
            columns: ["informe_id"]
            isOneToOne: false
            referencedRelation: "formatos_informes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "formatos_informes_personal_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "formatos_informes_personal_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "formatos_informes_personal_terceros_personal_id_fkey"
            columns: ["terceros_personal_id"]
            isOneToOne: false
            referencedRelation: "terceros_personal"
            referencedColumns: ["id"]
          },
        ]
      }
      formatos_informes_respuestas: {
        Row: {
          created_at: string
          id: string
          informe_id: string
          nota: string | null
          opcion_id: string | null
          opciones_ids: string[] | null
          pregunta_id: string
          tenant_id: string
          valor_booleano: boolean | null
          valor_fecha: string | null
          valor_foto_url: string | null
          valor_numero: number | null
          valor_texto: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          informe_id: string
          nota?: string | null
          opcion_id?: string | null
          opciones_ids?: string[] | null
          pregunta_id: string
          tenant_id: string
          valor_booleano?: boolean | null
          valor_fecha?: string | null
          valor_foto_url?: string | null
          valor_numero?: number | null
          valor_texto?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          informe_id?: string
          nota?: string | null
          opcion_id?: string | null
          opciones_ids?: string[] | null
          pregunta_id?: string
          tenant_id?: string
          valor_booleano?: boolean | null
          valor_fecha?: string | null
          valor_foto_url?: string | null
          valor_numero?: number | null
          valor_texto?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "formatos_informes_respuestas_informe_id_fkey"
            columns: ["informe_id"]
            isOneToOne: false
            referencedRelation: "formatos_informes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "formatos_informes_respuestas_opcion_id_fkey"
            columns: ["opcion_id"]
            isOneToOne: false
            referencedRelation: "formatos_opciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "formatos_informes_respuestas_pregunta_id_fkey"
            columns: ["pregunta_id"]
            isOneToOne: false
            referencedRelation: "formatos_preguntas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "formatos_informes_respuestas_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      formatos_opciones: {
        Row: {
          created_at: string
          es_conforme: boolean | null
          etiqueta: string
          id: string
          is_active: boolean
          orden: number
          pregunta_id: string
          tenant_id: string
          valor: string
        }
        Insert: {
          created_at?: string
          es_conforme?: boolean | null
          etiqueta: string
          id?: string
          is_active?: boolean
          orden: number
          pregunta_id: string
          tenant_id: string
          valor: string
        }
        Update: {
          created_at?: string
          es_conforme?: boolean | null
          etiqueta?: string
          id?: string
          is_active?: boolean
          orden?: number
          pregunta_id?: string
          tenant_id?: string
          valor?: string
        }
        Relationships: [
          {
            foreignKeyName: "formatos_opciones_pregunta_id_fkey"
            columns: ["pregunta_id"]
            isOneToOne: false
            referencedRelation: "formatos_preguntas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "formatos_opciones_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      formatos_preguntas: {
        Row: {
          bubble_id: string | null
          created_at: string
          fuente_foto: string | null
          id: string
          is_active: boolean
          orden: number
          permite_nota: boolean
          requerida: boolean
          seccion: string | null
          tenant_id: string
          texto: string
          texto_ayuda: string | null
          tipo: string
          updated_at: string | null
          version_id: string
        }
        Insert: {
          bubble_id?: string | null
          created_at?: string
          fuente_foto?: string | null
          id?: string
          is_active?: boolean
          orden: number
          permite_nota?: boolean
          requerida?: boolean
          seccion?: string | null
          tenant_id: string
          texto: string
          texto_ayuda?: string | null
          tipo?: string
          updated_at?: string | null
          version_id: string
        }
        Update: {
          bubble_id?: string | null
          created_at?: string
          fuente_foto?: string | null
          id?: string
          is_active?: boolean
          orden?: number
          permite_nota?: boolean
          requerida?: boolean
          seccion?: string | null
          tenant_id?: string
          texto?: string
          texto_ayuda?: string | null
          tipo?: string
          updated_at?: string | null
          version_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "formatos_preguntas_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "formatos_preguntas_version_id_fkey"
            columns: ["version_id"]
            isOneToOne: false
            referencedRelation: "formatos_versiones"
            referencedColumns: ["id"]
          },
        ]
      }
      formatos_versiones: {
        Row: {
          created_at: string
          created_by: string | null
          estado: string
          etiqueta_version: string | null
          formato_id: string
          id: string
          is_active: boolean
          min_app_version: string | null
          muestra_bloque_cliente: boolean
          muestra_bloque_cotizacion: boolean
          muestra_bloque_empresa: boolean
          muestra_bloque_firma: boolean
          muestra_bloque_observaciones: boolean
          muestra_bloque_tarea: boolean
          numero_version: number
          publicado_at: string | null
          requisito_maquinaria: string
          requisito_personal: string
          tenant_id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          estado?: string
          etiqueta_version?: string | null
          formato_id: string
          id?: string
          is_active?: boolean
          min_app_version?: string | null
          muestra_bloque_cliente?: boolean
          muestra_bloque_cotizacion?: boolean
          muestra_bloque_empresa?: boolean
          muestra_bloque_firma?: boolean
          muestra_bloque_observaciones?: boolean
          muestra_bloque_tarea?: boolean
          numero_version: number
          publicado_at?: string | null
          requisito_maquinaria?: string
          requisito_personal?: string
          tenant_id: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          estado?: string
          etiqueta_version?: string | null
          formato_id?: string
          id?: string
          is_active?: boolean
          min_app_version?: string | null
          muestra_bloque_cliente?: boolean
          muestra_bloque_cotizacion?: boolean
          muestra_bloque_empresa?: boolean
          muestra_bloque_firma?: boolean
          muestra_bloque_observaciones?: boolean
          muestra_bloque_tarea?: boolean
          numero_version?: number
          publicado_at?: string | null
          requisito_maquinaria?: string
          requisito_personal?: string
          tenant_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "formatos_versiones_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "formatos_versiones_formato_id_fkey"
            columns: ["formato_id"]
            isOneToOne: false
            referencedRelation: "formatos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "formatos_versiones_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "formatos_versiones_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      gastos_usuario: {
        Row: {
          almuerzo: number | null
          bubble_id: string | null
          cena: number | null
          created_at: string | null
          created_by: string | null
          desayuno: number | null
          id: string
          inspeccion_id: string | null
          movilidad: number | null
          otro: number | null
          pregunta_bubble_id: string | null
          profile_id: string | null
          tenant_id: string
          total: number | null
          updated_at: string | null
        }
        Insert: {
          almuerzo?: number | null
          bubble_id?: string | null
          cena?: number | null
          created_at?: string | null
          created_by?: string | null
          desayuno?: number | null
          id?: string
          inspeccion_id?: string | null
          movilidad?: number | null
          otro?: number | null
          pregunta_bubble_id?: string | null
          profile_id?: string | null
          tenant_id: string
          total?: number | null
          updated_at?: string | null
        }
        Update: {
          almuerzo?: number | null
          bubble_id?: string | null
          cena?: number | null
          created_at?: string | null
          created_by?: string | null
          desayuno?: number | null
          id?: string
          inspeccion_id?: string | null
          movilidad?: number | null
          otro?: number | null
          pregunta_bubble_id?: string | null
          profile_id?: string | null
          tenant_id?: string
          total?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gastos_usuario_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gastos_usuario_inspeccion_id_fkey"
            columns: ["inspeccion_id"]
            isOneToOne: false
            referencedRelation: "inspecciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gastos_usuario_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      informe_objetos: {
        Row: {
          bubble_id: string | null
          created_at: string | null
          created_by: string | null
          id: string
          maquinaria_id: string | null
          proveedor_id: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          bubble_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          maquinaria_id?: string | null
          proveedor_id?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          bubble_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          maquinaria_id?: string | null
          proveedor_id?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "informe_objetos_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "informe_objetos_maquinaria_id_fkey"
            columns: ["maquinaria_id"]
            isOneToOne: false
            referencedRelation: "maquinarias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "informe_objetos_maquinaria_id_fkey"
            columns: ["maquinaria_id"]
            isOneToOne: false
            referencedRelation: "view_valoraciones_compras"
            referencedColumns: ["maquinaria_id"]
          },
          {
            foreignKeyName: "informe_objetos_maquinaria_id_fkey"
            columns: ["maquinaria_id"]
            isOneToOne: false
            referencedRelation: "view_valoraciones_ventas"
            referencedColumns: ["maquinaria_id"]
          },
          {
            foreignKeyName: "informe_objetos_proveedor_id_fkey"
            columns: ["proveedor_id"]
            isOneToOne: false
            referencedRelation: "terceros"
            referencedColumns: ["id"]
          },
        ]
      }
      inspecciones: {
        Row: {
          archivo_nombre: string | null
          archivo_pdf_url: string | null
          bubble_id: string | null
          cliente_id: string | null
          codigo: string | null
          codigo_interno: string | null
          conductor_id: string | null
          cotizacion_id: string | null
          created_at: string | null
          created_by: string | null
          device_ref: string | null
          estado: string | null
          fecha_finalizacion: string | null
          fecha_inspeccion: string | null
          firma_conductor_url: string | null
          firma_supervisor_url: string | null
          foto_horometro_final_url: string | null
          foto_horometro_inicio_url: string | null
          foto_odometro_final_url: string | null
          foto_odometro_inicio_url: string | null
          foto_tablero_fin_url: string | null
          foto_tablero_inicio_url: string | null
          horometro_actual: number | null
          horometro_fin: number | null
          horometro_final: number | null
          horometro_inicio: number | null
          id: string
          is_active: boolean | null
          kilometraje_actual: number | null
          kilometraje_fin: number | null
          kilometraje_inicio: number | null
          km_final: number | null
          km_inicio: number | null
          maquinaria_id: string | null
          nivel_tanque_gasolina: number | null
          observaciones: string | null
          pdf_url: string | null
          plantilla_id: string | null
          puntaje: number | null
          supervisor_id: string | null
          tarea_id: string | null
          tenant_id: string
          tiene_fallas: boolean | null
          tiene_plan_de_accion: boolean | null
          tiene_respuestas_criticas: boolean | null
          tiene_respuestas_erroneas: boolean | null
          ubicacion_gps: Json | null
          updated_at: string | null
          version_formato: string | null
        }
        Insert: {
          archivo_nombre?: string | null
          archivo_pdf_url?: string | null
          bubble_id?: string | null
          cliente_id?: string | null
          codigo?: string | null
          codigo_interno?: string | null
          conductor_id?: string | null
          cotizacion_id?: string | null
          created_at?: string | null
          created_by?: string | null
          device_ref?: string | null
          estado?: string | null
          fecha_finalizacion?: string | null
          fecha_inspeccion?: string | null
          firma_conductor_url?: string | null
          firma_supervisor_url?: string | null
          foto_horometro_final_url?: string | null
          foto_horometro_inicio_url?: string | null
          foto_odometro_final_url?: string | null
          foto_odometro_inicio_url?: string | null
          foto_tablero_fin_url?: string | null
          foto_tablero_inicio_url?: string | null
          horometro_actual?: number | null
          horometro_fin?: number | null
          horometro_final?: number | null
          horometro_inicio?: number | null
          id?: string
          is_active?: boolean | null
          kilometraje_actual?: number | null
          kilometraje_fin?: number | null
          kilometraje_inicio?: number | null
          km_final?: number | null
          km_inicio?: number | null
          maquinaria_id?: string | null
          nivel_tanque_gasolina?: number | null
          observaciones?: string | null
          pdf_url?: string | null
          plantilla_id?: string | null
          puntaje?: number | null
          supervisor_id?: string | null
          tarea_id?: string | null
          tenant_id: string
          tiene_fallas?: boolean | null
          tiene_plan_de_accion?: boolean | null
          tiene_respuestas_criticas?: boolean | null
          tiene_respuestas_erroneas?: boolean | null
          ubicacion_gps?: Json | null
          updated_at?: string | null
          version_formato?: string | null
        }
        Update: {
          archivo_nombre?: string | null
          archivo_pdf_url?: string | null
          bubble_id?: string | null
          cliente_id?: string | null
          codigo?: string | null
          codigo_interno?: string | null
          conductor_id?: string | null
          cotizacion_id?: string | null
          created_at?: string | null
          created_by?: string | null
          device_ref?: string | null
          estado?: string | null
          fecha_finalizacion?: string | null
          fecha_inspeccion?: string | null
          firma_conductor_url?: string | null
          firma_supervisor_url?: string | null
          foto_horometro_final_url?: string | null
          foto_horometro_inicio_url?: string | null
          foto_odometro_final_url?: string | null
          foto_odometro_inicio_url?: string | null
          foto_tablero_fin_url?: string | null
          foto_tablero_inicio_url?: string | null
          horometro_actual?: number | null
          horometro_fin?: number | null
          horometro_final?: number | null
          horometro_inicio?: number | null
          id?: string
          is_active?: boolean | null
          kilometraje_actual?: number | null
          kilometraje_fin?: number | null
          kilometraje_inicio?: number | null
          km_final?: number | null
          km_inicio?: number | null
          maquinaria_id?: string | null
          nivel_tanque_gasolina?: number | null
          observaciones?: string | null
          pdf_url?: string | null
          plantilla_id?: string | null
          puntaje?: number | null
          supervisor_id?: string | null
          tarea_id?: string | null
          tenant_id?: string
          tiene_fallas?: boolean | null
          tiene_plan_de_accion?: boolean | null
          tiene_respuestas_criticas?: boolean | null
          tiene_respuestas_erroneas?: boolean | null
          ubicacion_gps?: Json | null
          updated_at?: string | null
          version_formato?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inspecciones_conductor_id_fkey"
            columns: ["conductor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspecciones_maquinaria_id_fkey"
            columns: ["maquinaria_id"]
            isOneToOne: false
            referencedRelation: "maquinarias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspecciones_maquinaria_id_fkey"
            columns: ["maquinaria_id"]
            isOneToOne: false
            referencedRelation: "view_valoraciones_compras"
            referencedColumns: ["maquinaria_id"]
          },
          {
            foreignKeyName: "inspecciones_maquinaria_id_fkey"
            columns: ["maquinaria_id"]
            isOneToOne: false
            referencedRelation: "view_valoraciones_ventas"
            referencedColumns: ["maquinaria_id"]
          },
          {
            foreignKeyName: "inspecciones_plantilla_id_fkey"
            columns: ["plantilla_id"]
            isOneToOne: false
            referencedRelation: "plantillas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspecciones_supervisor_id_fkey"
            columns: ["supervisor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspecciones_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "tareas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspecciones_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_app_historial"
            referencedColumns: ["tarea_id"]
          },
          {
            foreignKeyName: "inspecciones_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_app_plan"
            referencedColumns: ["tarea_id"]
          },
          {
            foreignKeyName: "inspecciones_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_tareas_agenda_diaria"
            referencedColumns: ["tarea_id"]
          },
          {
            foreignKeyName: "inspecciones_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_valoraciones_compras"
            referencedColumns: ["tarea_id"]
          },
          {
            foreignKeyName: "inspecciones_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_valoraciones_ventas"
            referencedColumns: ["tarea_id"]
          },
        ]
      }
      inspecciones_detalles: {
        Row: {
          bubble_id: string | null
          categoria: string | null
          comentario: string | null
          created_at: string | null
          created_by: string | null
          estado: string | null
          foto_url: string | null
          id: string
          inspeccion_id: string | null
          item: string | null
          obligatorio: boolean | null
          opciones_respuesta: Json | null
          orden: number | null
          pregunta_bubble_id: string | null
          prioridad: string | null
          puntaje: number | null
          respuesta_fecha: string | null
          respuesta_texto: string | null
          tenant_id: string
          tipo_pregunta: string | null
          updated_at: string | null
        }
        Insert: {
          bubble_id?: string | null
          categoria?: string | null
          comentario?: string | null
          created_at?: string | null
          created_by?: string | null
          estado?: string | null
          foto_url?: string | null
          id?: string
          inspeccion_id?: string | null
          item?: string | null
          obligatorio?: boolean | null
          opciones_respuesta?: Json | null
          orden?: number | null
          pregunta_bubble_id?: string | null
          prioridad?: string | null
          puntaje?: number | null
          respuesta_fecha?: string | null
          respuesta_texto?: string | null
          tenant_id: string
          tipo_pregunta?: string | null
          updated_at?: string | null
        }
        Update: {
          bubble_id?: string | null
          categoria?: string | null
          comentario?: string | null
          created_at?: string | null
          created_by?: string | null
          estado?: string | null
          foto_url?: string | null
          id?: string
          inspeccion_id?: string | null
          item?: string | null
          obligatorio?: boolean | null
          opciones_respuesta?: Json | null
          orden?: number | null
          pregunta_bubble_id?: string | null
          prioridad?: string | null
          puntaje?: number | null
          respuesta_fecha?: string | null
          respuesta_texto?: string | null
          tenant_id?: string
          tipo_pregunta?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inspecciones_detalles_inspeccion_id_fkey"
            columns: ["inspeccion_id"]
            isOneToOne: false
            referencedRelation: "inspecciones"
            referencedColumns: ["id"]
          },
        ]
      }
      job_titles: {
        Row: {
          bubble_id: string | null
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          name: string
          tenant_id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          bubble_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          tenant_id: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          bubble_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          tenant_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_titles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      maquinaria_documentos: {
        Row: {
          archivo_url: string | null
          bubble_id: string | null
          created_at: string | null
          created_by: string | null
          estado: string | null
          fecha_emision: string | null
          fecha_vencimiento: string | null
          id: string
          is_active: boolean | null
          maquinaria_id: string | null
          numero_doc: string | null
          tenant_id: string
          tipo_doc_id: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          archivo_url?: string | null
          bubble_id?: string | null
          created_at?: string | null
          created_by?: string | null
          estado?: string | null
          fecha_emision?: string | null
          fecha_vencimiento?: string | null
          id?: string
          is_active?: boolean | null
          maquinaria_id?: string | null
          numero_doc?: string | null
          tenant_id: string
          tipo_doc_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          archivo_url?: string | null
          bubble_id?: string | null
          created_at?: string | null
          created_by?: string | null
          estado?: string | null
          fecha_emision?: string | null
          fecha_vencimiento?: string | null
          id?: string
          is_active?: boolean | null
          maquinaria_id?: string | null
          numero_doc?: string | null
          tenant_id?: string
          tipo_doc_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maquinaria_documentos_maquinaria_id_fkey"
            columns: ["maquinaria_id"]
            isOneToOne: false
            referencedRelation: "maquinarias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maquinaria_documentos_maquinaria_id_fkey"
            columns: ["maquinaria_id"]
            isOneToOne: false
            referencedRelation: "view_valoraciones_compras"
            referencedColumns: ["maquinaria_id"]
          },
          {
            foreignKeyName: "maquinaria_documentos_maquinaria_id_fkey"
            columns: ["maquinaria_id"]
            isOneToOne: false
            referencedRelation: "view_valoraciones_ventas"
            referencedColumns: ["maquinaria_id"]
          },
          {
            foreignKeyName: "maquinaria_documentos_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maquinaria_documentos_tipo_doc_id_fkey"
            columns: ["tipo_doc_id"]
            isOneToOne: false
            referencedRelation: "maquinaria_tipos_docs"
            referencedColumns: ["id"]
          },
        ]
      }
      maquinaria_horas: {
        Row: {
          bubble_id: string | null
          cant_servicios: number | null
          cliente_id: string | null
          codigo: string | null
          cotizacion_item_id: string | null
          created_at: string | null
          created_by: string | null
          estado: string | null
          id: string
          inspeccion_id: string | null
          jornada1_fin: string | null
          jornada1_inicio: string | null
          jornada2_fin: string | null
          jornada2_inicio: string | null
          maquinaria_id: string | null
          tarea_id: string | null
          tenant_id: string
          tipo_recorrido: string | null
          total_horas_num: number | null
          total_horas_texto: string | null
          updated_at: string | null
        }
        Insert: {
          bubble_id?: string | null
          cant_servicios?: number | null
          cliente_id?: string | null
          codigo?: string | null
          cotizacion_item_id?: string | null
          created_at?: string | null
          created_by?: string | null
          estado?: string | null
          id?: string
          inspeccion_id?: string | null
          jornada1_fin?: string | null
          jornada1_inicio?: string | null
          jornada2_fin?: string | null
          jornada2_inicio?: string | null
          maquinaria_id?: string | null
          tarea_id?: string | null
          tenant_id: string
          tipo_recorrido?: string | null
          total_horas_num?: number | null
          total_horas_texto?: string | null
          updated_at?: string | null
        }
        Update: {
          bubble_id?: string | null
          cant_servicios?: number | null
          cliente_id?: string | null
          codigo?: string | null
          cotizacion_item_id?: string | null
          created_at?: string | null
          created_by?: string | null
          estado?: string | null
          id?: string
          inspeccion_id?: string | null
          jornada1_fin?: string | null
          jornada1_inicio?: string | null
          jornada2_fin?: string | null
          jornada2_inicio?: string | null
          maquinaria_id?: string | null
          tarea_id?: string | null
          tenant_id?: string
          tipo_recorrido?: string | null
          total_horas_num?: number | null
          total_horas_texto?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maquinaria_horas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "terceros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maquinaria_horas_cotizacion_item_id_fkey"
            columns: ["cotizacion_item_id"]
            isOneToOne: false
            referencedRelation: "cotizaciones_detalle"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maquinaria_horas_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maquinaria_horas_inspeccion_id_fkey"
            columns: ["inspeccion_id"]
            isOneToOne: false
            referencedRelation: "inspecciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maquinaria_horas_maquinaria_id_fkey"
            columns: ["maquinaria_id"]
            isOneToOne: false
            referencedRelation: "maquinarias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maquinaria_horas_maquinaria_id_fkey"
            columns: ["maquinaria_id"]
            isOneToOne: false
            referencedRelation: "view_valoraciones_compras"
            referencedColumns: ["maquinaria_id"]
          },
          {
            foreignKeyName: "maquinaria_horas_maquinaria_id_fkey"
            columns: ["maquinaria_id"]
            isOneToOne: false
            referencedRelation: "view_valoraciones_ventas"
            referencedColumns: ["maquinaria_id"]
          },
          {
            foreignKeyName: "maquinaria_horas_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "tareas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maquinaria_horas_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_app_historial"
            referencedColumns: ["tarea_id"]
          },
          {
            foreignKeyName: "maquinaria_horas_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_app_plan"
            referencedColumns: ["tarea_id"]
          },
          {
            foreignKeyName: "maquinaria_horas_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_tareas_agenda_diaria"
            referencedColumns: ["tarea_id"]
          },
          {
            foreignKeyName: "maquinaria_horas_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_valoraciones_compras"
            referencedColumns: ["tarea_id"]
          },
          {
            foreignKeyName: "maquinaria_horas_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_valoraciones_ventas"
            referencedColumns: ["tarea_id"]
          },
        ]
      }
      maquinaria_modelos: {
        Row: {
          bubble_id: string | null
          capacidad: string | null
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean | null
          marca: string
          modelo: string
          tenant_id: string
          tipo_equipo: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          bubble_id?: string | null
          capacidad?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          marca: string
          modelo: string
          tenant_id: string
          tipo_equipo: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          bubble_id?: string | null
          capacidad?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          marca?: string
          modelo?: string
          tenant_id?: string
          tipo_equipo?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      maquinaria_tipos_docs: {
        Row: {
          aplica_a: Database["public"]["Enums"]["doc_aplica_a"] | null
          bubble_id: string | null
          categoria: string | null
          categoria_equipo: string | null
          created_at: string | null
          created_by: string | null
          dias_alerta: number | null
          es_obligatorio: boolean | null
          id: string
          is_active: boolean | null
          modelo_id: string | null
          nombre: string
          requiere_vencimiento: boolean | null
          tenant_id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          aplica_a?: Database["public"]["Enums"]["doc_aplica_a"] | null
          bubble_id?: string | null
          categoria?: string | null
          categoria_equipo?: string | null
          created_at?: string | null
          created_by?: string | null
          dias_alerta?: number | null
          es_obligatorio?: boolean | null
          id?: string
          is_active?: boolean | null
          modelo_id?: string | null
          nombre: string
          requiere_vencimiento?: boolean | null
          tenant_id: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          aplica_a?: Database["public"]["Enums"]["doc_aplica_a"] | null
          bubble_id?: string | null
          categoria?: string | null
          categoria_equipo?: string | null
          created_at?: string | null
          created_by?: string | null
          dias_alerta?: number | null
          es_obligatorio?: boolean | null
          id?: string
          is_active?: boolean | null
          modelo_id?: string | null
          nombre?: string
          requiere_vencimiento?: boolean | null
          tenant_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maquinaria_tipos_docs_modelo_id_fkey"
            columns: ["modelo_id"]
            isOneToOne: false
            referencedRelation: "maquinaria_modelos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maquinaria_tipos_docs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      maquinarias: {
        Row: {
          anio_fabricacion: number | null
          bubble_id: string | null
          capacidad: string | null
          categoria: string | null
          codigo_interno: string | null
          con_informes: boolean | null
          created_at: string | null
          created_by: string | null
          estado: Database["public"]["Enums"]["maquinaria_estado"] | null
          foto_url: string | null
          habilitado: boolean | null
          hoja_vida_url: string | null
          id: string
          is_active: boolean | null
          marca: string | null
          modelo: string | null
          modelo_id: string | null
          nombre: string
          placa: string | null
          propiedad_proveedor: boolean | null
          propietario:
            | Database["public"]["Enums"]["maquinaria_propietario"]
            | null
          propietario_id: string | null
          proveedor_id: string | null
          qr_url: string | null
          tenant_id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          anio_fabricacion?: number | null
          bubble_id?: string | null
          capacidad?: string | null
          categoria?: string | null
          codigo_interno?: string | null
          con_informes?: boolean | null
          created_at?: string | null
          created_by?: string | null
          estado?: Database["public"]["Enums"]["maquinaria_estado"] | null
          foto_url?: string | null
          habilitado?: boolean | null
          hoja_vida_url?: string | null
          id?: string
          is_active?: boolean | null
          marca?: string | null
          modelo?: string | null
          modelo_id?: string | null
          nombre: string
          placa?: string | null
          propiedad_proveedor?: boolean | null
          propietario?:
            | Database["public"]["Enums"]["maquinaria_propietario"]
            | null
          propietario_id?: string | null
          proveedor_id?: string | null
          qr_url?: string | null
          tenant_id: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          anio_fabricacion?: number | null
          bubble_id?: string | null
          capacidad?: string | null
          categoria?: string | null
          codigo_interno?: string | null
          con_informes?: boolean | null
          created_at?: string | null
          created_by?: string | null
          estado?: Database["public"]["Enums"]["maquinaria_estado"] | null
          foto_url?: string | null
          habilitado?: boolean | null
          hoja_vida_url?: string | null
          id?: string
          is_active?: boolean | null
          marca?: string | null
          modelo?: string | null
          modelo_id?: string | null
          nombre?: string
          placa?: string | null
          propiedad_proveedor?: boolean | null
          propietario?:
            | Database["public"]["Enums"]["maquinaria_propietario"]
            | null
          propietario_id?: string | null
          proveedor_id?: string | null
          qr_url?: string | null
          tenant_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maquinarias_modelo_id_fkey"
            columns: ["modelo_id"]
            isOneToOne: false
            referencedRelation: "maquinaria_modelos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maquinarias_proveedor_id_fkey"
            columns: ["proveedor_id"]
            isOneToOne: false
            referencedRelation: "terceros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maquinarias_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      mv_refresh_pending: {
        Row: {
          last_refresh: string | null
          pending: boolean
          view_name: string
        }
        Insert: {
          last_refresh?: string | null
          pending?: boolean
          view_name: string
        }
        Update: {
          last_refresh?: string | null
          pending?: boolean
          view_name?: string
        }
        Relationships: []
      }
      notificaciones_receptores: {
        Row: {
          created_at: string
          dia_semana: number | null
          email: string
          frecuencia: string
          id: string
          is_active: boolean
          nombre: string
          tenant_id: string
          tipo_correo: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          dia_semana?: number | null
          email: string
          frecuencia?: string
          id?: string
          is_active?: boolean
          nombre: string
          tenant_id: string
          tipo_correo: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          dia_semana?: number | null
          email?: string
          frecuencia?: string
          id?: string
          is_active?: boolean
          nombre?: string
          tenant_id?: string
          tipo_correo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notificaciones_receptores_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_progress: {
        Row: {
          completed_at: string | null
          config_count: number
          created_by: string | null
          maquinarias_count: number
          personal_count: number
          servicios_count: number
          started_at: string
          step_config: string
          step_maquinarias: string
          step_personal: string
          step_servicios: string
          step_terceros: string
          tenant_id: string
          terceros_count: number
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          config_count?: number
          created_by?: string | null
          maquinarias_count?: number
          personal_count?: number
          servicios_count?: number
          started_at?: string
          step_config?: string
          step_maquinarias?: string
          step_personal?: string
          step_servicios?: string
          step_terceros?: string
          tenant_id: string
          terceros_count?: number
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          config_count?: number
          created_by?: string | null
          maquinarias_count?: number
          personal_count?: number
          servicios_count?: number
          started_at?: string
          step_config?: string
          step_maquinarias?: string
          step_personal?: string
          step_servicios?: string
          step_terceros?: string
          tenant_id?: string
          terceros_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_progress_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_progress_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      paises: {
        Row: {
          continente: string | null
          created_at: string | null
          id: string
          indicativo: string | null
          is_active: boolean | null
          iso2: string | null
          nombre: string
        }
        Insert: {
          continente?: string | null
          created_at?: string | null
          id: string
          indicativo?: string | null
          is_active?: boolean | null
          iso2?: string | null
          nombre: string
        }
        Update: {
          continente?: string | null
          created_at?: string | null
          id?: string
          indicativo?: string | null
          is_active?: boolean | null
          iso2?: string | null
          nombre?: string
        }
        Relationships: []
      }
      pdf_jobs: {
        Row: {
          attempts: number
          bucket: string
          created_at: string
          entity_id: string
          entity_type: string
          html_snapshot: string | null
          id: string
          last_error: string | null
          max_attempts: number
          pdf_url: string | null
          status: string
          storage_path: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          attempts?: number
          bucket: string
          created_at?: string
          entity_id: string
          entity_type: string
          html_snapshot?: string | null
          id?: string
          last_error?: string | null
          max_attempts?: number
          pdf_url?: string | null
          status?: string
          storage_path: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          attempts?: number
          bucket?: string
          created_at?: string
          entity_id?: string
          entity_type?: string
          html_snapshot?: string | null
          id?: string
          last_error?: string | null
          max_attempts?: number
          pdf_url?: string | null
          status?: string
          storage_path?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      personal_cargos: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          nombre: string
          tenant_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          nombre: string
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          nombre?: string
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      planes_accion: {
        Row: {
          accion_correctiva_propuesta: string | null
          bubble_id: string | null
          codigo: string | null
          comentario_cierre: string | null
          created_at: string | null
          created_by: string | null
          descripcion_problema: string | null
          estado: string | null
          evidencia_cierre_url: string | null
          fecha_cierre: string | null
          fecha_limite: string | null
          id: string
          informe_bubble_id: string | null
          inspeccion_detalle_id: string | null
          inspeccion_id: string | null
          is_active: boolean | null
          lista_fotos: Json | null
          maquinaria_id: string | null
          origen: string | null
          plantilla_id: string | null
          pregunta_ref: Json | null
          prioridad: string | null
          reporte_maquinaria_id: string | null
          responsable_id: string | null
          tenant_id: string
          titulo: string | null
          updated_at: string | null
        }
        Insert: {
          accion_correctiva_propuesta?: string | null
          bubble_id?: string | null
          codigo?: string | null
          comentario_cierre?: string | null
          created_at?: string | null
          created_by?: string | null
          descripcion_problema?: string | null
          estado?: string | null
          evidencia_cierre_url?: string | null
          fecha_cierre?: string | null
          fecha_limite?: string | null
          id?: string
          informe_bubble_id?: string | null
          inspeccion_detalle_id?: string | null
          inspeccion_id?: string | null
          is_active?: boolean | null
          lista_fotos?: Json | null
          maquinaria_id?: string | null
          origen?: string | null
          plantilla_id?: string | null
          pregunta_ref?: Json | null
          prioridad?: string | null
          reporte_maquinaria_id?: string | null
          responsable_id?: string | null
          tenant_id: string
          titulo?: string | null
          updated_at?: string | null
        }
        Update: {
          accion_correctiva_propuesta?: string | null
          bubble_id?: string | null
          codigo?: string | null
          comentario_cierre?: string | null
          created_at?: string | null
          created_by?: string | null
          descripcion_problema?: string | null
          estado?: string | null
          evidencia_cierre_url?: string | null
          fecha_cierre?: string | null
          fecha_limite?: string | null
          id?: string
          informe_bubble_id?: string | null
          inspeccion_detalle_id?: string | null
          inspeccion_id?: string | null
          is_active?: boolean | null
          lista_fotos?: Json | null
          maquinaria_id?: string | null
          origen?: string | null
          plantilla_id?: string | null
          pregunta_ref?: Json | null
          prioridad?: string | null
          reporte_maquinaria_id?: string | null
          responsable_id?: string | null
          tenant_id?: string
          titulo?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "planes_accion_inspeccion_detalle_id_fkey"
            columns: ["inspeccion_detalle_id"]
            isOneToOne: false
            referencedRelation: "inspecciones_detalles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planes_accion_inspeccion_id_fkey"
            columns: ["inspeccion_id"]
            isOneToOne: false
            referencedRelation: "inspecciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planes_accion_responsable_id_fkey"
            columns: ["responsable_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      planes_accion_avances: {
        Row: {
          bubble_id: string | null
          comentario: string | null
          created_at: string | null
          created_by: string | null
          estado: string | null
          fotos: Json | null
          id: string
          plan_id: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          bubble_id?: string | null
          comentario?: string | null
          created_at?: string | null
          created_by?: string | null
          estado?: string | null
          fotos?: Json | null
          id?: string
          plan_id: string
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          bubble_id?: string | null
          comentario?: string | null
          created_at?: string | null
          created_by?: string | null
          estado?: string | null
          fotos?: Json | null
          id?: string
          plan_id?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "planes_accion_avances_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planes_accion_avances_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "planes_accion"
            referencedColumns: ["id"]
          },
        ]
      }
      planes_accion_responsables: {
        Row: {
          created_at: string | null
          plan_id: string
          profile_id: string
          tenant_id: string
        }
        Insert: {
          created_at?: string | null
          plan_id: string
          profile_id: string
          tenant_id: string
        }
        Update: {
          created_at?: string | null
          plan_id?: string
          profile_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "planes_accion_responsables_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "planes_accion"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planes_accion_responsables_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      plantillas: {
        Row: {
          bubble_id: string | null
          created_at: string | null
          descripcion: string | null
          estructura: Json | null
          id: string
          is_active: boolean | null
          nombre: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          bubble_id?: string | null
          created_at?: string | null
          descripcion?: string | null
          estructura?: Json | null
          id?: string
          is_active?: boolean | null
          nombre: string
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          bubble_id?: string | null
          created_at?: string | null
          descripcion?: string | null
          estructura?: Json | null
          id?: string
          is_active?: boolean | null
          nombre?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      plazos_pago: {
        Row: {
          bubble_id: string | null
          created_at: string | null
          created_by: string | null
          dias: number | null
          id: string
          is_active: boolean | null
          nombre: string
          tenant_id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          bubble_id?: string | null
          created_at?: string | null
          created_by?: string | null
          dias?: number | null
          id?: string
          is_active?: boolean | null
          nombre: string
          tenant_id: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          bubble_id?: string | null
          created_at?: string | null
          created_by?: string | null
          dias?: number | null
          id?: string
          is_active?: boolean | null
          nombre?: string
          tenant_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plazos_pago_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      precios_minimos: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          nombre: string
          tenant_id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          nombre: string
          tenant_id: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          nombre?: string
          tenant_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      precios_monedas: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          nombre: string
          tenant_id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          nombre: string
          tenant_id: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          nombre?: string
          tenant_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      precios_nombres: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          nombre: string
          tenant_id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          nombre: string
          tenant_id: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          nombre?: string
          tenant_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      profile_details: {
        Row: {
          area_id: string | null
          birth_date: string | null
          branch_id: string | null
          created_at: string | null
          created_by: string | null
          doc_type: Database["public"]["Enums"]["doc_type"] | null
          id: string
          is_active: boolean | null
          job_title_id: string | null
          middle_name: string | null
          nationality: string | null
          photo_url: string | null
          second_last_name: string | null
          signature_url: string | null
          tenant_id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          area_id?: string | null
          birth_date?: string | null
          branch_id?: string | null
          created_at?: string | null
          created_by?: string | null
          doc_type?: Database["public"]["Enums"]["doc_type"] | null
          id: string
          is_active?: boolean | null
          job_title_id?: string | null
          middle_name?: string | null
          nationality?: string | null
          photo_url?: string | null
          second_last_name?: string | null
          signature_url?: string | null
          tenant_id: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          area_id?: string | null
          birth_date?: string | null
          branch_id?: string | null
          created_at?: string | null
          created_by?: string | null
          doc_type?: Database["public"]["Enums"]["doc_type"] | null
          id?: string
          is_active?: boolean | null
          job_title_id?: string | null
          middle_name?: string | null
          nationality?: string | null
          photo_url?: string | null
          second_last_name?: string | null
          signature_url?: string | null
          tenant_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_details_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_details_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_details_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_details_job_title_id_fkey"
            columns: ["job_title_id"]
            isOneToOne: false
            referencedRelation: "job_titles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_details_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          birthday: string | null
          bubble_id: string | null
          contacto_emergencia_celular: string | null
          contacto_emergencia_nombre: string | null
          contacto_emergencia_parentesco: string | null
          created_at: string | null
          created_by: string | null
          direccion: string | null
          doc_number: string | null
          email: string | null
          first_name: string | null
          gender: string | null
          id: string
          is_active: boolean | null
          is_operario: boolean
          last_name: string | null
          personal_externo: boolean | null
          phone: string | null
          pin: number | null
          role: Database["public"]["Enums"]["app_role"] | null
          tenant_id: string | null
          tercero_bubble_id: string | null
          tercero_id: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          birthday?: string | null
          bubble_id?: string | null
          contacto_emergencia_celular?: string | null
          contacto_emergencia_nombre?: string | null
          contacto_emergencia_parentesco?: string | null
          created_at?: string | null
          created_by?: string | null
          direccion?: string | null
          doc_number?: string | null
          email?: string | null
          first_name?: string | null
          gender?: string | null
          id: string
          is_active?: boolean | null
          is_operario?: boolean
          last_name?: string | null
          personal_externo?: boolean | null
          phone?: string | null
          pin?: number | null
          role?: Database["public"]["Enums"]["app_role"] | null
          tenant_id?: string | null
          tercero_bubble_id?: string | null
          tercero_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          birthday?: string | null
          bubble_id?: string | null
          contacto_emergencia_celular?: string | null
          contacto_emergencia_nombre?: string | null
          contacto_emergencia_parentesco?: string | null
          created_at?: string | null
          created_by?: string | null
          direccion?: string | null
          doc_number?: string | null
          email?: string | null
          first_name?: string | null
          gender?: string | null
          id?: string
          is_active?: boolean | null
          is_operario?: boolean
          last_name?: string | null
          personal_externo?: boolean | null
          phone?: string | null
          pin?: number | null
          role?: Database["public"]["Enums"]["app_role"] | null
          tenant_id?: string | null
          tercero_bubble_id?: string | null
          tercero_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_tercero_id_fkey"
            columns: ["tercero_id"]
            isOneToOne: false
            referencedRelation: "terceros"
            referencedColumns: ["id"]
          },
        ]
      }
      proyectos: {
        Row: {
          bubble_id: string | null
          cliente_id: string | null
          codigo: string | null
          created_at: string | null
          descripcion: string | null
          id: string
          is_active: boolean | null
          sitio_id: string | null
          tenant_id: string | null
          titulo: string | null
          updated_at: string | null
        }
        Insert: {
          bubble_id?: string | null
          cliente_id?: string | null
          codigo?: string | null
          created_at?: string | null
          descripcion?: string | null
          id?: string
          is_active?: boolean | null
          sitio_id?: string | null
          tenant_id?: string | null
          titulo?: string | null
          updated_at?: string | null
        }
        Update: {
          bubble_id?: string | null
          cliente_id?: string | null
          codigo?: string | null
          created_at?: string | null
          descripcion?: string | null
          id?: string
          is_active?: boolean | null
          sitio_id?: string | null
          tenant_id?: string | null
          titulo?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proyectos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "terceros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proyectos_sitio_id_fkey"
            columns: ["sitio_id"]
            isOneToOne: false
            referencedRelation: "terceros_sitios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proyectos_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      reportes_combustible: {
        Row: {
          bubble_id: string | null
          created_at: string | null
          created_by: string | null
          fecha_reporte: string
          foto_surtidor_url: string | null
          foto_tablero_url: string | null
          foto_voucher_url: string | null
          galones: number | null
          horometro_actual: number | null
          id: string
          is_active: boolean | null
          kilometraje_actual: number | null
          maquinaria_id: string | null
          monto_igv: number | null
          monto_subtotal: number | null
          monto_total: number | null
          precio_unitario: number | null
          proveedor_grifo: string | null
          tarea_id: string | null
          tenant_id: string
          tipo_combustible: string | null
          updated_at: string | null
        }
        Insert: {
          bubble_id?: string | null
          created_at?: string | null
          created_by?: string | null
          fecha_reporte: string
          foto_surtidor_url?: string | null
          foto_tablero_url?: string | null
          foto_voucher_url?: string | null
          galones?: number | null
          horometro_actual?: number | null
          id?: string
          is_active?: boolean | null
          kilometraje_actual?: number | null
          maquinaria_id?: string | null
          monto_igv?: number | null
          monto_subtotal?: number | null
          monto_total?: number | null
          precio_unitario?: number | null
          proveedor_grifo?: string | null
          tarea_id?: string | null
          tenant_id: string
          tipo_combustible?: string | null
          updated_at?: string | null
        }
        Update: {
          bubble_id?: string | null
          created_at?: string | null
          created_by?: string | null
          fecha_reporte?: string
          foto_surtidor_url?: string | null
          foto_tablero_url?: string | null
          foto_voucher_url?: string | null
          galones?: number | null
          horometro_actual?: number | null
          id?: string
          is_active?: boolean | null
          kilometraje_actual?: number | null
          maquinaria_id?: string | null
          monto_igv?: number | null
          monto_subtotal?: number | null
          monto_total?: number | null
          precio_unitario?: number | null
          proveedor_grifo?: string | null
          tarea_id?: string | null
          tenant_id?: string
          tipo_combustible?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reportes_combustible_maquinaria_id_fkey"
            columns: ["maquinaria_id"]
            isOneToOne: false
            referencedRelation: "maquinarias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reportes_combustible_maquinaria_id_fkey"
            columns: ["maquinaria_id"]
            isOneToOne: false
            referencedRelation: "view_valoraciones_compras"
            referencedColumns: ["maquinaria_id"]
          },
          {
            foreignKeyName: "reportes_combustible_maquinaria_id_fkey"
            columns: ["maquinaria_id"]
            isOneToOne: false
            referencedRelation: "view_valoraciones_ventas"
            referencedColumns: ["maquinaria_id"]
          },
          {
            foreignKeyName: "reportes_combustible_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "tareas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reportes_combustible_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_app_historial"
            referencedColumns: ["tarea_id"]
          },
          {
            foreignKeyName: "reportes_combustible_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_app_plan"
            referencedColumns: ["tarea_id"]
          },
          {
            foreignKeyName: "reportes_combustible_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_tareas_agenda_diaria"
            referencedColumns: ["tarea_id"]
          },
          {
            foreignKeyName: "reportes_combustible_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_valoraciones_compras"
            referencedColumns: ["tarea_id"]
          },
          {
            foreignKeyName: "reportes_combustible_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_valoraciones_ventas"
            referencedColumns: ["tarea_id"]
          },
        ]
      }
      reportes_maquinaria: {
        Row: {
          aceptacion: string | null
          aceptado_por: string | null
          autor_id: string | null
          bubble_id: string | null
          cargo_cliente_firmante: string | null
          cliente_cargo: string | null
          cliente_id: string | null
          cliente_nombre: string | null
          codigo_documento_interno: string | null
          cotizacion_compra_item_id: string | null
          cotizacion_venta_item_id: string | null
          created_at: string | null
          created_by: string | null
          device_ref: string | null
          editor_id: string | null
          estado_compra: string | null
          estado_venta: string | null
          factura_compra_item: string | null
          factura_compra_item_id: string | null
          factura_venta_item: string | null
          factura_venta_item_id: string | null
          fecha_reporte: string
          firma: string | null
          firma_cliente_url: string | null
          foto_actividad_url: string | null
          foto_reporte_escrito_url: string | null
          fotos_adicionales: Json | null
          guia_transporte: string | null
          horas_alquiler: number | null
          horas_facturar: number | null
          horas_recorrido: number | null
          horas_trabajadas: number | null
          id: string
          id_documento_interno: string | null
          is_active: boolean | null
          jornada1_fin: string | null
          jornada1_inicio: string | null
          jornada2_fin: string | null
          jornada2_inicio: string | null
          jornada3_fin: string | null
          jornada3_inicio: string | null
          maquinaria_id: string | null
          nombre_cliente_firmante: string | null
          operador_id: string | null
          pdf_url: string | null
          proveedor_id: string | null
          rigger1_id: string | null
          rigger2_id: string | null
          salida_autorizada_por: string | null
          segunda_jornada: boolean | null
          tarea_id: string | null
          tenant_id: string
          tipo_recorrido: string | null
          tipo_uso: string | null
          tonelaje_solicitado: number | null
          total_horas: number | null
          trabajo_realizado: string | null
          updated_at: string | null
          updated_by: string | null
          valorizacion_compra: string | null
          valorizacion_compra_id: string | null
          valorizacion_venta: string | null
          valorizacion_venta_id: string | null
          version_formato: string | null
        }
        Insert: {
          aceptacion?: string | null
          aceptado_por?: string | null
          autor_id?: string | null
          bubble_id?: string | null
          cargo_cliente_firmante?: string | null
          cliente_cargo?: string | null
          cliente_id?: string | null
          cliente_nombre?: string | null
          codigo_documento_interno?: string | null
          cotizacion_compra_item_id?: string | null
          cotizacion_venta_item_id?: string | null
          created_at?: string | null
          created_by?: string | null
          device_ref?: string | null
          editor_id?: string | null
          estado_compra?: string | null
          estado_venta?: string | null
          factura_compra_item?: string | null
          factura_compra_item_id?: string | null
          factura_venta_item?: string | null
          factura_venta_item_id?: string | null
          fecha_reporte: string
          firma?: string | null
          firma_cliente_url?: string | null
          foto_actividad_url?: string | null
          foto_reporte_escrito_url?: string | null
          fotos_adicionales?: Json | null
          guia_transporte?: string | null
          horas_alquiler?: number | null
          horas_facturar?: number | null
          horas_recorrido?: number | null
          horas_trabajadas?: number | null
          id?: string
          id_documento_interno?: string | null
          is_active?: boolean | null
          jornada1_fin?: string | null
          jornada1_inicio?: string | null
          jornada2_fin?: string | null
          jornada2_inicio?: string | null
          jornada3_fin?: string | null
          jornada3_inicio?: string | null
          maquinaria_id?: string | null
          nombre_cliente_firmante?: string | null
          operador_id?: string | null
          pdf_url?: string | null
          proveedor_id?: string | null
          rigger1_id?: string | null
          rigger2_id?: string | null
          salida_autorizada_por?: string | null
          segunda_jornada?: boolean | null
          tarea_id?: string | null
          tenant_id: string
          tipo_recorrido?: string | null
          tipo_uso?: string | null
          tonelaje_solicitado?: number | null
          total_horas?: number | null
          trabajo_realizado?: string | null
          updated_at?: string | null
          updated_by?: string | null
          valorizacion_compra?: string | null
          valorizacion_compra_id?: string | null
          valorizacion_venta?: string | null
          valorizacion_venta_id?: string | null
          version_formato?: string | null
        }
        Update: {
          aceptacion?: string | null
          aceptado_por?: string | null
          autor_id?: string | null
          bubble_id?: string | null
          cargo_cliente_firmante?: string | null
          cliente_cargo?: string | null
          cliente_id?: string | null
          cliente_nombre?: string | null
          codigo_documento_interno?: string | null
          cotizacion_compra_item_id?: string | null
          cotizacion_venta_item_id?: string | null
          created_at?: string | null
          created_by?: string | null
          device_ref?: string | null
          editor_id?: string | null
          estado_compra?: string | null
          estado_venta?: string | null
          factura_compra_item?: string | null
          factura_compra_item_id?: string | null
          factura_venta_item?: string | null
          factura_venta_item_id?: string | null
          fecha_reporte?: string
          firma?: string | null
          firma_cliente_url?: string | null
          foto_actividad_url?: string | null
          foto_reporte_escrito_url?: string | null
          fotos_adicionales?: Json | null
          guia_transporte?: string | null
          horas_alquiler?: number | null
          horas_facturar?: number | null
          horas_recorrido?: number | null
          horas_trabajadas?: number | null
          id?: string
          id_documento_interno?: string | null
          is_active?: boolean | null
          jornada1_fin?: string | null
          jornada1_inicio?: string | null
          jornada2_fin?: string | null
          jornada2_inicio?: string | null
          jornada3_fin?: string | null
          jornada3_inicio?: string | null
          maquinaria_id?: string | null
          nombre_cliente_firmante?: string | null
          operador_id?: string | null
          pdf_url?: string | null
          proveedor_id?: string | null
          rigger1_id?: string | null
          rigger2_id?: string | null
          salida_autorizada_por?: string | null
          segunda_jornada?: boolean | null
          tarea_id?: string | null
          tenant_id?: string
          tipo_recorrido?: string | null
          tipo_uso?: string | null
          tonelaje_solicitado?: number | null
          total_horas?: number | null
          trabajo_realizado?: string | null
          updated_at?: string | null
          updated_by?: string | null
          valorizacion_compra?: string | null
          valorizacion_compra_id?: string | null
          valorizacion_venta?: string | null
          valorizacion_venta_id?: string | null
          version_formato?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reportes_maquinaria_maquinaria_id_fkey"
            columns: ["maquinaria_id"]
            isOneToOne: false
            referencedRelation: "maquinarias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reportes_maquinaria_maquinaria_id_fkey"
            columns: ["maquinaria_id"]
            isOneToOne: false
            referencedRelation: "view_valoraciones_compras"
            referencedColumns: ["maquinaria_id"]
          },
          {
            foreignKeyName: "reportes_maquinaria_maquinaria_id_fkey"
            columns: ["maquinaria_id"]
            isOneToOne: false
            referencedRelation: "view_valoraciones_ventas"
            referencedColumns: ["maquinaria_id"]
          },
          {
            foreignKeyName: "reportes_maquinaria_operador_id_fkey"
            columns: ["operador_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reportes_maquinaria_rigger1_id_fkey"
            columns: ["rigger1_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reportes_maquinaria_rigger2_id_fkey"
            columns: ["rigger2_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reportes_maquinaria_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "tareas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reportes_maquinaria_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_app_historial"
            referencedColumns: ["tarea_id"]
          },
          {
            foreignKeyName: "reportes_maquinaria_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_app_plan"
            referencedColumns: ["tarea_id"]
          },
          {
            foreignKeyName: "reportes_maquinaria_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_tareas_agenda_diaria"
            referencedColumns: ["tarea_id"]
          },
          {
            foreignKeyName: "reportes_maquinaria_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_valoraciones_compras"
            referencedColumns: ["tarea_id"]
          },
          {
            foreignKeyName: "reportes_maquinaria_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_valoraciones_ventas"
            referencedColumns: ["tarea_id"]
          },
        ]
      }
      reportes_personal: {
        Row: {
          bubble_id: string | null
          cargo_cliente_firmante: string | null
          created_at: string | null
          created_by: string | null
          device_ref: string | null
          domingo_al_que_corresponde: string | null
          es_descanso_por_domingo: boolean | null
          es_domingo_o_festivo: boolean | null
          fecha_descanso_compensatorio: string | null
          fecha_reporte: string
          firma_cliente_url: string | null
          firma_trabajador_url: string | null
          firmado_por: string | null
          foto_trabajo_url: string | null
          gasto_almuerzo: number | null
          gasto_cena: number | null
          gasto_desayuno: number | null
          gasto_movilidad: number | null
          gasto_total: number | null
          horas_dominicales: number | null
          horas_extras: number | null
          horas_extras_extraordinarias: number | null
          id: string
          id_documento_interno: string | null
          is_active: boolean | null
          jornada1_fin: string | null
          jornada1_inicio: string | null
          jornada2_fin: string | null
          jornada2_inicio: string | null
          jornada3_fin: string | null
          jornada3_inicio: string | null
          maquinaria_id: string | null
          nombre_cliente_firmante: string | null
          pdf_url: string | null
          personal_id: string | null
          tarea_id: string | null
          tenant_id: string
          tercero_personal_id: string | null
          tiene_descanso_compensatorio: boolean | null
          tipo_personal: string | null
          total_horas: number | null
          trabajo_realizado: string | null
          updated_at: string | null
        }
        Insert: {
          bubble_id?: string | null
          cargo_cliente_firmante?: string | null
          created_at?: string | null
          created_by?: string | null
          device_ref?: string | null
          domingo_al_que_corresponde?: string | null
          es_descanso_por_domingo?: boolean | null
          es_domingo_o_festivo?: boolean | null
          fecha_descanso_compensatorio?: string | null
          fecha_reporte: string
          firma_cliente_url?: string | null
          firma_trabajador_url?: string | null
          firmado_por?: string | null
          foto_trabajo_url?: string | null
          gasto_almuerzo?: number | null
          gasto_cena?: number | null
          gasto_desayuno?: number | null
          gasto_movilidad?: number | null
          gasto_total?: number | null
          horas_dominicales?: number | null
          horas_extras?: number | null
          horas_extras_extraordinarias?: number | null
          id?: string
          id_documento_interno?: string | null
          is_active?: boolean | null
          jornada1_fin?: string | null
          jornada1_inicio?: string | null
          jornada2_fin?: string | null
          jornada2_inicio?: string | null
          jornada3_fin?: string | null
          jornada3_inicio?: string | null
          maquinaria_id?: string | null
          nombre_cliente_firmante?: string | null
          pdf_url?: string | null
          personal_id?: string | null
          tarea_id?: string | null
          tenant_id: string
          tercero_personal_id?: string | null
          tiene_descanso_compensatorio?: boolean | null
          tipo_personal?: string | null
          total_horas?: number | null
          trabajo_realizado?: string | null
          updated_at?: string | null
        }
        Update: {
          bubble_id?: string | null
          cargo_cliente_firmante?: string | null
          created_at?: string | null
          created_by?: string | null
          device_ref?: string | null
          domingo_al_que_corresponde?: string | null
          es_descanso_por_domingo?: boolean | null
          es_domingo_o_festivo?: boolean | null
          fecha_descanso_compensatorio?: string | null
          fecha_reporte?: string
          firma_cliente_url?: string | null
          firma_trabajador_url?: string | null
          firmado_por?: string | null
          foto_trabajo_url?: string | null
          gasto_almuerzo?: number | null
          gasto_cena?: number | null
          gasto_desayuno?: number | null
          gasto_movilidad?: number | null
          gasto_total?: number | null
          horas_dominicales?: number | null
          horas_extras?: number | null
          horas_extras_extraordinarias?: number | null
          id?: string
          id_documento_interno?: string | null
          is_active?: boolean | null
          jornada1_fin?: string | null
          jornada1_inicio?: string | null
          jornada2_fin?: string | null
          jornada2_inicio?: string | null
          jornada3_fin?: string | null
          jornada3_inicio?: string | null
          maquinaria_id?: string | null
          nombre_cliente_firmante?: string | null
          pdf_url?: string | null
          personal_id?: string | null
          tarea_id?: string | null
          tenant_id?: string
          tercero_personal_id?: string | null
          tiene_descanso_compensatorio?: boolean | null
          tipo_personal?: string | null
          total_horas?: number | null
          trabajo_realizado?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reportes_personal_firmado_por_fkey"
            columns: ["firmado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reportes_personal_maquinaria_id_fkey"
            columns: ["maquinaria_id"]
            isOneToOne: false
            referencedRelation: "maquinarias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reportes_personal_maquinaria_id_fkey"
            columns: ["maquinaria_id"]
            isOneToOne: false
            referencedRelation: "view_valoraciones_compras"
            referencedColumns: ["maquinaria_id"]
          },
          {
            foreignKeyName: "reportes_personal_maquinaria_id_fkey"
            columns: ["maquinaria_id"]
            isOneToOne: false
            referencedRelation: "view_valoraciones_ventas"
            referencedColumns: ["maquinaria_id"]
          },
          {
            foreignKeyName: "reportes_personal_personal_id_fkey"
            columns: ["personal_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reportes_personal_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "tareas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reportes_personal_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_app_historial"
            referencedColumns: ["tarea_id"]
          },
          {
            foreignKeyName: "reportes_personal_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_app_plan"
            referencedColumns: ["tarea_id"]
          },
          {
            foreignKeyName: "reportes_personal_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_tareas_agenda_diaria"
            referencedColumns: ["tarea_id"]
          },
          {
            foreignKeyName: "reportes_personal_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_valoraciones_compras"
            referencedColumns: ["tarea_id"]
          },
          {
            foreignKeyName: "reportes_personal_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_valoraciones_ventas"
            referencedColumns: ["tarea_id"]
          },
          {
            foreignKeyName: "reportes_personal_tercero_personal_id_fkey"
            columns: ["tercero_personal_id"]
            isOneToOne: false
            referencedRelation: "terceros_personal"
            referencedColumns: ["id"]
          },
        ]
      }
      reportes_usuario: {
        Row: {
          bubble_id: string | null
          codigo_interno: string | null
          created_at: string | null
          created_by: string | null
          dominical_festivo: boolean | null
          fecha_reporte: string | null
          gastos_almuerzo: number | null
          gastos_cena: number | null
          gastos_desayuno: number | null
          gastos_movilidad: number | null
          gastos_total: number | null
          horas_dominicales: number | null
          horas_extras: number | null
          horas_extras_extraordinarias: number | null
          id: string
          is_active: boolean | null
          item_cotizacion_id: string | null
          jornada_adicional: boolean | null
          jornada1_fin: string | null
          jornada1_inicio: string | null
          jornada2_fin: string | null
          jornada2_inicio: string | null
          jornada3_fin: string | null
          jornada3_inicio: string | null
          maquina_id: string | null
          notas: string | null
          pdf_url: string | null
          tarea_id: string | null
          tenant_id: string | null
          total_horas: number | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          bubble_id?: string | null
          codigo_interno?: string | null
          created_at?: string | null
          created_by?: string | null
          dominical_festivo?: boolean | null
          fecha_reporte?: string | null
          gastos_almuerzo?: number | null
          gastos_cena?: number | null
          gastos_desayuno?: number | null
          gastos_movilidad?: number | null
          gastos_total?: number | null
          horas_dominicales?: number | null
          horas_extras?: number | null
          horas_extras_extraordinarias?: number | null
          id?: string
          is_active?: boolean | null
          item_cotizacion_id?: string | null
          jornada_adicional?: boolean | null
          jornada1_fin?: string | null
          jornada1_inicio?: string | null
          jornada2_fin?: string | null
          jornada2_inicio?: string | null
          jornada3_fin?: string | null
          jornada3_inicio?: string | null
          maquina_id?: string | null
          notas?: string | null
          pdf_url?: string | null
          tarea_id?: string | null
          tenant_id?: string | null
          total_horas?: number | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          bubble_id?: string | null
          codigo_interno?: string | null
          created_at?: string | null
          created_by?: string | null
          dominical_festivo?: boolean | null
          fecha_reporte?: string | null
          gastos_almuerzo?: number | null
          gastos_cena?: number | null
          gastos_desayuno?: number | null
          gastos_movilidad?: number | null
          gastos_total?: number | null
          horas_dominicales?: number | null
          horas_extras?: number | null
          horas_extras_extraordinarias?: number | null
          id?: string
          is_active?: boolean | null
          item_cotizacion_id?: string | null
          jornada_adicional?: boolean | null
          jornada1_fin?: string | null
          jornada1_inicio?: string | null
          jornada2_fin?: string | null
          jornada2_inicio?: string | null
          jornada3_fin?: string | null
          jornada3_inicio?: string | null
          maquina_id?: string | null
          notas?: string | null
          pdf_url?: string | null
          tarea_id?: string | null
          tenant_id?: string | null
          total_horas?: number | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      rubros: {
        Row: {
          bubble_id: string | null
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          nombre: string
          tenant_id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          bubble_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          nombre: string
          tenant_id: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          bubble_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          nombre?: string
          tenant_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rubros_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      servicios: {
        Row: {
          bubble_id: string | null
          cantidad_precios: number | null
          codigo: string | null
          created_at: string | null
          created_by: string | null
          id: string
          imagen_url: string | null
          is_active: boolean | null
          moneda: string | null
          nombre: string | null
          precio_1_campo_adicional: string | null
          precio_1_tipo: string | null
          precio_1_valor: number | null
          precio_2_campo_adicional: string | null
          precio_2_tipo: string | null
          precio_2_valor: number | null
          precio_3_campo_adicional: string | null
          precio_3_no_aplica: boolean | null
          precio_3_tipo: string | null
          precio_3_valor: number | null
          tenant_id: string
          tipo_servicio: string | null
          toneladas: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          bubble_id?: string | null
          cantidad_precios?: number | null
          codigo?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          imagen_url?: string | null
          is_active?: boolean | null
          moneda?: string | null
          nombre?: string | null
          precio_1_campo_adicional?: string | null
          precio_1_tipo?: string | null
          precio_1_valor?: number | null
          precio_2_campo_adicional?: string | null
          precio_2_tipo?: string | null
          precio_2_valor?: number | null
          precio_3_campo_adicional?: string | null
          precio_3_no_aplica?: boolean | null
          precio_3_tipo?: string | null
          precio_3_valor?: number | null
          tenant_id: string
          tipo_servicio?: string | null
          toneladas?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          bubble_id?: string | null
          cantidad_precios?: number | null
          codigo?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          imagen_url?: string | null
          is_active?: boolean | null
          moneda?: string | null
          nombre?: string | null
          precio_1_campo_adicional?: string | null
          precio_1_tipo?: string | null
          precio_1_valor?: number | null
          precio_2_campo_adicional?: string | null
          precio_2_tipo?: string | null
          precio_2_valor?: number | null
          precio_3_campo_adicional?: string | null
          precio_3_no_aplica?: boolean | null
          precio_3_tipo?: string | null
          precio_3_valor?: number | null
          tenant_id?: string
          tipo_servicio?: string | null
          toneladas?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      servicios_tipo: {
        Row: {
          bubble_id: string | null
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          nombre: string
          tenant_id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          bubble_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          nombre: string
          tenant_id: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          bubble_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          nombre?: string
          tenant_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      servicios_tipo_precios: {
        Row: {
          bubble_id: string | null
          codigo: string | null
          created_at: string | null
          created_by: string | null
          id: string
          minimo_opcion_bubble_id: string | null
          nombre: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          bubble_id?: string | null
          codigo?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          minimo_opcion_bubble_id?: string | null
          nombre?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          bubble_id?: string | null
          codigo?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          minimo_opcion_bubble_id?: string | null
          nombre?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "servicios_tipo_precios_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      servicios_tipos: {
        Row: {
          bubble_id: string | null
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          nombre: string | null
          tenant_id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          bubble_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          nombre?: string | null
          tenant_id: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          bubble_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          nombre?: string | null
          tenant_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      sistema_recursos: {
        Row: {
          created_at: string | null
          id: string
          nombre: string
          orden: number
          ruta_base: string
          seccion: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          nombre: string
          orden?: number
          ruta_base: string
          seccion: string
        }
        Update: {
          created_at?: string | null
          id?: string
          nombre?: string
          orden?: number
          ruta_base?: string
          seccion?: string
        }
        Relationships: []
      }
      sitios_tipo: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          nombre: string
          tenant_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          nombre: string
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          nombre?: string
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      sitios_ubicacion: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          nombre: string
          tenant_id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          nombre: string
          tenant_id: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          nombre?: string
          tenant_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      sst_ats_medida_control: {
        Row: {
          bubble_id: string | null
          created_at: string | null
          id: string
          medida: string | null
          tenant_id: string | null
        }
        Insert: {
          bubble_id?: string | null
          created_at?: string | null
          id?: string
          medida?: string | null
          tenant_id?: string | null
        }
        Update: {
          bubble_id?: string | null
          created_at?: string | null
          id?: string
          medida?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sst_ats_medida_control_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      sst_ats_registro: {
        Row: {
          bubble_id: string | null
          consecutivo: number | null
          created_at: string | null
          estado: string | null
          fecha_fin: string | null
          fecha_inicio: string | null
          id: string
          pdf_url: string | null
          proyecto_id: string | null
          responsable_id: string | null
          sitio_id: string | null
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          bubble_id?: string | null
          consecutivo?: number | null
          created_at?: string | null
          estado?: string | null
          fecha_fin?: string | null
          fecha_inicio?: string | null
          id?: string
          pdf_url?: string | null
          proyecto_id?: string | null
          responsable_id?: string | null
          sitio_id?: string | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          bubble_id?: string | null
          consecutivo?: number | null
          created_at?: string | null
          estado?: string | null
          fecha_fin?: string | null
          fecha_inicio?: string | null
          id?: string
          pdf_url?: string | null
          proyecto_id?: string | null
          responsable_id?: string | null
          sitio_id?: string | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sst_ats_registro_proyecto_id_fkey"
            columns: ["proyecto_id"]
            isOneToOne: false
            referencedRelation: "proyectos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sst_ats_registro_responsable_id_fkey"
            columns: ["responsable_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sst_ats_registro_sitio_id_fkey"
            columns: ["sitio_id"]
            isOneToOne: false
            referencedRelation: "terceros_sitios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sst_ats_registro_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      sst_capacitacion: {
        Row: {
          bubble_id: string | null
          capacitador_id: string | null
          created_at: string | null
          estado: string | null
          fecha_fin: string | null
          fecha_inicio: string | null
          id: string
          nombre_tema: string | null
          num_asistentes: number | null
          pdf_url: string | null
          tema_principal: string | null
          tenant_id: string | null
        }
        Insert: {
          bubble_id?: string | null
          capacitador_id?: string | null
          created_at?: string | null
          estado?: string | null
          fecha_fin?: string | null
          fecha_inicio?: string | null
          id?: string
          nombre_tema?: string | null
          num_asistentes?: number | null
          pdf_url?: string | null
          tema_principal?: string | null
          tenant_id?: string | null
        }
        Update: {
          bubble_id?: string | null
          capacitador_id?: string | null
          created_at?: string | null
          estado?: string | null
          fecha_fin?: string | null
          fecha_inicio?: string | null
          id?: string
          nombre_tema?: string | null
          num_asistentes?: number | null
          pdf_url?: string | null
          tema_principal?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sst_capacitacion_capacitador_id_fkey"
            columns: ["capacitador_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sst_capacitacion_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      sst_checklist_equipos: {
        Row: {
          bubble_id: string | null
          created_at: string | null
          id: string
          nombre: string | null
          obligatorio: boolean | null
          posicion: number | null
          subtipo: string | null
          tenant_id: string | null
          tipo: string | null
        }
        Insert: {
          bubble_id?: string | null
          created_at?: string | null
          id?: string
          nombre?: string | null
          obligatorio?: boolean | null
          posicion?: number | null
          subtipo?: string | null
          tenant_id?: string | null
          tipo?: string | null
        }
        Update: {
          bubble_id?: string | null
          created_at?: string | null
          id?: string
          nombre?: string | null
          obligatorio?: boolean | null
          posicion?: number | null
          subtipo?: string | null
          tenant_id?: string | null
          tipo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sst_checklist_equipos_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      sst_epp_alerta: {
        Row: {
          fecha_generacion: string | null
          fecha_gestionado: string | null
          gestionado: boolean
          gestionado_por: string | null
          id: string
          item_id: string
          nivel: string
          tenant_id: string
        }
        Insert: {
          fecha_generacion?: string | null
          fecha_gestionado?: string | null
          gestionado?: boolean
          gestionado_por?: string | null
          id?: string
          item_id: string
          nivel: string
          tenant_id: string
        }
        Update: {
          fecha_generacion?: string | null
          fecha_gestionado?: string | null
          gestionado?: boolean
          gestionado_por?: string | null
          id?: string
          item_id?: string
          nivel?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sst_epp_alerta_gestionado_por_fkey"
            columns: ["gestionado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sst_epp_alerta_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "sst_epp_item"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sst_epp_alerta_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      sst_epp_config: {
        Row: {
          bubble_id: string | null
          created_at: string | null
          dias_renovacion: number | null
          epp_nombre: string
          id: string
          is_active: boolean
          nivel_riesgo: string | null
          tenant_id: string
          tipo: string
          updated_at: string | null
        }
        Insert: {
          bubble_id?: string | null
          created_at?: string | null
          dias_renovacion?: number | null
          epp_nombre: string
          id?: string
          is_active?: boolean
          nivel_riesgo?: string | null
          tenant_id: string
          tipo?: string
          updated_at?: string | null
        }
        Update: {
          bubble_id?: string | null
          created_at?: string | null
          dias_renovacion?: number | null
          epp_nombre?: string
          id?: string
          is_active?: boolean
          nivel_riesgo?: string | null
          tenant_id?: string
          tipo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sst_epp_config_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      sst_epp_entrega: {
        Row: {
          bubble_id: string | null
          colaborador_id: string
          confirmado_via_app: boolean | null
          created_at: string | null
          created_by: string | null
          estado: string
          estado_confirmacion: string | null
          fecha_confirmacion_app: string | null
          fecha_entrega: string
          id: string
          observaciones: string | null
          pdf_url: string | null
          responsable_sst_id: string | null
          tenant_id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          bubble_id?: string | null
          colaborador_id: string
          confirmado_via_app?: boolean | null
          created_at?: string | null
          created_by?: string | null
          estado?: string
          estado_confirmacion?: string | null
          fecha_confirmacion_app?: string | null
          fecha_entrega: string
          id?: string
          observaciones?: string | null
          pdf_url?: string | null
          responsable_sst_id?: string | null
          tenant_id: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          bubble_id?: string | null
          colaborador_id?: string
          confirmado_via_app?: boolean | null
          created_at?: string | null
          created_by?: string | null
          estado?: string
          estado_confirmacion?: string | null
          fecha_confirmacion_app?: string | null
          fecha_entrega?: string
          id?: string
          observaciones?: string | null
          pdf_url?: string | null
          responsable_sst_id?: string | null
          tenant_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sst_epp_entrega_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sst_epp_entrega_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sst_epp_entrega_responsable_sst_id_fkey"
            columns: ["responsable_sst_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sst_epp_entrega_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sst_epp_entrega_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sst_epp_item: {
        Row: {
          admin_que_respondio_id: string | null
          bubble_id: string | null
          cantidad: number
          catalogo_id: string
          created_at: string | null
          created_by: string | null
          decision_admin: string | null
          entrega_id: string
          estado_item: string | null
          estado_vigencia: string
          fecha_confirmacion_item: string | null
          fecha_decision_admin: string | null
          fecha_vencimiento: string
          id: string
          item_origen_id: string | null
          motivo_observacion: string | null
          nota_operario: string | null
          respuesta_admin: string | null
          tenant_id: string
        }
        Insert: {
          admin_que_respondio_id?: string | null
          bubble_id?: string | null
          cantidad: number
          catalogo_id: string
          created_at?: string | null
          created_by?: string | null
          decision_admin?: string | null
          entrega_id: string
          estado_item?: string | null
          estado_vigencia?: string
          fecha_confirmacion_item?: string | null
          fecha_decision_admin?: string | null
          fecha_vencimiento: string
          id?: string
          item_origen_id?: string | null
          motivo_observacion?: string | null
          nota_operario?: string | null
          respuesta_admin?: string | null
          tenant_id: string
        }
        Update: {
          admin_que_respondio_id?: string | null
          bubble_id?: string | null
          cantidad?: number
          catalogo_id?: string
          created_at?: string | null
          created_by?: string | null
          decision_admin?: string | null
          entrega_id?: string
          estado_item?: string | null
          estado_vigencia?: string
          fecha_confirmacion_item?: string | null
          fecha_decision_admin?: string | null
          fecha_vencimiento?: string
          id?: string
          item_origen_id?: string | null
          motivo_observacion?: string | null
          nota_operario?: string | null
          respuesta_admin?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sst_epp_item_catalogo_id_fkey"
            columns: ["catalogo_id"]
            isOneToOne: false
            referencedRelation: "sst_epp_config"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sst_epp_item_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sst_epp_item_entrega_id_fkey"
            columns: ["entrega_id"]
            isOneToOne: false
            referencedRelation: "sst_epp_entrega"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sst_epp_item_item_origen_id_fkey"
            columns: ["item_origen_id"]
            isOneToOne: false
            referencedRelation: "sst_epp_item"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sst_epp_item_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      sst_epp_movimiento: {
        Row: {
          bubble_id: string | null
          cantidad: number
          catalogo_id: string
          colaborador_id: string
          created_at: string | null
          created_by: string | null
          fecha: string
          id: string
          item_id: string | null
          observacion: string | null
          tenant_id: string
          tipo: string
        }
        Insert: {
          bubble_id?: string | null
          cantidad: number
          catalogo_id: string
          colaborador_id: string
          created_at?: string | null
          created_by?: string | null
          fecha: string
          id?: string
          item_id?: string | null
          observacion?: string | null
          tenant_id: string
          tipo: string
        }
        Update: {
          bubble_id?: string | null
          cantidad?: number
          catalogo_id?: string
          colaborador_id?: string
          created_at?: string | null
          created_by?: string | null
          fecha?: string
          id?: string
          item_id?: string | null
          observacion?: string | null
          tenant_id?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "sst_epp_movimiento_catalogo_id_fkey"
            columns: ["catalogo_id"]
            isOneToOne: false
            referencedRelation: "sst_epp_config"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sst_epp_movimiento_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sst_epp_movimiento_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sst_epp_movimiento_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "sst_epp_item"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sst_epp_movimiento_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      sst_epp_reporte: {
        Row: {
          bubble_id: string | null
          created_at: string | null
          created_by: string | null
          enviado: boolean
          fecha_envio: string | null
          fecha_fin: string
          fecha_inicio: string
          id: string
          pdf_url: string | null
          tenant_id: string
        }
        Insert: {
          bubble_id?: string | null
          created_at?: string | null
          created_by?: string | null
          enviado?: boolean
          fecha_envio?: string | null
          fecha_fin: string
          fecha_inicio: string
          id?: string
          pdf_url?: string | null
          tenant_id: string
        }
        Update: {
          bubble_id?: string | null
          created_at?: string | null
          created_by?: string | null
          enviado?: boolean
          fecha_envio?: string | null
          fecha_fin?: string
          fecha_inicio?: string
          id?: string
          pdf_url?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sst_epp_reporte_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sst_epp_reporte_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      sst_incidente: {
        Row: {
          bubble_id: string | null
          consecutivo: number | null
          created_at: string | null
          descripcion: string | null
          fecha_hora: string | null
          id: string
          involucra_contratista: boolean | null
          involucra_trabajador: boolean | null
          lugar_exacto: string | null
          pdf_url: string | null
          tenant_id: string | null
          tipo_atencion: string | null
        }
        Insert: {
          bubble_id?: string | null
          consecutivo?: number | null
          created_at?: string | null
          descripcion?: string | null
          fecha_hora?: string | null
          id?: string
          involucra_contratista?: boolean | null
          involucra_trabajador?: boolean | null
          lugar_exacto?: string | null
          pdf_url?: string | null
          tenant_id?: string | null
          tipo_atencion?: string | null
        }
        Update: {
          bubble_id?: string | null
          consecutivo?: number | null
          created_at?: string | null
          descripcion?: string | null
          fecha_hora?: string | null
          id?: string
          involucra_contratista?: boolean | null
          involucra_trabajador?: boolean | null
          lugar_exacto?: string | null
          pdf_url?: string | null
          tenant_id?: string | null
          tipo_atencion?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sst_incidente_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      sst_incidente_trabajador: {
        Row: {
          bubble_id: string | null
          created_at: string | null
          gravedad: string | null
          id: string
          incidente_id: string | null
          lesion_tipo: string | null
          trabajador_id: string | null
        }
        Insert: {
          bubble_id?: string | null
          created_at?: string | null
          gravedad?: string | null
          id?: string
          incidente_id?: string | null
          lesion_tipo?: string | null
          trabajador_id?: string | null
        }
        Update: {
          bubble_id?: string | null
          created_at?: string | null
          gravedad?: string | null
          id?: string
          incidente_id?: string | null
          lesion_tipo?: string | null
          trabajador_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sst_incidente_trabajador_incidente_id_fkey"
            columns: ["incidente_id"]
            isOneToOne: false
            referencedRelation: "sst_incidente"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sst_incidente_trabajador_trabajador_id_fkey"
            columns: ["trabajador_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tareas: {
        Row: {
          asignado_a: string | null
          bubble_id: string | null
          cliente_id: string | null
          cliente_nombre: string | null
          codigo: string | null
          contacto_id: string | null
          cotizacion_id: string | null
          cotizacion_item_id: string | null
          cotizacion_ref: string | null
          created_at: string
          created_by: string | null
          descripcion: string | null
          estado: string
          hora_fin: string | null
          hora_inicio: string | null
          id: string
          is_active: boolean
          prioridad: string
          servicio_ref: string | null
          sitio: string | null
          sitio_id: string | null
          tenant_id: string
          tipo_tarea: string | null
          titulo: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          asignado_a?: string | null
          bubble_id?: string | null
          cliente_id?: string | null
          cliente_nombre?: string | null
          codigo?: string | null
          contacto_id?: string | null
          cotizacion_id?: string | null
          cotizacion_item_id?: string | null
          cotizacion_ref?: string | null
          created_at?: string
          created_by?: string | null
          descripcion?: string | null
          estado?: string
          hora_fin?: string | null
          hora_inicio?: string | null
          id?: string
          is_active?: boolean
          prioridad?: string
          servicio_ref?: string | null
          sitio?: string | null
          sitio_id?: string | null
          tenant_id: string
          tipo_tarea?: string | null
          titulo: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          asignado_a?: string | null
          bubble_id?: string | null
          cliente_id?: string | null
          cliente_nombre?: string | null
          codigo?: string | null
          contacto_id?: string | null
          cotizacion_id?: string | null
          cotizacion_item_id?: string | null
          cotizacion_ref?: string | null
          created_at?: string
          created_by?: string | null
          descripcion?: string | null
          estado?: string
          hora_fin?: string | null
          hora_inicio?: string | null
          id?: string
          is_active?: boolean
          prioridad?: string
          servicio_ref?: string | null
          sitio?: string | null
          sitio_id?: string | null
          tenant_id?: string
          tipo_tarea?: string | null
          titulo?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tareas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "terceros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tareas_contacto_id_fkey"
            columns: ["contacto_id"]
            isOneToOne: false
            referencedRelation: "terceros_contactos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tareas_cotizacion_id_fkey"
            columns: ["cotizacion_id"]
            isOneToOne: false
            referencedRelation: "cotizaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tareas_cotizacion_id_fkey"
            columns: ["cotizacion_id"]
            isOneToOne: false
            referencedRelation: "view_valoraciones_ventas"
            referencedColumns: ["cotizacion_id"]
          },
          {
            foreignKeyName: "tareas_sitio_id_fkey"
            columns: ["sitio_id"]
            isOneToOne: false
            referencedRelation: "terceros_sitios"
            referencedColumns: ["id"]
          },
        ]
      }
      tareas_comentarios: {
        Row: {
          comentario: string
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          tarea_id: string
          tenant_id: string
        }
        Insert: {
          comentario: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          tarea_id: string
          tenant_id: string
        }
        Update: {
          comentario?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          tarea_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tareas_comentarios_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "tareas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tareas_comentarios_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_app_historial"
            referencedColumns: ["tarea_id"]
          },
          {
            foreignKeyName: "tareas_comentarios_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_app_plan"
            referencedColumns: ["tarea_id"]
          },
          {
            foreignKeyName: "tareas_comentarios_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_tareas_agenda_diaria"
            referencedColumns: ["tarea_id"]
          },
          {
            foreignKeyName: "tareas_comentarios_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_valoraciones_compras"
            referencedColumns: ["tarea_id"]
          },
          {
            foreignKeyName: "tareas_comentarios_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_valoraciones_ventas"
            referencedColumns: ["tarea_id"]
          },
        ]
      }
      tareas_fechas: {
        Row: {
          bubble_id: string | null
          created_at: string | null
          fecha_fin: string | null
          fecha_inicio: string | null
          fechas_multiples: string[] | null
          id: string
          is_active: boolean
          notas: string | null
          tarea_id: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          bubble_id?: string | null
          created_at?: string | null
          fecha_fin?: string | null
          fecha_inicio?: string | null
          fechas_multiples?: string[] | null
          id?: string
          is_active?: boolean
          notas?: string | null
          tarea_id?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          bubble_id?: string | null
          created_at?: string | null
          fecha_fin?: string | null
          fecha_inicio?: string | null
          fechas_multiples?: string[] | null
          id?: string
          is_active?: boolean
          notas?: string | null
          tarea_id?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tareas_fechas_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "tareas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tareas_fechas_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_app_historial"
            referencedColumns: ["tarea_id"]
          },
          {
            foreignKeyName: "tareas_fechas_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_app_plan"
            referencedColumns: ["tarea_id"]
          },
          {
            foreignKeyName: "tareas_fechas_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_tareas_agenda_diaria"
            referencedColumns: ["tarea_id"]
          },
          {
            foreignKeyName: "tareas_fechas_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_valoraciones_compras"
            referencedColumns: ["tarea_id"]
          },
          {
            foreignKeyName: "tareas_fechas_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_valoraciones_ventas"
            referencedColumns: ["tarea_id"]
          },
        ]
      }
      tareas_recursos: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          maquinaria_id: string | null
          personal_id: string | null
          proveedor_id: string | null
          recurso_externo_nombre: string | null
          tarea_fecha_id: string | null
          tarea_id: string | null
          tenant_id: string
          tipo_recurso: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          maquinaria_id?: string | null
          personal_id?: string | null
          proveedor_id?: string | null
          recurso_externo_nombre?: string | null
          tarea_fecha_id?: string | null
          tarea_id?: string | null
          tenant_id: string
          tipo_recurso: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          maquinaria_id?: string | null
          personal_id?: string | null
          proveedor_id?: string | null
          recurso_externo_nombre?: string | null
          tarea_fecha_id?: string | null
          tarea_id?: string | null
          tenant_id?: string
          tipo_recurso?: string
        }
        Relationships: [
          {
            foreignKeyName: "tareas_recursos_maquinaria_id_fkey"
            columns: ["maquinaria_id"]
            isOneToOne: false
            referencedRelation: "maquinarias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tareas_recursos_maquinaria_id_fkey"
            columns: ["maquinaria_id"]
            isOneToOne: false
            referencedRelation: "view_valoraciones_compras"
            referencedColumns: ["maquinaria_id"]
          },
          {
            foreignKeyName: "tareas_recursos_maquinaria_id_fkey"
            columns: ["maquinaria_id"]
            isOneToOne: false
            referencedRelation: "view_valoraciones_ventas"
            referencedColumns: ["maquinaria_id"]
          },
          {
            foreignKeyName: "tareas_recursos_personal_id_fkey"
            columns: ["personal_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tareas_recursos_proveedor_id_fkey"
            columns: ["proveedor_id"]
            isOneToOne: false
            referencedRelation: "terceros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tareas_recursos_tarea_fecha_id_fkey"
            columns: ["tarea_fecha_id"]
            isOneToOne: false
            referencedRelation: "mv_planificacion_diaria"
            referencedColumns: ["tarea_fecha_id"]
          },
          {
            foreignKeyName: "tareas_recursos_tarea_fecha_id_fkey"
            columns: ["tarea_fecha_id"]
            isOneToOne: false
            referencedRelation: "tareas_fechas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tareas_recursos_tarea_fecha_id_fkey"
            columns: ["tarea_fecha_id"]
            isOneToOne: false
            referencedRelation: "view_app_historial"
            referencedColumns: ["tarea_fecha_id"]
          },
          {
            foreignKeyName: "tareas_recursos_tarea_fecha_id_fkey"
            columns: ["tarea_fecha_id"]
            isOneToOne: false
            referencedRelation: "view_app_plan"
            referencedColumns: ["tarea_fecha_id"]
          },
          {
            foreignKeyName: "tareas_recursos_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "tareas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tareas_recursos_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_app_historial"
            referencedColumns: ["tarea_id"]
          },
          {
            foreignKeyName: "tareas_recursos_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_app_plan"
            referencedColumns: ["tarea_id"]
          },
          {
            foreignKeyName: "tareas_recursos_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_tareas_agenda_diaria"
            referencedColumns: ["tarea_id"]
          },
          {
            foreignKeyName: "tareas_recursos_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_valoraciones_compras"
            referencedColumns: ["tarea_id"]
          },
          {
            foreignKeyName: "tareas_recursos_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_valoraciones_ventas"
            referencedColumns: ["tarea_id"]
          },
        ]
      }
      tasas_cambio: {
        Row: {
          bubble_id: string | null
          created_at: string | null
          created_by: string | null
          fecha_vigencia: string
          id: string
          is_active: boolean | null
          moneda_destino: string
          moneda_origen: string
          tasa: number
          tenant_id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          bubble_id?: string | null
          created_at?: string | null
          created_by?: string | null
          fecha_vigencia: string
          id?: string
          is_active?: boolean | null
          moneda_destino: string
          moneda_origen: string
          tasa: number
          tenant_id: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          bubble_id?: string | null
          created_at?: string | null
          created_by?: string | null
          fecha_vigencia?: string
          id?: string
          is_active?: boolean | null
          moneda_destino?: string
          moneda_origen?: string
          tasa?: number
          tenant_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasas_cambio_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          bubble_id: string | null
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          joined_at: string | null
          member_type: string | null
          profile_id: string | null
          team_id: string | null
          tenant_id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          bubble_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          joined_at?: string | null
          member_type?: string | null
          profile_id?: string | null
          team_id?: string | null
          tenant_id: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          bubble_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          joined_at?: string | null
          member_type?: string | null
          profile_id?: string | null
          team_id?: string | null
          tenant_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          bubble_id: string | null
          code: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          leader_id: string | null
          name: string
          tenant_id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          bubble_id?: string | null
          code?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          leader_id?: string | null
          name: string
          tenant_id: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          bubble_id?: string | null
          code?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          leader_id?: string | null
          name?: string
          tenant_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teams_leader_id_fkey"
            columns: ["leader_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      terceros: {
        Row: {
          activo: boolean | null
          bubble_id: string | null
          con_informe: boolean | null
          condicion: string | null
          condicion_sunat: string | null
          created_at: string | null
          created_by: string | null
          direccion: string | null
          email: string | null
          estado: string | null
          estado_sunat: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          nombre_comercial: string | null
          pais_id: string | null
          razon_social: string
          rubro: string | null
          rubro_id: string | null
          ruc: string | null
          telefono: string | null
          tenant_id: string
          tipo: string | null
          ubicacion_ciudad: string | null
          ubicacion_departamento: string | null
          ubicacion_pais: string | null
          ubigeo_codigo: string | null
          updated_at: string | null
          updated_by: string | null
          vendedor_asignado_id: string | null
        }
        Insert: {
          activo?: boolean | null
          bubble_id?: string | null
          con_informe?: boolean | null
          condicion?: string | null
          condicion_sunat?: string | null
          created_at?: string | null
          created_by?: string | null
          direccion?: string | null
          email?: string | null
          estado?: string | null
          estado_sunat?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          nombre_comercial?: string | null
          pais_id?: string | null
          razon_social: string
          rubro?: string | null
          rubro_id?: string | null
          ruc?: string | null
          telefono?: string | null
          tenant_id: string
          tipo?: string | null
          ubicacion_ciudad?: string | null
          ubicacion_departamento?: string | null
          ubicacion_pais?: string | null
          ubigeo_codigo?: string | null
          updated_at?: string | null
          updated_by?: string | null
          vendedor_asignado_id?: string | null
        }
        Update: {
          activo?: boolean | null
          bubble_id?: string | null
          con_informe?: boolean | null
          condicion?: string | null
          condicion_sunat?: string | null
          created_at?: string | null
          created_by?: string | null
          direccion?: string | null
          email?: string | null
          estado?: string | null
          estado_sunat?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          nombre_comercial?: string | null
          pais_id?: string | null
          razon_social?: string
          rubro?: string | null
          rubro_id?: string | null
          ruc?: string | null
          telefono?: string | null
          tenant_id?: string
          tipo?: string | null
          ubicacion_ciudad?: string | null
          ubicacion_departamento?: string | null
          ubicacion_pais?: string | null
          ubigeo_codigo?: string | null
          updated_at?: string | null
          updated_by?: string | null
          vendedor_asignado_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "terceros_pais_id_fkey"
            columns: ["pais_id"]
            isOneToOne: false
            referencedRelation: "paises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "terceros_rubro_id_fkey"
            columns: ["rubro_id"]
            isOneToOne: false
            referencedRelation: "rubros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "terceros_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "terceros_ubigeo_codigo_fkey"
            columns: ["ubigeo_codigo"]
            isOneToOne: false
            referencedRelation: "ubigeo"
            referencedColumns: ["codigo"]
          },
        ]
      }
      terceros_contactos: {
        Row: {
          area: string | null
          area_id: string | null
          bubble_id: string | null
          cargo: string | null
          cargo_id: string | null
          created_at: string | null
          created_by: string | null
          email: string | null
          id: string
          is_active: boolean | null
          nombre_completo: string
          telefono: string | null
          tenant_id: string
          tercero_id: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          area?: string | null
          area_id?: string | null
          bubble_id?: string | null
          cargo?: string | null
          cargo_id?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          nombre_completo: string
          telefono?: string | null
          tenant_id: string
          tercero_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          area?: string | null
          area_id?: string | null
          bubble_id?: string | null
          cargo?: string | null
          cargo_id?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          nombre_completo?: string
          telefono?: string | null
          tenant_id?: string
          tercero_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "terceros_contactos_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "terceros_contactos_tercero_id_fkey"
            columns: ["tercero_id"]
            isOneToOne: false
            referencedRelation: "terceros"
            referencedColumns: ["id"]
          },
        ]
      }
      terceros_personal: {
        Row: {
          apellidos: string
          bubble_id: string | null
          cargo: string | null
          created_at: string | null
          created_by: string | null
          email: string | null
          firma_url: string | null
          foto_url: string | null
          id: string
          is_active: boolean | null
          nombres: string
          numero_doc: string | null
          pais_nacionalidad: string | null
          pin: string | null
          telefono: string | null
          tenant_id: string
          tercero_id: string | null
          tipo_doc: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          apellidos: string
          bubble_id?: string | null
          cargo?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          firma_url?: string | null
          foto_url?: string | null
          id?: string
          is_active?: boolean | null
          nombres: string
          numero_doc?: string | null
          pais_nacionalidad?: string | null
          pin?: string | null
          telefono?: string | null
          tenant_id: string
          tercero_id?: string | null
          tipo_doc?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          apellidos?: string
          bubble_id?: string | null
          cargo?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          firma_url?: string | null
          foto_url?: string | null
          id?: string
          is_active?: boolean | null
          nombres?: string
          numero_doc?: string | null
          pais_nacionalidad?: string | null
          pin?: string | null
          telefono?: string | null
          tenant_id?: string
          tercero_id?: string | null
          tipo_doc?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "terceros_personal_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "terceros_personal_tercero_id_fkey"
            columns: ["tercero_id"]
            isOneToOne: false
            referencedRelation: "terceros"
            referencedColumns: ["id"]
          },
        ]
      }
      terceros_sitios: {
        Row: {
          bubble_id: string | null
          ciudad: string | null
          codigo: string | null
          comentarios: string | null
          created_at: string | null
          created_by: string | null
          direccion: string | null
          id: string
          is_active: boolean | null
          latitud: number | null
          longitud: number | null
          nombre: string
          tenant_id: string
          tercero_id: string | null
          tipo: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          bubble_id?: string | null
          ciudad?: string | null
          codigo?: string | null
          comentarios?: string | null
          created_at?: string | null
          created_by?: string | null
          direccion?: string | null
          id?: string
          is_active?: boolean | null
          latitud?: number | null
          longitud?: number | null
          nombre: string
          tenant_id: string
          tercero_id?: string | null
          tipo?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          bubble_id?: string | null
          ciudad?: string | null
          codigo?: string | null
          comentarios?: string | null
          created_at?: string | null
          created_by?: string | null
          direccion?: string | null
          id?: string
          is_active?: boolean | null
          latitud?: number | null
          longitud?: number | null
          nombre?: string
          tenant_id?: string
          tercero_id?: string | null
          tipo?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "terceros_sitios_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "terceros_sitios_tercero_id_fkey"
            columns: ["tercero_id"]
            isOneToOne: false
            referencedRelation: "terceros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "terceros_sitios_tipo_fkey"
            columns: ["tipo"]
            isOneToOne: false
            referencedRelation: "sitios_tipo"
            referencedColumns: ["id"]
          },
        ]
      }
      terceros_sitios_rel: {
        Row: {
          bubble_id: string | null
          created_at: string
          created_by: string | null
          id: string
          sitio_id: string
          tenant_id: string
          tercero_id: string
        }
        Insert: {
          bubble_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          sitio_id: string
          tenant_id?: string
          tercero_id: string
        }
        Update: {
          bubble_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          sitio_id?: string
          tenant_id?: string
          tercero_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "terceros_sitios_rel_sitio_id_fkey"
            columns: ["sitio_id"]
            isOneToOne: false
            referencedRelation: "terceros_sitios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "terceros_sitios_rel_tercero_id_fkey"
            columns: ["tercero_id"]
            isOneToOne: false
            referencedRelation: "terceros"
            referencedColumns: ["id"]
          },
        ]
      }
      terceros_tipos: {
        Row: {
          bubble_id: string | null
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          nombre: string
          tenant_id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          bubble_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          nombre: string
          tenant_id: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          bubble_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          nombre?: string
          tenant_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      tickets_soporte: {
        Row: {
          cerrado_at: string | null
          cerrado_por_id: string | null
          como_se_previene: string | null
          created_at: string
          criticidad: string
          descripcion: string
          estado: string
          explicacion_no_tecnica: string | null
          id: string
          imagenes_problema: Json
          imagenes_pruebas_exitosas: Json
          imagenes_replica_dev: Json
          numero: number
          seccion: string
          sistema: string
          tenant_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cerrado_at?: string | null
          cerrado_por_id?: string | null
          como_se_previene?: string | null
          created_at?: string
          criticidad?: string
          descripcion: string
          estado?: string
          explicacion_no_tecnica?: string | null
          id?: string
          imagenes_problema?: Json
          imagenes_pruebas_exitosas?: Json
          imagenes_replica_dev?: Json
          numero: number
          seccion: string
          sistema?: string
          tenant_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cerrado_at?: string | null
          cerrado_por_id?: string | null
          como_se_previene?: string | null
          created_at?: string
          criticidad?: string
          descripcion?: string
          estado?: string
          explicacion_no_tecnica?: string | null
          id?: string
          imagenes_problema?: Json
          imagenes_pruebas_exitosas?: Json
          imagenes_replica_dev?: Json
          numero?: number
          seccion?: string
          sistema?: string
          tenant_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_soporte_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets_soporte_respuestas: {
        Row: {
          created_at: string
          es_de_soporte: boolean
          estado_nuevo: string | null
          id: string
          imagenes: Json
          mensaje: string
          tenant_id: string
          ticket_id: string
          tipo: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          es_de_soporte?: boolean
          estado_nuevo?: string | null
          id?: string
          imagenes?: Json
          mensaje: string
          tenant_id: string
          ticket_id: string
          tipo?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          es_de_soporte?: boolean
          estado_nuevo?: string | null
          id?: string
          imagenes?: Json
          mensaje?: string
          tenant_id?: string
          ticket_id?: string
          tipo?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tickets_soporte_respuestas_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_soporte_respuestas_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets_soporte"
            referencedColumns: ["id"]
          },
        ]
      }
      tiempo_unidades: {
        Row: {
          bubble_id: string | null
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          nombre: string
          tenant_id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          bubble_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          nombre: string
          tenant_id: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          bubble_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          nombre?: string
          tenant_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      tipos_precio: {
        Row: {
          bubble_id: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          nombre: string
          nombre_campo_adicional: string | null
          orden: number | null
          requiere_campo_adicional: boolean | null
          tenant_id: string | null
        }
        Insert: {
          bubble_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          nombre: string
          nombre_campo_adicional?: string | null
          orden?: number | null
          requiere_campo_adicional?: boolean | null
          tenant_id?: string | null
        }
        Update: {
          bubble_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          nombre?: string
          nombre_campo_adicional?: string | null
          orden?: number | null
          requiere_campo_adicional?: boolean | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tipos_precio_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      trial_emails_log: {
        Row: {
          dia: number
          id: string
          sent_at: string
          tenant_id: string
        }
        Insert: {
          dia: number
          id?: string
          sent_at?: string
          tenant_id: string
        }
        Update: {
          dia?: number
          id?: string
          sent_at?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trial_emails_log_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      ubigeo: {
        Row: {
          codigo: string
          departamento: string
          distrito: string
          is_active: boolean | null
          provincia: string
        }
        Insert: {
          codigo: string
          departamento: string
          distrito: string
          is_active?: boolean | null
          provincia: string
        }
        Update: {
          codigo?: string
          departamento?: string
          distrito?: string
          is_active?: boolean | null
          provincia?: string
        }
        Relationships: []
      }
      user_documents: {
        Row: {
          bubble_id: string | null
          content_type: string | null
          created_at: string
          created_by: string | null
          document_type_id: string
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          is_active: boolean | null
          migration_status: string | null
          modified_at: string | null
          modified_by: string | null
          tenant_id: string
          user_id: string
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          bubble_id?: string | null
          content_type?: string | null
          created_at?: string
          created_by?: string | null
          document_type_id: string
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          is_active?: boolean | null
          migration_status?: string | null
          modified_at?: string | null
          modified_by?: string | null
          tenant_id: string
          user_id: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          bubble_id?: string | null
          content_type?: string | null
          created_at?: string
          created_by?: string | null
          document_type_id?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          is_active?: boolean | null
          migration_status?: string | null
          modified_at?: string | null
          modified_by?: string | null
          tenant_id?: string
          user_id?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_documents_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_documents_document_type_id_fkey"
            columns: ["document_type_id"]
            isOneToOne: false
            referencedRelation: "document_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_documents_modified_by_fkey"
            columns: ["modified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_documents_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      valorizaciones: {
        Row: {
          bubble_id: string | null
          cant_servicios: number | null
          cantidad_a_facturar: number | null
          cantidad_del_informe: number | null
          cantidad_minima: number | null
          codigo: string | null
          created_at: string | null
          created_by: string | null
          estado: string | null
          fecha: string | null
          id: string
          maquinaria_horas_id: string | null
          pdf_generado_at: string | null
          pdf_url: string | null
          precio_unitario: number | null
          reporte_maquinaria_id: string | null
          reporte_virtual: boolean | null
          servicio: string | null
          subtotal: number | null
          tenant_id: string
          tipo_precio: string | null
          updated_at: string | null
        }
        Insert: {
          bubble_id?: string | null
          cant_servicios?: number | null
          cantidad_a_facturar?: number | null
          cantidad_del_informe?: number | null
          cantidad_minima?: number | null
          codigo?: string | null
          created_at?: string | null
          created_by?: string | null
          estado?: string | null
          fecha?: string | null
          id?: string
          maquinaria_horas_id?: string | null
          pdf_generado_at?: string | null
          pdf_url?: string | null
          precio_unitario?: number | null
          reporte_maquinaria_id?: string | null
          reporte_virtual?: boolean | null
          servicio?: string | null
          subtotal?: number | null
          tenant_id: string
          tipo_precio?: string | null
          updated_at?: string | null
        }
        Update: {
          bubble_id?: string | null
          cant_servicios?: number | null
          cantidad_a_facturar?: number | null
          cantidad_del_informe?: number | null
          cantidad_minima?: number | null
          codigo?: string | null
          created_at?: string | null
          created_by?: string | null
          estado?: string | null
          fecha?: string | null
          id?: string
          maquinaria_horas_id?: string | null
          pdf_generado_at?: string | null
          pdf_url?: string | null
          precio_unitario?: number | null
          reporte_maquinaria_id?: string | null
          reporte_virtual?: boolean | null
          servicio?: string | null
          subtotal?: number | null
          tenant_id?: string
          tipo_precio?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "valorizaciones_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "valorizaciones_maquinaria_horas_id_fkey"
            columns: ["maquinaria_horas_id"]
            isOneToOne: false
            referencedRelation: "maquinaria_horas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "valorizaciones_reporte_maquinaria_id_fkey"
            columns: ["reporte_maquinaria_id"]
            isOneToOne: false
            referencedRelation: "reportes_maquinaria"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "valorizaciones_reporte_maquinaria_id_fkey"
            columns: ["reporte_maquinaria_id"]
            isOneToOne: false
            referencedRelation: "view_valoraciones_compras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "valorizaciones_reporte_maquinaria_id_fkey"
            columns: ["reporte_maquinaria_id"]
            isOneToOne: false
            referencedRelation: "view_valoraciones_compras"
            referencedColumns: ["reporte_id"]
          },
          {
            foreignKeyName: "valorizaciones_reporte_maquinaria_id_fkey"
            columns: ["reporte_maquinaria_id"]
            isOneToOne: false
            referencedRelation: "view_valoraciones_ventas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "valorizaciones_reporte_maquinaria_id_fkey"
            columns: ["reporte_maquinaria_id"]
            isOneToOne: false
            referencedRelation: "view_valoraciones_ventas"
            referencedColumns: ["reporte_id"]
          },
        ]
      }
    }
    Views: {
      mv_planificacion_diaria: {
        Row: {
          autor_nombre: string | null
          cliente_nombre: string | null
          codigo: string | null
          cotizacion_cod: string | null
          estado: string | null
          fecha: string | null
          fecha_fin: string | null
          fecha_inicio: string | null
          fechas_multiples: string[] | null
          hora_fin: string | null
          hora_inicio: string | null
          inspeccion_ids: string[] | null
          maquinaria_count: number | null
          maquinaria_ids: string[] | null
          notas: string | null
          personal_count: number | null
          personal_ids: string[] | null
          personal_nombres: string[] | null
          prioridad: string | null
          reporte_combustible_ids: string[] | null
          reporte_maquinaria_ids: string[] | null
          reporte_personal_ids: string[] | null
          sitio: string | null
          tarea_created_at: string | null
          tarea_fecha_id: string | null
          tarea_id: string | null
          tenant_id: string | null
          titulo: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tareas_fechas_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "tareas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tareas_fechas_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_app_historial"
            referencedColumns: ["tarea_id"]
          },
          {
            foreignKeyName: "tareas_fechas_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_app_plan"
            referencedColumns: ["tarea_id"]
          },
          {
            foreignKeyName: "tareas_fechas_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_tareas_agenda_diaria"
            referencedColumns: ["tarea_id"]
          },
          {
            foreignKeyName: "tareas_fechas_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_valoraciones_compras"
            referencedColumns: ["tarea_id"]
          },
          {
            foreignKeyName: "tareas_fechas_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "view_valoraciones_ventas"
            referencedColumns: ["tarea_id"]
          },
        ]
      }
      view_app_historial: {
        Row: {
          cliente_nombre: string | null
          codigo: string | null
          estado: string | null
          fecha: string | null
          fecha_fin: string | null
          fecha_inicio: string | null
          inspeccion_ids: string[] | null
          maquinaria_nombres: string[] | null
          personal_ids: string[] | null
          personal_nombres: string[] | null
          reporte_combustible_ids: string[] | null
          reporte_maquinaria_ids: string[] | null
          reporte_personal_ids: string[] | null
          sitio_nombre: string | null
          tarea_fecha_id: string | null
          tarea_id: string | null
          tenant_id: string | null
          titulo: string | null
        }
        Relationships: []
      }
      view_app_plan: {
        Row: {
          cliente_nombre: string | null
          codigo: string | null
          estado: string | null
          fecha: string | null
          fecha_fin: string | null
          fecha_inicio: string | null
          maquinaria_nombres: string[] | null
          notas: string | null
          personal_ids: string[] | null
          personal_nombres: string[] | null
          sitio_nombre: string | null
          tarea_fecha_id: string | null
          tarea_id: string | null
          tenant_id: string | null
          titulo: string | null
        }
        Relationships: []
      }
      view_compras_pendiente_valorizar: {
        Row: {
          cantidad: number | null
          fecha_antiguo: string | null
          horas_totales: number | null
          proveedor_id: string | null
          proveedor_nombre: string | null
          tenant_id: string | null
        }
        Relationships: []
      }
      view_compras_pendientes_facturar: {
        Row: {
          fecha_valoracion_mas_antigua: string | null
          monto_pendiente: number | null
          proveedor: string | null
          proveedor_id: string | null
          tenant_id: string | null
          valoraciones: number | null
        }
        Relationships: []
      }
      view_tareas_agenda_diaria: {
        Row: {
          asignado_a: string | null
          fecha_programada: string | null
          fecha_programada_fin: string | null
          tarea_id: string | null
          tenant_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tareas_recursos_personal_id_fkey"
            columns: ["asignado_a"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      view_valoraciones_compras: {
        Row: {
          cant_fact: number | null
          cliente: string | null
          cliente_id: string | null
          cotizacion: string | null
          descripcion: string | null
          dia: string | null
          estado: string | null
          factura: string | null
          fecha: string | null
          hrs_min: number | null
          hrs_recc: number | null
          hrs_trab: number | null
          id: string | null
          informe: string | null
          jornada: string | null
          lugar: string | null
          maquinaria: string | null
          maquinaria_id: string | null
          moneda: string | null
          precio_unit: number | null
          proveedor: string | null
          proveedor_id: string | null
          reporte_id: string | null
          tarea_id: string | null
          tenant_id: string | null
          total: number | null
          valoracion: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tareas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "terceros"
            referencedColumns: ["id"]
          },
        ]
      }
      view_valoraciones_ventas: {
        Row: {
          cant_fact: number | null
          cliente: string | null
          cliente_id: string | null
          cotizacion: string | null
          cotizacion_id: string | null
          descripcion: string | null
          dia: string | null
          estado: string | null
          factura: string | null
          fecha: string | null
          hrs_min: number | null
          hrs_recc: number | null
          hrs_trab: number | null
          id: string | null
          informe: string | null
          jornada: string | null
          lugar: string | null
          maquinaria: string | null
          maquinaria_id: string | null
          moneda: string | null
          pdf_cotizacion_url: string | null
          pdf_factura_url: string | null
          pdf_valoracion_url: string | null
          precio_unit: number | null
          reporte_id: string | null
          tarea_id: string | null
          tenant_id: string | null
          total: number | null
          valoracion: string | null
          valoracion_fv_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tareas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "terceros"
            referencedColumns: ["id"]
          },
        ]
      }
      view_ventas_pendiente_valorizar: {
        Row: {
          cantidad: number | null
          cliente_id: string | null
          cliente_nombre: string | null
          fecha_antiguo: string | null
          horas_totales: number | null
          tenant_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tareas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "terceros"
            referencedColumns: ["id"]
          },
        ]
      }
      view_ventas_pendientes_facturar: {
        Row: {
          cliente: string | null
          cliente_id: string | null
          fecha_valoracion_mas_antigua: string | null
          monto_pendiente: number | null
          tenant_id: string | null
          valoraciones: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tareas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "terceros"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      asignar_correlativo_formato_informe: {
        Args: { p_informe_id: string }
        Returns: string
      }
      check_trigger_exists: {
        Args: { p_trigger_name: string }
        Returns: boolean
      }
      create_app_release: {
        Args: {
          p_apk_url: string
          p_build_number: number
          p_forzar_actualizacion?: boolean
          p_notas_cambios: string
          p_version: string
        }
        Returns: string
      }
      current_tenant_id: { Args: never; Returns: string }
      fn_refresh_planificacion_if_pending: { Args: never; Returns: undefined }
      generate_epp_alerts: {
        Args: { p_tenant_id?: string }
        Returns: {
          inserted_d15: number
          inserted_d30: number
          inserted_vencido: number
          items_marked_pronto: number
          items_marked_vencido: number
        }[]
      }
      get_auth_company_slug: { Args: never; Returns: string }
      get_auth_role: { Args: never; Returns: string }
      get_auth_tenant_id: { Args: never; Returns: string }
      get_next_plan_accion_codigo: {
        Args: { p_tenant_id: string }
        Returns: string
      }
      get_rutas_bloqueadas: { Args: never; Returns: string[] }
      is_admin: { Args: never; Returns: boolean }
      next_ticket_soporte_numero: {
        Args: { p_tenant_id: string }
        Returns: number
      }
      postgres_fdw_disconnect: { Args: { "": string }; Returns: boolean }
      postgres_fdw_disconnect_all: { Args: never; Returns: boolean }
      postgres_fdw_get_connections: {
        Args: never
        Returns: Record<string, unknown>[]
      }
      postgres_fdw_handler: { Args: never; Returns: unknown }
      refresh_mv_planificacion: { Args: never; Returns: undefined }
      toggle_app_release_activo: {
        Args: { p_activo: boolean; p_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role:
        | "reporta_admin"
        | "admin_tenant"
        | "supervisor"
        | "member"
        | "planner"
        | "viewer"
        | "customer"
      doc_aplica_a: "vehiculo" | "maquinaria" | "todos"
      doc_type: "DNI" | "CE" | "PASSPORT" | "RUC" | "OTHER"
      document_category: "seguro" | "con_vencimiento" | "sin_vencimiento"
      maquinaria_estado: "operativo" | "mantenimiento" | "inactivo"
      maquinaria_propietario: "propio" | "tercero"
      tercero_tipo: "cliente" | "proveedor" | "ambos"
      tipo_evento_bitacora:
        | "LLEGADA_SITIO"
        | "CHECKLIST_INICIO"
        | "ARRANQUE_MOTOR"
        | "INICIO_TRABAJO"
        | "PARADA_OPERATIVA"
        | "REINICIO_TRABAJO"
        | "CARGA_COMBUSTIBLE"
        | "FIN_JORNADA"
        | "OTRO"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "reporta_admin",
        "admin_tenant",
        "supervisor",
        "member",
        "planner",
        "viewer",
        "customer",
      ],
      doc_aplica_a: ["vehiculo", "maquinaria", "todos"],
      doc_type: ["DNI", "CE", "PASSPORT", "RUC", "OTHER"],
      document_category: ["seguro", "con_vencimiento", "sin_vencimiento"],
      maquinaria_estado: ["operativo", "mantenimiento", "inactivo"],
      maquinaria_propietario: ["propio", "tercero"],
      tercero_tipo: ["cliente", "proveedor", "ambos"],
      tipo_evento_bitacora: [
        "LLEGADA_SITIO",
        "CHECKLIST_INICIO",
        "ARRANQUE_MOTOR",
        "INICIO_TRABAJO",
        "PARADA_OPERATIVA",
        "REINICIO_TRABAJO",
        "CARGA_COMBUSTIBLE",
        "FIN_JORNADA",
        "OTRO",
      ],
    },
  },
} as const
