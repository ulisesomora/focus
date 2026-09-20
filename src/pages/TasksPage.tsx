import { useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronRight,
  Circle,
  Clock3,
  PauseCircle,
  Play,
  RotateCcw,
  Search,
  CalendarClock,
  MoveRight,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { MobileLayout } from "../components/layout/MobileLayout";
import { TaskPlannerSheet } from "../components/tasks/TaskPlannerSheet";
import { TaskStatusSheet } from "../components/tasks/TaskStatusSheet";
import { useApp } from "../context/AppContext";
import type { Task, TaskStatus } from "../types/task";

type BoardStatus = Exclude<TaskStatus, "backlog" | "cancelled">;

const columns: Array<{
  status: BoardStatus;
  label: string;
  shortLabel: string;
}> = [
  { status: "pending", label: "Pendiente", shortLabel: "Pendiente" },
  { status: "in_progress", label: "En proceso", shortLabel: "Proceso" },
  { status: "paused", label: "En pausa", shortLabel: "Pausa" },
  { status: "review", label: "En revisión", shortLabel: "Revisión" },
  { status: "completed", label: "Finalizado", shortLabel: "Final" },
];

export function TasksPage() {
  const { tasks, settings } = useApp();
  const [selectedStatus, setSelectedStatus] =
    useState<BoardStatus>("pending");
  const [query, setQuery] = useState("");

  const visibleTasks = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("es");

    return tasks.filter((task) => {
      if (task.status !== selectedStatus) return false;
      if (!normalizedQuery) return true;

      return [task.title, task.project]
        .filter(Boolean)
        .some((value) =>
          value!.toLocaleLowerCase("es").includes(normalizedQuery),
        );
    });
  }, [tasks, selectedStatus, query]);

  const visibleColumns = settings.showCompletedTasks
    ? columns
    : columns.filter((column) => column.status !== "completed");

  const currentColumn = columns.find(
    (column) => column.status === selectedStatus,
  )!;

  return (
    <MobileLayout>
      <header className="mb-5 lg:mb-7 lg:max-w-4xl">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tareas</h1>
            <p className="mt-1 text-sm text-gray-500">
              Controla el flujo de lo que estás haciendo.
            </p>
          </div>

          <Link
            to="/backlog"
            className="text-sm font-semibold text-gray-600"
          >
            Backlog
          </Link>
        </div>
      </header>

      <div className="relative mb-4 lg:max-w-md">
        <Search
          size={18}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar tareas..."
          className="h-12 w-full rounded-2xl border border-gray-200 bg-white pl-11 pr-4 text-sm outline-none focus:border-gray-400"
        />
      </div>

      <div className="-mx-4 mb-5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:mx-0 lg:px-0">
        <div className="flex w-max gap-2">
          {visibleColumns.map((column) => {
            const count = tasks.filter(
              (task) => task.status === column.status,
            ).length;
            const active = selectedStatus === column.status;

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
                    active
                      ? "bg-white/15 text-white"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between lg:max-w-5xl">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
            Estado
          </p>
          <h2 className="mt-1 text-lg font-bold text-gray-900">
            {currentColumn.label}
          </h2>
        </div>

        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
          {visibleTasks.length} {visibleTasks.length === 1 ? "tarea" : "tareas"}
        </span>
      </div>

      {visibleTasks.length > 0 ? (
        <div className="space-y-3 lg:grid lg:max-w-5xl lg:grid-cols-2 lg:gap-3 lg:space-y-0 xl:grid-cols-3">
          {visibleTasks.map((task) => (
            <TaskBoardCard key={task.id} task={task} />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center lg:max-w-xl">
          <StatusIcon status={selectedStatus} />
          <p className="mt-4 font-semibold text-gray-900">
            No hay tareas en {currentColumn.label.toLowerCase()}
          </p>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            Cuando una tarea cambie a este estado aparecerá aquí.
          </p>
        </div>
      )}
    </MobileLayout>
  );
}

function TaskBoardCard({ task }: { task: Task }) {
  const { startTask, moveTask, setActiveTask, updateTask } = useApp();
  const navigate = useNavigate();
  const [statusOpen, setStatusOpen] = useState(false);
  const [plannerOpen, setPlannerOpen] = useState(false);

  function primaryAction() {
    switch (task.status) {
      case "pending":
        startTask(task.id);
        break;
      case "in_progress":
        navigate(`/tasks/${task.id}`);
        return;
      case "paused":
        startTask(task.id);
        break;
      case "review":
        moveTask(task.id, "completed");
        break;
      case "completed":
        moveTask(task.id, "pending");
        break;
    }
  }

  const action = getPrimaryAction(task.status);

  function handleStatusChange(status: TaskStatus) {
    if (status === "paused") {
      navigate(`/tasks/${task.id}`);
      return;
    }

    moveTask(task.id, status);
  }

  return (
    <>
    <article className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          <StatusIcon status={task.status} compact />
        </div>

        <Link to={`/tasks/${task.id}`} className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {task.isActive && (
              <span className="rounded-full bg-blue-50 px-2 py-1 text-[11px] font-bold text-blue-700">
                Activa ahora
              </span>
            )}
            {task.priority === "high" && (
              <span className="text-xs font-semibold text-red-500">Alta</span>
            )}
          </div>

          <h3 className="mt-2 font-bold leading-6 text-gray-900">
            {task.title}
          </h3>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
            {task.project && <span>{task.project}</span>}
            {task.plannedTime && <span>{task.plannedTime}</span>}
            {!!task.workedMinutes && (
              <span>{formatMinutes(task.workedMinutes)}</span>
            )}
          </div>

          {task.status === "paused" && task.pauseReason && (
            <div className="mt-3 rounded-xl bg-orange-50 px-3 py-2 text-xs text-orange-800">
              <strong>{task.pauseReason}</strong>
              {task.pauseNote && (
                <p className="mt-1 leading-5 text-orange-700">
                  {task.pauseNote}
                </p>
              )}
            </div>
          )}
        </Link>

        <Link
          to={`/tasks/${task.id}`}
          aria-label="Abrir tarea"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-400"
        >
          <ChevronRight size={18} />
        </Link>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={primaryAction}
          className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-gray-900 px-3 text-xs font-semibold text-white lg:flex-none lg:px-4"
        >
          <action.Icon size={15} />
          {action.label}
        </button>

        {task.status === "in_progress" && !task.isActive && (
          <button
            type="button"
            onClick={() => setActiveTask(task.id)}
            className="h-10 rounded-xl border border-gray-200 px-3 text-xs font-semibold text-gray-700"
          >
            Hacer activa
          </button>
        )}

        {(task.status === "in_progress" || task.status === "paused") && (
          <Link
            to={`/tasks/${task.id}`}
            className="flex h-10 items-center justify-center rounded-xl border border-gray-200 px-3 text-xs font-semibold text-gray-700"
          >
            Detalle
          </Link>
        )}
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2 lg:flex lg:flex-wrap">
        {task.status !== "completed" && (
          <button
            type="button"
            onClick={() => setPlannerOpen(true)}
            className="flex h-9 items-center justify-center gap-2 rounded-xl bg-gray-50 px-3 text-xs font-semibold text-gray-600"
          >
            <CalendarClock size={14} />
            Planificar
          </button>
        )}
        <button
          type="button"
          onClick={() => setStatusOpen(true)}
          className={`flex h-9 items-center justify-center gap-2 rounded-xl bg-gray-50 px-3 text-xs font-semibold text-gray-600 ${
            task.status === "completed" ? "col-span-2" : ""
          }`}
        >
          <MoveRight size={14} />
          Mover
        </button>
      </div>
    </article>

    <TaskStatusSheet
      open={statusOpen}
      currentStatus={task.status}
      onClose={() => setStatusOpen(false)}
      onSelect={handleStatusChange}
    />

    <TaskPlannerSheet
      open={plannerOpen}
      title={task.title}
      initialDate={task.plannedDate}
      initialTime={task.plannedTime}
      initialDuration={task.estimatedMinutes}
      onClose={() => setPlannerOpen(false)}
      onSave={(plan) => updateTask(task.id, { ...plan, status: task.status === "backlog" ? "pending" : task.status })}
    />
    </>
  );
}

function getPrimaryAction(status: TaskStatus) {
  switch (status) {
    case "pending":
      return { label: "Iniciar", Icon: Play };
    case "in_progress":
      return { label: "Gestionar", Icon: Clock3 };
    case "paused":
      return { label: "Reanudar", Icon: Play };
    case "review":
      return { label: "Aprobar", Icon: CheckCircle2 };
    case "completed":
      return { label: "Reabrir", Icon: RotateCcw };
    default:
      return { label: "Abrir", Icon: ChevronRight };
  }
}

function StatusIcon({
  status,
  compact = false,
}: {
  status: TaskStatus;
  compact?: boolean;
}) {
  const size = compact ? 18 : 28;
  const wrapper = compact
    ? ""
    : "mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-600";

  let icon = <Circle size={size} className="text-gray-400" />;

  if (status === "in_progress") {
    icon = <Play size={size} className="text-blue-600" />;
  } else if (status === "paused") {
    icon = <PauseCircle size={size} className="text-orange-500" />;
  } else if (status === "review") {
    icon = <Clock3 size={size} className="text-violet-600" />;
  } else if (status === "completed") {
    icon = <CheckCircle2 size={size} className="text-green-600" />;
  }

  return <div className={wrapper}>{icon}</div>;
}

function formatMinutes(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  if (!hours) return `${rest} min`;
  if (!rest) return `${hours} h`;
  return `${hours} h ${rest} min`;
}
