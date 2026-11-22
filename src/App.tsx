import { PerfilAdministrador } from './components/PerfilAdministrador';
import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './components/Login';
import { PerfilCliente } from './components/PerfilCliente';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Modulo1Carta } from './components/Modulo1Carta';
import { Modulo2Cocina } from './components/Modulo2Cocina';
import { Modulo3Admin } from './components/Modulo3Admin';
import { ModalVerCodigoVanilla } from './components/ModalVerCodigoVanilla';

const AppContent: React.FC = () => {
  const { activeModule, loading, dataError, refresh } = useApp();
  const { account, entered, showProfile, authLoading, authError } = useAuth();
  if (authLoading) return <main className="min-h-screen bg-[#E7E2DA] p-10 text-center">Conectando con el servidor…</main>;
  if (authError) return <main className="min-h-screen bg-[#E7E2DA] p-10 text-center"><p role="alert">{authError}</p><button onClick={() => window.location.reload()} className="mt-4 bg-orange-700 text-white px-4 py-2 rounded-lg">Reintentar conexión</button></main>;
  if (!entered) return <Login />;
  const isAdmin = account?.role === 'administrador';

  return (
    <div className="min-h-screen flex flex-col text-stone-800 bg-[#E7E2DA]">
      <Navbar />

      <main className="flex-1 pb-16">
        {loading && <p role="status" className="p-4 text-center">Cargando datos de la base…</p>}
        {dataError && <div role="alert" className="m-4 p-3 rounded-lg bg-red-50 text-red-800">{dataError} <button className="underline" onClick={() => { void refresh().catch(() => {}); }}>Reintentar</button></div>}
        {showProfile && account ? (isAdmin ? <PerfilAdministrador /> : <PerfilCliente />) : <>
        {(activeModule === 'cliente' || !isAdmin) && <Modulo1Carta />}
        </>}
        {!showProfile && isAdmin && activeModule === 'cocina' && <Modulo2Cocina />}
        {!showProfile && isAdmin && activeModule === 'admin' && <Modulo3Admin />}
      </main>

      <footer className="bg-white border-t border-stone-200 py-6 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-serif font-medium text-stone-700">
            © 2026 El rincón de los 3 · Emprendimiento de Colaciones Caseras Chilenas
          </p>
          <div className="flex items-center gap-4 text-stone-400 text-[11px]">
            <span>CLP $</span>
          </div>
        </div>
      </footer>

      {isAdmin && <ModalVerCodigoVanilla />}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider><AppProvider>
      <AppContent />
    </AppProvider></AuthProvider>
  );
}
