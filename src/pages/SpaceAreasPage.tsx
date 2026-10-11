import { useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { MobileLayout } from "../components/layout/MobileLayout";
import { useApp } from "../context/AppContext";
import type { AreaDefinition } from "../types/settings";

export function SpaceAreasPage() {
  const { spaceId } = useParams();
  const { settings, updateSettings, tasks, updateTask } = useApp();
  const space = settings.spaces?.find(item => item.id === spaceId);
  const areas = space?.areas ?? [];
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  function saveAreas(value: AreaDefinition[]) {
    updateSettings({ spaces: settings.spaces?.map(item => item.id === spaceId ? { ...item, areas: value } : item) });
  }
  function save(event: FormEvent) {
    event.preventDefault(); const clean = name.trim(); if (!clean) return;
    if (areas.some(area => area.id !== editingId && area.name.toLocaleLowerCase("es") === clean.toLocaleLowerCase("es"))) { setError("Esa área ya existe en este espacio."); return; }
    saveAreas(editingId ? areas.map(area => area.id === editingId ? { ...area, name: clean } : area) : [...areas, { id: crypto.randomUUID(), name: clean }]);
    setName(""); setEditingId(null); setError("");
  }
  function remove(area: AreaDefinition) {
    if (!window.confirm(`¿Eliminar el área “${area.name}”? Sus tareas seguirán en ${space?.name}, sin área.`)) return;
    tasks.filter(task => task.spaceId === spaceId && task.area === area.id).forEach(task => updateTask(task.id, { area: undefined }));
    saveAreas(areas.filter(item => item.id !== area.id));
    if (editingId === area.id) { setEditingId(null); setName(""); }
  }
  if (!space) return <MobileLayout><Link to="/spaces">Volver a Espacios</Link><p>Espacio no disponible.</p></MobileLayout>;
  return <MobileLayout><div className="mx-auto max-w-xl">
    <Link to={`/spaces/${space.id}`} className="text-xs font-semibold text-gray-500">← {space.name}</Link>
    <h1 className="mt-3 text-2xl font-bold">Áreas de {space.name}</h1><p className="mt-2 text-sm text-gray-500">Estas áreas pertenecen únicamente a este espacio.</p>
    <form onSubmit={save} className="my-5 rounded-xl bg-white p-4"><label className="block text-sm font-semibold">{editingId ? "Editar área" : "Crear área"}<input required aria-label="Nombre del área" value={name} onChange={event => { setName(event.target.value); setError(""); }} className="mt-2 w-full rounded-lg border p-2 text-sm" /></label><div className="mt-3 flex gap-3"><button className="rounded-lg bg-gray-900 px-3 py-2 text-xs font-semibold text-white">{editingId ? "Guardar" : "Agregar área"}</button>{editingId && <button type="button" className="text-xs" onClick={() => { setEditingId(null); setName(""); }}>Cancelar</button>}</div>{error && <p role="alert" className="mt-2 text-xs text-red-600">{error}</p>}</form>
    <div className="space-y-2">{areas.map(area => <div key={area.id} className="flex items-center gap-3 rounded-xl bg-white p-3"><span className="min-w-0 flex-1 break-words text-sm font-semibold">{area.name}</span><span className="text-xs text-gray-400">{tasks.filter(task => task.spaceId === spaceId && task.area === area.id && task.status !== "cancelled").length}</span><button type="button" className="text-xs text-gray-500" onClick={() => { setEditingId(area.id); setName(area.name); }}>Editar</button><button type="button" className="text-xs text-red-600" onClick={() => remove(area)}>Eliminar</button></div>)}</div>
    {!areas.length && <p className="text-sm text-gray-500">Todavía no tienes áreas. Crea las que necesites para organizar {space.name}.</p>}
  </div></MobileLayout>;
}
