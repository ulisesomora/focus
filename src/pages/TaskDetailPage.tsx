import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  CirclePause,
  ClipboardCheck,
  Play,
  RotateCcw,
  CalendarClock,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { MobileLayout } from "../components/layout/MobileLayout";
import { TaskPlannerSheet } from "../components/tasks/TaskPlannerSheet";
import { TaskEditorSheet } from "../components/tasks/TaskEditorSheet";
import { BottomSheet } from "../components/ui/BottomSheet";
import { useApp } from "../context/AppContext";
import type { TaskStatus } from "../types/task";

const statusLabels: Record<TaskStatus, string> = {
  backlog: "Backlog",
  pending: "Pendiente",
  in_progress: "En proceso",
  paused: "En pausa",
  review: "En revisión",
  completed: "Finalizado",
  cancelled: "Cancelado",
};

export function TaskDetailPage() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { tasks, startTask, pauseTask, moveTask, setActiveTask, updateTask } = useApp();
  const [pauseOpen, setPauseOpen] = useState(false);
  const [plannerOpen, setPlannerOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [pauseReason, setPauseReason] = useState("Esperando información");
  const [pauseNote, setPauseNote] = useState("");

  const task = useMemo(
    () => tasks.find((item) => item.id === taskId),
    [tasks, taskId],
  );

  if (!task) {
    return (
      <MobileLayout>
        <div className="py-16 text-center">
          <p className="font-semibold text-gray-900">Tarea no encontrada</p>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mt-4 text-sm font-semibold text-gray-600"
          >
            Volver
          </button>
        </div>
      </MobileLayout>
    );
  }

  const currentTaskId = task.id;

  function handlePause() {
    pauseTask(currentTaskId, pauseReason, pauseNote);
    setPauseOpen(false);
    setPauseNote("");
  }

  return (
    <MobileLayout>
      <header className="mb-6 flex items-center gap-3 lg:max-w-4xl">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-700 shadow-sm ring-1 ring-gray-200"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Tarea
          </p>
          <h1 className="truncate text-xl font-bold text-gray-900">{task.title}</h1>
        </div>
      </header>

      <section className="rounded-3xl border border-gray-200 bg-white p-5 lg:max-w-3xl lg:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
            {statusLabels[task.status]}
          </span>

          {task.isActive && (
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
              Activa ahora
            </span>
          )}
        </div>

        {task.project && (
          <p className="mt-4 text-sm text-gray-500">Proyecto: {task.project}</p>
        )}

        {task.plannedDate && (
          <div className="mt-4 rounded-2xl bg-gray-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Planificación
            </p>
            <p className="mt-1 text-sm font-semibold text-gray-800">
              {formatPlannedDate(task.plannedDate)}
              {task.plannedTime ? ` · ${task.plannedTime}` : ""}
            </p>
            {task.estimatedMinutes && (
              <p className="mt-1 text-xs text-gray-500">
                Duración estimada: {formatDuration(task.estimatedMinutes)}
              </p>
            )}
          </div>
        )}

        {task.description && (
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Descripción</p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">{task.description}</p>
          </div>
        )}

        {task.subtasks && task.subtasks.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Subtareas</p>
            <div className="mt-2 space-y-2">
              {task.subtasks.map((subtask) => (
                <button
                  key={subtask.id}
                  type="button"
                  onClick={() =>
                    updateTask(task.id, {
                      subtasks: task.subtasks?.map((item) =>
                        item.id === subtask.id ? { ...item, completed: !item.completed } : item,
                      ),
                    })
                  }
                  className="flex w-full items-center gap-3 rounded-xl bg-gray-50 px-3 py-2.5 text-left"
                >
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full border ${subtask.completed ? "border-green-600 bg-green-600 text-white" : "border-gray-300"}`}>
                    {subtask.completed ? "✓" : ""}
                  </span>
                  <span className={`text-sm ${subtask.completed ? "text-gray-400 line-through" : "text-gray-700"}`}>{subtask.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {task.deadline && (
          <div className="mt-4 rounded-2xl bg-red-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-red-500">Fecha límite</p>
            <p className="mt-1 text-sm font-semibold text-red-800">{formatPlannedDate(task.deadline)}</p>
          </div>
        )}

        {task.pauseReason && task.status === "paused" && (
          <div className="mt-5 rounded-2xl bg-orange-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-orange-600">
              Motivo de pausa
            </p>
            <p className="mt-1 font-medium text-orange-900">{task.pauseReason}</p>
            {task.pauseNote && (
              <p className="mt-2 text-sm leading-6 text-orange-800">{task.pauseNote}</p>
            )}
          </div>
        )}
      </section>

      <section className="mt-6 lg:max-w-3xl">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">Acciones</h2>
          <button
            type="button"
            onClick={() => setEditorOpen(true)}
            className="text-sm font-semibold text-gray-600"
          >
            Editar
          </button>
        </div>

        {task.status !== "completed" && task.status !== "cancelled" && (
          <button
            type="button"
            onClick={() => setPlannerOpen(true)}
            className="mb-3 flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 lg:w-auto"
          >
            <CalendarClock size={17} />
            {task.plannedDate ? "Reprogramar" : "Planificar"}
          </button>
        )}

        <div className="grid grid-cols-2 gap-3 lg:flex lg:flex-wrap">
          {(task.status === "backlog" || task.status === "pending") && (
            <button
              type="button"
              onClick={() => startTask(task.id)}
              className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-gray-900 px-5 text-sm font-semibold text-white"
            >
              <Play size={17} />
              Iniciar
            </button>
          )}

          {task.status === "in_progress" && (
            <>
              <button
                type="button"
                onClick={() => setPauseOpen(true)}
                className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-orange-50 px-5 text-sm font-semibold text-orange-700"
              >
                <CirclePause size={17} />
                Pausar
              </button>

              {!task.isActive && (
                <button
                  type="button"
                  onClick={() => setActiveTask(task.id)}
                  className="flex h-12 items-center justify-center rounded-2xl border border-gray-200 text-sm font-semibold text-gray-700"
                >
                  Hacer activa
                </button>
              )}

              <button
                type="button"
                onClick={() => moveTask(task.id, "review")}
                className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-700"
              >
                <ClipboardCheck size={17} />
                Revisión
              </button>

              <button
                type="button"
                onClick={() => moveTask(task.id, "completed")}
                className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-green-600 text-sm font-semibold text-white"
              >
                <Check size={17} />
                Finalizar
              </button>
            </>
          )}

          {task.status === "paused" && (
            <button
              type="button"
              onClick={() => startTask(task.id)}
              className="col-span-2 flex h-12 items-center justify-center gap-2 rounded-2xl bg-gray-900 text-sm font-semibold text-white"
            >
              <RotateCcw size={17} />
              Reanudar
            </button>
          )}

          {task.status === "review" && (
            <>
              <button
                type="button"
                onClick={() => startTask(task.id)}
                className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-700"
              >
                <RotateCcw size={17} />
                Regresar
              </button>

              <button
                type="button"
                onClick={() => moveTask(task.id, "completed")}
                className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-green-600 text-sm font-semibold text-white"
              >
                <Check size={17} />
                Aprobar
              </button>
            </>
          )}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-4">
        <h2 className="font-semibold text-gray-900">Flujo</h2>
        <p className="mt-2 text-sm leading-6 text-gray-500">
          Pendiente → En proceso → Pausa o Revisión → Finalizado.
        </p>
      </section>

      <Link
        to="/backlog"
        className="mt-6 block text-center text-sm font-semibold text-gray-500"
      >
        Volver al Backlog
      </Link>

      <BottomSheet open={pauseOpen} onClose={() => setPauseOpen(false)} ariaLabel="Pausar tarea">
        <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-gray-200" />
        <h2 className="text-xl font-bold text-gray-900">Pausar tarea</h2>
        <p className="mt-1 text-sm text-gray-500">
          Guarda el motivo para saber por qué la detuviste.
        </p>

        <label className="mt-5 block text-sm font-semibold text-gray-700">Motivo</label>
        <select
          value={pauseReason}
          onChange={(event) => setPauseReason(event.target.value)}
          className="mt-2 h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm outline-none"
        >
          <option>Esperando información</option>
          <option>Bloqueada por otra tarea</option>
          <option>Esperando aprobación</option>
          <option>Falta material</option>
          <option>Otro</option>
        </select>

        <label className="mt-4 block text-sm font-semibold text-gray-700">Comentario opcional</label>
        <textarea
          value={pauseNote}
          onChange={(event) => setPauseNote(event.target.value)}
          placeholder="Ej. Estoy esperando respuesta del proveedor..."
          className="mt-2 min-h-24 w-full resize-none rounded-2xl border border-gray-200 p-4 text-sm outline-none"
        />

        <button
          type="button"
          onClick={handlePause}
          className="mt-5 h-12 w-full rounded-2xl bg-gray-900 font-semibold text-white"
        >
          Pausar tarea
        </button>
      </BottomSheet>

      <TaskEditorSheet
        open={editorOpen}
        task={task}
        onClose={() => setEditorOpen(false)}
        onSave={(value) => updateTask(task.id, value)}
      />

      <TaskPlannerSheet
        open={plannerOpen}
        title={task.title}
        initialDate={task.plannedDate}
        initialTime={task.plannedTime}
        initialDuration={task.estimatedMinutes}
        onClose={() => setPlannerOpen(false)}
        onSave={(plan) =>
          updateTask(task.id, {
            ...plan,
            status: task.status === "backlog" ? "pending" : task.status,
          })
        }
      />
    </MobileLayout>
  );
}

function formatPlannedDate(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Intl.DateTimeFormat("es-MX", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(year, month - 1, day));
}

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  if (minutes % 60 === 0) return `${minutes / 60} h`;
  return `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
}
