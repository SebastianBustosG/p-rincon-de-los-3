import { nombreCompletoValido, NOMBRE_COMPLETO_ERROR, telefonoChilenoValido, TELEFONO_ERROR } from '../validation';
import { useAuth } from '../context/AuthContext';
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Colacion, TipoEntrega, MetodoPago } from '../types';
import { 
  ShoppingBag, 
  Plus, 
  Minus, 
  Trash2, 
  Send, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  User, 
  CreditCard, 
  Banknote, 
  Smartphone, 
  ArrowRight,
  Info,
  Check,
  ChefHat
} from 'lucide-react';

export const Modulo1Carta: React.FC = () => {
  const { 
    colaciones, 
    cart, 
    addToCart, 
    removeFromCart, 
    updateCartQuantity, 
    clearCart,
    calcularPorcionesDisponibles, 
    crearPedido,
    orderError, setOrderError, 
    generarMensajeWhatsApp,
    setActiveModule 
  } = useApp();

  const { account } = useAuth();
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('todas');
  
  // Checkout form state
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [tipoEntrega, setTipoEntrega] = useState<TipoEntrega>('Retiro en Local');
  const [direccion, setDireccion] = useState('');
  useEffect(() => {
    setNombre(account?.role === 'cliente' ? account.username : '');
    setTelefono(account?.role === 'cliente' ? account.telefono : '');
    setDireccion(account?.role === 'cliente' ? account.direccion : '');
  }, [account?.id, account?.username, account?.telefono, account?.direccion]);
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('Transferencia');
  const [montoPagaCon, setMontoPagaCon] = useState<string>('');
  const [observaciones, setObservaciones] = useState('');
  const [contactTouched, setContactTouched] = useState({ nombre: false, telefono: false });
  const nombreValido = nombreCompletoValido(nombre);
  const telefonoValido = telefonoChilenoValido(telefono);
  const nombreError = contactTouched.nombre && !nombreValido;
  const telefonoError = contactTouched.telefono && !telefonoValido;
  const validarContacto = () => {
    setContactTouched({ nombre: true, telefono: true });
    if (!nombreValido || !telefonoValido) {
      document.getElementById(!nombreValido ? 'pedido-nombre' : 'pedido-telefono')?.focus();
      return false;
    }
    return true;
  };

  useEffect(() => {
    setOrderError('');
  }, [nombre, telefono, direccion, tipoEntrega, metodoPago, montoPagaCon, observaciones, cart, setOrderError]);
  useEffect(() => {
    if (orderError) document.getElementById('pedido-error')?.focus();
  }, [orderError]);
  // UI state for order confirmation modal
  const [pedidoExitoso, setPedidoExitoso] = useState<any | null>(null);
  const [mostrarModalWhatsApp, setMostrarModalWhatsApp] = useState(false);
  const [whatsAppPendiente, setWhatsAppPendiente] = useState('');
  const [guardandoPedido, setGuardandoPedido] = useState(false);
  const [telefonoNegocio, setTelefonoNegocio] = useState('56912345678'); // Teléfono ficticio para WhatsApp de "El rincón de los 3"

  const categorias = ['todas', 'Especial del Día', 'Plato Tradicional'];

  const colacionesFiltradas = colaciones.filter(c => {
    if (categoriaSeleccionada === 'todas') return true;
    return c.categoria === categoriaSeleccionada;
  });

  const total = cart.reduce((acc, item) => acc + item.colacion.precio_colacion * item.cantidad, 0);

  const handleProcederWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validarContacto()) return;
    if (cart.length === 0) {
      setOrderError('Debes agregar al menos una colación al carrito.');
      return;
    }
    if (!nombre.trim()) {
      setOrderError('Por favor ingresa tu nombre.');
      return;
    }
    if (!telefono.trim()) {
      setOrderError('Por favor ingresa tu teléfono o WhatsApp de contacto.');
      return;
    }
    if (!telefonoChilenoValido(telefono)) {
      setOrderError(TELEFONO_ERROR);
      return;
    }
    if (tipoEntrega === 'Despacho a Domicilio' && !direccion.trim()) {
      setOrderError('Por favor indica tu dirección de despacho.');
      return;
    }

    setMostrarModalWhatsApp(true);
  };

  const enviarAWhatsAppReal = async () => {
    if (!validarContacto()) { setMostrarModalWhatsApp(false); return; }
    const orderData = {
      nombre,
      telefono,
      tipoEntrega,
      direccion,
      metodoPago,
      montoPagaCon: montoPagaCon ? parseInt(montoPagaCon, 10) : undefined,
      observaciones
    };



    
    if (guardandoPedido) return;
    setGuardandoPedido(true);
    const whatsappWindow = window.open('about:blank', '_blank');
    // Registrar también en el sistema para que cocina lo reciba
    const nuevoPedido = await crearPedido(orderData);
    setGuardandoPedido(false);
    if (!nuevoPedido) { whatsappWindow?.close(); setMostrarModalWhatsApp(false); return; }
    const textoMensaje = generarMensajeWhatsApp(orderData, cart, nuevoPedido.total_pedido, nuevoPedido);
    const url = `https://wa.me/${telefonoNegocio.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(textoMensaje)}`;
    setPedidoExitoso(nuevoPedido);
    setMostrarModalWhatsApp(false);

    // Abrir WhatsApp
    if (whatsappWindow) { whatsappWindow.opener = null; whatsappWindow.location.href = url; }
    else { setWhatsAppPendiente(url); }
  };

  const handleCrearPedidoDirecto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validarContacto()) return;
    if (cart.length === 0) return;
    if (!nombre.trim()) {
      setOrderError('Por favor ingresa tu nombre.');
      return;
    }
    if (!telefono.trim()) {
      setOrderError('Por favor ingresa tu teléfono de contacto.');
      return;
    }
    if (!telefonoChilenoValido(telefono)) {
      setOrderError(TELEFONO_ERROR);
      return;
    }
    if (tipoEntrega === 'Despacho a Domicilio' && !direccion.trim()) {
      setOrderError('Por favor ingresa tu dirección.');
      return;
    }

    const orderData = {
      nombre,
      telefono,
      tipoEntrega,
      direccion,
      metodoPago,
      montoPagaCon: montoPagaCon ? parseInt(montoPagaCon, 10) : undefined,
      observaciones
    };

    const nuevo = await crearPedido(orderData);
    if (nuevo) {
      setPedidoExitoso(nuevo);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      
      {/* Banner de Presentación */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 text-white p-6 sm:p-10 mb-8 shadow-md">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-medium mb-3 border border-amber-500/30">
            <Clock className="w-3.5 h-3.5" /> Colaciones Caseras de Lunes a Sábado · 11:30 a 15:30 hrs
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold tracking-tight mb-3">
            El sabor chileno que alegra tu almuerzo
          </h1>
          <p className="text-stone-300 text-sm sm:text-base leading-relaxed mb-4">
            Comida casera preparada hoy con ingredientes frescos de la vega. Haz tu pedido online y recíbelo listo o coordina tu despacho vía WhatsApp.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-stone-300">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" /> Stock verificado en tiempo real
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" /> Pedido directo a WhatsApp
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" /> Pago con Efectivo, Débito o Transferencia
            </span>
          </div>
        </div>
        <div className="absolute -right-10 -bottom-10 w-72 h-72 rounded-full bg-amber-600/10 blur-3xl pointer-events-none" />
      </section>

      {/* Main Grid: Carta de Colaciones + Carrito / Formulario Checkout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Columna Izquierda: Filtros y Catálogo de Colaciones (lg:col-span-7 o 8) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Barra de Filtros */}
          <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-stone-200">
            <div>
              <h2 className="text-xl font-bold font-serif text-stone-900">Nuestra Carta de Hoy</h2>
              <p className="text-xs text-stone-500">Selecciona tu colación y personaliza tu pedido</p>
            </div>
            
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-lg border border-stone-200">
              {categorias.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoriaSeleccionada(cat)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize ${
                    categoriaSeleccionada === cat
                      ? 'bg-white text-orange-950 shadow-xs font-semibold'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {cat === 'todas' ? 'Todos los platos' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Listado de Tarjetas de Colación */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {colacionesFiltradas.map(colacion => {
              const { porciones, agotado, insumoFaltante } = calcularPorcionesDisponibles(colacion.id_colacion);
              const enCarrito = cart.find(item => item.colacion.id_colacion === colacion.id_colacion);

              return (
                <div
                  key={colacion.id_colacion}
                  className={`group bg-white rounded-xl border transition-all duration-200 overflow-hidden flex flex-col ${
                    agotado
                      ? 'border-stone-200 opacity-75 bg-stone-50'
                      : 'border-stone-200 hover:border-orange-300 hover:shadow-md'
                  }`}
                >
                  {/* Foto de la colación */}
                  <div className="relative h-44 w-full overflow-hidden bg-stone-100">
                    <img
                      src={colacion.imagen}
                      alt={colacion.nombre_colacion}
                      className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                        agotado ? 'grayscale contrast-75' : ''
                      }`}
                      loading="lazy"
                    />
                    
                    {/* Badge de Categoría */}
                    <span className="absolute top-3 left-3 px-2 py-0.5 rounded text-[11px] font-medium bg-stone-900/80 backdrop-blur-xs text-white">
                      {colacion.categoria}
                    </span>

                    {/* Badge de Stock en tiempo real */}
                    {agotado ? (
                      <span className="absolute top-3 right-3 px-2.5 py-1 rounded-md text-xs font-bold bg-rose-600 text-white shadow-xs flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> AGOTADO
                      </span>
                    ) : porciones <= 3 ? (
                      <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md text-xs font-semibold bg-amber-500 text-white shadow-xs">
                        ¡Últimas {porciones} porciones!
                      </span>
                    ) : (
                      <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-700/90 text-white shadow-xs">
                        {porciones} disponibles
                      </span>
                    )}

                    {colacion.tiempo_estimado && (
                      <div className="absolute bottom-2 left-2 flex items-center gap-1 text-[11px] text-white/95 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded">
                        <Clock className="w-3 h-3 text-amber-300" />
                        <span>{colacion.tiempo_estimado}</span>
                      </div>
                    )}
                  </div>

                  {/* Información del plato */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-serif text-lg font-bold text-stone-900 leading-snug">
                          {colacion.nombre_colacion}
                        </h3>
                      </div>
                      <p className="text-xs text-stone-600 line-clamp-3 mb-3 leading-relaxed">
                        {colacion.descripcion_colacion}
                      </p>

                      {/* Motivo de agotado si aplica */}
                      {account?.role === 'administrador' && agotado && insumoFaltante && (
                        <div className="p-2 mb-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-rose-600" />
                          <span>Agotado por falta de insumo: <strong>{insumoFaltante}</strong></span>
                        </div>
                      )}
                    </div>

                    {/* Precio y Botón de Acción */}
                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-xs text-stone-500 block">Precio Colación</span>
                        <span className="text-lg font-bold text-amber-900 font-serif">
                          ${colacion.precio_colacion.toLocaleString('es-CL')} <span className="text-xs font-sans font-normal text-stone-500">CLP</span>
                        </span>
                      </div>

                      {agotado ? (
                        <button
                          disabled
                          className="px-3 py-2 rounded-lg text-xs font-semibold bg-stone-200 text-stone-400 cursor-not-allowed"
                        >
                          No disponible
                        </button>
                      ) : enCarrito ? (
                        <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 rounded-lg p-1">
                          <button
                            onClick={() => updateCartQuantity(colacion.id_colacion, -1)}
                            className="w-7 h-7 flex items-center justify-center rounded-md bg-white hover:bg-amber-100 text-stone-700 transition-colors shadow-2xs"
                            title="Disminuir porción"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-6 text-center text-xs font-bold text-amber-950">
                            {enCarrito.cantidad}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(colacion.id_colacion, 1)}
                            disabled={enCarrito.cantidad >= porciones}
                            className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors shadow-2xs ${
                              enCarrito.cantidad >= porciones
                                ? 'bg-stone-100 text-stone-300 cursor-not-allowed'
                                : 'bg-white hover:bg-amber-100 text-stone-700'
                            }`}
                            title="Aumentar porción"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(colacion)}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium bg-orange-700 hover:bg-orange-800 text-white transition-colors shadow-xs active:scale-98"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Agregar</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Columna Derecha: Resumen de Pedido y Formulario de Cliente (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden sticky top-24">
            
            {/* Header del Carrito */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-stone-900 to-amber-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-400" />
                <h2 className="font-serif font-bold text-base sm:text-lg">Tu Pedido de Colaciones</h2>
              </div>
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-stone-300 hover:text-rose-300 text-xs flex items-center gap-1 transition-colors"
                  title="Vaciar carrito"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Vaciar
                </button>
              )}
            </div>

            {/* Listado de ítems en el carrito */}
            <div className="p-4 sm:p-5 max-h-60 overflow-y-auto divide-y divide-stone-100">
              {cart.length === 0 ? (
                <div className="text-center py-8 text-stone-500">
                  <ShoppingBag className="w-10 h-10 mx-auto text-stone-300 mb-2 stroke-[1.5]" />
                  <p className="text-sm font-medium text-stone-700">Tu canasta está vacía</p>
                  <p className="text-xs text-stone-400 mt-1">Selecciona una colación casera del menú de hoy.</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.colacion.id_colacion} className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-stone-900 truncate">
                        {item.colacion.nombre_colacion}
                      </h4>
                      <p className="text-xs text-stone-500">
                        ${item.colacion.precio_colacion.toLocaleString('es-CL')} c/u
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center bg-stone-100 rounded-lg p-0.5 border border-stone-200">
                        <button
                          onClick={() => updateCartQuantity(item.colacion.id_colacion, -1)}
                          className="w-6 h-6 flex items-center justify-center rounded text-stone-600 hover:bg-white transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-semibold text-stone-900">
                          {item.cantidad}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.colacion.id_colacion, 1)}
                          className="w-6 h-6 flex items-center justify-center rounded text-stone-600 hover:bg-white transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-xs font-bold text-stone-900 w-16 text-right">
                        ${(item.colacion.precio_colacion * item.cantidad).toLocaleString('es-CL')}
                      </span>

                      <button
                        onClick={() => removeFromCart(item.colacion.id_colacion)}
                        className="text-stone-400 hover:text-rose-600 p-1"
                        title="Quitar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Total acumulado */}
            {cart.length > 0 && (
              <div className="px-5 py-3 bg-stone-50 border-t border-b border-stone-200 flex items-center justify-between">
                <span className="text-sm font-medium text-stone-600">Total a Pagar</span>
                <span className="text-xl font-bold font-serif text-amber-950">
                  ${total.toLocaleString('es-CL')} CLP
                </span>
              </div>
            )}

            {/* Formulario de Checkout (Datos del Cliente) */}
            <form noValidate onSubmit={account?.role === 'administrador' ? handleCrearPedidoDirecto : handleProcederWhatsApp} className="p-4 sm:p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Datos de Entrega y Contacto
              </h3>

              {orderError && <div id="pedido-error" role="alert" tabIndex={-1} className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 focus:outline-none">
                {orderError}
              </div>}
              {/* Nombre */}
              <div>
                <label htmlFor="pedido-nombre" className="block text-xs font-medium text-stone-700 mb-1">
                  Nombre y dos apellidos *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={nombre}
                    onChange={e => setNombre(e.target.value)}
                    onBlur={() => setContactTouched(prev => ({ ...prev, nombre: true }))}
                    id="pedido-nombre"
                    maxLength={40}
                    autoComplete="name"
                    aria-invalid={nombreError}
                    aria-describedby={nombreError ? 'pedido-nombre-error' : undefined}
                    placeholder="Ej. Francisca Pérez González"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                  />
                </div>
                {nombreError && <p id="pedido-nombre-error" role="alert" className="mt-1 text-xs text-red-700">{NOMBRE_COMPLETO_ERROR}</p>}
              </div>

              {/* Teléfono */}
              <div>
                <label htmlFor="pedido-telefono" className="block text-xs font-medium text-stone-700 mb-1">
                  Teléfono / WhatsApp *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    required
                    value={telefono}
                    onChange={e => { setTelefono(e.target.value); setContactTouched(prev => ({ ...prev, telefono: true })); }}
                    onBlur={() => setContactTouched(prev => ({ ...prev, telefono: true }))}
                    id="pedido-telefono"
                    maxLength={11}
                    inputMode="numeric"
                    pattern="^56[0-9]{9}$"
                    autoComplete="tel"
                    aria-invalid={telefonoError}
                    aria-describedby={telefonoError ? 'pedido-telefono-error' : undefined}
                    placeholder="Ej. 56912345678"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                  />
                </div>
                {telefonoError && <p id="pedido-telefono-error" role="alert" className="mt-1 text-xs text-red-700">{TELEFONO_ERROR}</p>}
              </div>

              {/* Tipo de Entrega */}
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1.5">
                  Modalidad de Entrega
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTipoEntrega('Retiro en Local')}
                    className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition-all ${
                      tipoEntrega === 'Retiro en Local'
                        ? 'bg-amber-50 border-amber-500 text-amber-900 font-bold'
                        : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    🏪 Retiro en Local
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipoEntrega('Despacho a Domicilio')}
                    className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition-all ${
                      tipoEntrega === 'Despacho a Domicilio'
                        ? 'bg-amber-50 border-amber-500 text-amber-900 font-bold'
                        : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    🛵 Despacho a Domicilio
                  </button>
                </div>
              </div>

              {/* Dirección si es Despacho */}
              {tipoEntrega === 'Despacho a Domicilio' && (
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Dirección de Entrega (Calle, Número, Depto/Oficina) *
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={direccion}
                      maxLength={120}
                    onChange={e => setDireccion(e.target.value)}
                      placeholder="Ej. Av. Providencia 1240, Depto 504"
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                    />
                  </div>
                </div>
              )}

              {/* Método de Pago */}
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1.5">
                  Método de Pago
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setMetodoPago('Transferencia')}
                    className={`py-2 px-2 text-[11px] sm:text-xs font-medium rounded-lg border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                      metodoPago === 'Transferencia'
                        ? 'bg-amber-50 border-amber-500 text-amber-900 font-bold'
                        : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Transferencia</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMetodoPago('Efectivo')}
                    className={`py-2 px-2 text-[11px] sm:text-xs font-medium rounded-lg border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                      metodoPago === 'Efectivo'
                        ? 'bg-amber-50 border-amber-500 text-amber-900 font-bold'
                        : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    <Banknote className="w-4 h-4" />
                    <span>Efectivo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMetodoPago('Débito')}
                    className={`py-2 px-2 text-[11px] sm:text-xs font-medium rounded-lg border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                      metodoPago === 'Débito'
                        ? 'bg-amber-50 border-amber-500 text-amber-900 font-bold'
                        : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Débito (POS)</span>
                  </button>
                </div>
              </div>

              {/* Si es efectivo, consultar con cuánto paga para vuelto */}
              {metodoPago === 'Efectivo' && (
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg">
                  <label className="block text-xs font-medium text-amber-950 mb-1">
                    ¿Con cuánto pagas? (Para llevarte el vuelto exacto)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs font-bold text-stone-500">$</span>
                    <input
                      type="number"
                      value={montoPagaCon}
                      onChange={e => setMontoPagaCon(e.target.value)}
                      placeholder={total > 0 ? `${(Math.ceil(total / 5000) * 5000)}` : '10000'}
                      className="w-full pl-7 pr-3 py-1.5 text-xs bg-white border border-amber-300 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  {montoPagaCon && parseInt(montoPagaCon, 10) > total && (
                    <p className="text-[11px] text-amber-800 mt-1 font-medium">
                      Tu vuelto será de: ${(parseInt(montoPagaCon, 10) - total).toLocaleString('es-CL')} CLP
                    </p>
                  )}
                </div>
              )}

              {/* Observaciones (Alérgenos, sin cebolla, etc.) */}
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Observaciones para la Cocina (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={observaciones}
                  maxLength={200}
                    onChange={e => setObservaciones(e.target.value)}
                  placeholder="Ej. Sin cebolla en la ensalada, caldo bien caliente, ají aparte..."
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 resize-none"
                />
              </div>

              {/* Acción de compra según el rol */}
              <div className="pt-2 space-y-2">
                {account?.role !== 'administrador' && <button
                  type="submit"
                  disabled={cart.length === 0}
                  className={`w-full py-3 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all ${
                    cart.length === 0
                      ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                      : 'bg-[#25D366] hover:bg-[#20ba5a] text-white active:scale-98 cursor-pointer'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  <span>Pedir por WhatsApp ({total > 0 ? `$${total.toLocaleString('es-CL')}` : '$0'})</span>
                </button>}

                {account?.role === 'administrador' && <button
                  type="button"
                  onClick={handleCrearPedidoDirecto}
                  disabled={cart.length === 0}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition-all ${
                    cart.length === 0
                      ? 'bg-stone-100 border-stone-200 text-stone-400 cursor-not-allowed'
                      : 'bg-stone-900 hover:bg-stone-800 text-white border-stone-900 cursor-pointer'
                  }`}
                >
                  <ChefHat className="w-4 h-4 text-amber-400" />
                  <span>Ingresar pedido a cocina (${total.toLocaleString('es-CL')})</span>
                </button>}
              </div>

            </form>
          </div>
        </div>

      </div>

      {/* MODAL DE CONFIRMACIÓN / VISTA PREVIA MENSAJE WHATSAPP */}
      {mostrarModalWhatsApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90dvh] overflow-y-auto p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#25D366]/20 text-[#25D366] flex items-center justify-center">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-stone-900">
                  Confirma tu pedido
                </h3>
                <p className="text-xs text-stone-500">
                  Revisa el detalle antes de registrar tu pedido y abrir WhatsApp.
                </p>
              </div>
            </div>

            <aside role="note" className="mb-4 rounded-xl border border-sky-200 bg-sky-50 p-3 text-sky-950">
              <div className="flex items-start gap-2">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-700" />
                <div className="text-xs leading-relaxed">
                  <p className="font-semibold mb-1">Tu pedido queda registrado al confirmar</p>
                  <p>Al pulsar <strong>Confirmar pedido y abrir WhatsApp</strong>, tu pedido se registra en nuestro sistema de comandas antes de abrir WhatsApp. No necesitas enviarlo por WhatsApp para que ingrese a cocina.</p>
                  <p className="mt-2">Envía el mensaje preparado para mantener el contacto con nosotros: podrás hacer consultas, pedir cambios de última hora o solicitar una cancelación. Los cambios y cancelaciones requieren atención del local; no se aplican automáticamente.</p>
                </div>
              </div>
            </aside>
            {/* Número WhatsApp del Negocio */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                WhatsApp de recepción "El rincón de los 3":
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-500 font-mono bg-stone-100 px-2 py-1.5 rounded-lg border border-stone-200">
                  +56 9
                </span>
                <input
                  type="text"
                  value={telefonoNegocio}
                  onChange={e => setTelefonoNegocio(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs font-mono bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-600"
                  placeholder="56912345678"
                />
              </div>
            </div>

            {/* Vista previa del mensaje formateado */}
            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 mb-5 max-h-56 overflow-y-auto">
              <p className="text-[11px] font-bold text-stone-400 uppercase mb-1">Vista Previa del Mensaje:</p>
              <pre className="text-xs text-stone-800 whitespace-pre-wrap font-sans leading-relaxed">
                {generarMensajeWhatsApp(
                  {
                    nombre,
                    telefono,
                    tipoEntrega,
                    direccion,
                    metodoPago,
                    montoPagaCon: montoPagaCon ? parseInt(montoPagaCon, 10) : undefined,
                    observaciones
                  },
                  cart,
                  total
                )}
              </pre>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setMostrarModalWhatsApp(false)}
                className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-lg"
              >
                Volver y corregir
              </button>
              <button
                type="button"
                onClick={enviarAWhatsAppReal}
                disabled={guardandoPedido}
                className="px-5 py-2.5 text-xs font-semibold bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-lg flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{guardandoPedido ? 'Registrando pedido…' : 'Confirmar pedido y abrir WhatsApp'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE ÉXITO CUANDO SE INGRESA DIRECTO A COCINA */}
      {pedidoExitoso && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center shadow-2xl border border-stone-200">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              {pedidoExitoso.codigo_pedido}
            </span>

            <h3 className="font-serif font-bold text-xl text-stone-900 mt-2 mb-1">
              ¡Pedido Ingresado con Éxito!
            </h3>
            
            <p className="text-xs text-stone-600 mb-4 leading-relaxed">
              Muchas gracias <strong>{pedidoExitoso.nombre_cliente_pedido}</strong>. ¡Estamos preparando su pedido!
            </p>

            <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 text-left text-xs mb-5 space-y-1">
              <div className="flex justify-between">
                <span className="text-stone-500">Total:</span>
                <span className="font-bold text-stone-900">${pedidoExitoso.total_pedido.toLocaleString('es-CL')} CLP</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Modalidad:</span>
                <span className="font-medium text-stone-800">{pedidoExitoso.tipo_entrega}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Pago:</span>
                <span className="font-medium text-stone-800">{pedidoExitoso.metodo_pago_pedido}</span>
              </div>
            </div>

            {whatsAppPendiente && <a href={whatsAppPendiente} target="_blank" rel="noopener noreferrer" className="block mb-4 rounded-lg bg-green-600 p-3 text-white text-sm">Abrir WhatsApp con mi pedido</a>}
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => { setPedidoExitoso(null); setWhatsAppPendiente(''); }}
                className="flex-1 py-2.5 px-4 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg"
              >
                Hacer otro pedido
              </button>
              {account?.role === 'administrador' && <button
                onClick={() => {
                  setPedidoExitoso(null);
                  setActiveModule('cocina');
                }}
                className="flex-1 py-2.5 px-4 text-xs font-semibold bg-stone-900 hover:bg-stone-800 text-white rounded-lg flex items-center justify-center gap-1.5"
              >
                <span>Ver en Cocina (CU-02)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
