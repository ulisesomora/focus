import { useMemo, useState } from "react";
import {
  Check,
  ChevronRight,
  CirclePause,
  ClipboardCheck,
  Play,
  RotateCcw,
} from "lucide-react";
import { Link } from "react-router-dom";

import { MobileLayout } from "../components/layout/MobileLayout";
import { useApp } from "../context/AppContext";
import type { Task, TaskStatus } from "../types/task";

type BoardStatus = Extract<
  TaskStatus,
  "pending" | "in_progress" | "paused" | "review" | "completed"
>;

const columns: Array<{
  status: BoardStatus;
  label: string;
  shortLabel: string;
}> = [
  { status: "pending", label: "Pendiente", shortLabel: "Pendiente" },
  { status: "in_progress", label: "En proceso", shortLabel: "Proceso" },
  { status: "paused", label: "En pausa", shortLabel: "Pausa" },
  { status: "review", label: "En revisión", shortLabel: "Revisión" },
  { status: "completed", label: "Finalizado", shortLabel: "Finalizado" },
];

export function KanbanPage() {
  const { tasks, startTask, moveTask } = useApp();
  const [selectedStatus, setSelectedStatus] =
    useState<BoardStatus>("pending");

  const visibleTasks = useMemo(
    () => tasks.filter((task) => task.status === selectedStatus),
    [tasks, selectedStatus],
  );

  function countByStatus(status: BoardStatus) {
    return tasks.filter((task) => task.status === status).length;
  }

  return (
    <MobileLayout>
      <header className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          Flujo de trabajo
        </p>
        <h1 className="mt-1 text-2xl font-bold text-gray-900">Tablero</h1>
        <p className="mt-1 text-sm text-gray-500">
          Mueve tus tareas por cada etapa sin perder el contexto.
        </p>
      </header>

      <div className="-mx-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex w-max gap-2">
          {columns.map((column) => {
            const active = selectedStatus === column.status;
            const count = countByStatus(column.status);

            return (
              <button
                key={column.status}
                type="button"
                onClick={() => setSelectedStatus(column.status)}
                className={`flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold transition ${
                  active
                    ? "bg-gray-900 text-white"
                    : "border border-gray-200 bg-white text-gray-600"
                }`}
              >
                {column.shortLabel}
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    active ? "bg-white/15" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Estado
          </p>
          <h2 className="text-lg font-bold text-gray-900">
            {columns.find((column) => column.status === selectedStatus)?.label}
          </h2>
        </div>
        <p className="text-sm font-semibold text-gray-400">
          {visibleTasks.length}
        </p>
      </div>

      <div className="mt-3 space-y-3">
        {visibleTasks.length > 0 ? (
          visibleTasks.map((task) => (
            <TaskBoardCard
              key={task.id}
              task={task}
              startTask={startTask}
              moveTask={moveTask}
            />
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-7 text-center">
            <p className="font-semibold text-gray-900">
              No hay tareas aquí
            </p>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              Cuando una tarea pase a este estado aparecerá en esta columna.
            </p>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}

type TaskBoardCardProps = {
  task: Task;
  startTask: (taskId: string) => void;
  moveTask: (taskId: string, status: TaskStatus) => void;
};

function TaskBoardCard({ task, startTask, moveTask }: TaskBoardCardProps) {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {task.isActive && (
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-600">
                Activa ahora
              </span>
            )}
            {task.priority === "high" && (
              <span className="rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-600">
                Alta
              </span>
            )}
          </div>

          <Link to={`/tasks/${task.id}`} className="mt-2 block">
            <h3 className="font-bold text-gray-900">{task.title}</h3>
            {task.project && (
              <p className="mt-1 text-xs text-gray-500">{task.project}</p>
            )}
          </Link>

          {task.status === "paused" && task.pauseReason && (
            <div className="mt-3 rounded-xl bg-orange-50 px-3 py-2">
              <p className="text-xs font-semibold text-orange-700">
                {task.pauseReason}
              </p>
              {task.pauseNote && (
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-orange-800">
                  {task.pauseNote}
                </p>
              )}
            </div>
          )}
        </div>

        <Link
          to={`/tasks/${task.id}`}
          aria-label="Abrir tarea"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-50 text-gray-400"
        >
          <ChevronRight size={18} />
        </Link>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {task.status === "pending" && (
          <button
            type="button"
            onClick={() => startTask(task.id)}
            className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-gray-900 px-3 text-xs font-semibold text-white"
          >
            <Play size={15} />
            Iniciar
          </button>
        )}

        {task.status === "in_progress" && (
          <>
            <Link
              to={`/tasks/${task.id}`}
              className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-orange-50 px-3 text-xs font-semibold text-orange-700"
            >
              <CirclePause size={15} />
              Pausar
            </Link>
            <button
              type="button"
              onClick={() => moveTask(task.id, "review")}
              className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 text-xs font-semibold text-gray-700"
            >
              <ClipboardCheck size={15} />
              Revisión
            </button>
          </>
        )}

        {task.status === "paused" && (
          <button
            type="button"
            onClick={() => startTask(task.id)}
            className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-gray-900 px-3 text-xs font-semibold text-white"
          >
            <RotateCcw size={15} />
            Reanudar
          </button>
        )}

        {task.status === "review" && (
          <>
            <button
              type="button"
              onClick={() => startTask(task.id)}
              className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 text-xs font-semibold text-gray-700"
            >
              <RotateCcw size={15} />
              Regresar
            </button>
            <button
              type="button"
              onClick={() => moveTask(task.id, "completed")}
              className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 px-3 text-xs font-semibold text-white"
            >
              <Check size={15} />
              Aprobar
            </button>
          </>
        )}

        {task.status === "completed" && (
          <Link
            to={`/tasks/${task.id}`}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-green-50 px-3 text-xs font-semibold text-green-700"
          >
            <Check size={15} />
            Ver finalizada
          </Link>
        )}
      </div>
    </article>
  );
}
