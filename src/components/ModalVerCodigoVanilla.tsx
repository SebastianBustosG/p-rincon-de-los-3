import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Copy, Check, Code, FileCode2, ExternalLink } from 'lucide-react';

export const ModalVerCodigoVanilla: React.FC = () => {
  const { showVanillaModal, setShowVanillaModal } = useApp();
  const [copiado, setCopiado] = useState(false);

  if (!showVanillaModal) return null;

  const codigoHtmlVanilla = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>El rincón de los 3 - Carta Digital & Pedidos</title>
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Playfair+Display:wght@600;700;800&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'DM Sans', sans-serif; }
    h1, h2, h3, .font-serif { font-family: 'Playfair Display', serif; }
  </style>
</head>
<body class="bg-[#FAF7F2] text-stone-800 min-h-screen">

  <!-- Encabezado / Branding -->
  <header class="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-stone-200">
    <div class="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-orange-700 text-white flex items-center justify-center font-bold text-xl">
          🍲
        </div>
        <div>
          <h1 class="font-serif text-xl font-bold text-stone-900">El rincón de los 3</h1>
          <p class="text-xs text-stone-500">Colaciones Caseras Chilenas · Talca</p>
        </div>
      </div>
      <div id="badge-carrito" class="flex items-center gap-2 bg-stone-100 px-3 py-1.5 rounded-full border border-stone-200 text-xs font-semibold">
        <span>🛒 Canasta:</span>
        <span id="cant-items-canasta" class="bg-orange-600 text-white px-2 py-0.5 rounded-full text-[11px]">0</span>
      </div>
    </div>
  </header>

  <!-- Banner -->
  <section class="max-w-6xl mx-auto px-4 pt-6 pb-4">
    <div class="bg-gradient-to-r from-stone-900 to-amber-950 text-white p-6 rounded-2xl shadow-sm">
      <span class="inline-block bg-amber-500/20 text-amber-300 text-xs font-medium px-3 py-1 rounded-full mb-2">
        🕒 Horario de Almuerzo: 11:30 a 15:30 hrs
      </span>
      <h2 class="text-2xl sm:text-3xl font-serif font-bold">Carta Digital de Colaciones</h2>
      <p class="text-stone-300 text-xs sm:text-sm mt-1">
        Elige tus colaciones favoritas. Verificación de stock en tiempo real y pedido directo a WhatsApp.
      </p>
    </div>
  </section>

  <!-- Contenedor Principal: Catálogo + Carrito / Checkout -->
  <main class="max-w-6xl mx-auto px-4 py-4 grid grid-cols-1 lg:grid-cols-12 gap-8">
    
    <!-- Catálogo de Colaciones (8 Columnas) -->
    <section class="lg:col-span-7 space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="font-serif font-bold text-lg text-stone-900">Menú del Día</h3>
        <span class="text-xs text-stone-500">Precios en Pesos Chilenos (CLP)</span>
      </div>

      <!-- Grid de Colaciones Reactivas -->
      <div id="catalogo-colaciones" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <!-- Renderizado dinámicamente con JS -->
      </div>
    </section>

    <!-- Resumen y Formulario de Pedido (5 Columnas) -->
    <aside class="lg:col-span-5">
      <div class="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 sticky top-24 space-y-4">
        
        <div class="flex items-center justify-between pb-3 border-b border-stone-100">
          <h3 class="font-serif font-bold text-base text-stone-900">Resumen de tu Pedido</h3>
          <button id="btn-vaciar-carro" class="text-xs text-stone-400 hover:text-rose-600 transition-colors">
            Vaciar canasta
          </button>
        </div>

        <!-- Lista de Items en Carrito -->
        <div id="lista-carrito" class="space-y-2 max-h-52 overflow-y-auto divide-y divide-stone-100">
          <p class="text-xs text-stone-400 text-center py-4">Tu canasta está vacía. Añade un plato.</p>
        </div>

        <!-- Total a Pagar -->
        <div class="pt-3 border-t border-stone-200 flex items-center justify-between">
          <span class="text-xs font-medium text-stone-600">Total a Pagar:</span>
          <span id="texto-total-clp" class="text-xl font-bold font-serif text-amber-950">$0 CLP</span>
        </div>

        <!-- Formulario de Datos del Cliente -->
        <form id="form-pedido" class="space-y-3 pt-2">
          <div>
            <label class="block text-xs font-semibold text-stone-700 mb-1">Nombre Completo *</label>
            <input type="text" id="input-nombre" required placeholder="Ej: Patricia Morales" class="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-600">
          </div>

          <div>
            <label class="block text-xs font-semibold text-stone-700 mb-1">Teléfono / WhatsApp *</label>
            <input type="tel" id="input-telefono" required placeholder="+56 9 1234 5678" class="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-600">
          </div>

          <div>
            <label class="block text-xs font-semibold text-stone-700 mb-1">Modalidad de Entrega</label>
            <div class="grid grid-cols-2 gap-2">
              <label class="flex items-center justify-center p-2 border border-stone-200 rounded-lg text-xs font-medium cursor-pointer hover:bg-stone-50 has-[:checked]:bg-amber-50 has-[:checked]:border-amber-500 has-[:checked]:text-amber-900">
                <input type="radio" name="tipo_entrega" value="Retiro en Local" checked class="hidden" onchange="toggleDireccion()">
                <span>🏪 Retiro Local</span>
              </label>
              <label class="flex items-center justify-center p-2 border border-stone-200 rounded-lg text-xs font-medium cursor-pointer hover:bg-stone-50 has-[:checked]:bg-amber-50 has-[:checked]:border-amber-500 has-[:checked]:text-amber-900">
                <input type="radio" name="tipo_entrega" value="Despacho a Domicilio" class="hidden" onchange="toggleDireccion()">
                <span>🛵 Despacho</span>
              </label>
            </div>
          </div>

          <div id="seccion-direccion" class="hidden">
            <label class="block text-xs font-semibold text-stone-700 mb-1">Dirección de Despacho *</label>
            <input type="text" id="input-direccion" placeholder="Calle, número, departamento..." class="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-600">
          </div>

          <div>
            <label class="block text-xs font-semibold text-stone-700 mb-1">Método de Pago</label>
            <select id="select-pago" class="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-600">
              <option value="Transferencia CuentaRUT / Banco">Transferencia CuentaRUT / Banco</option>
              <option value="Efectivo en Entrega">Efectivo en Entrega</option>
              <option value="Tarjeta Débito (POS Móvil)">Tarjeta Débito (POS Móvil)</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-stone-700 mb-1">Observaciones (Alergias / Sin cebolla / Ají)</label>
            <input type="text" id="input-observaciones" placeholder="Ej: Sin cebolla, ají aparte..." class="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-600">
          </div>

          <button type="submit" id="btn-whatsapp" class="w-full py-3 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer">
            <span>📲 Enviar Pedido a WhatsApp</span>
          </button>
        </form>

      </div>
    </aside>

  </main>

  <!-- JAVASCRIPT REACTIVO VANILLA -->
  <script>
    // MODELO DE DATOS INICIAL
    const INSUMOS = [
      { id_insumo: 1, nombre_insumo: 'Carne Vacuno', stock_actual: 4.5, unidad: 'kg' },
      { id_insumo: 2, nombre_insumo: 'Choclo Pastelero', stock_actual: 6.0, unidad: 'kg' },
      { id_insumo: 3, nombre_insumo: 'Papas Chilotas', stock_actual: 8.0, unidad: 'kg' },
      { id_insumo: 4, nombre_insumo: 'Zapallo Camote', stock_actual: 3.2, unidad: 'kg' },
      { id_insumo: 5, nombre_insumo: 'Pechuga Pollo', stock_actual: 5.0, unidad: 'kg' },
      { id_insumo: 6, nombre_insumo: 'Arroz G2', stock_actual: 7.0, unidad: 'kg' },
      { id_insumo: 7, nombre_insumo: 'Porotos Tórtola', stock_actual: 1.2, unidad: 'kg' },
      { id_insumo: 9, nombre_insumo: 'Merluza Austral', stock_actual: 0.1, unidad: 'kg' } // AGOTADO
    ];

    const COLACIONES = [
      {
        id_colacion: 1,
        nombre: 'Pastel de Choclo Tradicional',
        descripcion: 'Pino casero de posta seleccionada, pollo deshuesado, aceituna del Huasco y pastelera dorada.',
        precio: 6200,
        imagen: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80',
        ingredientes: [{ insumo_id: 1, cant: 0.20 }, { insumo_id: 2, cant: 0.35 }]
      },
      {
        id_colacion: 2,
        nombre: 'Cazuela de Vacuno Criolla',
        descripcion: 'Tapapecho tierno, trozo de zapallo camote, choclo en coronta, papa chilota y caldo concentrado.',
        precio: 5800,
        imagen: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=400&q=80',
        ingredientes: [{ insumo_id: 1, cant: 0.25 }, { insumo_id: 3, cant: 0.25 }, { insumo_id: 4, cant: 0.20 }]
      },
      {
        id_colacion: 3,
        nombre: 'Pollo al Jugo con Arroz Graneado',
        descripcion: 'Trutro tierno cocinado al jugo con caldo de verduras y vino blanco, con arroz y chilena.',
        precio: 4900,
        imagen: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=400&q=80',
        ingredientes: [{ insumo_id: 5, cant: 0.30 }, { insumo_id: 6, cant: 0.12 }]
      },
      {
        id_colacion: 4,
        nombre: 'Pescado Frito con Papas Mayo',
        descripcion: 'Filete de merluza austral con batido crujiente a la chilena y papas con perejil fresco.',
        precio: 6500,
        imagen: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=400&q=80',
        ingredientes: [{ insumo_id: 9, cant: 0.35 }, { insumo_id: 3, cant: 0.25 }]
      }
    ];

    // ESTADO DEL CARRITO
    let carrito = {};

    // CÁLCULO DE STOCK DISPONIBLE EN TIEMPO REAL
    function calcularStock(colacion) {
      let minPorciones = 999;
      for (const item of colacion.ingredientes) {
        const insumo = INSUMOS.find(i => i.id_insumo === item.insumo_id);
        if (!insumo) { minPorciones = 0; break; }
        const posibles = Math.floor(insumo.stock_actual / item.cant);
        if (posibles < minPorciones) minPorciones = posibles;
      }
      return minPorciones;
    }

    // RENDERIZAR CATÁLOGO
    function renderCatalogo() {
      const container = document.getElementById('catalogo-colaciones');
      container.innerHTML = '';

      COLACIONES.forEach(colacion => {
        const disponibles = calcularStock(colacion);
        const agotado = disponibles <= 0;
        const cantEnCarro = carrito[colacion.id_colacion] || 0;

        const card = document.createElement('div');
        card.className = \`bg-white rounded-xl border \${agotado ? 'border-stone-200 opacity-60 bg-stone-50' : 'border-stone-200 hover:shadow-md'} overflow-hidden flex flex-col justify-between transition-all\`;

        card.innerHTML = \`
          <div class="h-36 overflow-hidden relative">
            <img src="\${colacion.imagen}" alt="\${colacion.nombre}" class="w-full h-full object-cover \${agotado ? 'grayscale' : ''}">
            \${agotado 
              ? '<span class="absolute top-2 right-2 bg-rose-600 text-white text-[11px] font-bold px-2 py-0.5 rounded shadow">AGOTADO</span>' 
              : \`<span class="absolute top-2 right-2 bg-emerald-700 text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow">\${disponibles} disponibles</span>\`
            }
          </div>
          <div class="p-3.5 flex-1 flex flex-col justify-between">
            <div>
              <h4 class="font-serif font-bold text-sm text-stone-900">\${colacion.nombre}</h4>
              <p class="text-xs text-stone-500 mt-1 line-clamp-2">\${colacion.descripcion}</p>
            </div>
            <div class="pt-3 mt-2 border-t border-stone-100 flex items-center justify-between">
              <span class="font-bold text-amber-950 font-serif text-sm">$\${colacion.precio.toLocaleString('es-CL')} CLP</span>
              \${agotado 
                ? '<button disabled class="px-2.5 py-1 text-xs rounded bg-stone-200 text-stone-400 cursor-not-allowed">Agotado</button>'
                : \`<button onclick="agregarAlCarro(\${colacion.id_colacion})" class="px-3 py-1 text-xs font-semibold rounded bg-orange-700 hover:bg-orange-800 text-white shadow-xs active:scale-95 transition-all">
                    \${cantEnCarro > 0 ? \`Agregar (\${cantEnCarro})\` : '+ Agregar'}
                  </button>\`
              }
            </div>
          </div>
        \`;
        container.appendChild(card);
      });
    }

    // GESTIÓN DEL CARRITO
    window.agregarAlCarro = function(id) {
      const colacion = COLACIONES.find(c => c.id_colacion === id);
      const stock = calcularStock(colacion);
      const actual = carrito[id] || 0;
      if (actual < stock) {
        carrito[id] = actual + 1;
        actualizarCarrito();
      } else {
        alert('No quedan más porciones disponibles de este plato.');
      }
    };

    window.cambiarCantidad = function(id, delta) {
      const colacion = COLACIONES.find(c => c.id_colacion === id);
      const stock = calcularStock(colacion);
      const actual = carrito[id] || 0;
      const nuevo = actual + delta;
      if (nuevo <= 0) {
        delete carrito[id];
      } else if (nuevo <= stock) {
        carrito[id] = nuevo;
      }
      actualizarCarrito();
    };

    document.getElementById('btn-vaciar-carro').addEventListener('click', () => {
      carrito = {};
      actualizarCarrito();
    });

    function actualizarCarrito() {
      const lista = document.getElementById('lista-carrito');
      lista.innerHTML = '';
      let total = 0;
      let totalItems = 0;

      const keys = Object.keys(carrito);
      if (keys.length === 0) {
        lista.innerHTML = '<p class="text-xs text-stone-400 text-center py-4">Tu canasta está vacía. Añade un plato.</p>';
      } else {
        keys.forEach(id => {
          const colacion = COLACIONES.find(c => c.id_colacion == id);
          const cant = carrito[id];
          const subtotal = colacion.precio * cant;
          total += subtotal;
          totalItems += cant;

          const fila = document.createElement('div');
          fila.className = 'py-2 flex items-center justify-between text-xs';
          fila.innerHTML = \`
            <div class="flex-1">
              <span class="font-semibold text-stone-800">\${colacion.nombre}</span>
              <span class="block text-[11px] text-stone-400">$\${colacion.precio.toLocaleString('es-CL')} c/u</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="flex items-center bg-stone-100 rounded px-1">
                <button onclick="cambiarCantidad(\${id}, -1)" class="w-5 h-5 flex items-center justify-center font-bold text-stone-600">-</button>
                <span class="w-5 text-center font-bold">\${cant}</span>
                <button onclick="cambiarCantidad(\${id}, 1)" class="w-5 h-5 flex items-center justify-center font-bold text-stone-600">+</button>
              </div>
              <span class="font-bold text-stone-900 w-16 text-right">$\${subtotal.toLocaleString('es-CL')}</span>
            </div>
          \`;
          lista.appendChild(fila);
        });
      }

      document.getElementById('cant-items-canasta').textContent = totalItems;
      document.getElementById('texto-total-clp').textContent = \`$\${total.toLocaleString('es-CL')} CLP\`;
      renderCatalogo();
    }

    // MOSTRAR/OCULTAR DIRECCIÓN
    window.toggleDireccion = function() {
      const tipo = document.querySelector('input[name="tipo_entrega"]:checked').value;
      const secDir = document.getElementById('seccion-direccion');
      const inputDir = document.getElementById('input-direccion');
      if (tipo === 'Despacho a Domicilio') {
        secDir.classList.remove('hidden');
        inputDir.setAttribute('required', 'true');
      } else {
        secDir.classList.add('hidden');
        inputDir.removeAttribute('required');
      }
    };

    // FORMULARIO: GENERAR ENLACE WHATSAPP
    document.getElementById('form-pedido').addEventListener('submit', function(e) {
      e.preventDefault();
      const keys = Object.keys(carrito);
      if (keys.length === 0) {
        alert('Debes agregar al menos una colación a la canasta.');
        return;
      }

      const nombre = document.getElementById('input-nombre').value.trim();
      const telefono = document.getElementById('input-telefono').value.trim();
      const tipoEntrega = document.querySelector('input[name="tipo_entrega"]:checked').value;
      const direccion = document.getElementById('input-direccion').value.trim();
      const metodoPago = document.getElementById('select-pago').value;
      const observaciones = document.getElementById('input-observaciones').value.trim();

      let total = 0;
      let detalleTexto = '';
      keys.forEach(id => {
        const colacion = COLACIONES.find(c => c.id_colacion == id);
        const cant = carrito[id];
        const sub = colacion.precio * cant;
        total += sub;
        detalleTexto += \`• \${cant}x \${colacion.nombre} ($\${sub.toLocaleString('es-CL')})\\n\`;
      });

      // CONSTRUCCIÓN DEL MENSAJE DE WHATSAPP
      let msj = \`🍲 *¡HOLA "EL RINCÓN DE LOS 3"!*\\n\`;
      msj += \`Quisiera encargar el siguiente pedido de colaciones caseras:\\n\\n\`;
      msj += \`👤 *Cliente:* \${nombre}\\n\`;
      msj += \`📞 *Teléfono:* \${telefono}\\n\`;
      msj += \`🛵 *Modalidad:* \${tipoEntrega}\\n\`;
      if (tipoEntrega === 'Despacho a Domicilio' && direccion) {
        msj += \`📍 *Dirección:* \${direccion}\\n\`;
      }
      msj += \`💳 *Método de Pago:* \${metodoPago}\\n\\n\`;
      msj += \`*DETALLE DEL PEDIDO:*\\n\${detalleTexto}\\n\`;
      msj += \`💰 *TOTAL A PAGAR:* $\${total.toLocaleString('es-CL')} CLP\\n\`;
      if (observaciones) {
        msj += \`\\n⚠️ *Observaciones:* "\${observaciones}"\\n\`;
      }
      msj += \`\\n¡Quedo a la espera de confirmación! Muchas gracias.\`;

      const telefonoLocal = '56912345678'; // Número de WhatsApp del emprendimiento
      const urlWhatsapp = \`https://wa.me/\${telefonoLocal}?text=\${encodeURIComponent(msj)}\`;

      window.open(urlWhatsapp, '_blank');
    });

    // INICIALIZACIÓN
    renderCatalogo();
  </script>
</body>
</html>`;

  const copiarAlPortapapeles = () => {
    navigator.clipboard.writeText(codigoHtmlVanilla);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs">
      <div className="bg-stone-900 text-stone-100 rounded-2xl max-w-4xl w-full h-[88vh] flex flex-col shadow-2xl border border-stone-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-stone-800 flex items-center justify-between bg-stone-950">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-orange-600/30 text-orange-400 flex items-center justify-center">
              <FileCode2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-base sm:text-lg text-white">
                  Código Fuente Standalone - Módulo 1
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-stone-800 text-amber-400 border border-stone-700">
                  HTML5 + Tailwind CDN + Vanilla JS
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Archivo único listo para copiar, guardar como <code>index.html</code> y abrir directamente en el navegador.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copiarAlPortapapeles}
              className="px-3.5 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              {copiado ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copiado ? '¡Copiado al portapapeles!' : 'Copiar Código'}</span>
            </button>

            <button
              onClick={() => setShowVanillaModal(false)}
              className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="flex-1 p-4 overflow-auto bg-stone-950/70 font-mono text-xs text-stone-300 leading-relaxed selection:bg-orange-500 selection:text-white">
          <pre className="whitespace-pre">{codigoHtmlVanilla}</pre>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-stone-950 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
          <span>✓ Incluye catálogo dinámico, control de stock por insumos, carrito y generador de URL WhatsApp.</span>
          <button
            onClick={() => setShowVanillaModal(false)}
            className="text-stone-300 hover:text-white font-medium"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
