import { useState } from "react";
import {
  CalendarClock,
  CalendarPlus,
  ChevronRight,
  ListTodo,
  Play,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { MobileLayout } from "../components/layout/MobileLayout";
import { TaskPlannerSheet } from "../components/tasks/TaskPlannerSheet";
import { useApp } from "../context/AppContext";
import type { Task } from "../types/task";

export function BacklogPage() {
  const { tasks, updateTask, startTask } = useApp();
  const navigate = useNavigate();
  const backlogTasks = tasks.filter((task) => task.status === "backlog");
  const [planningTask, setPlanningTask] = useState<Task | null>(null);

  function moveToToday(taskId: string) {
    updateTask(taskId, {
      status: "pending",
      plannedDate: getLocalDateKey(),
    });
  }

  return (
    <>
      <MobileLayout>
        <header className="mb-6 lg:max-w-4xl">
          <h1 className="text-2xl font-bold text-gray-900">Backlog</h1>
          <p className="mt-1 text-sm text-gray-500">
            {backlogTasks.length === 1
              ? "1 tarea sin planificar"
              : `${backlogTasks.length} tareas sin planificar`}
          </p>
        </header>

        {backlogTasks.length > 0 ? (
          <div className="space-y-3 lg:grid lg:max-w-5xl lg:grid-cols-2 lg:gap-3 lg:space-y-0 xl:grid-cols-3">
            {backlogTasks.map((task) => (
              <article
                key={task.id}
                className="rounded-2xl border border-gray-200 bg-white p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
                    <ListTodo size={18} />
                  </div>

                  <Link to={`/tasks/${task.id}`} className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900">{task.title}</p>
                    <p className="mt-1 text-xs text-gray-400">Sin fecha</p>
                  </Link>

                  <Link
                    to={`/tasks/${task.id}`}
                    aria-label="Abrir tarea"
                    className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400"
                  >
                    <ChevronRight size={18} />
                  </Link>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 lg:flex lg:flex-wrap">
                  <button
                    type="button"
                    onClick={() => moveToToday(task.id)}
                    className="flex h-10 items-center justify-center gap-1 rounded-xl bg-gray-100 px-2 text-xs font-semibold text-gray-700 lg:px-3"
                  >
                    <CalendarPlus size={15} />
                    Hoy
                  </button>

                  <button
                    type="button"
                    onClick={() => setPlanningTask(task)}
                    className="flex h-10 items-center justify-center gap-1 rounded-xl border border-gray-200 px-2 text-xs font-semibold text-gray-700 lg:px-3"
                  >
                    <CalendarClock size={15} />
                    Planificar
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      startTask(task.id);
                      navigate(`/tasks/${task.id}`);
                    }}
                    className="flex h-10 items-center justify-center gap-1 rounded-xl bg-gray-900 px-2 text-xs font-semibold text-white lg:px-3"
                  >
                    <Play size={15} />
                    Iniciar
                  </button>

                  <Link
                    to={`/tasks/${task.id}`}
                    className="flex h-10 items-center justify-center rounded-xl border border-gray-200 px-2 text-xs font-semibold text-gray-700 lg:px-3"
                  >
                    Abrir
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-7 text-center lg:max-w-xl">
            <p className="font-semibold text-gray-900">Backlog vacío</p>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              Desde Inbox puedes mandar aquí las tareas que quieres conservar sin planificarlas todavía.
            </p>
          </div>
        )}
      </MobileLayout>

      {planningTask && (
        <TaskPlannerSheet
          open
          title={planningTask.title}
          initialDate={planningTask.plannedDate}
          initialTime={planningTask.plannedTime}
          initialDuration={planningTask.estimatedMinutes}
          onClose={() => setPlanningTask(null)}
          onSave={(plan) => {
            updateTask(planningTask.id, {
              status: "pending",
              ...plan,
            });
          }}
        />
      )}
    </>
  );
}

function getLocalDateKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
