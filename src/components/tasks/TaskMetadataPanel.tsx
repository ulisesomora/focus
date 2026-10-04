import { DurationBadge } from "./TaskDuration";
import { TaskDayBadges } from "./TaskDayToggle";
import { useApp } from "../../context/AppContext";
import { defaultAreas } from "../../types/settings";
import type { Task } from "../../types/task";
import { getTaskClassification } from "../../utils/taskClassification";

export function TaskBadges({ task, includeArea = false }: { task: Task; includeArea?: boolean }) {
  const { settings } = useApp();
  const areas = settings.areas?.length ? settings.areas : defaultAreas;
  const area = areas.find(item => item.id === task.area)?.name ?? "Sin área";
  return <span className="mt-1 flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 text-[11px] leading-4">
    <TaskDayBadges task={task} /><DurationBadge minutes={task.estimatedMinutes} />
    {task.status === "completed" && <span className="text-gray-500">{task.completedAt ? `Completada: ${new Date(task.completedAt).toLocaleDateString("es-MX")}` : "Completada · Sin fecha registrada"}</span>}
    {includeArea && <span className="max-w-full truncate text-gray-500">{area}</span>}
    <span className="rounded bg-gray-100 px-1.5 text-gray-600">{getTaskClassification(task)}</span>
    {!!task.subtasks?.length && <span className="text-gray-400">{task.subtasks.filter(item => item.completed).length}/{task.subtasks.length}</span>}
    {task.project && getTaskClassification(task) !== "Proyecto" && <span className="text-gray-500">Proyecto: {task.project}</span>}
    {task.labels?.map(label => <span key={label} className="max-w-full truncate rounded bg-indigo-50 px-1.5 text-indigo-600">#{label}</span>)}
  </span>;
}

export function TaskMetadataPanel({ task }: { task: Task }) {
  return <div className="mt-3 space-y-4">
    <TaskBadges task={task} includeArea />
    {task.project && <p className="text-xs text-gray-500">Proyecto: {task.project}</p>}
    {task.description && <section className="border-t border-gray-100 pt-3"><h3 className="text-xs font-semibold text-gray-400">Nota / explicación</h3><p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-gray-700">{task.description}</p></section>}
    {!!task.comments?.length && <section className="border-t border-gray-100 pt-3">
      <h3 className="text-xs font-semibold text-gray-400">Comentarios</h3>
      <div className="mt-2 max-h-64 space-y-3 overflow-y-auto">{task.comments.map(item => <article key={item.id}>
        <p className="whitespace-pre-wrap break-words text-sm text-gray-700">{item.text}</p>
        <time dateTime={item.createdAt} className="mt-1 block text-[10px] text-gray-400">{new Date(item.createdAt).toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" })}</time>
      </article>)}</div>
    </section>}
  </div>;
}
