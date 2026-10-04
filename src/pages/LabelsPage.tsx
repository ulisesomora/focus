import { useState } from "react";
import { MobileLayout } from "../components/layout/MobileLayout";
import { useApp } from "../context/AppContext";
import { useLabelCatalog } from "../components/labels/LabelPicker";
import { labelKey } from "../utils/labels";

export function LabelsPage() {
  const labels = useLabelCatalog();
  const { tasks, habits, createLabel, renameLabel, deleteLabel } = useApp();
  const [query, setQuery] = useState("");
  const [name, setName] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const shown = labels.filter(label => labelKey(label).includes(labelKey(query)));
  return <MobileLayout><div className="mx-auto max-w-2xl">
    <h1 className="text-2xl font-bold text-gray-900">Etiquetas</h1><p className="mt-1 text-sm text-gray-500">Agrupa tareas de distintas áreas.</p>
    <form className="mt-5 flex gap-2" onSubmit={event => { event.preventDefault(); if (!name.trim()) return; createLabel(name); setName(""); }}><input aria-label="Nombre de nueva etiqueta" value={name} onChange={event => setName(event.target.value)} placeholder="Nueva etiqueta" className="h-10 min-w-0 flex-1 rounded-lg border border-gray-200 px-3 text-sm" /><button disabled={!name.trim()} className="rounded-lg bg-gray-900 px-4 text-sm font-semibold text-white disabled:opacity-40">Crear</button></form>
    <input aria-label="Buscar etiquetas" value={query} onChange={event => setQuery(event.target.value)} placeholder="Buscar etiquetas…" className="mt-4 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm" />
    {error && <p role="alert" className="mt-2 text-xs text-red-600">{error}</p>}
    <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white">{shown.map(label => {
      const count = tasks.filter(task => task.labels?.some(item => labelKey(item) === labelKey(label))).length;
      const habitCount = habits.filter(habit => habit.labels?.some(item => labelKey(item) === labelKey(label))).length;
      return <div key={label} className="border-b border-gray-100 p-3 last:border-0">{editing === label ? <form className="flex gap-2" onSubmit={event => { event.preventDefault(); if (!renameLabel(label, draft)) { setError("Escribe un nombre válido que no pertenezca a otra etiqueta."); return; } setEditing(null); setError(""); }}><input autoFocus aria-label="Renombrar etiqueta" value={draft} onChange={event => setDraft(event.target.value)} className="h-9 min-w-0 flex-1 rounded-lg border border-gray-200 px-2 text-sm" /><button className="text-xs font-semibold text-indigo-600">Guardar</button><button type="button" onClick={() => { setEditing(null); setError(""); }} className="text-xs text-gray-500">Cancelar</button></form> : <div className="flex items-center gap-3"><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-gray-800">#{label}</p><p className="mt-1 text-xs text-gray-400">{count} tareas · {habitCount} hábitos</p></div><button type="button" onClick={() => { setEditing(label); setDraft(label); setError(""); }} className="text-xs font-semibold text-gray-600">Modificar</button><button type="button" onClick={() => { if (window.confirm(`¿Eliminar la etiqueta “${label}”? Se quitará de las tareas y hábitos que la usan.`)) deleteLabel(label); }} className="text-xs text-red-600">Eliminar</button></div>}</div>;
    })}{!shown.length && <p className="p-6 text-center text-sm text-gray-500">{query ? "No hay coincidencias." : "Aún no hay etiquetas. Crea una aquí o desde una tarea."}</p>}</div>
  </div></MobileLayout>;
}
