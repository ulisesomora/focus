import { areasForSpace } from "../../utils/taskSpaces";
import { DurationPicker } from "./TaskDuration";
import { DayButtons } from "./TaskDayToggle";
import { LabelPicker } from "../labels/LabelPicker";
import { useEffect, useState, type ReactNode } from "react";
import { Plus, Trash2, X } from "lucide-react";

import { BottomSheet } from "../ui/BottomSheet";
import { useApp } from "../../context/AppContext";
import type { Task, TaskArea, TaskPriority, TaskSubtask } from "../../types/task";

export type TaskEditorValue = {
  comments?: Task["comments"];
  title: string;
  project?: string;
  area?: TaskArea;
  priority?: TaskPriority;
  description?: string;
  labels?: string[];
  subtasks?: TaskSubtask[];
  workDates?: string[];
  plannedDate?: string;
  plannedTime?: string;
  estimatedMinutes?: number;
  deadline?: string;
};

type TaskEditorSheetProps = {
  spaceId?: string;
  inline?: boolean;
  hideLabels?: boolean;
  hideProject?: boolean;
  hideArea?: boolean;
  open: boolean;
  task?: Task;
  initialLabels?: string[];
  initialTitle?: string;
  initialArea?: TaskArea;
  initialWorkDates?: string[];
  onClose: () => void;
  onSave: (value: TaskEditorValue) => void;
};

const emptyLabels: string[] = [];

