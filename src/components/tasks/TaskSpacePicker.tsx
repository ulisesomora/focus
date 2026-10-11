import { spaceColor } from "../../utils/spaceColors";
import { prepareTaskSpaceMove } from "../../utils/taskSpaces";
import { Link } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import type { Task } from "../../types/task";

export function TaskSpacePicker({ task }: { task: Task }) {
  const { settings, updateSettings, updateTask } = useApp();
  const space = settings.spaces?.find(item => item.id === task.spaceId);
  if (task.projectRole === "child") return <section className="my-3 rounded-lg border border-gray-200 p-3">
    <label className="block text-xs font-semibold text-gray-500">Mostrar también en
      <select aria-label="Mostrar tarea fuera del proyecto" value={task.showOutsideProject ? task.spaceId ?? "general" : "project"} className="mt-2 w-full rounded-lg border bg-white p-2 text-sm" onChange={event => {
        const destination = event.target.value;
        if (destination === "project") { updateTask(task.id, { showOutsideProject: false }); return; }
        const result = prepareTaskSpaceMove(settings, task, destination === "general" ? undefined : destination);
        if (result.settingsPatch) updateSettings(result.settingsPatch);
        updateTask(task.id, { ...result.patch, showOutsideProject: true });
      }}>
        <option value="project">Sólo en este proyecto</option><option value="general">General</option>
        {settings.spaces?.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
      </select>
    </label><p className="mt-2 text-xs text-gray-500">Sigue viviendo en el proyecto. Sus fechas se muestran en Hoy, Mañana y Agenda.</p>
  </section>;
  return <section className="my-3 rounded-lg border border-gray-200 p-3" style={{ borderLeftColor: spaceColor(space?.color), borderLeftWidth: space ? 4 : 1 }}>
    <label className="block text-xs font-semibold text-gray-500">Mover a espacio
      <select aria-label="Mover tarea a espacio" className="mt-2 w-full rounded-lg border border-gray-200 bg-white p-2 text-sm" value={task.spaceId ?? ""} onChange={event => { if (task.projectRole === "main") { updateTask(task.id, { spaceId: event.target.value || undefined }); return; } const result = prepareTaskSpaceMove(settings, task, event.target.value || undefined); if (result.settingsPatch) updateSettings(result.settingsPatch); updateTask(task.id, result.patch); }}>
        <option value="">General</option>
        {settings.spaces?.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
        {task.spaceId && !space && <option value={task.spaceId}>Espacio anterior</option>}
      </select>
    </label>
    {space ? <Link to={`/spaces/${space.id}`} className="mt-2 block text-xs font-semibold" style={{ color: spaceColor(space.color) }}>Abrir {space.name} →</Link> : <Link to="/spaces" className="mt-2 block text-xs text-gray-500">Crear o administrar espacios</Link>}
  </section>;
}
