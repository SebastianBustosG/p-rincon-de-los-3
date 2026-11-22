export interface Colacion {
  porciones_disponibles?: number;
  insumo_faltante?: string;
  id_colacion: number;
  nombre_colacion: string;
  descripcion_colacion: string;
  precio_colacion: number;
  activa_colacion: boolean;
  categoria: string;
  imagen: string;
  tiempo_estimado?: string;
}

export interface Insumo {
  id_insumo: number;
  nombre_insumo: string;
  unidad_medida_insumo: 'kg' | 'gr' | 'un' | 'lts' | 'ml';
  stock_actual_insumo: number;
  stock_minimo_insumo: number;
  costo_unitario: number; // Costo por unidad de medida en CLP
}

export interface Receta {
  id_receta: number;
  colacion_id: number;
  insumo_id: number;
  nombre_receta: string;
  cantidad_necesaria_receta: number;
}

export interface DetallePedido {
  costo_insumos?: number;
  id_detalle_pedido: number;
  id_pedido: number;
  id_colacion: number;
  nombre_colacion: string;
  cantidad_detalle_pedido: number;
  subtotal_detalle_pedido: number;
}

export type EstadoPedido = 'En curso' | 'Listo' | 'Entregado' | 'Cancelado';
export type MetodoPago = 'Efectivo' | 'Transferencia' | 'Débito';
export type TipoEntrega = 'Retiro en Local' | 'Despacho a Domicilio';

export interface Pedido {
  cliente_id?: string;
  id_pedido: number;
  codigo_pedido: string;
  fecha_hora_pedido: string;
  nombre_cliente_pedido: string;
  telefono_cliente_pedido: string;
  tipo_entrega: TipoEntrega;
  direccion_entrega?: string;
  estado_pedido: EstadoPedido;
  metodo_pago_pedido: MetodoPago;
  monto_paga_con?: number; // Para cálculo de vuelto en efectivo
  total_pedido: number;
  observaciones_pedido: string;
  detalles: DetallePedido[];
}

export interface Usuario {
  id_usuario: number;
  username_usuario: string;
  rol: 'Administradora' | 'Cocina';
}

export interface CartItem {
  colacion: Colacion;
  cantidad: number;
}
