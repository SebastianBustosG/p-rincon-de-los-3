import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
export function PerfilAdministrador() {
  const { account, setShowProfile, updateAdminCredentials } = useAuth();
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  if (account?.role !== 'administrador') return null;
  function edit() {
    setUsername(account!.username); setCurrentPassword(''); setNewPassword(''); setConfirmation('');
    setError(''); setSuccess(''); setEditing(true);
  }
  async function save(e: React.FormEvent) {
    e.preventDefault(); setError(''); setSuccess('');
    if (newPassword !== confirmation) { setError('Las contraseñas nuevas no coinciden.'); return; }
    setSaving(true);
    try {
      await updateAdminCredentials(username, currentPassword, newPassword);
      setEditing(false); setCurrentPassword(''); setNewPassword(''); setConfirmation('');
      setSuccess('Tus credenciales se guardaron correctamente. Usa los datos actualizados en tu próximo inicio de sesión.');
    } catch (err) { setError(err instanceof Error ? err.message : 'No se pudieron guardar las credenciales.'); }
    finally { setSaving(false); }
  }
  const inputClass = 'mt-1 w-full border border-stone-300 rounded-lg px-3 py-2 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-orange-400';
  return <section className="max-w-4xl mx-auto px-5 py-10">
    <button onClick={() => setShowProfile(false)} className="text-orange-800 mb-6">← Volver a la carta</button>
    <h1 className="text-3xl font-serif font-bold">Mi cuenta</h1>
    <p className="text-sm text-stone-500 mt-2">Administra tus credenciales de acceso.</p>
    <div className="bg-white rounded-2xl border border-stone-200 p-6 my-6 space-y-4">
      <div className="flex items-center justify-between gap-3"><h2 className="font-bold text-lg">Mis datos</h2>{!editing && <button onClick={edit} className="text-sm font-semibold text-orange-800 border border-orange-200 px-4 py-2 rounded-lg hover:bg-orange-50">Editar datos</button>}</div>
      {success && <p role="status" className="text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 p-3 rounded-lg">{success}</p>}
      {editing ? <form onSubmit={save} className="space-y-4">
        <fieldset disabled={saving} className="space-y-4 disabled:opacity-60">
          <label className="block text-sm font-medium">Nombre de usuario<input className={inputClass} required minLength={3} maxLength={30} autoComplete="username" value={username} onChange={e => setUsername(e.target.value)} /></label>
          <p className="text-xs text-stone-500">Usarás este nombre de usuario para iniciar sesión.</p>
          <label className="block text-sm font-medium">Contraseña actual<input className={inputClass} required type="password" autoComplete="current-password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} /></label>
          <p className="text-xs text-stone-500">Confirma tu contraseña actual para guardar cualquier cambio.</p>
          <div className="border-t border-stone-200 pt-4 space-y-4">
            <h3 className="text-sm font-semibold">Cambiar contraseña (opcional)</h3>
            <p className="text-xs text-stone-500">Deja estos campos vacíos para conservar tu contraseña. La nueva debe tener al menos 8 caracteres.</p>
            <label className="block text-sm font-medium">Nueva contraseña<input className={inputClass} type="password" minLength={8} autoComplete="new-password" value={newPassword} onChange={e => setNewPassword(e.target.value)} /></label>
            <label className="block text-sm font-medium">Confirmar nueva contraseña<input className={inputClass} type="password" required={!!newPassword} autoComplete="new-password" value={confirmation} onChange={e => setConfirmation(e.target.value)} /></label>
          </div>
          {error && <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 p-3 rounded-lg">{error}</p>}
          <div className="flex flex-wrap gap-3"><button type="submit" className="bg-orange-700 hover:bg-orange-800 text-white font-semibold px-5 py-2 rounded-lg">{saving ? 'Guardando…' : 'Guardar cambios'}</button><button type="button" onClick={() => { setEditing(false); setError(''); setCurrentPassword(''); setNewPassword(''); setConfirmation(''); }} className="bg-stone-100 hover:bg-stone-200 px-5 py-2 rounded-lg">Cancelar</button></div>
        </fieldset>
      </form> : <div className="space-y-2"><p><span className="text-stone-500">Usuario: </span>{account.username}</p><p><span className="text-stone-500">Rol: </span>Administrador</p><p className="text-sm text-stone-500">Tu contraseña no se muestra por seguridad.</p></div>}
    </div>
  </section>;
}