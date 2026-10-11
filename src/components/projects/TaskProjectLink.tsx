import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Columns3 } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { BottomSheet } from "../ui/BottomSheet";
import { projectChildren } from "../../utils/projectStructure";
import type { Task } from "../../types/task";
export function TaskProjectIcon({ task }: { task: Task }) {
  if (task.projectRole !== "main" || !task.projectId) return null;
  return <Link to={`/projects/${task.projectId}`} aria-label={`Abrir proyecto: ${task.title}`} title="Abrir proyecto" className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded text-indigo-600 hover:bg-indigo-50"><Columns3 size={18} /></Link>;
}
export function TaskProjectLink({ task }: { task: Task }) {
  const { projects, tasks, convertTaskToProject } = useApp(); const navigate = useNavigate();
  const [open, setOpen] = useState(false); const [split, setSplit] = useState(true);
  const project = projects.find(item => item.id === task.projectId);
  if (project) { const children = projectChildren(tasks, project); return <section className="my-3 rounded-lg border border-indigo-100 bg-indigo-50/40 p-3"><Link to={`/projects/${project.id}`} className="flex items-center gap-2 text-sm font-semibold text-indigo-700"><Columns3 size={18} />Abrir proyecto: {project.name}</Link><p className="mt-2 text-xs text-gray-500">{children.filter(item => item.status === "completed").length} de {children.length} tareas terminadas</p></section>; }
  if (task.projectRole === "child") return null;
  return <><button type="button" onClick={() => setOpen(true)} className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-3 text-sm font-semibold text-indigo-700 hover:bg-indigo-100"><Columns3 size={15} />Convertir en proyecto</button><BottomSheet open={open} onClose={() => setOpen(false)} ariaLabel="Convertir tarea en proyecto"><h2 className="text-xl font-bold">Convertir en proyecto</h2><p className="mt-2 text-sm text-gray-500">“{task.title}” será la tarea principal. Conserva su lugar, área, etiquetas, comentarios y fechas.</p>{!!task.subtasks?.length && <label className="mt-4 flex items-center gap-2 text-sm"><input type="checkbox" checked={split} onChange={event => setSplit(event.target.checked)} />Convertir sus {task.subtasks.length} subtareas en tareas del proyecto</label>}<div className="mt-5 flex gap-3"><button type="button" onClick={() => { const id = convertTaskToProject(task.id, split); if (id) { setOpen(false); navigate(`/projects/${id}`); } }} className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white">Convertir y abrir</button><button type="button" onClick={() => setOpen(false)} className="text-sm text-gray-500">Cancelar</button></div></BottomSheet></>;
}
