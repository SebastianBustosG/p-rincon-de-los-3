import React, { createContext, useContext, useLayoutEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
const DARK_MODE_ENABLED = false;

type Theme = 'light' | 'dark';
const ThemeContext = createContext<{ theme: Theme; toggle: () => void } | null>(null);
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [preferredTheme, setTheme] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem('rincon_theme_v1');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {}
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  const theme: Theme = DARK_MODE_ENABLED ? preferredTheme : 'light';
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    try { if (DARK_MODE_ENABLED) localStorage.setItem('rincon_theme_v1', theme); } catch {}
  }, [theme]);
  return <ThemeContext.Provider value={{ theme, toggle: () => setTheme(prev => prev === 'dark' ? 'light' : 'dark') }}>{children}</ThemeContext.Provider>;
}
export function ThemeToggle() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('ThemeProvider requerido');
  if (!DARK_MODE_ENABLED) return null;
  const dark = context.theme === 'dark';
  return <button type="button" role="switch" aria-checked={dark} aria-label="Modo oscuro" title={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'} onClick={context.toggle} className="theme-toggle inline-flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-3 py-2 text-stone-700 shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 shrink-0">
    {dark ? <Moon size={17} aria-hidden="true" /> : <Sun size={17} aria-hidden="true" />}
    <span className="hidden sm:inline text-xs font-medium">Modo oscuro</span>
    <span aria-hidden="true" className={`relative h-5 w-9 rounded-full transition-colors ${dark ? 'bg-orange-600' : 'bg-stone-300'}`}><span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${dark ? 'translate-x-4' : ''}`} /></span>
  </button>;
}