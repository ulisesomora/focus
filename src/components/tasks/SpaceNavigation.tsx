import { Link } from "react-router-dom";
import { useApp } from "../../context/AppContext";
export type SpaceView = "tasks" | "today" | "tomorrow";
export function SpaceNavigation({ spaceId, view, onChange }: { spaceId: string; view: SpaceView; onChange: (view: SpaceView) => void }) {
  const { settings } = useApp();
  const space = settings.spaces?.find(item => item.id === spaceId);
  return <nav aria-label="Vistas del espacio" className="mb-3 flex flex-wrap items-center gap-2">
    <Link to="/spaces" aria-label="Volver a Espacios" className="mr-1 text-xs text-gray-500">← Espacios</Link>
    {([["tasks", "Tareas"], ["today", "Hoy"], ["tomorrow", "Mañana"]] as const).map(([value, label]) => <button key={value} type="button" aria-pressed={view === value} onClick={() => onChange(value)} className={`rounded-lg border px-3 py-2 text-xs font-semibold ${view === value ? "text-white" : "border-gray-200 bg-white text-gray-600"}`} style={view === value ? { backgroundColor: space?.color ?? "#6366f1", borderColor: space?.color ?? "#6366f1" } : undefined}>{label}</button>)}
    <Link to={`/spaces/${spaceId}/areas`} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600">Áreas</Link>
    <Link to={`/agenda?space=${spaceId}`} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600">Agenda</Link>
  </nav>;
}
