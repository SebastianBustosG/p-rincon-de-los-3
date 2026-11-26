import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api';
export interface Account { id: string; username: string; telefono: string; direccion: string; role: 'cliente' | 'administrador' }
interface AuthState {
  account: Account | null; entered: boolean; showProfile: boolean; authLoading: boolean; authError: string;
  setShowProfile: (show: boolean) => void;
  showLogin: boolean; setShowLogin: (show: boolean) => void;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, telefono: string, direccion: string, password: string) => Promise<void>;
  updateProfile: (data: { username: string; telefono: string; direccion: string; currentPassword?: string; newPassword?: string }) => Promise<void>;
  updateAdminCredentials: (username: string, currentPassword: string, newPassword: string) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
  enterGuest: () => void; logout: () => Promise<void>;
}
const AuthContext = createContext<AuthState | undefined>(undefined);
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<Account | null>(null);
  const [entered, setEntered] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  useEffect(() => {
    let active = true;
    api('auth/session/').then(result => {
      if (active) { setAccount(result.account); setEntered(true); }
    }).catch(err => { if (active) setAuthError(err.message); }).finally(() => { if (active) setAuthLoading(false); });
    return () => { active = false; };
  }, []);
  function start(user: Account | null) {
    setAccount(user); setEntered(true); setShowLogin(false); setShowProfile(false);
  }
  async function login(username: string, password: string) { start((await api('auth/login/', { username, password })).account); }
  async function register(username: string, telefono: string, direccion: string, password: string) { start((await api('auth/register/', { username, telefono, direccion, password })).account); }
  async function updateProfile(data: { username: string; telefono: string; direccion: string; currentPassword?: string; newPassword?: string }) {
    setAccount((await api('auth/profile/', data)).account);
  }
  async function updateAdminCredentials(username: string, currentPassword: string, newPassword: string) {
    await updateProfile({ username, currentPassword, newPassword, telefono: '', direccion: '' });
  }
  async function deleteAccount(password: string) { await api('auth/delete/', { password }); start(null); }
  async function logout() { await api('auth/logout/', {}); start(null); }
  function enterGuest() { setShowLogin(false); setShowProfile(false); }
  return <AuthContext.Provider value={{ account, entered, showProfile, setShowProfile, showLogin, setShowLogin, authLoading, authError, login, register, updateProfile, updateAdminCredentials, deleteAccount, enterGuest, logout }}>{children}</AuthContext.Provider>;
}
export function useAuth() { const context = useContext(AuthContext); if (!context) throw new Error('AuthProvider requerido'); return context; }
