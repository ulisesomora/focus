import { isBacklog } from "../utils/taskBacklog";
import { spaceColor, spaceColors } from "../utils/spaceColors";
import { areaForTask } from "../utils/taskSpaces";
import { useEffect, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { MobileLayout } from "../components/layout/MobileLayout";
import { useApp } from "../context/AppContext";
import { TodayPage } from "./TodayPage";

export function SpaceTasksPage() {
  const { spaceId } = useParams();
  const { settings, tasks, updateSettings } = useApp();
  useEffect(() => {
    const space = settings.spaces?.find(item => item.id === spaceId);
    if (!space) return;
    const areas = [...(space.areas ?? [])];
    tasks.filter(task => task.spaceId === spaceId && task.area).forEach(task => {
      if (areas.some(area => area.id === task.area)) return;
      const source = areaForTask(settings, task);
      if (source) areas.push({ ...source });
    });
    if (areas.length !== (space.areas ?? []).length) updateSettings({ spaces: settings.spaces?.map(item => item.id === spaceId ? { ...item, areas } : item) });
  }, [spaceId, settings, tasks, updateSettings]);
  if (!spaceId || !settings.spaces?.some(space => space.id === spaceId)) return <MobileLayout><p>Este espacio no está disponible.</p><Link to="/spaces">Volver a Espacios</Link></MobileLayout>;
  return <TodayPage key={spaceId} spaceId={spaceId} />;
}
export function SpacesPage() {
  const { settings, updateSettings, tasks } = useApp();
  const spaces = settings.spaces ?? [];
  const [name, setName] = useState("");
  const [color, setColor] = useState<string>(spaceColors[1].value);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  function save(event: FormEvent) {
    event.preventDefault();
    const clean = name.trim();
    if (!clean) return;
    if (spaces.some(space => space.id !== editingId && space.name.toLocaleLowerCase("es") === clean.toLocaleLowerCase("es"))) { setError("Ya existe un espacio con ese nombre."); return; }
    updateSettings({ spaces: editingId ? spaces.map(space => space.id === editingId ? { ...space, name: clean, color } : space) : [...spaces, { id: crypto.randomUUID(), name: clean, color, showInAgenda: true }] });
    setName(""); setEditingId(null); setError("");
  }
  return <MobileLayout><div className="mx-auto max-w-2xl">
    <h1 className="text-2xl font-bold">Espacios</h1><p className="mt-2 text-sm text-gray-500">Cada tarea vive en un espacio o en General. Su área y etiquetas se conservan.</p>
    <form onSubmit={save} className="my-5 rounded-xl bg-white p-4">
      <label className="block text-sm font-semibold">{editingId ? "Editar espacio" : "Crear espacio"}<input required aria-label="Nombre del espacio" value={name} onChange={event => setName(event.target.value)} className="mt-2 w-full rounded-lg border p-2 text-sm" /></label>
      <fieldset className="mt-4"><legend className="text-xs font-semibold text-gray-500">Color del espacio · {spaceColors.find(item => item.value === color)?.name}</legend><div className="mt-2 grid grid-cols-10 gap-2">{spaceColors.map(item => <button key={item.value} type="button" aria-label={item.name} title={item.name} aria-pressed={color === item.value} onClick={() => setColor(item.value)} className={`flex h-8 w-full items-center justify-center rounded-lg border-2 text-sm text-white ${color === item.value ? "border-gray-900 ring-2 ring-gray-200" : "border-transparent"}`} style={{ backgroundColor: item.value }}>{color === item.value ? "✓" : ""}</button>)}</div></fieldset>
      <div className="mt-3 flex items-center gap-3"><button className="rounded-lg bg-gray-900 px-3 py-2 text-xs font-semibold text-white">{editingId ? "Guardar" : "Crear espacio"}</button>{editingId && <button type="button" onClick={() => { setEditingId(null); setName(""); }} className="text-xs">Cancelar</button>}</div>
      {error && <p role="alert" className="mt-2 text-xs text-red-600">{error}</p>}
    </form>
    <div className="space-y-3">{spaces.map(space => <section key={space.id} className="rounded-xl border bg-white p-4" style={{ borderLeft: `4px solid ${spaceColor(space.color)}` }}>
      <div className="flex items-center justify-between gap-2"><Link to={`/spaces/${space.id}`} className="min-w-0 flex-1"><h2 className="break-words font-semibold">{space.name}</h2><p className="mt-1 text-xs text-gray-500">{tasks.filter(task => !isBacklog(task) && task.spaceId === space.id && task.status !== "cancelled").length} tareas</p></Link><button type="button" className="text-xs text-gray-500" onClick={() => { setEditingId(space.id); setName(space.name); setColor(spaceColor(space.color)); }}>Editar</button></div>
      <label className="mt-3 flex items-center gap-2 text-xs text-gray-600"><input type="checkbox" checked={space.showInAgenda !== false} onChange={event => updateSettings({ spaces: spaces.map(item => item.id === space.id ? { ...item, showInAgenda: event.target.checked } : item) })} />Mostrar sus tareas planificadas en Agenda</label>
      <Link to={`/spaces/${space.id}`} className="mt-3 inline-block text-xs font-semibold" style={{ color: spaceColor(space.color) }}>Abrir espacio →</Link>
    </section>)}</div>
    {!spaces.length && <p className="text-sm text-gray-500">Crea tu primer espacio, por ejemplo Jardín Allende.</p>}
  </div></MobileLayout>;
}
