import {
    ChevronRight,
    Check,
  } from "lucide-react";
  import { Link } from "react-router-dom";
  
  import type { Task } from "../../types/task";
  import { useApp } from "../../context/AppContext";
  
  type TodayAgendaProps = {
    tasks: Task[];
  };
  
  export function TodayAgenda({
    tasks,
  }: TodayAgendaProps) {
    const { moveTask } = useApp();

    return (
      <section className="mt-7 lg:max-w-[680px]">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">
            Próximo
          </h2>
  
          <Link
            to="/agenda"
            className="flex items-center text-sm font-medium text-gray-500"
          >
            Ver agenda
            <ChevronRight size={16} />
          </Link>
        </div>
  
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          {tasks.map((task, index) => (
            <div
              key={task.id}
              className={`flex items-start gap-3 px-4 py-4 ${
                index !== tasks.length - 1
                  ? "border-b border-gray-100"
                  : ""
              }`}
            >
              <div className="w-12 shrink-0">
                <span className="text-sm font-semibold text-gray-900">
                  {task.plannedTime ?? "Hoy"}
                </span>
              </div>
  
              <button
                type="button"
                onClick={() => moveTask(task.id, "completed")}
                aria-label={`Completar ${task.title}`}
                className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-gray-300 text-transparent transition hover:border-green-600 hover:bg-green-50 hover:text-green-600"
              >
                <Check size={13} strokeWidth={3} />
              </button>
  
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900">
                  {task.title}
                </p>
  
                {task.project && (
                  <p className="mt-1 text-xs text-gray-500">
                    {task.project}
                  </p>
                )}
              </div>
  
              {task.priority === "high" && (
                <span className="h-2 w-2 rounded-full bg-red-500" />
              )}
            </div>
          ))}
        </div>
      </section>
    );
  }
