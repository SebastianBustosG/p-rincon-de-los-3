import { ThemeToggle } from '../context/ThemeContext';
import React, { useState } from 'react';
import { UtensilsCrossed, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
export function Login() {
  const { login, register, enterGuest } = useAuth();
  const [registering, setRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError(''); setBusy(true);
    try { if (registering) await register(username, telefono, direccion, password); else await login(username, password); }
    catch (err) { setError(err instanceof Error ? err.message : 'No se pudo ingresar. Inténtalo otra vez.'); }
    finally { setBusy(false); }
  }
  const input = 'w-full mt-2 border border-stone-300 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500';
  return <main className="relative min-h-screen bg-[#FAF7F2] flex items-center justify-center px-5 pt-24 pb-8 text-stone-800">
    <div className="absolute top-5 right-5"><ThemeToggle /></div>
    <div className="w-full max-w-4xl grid md:grid-cols-2 bg-white rounded-3xl shadow-xl overflow-hidden">
      <section className="bg-stone-900 text-white p-8 md:p-12 flex flex-col justify-center">
        <UtensilsCrossed className="text-orange-400 w-12 h-12 mb-8" />
        <p className="uppercase tracking-widest text-xs text-orange-300 mb-3">Colaciones caseras · Talca</p>
        <h1 className="font-serif text-4xl font-bold mb-5">El rincón de los 3</h1>
        <p className="text-stone-300 leading-relaxed">Tu comida de siempre, lista para disfrutar. Crea tu cuenta para recordar tus datos de entrega y consultar tus compras.</p>
      </section>
      <section className="p-7 md:p-10">
        <h2 className="text-2xl font-serif font-bold">{registering ? 'Crea tu cuenta' : 'Bienvenido a la mesa'}</h2>
        <p className="text-sm text-stone-500 mt-2 mb-6">{registering ? 'Completa tus datos para comprar más fácil.' : 'Ingresa a tu cuenta o explora la carta como invitado.'}</p>
        <form onSubmit={submit} className="space-y-4">
          <label className="block text-sm font-medium">{registering ? 'Nombre de usuario (nombre y dos apellidos)' : 'Nombre de usuario'}<input className={input} required minLength={registering ? 3 : 1} maxLength={30} autoComplete="username" placeholder={registering ? 'Ej. Benjamín Pérez González' : undefined} aria-describedby={registering ? 'registro-nombre-ayuda' : undefined} value={username} onChange={e => setUsername(e.target.value)} /></label>
          {registering && <p id="registro-nombre-ayuda" className="text-xs text-stone-500">Tu nombre de usuario debe incluir tu nombre y tus dos apellidos, separados por espacios. Lo usarás para iniciar sesión.</p>}
          {registering && <><label className="block text-sm font-medium">Teléfono<input className={input} maxLength={15} type="tel" inputMode="numeric" autoComplete="tel" placeholder="Ej. 56912345678" aria-describedby="registro-telefono-ayuda" required value={telefono} onChange={e => setTelefono(e.target.value)} /></label>
          <p id="registro-telefono-ayuda" className="text-xs text-stone-500">Solo números, sin +, espacios ni símbolos. Ejemplo: 56912345678.</p>
          <label className="block text-sm font-medium">Dirección<input className={input} maxLength={120} autoComplete="street-address" required value={direccion} onChange={e => setDireccion(e.target.value)} /></label></>}
          <label className="block text-sm font-medium">Contraseña<input className={input} type="password" autoComplete={registering ? 'new-password' : 'current-password'} required minLength={registering ? 8 : 1} value={password} onChange={e => setPassword(e.target.value)} /></label>
          {registering && <p className="text-xs text-stone-500">Usa al menos 8 caracteres.</p>}
          {error && <p role="alert" className="text-sm text-red-700 bg-red-50 p-3 rounded-lg">{error}</p>}
          <button disabled={busy} className="w-full bg-orange-700 hover:bg-orange-800 text-white font-semibold rounded-xl py-3 disabled:opacity-50">{busy ? 'Un momento…' : registering ? 'Crear cuenta' : 'Iniciar sesión'}</button>
        </form>
        <button disabled={busy} onClick={() => { setRegistering(!registering); setError(''); setPassword(''); }} className="w-full mt-4 text-sm text-orange-800 underline">{registering ? 'Ya tengo cuenta' : 'Crear una cuenta de cliente'}</button>
        <button disabled={busy} onClick={enterGuest} className="w-full mt-6 border border-stone-300 py-3 rounded-xl flex justify-center items-center gap-2 text-sm">Continuar como invitado <ArrowRight size={16} /></button>
      </section>
    </div>
  </main>;
}
