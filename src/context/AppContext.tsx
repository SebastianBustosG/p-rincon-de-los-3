import { useAuth } from './AuthContext';
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Colacion, Insumo, Receta, Pedido, CartItem, EstadoPedido, MetodoPago, TipoEntrega } from '../types';
import { api } from '../api';

interface ClientOrderData {
  nombre: string;
  telefono: string;
  tipoEntrega: TipoEntrega;
  direccion?: string;
  metodoPago: MetodoPago;
  montoPagaCon?: number;
  observaciones: string;
}

interface CuadreCajaResumen {
  ventasTotales: number;
  costoInsumosConsumidos: number;
  utilidadBruta: number;
  margenPorcentaje: number;
  totalPedidos: number;
  pedidosEntregados: number;
  desglosePagos: {
    efectivo: number;
    transferencia: number;
    debito: number;
  };
}

interface AppContextType {
  activeModule: 'cliente' | 'cocina' | 'admin';
  setActiveModule: (module: 'cliente' | 'cocina' | 'admin') => void;
  colaciones: Colacion[];
  insumos: Insumo[];
  recetas: Receta[];
  pedidos: Pedido[];
  cart: CartItem[];
  showVanillaModal: boolean;
  setShowVanillaModal: (show: boolean) => void;
  addToCart: (colacion: Colacion, cantidad?: number) => void;
  removeFromCart: (colacionId: number) => void;
  updateCartQuantity: (colacionId: number, delta: number) => void;
  clearCart: () => void;
  calcularPorcionesDisponibles: (colacionId: number) => { porciones: number; agotado: boolean; insumoFaltante?: string };
  crearPedido: (orderData: ClientOrderData) => Promise<Pedido | null>;
  cancelarPedido: (pedidoId: number, reponerInsumos: boolean) => Promise<void>;
  cambiarEstadoPedido: (pedidoId: number, nuevoEstado: EstadoPedido) => void;
  actualizarStockInsumo: (insumoId: number, cantidadAumentarODisminuir: number) => void;
  fijarStockInsumo: (insumoId: number, nuevoStock: number) => void;
  toggleActivaColacion: (colacionId: number) => void;
  generarMensajeWhatsApp: (orderData: ClientOrderData, cartItems: CartItem[], total: number, pedido?: Pedido) => string;
  obtenerCuadreCaja: () => CuadreCajaResumen;
  orderError: string; setOrderError: (message: string) => void;
  loading: boolean; dataError: string; refresh: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { account, entered } = useAuth();
  const isAdmin = account?.role === 'administrador';
  const [activeModule, setModule] = useState<'cliente' | 'cocina' | 'admin'>('cliente');
  const setActiveModule = (module: 'cliente' | 'cocina' | 'admin') => { if (module === 'cliente' || isAdmin) setModule(module); };
  useEffect(() => { setModule('cliente'); setCart([]); setShowVanillaModal(false); }, [account?.id, entered]);
  const [showVanillaModal, setShowVanillaModal] = useState<boolean>(false);
  const [cart, setCart] = useState<CartItem[]>([]);

