import { Colacion, Insumo, Receta, Pedido, Usuario } from '../types';

export const INSUMOS_INICIALES: Insumo[] = [
  {
    id_insumo: 1,
    nombre_insumo: 'Posta Negra (Carne Vacuno)',
    unidad_medida_insumo: 'kg',
    stock_actual_insumo: 4.5,
    stock_minimo_insumo: 3.0,
    costo_unitario: 8500
  },
  {
    id_insumo: 2,
    nombre_insumo: 'Choclo Pastelero / Humero',
    unidad_medida_insumo: 'kg',
    stock_actual_insumo: 6.0,
    stock_minimo_insumo: 4.0,
    costo_unitario: 2200
  },
  {
    id_insumo: 3,
    nombre_insumo: 'Papas Chilotas',
    unidad_medida_insumo: 'kg',
    stock_actual_insumo: 8.0,
    stock_minimo_insumo: 5.0,
    costo_unitario: 1100
  },
  {
    id_insumo: 4,
    nombre_insumo: 'Zapallo Camote',
    unidad_medida_insumo: 'kg',
    stock_actual_insumo: 3.2,
    stock_minimo_insumo: 2.0,
    costo_unitario: 1400
  },
  {
    id_insumo: 5,
    nombre_insumo: 'Pechuga de Pollo Fresca',
    unidad_medida_insumo: 'kg',
    stock_actual_insumo: 5.0,
    stock_minimo_insumo: 3.5,
    costo_unitario: 5200
  },
  {
    id_insumo: 6,
    nombre_insumo: 'Arroz Grano Grueso G2',
    unidad_medida_insumo: 'kg',
    stock_actual_insumo: 7.0,
    stock_minimo_insumo: 4.0,
    costo_unitario: 1350
  },
  {
    id_insumo: 7,
    nombre_insumo: 'Porotos Tórtola',
    unidad_medida_insumo: 'kg',
    stock_actual_insumo: 1.2, // CRÍTICO: bajo stock mínimo
    stock_minimo_insumo: 3.0,
    costo_unitario: 2800
  },
  {
    id_insumo: 8,
    nombre_insumo: 'Tallarines Spaghetti N°5',
    unidad_medida_insumo: 'kg',
    stock_actual_insumo: 2.5,
    stock_minimo_insumo: 2.0,
    costo_unitario: 1200
  },
  {
    id_insumo: 9,
    nombre_insumo: 'Merluza Austral Filete',
    unidad_medida_insumo: 'kg',
    stock_actual_insumo: 0.2, // CASI AGOTADO para probar bloqueo de stock
    stock_minimo_insumo: 3.0,
    costo_unitario: 7900
  },
  {
    id_insumo: 10,
    nombre_insumo: 'Cebolla Morada / Valenzana',
    unidad_medida_insumo: 'kg',
    stock_actual_insumo: 6.5,
    stock_minimo_insumo: 4.0,
    costo_unitario: 950
  },
  {
    id_insumo: 11,
    nombre_insumo: 'Tomates Limachinos',
    unidad_medida_insumo: 'kg',
    stock_actual_insumo: 5.0,
    stock_minimo_insumo: 3.0,
    costo_unitario: 1600
  },
  {
    id_insumo: 12,
    nombre_insumo: 'Huevos de Campo Grado A',
    unidad_medida_insumo: 'un',
    stock_actual_insumo: 24,
    stock_minimo_insumo: 12,
    costo_unitario: 220
  }
];

