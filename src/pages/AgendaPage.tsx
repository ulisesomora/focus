import { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ListTodo,
} from "lucide-react";
import { Link } from "react-router-dom";

import { MobileLayout } from "../components/layout/MobileLayout";
import { useApp } from "../context/AppContext";
import type { Task } from "../types/task";

export function AgendaPage() {
  const { tasks } = useApp();
  const [selectedDate, setSelectedDate] = useState(getLocalDateKey());

  const plannedTasks = useMemo(
    () =>
      tasks
        .filter(
          (task) =>
            task.plannedDate === selectedDate &&
            task.status !== "completed" &&
            task.status !== "cancelled" &&
            task.status !== "backlog",
        )
        .sort(compareTasks),
    [tasks, selectedDate],
  );

  const datedWithoutTime = plannedTasks.filter((task) => !task.plannedTime);
  const timed = plannedTasks.filter((task) => task.plannedTime);

  function changeDay(offset: number) {
    setSelectedDate(addDays(selectedDate, offset));
  }

  return (
    <MobileLayout>
      <header className="mb-5 lg:max-w-4xl">
        <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
          Planificación
        </p>
        <div className="mt-1 flex items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
            <p className="mt-1 text-sm text-gray-500">
              {formatLongDate(selectedDate)}
            </p>
          </div>
          {selectedDate !== getLocalDateKey() && (
            <button
              type="button"
              onClick={() => setSelectedDate(getLocalDateKey())}
              className="rounded-xl bg-gray-900 px-3 py-2 text-xs font-semibold text-white"
            >
              Hoy
            </button>
          )}
        </div>
      </header>

      <div className="mb-6 flex items-center gap-2 lg:max-w-md">
        <button
          type="button"
          onClick={() => changeDay(-1)}
          aria-label="Día anterior"
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-600"
        >
          <ChevronLeft size={19} />
        </button>

        <label className="relative flex h-11 flex-1 items-center rounded-2xl border border-gray-200 bg-white px-4">
          <CalendarDays size={17} className="mr-2 text-gray-400" />
          <span className="text-sm font-semibold text-gray-700">
            {formatShortDate(selectedDate)}
          </span>
          <input
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
            className="absolute inset-0 cursor-pointer opacity-0"
            aria-label="Elegir fecha"
          />
        </label>

        <button
          type="button"
          onClick={() => changeDay(1)}
          aria-label="Día siguiente"
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-600"
        >
          <ChevronRight size={19} />
        </button>
      </div>

      {datedWithoutTime.length > 0 && (
        <section className="mb-6 lg:max-w-3xl">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-400">
            Para este día
          </h2>
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            {datedWithoutTime.map((task, index) => (
              <AgendaTask
                key={task.id}
                task={task}
                border={index !== datedWithoutTime.length - 1}
              />
            ))}
          </div>
        </section>
      )}

      <section className="lg:max-w-5xl">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wide text-gray-400">
            Horario
          </h2>
          <span className="text-xs font-semibold text-gray-400">
            {timed.length} {timed.length === 1 ? "bloque" : "bloques"}
          </span>
        </div>

        {timed.length > 0 ? (
          <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
            {timed.map((task) => (
              <Link
                key={task.id}
                to={`/tasks/${task.id}`}
                className="flex gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="w-14 shrink-0">
                  <p className="font-bold text-gray-900">{task.plannedTime}</p>
                  {task.estimatedMinutes && (
                    <p className="mt-1 text-xs text-gray-400">
                      {formatDuration(task.estimatedMinutes)}
                    </p>
                  )}
                </div>

                <div className="w-0.5 shrink-0 rounded-full bg-gray-200" />

                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900">{task.title}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
                    {task.project && <span>{task.project}</span>}
                    <span>{statusLabel(task.status)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center lg:max-w-xl">
            <Clock3 size={28} className="mx-auto text-gray-300" />
            <p className="mt-4 font-semibold text-gray-900">
              No tienes horarios planeados
            </p>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              Planifica una tarea desde Backlog o desde el tablero y aparecerá aquí.
            </p>
            <Link
              to="/backlog"
              className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-gray-900 px-4 text-xs font-semibold text-white"
            >
              <ListTodo size={15} />
              Revisar Backlog
            </Link>
          </div>
        )}
      </section>
    </MobileLayout>
  );
}

function AgendaTask({ task, border }: { task: Task; border: boolean }) {
  return (
    <Link
      to={`/tasks/${task.id}`}
      className={`flex items-center gap-3 px-4 py-4 ${
        border ? "border-b border-gray-100" : ""
      }`}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
        <ListTodo size={17} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-gray-900">{task.title}</p>
        <p className="mt-1 text-xs text-gray-500">
          {task.project ?? statusLabel(task.status)}
        </p>
      </div>
      {task.estimatedMinutes && (
        <span className="text-xs font-semibold text-gray-400">
          {formatDuration(task.estimatedMinutes)}
        </span>
      )}
    </Link>
  );
}

function compareTasks(a: Task, b: Task) {
  if (!a.plannedTime && !b.plannedTime) return 0;
  if (!a.plannedTime) return -1;
  if (!b.plannedTime) return 1;
  return a.plannedTime.localeCompare(b.plannedTime);
}

function statusLabel(status: Task["status"]) {
  const labels: Record<Task["status"], string> = {
    backlog: "Backlog",
    pending: "Pendiente",
    in_progress: "En proceso",
    paused: "En pausa",
    review: "En revisión",
    completed: "Finalizado",
    cancelled: "Cancelado",
  };
  return labels[status];
}

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  if (minutes % 60 === 0) return `${minutes / 60} h`;
  return `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
}

function addDays(dateKey: string, offset: number) {
  const date = parseLocalDate(dateKey);
  date.setDate(date.getDate() + offset);
  return toDateKey(date);
}

function formatLongDate(dateKey: string) {
  return new Intl.DateTimeFormat("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(parseLocalDate(dateKey));
}

function formatShortDate(dateKey: string) {
  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "short",
  }).format(parseLocalDate(dateKey));
}

function parseLocalDate(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getLocalDateKey() {
  return toDateKey(new Date());
}
