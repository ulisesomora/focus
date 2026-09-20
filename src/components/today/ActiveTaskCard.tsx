import {
  Check,
  Clock3,
  Pause,
} from "lucide-react";
import { Link } from "react-router-dom";

import { useApp } from "../../context/AppContext";
import type { Task } from "../../types/task";

type ActiveTaskCardProps = {
  task: Task;
};

export function ActiveTaskCard({
  task,
}: ActiveTaskCardProps) {
  const { moveTask } = useApp();

  return (
    <section className="mt-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">
          Ahora
        </h2>

        <Link
          to={`/tasks/${task.id}`}
          className="text-sm font-medium text-gray-500"
        >
          Ver tarea
        </Link>
      </div>

      <article className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm lg:max-w-[620px]">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600">
            En proceso
          </span>

          {task.priority === "high" && (
            <span className="text-xs font-medium text-red-500">
              Alta
            </span>
          )}
        </div>

        <h3 className="mt-4 text-lg font-bold text-gray-900">
          {task.title}
        </h3>

        {task.project && (
          <p className="mt-1 text-sm text-gray-500">
            {task.project}
          </p>
        )}

        <div className="mt-5 flex items-center gap-2 text-gray-700">
          <Clock3 size={18} />

          <span className="text-lg font-semibold">
            {formatMinutes(task.workedMinutes ?? 0)}
          </span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 lg:flex lg:flex-wrap">
          <Link
            to={`/tasks/${task.id}`}
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-orange-50 px-4 text-sm font-semibold text-orange-700"
          >
            <Pause size={17} />
            Pausar
          </Link>

          <button
            type="button"
            onClick={() => moveTask(task.id, "completed")}
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 text-sm font-semibold text-white"
          >
            <Check size={17} />
            Finalizar
          </button>
        </div>
      </article>
    </section>
  );
}

function formatMinutes(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(
    rest,
  ).padStart(2, "0")}`;
}
