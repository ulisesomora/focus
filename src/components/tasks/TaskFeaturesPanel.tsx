import { TaskSpacePicker } from "./TaskSpacePicker";
import { Children, useState } from "react";
import type { ReactElement, ReactNode } from "react";
import { Check, Plus, Trash2 } from "lucide-react";
import { useApp } from "../../context/AppContext";
import type { Task } from "../../types/task";

const button = "inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 hover:border-indigo-300 hover:text-indigo-700 disabled:opacity-40";
const input = "w-full rounded-lg border border-gray-200 p-2 text-sm outline-none focus:border-indigo-400";

function Feature({ title, active, children }: { title: string; active: boolean; children: ReactNode }) {
  return <section className={active ? (title === "Subtareas" ? "mt-3 rounded-xl border-2 border-indigo-200 bg-indigo-50/40 p-3" : "mt-3 rounded-lg border border-gray-100 p-3") : "mt-2"}>{active && <h3 className="mb-2 text-xs font-semibold text-gray-500">{title}</h3>}{children}</section>;
}

export function TaskFeaturesPanel({ task, onPlan }: { task: Task; onPlan: () => void }) {
  const { updateTask, projects } = useApp();
  const [editing, setEditing] = useState<string[]>([]);
  const [description, setDescription] = useState(task.description ?? "");
  const [project, setProject] = useState(task.project ?? "");
  const [comment, setComment] = useState("");
  const [subtask, setSubtask] = useState("");
  const open = (name: string) => setEditing(current => [...current, name]);
  const close = (name: string) => setEditing(current => current.filter(item => item !== name));
  const has = (name: string) => editing.includes(name);
  const actions = (name: string) => <button type="button" className="text-xs text-gray-500" onClick={() => close(name)}>Cancelar</button>;

  const features = <>
    <Feature title="Descripción" active={!!task.description || has("description")}>
      {has("description") ? <form onSubmit={event => { event.preventDefault(); updateTask(task.id, { description: description.trim() || undefined }); close("description"); }}>
        <textarea autoFocus aria-label="Descripción de la tarea" rows={3} className={input} value={description} onChange={event => setDescription(event.target.value)} />
        <div className="mt-2 flex gap-3"><button className={button}>Guardar descripción</button>{actions("description")}</div>
      </form> : <>{task.description && <p className="mb-2 whitespace-pre-wrap break-words text-sm text-gray-700">{task.description}</p>}<button type="button" className={button} onClick={() => { setDescription(task.description ?? ""); open("description"); }}>{task.description ? "Editar descripción" : "+ Agregar descripción"}</button></>}
    </Feature>
    <Feature title="Proyecto" active={!!task.project || has("project")}>
      {has("project") ? <form onSubmit={event => { event.preventDefault(); updateTask(task.id, { project: project.trim() || undefined }); close("project"); }}>
        <input autoFocus aria-label="Proyecto de la tarea" list={`projects-${task.id}`} className={input} value={project} onChange={event => setProject(event.target.value)} />
        <datalist id={`projects-${task.id}`}>{projects.map(item => <option key={item.id} value={item.name} />)}</datalist>
        <div className="mt-2 flex gap-3"><button className={button}>Guardar proyecto</button>{actions("project")}</div>
      </form> : <>{task.project && <p className="mb-2 text-sm text-gray-700">{task.project}</p>}<button type="button" className={button} onClick={() => { setProject(task.project ?? ""); open("project"); }}>{task.project ? "Cambiar proyecto" : "+ Agregar proyecto"}</button>{task.project && <button type="button" className="ml-3 text-xs text-gray-500" onClick={() => updateTask(task.id, { project: undefined })}>Quitar proyecto</button>}</>}
    </Feature>
    <Feature title="Subtareas" active={!!task.subtasks?.length || has("subtask")}>
      {task.subtasks?.map(item => <div key={item.id} className="flex items-center gap-2 py-1">
        <button type="button" aria-pressed={item.completed} aria-label={`Completar subtarea: ${item.title}`} onClick={() => updateTask(task.id, { subtasks: task.subtasks?.map(value => value.id === item.id ? { ...value, completed: !value.completed } : value) })} className="flex min-w-0 flex-1 items-center gap-2 text-left text-sm">
          <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${item.completed ? "bg-gray-400 text-white" : "text-transparent"}`}><Check size={11} /></span><span className={`break-words ${item.completed ? "text-gray-400 line-through" : "text-gray-700"}`}>{item.title}</span>
        </button><button type="button" aria-label={`Eliminar subtarea: ${item.title}`} className="text-gray-400" onClick={() => updateTask(task.id, { subtasks: task.subtasks?.filter(value => value.id !== item.id) })}><Trash2 size={13} /></button>
      </div>)}
      {has("subtask") ? <form className="mt-2" onSubmit={event => { event.preventDefault(); if (!subtask.trim()) return; updateTask(task.id, { subtasks: [...(task.subtasks ?? []), { id: crypto.randomUUID(), title: subtask.trim(), completed: false }] }); setSubtask(""); }}>
        <input autoFocus aria-label="Nueva subtarea" className={input} value={subtask} onChange={event => setSubtask(event.target.value)} /><div className="mt-2 flex gap-3"><button disabled={!subtask.trim()} className={button}>Agregar subtarea</button>{actions("subtask")}</div>
      </form> : <button type="button" className={button} onClick={() => open("subtask")}><Plus size={13} className="inline" /> Agregar subtarea</button>}
    </Feature>
    <Feature title="Agenda / Horario" active={!!task.plannedDate}>{task.plannedDate && <p className="mb-2 text-xs text-gray-500">{`${task.plannedDate} ${task.plannedTime ?? ""}`}</p>}<button type="button" className={button} onClick={onPlan}>{task.plannedDate ? "Editar horario" : "+ Agregar horario"}</button>{task.plannedDate && <button type="button" className="ml-3 text-xs text-gray-500" onClick={() => updateTask(task.id, { plannedDate: undefined, plannedTime: undefined })}>Quitar horario</button>}</Feature>
    <Feature title="Prioridad" active={!!task.priority || has("priority")}>{task.priority || has("priority") ? <select aria-label="Prioridad de la tarea" className={input} value={task.priority ?? ""} onChange={event => updateTask(task.id, { priority: (event.target.value || undefined) as Task["priority"] })}><option value="">Sin prioridad</option><option value="low">Baja</option><option value="medium">Media</option><option value="high">Alta</option></select> : <button type="button" className={button} onClick={() => open("priority")}>+ Agregar prioridad</button>}</Feature>
    <Feature title="Fecha límite" active={!!task.deadline || has("deadline")}>{task.deadline || has("deadline") ? <input aria-label="Fecha límite de la tarea" type="date" className={input} value={task.deadline ?? ""} onChange={event => updateTask(task.id, { deadline: event.target.value || undefined })} /> : <button type="button" className={button} onClick={() => open("deadline")}>+ Agregar fecha límite</button>}</Feature>
    <Feature title="Comentarios" active={!!task.comments?.length || has("comment")}>
      <div className="space-y-3">{task.comments?.map(item => <article key={item.id}><div className="flex items-start gap-2"><p className="min-w-0 flex-1 whitespace-pre-wrap break-words text-sm text-gray-700">{item.text}</p><button type="button" aria-label="Eliminar comentario" className="text-gray-400" onClick={() => updateTask(task.id, { comments: task.comments?.filter(value => value.id !== item.id) })}><Trash2 size={13} /></button></div><time className="text-[10px] text-gray-400" dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleString("es-MX")}</time></article>)}</div>
      {has("comment") ? <form className="mt-2" onSubmit={event => { event.preventDefault(); if (!comment.trim()) return; updateTask(task.id, { comments: [...(task.comments ?? []), { id: crypto.randomUUID(), text: comment.trim(), createdAt: new Date().toISOString() }] }); setComment(""); close("comment"); }}><textarea autoFocus aria-label="Nuevo comentario" rows={2} className={input} value={comment} onChange={event => setComment(event.target.value)} /><div className="mt-2 flex gap-3"><button disabled={!comment.trim()} className={button}>Guardar comentario</button>{actions("comment")}</div></form> : <button type="button" className={`mt-2 ${button}`} onClick={() => open("comment")}>+ Agregar comentario</button>}
    </Feature>
  </>;
  const items = Children.toArray(features.props.children).filter(item => !task.projectId || (item as ReactElement<{ title: string }>).props.title !== "Proyecto") as ReactElement<{ title: string; active: boolean }>[];
  const existing = items.filter(item => item.props.active);
  const available = items.filter(item => !item.props.active);
  return <div className="mt-3">
    {existing}
    <TaskSpacePicker task={task} />
    {!!available.length && <div className="mt-4 border-t border-gray-100 pt-3"><p className="mb-1 text-xs font-semibold text-gray-400">Agregar a la tarea</p><div className="flex flex-wrap gap-x-2">{available}</div></div>}
  </div>;
}
