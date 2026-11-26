import { GestionInsumos } from './GestionInsumos';
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Insumo, Colacion } from '../types';
import { 
  LayoutDashboard, 
  AlertTriangle, 
  DollarSign, 
  TrendingUp, 
  Package, 
  Plus, 
  ArrowUpRight, 
  CheckCircle2, 
  RefreshCw, 
  Receipt, 
  Coins, 
  CreditCard, 
  Smartphone, 
  UtensilsCrossed, 
  Power,
  Sliders,
  Download
} from 'lucide-react';

export const Modulo3Admin: React.FC = () => {
  const { 
    insumos, 
    colaciones, 
    recetas, 
    pedidos, 
    actualizarStockInsumo, 
    fijarStockInsumo, 
    toggleActivaColacion, 
    obtenerCuadreCaja,
    calcularPorcionesDisponibles 
  } = useApp();

  const [tabActual, setTabActual] = useState<'insumos' | 'caja' | 'recetas'>('insumos');
  const [insumoEditando, setInsumoEditando] = useState<number | null>(null);
  const [nuevoStockVal, setNuevoStockVal] = useState<string>('');
  const [filtroSoloCriticos, setFiltroSoloCriticos] = useState(false);

  const [incluirCosto, setIncluirCosto] = useState(true);
  const original = obtenerCuadreCaja();
  const cuadre = { ...original, costoInsumosConsumidos: incluirCosto ? original.costoInsumosConsumidos : 0, utilidadBruta: incluirCosto ? original.utilidadBruta : original.ventasTotales, margenPorcentaje: incluirCosto ? original.margenPorcentaje : original.ventasTotales > 0 ? 100 : 0 };

  const insumosCriticos = insumos.filter(i => i.stock_actual_insumo <= i.stock_minimo_insumo);
  const insumosMostrados = filtroSoloCriticos ? insumosCriticos : insumos;

  const handleGuardarStock = (idInsumo: number) => {
    const val = parseFloat(nuevoStockVal);
    if (!isNaN(val) && val >= 0) {
      fijarStockInsumo(idInsumo, val);
    }
    setInsumoEditando(null);
    setNuevoStockVal('');
  };

  const descargarReporteCaja = () => {
    const fecha = new Date().toLocaleDateString('es-CL');
    const contenido = `======================================================
REPORTE DE CUADRE DE CAJA DIARIO - "EL RINCÓN DE LOS 3"
Fecha: ${fecha} - ${new Date().toLocaleTimeString('es-CL')}
======================================================

RESUMEN FINANCIERO (costo de insumos ${incluirCosto ? 'incluido' : 'excluido'}):
- Ventas Totales:           $${cuadre.ventasTotales.toLocaleString('es-CL')} CLP
- Costo Insumos Consumidos: $${cuadre.costoInsumosConsumidos.toLocaleString('es-CL')} CLP
------------------------------------------------------
= UTILIDAD BRUTA ESTIMADA:  $${cuadre.utilidadBruta.toLocaleString('es-CL')} CLP (Margen: ${cuadre.margenPorcentaje}%)

DESGLOSE POR FORMA DE PAGO:
- Efectivo en Caja:         $${cuadre.desglosePagos.efectivo.toLocaleString('es-CL')} CLP
- Transferencias:           $${cuadre.desglosePagos.transferencia.toLocaleString('es-CL')} CLP
- Débito / Tarjetas:        $${cuadre.desglosePagos.debito.toLocaleString('es-CL')} CLP

TOTAL PEDIDOS:              ${cuadre.totalPedidos} (${cuadre.pedidosEntregados} entregados)

INSUMOS EN ALERTA CRÍTICA:
${insumosCriticos.map(i => `• ${i.nombre_insumo}: ${i.stock_actual_insumo} ${i.unidad_medida_insumo} (Mínimo: ${i.stock_minimo_insumo})`).join('\n') || 'Ninguno (Todo en stock seguro)'}

======================================================
Generado automáticamente por el Sistema El rincón de los 3
`;
    const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cuadre_caja_rincon3_${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      
      {/* Header Admin */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl font-bold text-stone-900">
              Panel de Administración y Control
            </h1>
          </div>
          <p className="text-xs text-stone-500">
            Control de insumos de cocina, cuadre diario de ventas y coste de platos
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200">
          <button
            onClick={() => setTabActual('insumos')}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              tabActual === 'insumos'
                ? 'bg-white text-stone-900 shadow-xs font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Gestión de Insumos</span>
            {insumosCriticos.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-600 text-white font-bold">
                {insumosCriticos.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setTabActual('caja')}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              tabActual === 'caja'
                ? 'bg-white text-stone-900 shadow-xs font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            <span>Cuadre de Caja Diario</span>
          </button>

          <button
            onClick={() => setTabActual('recetas')}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              tabActual === 'recetas'
                ? 'bg-white text-stone-900 shadow-xs font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5 text-amber-600" />
            <span>Recetas y Carta</span>
          </button>
        </div>
      </div>

      {/* ================= TAB 1: GESTIÓN DE INSUMOS (PIS-14) ================= */}
      {tabActual === 'insumos' && (
        <div className="space-y-6">
          
          <GestionInsumos />
          {/* Banner de Alerta si hay Stock Crítico */}
          {insumosCriticos.length > 0 && (
            <div className="p-4 rounded-xl bg-rose-50 border-2 border-rose-300 text-rose-900 flex items-start justify-between gap-3 shadow-2xs">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <h4 className="font-bold text-sm text-rose-950">
                    Alerta de Stock Crítico ({insumosCriticos.length} insumos en o bajo el mínimo)
                  </h4>
                  <p className="text-xs text-rose-800 mt-0.5">
                    Los siguientes insumos requieren reposición inmediata para no bloquear la carta de clientes:
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {insumosCriticos.map(i => (
                      <span key={i.id_insumo} className="px-2 py-0.5 rounded bg-white text-rose-900 border border-rose-300 text-xs font-semibold">
                        {i.nombre_insumo} ({i.stock_actual_insumo} / mín {i.stock_minimo_insumo} {i.unidad_medida_insumo})
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Barra de Filtros de la Tabla */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFiltroSoloCriticos(false)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                  !filtroSoloCriticos
                    ? 'bg-stone-900 text-white border-stone-900'
                    : 'bg-white text-stone-600 border-stone-300'
                }`}
              >
                Todos los Insumos ({insumos.length})
              </button>
              <button
                onClick={() => setFiltroSoloCriticos(true)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 ${
                  filtroSoloCriticos
                    ? 'bg-rose-600 text-white border-rose-600'
                    : 'bg-white text-rose-700 border-rose-300 hover:bg-rose-50'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Solo Críticos ({insumosCriticos.length})</span>
              </button>
            </div>
            <span className="text-xs text-stone-500">
              Usa los botones <strong>+1</strong> o <strong>+5</strong> para reabastecer rápidamente al comprar en la vega.
            </span>
          </div>

          {/* Tabla de Insumos */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">ID</th>
                    <th className="py-3.5 px-4">Insumo</th>
                    <th className="py-3.5 px-4">Unidad</th>
                    <th className="py-3.5 px-4 text-center">Stock Actual</th>
                    <th className="py-3.5 px-4 text-center">Stock Mínimo</th>
                    <th className="py-3.5 px-4">Costo Ref. (CLP)</th>
                    <th className="py-3.5 px-4">Estado</th>
                    <th className="py-3.5 px-4 text-right">Reposición Rápida</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {insumosMostrados.map(insumo => {
                    const esCritico = insumo.stock_actual_insumo <= insumo.stock_minimo_insumo;
                    const estaAgotado = insumo.stock_actual_insumo <= 0;

                    return (
                      <tr 
                        key={insumo.id_insumo}
                        className={`transition-colors ${
                          esCritico ? 'bg-rose-50/50 hover:bg-rose-50' : 'hover:bg-stone-50'
                        }`}
                      >
                        <td className="py-3.5 px-4 font-mono text-stone-400">
                          #{insumo.id_insumo}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-stone-900 block">
                            {insumo.nombre_insumo}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-stone-600">
                          {insumo.unidad_medida_insumo}
                        </td>
                        
                        {/* Stock Actual con Edición en Línea */}
                        <td className="py-3.5 px-4 text-center">
                          {insumoEditando === insumo.id_insumo ? (
                            <div className="flex items-center justify-center gap-1">
                              <input
                                type="number"
                                step="0.1"
                                autoFocus
                                value={nuevoStockVal}
                                onChange={e => setNuevoStockVal(e.target.value)}
                                className="w-20 px-2 py-1 text-xs border border-amber-500 rounded bg-white text-center font-bold"
                              />
                              <button
                                onClick={() => handleGuardarStock(insumo.id_insumo)}
                                className="px-2 py-1 bg-stone-900 text-white rounded text-xs font-semibold"
                              >
                                OK
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setInsumoEditando(insumo.id_insumo);
                                setNuevoStockVal(insumo.stock_actual_insumo.toString());
                              }}
                              className={`font-mono font-bold text-sm px-2.5 py-1 rounded-md transition-colors hover:ring-2 hover:ring-stone-400 cursor-pointer ${
                                estaAgotado
                                  ? 'bg-rose-600 text-white'
                                  : esCritico
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-stone-100 text-stone-800'
                              }`}
                              title="Haz clic para editar stock manualmente"
                            >
                              {insumo.stock_actual_insumo} {insumo.unidad_medida_insumo}
                            </button>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-center font-mono text-stone-500">
                          {insumo.stock_minimo_insumo} {insumo.unidad_medida_insumo}
                        </td>

                        <td className="py-3.5 px-4 font-mono text-stone-700">
                          ${insumo.costo_unitario.toLocaleString('es-CL')} / {insumo.unidad_medida_insumo}
                        </td>

                        <td className="py-3.5 px-4">
                          {estaAgotado ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-600 text-white">
                              Sin Stock
                            </span>
                          ) : esCritico ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                              <AlertTriangle className="w-3 h-3 text-rose-600" />
                              Crítico
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Normal
                            </span>
                          )}
                        </td>

                        {/* Botones de Reposición */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => actualizarStockInsumo(insumo.id_insumo, 1)}
                              className="px-2 py-1 bg-stone-100 hover:bg-amber-100 border border-stone-200 text-stone-700 hover:text-amber-950 font-bold text-xs rounded transition-colors"
                              title="Sumar +1"
                            >
                              +1
                            </button>
                            <button
                              onClick={() => actualizarStockInsumo(insumo.id_insumo, 5)}
                              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded transition-colors shadow-2xs"
                              title="Sumar +5"
                            >
                              +5
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: SIMULADOR DE CUADRE DE CAJA DIARIO (PIS-32) ================= */}
      {tabActual === 'caja' && (
        <div className="space-y-6">
          
          <label className="flex items-center gap-2"><input type="checkbox" checked={incluirCosto} onChange={e => setIncluirCosto(e.target.checked)} />Incluir costo de insumos en el cuadre y reporte</label>
          {!incluirCosto && <p className="text-sm text-stone-600">Resultado sin descontar ingredientes; no representa la ganancia real.</p>}
          {/* Tarjetas Principales de Métricas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Ventas Totales */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
              <div className="flex items-center justify-between text-stone-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Ventas Totales del Día</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold font-serif text-stone-900">
                ${cuadre.ventasTotales.toLocaleString('es-CL')} <span className="text-xs font-sans font-normal text-stone-500">CLP</span>
              </div>
              <p className="text-xs text-stone-400 mt-1">
                De un total de {cuadre.totalPedidos} pedidos
              </p>
            </div>

            {/* Costo de Insumos Consumidos */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
              <div className="flex items-center justify-between text-stone-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Costo Insumos Utilizados</span>
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                  <Receipt className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold font-serif text-rose-700">
                ${cuadre.costoInsumosConsumidos.toLocaleString('es-CL')} <span className="text-xs font-sans font-normal text-stone-500">CLP</span>
              </div>
              <p className="text-xs text-stone-400 mt-1">
                Calculado según receta por cada colación
              </p>
            </div>

            {/* Utilidad Bruta */}
            <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-2xs bg-gradient-to-br from-white to-amber-50/30">
              <div className="flex items-center justify-between text-amber-900 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Utilidad Bruta (Ganancia)</span>
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold font-serif text-amber-950">
                ${cuadre.utilidadBruta.toLocaleString('es-CL')} <span className="text-xs font-sans font-normal text-stone-500">CLP</span>
              </div>
              <p className="text-xs font-semibold text-amber-800 mt-1">
                Margen operacional: <strong>{cuadre.margenPorcentaje}%</strong>
              </p>
            </div>

            {/* Pedidos Entregados */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
              <div className="flex items-center justify-between text-stone-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Pedidos Finalizados</span>
                <div className="w-8 h-8 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold font-serif text-stone-900">
                {cuadre.pedidosEntregados} / {cuadre.totalPedidos}
              </div>
              <p className="text-xs text-stone-400 mt-1">
                {cuadre.totalPedidos - cuadre.pedidosEntregados} comanda(s) en preparación
              </p>
            </div>

          </div>

          {/* Desglose por Método de Pago (Arqueo de Caja) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Efectivo */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-stone-900">Efectivo Físico en Caja</h4>
                  <p className="text-xs text-stone-500">Monedas y billetes recibidos</p>
                </div>
              </div>
              <div className="text-xl font-bold font-mono text-stone-900">
                ${cuadre.desglosePagos.efectivo.toLocaleString('es-CL')} CLP
              </div>
              <div className="mt-2 text-xs text-stone-500">
                Disponible para vuelto y compras rápidas en la vega.
              </div>
            </div>

            {/* Transferencias */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-stone-900">Transferencias (CuentaRUT / Banco)</h4>
                  <p className="text-xs text-stone-500">Comprobantes recibidos</p>
                </div>
              </div>
              <div className="text-xl font-bold font-mono text-stone-900">
                ${cuadre.desglosePagos.transferencia.toLocaleString('es-CL')} CLP
              </div>
              <div className="mt-2 text-xs text-stone-500">
                Verificados vía comprobante de depósito electrónico.
              </div>
            </div>

            {/* Tarjeta Débito / Transbank */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-900 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-stone-900">Tarjetas Débito (POS Móvil)</h4>
                  <p className="text-xs text-stone-500">Voucher Transbank / Redcompra</p>
                </div>
              </div>
              <div className="text-xl font-bold font-mono text-stone-900">
                ${cuadre.desglosePagos.debito.toLocaleString('es-CL')} CLP
              </div>
              <div className="mt-2 text-xs text-stone-500">
                Cobrado en punto de entrega mediante lector POS.
              </div>
            </div>

          </div>

          {/* Botón de Cierre de Caja y Descarga */}
          <div className="p-6 bg-stone-900 rounded-2xl text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-serif font-bold text-lg text-amber-200">
                Cierre de Turno y Cuadre Diario
              </h3>
              <p className="text-xs text-stone-300 mt-1 max-w-xl">
                Al finalizar el servicio de almuerzo, descarga el informe consolidado con las ventas, gastos de insumos y desglose de formas de pago para la contabilidad del emprendimiento.
              </p>
            </div>
            <button
              onClick={descargarReporteCaja}
              className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Descargar Informe de Cuadre (.txt)</span>
            </button>
          </div>

        </div>
      )}

      {/* ================= TAB 3: RECETAS Y CARTA DIGITAL ================= */}
      {tabActual === 'recetas' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg font-bold text-stone-900">
                Colaciones y sus Recetas de Insumos
              </h3>
              <p className="text-xs text-stone-500">
                Cada pedido descuenta automáticamente los insumos aquí asociados. Puedes pausar colaciones si no deseas ofrecerlas hoy.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {colaciones.map(colacion => {
              const { porciones, agotado } = calcularPorcionesDisponibles(colacion.id_colacion);
              const ingredientes = recetas.filter(r => r.colacion_id === colacion.id_colacion);

              // Costo de la receta
              let costoPlato = 0;
              ingredientes.forEach(req => {
                const insumo = insumos.find(i => i.id_insumo === req.insumo_id);
                if (insumo) {
                  costoPlato += req.cantidad_necesaria_receta * insumo.costo_unitario;
                }
              });

              const margenEstimado = colacion.precio_colacion - costoPlato;
              const porcentajeMargen = Math.round((margenEstimado / colacion.precio_colacion) * 100);

              return (
                <div key={colacion.id_colacion} className="bg-white rounded-2xl border border-stone-200 p-5 shadow-2xs space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={colacion.imagen}
                        alt={colacion.nombre_colacion}
                        className="w-14 h-14 rounded-xl object-cover"
                      />
                      <div>
                        <h4 className="font-serif font-bold text-base text-stone-900">
                          {colacion.nombre_colacion}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-stone-500">
                          <span className="font-bold text-stone-900">${colacion.precio_colacion.toLocaleString('es-CL')} CLP</span>
                          <span>·</span>
                          <span>{porciones} porciones disp.</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleActivaColacion(colacion.id_colacion)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                        colacion.activa_colacion
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                      }`}
                      title={colacion.activa_colacion ? 'Pausar colación' : 'Activar colación'}
                    >
                      <Power className="w-3 h-3" />
                      <span>{colacion.activa_colacion ? 'Activa en Carta' : 'Pausada'}</span>
                    </button>
                  </div>

                  {/* Detalle de Insumos requeridos por la receta */}
                  <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 space-y-1.5 text-xs">
                    <span className="text-[11px] font-bold text-stone-400 uppercase block mb-1">
                      Insumos necesarios por porción:
                    </span>
                    {ingredientes.map(req => {
                      const insumo = insumos.find(i => i.id_insumo === req.insumo_id);
                      const alcanza = insumo && insumo.stock_actual_insumo >= req.cantidad_necesaria_receta;
                      return (
                        <div key={req.id_receta} className="flex items-center justify-between text-stone-700">
                          <span className="flex items-center gap-1">
                            <span className={alcanza ? 'text-emerald-600' : 'text-rose-600 font-bold'}>•</span>
                            <span>{insumo?.nombre_insumo || 'Insumo'}</span>
                          </span>
                          <span className="font-mono text-stone-600">
                            {req.cantidad_necesaria_receta} {insumo?.unidad_medida_insumo}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Margen y Costo del plato */}
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-stone-100">
                    <div>
                      <span className="text-stone-400 block text-[11px]">Costo Insumos</span>
                      <span className="font-mono font-bold text-rose-700">${Math.round(costoPlato).toLocaleString('es-CL')} CLP</span>
                    </div>
                    <div className="text-right">
                      <span className="text-stone-400 block text-[11px]">Margen Estimado</span>
                      <span className="font-mono font-bold text-emerald-700">
                        ${Math.round(margenEstimado).toLocaleString('es-CL')} ({porcentajeMargen}%)
                      </span>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
