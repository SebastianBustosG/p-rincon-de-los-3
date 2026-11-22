import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Pedido, EstadoPedido } from '../types';
import { 
  XCircle, ChefHat, 
  Clock, 
  CheckCircle, 
  PackageCheck, 
  AlertTriangle, 
  Flame, 
  MapPin, 
  Phone, 
  Utensils, 
  Timer,
  Check,
  Eye,
  Filter
} from 'lucide-react';

export const Modulo2Cocina: React.FC = () => {
  const { pedidos, cambiarEstadoPedido, cancelarPedido } = useApp();
  const [filtroEstado, setFiltroEstado] = useState<'Todos' | EstadoPedido>('Todos');
  const [ahora, setAhora] = useState(Date.now());

  const [pedidoCancelar, setPedidoCancelar] = useState<Pedido | null>(null);
  const [cancelando, setCancelando] = useState(false);
  const [reponerInsumos, setReponerInsumos] = useState(true);
  const [errorCancelacion, setErrorCancelacion] = useState('');
  const cancelDialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (pedidoCancelar && !cancelDialog.current?.open) cancelDialog.current?.showModal();
    if (!pedidoCancelar && cancelDialog.current?.open) cancelDialog.current.close();
  }, [pedidoCancelar]);
  async function confirmarCancelacion() {
    if (!pedidoCancelar || cancelando) return;
    setCancelando(true); setErrorCancelacion('');
    try { await cancelarPedido(pedidoCancelar.id_pedido, reponerInsumos); setPedidoCancelar(null); }
    catch (err) { setErrorCancelacion(err instanceof Error ? err.message : 'No se pudo cancelar el pedido.'); }
    finally { setCancelando(false); }
  }
  // Actualizar el cronómetro cada 30 segundos
  useEffect(() => {
    const timer = setInterval(() => setAhora(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

  const pedidosFiltrados = pedidos.filter(p => {
    if (filtroEstado === 'Todos') return true;
    return p.estado_pedido === filtroEstado;
  });

  // Calcular resumen de colaciones pendientes de preparar en este momento
  const platosEnCurso: { [key: string]: number } = {};
  pedidos
    .filter(p => p.estado_pedido === 'En curso')
    .forEach(p => {
      p.detalles.forEach(d => {
        platosEnCurso[d.nombre_colacion] = (platosEnCurso[d.nombre_colacion] || 0) + d.cantidad_detalle_pedido;
      });
    });

  const getMinutosTranscurridos = (fechaIso: string) => {
    const diffMs = ahora - new Date(fechaIso).getTime();
    return Math.floor(diffMs / (1000 * 60));
  };

  const getEstadoBadgeClass = (estado: EstadoPedido) => {
    switch (estado) {
      case 'En curso':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'Listo':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'Cancelado':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'Entregado':
        return 'bg-stone-100 text-stone-600 border-stone-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      
      {/* Header Comandera Digital */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs">
              <ChefHat className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl font-bold text-stone-900">
                  Comandera Digital de Cocina
                </h1>
              </div>
              <p className="text-xs text-stone-500">
                Control de preparación en tiempo real y despacho táctil
              </p>
            </div>
          </div>
        </div>

        {/* Filtros de Estado */}
        <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl border border-stone-200 self-start md:self-auto overflow-x-auto max-w-full">
          {(['Todos', 'En curso', 'Listo', 'Entregado', 'Cancelado'] as const).map(estado => {
            const count = estado === 'Todos' ? pedidos.length : pedidos.filter(p => p.estado_pedido === estado).length;
            return (
              <button
                key={estado}
                onClick={() => setFiltroEstado(estado)}
                className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  filtroEstado === estado
                    ? 'bg-white text-stone-900 shadow-xs font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <span>{estado}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  estado === 'En curso' && count > 0 
                    ? 'bg-amber-600 text-white' 
                    : 'bg-stone-200 text-stone-700'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Resumen de Producción en Vivo para Cocineros */}
      {Object.keys(platosEnCurso).length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 mb-6 shadow-2xs">
          <div className="flex items-center gap-2 text-amber-950 font-bold text-xs uppercase tracking-wider mb-2">
            <Flame className="w-4 h-4 text-orange-600 animate-pulse" />
            <span>En los fogones ahora mismo (Total de colaciones por servir):</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(platosEnCurso).map(([nombrePlato, cant]) => (
              <div 
                key={nombrePlato}
                className="bg-white px-3 py-1.5 rounded-lg border border-amber-200 shadow-2xs flex items-center gap-2 text-xs"
              >
                <span className="font-bold text-amber-900 font-mono text-sm bg-amber-100 px-2 py-0.5 rounded">
                  {cant}x
                </span>
                <span className="font-medium text-stone-800">{nombrePlato}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid de Tarjetas de Comanda Táctiles (Optimizadas para Tablet) */}
      {pedidosFiltrados.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-stone-300">
          <ChefHat className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-700">No hay comandas en este estado</h3>
          <p className="text-xs text-stone-500 mt-1">Los pedidos ingresados aparecerán automáticamente aquí.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {pedidosFiltrados.map(pedido => {
            const minutos = getMinutosTranscurridos(pedido.fecha_hora_pedido);
            const esUrgente = minutos >= 20 && pedido.estado_pedido === 'En curso';
            const tieneObservaciones = pedido.observaciones_pedido && !pedido.observaciones_pedido.toLowerCase().includes('sin observaciones');

            return (
              <div
                key={pedido.id_pedido}
                className={`bg-white rounded-2xl border-2 transition-all shadow-sm flex flex-col justify-between overflow-hidden ${
                  pedido.estado_pedido === 'En curso'
                    ? esUrgente
                      ? 'border-rose-400 ring-2 ring-rose-100'
                      : 'border-amber-300 ring-2 ring-amber-50'
                    : pedido.estado_pedido === 'Listo'
                    ? 'border-emerald-300 bg-emerald-50/20'
                    : pedido.estado_pedido === 'Cancelado' ? 'border-red-300' : 'border-blue-950'
                }`}
              >
                {/* Cabecera de la Comanda */}
                <div className={`p-4 border-b flex items-center justify-between ${
                  pedido.estado_pedido === 'En curso' ? 'bg-amber-50/60 border-amber-200' : 'bg-stone-50 border-stone-200'
                }`}>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-base font-bold text-stone-900">
                        {pedido.codigo_pedido}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${getEstadoBadgeClass(pedido.estado_pedido)}`}>
                        {pedido.estado_pedido}
                      </span>
                    </div>
                    <span className="text-xs text-stone-500">
                      {new Date(pedido.fecha_hora_pedido).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })} hrs
                    </span>
                  </div>

                  {/* Minutero en vivo */}
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold font-mono ${
                    esUrgente 
                      ? 'bg-rose-600 text-white animate-bounce' 
                      : pedido.estado_pedido === 'En curso'
                      ? 'bg-amber-200 text-amber-950'
                      : 'bg-stone-200 text-stone-700'
                  }`}>
                    <Timer className="w-3.5 h-3.5" />
                    <span>{minutos} min</span>
                  </div>
                </div>

                {/* Cuerpo: Datos del Cliente y Platos */}
                <div className="p-4 space-y-3 flex-1">
                  
                  {/* Datos del Cliente y Modalidad */}
                  <div className="text-xs space-y-1 pb-2 border-b border-stone-100">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-900 text-sm">{pedido.nombre_cliente_pedido}</span>
                      <span className="font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded text-[11px]">
                        {pedido.tipo_entrega}
                      </span>
                    </div>

                    {pedido.tipo_entrega === 'Despacho a Domicilio' && pedido.direccion_entrega && (
                      <div className="flex items-start gap-1 text-stone-600 text-xs">
                        <MapPin className="w-3.5 h-3.5 mt-0.5 text-stone-400 shrink-0" />
                        <span className="line-clamp-1">{pedido.direccion_entrega}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-stone-500 text-[11px] pt-0.5">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-stone-400" />
                        {pedido.telefono_cliente_pedido}
                      </span>
                      <span>Pago: <strong>{pedido.metodo_pago_pedido}</strong></span>
                    </div>
                  </div>

                  {/* ALERTA VISUAL DESTACADA PARA OBSERVACIONES */}
                  {tieneObservaciones && (
                    <div className="p-3 rounded-xl bg-orange-50 border-2 border-orange-300 text-orange-900 shadow-2xs">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-orange-800 uppercase tracking-wide mb-1">
                        <AlertTriangle className="w-4 h-4 text-orange-600 animate-pulse" />
                        <span>¡Atención Cocina!</span>
                      </div>
                      <p className="text-xs font-semibold leading-relaxed">
                        {pedido.observaciones_pedido}
                      </p>
                    </div>
                  )}

                  {/* Listado de Platos a Preparar */}
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[11px] font-bold text-stone-400 uppercase">Platos de esta orden:</p>
                    {pedido.detalles.map(item => (
                      <div
                        key={item.id_detalle_pedido}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-stone-50 border border-stone-200"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 flex items-center justify-center rounded-md bg-stone-900 text-white font-mono text-sm font-bold">
                            {item.cantidad_detalle_pedido}
                          </span>
                          <span className="text-sm font-bold text-stone-900">
                            {item.nombre_colacion}
                          </span>
                        </div>
                        <span className="text-xs font-medium text-stone-500">
                          ${item.subtotal_detalle_pedido.toLocaleString('es-CL')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mx-4 mb-4 flex items-center justify-between gap-3 border-t border-stone-200 pt-3 text-sm font-bold text-stone-900">
                  <span>Subtotal del pedido</span>
                  <span>${pedido.detalles.reduce((subtotal, item) => subtotal + item.subtotal_detalle_pedido, 0).toLocaleString('es-CL')} CLP</span>
                </div>
                {/* BOTONES TÁCTILES GIGANTES DE 1 TOQUE (TABLET READY) */}
                <div className="p-3 bg-stone-50 border-t border-stone-200">
                  <div className="grid grid-cols-3 gap-2">
                    
                    {/* Botón: En Curso */}
                    <button
                      onClick={() => cambiarEstadoPedido(pedido.id_pedido, 'En curso')}
                      disabled={pedido.estado_pedido === 'En curso' || pedido.estado_pedido === 'Cancelado'}
                      className={`h-14 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all active:scale-95 disabled:cursor-not-allowed ${
                        pedido.estado_pedido === 'En curso'
                          ? 'bg-amber-600 text-white ring-2 ring-amber-400 shadow-xs'
                          : 'bg-white border border-stone-300 text-stone-700 hover:bg-amber-50'
                      }`}
                    >
                      <Flame className="w-4 h-4" />
                      <span>En curso</span>
                    </button>

                    {/* Botón: Listo */}
                    <button
                      onClick={() => cambiarEstadoPedido(pedido.id_pedido, 'Listo')}
                      disabled={pedido.estado_pedido === 'Listo' || pedido.estado_pedido === 'Cancelado'}
                      className={`h-14 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all active:scale-95 disabled:cursor-not-allowed ${
                        pedido.estado_pedido === 'Listo'
                          ? 'bg-emerald-600 text-white ring-2 ring-emerald-400 shadow-xs'
                          : 'bg-white border border-stone-300 text-stone-700 hover:bg-emerald-50'
                      }`}
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Listo</span>
                    </button>

                    {/* Botón: Entregado */}
                    <button
                      onClick={() => cambiarEstadoPedido(pedido.id_pedido, 'Entregado')}
                      disabled={pedido.estado_pedido !== 'Listo'}
                      title={pedido.estado_pedido === 'En curso' ? 'Primero marca el pedido como listo' : undefined}
                      className={`h-14 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all active:scale-95 disabled:cursor-not-allowed ${
                        pedido.estado_pedido === 'Entregado'
                          ? 'bg-blue-950 text-white ring-2 ring-blue-950 shadow-xs'
                          : pedido.estado_pedido === 'Listo' ? 'bg-blue-950 text-white hover:bg-blue-900' : 'bg-blue-950 text-white opacity-40 cursor-not-allowed'
                      }`}
                    >
                      <PackageCheck className="w-4 h-4" />
                      <span>Entregado</span>
                    </button>

                  </div>
                  <button type="button" disabled={pedido.estado_pedido === 'Cancelado'} onClick={() => { setErrorCancelacion(''); setReponerInsumos(true); setPedidoCancelar(pedido); }} className="mt-3 w-full rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    <XCircle className="w-4 h-4" />{pedido.estado_pedido === 'Cancelado' ? 'Pedido cancelado' : 'Cancelar pedido'}
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      <dialog ref={cancelDialog} aria-labelledby="cancelar-pedido-titulo" aria-describedby="cancelar-pedido-descripcion" onCancel={e => { e.preventDefault(); if (!cancelando) setPedidoCancelar(null); }} className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl bg-white p-6 text-stone-800 shadow-2xl backdrop:bg-black/50">
        <h2 id="cancelar-pedido-titulo" className="font-serif text-xl font-bold">¿Cancelar pedido {pedidoCancelar?.codigo_pedido}?</h2>
        <p id="cancelar-pedido-descripcion" className="mt-3 text-sm text-stone-600">El pedido quedará marcado como cancelado y se excluirá del cuadre de ventas. Esta acción no se puede deshacer.</p>
        <label className="mt-4 flex items-start gap-3 rounded-xl border border-orange-200 bg-orange-50 p-3 text-sm text-stone-800">
          <input type="checkbox" checked={reponerInsumos} disabled={cancelando} onChange={e => setReponerInsumos(e.target.checked)} className="mt-0.5 h-4 w-4 accent-orange-700" aria-describedby="reposicion-ayuda" />
          <span><span className="font-semibold">Reponer los insumos al inventario</span><span id="reposicion-ayuda" className="mt-1 block text-xs text-stone-600">Se devolverán las cantidades descontadas por este pedido. Desmarca esta opción si ya se usaron al preparar la comida.</span></span>
        </label>
        {errorCancelacion && <p role="alert" className="mt-3 text-sm text-red-700">{errorCancelacion}</p>}
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button type="button" autoFocus disabled={cancelando} onClick={() => setPedidoCancelar(null)} className="rounded-lg border border-stone-300 px-4 py-2 text-sm disabled:opacity-50">Volver</button>
          <button type="button" disabled={cancelando} onClick={confirmarCancelacion} className="rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-50">{cancelando ? 'Cancelando…' : 'Sí, cancelar pedido'}</button>
        </div>
      </dialog>
    </div>
  );
};