  const [colaciones, setColaciones] = useState<Colacion[]>([]);
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataError, setDataError] = useState('');
  const [orderError, setOrderError] = useState('');
  const generation = useRef(0);
  const orderKey = useRef<string | null>(null);
  const submitting = useRef(false);
  const refresh = useCallback(async () => {
    const current = generation.current;
    const result = await api('state/');
    if (current !== generation.current) return;
    setColaciones(result.colaciones); setInsumos(result.insumos); setRecetas(result.recetas); setPedidos(result.pedidos); setDataError('');
  }, []);
  useEffect(() => {
    generation.current += 1;
    orderKey.current = null;
    setColaciones([]); setInsumos([]); setRecetas([]); setPedidos([]); setDataError('');
    if (!entered) return;
    let active = true;
    let polling = false;
    const poll = async (initial = false) => {
      if (polling) return;
      polling = true;
      try { await refresh(); } catch (err) { if (active) setDataError(err instanceof Error ? err.message : 'No se pudieron cargar los datos.'); }
      finally { polling = false; if (initial && active) setLoading(false); }
    };
    setLoading(true); void poll(true);
    const timer = window.setInterval(() => { if (!document.hidden) void poll(); }, 5000);
    return () => { active = false; generation.current += 1; window.clearInterval(timer); };
  }, [account?.id, entered, refresh]);

  // Real-time stock calculation for any colacion based on its required ingredients
  const calcularPorcionesDisponibles = (colacionId: number) => {
    const colacion = colaciones.find(c => c.id_colacion === colacionId);
    if (!colacion || !colacion.activa_colacion) {
      return { porciones: 0, agotado: true, insumoFaltante: 'Desactivado por administración' };
    }

    const porciones = colacion.porciones_disponibles ?? 0;
    return { porciones, agotado: porciones <= 0, insumoFaltante: colacion.insumo_faltante };
  };

  // Cart Management
  const addToCart = (colacion: Colacion, cantidad = 1) => {
    const { porciones, agotado } = calcularPorcionesDisponibles(colacion.id_colacion);
    if (agotado) return;

    setCart(prev => {
      const existing = prev.find(item => item.colacion.id_colacion === colacion.id_colacion);
      if (existing) {
        const nuevaCantidad = existing.cantidad + cantidad;
        if (nuevaCantidad > porciones) return prev; // Limit to available stock
        return prev.map(item =>
          item.colacion.id_colacion === colacion.id_colacion
            ? { ...item, cantidad: nuevaCantidad }
            : item
        );
      }
      return [...prev, { colacion, cantidad: Math.min(cantidad, porciones) }];
    });
  };

  const removeFromCart = (colacionId: number) => {
    setCart(prev => prev.filter(item => item.colacion.id_colacion !== colacionId));
  };

  const updateCartQuantity = (colacionId: number, delta: number) => {
    const { porciones } = calcularPorcionesDisponibles(colacionId);
    setCart(prev => {
      return prev
        .map(item => {
          if (item.colacion.id_colacion === colacionId) {
            const nuevaCantidad = item.cantidad + delta;
            if (nuevaCantidad <= 0) return null;
            if (nuevaCantidad > porciones) return item; // Cannot exceed stock
            return { ...item, cantidad: nuevaCantidad };
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const clearCart = () => setCart([]);

  // El servidor calcula precios, valida el stock y registra pedido y consumo en una transacción.
  const crearPedido = async (orderData: ClientOrderData): Promise<Pedido | null> => {
    if (!entered || !cart.length || submitting.current) return null;
    submitting.current = true;
    setOrderError('');
    const payload = { ...orderData, items: cart.map(item => ({ id_colacion: item.colacion.id_colacion, cantidad: item.cantidad })) };
    const signature = JSON.stringify(payload);
    if (!orderKey.current?.startsWith(signature + '|')) orderKey.current = signature + '|' + crypto.randomUUID();
    try {
      const result = await api('orders/', { ...payload, solicitud_id: orderKey.current.slice(signature.length + 1) });
      clearCart(); orderKey.current = null;
      try { await refresh(); } catch { setDataError('Pedido guardado. No se pudo actualizar la vista; se reintentará automáticamente.'); }
      return result.pedido;
    } catch (err) {
      setOrderError(err instanceof Error ? err.message : 'No se pudo registrar el pedido.');
      try { await refresh(); } catch {}
      return null;
    } finally { submitting.current = false; }
  };
  const mutate = async (path: string, data: unknown): Promise<void> => {
    if (!isAdmin) return;
    try { await api(path, data); await refresh(); }
    catch (err) { alert(err instanceof Error ? err.message : 'No se pudo guardar el cambio.'); }
  };
  const cancelarPedido = async (id: number, reponerInsumos: boolean): Promise<void> => {
    if (!isAdmin) throw new Error('Solo el administrador puede cancelar pedidos.');
    await api(`orders/${id}/status/`, { estado: 'Cancelado', reponer_insumos: reponerInsumos });
    setPedidos(prev => prev.map(p => p.id_pedido === id ? { ...p, estado_pedido: 'Cancelado' } : p));
    try { await refresh(); } catch { setDataError('Pedido cancelado. No se pudo actualizar el resto de los datos; se reintentará automáticamente.'); }
  };
  const cambiarEstadoPedido = (id: number, estado: EstadoPedido) => { void mutate(`orders/${id}/status/`, { estado }); };
  const actualizarStockInsumo = (id: number, delta: number) => { void mutate(`supplies/${id}/stock/`, { delta }); };
  const fijarStockInsumo = (id: number, stock: number) => { void mutate(`supplies/${id}/stock/`, { stock }); };
  const toggleActivaColacion = (id: number) => { void mutate(`dishes/${id}/toggle/`, {}); };

  // WhatsApp Message Generator
  const generarMensajeWhatsApp = (orderData: ClientOrderData, cartItems: CartItem[], total: number, pedido?: Pedido) => {
    const fecha = new Date(pedido?.fecha_hora_pedido ?? Date.now()).toLocaleString('es-CL', { timeZone: 'America/Santiago', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    let texto = `*¡HOLA "EL RINCÓN DE LOS 3"!*\n`;
    texto += `Registré el siguiente pedido de colaciones caseras en la web:\n\n`;
    texto += `*Número de orden:* ${pedido?.codigo_pedido ?? 'Se asignará al confirmar'}\n`;
    texto += `*Fecha del pedido (Chile):* ${fecha}\n\n`;
    texto += `*Cliente:* ${orderData.nombre}\n`;
    texto += `*Teléfono:* ${orderData.telefono}\n`;
    texto += `*Modalidad:* ${orderData.tipoEntrega}\n`;
    if (orderData.tipoEntrega === 'Despacho a Domicilio' && orderData.direccion) {
      texto += `*Dirección:* ${orderData.direccion}\n`;
    }
    texto += `*Método de Pago:* ${orderData.metodoPago}\n`;
    if (orderData.metodoPago === 'Efectivo' && orderData.montoPagaCon) {
      const vuelto = orderData.montoPagaCon - total;
      texto += `*Paga con:* $${orderData.montoPagaCon.toLocaleString('es-CL')} (Vuelto: $${vuelto > 0 ? vuelto.toLocaleString('es-CL') : '0'})\n`;
    }

    texto += `\n*DETALLE DEL PEDIDO:*\n`;
    const lineas = pedido?.detalles ?? cartItems.map(item => ({ nombre_colacion: item.colacion.nombre_colacion, cantidad_detalle_pedido: item.cantidad, subtotal_detalle_pedido: item.colacion.precio_colacion * item.cantidad }));
    lineas.forEach(item => {
      texto += `• ${item.cantidad_detalle_pedido}x ${item.nombre_colacion} ($${item.subtotal_detalle_pedido.toLocaleString('es-CL')})\n`;
    });

    texto += `\n*TOTAL A PAGAR:* $${total.toLocaleString('es-CL')} CLP\n`;

    if (orderData.observaciones?.trim()) {
      texto += `\n*OBSERVACIONES / DETALLES:* \n"${orderData.observaciones.trim()}"\n`;
    }

    texto += `\nMi pedido ya está registrado en el sistema de comandas. Envío este mensaje para mantener el contacto por consultas, cambios de última hora o solicitudes de cancelación. ¡Muchas gracias!`;
    return texto;
  };

  // Daily Cash Closing (Cuadre de Caja Diario)
  const obtenerCuadreCaja = (): CuadreCajaResumen => {
    let ventasTotales = 0;
    let costoInsumosConsumidos = 0;
    let efectivo = 0;
    let transferencia = 0;
    let debito = 0;
    let pedidosEntregados = 0;

    const fechaChile = (fecha: string | Date) => new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Santiago' }).format(new Date(fecha));
    const hoy = fechaChile(new Date());
    pedidos.filter(pedido => fechaChile(pedido.fecha_hora_pedido) === hoy && pedido.estado_pedido !== 'Cancelado').forEach(pedido => {
      ventasTotales += pedido.total_pedido;
      if (pedido.estado_pedido === 'Entregado') {
        pedidosEntregados += 1;
      }

      if (pedido.metodo_pago_pedido === 'Efectivo') efectivo += pedido.total_pedido;
      if (pedido.metodo_pago_pedido === 'Transferencia') transferencia += pedido.total_pedido;
      if (pedido.metodo_pago_pedido === 'Débito') debito += pedido.total_pedido;

      pedido.detalles.forEach(det => { costoInsumosConsumidos += det.costo_insumos ?? 0; });
    });

    const utilidadBruta = ventasTotales - costoInsumosConsumidos;
    const margenPorcentaje = ventasTotales > 0 ? Math.round((utilidadBruta / ventasTotales) * 100) : 0;

    return {
      ventasTotales,
      costoInsumosConsumidos: Math.round(costoInsumosConsumidos),
      utilidadBruta: Math.round(utilidadBruta),
      margenPorcentaje,
      totalPedidos: pedidos.length,
      pedidosEntregados,
      desglosePagos: { efectivo, transferencia, debito }
    };
  };

  return (
    <AppContext.Provider
      value={{
        activeModule,
        setActiveModule,
        colaciones,
        insumos,
        recetas,
        pedidos,
        cart,
        showVanillaModal,
        setShowVanillaModal,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        calcularPorcionesDisponibles,
        crearPedido,
        cambiarEstadoPedido, cancelarPedido,
        actualizarStockInsumo,
        fijarStockInsumo,
        toggleActivaColacion,
        generarMensajeWhatsApp,
        obtenerCuadreCaja,
        loading, dataError, refresh, orderError, setOrderError,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