export const COLACIONES_INICIALES: Colacion[] = [
  {
    id_colacion: 1,
    nombre_colacion: 'Pastel de Choclo Tradicional',
    descripcion_colacion: 'Pino casero de posta seleccionada, pollo deshuesado, aceituna del Huasco, huevo duro y suave pastelera de choclo dorado al horno de barro.',
    precio_colacion: 6200,
    activa_colacion: true,
    categoria: 'Especial del Día',
    imagen: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    tiempo_estimado: '15-20 min'
  },
  {
    id_colacion: 2,
    nombre_colacion: 'Cazuela de Vacuno Criolla',
    descripcion_colacion: 'Corte de tapapecho tierno, trozo generoso de zapallo camote, choclo en coronta, papa chilota, porotos verdes y caldo concentrado con chuchoca y cilantro.',
    precio_colacion: 5800,
    activa_colacion: true,
    categoria: 'Plato Tradicional',
    imagen: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80',
    tiempo_estimado: '10-15 min'
  },
  {
    id_colacion: 3,
    nombre_colacion: 'Charquicán Casero con Huevo Frito',
    descripcion_colacion: 'Guiso tradicional de carne molida magra, papa machacada, zapallo camote, choclo y arvejitas, coronado con un huevo de campo frito al punto.',
    precio_colacion: 5200,
    activa_colacion: true,
    categoria: 'Plato Tradicional',
    imagen: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=800&q=80',
    tiempo_estimado: '10-15 min'
  },
  {
    id_colacion: 4,
    nombre_colacion: 'Pollo al Jugo con Arroz y Chilena',
    descripcion_colacion: 'Trutro o pechuga tierna cocinada a fuego lento en caldo de verduras y vino blanco, acompañada de arroz graneado y ensalada a la chilena.',
    precio_colacion: 4900,
    activa_colacion: true,
    categoria: 'Especial del Día',
    imagen: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80',
    tiempo_estimado: '10-15 min'
  },
  {
    id_colacion: 5,
    nombre_colacion: 'Porotos con Riendas y Longaniza',
    descripcion_colacion: 'Guiso cremoso de porotos tórtola con tallarines, zapallo camote cocido, sofrito de cebolla con ají de color y trozo de longaniza parrillera artesanal.',
    precio_colacion: 5400,
    activa_colacion: true,
    categoria: 'Plato Tradicional',
    imagen: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=800&q=80',
    tiempo_estimado: '12-18 min'
  },
  {
    id_colacion: 6,
    nombre_colacion: 'Pescado Frito con Papas Mayo',
    descripcion_colacion: 'Filete de merluza austral con batido crujiente a la chilena, acompañado de papas mayo caseras con perejil fresco y ensalada de tomate.',
    precio_colacion: 6500,
    activa_colacion: true,
    categoria: 'Especial del Día',
    imagen: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80',
    tiempo_estimado: '15-20 min'
  }
];

export const RECETAS_INICIALES: Receta[] = [
  // Pastel de Choclo (id: 1)
  { id_receta: 1, colacion_id: 1, insumo_id: 1, nombre_receta: 'Pastel de Choclo', cantidad_necesaria_receta: 0.20 }, // 200g carne
  { id_receta: 2, colacion_id: 1, insumo_id: 2, nombre_receta: 'Pastel de Choclo', cantidad_necesaria_receta: 0.35 }, // 350g choclo
  { id_receta: 3, colacion_id: 1, insumo_id: 5, nombre_receta: 'Pastel de Choclo', cantidad_necesaria_receta: 0.15 }, // 150g pollo
  { id_receta: 4, colacion_id: 1, insumo_id: 10, nombre_receta: 'Pastel de Choclo', cantidad_necesaria_receta: 0.10 }, // 100g cebolla

  // Cazuela de Vacuno (id: 2)
  { id_receta: 5, colacion_id: 2, insumo_id: 1, nombre_receta: 'Cazuela de Vacuno', cantidad_necesaria_receta: 0.25 }, // 250g carne
  { id_receta: 6, colacion_id: 2, insumo_id: 3, nombre_receta: 'Cazuela de Vacuno', cantidad_necesaria_receta: 0.25 }, // 250g papas
  { id_receta: 7, colacion_id: 2, insumo_id: 4, nombre_receta: 'Cazuela de Vacuno', cantidad_necesaria_receta: 0.20 }, // 200g zapallo
  { id_receta: 8, colacion_id: 2, insumo_id: 2, nombre_receta: 'Cazuela de Vacuno', cantidad_necesaria_receta: 0.15 }, // 150g choclo

  // Charquicán con Huevo (id: 3)
  { id_receta: 9, colacion_id: 3, insumo_id: 1, nombre_receta: 'Charquicán Casero', cantidad_necesaria_receta: 0.15 }, // 150g carne
  { id_receta: 10, colacion_id: 3, insumo_id: 3, nombre_receta: 'Charquicán Casero', cantidad_necesaria_receta: 0.25 }, // 250g papa
  { id_receta: 11, colacion_id: 3, insumo_id: 4, nombre_receta: 'Charquicán Casero', cantidad_necesaria_receta: 0.20 }, // 200g zapallo
  { id_receta: 12, colacion_id: 3, insumo_id: 12, nombre_receta: 'Charquicán Casero', cantidad_necesaria_receta: 1 }, // 1 huevo

  // Pollo al Jugo con Arroz (id: 4)
  { id_receta: 13, colacion_id: 4, insumo_id: 5, nombre_receta: 'Pollo al Jugo', cantidad_necesaria_receta: 0.30 }, // 300g pollo
  { id_receta: 14, colacion_id: 4, insumo_id: 6, nombre_receta: 'Pollo al Jugo', cantidad_necesaria_receta: 0.12 }, // 120g arroz
  { id_receta: 15, colacion_id: 4, insumo_id: 11, nombre_receta: 'Pollo al Jugo', cantidad_necesaria_receta: 0.15 }, // 150g tomate
  { id_receta: 16, colacion_id: 4, insumo_id: 10, nombre_receta: 'Pollo al Jugo', cantidad_necesaria_receta: 0.08 }, // 80g cebolla

  // Porotos con Riendas (id: 5)
  { id_receta: 17, colacion_id: 5, insumo_id: 7, nombre_receta: 'Porotos con Riendas', cantidad_necesaria_receta: 0.20 }, // 200g porotos
  { id_receta: 18, colacion_id: 5, insumo_id: 8, nombre_receta: 'Porotos con Riendas', cantidad_necesaria_receta: 0.10 }, // 100g spaghetti
  { id_receta: 19, colacion_id: 5, insumo_id: 4, nombre_receta: 'Porotos con Riendas', cantidad_necesaria_receta: 0.15 }, // 150g zapallo

  // Pescado Frito (id: 6) - ¡Merluza tiene 0.2 kg y requiere 0.35 kg -> AGOTADO!
  { id_receta: 20, colacion_id: 6, insumo_id: 9, nombre_receta: 'Pescado Frito', cantidad_necesaria_receta: 0.35 }, // 350g merluza
  { id_receta: 21, colacion_id: 6, insumo_id: 3, nombre_receta: 'Pescado Frito', cantidad_necesaria_receta: 0.25 }, // 250g papa
  { id_receta: 22, colacion_id: 6, insumo_id: 11, nombre_receta: 'Pescado Frito', cantidad_necesaria_receta: 0.15 } // 150g tomate
];

