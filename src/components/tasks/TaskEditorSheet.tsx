import { useEffect, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";

import { BottomSheet } from "../ui/BottomSheet";
import type { Task, TaskPriority, TaskSubtask } from "../../types/task";

export type TaskEditorValue = {
  title: string;
  project?: string;
  priority?: TaskPriority;
  description?: string;
  subtasks?: TaskSubtask[];
  plannedDate?: string;
  plannedTime?: string;
  deadline?: string;
};

type TaskEditorSheetProps = {
  open: boolean;
  task?: Task;
  initialTitle?: string;
  onClose: () => void;
  onSave: (value: TaskEditorValue) => void;
};

export function TaskEditorSheet({
  open,
  task,
  initialTitle = "",
  onClose,
  onSave,
}: TaskEditorSheetProps) {
  const [title, setTitle] = useState("");
  const [project, setProject] = useState("");
  const [priority, setPriority] = useState<TaskPriority | "">("");
  const [plannedDate, setPlannedDate] = useState("");
  const [plannedTime, setPlannedTime] = useState("");
  const [deadline, setDeadline] = useState("");
  const [description, setDescription] = useState("");
  const [subtasks, setSubtasks] = useState<TaskSubtask[]>([]);
  const [subtaskTitle, setSubtaskTitle] = useState("");

  useEffect(() => {
    if (!open) return;
    setTitle(task?.title ?? initialTitle);
    setProject(task?.project ?? "");
    setPriority(task?.priority ?? "");
    setPlannedDate(task?.plannedDate ?? "");
    setPlannedTime(task?.plannedTime ?? "");
    setDeadline(task?.deadline ?? "");
    setDescription(task?.description ?? "");
    setSubtasks(task?.subtasks ?? []);
    setSubtaskTitle("");
  }, [open, task, initialTitle]);

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
      title: cleanTitle,
      project: project.trim() || undefined,
      priority: priority || undefined,
      description: description.trim() || undefined,
      subtasks: subtasks.length ? subtasks : undefined,
      plannedDate: plannedDate || undefined,
      plannedTime: plannedDate && plannedTime ? plannedTime : undefined,
      deadline: deadline || undefined,
    });
    onClose();
  }

  return (
    <BottomSheet
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
          aria-label="Cerrar"
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

      <div className="mt-5 grid grid-cols-2 gap-3">
        <label className="block text-sm font-semibold text-gray-700">
          Proyecto
          <input
            value={project}
            onChange={(event) => setProject(event.target.value)}
            placeholder="Opcional"
            className="mt-2 h-12 w-full rounded-2xl border border-gray-200 px-3 text-sm font-normal outline-none focus:border-gray-400"
          />
        </label>

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

      <div className="mt-5 rounded-2xl bg-gray-50 p-4">
        <p className="text-sm font-semibold text-gray-800">Planificación</p>
        <p className="mt-1 text-xs leading-5 text-gray-500">
          Cuándo quieres trabajarla. Es independiente de la fecha límite.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <input
            type="date"
            value={plannedDate}
            onChange={(event) => setPlannedDate(event.target.value)}
            className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none"
          />
          <input
            type="time"
            value={plannedTime}
            disabled={!plannedDate}
            onChange={(event) => setPlannedTime(event.target.value)}
            className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none disabled:bg-gray-100 disabled:text-gray-400"
          />
        </div>
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
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-gray-700"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={!title.trim()}
        className="mt-7 h-12 w-full rounded-2xl bg-gray-900 px-5 text-sm font-semibold text-white disabled:bg-gray-200 disabled:text-gray-400 sm:ml-auto sm:block sm:w-auto sm:min-w-40"
      >
        {task ? "Guardar cambios" : "Crear tarea"}
      </button>
    </BottomSheet>
  );
}
