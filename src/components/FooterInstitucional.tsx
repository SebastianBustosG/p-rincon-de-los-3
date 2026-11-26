import { useRef } from 'react';

// Puede configurarse sin cambiar el componente al disponer del contacto definitivo.
const telefonoWhatsApp = (import.meta.env.VITE_WHATSAPP_NUMBER || '56912345678').replace(/[^0-9]/g, '');

export function FooterInstitucional() {
  const dialog = useRef<HTMLDialogElement>(null);

  return (
    <footer className="border-t border-stone-200 bg-white px-4 py-6 text-sm text-stone-600">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
        <div>
          <p className="font-serif font-bold text-stone-800">El rincón de los 3 — Colaciones Caseras, Talca</p>
          <p className="mt-1">Lunes a Sábado 11:30 a 15:30 hrs</p>
          <a className="mt-1 inline-block text-orange-800 underline underline-offset-4" href={`https://wa.me/${telefonoWhatsApp}`} target="_blank" rel="noopener noreferrer">
            Contacto WhatsApp: {telefonoWhatsApp}
          </a>
        </div>
        <div className="space-y-2">
          <button type="button" className="rounded text-orange-800 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-orange-700" onClick={() => dialog.current?.showModal()}>
            Términos y Condiciones
          </button>
          <p>© 2026 El rincón de los 3</p>
        </div>
      </div>

      <dialog ref={dialog} aria-labelledby="terminos-titulo" className="fixed inset-0 m-auto max-h-[85dvh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 text-left text-stone-700 shadow-xl backdrop:bg-black/50">
        <div className="flex items-start justify-between gap-4">
          <h2 id="terminos-titulo" className="font-serif text-2xl font-bold text-stone-900">Términos y Condiciones</h2>
          <form method="dialog"><button autoFocus aria-label="Cerrar términos y condiciones" className="rounded-lg border border-stone-300 px-3 py-2 hover:bg-stone-100">Cerrar</button></form>
        </div>
        <div className="mt-5 space-y-4 leading-relaxed">
          <section><h3 className="font-bold text-stone-900">Pedidos y disponibilidad</h3><p>Los precios se expresan en pesos chilenos (CLP). Antes de confirmar, revisa los platos, cantidades, total y modalidad de entrega. La disponibilidad se comprueba al registrar el pedido.</p></section>
          <section><h3 className="font-bold text-stone-900">Confirmación y contacto</h3><p>Al confirmar, el pedido queda registrado en el sistema de comandas. Abrir WhatsApp prepara un mensaje de contacto que debes enviar desde esa aplicación. El registro del pedido no depende del envío de ese mensaje.</p></section>
          <section><h3 className="font-bold text-stone-900">Entrega y pago</h3><p>Ingresa datos de contacto y entrega correctos. El retiro o despacho se realiza según la modalidad seleccionada y la coordinación con el local. Seleccionar un método de pago no acredita que el pago haya sido recibido.</p></section>
          <section><h3 className="font-bold text-stone-900">Consultas, cambios y cancelaciones</h3><p>Contacta al local por WhatsApp para solicitar cambios, consultar o pedir una cancelación. El envío de un mensaje no modifica ni cancela automáticamente el pedido; el local debe gestionar la solicitud considerando su estado de preparación.</p></section>
          <section><h3 className="font-bold text-stone-900">Datos de cuenta y pedido</h3><p>Los datos ingresados se utilizan para gestionar pedidos, contacto e historial de compras. Eliminar una cuenta no cancela pedidos existentes y los registros de compra se conservan en el sistema del local.</p></section>
        </div>
        <form method="dialog" className="mt-6 text-right"><button className="rounded-lg bg-orange-700 px-5 py-2 font-semibold text-white hover:bg-orange-800">Entendido</button></form>
      </dialog>
    </footer>
  );
}