export const PEDIDOS_INICIALES: Pedido[] = [
  {
    id_pedido: 101,
    codigo_pedido: '#PED-101',
    fecha_hora_pedido: new Date(Date.now() - 25 * 60 * 1000).toISOString(), // Hace 25 min
    nombre_cliente_pedido: 'Patricia Valenzuela',
    telefono_cliente_pedido: '+56 9 8452 1190',
    tipo_entrega: 'Despacho a Domicilio',
    direccion_entrega: 'Av. Providencia 1420, Depto 402',
    estado_pedido: 'En curso',
    metodo_pago_pedido: 'Transferencia',
    total_pedido: 12400,
    observaciones_pedido: '⚠️ Sin cebolla en la ensalada chilena. Ají cacho de cabra aparte por favor.',
    detalles: [
      {
        id_detalle_pedido: 1,
        id_pedido: 101,
        id_colacion: 1,
        nombre_colacion: 'Pastel de Choclo Tradicional',
        cantidad_detalle_pedido: 2,
        subtotal_detalle_pedido: 12400
      }
    ]
  },
  {
    id_pedido: 102,
    codigo_pedido: '#PED-102',
    fecha_hora_pedido: new Date(Date.now() - 14 * 60 * 1000).toISOString(), // Hace 14 min
    nombre_cliente_pedido: 'Rodrigo Fuentes',
    telefono_cliente_pedido: '+56 9 9231 7744',
    tipo_entrega: 'Retiro en Local',
    estado_pedido: 'Listo',
    metodo_pago_pedido: 'Efectivo',
    monto_paga_con: 20000,
    total_pedido: 11000,
    observaciones_pedido: 'Llega en 10 minutos a retirar. Lleva pebre extra si es posible.',
    detalles: [
      {
        id_detalle_pedido: 2,
        id_pedido: 102,
        id_colacion: 2,
        nombre_colacion: 'Cazuela de Vacuno Criolla',
        cantidad_detalle_pedido: 1,
        subtotal_detalle_pedido: 5800
      },
      {
        id_detalle_pedido: 3,
        id_pedido: 102,
        id_colacion: 3,
        nombre_colacion: 'Charquicán Casero con Huevo Frito',
        cantidad_detalle_pedido: 1,
        subtotal_detalle_pedido: 5200
      }
    ]
  },
  {
    id_pedido: 103,
    codigo_pedido: '#PED-103',
    fecha_hora_pedido: new Date(Date.now() - 48 * 60 * 1000).toISOString(),
    nombre_cliente_pedido: 'Carolina Morales',
    telefono_cliente_pedido: '+56 9 7612 4003',
    tipo_entrega: 'Despacho a Domicilio',
    direccion_entrega: 'Calle Los Alerces 238, Ñuñoa',
    estado_pedido: 'Entregado',
    metodo_pago_pedido: 'Débito',
    total_pedido: 9800,
    observaciones_pedido: 'Tocar timbre 2B. Bien caliente el caldo.',
    detalles: [
      {
        id_detalle_pedido: 4,
        id_pedido: 103,
        id_colacion: 4,
        nombre_colacion: 'Pollo al Jugo con Arroz y Chilena',
        cantidad_detalle_pedido: 2,
        subtotal_detalle_pedido: 9800
      }
    ]
  }
];

export const USUARIOS_INICIALES: Usuario[] = [
  { id_usuario: 1, username_usuario: 'admin_loreto', rol: 'Administradora' },
  { id_usuario: 2, username_usuario: 'chef_carlos', rol: 'Cocina' }
];