export function TaskEditorSheet({
  open,
  spaceId,
  inline = false,
  hideLabels = false,
  hideProject = false,
  hideArea = false,
  task,
  initialLabels = emptyLabels,
  initialTitle = "",
  initialArea,
  initialWorkDates,
  onClose,
  onSave,
}: TaskEditorSheetProps) {
  const { settings } = useApp();
  const areas = areasForSpace(settings, task?.spaceId ?? spaceId);
  const [title, setTitle] = useState("");
  const [project, setProject] = useState("");
  const [area, setArea] = useState<TaskArea>("");
  const [priority, setPriority] = useState<TaskPriority | "">("");
  const [workDates, setWorkDates] = useState<string[] | undefined>();
  const [plannedDate, setPlannedDate] = useState("");
  const [plannedTime, setPlannedTime] = useState("");
  const [estimatedMinutes, setEstimatedMinutes] = useState("");
  const [deadline, setDeadline] = useState("");
  const [description, setDescription] = useState("");
  const [comments, setComments] = useState<NonNullable<Task["comments"]>>([]);
  const [commentText, setCommentText] = useState("");
  const [labels, setLabels] = useState<string[]>([]);
  const [subtasks, setSubtasks] = useState<TaskSubtask[]>([]);
  const [subtaskTitle, setSubtaskTitle] = useState("");

  useEffect(() => {
    if (!open) return;
    setTitle(task?.title ?? initialTitle);
    setProject(task?.project ?? "");
    const selectedArea = task?.area ?? initialArea;
    setArea(areas.some(area => area.id === selectedArea) ? selectedArea! : "");
    setPriority(task?.priority ?? "");
    setWorkDates(task?.workDates ?? initialWorkDates);
    setPlannedDate(task?.plannedDate ?? "");
    setPlannedTime(task?.plannedTime ?? "");
    setEstimatedMinutes(task?.estimatedMinutes ? String(task.estimatedMinutes) : "");
    setDeadline(task?.deadline ?? "");
    setDescription(task?.description ?? "");
    setComments(task?.comments ?? []);
    setCommentText("");
    setLabels(task?.labels ?? initialLabels);
    setSubtasks(task?.subtasks ?? []);
    setSubtaskTitle("");
  }, [open, task?.id, initialTitle, initialArea, initialLabels]);

  function addSubtask() {
    const clean = subtaskTitle.trim();
    if (!clean) return;
    setSubtasks((current) => [
      ...current,
      { id: crypto.randomUUID(), title: clean, completed: false },
    ]);
    setSubtaskTitle("");
  }

  function handleSave() {
    const cleanTitle = title.trim();
    if (!cleanTitle) return;

    onSave({
      comments: commentText.trim() ? [...comments, { id: crypto.randomUUID(), text: commentText.trim(), createdAt: new Date().toISOString() }] : comments,
      title: cleanTitle,
      project: task?.projectId ? task.project : project.trim() || undefined,
      ...(hideArea ? {} : { area: area || undefined }),
      priority: priority || undefined,
      description: description.trim() || undefined,
      ...(hideLabels ? {} : { labels }),
      subtasks: subtasks.length ? subtasks : undefined,
      workDates,
      plannedDate: plannedDate || undefined,
      plannedTime: plannedDate && plannedTime ? plannedTime : undefined,
      estimatedMinutes: estimatedMinutes && Number.isFinite(Number(estimatedMinutes))
        ? Math.min(1440, Math.max(1, Math.round(Number(estimatedMinutes))))
        : undefined,
      deadline: deadline || undefined,
    });
    onClose();
  }

  const Container = inline ? InlineTaskEditor : BottomSheet;

  return (
    <Container
      open={open}
      onClose={onClose}
      ariaLabel={task ? "Editar tarea" : "Crear tarea"}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
            {task ? "Editar tarea" : "Nueva tarea"}
          </p>
          <h2 className="mt-1 text-xl font-bold text-gray-900">
            {task ? "Organiza los detalles" : "¿Qué necesitas hacer?"}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500"
          aria-label={inline ? "Cancelar edición" : "Cerrar"}
        >
          <X size={18} />
        </button>
      </div>

      <label className="mt-6 block text-sm font-semibold text-gray-700">Nombre *</label>
      <input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Ej. Preparar presentación"
        className="mt-2 h-12 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none focus:border-gray-400 focus:bg-white"
      />

      {!hideArea && (
      <label className="mt-5 block text-sm font-semibold text-gray-700">
        Área
        <select value={area} onChange={(event) => setArea(event.target.value as TaskArea)} className="mt-2 h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm font-normal outline-none">
          <option value="">Sin área</option>
          {areas.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
      </label>
      )}

      <div className={`mt-5 grid gap-3 ${inline ? "grid-cols-1 2xl:grid-cols-2" : "grid-cols-2"}`}>
        {!hideProject && !task?.projectId && <label className="block text-sm font-semibold text-gray-700">
          Proyecto
          <input
            value={project}
            onChange={(event) => setProject(event.target.value)}
            placeholder="Opcional"
            className="mt-2 h-12 w-full rounded-2xl border border-gray-200 px-3 text-sm font-normal outline-none focus:border-gray-400"
          />
        </label>}

        <label className="block text-sm font-semibold text-gray-700">
          Prioridad
          <select
            value={priority}
            onChange={(event) => setPriority(event.target.value as TaskPriority | "")}
            className="mt-2 h-12 w-full rounded-2xl border border-gray-200 bg-white px-3 text-sm font-normal outline-none"
          >
            <option value="">Ninguna</option>
            <option value="low">Baja</option>
            <option value="medium">Media</option>
            <option value="high">Alta</option>
          </select>
        </label>
      </div>

      <div className="mt-5">
        <p className="text-sm font-semibold text-gray-700">Subtareas</p>
        {subtasks.length > 0 && (
          <div className="mt-2 space-y-2">
            {subtasks.map((subtask) => (
              <div key={subtask.id} className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2.5">
                <span className="min-w-0 flex-1 truncate text-sm text-gray-700">{subtask.title}</span>
                <button
                  type="button"
                  onClick={() => setSubtasks((current) => current.filter((item) => item.id !== subtask.id))}
                  className="text-gray-400"
                  aria-label="Eliminar subtarea"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-2 flex gap-2">
          <input
            value={subtaskTitle}
            onChange={(event) => setSubtaskTitle(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addSubtask();
              }
            }}
            placeholder="Agregar subtarea"
            className="h-11 min-w-0 flex-1 rounded-xl border border-gray-200 px-3 text-sm outline-none"
          />
          <button
            type="button"
            onClick={addSubtask}
            aria-label="Agregar subtarea"
            disabled={!subtaskTitle.trim()}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-gray-700"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      <div className="mt-4"><DayButtons dates={workDates ?? (plannedDate ? [plannedDate] : [])} onChange={setWorkDates} /></div>
      {!hideLabels && <div className="mt-5"><LabelPicker value={labels} onChange={setLabels} /></div>}

      <div className="mt-5 rounded-2xl bg-gray-50 p-4">
        <p className="text-sm font-semibold text-gray-800">Planificación</p>
        <p className="mt-1 text-xs leading-5 text-gray-500">
          Cuándo quieres trabajarla. Es independiente de la fecha límite.
        </p>
        <div className={`mt-3 grid gap-3 ${inline ? "grid-cols-1 2xl:grid-cols-2" : "grid-cols-2"}`}>
          <input
            type="date"
            value={plannedDate}
            onChange={(event) => setPlannedDate(event.target.value)}
            className="h-11 min-w-0 rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none"
          />
          <input
            type="time"
            value={plannedTime}
            disabled={!plannedDate}
            onChange={(event) => setPlannedTime(event.target.value)}
            className="h-11 min-w-0 rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none disabled:bg-gray-100 disabled:text-gray-400"
          />
        </div>
        <div className="mt-3"><DurationPicker value={estimatedMinutes ? Number(estimatedMinutes) : undefined} onChange={minutes => setEstimatedMinutes(minutes ? String(minutes) : "")} /></div>
      </div>

      <label className="mt-5 block text-sm font-semibold text-gray-700">
        Fecha límite
        <input
          type="date"
          value={deadline}
          onChange={(event) => setDeadline(event.target.value)}
          className="mt-2 h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm font-normal outline-none"
        />
      </label>

      <label className="mt-5 block text-sm font-semibold text-gray-700">
        Descripción
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Notas, contexto o información que necesites..."
          className="mt-2 min-h-24 w-full resize-none rounded-2xl border border-gray-200 p-4 text-sm font-normal outline-none focus:border-gray-400"
        />
      </label>

      <section className="mt-5">
        <h3 className="text-sm font-semibold text-gray-700">Comentarios</h3>
        <div className="mt-2 space-y-2">{comments.map(item => <div key={item.id} className="rounded-xl bg-gray-50 p-3">
          <p className="whitespace-pre-wrap break-words text-sm text-gray-700">{item.text}</p>
          <div className="mt-1 flex justify-between gap-2"><time className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleString("es-MX")}</time><button type="button" onClick={() => setComments(current => current.filter(value => value.id !== item.id))} className="text-xs text-red-600">Eliminar</button></div>
        </div>)}</div>
        <label className="mt-3 block text-sm text-gray-600">Nuevo comentario<textarea value={commentText} onChange={event => setCommentText(event.target.value)} placeholder="Escribe un avance o una explicación" className="mt-2 w-full rounded-xl border border-gray-200 p-3 text-sm" /></label>
        <button type="button" disabled={!commentText.trim()} onClick={() => { setComments(current => [...current, { id: crypto.randomUUID(), text: commentText.trim(), createdAt: new Date().toISOString() }]); setCommentText(""); }} className="mt-2 rounded-lg bg-gray-100 px-3 py-2 text-xs font-semibold disabled:opacity-40">Agregar comentario</button>
        <p className="mt-2 text-xs text-gray-400">Los comentarios se guardan al guardar los cambios de la tarea.</p>
      </section>

      <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
      {inline && <button type="button" onClick={onClose} className="h-10 rounded-xl border border-gray-200 px-4 text-sm font-semibold text-gray-600">Cancelar</button>}
      <button
        type="button"
        onClick={handleSave}
        disabled={!title.trim()}
        className="h-12 w-full rounded-2xl bg-gray-900 px-5 text-sm font-semibold text-white disabled:bg-gray-200 disabled:text-gray-400 sm:ml-auto sm:block sm:w-auto sm:min-w-40"
      >
        {task ? "Guardar cambios" : "Crear tarea"}
      </button>
      </div>
    </Container>
  );
}

function InlineTaskEditor({ open, children, ariaLabel }: { open: boolean; children: ReactNode; ariaLabel?: string; onClose: () => void }) {
  return open ? <div aria-label={ariaLabel} className="mt-4 min-w-0 border-t border-gray-100 pt-4">{children}</div> : null;
}
