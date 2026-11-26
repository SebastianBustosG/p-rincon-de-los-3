import { ThemeToggle } from '../context/ThemeContext';
import React from 'react';
import { UtensilsCrossed, ShoppingBag, ChefHat, LayoutDashboard, LogOut, LogIn, UserRound } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
export function Navbar() {
  const { activeModule, setActiveModule, cart } = useApp();
  const { account, logout, showProfile, setShowProfile, showLogin, setShowLogin } = useAuth();
  const isAdmin = account?.role === 'administrador';
  const count = cart.reduce((n, item) => n + item.cantidad, 0);
  function navigate(module: 'cliente' | 'cocina' | 'admin') { setShowLogin(false); setShowProfile(false); setActiveModule(module); }
  const button = (active: boolean) => `flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${active ? 'bg-orange-100 text-orange-900 font-semibold' : 'hover:bg-stone-100 text-stone-600'}`;
  return <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-stone-200">
    <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between flex-wrap gap-3">
      <div className="flex items-center gap-3"><div className="bg-orange-700 p-3 rounded-xl text-white"><UtensilsCrossed size={23} /></div><div><p className="font-serif text-xl font-bold">El rincón de los 3</p><p className="text-xs text-stone-500">Colaciones caseras · Talca</p></div></div>
      <nav aria-label="Navegación principal" className="flex gap-1 flex-wrap">
        <button className={button(activeModule === 'cliente' && !showProfile && !showLogin)} onClick={() => navigate('cliente')}><ShoppingBag size={17} />Carta {count > 0 && <span>({count})</span>}</button>
        {isAdmin && <><button className={button(activeModule === 'cocina')} onClick={() => navigate('cocina')}><ChefHat size={17} />Cocina</button><button className={button(activeModule === 'admin')} onClick={() => navigate('admin')}><LayoutDashboard size={17} />Administración</button></>}
        {account && <button className={button(showProfile)} onClick={() => { setActiveModule('cliente'); setShowProfile(true); }}><UserRound size={17} />{isAdmin ? 'Mi cuenta' : 'Mi perfil'}</button>}
      </nav>
      <div className="ml-auto flex items-center gap-3"><ThemeToggle /><span className="text-xs text-stone-500">{account ? `${account.username} · ${isAdmin ? 'Administrador' : 'Cliente'}` : 'Invitado'}</span><button onClick={() => { if (account) void logout().catch(err => alert(err.message)); else setShowLogin(true); }} className="flex items-center gap-1 text-sm text-orange-800 border border-orange-200 rounded-lg px-3 py-2">{account ? <LogOut size={16} /> : <LogIn size={16} />}{account ? 'Salir' : 'Iniciar sesión'}</button></div>
    </div>
  </header>;
}
