import { LabelFilter, matchesLabel } from "../components/labels/LabelPicker";
import { useMemo, useState } from "react";
import { Check, Plus, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { MobileLayout } from "../components/layout/MobileLayout";
import { TaskEditorSheet, type TaskEditorValue } from "../components/tasks/TaskEditorSheet";
import { useApp } from "../context/AppContext";
import type { Task } from "../types/task";

export function TasksPage() {
  const { tasks, createTask, moveTask, settings } = useApp();
  const [query, setQuery] = useState("");
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const assigned = useMemo(() => tasks.filter((task) => task.status !== "backlog" && task.status !== "cancelled"), [tasks]);

  const visible = useMemo(() => assigned.filter((task) => {
    if (task.status === "completed" && (!showCompleted || !settings.showCompletedTasks)) return false;
    if (!matchesLabel(task.labels, selectedLabel ?? "")) return false;
    const needle = query.trim().toLocaleLowerCase("es");
    return !needle || [task.title, task.project, ...(task.labels ?? [])].some((value) => value?.toLocaleLowerCase("es").includes(needle));
  }).sort((a, b) => {
    if (a.status === "completed" && b.status !== "completed") return 1;
    if (b.status === "completed" && a.status !== "completed") return -1;
    if (a.plannedDate && b.plannedDate) return a.plannedDate.localeCompare(b.plannedDate) || (a.plannedTime ?? "").localeCompare(b.plannedTime ?? "");
    return a.plannedDate ? -1 : b.plannedDate ? 1 : 0;
  }), [assigned, query, selectedLabel, showCompleted, settings.showCompletedTasks]);

  function addTask(value: TaskEditorValue) {
    createTask({ ...value, status: "pending" });
  }

  return (
    <MobileLayout>
      <div className="mx-auto max-w-3xl">
        <header className="mb-5 flex items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tareas</h1>
            <p className="mt-1 text-sm text-gray-500">{assigned.filter((task) => task.status !== "completed").length} por hacer</p>
          </div>
          <button type="button" onClick={() => setEditorOpen(true)} className="flex h-10 items-center gap-1 rounded-xl bg-gray-900 px-3 text-sm font-semibold text-white">
            <Plus size={17} /> Nueva
          </button>
        </header>

        <label className="relative mb-4 block">
          <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar tareas o etiquetas" className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-3 text-sm outline-none focus:border-gray-400" />
        </label>

        <div className="mb-4"><LabelFilter value={selectedLabel ?? ""} onChange={value => setSelectedLabel(value || null)} /></div>

        {visible.length ? (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            {visible.map((task) => <TaskRow key={task.id} task={task} onToggle={() => moveTask(task.id, task.status === "completed" ? "pending" : "completed")} />)}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-5 py-12 text-center">
            <p className="font-semibold text-gray-800">{query || selectedLabel ? "No hay tareas con ese filtro" : "Todavía no hay tareas en tu lista"}</p>
            <p className="mt-1 text-sm text-gray-500">{query || selectedLabel ? "Prueba otra búsqueda o etiqueta." : "Crea una tarea o asigna una desde Inbox."}</p>
          </div>
        )}

        {settings.showCompletedTasks && assigned.some((task) => task.status === "completed") && (
          <button type="button" onClick={() => setShowCompleted((value) => !value)} className="mt-4 text-sm font-medium text-gray-500">
            {showCompleted ? "Ocultar finalizadas" : "Mostrar finalizadas"}
          </button>
        )}
      </div>
      <TaskEditorSheet open={editorOpen} onClose={() => setEditorOpen(false)} onSave={addTask} />
    </MobileLayout>
  );
}

function TaskRow({ task, onToggle }: { task: Task; onToggle: () => void }) {
  const completed = task.status === "completed";
  return (
    <div className="flex items-start gap-3 border-b border-gray-100 px-4 py-3.5 last:border-b-0">
      <button type="button" onClick={onToggle} aria-label={`${completed ? "Reabrir" : "Completar"} ${task.title}`} className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${completed ? "border-gray-400 bg-gray-400 text-white" : "border-gray-300 text-transparent hover:border-gray-600"}`}>
        <Check size={14} strokeWidth={3} />
      </button>
      <Link to={`/tasks/${task.id}`} className="min-w-0 flex-1">
        <span className={`block text-sm font-medium leading-5 ${completed ? "text-gray-400 line-through" : "text-gray-900"}`}>{task.title}</span>
        {(!!task.labels?.length || task.project || task.plannedDate || task.status === "paused" || task.status === "review") && (
          <span className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-gray-500">
            {task.labels?.map((label) => <span key={label} className="rounded bg-indigo-50 px-1.5 py-0.5 font-medium text-indigo-700">{label}</span>)}
            {task.project && <span>{task.project}</span>}
            {task.plannedDate && <span>{formatDate(task.plannedDate)}{task.plannedTime ? ` · ${task.plannedTime}` : ""}</span>}
            {task.status === "paused" && <span>En pausa</span>}
            {task.status === "review" && <span>En revisión</span>}
          </span>
        )}
        {!!task.subtasks?.length && <span className="mt-1 block text-[11px] text-gray-400">{task.subtasks.filter((item) => item.completed).length}/{task.subtasks.length} subtareas</span>}
      </Link>
    </div>
  );
}

function formatDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return value;
  return new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short" }).format(new Date(year, month - 1, day));
}
