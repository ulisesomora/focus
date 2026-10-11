import { isBacklog } from "../utils/taskBacklog";
import { useState } from "react";
import { ArrowDown, ArrowLeft, ArrowUp, ChevronRight, Pencil, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { MobileLayout } from "../components/layout/MobileLayout";
import { useApp } from "../context/AppContext";
import { defaultAreas } from "../types/settings";

export function AreasPage() {
  const { settings, updateSettings, updateTask, tasks } = useApp();
  const areas = settings.areas?.length ? settings.areas : defaultAreas;
  const focusIds = settings.focusAreaIds ?? defaultAreas.map((area) => area.id);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  function rename(id: string, value: string) {
    const clean = value.trim();
    if (!clean || areas.some((area) => area.id !== id && area.name.toLocaleLowerCase("es") === clean.toLocaleLowerCase("es"))) return;
    updateSettings({ areas: areas.map((area) => area.id === id ? { ...area, name: clean } : area) });
  }

  function add() {
    const clean = name.trim();
    if (!clean) return;
    if (areas.some((area) => area.name.toLocaleLowerCase("es") === clean.toLocaleLowerCase("es"))) { setError("Esa área ya existe."); return; }
    updateSettings({ areas: [...areas, { id: crypto.randomUUID(), name: clean }] });
    setName("");
    setError("");
  }

  function move(index: number, direction: number) {
    const target = index + direction;
    if (target < 0 || target >= areas.length) return;
    const reordered = [...areas];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    updateSettings({ areas: reordered });
  }

  function toggleFocus(id: string) {
    if (focusIds.includes(id)) {
      if (focusIds.length === 1) { setError("Deja al menos un área principal en Hoy."); return; }
      updateSettings({ focusAreaIds: focusIds.filter((item) => item !== id) });
    } else if (focusIds.length < 4) {
      updateSettings({ focusAreaIds: [...focusIds, id] });
      setError("");
    } else {
      setError("Hoy muestra un máximo de cuatro áreas. Quita una antes de elegir otra.");
    }
  }

  function remove(id: string, label: string) {
    if (areas.length === 1) { setError("Necesitas conservar al menos un área."); return; }
    if (!window.confirm(`¿Eliminar el área “${label}”? Sus tareas quedarán sin área.`)) return;
    tasks.filter((task) => !task.spaceId && task.area === id).forEach((task) => updateTask(task.id, { area: undefined }));
    const remaining = areas.filter((area) => area.id !== id);
    const nextFocus = focusIds.filter((item) => item !== id);
    updateSettings({ areas: remaining, focusAreaIds: nextFocus.length ? nextFocus : [remaining[0].id] });
  }

  return (
    <MobileLayout>
      <div className="mx-auto max-w-xl">
        <header className="mb-5 flex items-center gap-3">
          <Link to="/" aria-label="Volver a Hoy" className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-700"><ArrowLeft size={20} /></Link>
          <div className="min-w-0 flex-1"><h1 className="text-2xl font-bold text-gray-900">Áreas</h1><p className="text-sm text-gray-500">Tus tareas agrupadas por área.</p></div>
          <button type="button" onClick={() => { setEditing((value) => !value); setError(""); }} className="flex items-center gap-1 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-gray-700"><Pencil size={14} />{editing ? "Listo" : "Editar"}</button>
        </header>

        {editing && <p className="mb-3 text-xs leading-5 text-gray-500">Marca hasta cuatro áreas para Hoy. Usa las flechas para ordenar su prioridad.</p>}
        <div className="space-y-2">
          {areas.map((area, index) => {
            const count = tasks.filter((task) => !isBacklog(task) && !task.spaceId && task.area === area.id && task.status !== "cancelled").length;
            return (
              <div key={area.id} className="rounded-xl bg-white px-4 py-3">
                {editing ? (
                  <div>
                    <div className="flex items-center gap-2">
                      <input key={area.id + area.name} defaultValue={area.name}
                        onBlur={(event) => { rename(area.id, event.target.value); event.target.value = area.name; }}
                        onKeyDown={(event) => { if (event.key === "Enter") event.currentTarget.blur(); }}
                        aria-label={`Editar ${area.name}`} className="min-w-0 flex-1 border-b border-gray-200 py-1 text-sm font-semibold text-gray-900 outline-none" />
                      <button type="button" onClick={() => remove(area.id, area.name)} aria-label={`Eliminar ${area.name}`} className="p-1 text-gray-400"><Trash2 size={17} /></button>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <button type="button" onClick={() => toggleFocus(area.id)} aria-pressed={focusIds.includes(area.id)}
                        className={`rounded-full px-2 py-1 text-[11px] font-semibold ${focusIds.includes(area.id) ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-500"}`}>
                        {focusIds.includes(area.id) ? "En Hoy" : "Poner en Hoy"}
                      </button>
                      <span className="flex-1 text-right text-xs text-gray-400">{count} {count === 1 ? "tarea" : "tareas"}</span>
                      <button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label={`Subir prioridad de ${area.name}`} className="p-1 text-gray-600 disabled:text-gray-200"><ArrowUp size={17} /></button>
                      <button type="button" onClick={() => move(index, 1)} disabled={index === areas.length - 1} aria-label={`Bajar prioridad de ${area.name}`} className="p-1 text-gray-600 disabled:text-gray-200"><ArrowDown size={17} /></button>
                    </div>
                  </div>
                ) : (
                  <Link to={`/areas/${area.id}`} className="flex items-center gap-2">
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold text-gray-900">{area.name}</span>
                    <span className="text-xs text-gray-400">{count} {count === 1 ? "tarea" : "tareas"}</span><ChevronRight size={18} className="text-gray-400" />
                  </Link>
                )}
              </div>
            );
          })}
        </div>

        {editing && (
          <div className="mt-5 rounded-xl bg-white p-4">
            <label className="block text-sm font-semibold text-gray-700">Nueva área</label>
            <div className="mt-2 flex gap-2">
              <input value={name} onChange={(event) => { setName(event.target.value); setError(""); }} onKeyDown={(event) => { if (event.key === "Enter") add(); }} placeholder="Ej. Jardín Allende" className="h-11 min-w-0 flex-1 rounded-xl border border-gray-200 px-3 text-sm outline-none" />
              <button type="button" onClick={add} aria-label="Agregar área" className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-white"><Plus size={19} /></button>
            </div>
          </div>
        )}
        {error && <p role="alert" className="mt-2 text-xs text-red-600">{error}</p>}
      </div>
    </MobileLayout>
  );
}
