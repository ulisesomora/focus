import { TaskBadges } from "../components/tasks/TaskMetadataPanel";
import { Check, ChevronRight as DetailArrow } from "lucide-react";
import { taskWorkDates } from "../utils/taskDays";
import { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { MobileLayout } from "../components/layout/MobileLayout";
import { useApp } from "../context/AppContext";
import { defaultAreas } from "../types/settings";
import type { Task } from "../types/task";

type CalendarEvent = { task: Task; start: number; duration: number; lane: number; lanes: number };
const HOUR_HEIGHT = 64;

export function AgendaPage() {
  const { tasks, settings, moveTask, updateTask } = useApp();
  const [selectedDate, setSelectedDate] = useState(dateKey(new Date()));
  const areas = settings.areas?.length ? settings.areas : defaultAreas;
  const scheduled = useMemo(() => tasks.filter((task) =>
    taskWorkDates(task).includes(selectedDate) && task.status !== "cancelled"
  ), [tasks, selectedDate]);
  const hasSlot = (task: Task) => task.plannedDate === selectedDate && !!task.plannedTime && parseTime(task.plannedTime) !== null && !!task.estimatedMinutes;
  const withoutTime = scheduled.filter(task => !hasSlot(task));
  const timed = scheduled.filter(hasSlot);
  const events = useMemo(() => layoutEvents(timed), [timed]);
  const startHour = events.length ? Math.min(6, Math.floor(Math.min(...events.map((event) => event.start)) / 60)) : 6;
  const endHour = events.length ? Math.max(22, Math.min(24, Math.ceil(Math.max(...events.map((event) => event.start + event.duration)) / 60))) : 22;
  const hours = Array.from({ length: endHour - startHour + 1 }, (_, index) => startHour + index);
  const week = weekDays(selectedDate);
  const dayText = new Intl.DateTimeFormat("es-MX", { weekday: "long", day: "numeric", month: "short" }).format(parseDate(selectedDate));
  const headingDate = dayText.charAt(0).toUpperCase() + dayText.slice(1).replace(".", "");

  function changeDay(offset: number) {
    const date = parseDate(selectedDate);
    date.setDate(date.getDate() + offset);
    setSelectedDate(dateKey(date));
  }

  return (
    <MobileLayout>
      <div className="mx-auto max-w-5xl">
        <header className="mb-4 flex items-baseline gap-2">
          <h1 className="text-xl font-bold text-gray-950">Agenda</h1>
          <span className="text-sm font-medium text-gray-500">{headingDate}</span>
        </header>

        <div className="mb-4 flex items-center gap-2">
          <button type="button" onClick={() => changeDay(-7)} aria-label="Semana anterior" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-gray-600"><ChevronLeft size={18} /></button>
          <div className="grid min-w-0 flex-1 grid-cols-7 gap-1">
            {week.map((day) => {
              const key = dateKey(day);
              const active = key === selectedDate;
              return <button key={key} type="button" onClick={() => setSelectedDate(key)} aria-pressed={active}
                className={`flex min-w-0 flex-col items-center rounded-lg px-0.5 py-2 text-center ${active ? "bg-gray-900 text-white" : "bg-white text-gray-600"}`}>
                <span className="text-[10px] font-semibold uppercase">{new Intl.DateTimeFormat("es-MX", { weekday: "short" }).format(day).replace(".", "")}</span>
                <span className="mt-1 text-sm font-bold">{day.getDate()}</span>
              </button>;
            })}
          </div>
          <button type="button" onClick={() => changeDay(7)} aria-label="Semana siguiente" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-gray-600"><ChevronRight size={18} /></button>
        </div>

        <div className="mb-4 flex items-center justify-between gap-2">
          <label className="relative flex h-9 items-center gap-2 rounded-lg bg-white px-3 text-xs font-medium text-gray-600">
            <CalendarDays size={15} /> Elegir fecha
            <input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} aria-label="Elegir fecha" className="absolute inset-0 cursor-pointer opacity-0" />
          </label>
          {selectedDate !== dateKey(new Date()) && <button type="button" onClick={() => setSelectedDate(dateKey(new Date()))} className="text-xs font-semibold text-gray-600">Ir a hoy</button>}
        </div>

        {!!withoutTime.length && <section className="mb-5 rounded-xl border border-gray-200 bg-white p-3">
          <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">Sin horario</h2>
          {withoutTime.map(task => <div key={task.id} className="border-t border-gray-100 py-3">
            <div className="flex items-start gap-2">
              <button type="button" aria-label={`Completar tarea: ${task.title}`} onClick={() => moveTask(task.id, task.status === "completed" ? "pending" : "completed")} className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${task.status === "completed" ? "border-gray-400 bg-gray-400 text-white" : "border-gray-300 text-transparent"}`}><Check size={14} /></button>
              <Link to={`/tasks/${task.id}`} className="min-w-0 flex-1"><p className={`text-sm ${task.status === "completed" ? "text-gray-400 line-through" : "text-gray-900"}`}>{task.title}</p><TaskBadges task={task} includeArea />{task.description && <p className="mt-1 line-clamp-2 text-xs text-gray-500">{task.description}</p>}</Link>
              <Link to={`/tasks/${task.id}`} aria-label={`Ver tarea: ${task.title}`} className="text-gray-400"><DetailArrow size={18} /></Link>
            </div>
            {!!task.subtasks?.length && <details className="ml-7 mt-2"><summary className="cursor-pointer text-xs text-gray-500">Subtareas {task.subtasks.filter(item => item.completed).length}/{task.subtasks.length}</summary><div className="mt-2 border-l border-gray-200 pl-3">{task.subtasks.map(item => <button key={item.id} type="button" aria-pressed={item.completed} onClick={() => updateTask(task.id, { subtasks: task.subtasks?.map(subtask => subtask.id === item.id ? { ...subtask, completed: !subtask.completed } : subtask) })} className="flex min-h-8 w-full items-center gap-2 text-left text-xs"><span className={`h-4 w-4 rounded border ${item.completed ? "bg-gray-400 text-white" : "text-transparent"}`}><Check size={12} /></span><span className={item.completed ? "text-gray-400 line-through" : "text-gray-700"}>{item.title}</span></button>)}</div></details>}
          </div>)}
        </section>}

        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <h2 className="text-sm font-bold text-gray-900">Horario</h2>
            <span className="text-xs text-gray-400">{events.length} {events.length === 1 ? "bloque" : "bloques"}</span>
          </div>
          <div className="relative ml-2 mr-3" style={{ height: (endHour - startHour) * HOUR_HEIGHT }}>
            {hours.map((hour) => <div key={hour} className="absolute left-0 right-0 border-t border-gray-100" style={{ top: (hour - startHour) * HOUR_HEIGHT }}>
              <span className="-mt-2 block w-12 bg-white pr-1 text-[10px] text-gray-400">{String(hour).padStart(2, "0")}:00</span>
            </div>)}
            <div className="absolute bottom-0 left-14 top-0 right-0">
              {events.map((event) => {
                const areaIndex = areas.findIndex((area) => area.id === event.task.area);
                const palette = ["bg-indigo-50 border-indigo-200 text-indigo-900", "bg-emerald-50 border-emerald-200 text-emerald-900", "bg-pink-50 border-pink-200 text-pink-900", "bg-amber-50 border-amber-200 text-amber-900"];
                return <Link key={event.task.id} to={`/tasks/${event.task.id}`}
                  style={{
                    top: (event.start - startHour * 60) * HOUR_HEIGHT / 60,
                    height: Math.max(32, event.duration * HOUR_HEIGHT / 60 - 2),
                    left: `${100 * event.lane / event.lanes}%`,
                    width: `calc(${100 / event.lanes}% - 4px)`,
                  }}
                  className={`absolute overflow-y-auto rounded-lg border px-2 py-1 text-xs shadow-sm ${palette[Math.max(0, areaIndex) % palette.length]}`}>
                  <span className={`block truncate font-semibold ${event.task.status === "completed" ? "line-through opacity-50" : ""}`}>{event.task.title}</span>
                  <TaskBadges task={event.task} includeArea />
                  <span className="block truncate text-[10px] opacity-70">{formatClock(event.start)}–{formatClock(event.start + event.duration)} · {event.task.estimatedMinutes ? formatDuration(event.task.estimatedMinutes) : "Duración no indicada"}</span>
                </Link>;
              })}
            </div>
          </div>
        </section>
        {!events.length && <p className="mt-3 text-center text-xs text-gray-500">Al asignar hora y duración a una tarea, aparecerá como bloque en esta agenda.</p>}
      </div>
    </MobileLayout>
  );
}

function layoutEvents(tasks: Task[]): CalendarEvent[] {
  const sorted = tasks.map((task) => ({ task, start: parseTime(task.plannedTime!)!, duration: Math.max(1, task.estimatedMinutes ?? 30), lane: 0, lanes: 1 }))
    .sort((a, b) => a.start - b.start);
  let group: CalendarEvent[] = [];
  let groupEnd = -1;
  function finishGroup() {
    const occupied: number[] = [];
    for (const event of group) {
      let lane = occupied.findIndex((end) => end <= event.start);
      if (lane < 0) lane = occupied.length;
      occupied[lane] = event.start + event.duration;
      event.lane = lane;
    }
    for (const event of group) event.lanes = occupied.length;
  }
  for (const event of sorted) {
    if (group.length && event.start >= groupEnd) { finishGroup(); group = []; }
    group.push(event);
    groupEnd = Math.max(groupEnd, event.start + event.duration);
  }
  if (group.length) finishGroup();
  return sorted;
}

function parseTime(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const hours = Number(match[1]), minutes = Number(match[2]);
  return hours < 24 && minutes < 60 ? hours * 60 + minutes : null;
}
function parseDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}
function dateKey(value: Date) {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
}
function weekDays(value: string) {
  const first = parseDate(value);
  first.setDate(first.getDate() - (first.getDay() + 6) % 7);
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(first);
    day.setDate(first.getDate() + index);
    return day;
  });
}
function formatClock(minutes: number) {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}
function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  return minutes % 60 ? `${Math.floor(minutes / 60)} h ${minutes % 60} min` : `${minutes / 60} h`;
}
