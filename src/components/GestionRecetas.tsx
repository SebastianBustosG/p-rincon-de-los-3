import React, { useState } from 'react';
import { api } from '../api';
import { useApp } from '../context/AppContext';
import type { Colacion } from '../types';
type Ingredient = { insumo_id: number; cantidad: number | string };
const empty = { nombre_colacion: '', descripcion_colacion: '', precio_colacion: 1, categoria: 'Plato Tradicional', imagen: '', tiempo_estimado: '', activa_colacion: true };
export function GestionRecetas() {
  const { colaciones, insumos, recetas, refresh } = useApp();
  const [draft, setDraft] = useState<Partial<Colacion>>({ ...empty });
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  function edit(dish?: Colacion) {
    setDraft(dish ? { ...dish } : { ...empty });
    setIngredients(dish ? recetas.filter(r => r.colacion_id === dish.id_colacion).map(r => ({ insumo_id: r.insumo_id, cantidad: r.cantidad_necesaria_receta })) : []);
    setError(''); setOpen(true);
  }
  async function save(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError('');
    try { await api('dishes/save/', { ...draft, ingredientes: ingredients }); await refresh(); setOpen(false); }
    catch(e) { setError(e instanceof Error ? e.message : 'No se pudo guardar.'); } finally { setBusy(false); }
  }
  async function remove(dish: Colacion) {
    if (!window.confirm(`¿Eliminar ${dish.nombre_colacion} y su receta?`)) return;
    setBusy(true); setError('');
    try { await api('dishes/delete/', { id_colacion: dish.id_colacion }); await refresh(); }
    catch(e) { setError(e instanceof Error ? e.message : 'No se pudo eliminar.'); } finally { setBusy(false); }
  }
  const cost = ingredients.reduce((sum, r) => sum + Number(r.cantidad) * (insumos.find(i => i.id_insumo === r.insumo_id)?.costo_unitario || 0), 0);
  const portions = ingredients.length ? Math.min(...ingredients.map(r => Number(r.cantidad) > 0 ? Math.floor((insumos.find(i => i.id_insumo === r.insumo_id)?.stock_actual_insumo || 0) / Number(r.cantidad)) : 0)) : 0;
  const price = draft.precio_colacion || 0;
  const input = 'block w-full rounded border p-2';
  return <section className="space-y-3 rounded-xl border bg-white p-4" aria-label="Administrar colaciones y recetas">
    <button disabled={busy} className="rounded bg-orange-700 px-4 py-2 text-white" onClick={() => edit()}>Nueva colación y receta</button>
    <div className="flex flex-wrap gap-2">{colaciones.map(d => <div className="rounded border p-2 text-sm" key={d.id_colacion}>{d.nombre_colacion}<button disabled={busy} className="px-2 underline" onClick={() => edit(d)}>Editar</button><button disabled={busy} className="text-red-700 underline" onClick={() => void remove(d)}>Eliminar</button></div>)}</div>
    {error && <p role="alert" className="text-red-700">{error}</p>}
    {open && <form onSubmit={save} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label>Nombre<input required maxLength={50} className={input} value={draft.nombre_colacion || ''} onChange={e => setDraft({ ...draft, nombre_colacion: e.target.value })} /></label>
        <label>Precio (CLP)<input required type="number" min="1" step="1" className={input} value={draft.precio_colacion ?? ''} onChange={e => setDraft({ ...draft, precio_colacion: Number(e.target.value) })} /></label>
        <label>Descripción<input maxLength={100} className={input} value={draft.descripcion_colacion || ''} onChange={e => setDraft({ ...draft, descripcion_colacion: e.target.value })} /></label>
        <label>Categoría<select className={input} value={draft.categoria} onChange={e => setDraft({ ...draft, categoria: e.target.value })}><option>Plato Tradicional</option><option>Especial del Día</option></select></label>
        <label>Imagen (URL opcional)<input type="url" maxLength={500} className={input} value={draft.imagen || ''} onChange={e => setDraft({ ...draft, imagen: e.target.value })} /></label>
        <label>Tiempo estimado<input maxLength={30} className={input} value={draft.tiempo_estimado || ''} onChange={e => setDraft({ ...draft, tiempo_estimado: e.target.value })} /></label>
        <label><input type="checkbox" checked={draft.activa_colacion} onChange={e => setDraft({ ...draft, activa_colacion: e.target.checked })} /> Activa en carta</label>
      </div>
      <h4 className="font-bold">Ingredientes por porción</h4>
      {ingredients.map((r, index) => <div key={index} className="flex flex-wrap gap-2">
        <label>Insumo<select required className={input} value={r.insumo_id || ''} onChange={e => setIngredients(ingredients.map((v, n) => n === index ? { ...v, insumo_id: Number(e.target.value) } : v))}><option value="">Seleccionar</option>{insumos.map(i => <option key={i.id_insumo} value={i.id_insumo}>{i.nombre_insumo} ({i.unidad_medida_insumo})</option>)}</select></label>
        <label>Cantidad<input required type="number" min="0.001" step="0.001" className={input} value={r.cantidad} onChange={e => setIngredients(ingredients.map((v, n) => n === index ? { ...v, cantidad: e.target.value } : v))} /></label>
        <button type="button" className="text-red-700 underline" onClick={() => setIngredients(ingredients.filter((_, n) => n !== index))}>Quitar ingrediente</button>
      </div>)}
      <button type="button" className="underline" onClick={() => setIngredients([...ingredients, { insumo_id: 0, cantidad: 0.001 }])}>Agregar ingrediente</button>
      <p className="rounded bg-orange-50 p-3" aria-live="polite">Costo: ${cost.toLocaleString('es-CL')} · Margen: ${(price - cost).toLocaleString('es-CL')} ({price > 0 ? Math.round((price - cost) / price * 100) : 0}%) · Porciones disponibles: {portions}</p>
      <div className="flex gap-4"><button disabled={busy} className="rounded bg-orange-700 px-4 py-2 text-white">{busy ? 'Guardando…' : 'Guardar'}</button><button disabled={busy} type="button" onClick={() => setOpen(false)}>Cancelar</button></div>
    </form>}
  </section>;
}
