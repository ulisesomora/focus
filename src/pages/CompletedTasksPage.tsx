import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, RotateCcw, Trash2 } from "lucide-react";
import { MobileLayout } from "../components/layout/MobileLayout";
import { TaskBadges } from "../components/tasks/TaskMetadataPanel";
import { useApp } from "../context/AppContext";
import { taskInSpace } from "../utils/taskSpaces";

export function CompletedTasksPage() {
  const { tasks, settings, moveTask, deleteTask } = useApp();
  const [scope, setScope] = useState("all");
  const [message, setMessage] = useState("");
  const completed = tasks.filter(task => task.status === "completed");
  const visible = completed.filter(task => scope === "all" || taskInSpace(task, scope === "general" ? undefined : scope))
    .sort((a, b) => new Date(b.completedAt ?? 0).getTime() - new Date(a.completedAt ?? 0).getTime());
  function removeAll() {
    if (!visible.length || !window.confirm(`¿Eliminar definitivamente las ${visible.length} tareas terminadas ${scope === "all" ? "de General y todos los espacios" : "que se muestran"}? Revisa antes si necesitas regresar alguna a pendientes. Esta acción no se puede deshacer.`)) return;
    visible.forEach(task => deleteTask(task.id));
    setMessage(`${visible.length} tareas terminadas eliminadas.`);
  }
  return <MobileLayout wideDesktop><div className="mx-auto max-w-3xl">
    <header className="mb-5"><h1 className="text-2xl font-bold text-gray-900">Tareas terminadas</h1><p className="mt-2 text-sm text-gray-500">Revisa las tareas de General y tus espacios antes de eliminarlas. Puedes regresarlas a pendientes.</p></header>
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <label className="min-w-0 flex-1 text-xs font-semibold text-gray-500">Lugar<select aria-label="Filtrar tareas terminadas" value={scope} onChange={event => { setScope(event.target.value); setMessage(""); }} className="mt-2 w-full rounded-lg border border-gray-200 bg-white p-2 text-sm"><option value="all">General y todos los espacios</option><option value="general">General</option>{settings.spaces?.map(space => <option key={space.id} value={space.id}>{space.name}</option>)}</select></label>
      <button type="button" disabled={!visible.length} onClick={removeAll} className="flex items-center gap-1 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 disabled:opacity-40"><Trash2 size={14} />{scope === "all" ? "Eliminar todas" : "Eliminar todas las mostradas"} ({visible.length})</button>
    </div>
    <p className="mb-3 text-xs text-gray-500">{visible.length} de {completed.length} tareas terminadas</p>
    <p role="status" className="mb-3 text-xs text-gray-500">{message}</p>
    <div className="space-y-2">{visible.map(task => <article key={task.id} className="rounded-xl border border-gray-200 bg-white p-3">
      <div className="flex items-start gap-2"><Check size={16} className="mt-1 shrink-0 text-green-600" /><div className="min-w-0 flex-1"><Link to={`/tasks/${task.id}`} className="block break-words text-sm font-semibold text-gray-800">{task.title}</Link><TaskBadges task={task} includeArea />{!task.spaceId && <span className="text-[10px] text-gray-400">General</span>}</div></div>
      <details className="ml-6 mt-2"><summary className="cursor-pointer text-xs font-medium text-gray-500">Revisar detalles</summary><div className="mt-2 space-y-2 text-sm text-gray-600">{task.description && <p className="whitespace-pre-wrap break-words">{task.description}</p>}{task.project && <p className="text-xs">Proyecto: {task.project}</p>}{!!task.subtasks?.length && <ul className="space-y-1">{task.subtasks.map(item => <li key={item.id} className="break-words text-xs">{item.completed ? "✓" : "○"} {item.title}</li>)}</ul>}{task.comments?.map(item => <p key={item.id} className="whitespace-pre-wrap break-words text-xs">{item.text}</p>)}<Link to={`/tasks/${task.id}`} className="block text-xs font-semibold text-indigo-600">Ver todos los detalles →</Link></div></details>
      <div className="ml-6 mt-3 flex flex-wrap gap-2"><button type="button" onClick={() => { moveTask(task.id, "pending"); setMessage(`“${task.title}” regresó a pendientes en su lugar original.`); }} className="flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-700"><RotateCcw size={13} />Regresar a pendientes</button><button type="button" onClick={() => { if (window.confirm(`¿Eliminar definitivamente “${task.title}”? Esta acción no se puede deshacer.`)) { deleteTask(task.id); setMessage("Tarea eliminada."); } }} className="flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold text-red-600"><Trash2 size={13} />Eliminar</button></div>
    </article>)}</div>
    {!visible.length && <p className="rounded-xl bg-white p-6 text-center text-sm text-gray-500">No hay tareas terminadas en esta selección.</p>}
  </div></MobileLayout>;
}
