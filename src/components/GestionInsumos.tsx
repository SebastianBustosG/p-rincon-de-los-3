import { useState } from 'react';
import { api } from '../api';
import { useApp } from '../context/AppContext';
import type { Insumo } from '../types';
const empty = { nombre_insumo: '', unidad_medida_insumo: 'kg', stock_actual_insumo: 0, stock_minimo_insumo: 0, costo_unitario: 0 };
export function GestionInsumos() {
  const { insumos, refresh } = useApp();
  const [draft, setDraft] = useState<Partial<Insumo>>({ ...empty } as Partial<Insumo>);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function save(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError('');
    try { await api('supplies/save/', draft); await refresh(); setOpen(false); }
    catch(e) { setError(e instanceof Error ? e.message : 'No se pudo guardar.'); } finally { setBusy(false); }
  }
  async function remove(i: Insumo) {
    if (!window.confirm(`¿Eliminar el insumo ${i.nombre_insumo}?`)) return;
    setBusy(true); setError('');
    try { await api('supplies/delete/', { id_insumo: i.id_insumo }); await refresh(); }
    catch(e) { setError(e instanceof Error ? e.message : 'No se pudo eliminar.'); } finally { setBusy(false); }
  }
  return <section className="rounded-xl border bg-white p-4 space-y-3" aria-label="Administrar insumos">
    <button disabled={busy} className="bg-orange-700 text-white rounded-lg px-4 py-2" onClick={() => { setDraft({ ...empty } as Partial<Insumo>); setError(''); setOpen(true); }}>Nuevo insumo</button>
    <div className="flex flex-wrap gap-2">{insumos.map(i => <div key={i.id_insumo} className="border rounded-lg p-2 text-sm"><span>{i.nombre_insumo} </span><button disabled={busy} className="underline px-2" onClick={() => { setDraft({ ...i }); setError(''); setOpen(true); }}>Editar</button><button disabled={busy} className="text-red-700 underline" onClick={() => void remove(i)}>Eliminar</button></div>)}</div>
    {error && <p role="alert" className="text-red-700">{error}</p>}
    {open && <form onSubmit={save} className="grid sm:grid-cols-2 gap-3">
      <label>Nombre<input required maxLength={50} className="block border rounded p-2 w-full" value={draft.nombre_insumo || ''} onChange={e => setDraft({ ...draft, nombre_insumo: e.target.value })} /></label>
      <label>Unidad<select className="block border rounded p-2 w-full" value={draft.unidad_medida_insumo} onChange={e => setDraft({ ...draft, unidad_medida_insumo: e.target.value as Insumo['unidad_medida_insumo'] })}>{['kg','gr','un','lts','ml'].map(u => <option key={u}>{u}</option>)}</select></label>
      {(['stock_actual_insumo','stock_minimo_insumo','costo_unitario'] as const).map((key, n) => <label key={key}>{['Stock actual','Stock mínimo','Costo unitario (CLP)'][n]}<input required type="number" min="0" step={key === 'costo_unitario' ? '0.01' : '0.001'} className="block border rounded p-2 w-full" value={draft[key] ?? 0} onChange={e => setDraft({ ...draft, [key]: e.target.value === '' ? '' : Number(e.target.value) })} /></label>)}
      <div className="flex gap-3 items-end"><button disabled={busy} className="bg-orange-700 text-white rounded px-4 py-2">{busy ? 'Guardando…' : 'Guardar'}</button><button type="button" disabled={busy} onClick={() => setOpen(false)}>Cancelar</button></div>
    </form>}
  </section>;
}
