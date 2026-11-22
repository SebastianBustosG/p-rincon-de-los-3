import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
export function PerfilCliente() {
  const { account, setShowProfile, updateProfile, deleteAccount } = useAuth(); const { pedidos } = useApp();
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);
  async function removeAccount(e: React.FormEvent) {
    e.preventDefault(); setDeleteError(''); setDeleting(true);
    try { await deleteAccount(deletePassword); }
    catch (err) { setDeleteError(err instanceof Error ? err.message : 'No se pudo eliminar tu cuenta.'); setDeleting(false); }
  }
  function editProfile() {
    if (!account) return;
    setUsername(account.username); setTelefono(account.telefono); setDireccion(account.direccion);
    setCurrentPassword(''); setNewPassword(''); setConfirmation(''); setError(''); setSuccess(''); setEditing(true);
  }
  async function save(e: React.FormEvent) {
    e.preventDefault(); setError(''); setSuccess('');
    if (newPassword !== confirmation) { setError('Las contraseñas nuevas no coinciden.'); return; }
    setSaving(true);
    try {
      await updateProfile({ username, telefono, direccion, currentPassword, newPassword });
      setEditing(false); setCurrentPassword(''); setNewPassword(''); setConfirmation('');
      setSuccess('Tus datos se guardaron correctamente. Se usarán en tus próximos pedidos.');
    } catch (err) { setError(err instanceof Error ? err.message : 'No se pudieron guardar los datos.'); }
    finally { setSaving(false); }
  }
  const inputClass = 'mt-1 w-full border border-stone-300 rounded-lg px-3 py-2 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-orange-400';
  if (account?.role !== 'cliente') return null;
  const purchases = pedidos.filter(p => p.cliente_id === account.id);
  return <section className="max-w-4xl mx-auto px-5 py-10">
    <button onClick={() => setShowProfile(false)} className="text-orange-800 mb-6">← Volver a la carta</button>
    <h1 className="text-3xl font-serif font-bold">Mi perfil</h1>
    <div className="bg-white rounded-2xl border border-stone-200 p-6 my-6 space-y-4">
      <div className="flex items-center justify-between gap-3"><h2 className="font-bold text-lg">Mis datos</h2>{!editing && <button onClick={editProfile} className="text-sm font-semibold text-orange-800 border border-orange-200 px-4 py-2 rounded-lg hover:bg-orange-50">Editar datos</button>}</div>
      {success && <p role="status" className="text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 p-3 rounded-lg">{success}</p>}
      {editing ? <form onSubmit={save} className="space-y-4">
        <fieldset disabled={saving} className="space-y-4 disabled:opacity-60">
          <label className="block text-sm font-medium">Nombre de usuario (nombre y dos apellidos)<input className={inputClass} value={username} onChange={e => setUsername(e.target.value)} required minLength={3} maxLength={30} autoComplete="username" /></label>
          <p className="text-xs text-stone-500">Incluye tu nombre y tus dos apellidos (ej. Benjamín Pérez González). Usarás este nombre de usuario para iniciar sesión.</p>
          <label className="block text-sm font-medium">Teléfono<input className={inputClass} value={telefono} onChange={e => setTelefono(e.target.value)} type="tel" inputMode="numeric" maxLength={15} autoComplete="tel" required /></label>
          <label className="block text-sm font-medium">Dirección<input className={inputClass} value={direccion} onChange={e => setDireccion(e.target.value)} maxLength={120} autoComplete="street-address" required /></label>
          <div className="border-t border-stone-200 pt-4 space-y-4">
            <h3 className="text-sm font-semibold">Cambiar contraseña (opcional)</h3>
            <p className="text-xs text-stone-500">Deja estos campos vacíos para conservar tu contraseña.</p>
            <label className="block text-sm font-medium">Contraseña actual<input className={inputClass} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} type="password" autoComplete="current-password" required={!!newPassword} /></label>
            <label className="block text-sm font-medium">Nueva contraseña<input className={inputClass} value={newPassword} onChange={e => setNewPassword(e.target.value)} type="password" autoComplete="new-password" minLength={8} /></label>
            <label className="block text-sm font-medium">Confirmar nueva contraseña<input className={inputClass} value={confirmation} onChange={e => setConfirmation(e.target.value)} type="password" autoComplete="new-password" required={!!newPassword} /></label>
          </div>
          {error && <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 p-3 rounded-lg">{error}</p>}
          <div className="flex flex-wrap gap-3"><button type="submit" className="bg-orange-700 hover:bg-orange-800 text-white font-semibold px-5 py-2 rounded-lg">{saving ? 'Guardando…' : 'Guardar cambios'}</button><button type="button" onClick={() => { setEditing(false); setError(''); }} className="bg-stone-100 hover:bg-stone-200 px-5 py-2 rounded-lg">Cancelar</button></div>
        </fieldset>
      </form> : <div className="space-y-2"><p><span className="text-stone-500">Usuario: </span>{account.username}</p><p><span className="text-stone-500">Teléfono: </span>{account.telefono}</p><p><span className="text-stone-500">Dirección: </span>{account.direccion}</p><p className="text-sm text-stone-500">Estos datos se completan automáticamente al hacer un pedido.</p></div>}
    </div>
    <h2 className="text-xl font-semibold mb-4">Mis compras</h2>
    {purchases.length === 0 ? <p className="bg-white p-6 rounded-xl text-stone-500">Aún no tienes compras. Tus próximos pedidos aparecerán aquí.</p> : purchases.map(p => <article key={p.id_pedido} className="bg-white border border-stone-200 rounded-2xl p-6 mb-4">
      <div className="flex justify-between flex-wrap gap-3"><h3 className="font-bold">{p.codigo_pedido}</h3><span className="text-orange-800">{p.estado_pedido}</span></div>
      <p className="text-sm text-stone-500 my-2">{new Date(p.fecha_hora_pedido).toLocaleString('es-CL')}</p>
      <ul className="space-y-2 my-4">{p.detalles.map(d => <li key={d.id_detalle_pedido} className="flex justify-between gap-4"><span>{d.cantidad_detalle_pedido} × {d.nombre_colacion}</span><span>${d.subtotal_detalle_pedido.toLocaleString('es-CL')}</span></li>)}</ul>
      <p className="font-bold">Total: ${p.total_pedido.toLocaleString('es-CL')}</p><p className="text-sm mt-2">{p.tipo_entrega}{p.direccion_entrega ? ` · ${p.direccion_entrega}` : ''} · {p.metodo_pago_pedido}</p>
    </article>)}
    {!editing && <section aria-labelledby="eliminar-cuenta-titulo" className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6">
      <h2 id="eliminar-cuenta-titulo" className="font-semibold text-red-900">Eliminar cuenta</h2>
      <p className="text-sm text-red-900 mt-2">Esta acción es permanente: se eliminará tu cuenta y se cerrará tu sesión. Perderás el acceso a tu perfil y a tu historial. Los pedidos ya registrados se conservarán en el sistema del local; eliminar la cuenta no cancela pedidos.</p>
      {!confirmDelete ? <button type="button" onClick={() => { setConfirmDelete(true); setDeletePassword(''); setDeleteError(''); }} className="mt-4 px-4 py-2 rounded-lg border border-red-300 text-red-800 font-semibold hover:bg-red-100">Eliminar mi cuenta</button> : <form onSubmit={removeAccount} className="mt-4 space-y-4">
        <fieldset disabled={deleting} className="space-y-4 disabled:opacity-60">
          <p className="text-sm font-semibold text-red-900">¿Confirmas que quieres eliminar tu cuenta? Ingresa tu contraseña actual para continuar.</p>
          <label className="block text-sm font-medium text-red-900">Contraseña actual<input autoFocus className={inputClass} type="password" autoComplete="current-password" required value={deletePassword} onChange={e => setDeletePassword(e.target.value)} /></label>
          {deleteError && <p role="alert" className="text-sm text-red-800">{deleteError}</p>}
          <div className="flex flex-wrap gap-3"><button type="submit" className="rounded-lg bg-red-700 hover:bg-red-800 text-white font-semibold px-4 py-2">{deleting ? 'Eliminando…' : 'Eliminar cuenta definitivamente'}</button><button type="button" onClick={() => { setConfirmDelete(false); setDeletePassword(''); setDeleteError(''); }} className="rounded-lg border border-stone-300 bg-white px-4 py-2">Cancelar</button></div>
        </fieldset>
      </form>}
    </section>}
  </section>;
}
