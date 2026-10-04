import { CalendarDays } from "lucide-react";
import type { Task } from "../../types/task";
import { useApp } from "../../context/AppContext";
import { taskWorkDates, useTaskDays } from "../../utils/taskDays";

type DayTask = Pick<Task, "plannedDate" | "workDates" | "status">;
export function DayButtons({ dates, onChange }: { dates: string[]; onChange: (dates: string[]) => void }) {
  const { today, tomorrow } = useTaskDays();
  const otherDates = dates.filter(date => date !== today && date !== tomorrow);
  return <div className="flex flex-wrap gap-2" aria-label="Días de la tarea">
    {[["Hoy", today], ["Mañana", tomorrow]].map(([label, date]) => {
      const active = dates.includes(date);
      return <button key={label} type="button" disabled={!active && dates.length >= 7} aria-pressed={active} onClick={() => onChange(active ? dates.filter(item => item !== date) : [...dates, date].sort())}
        className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${active ? "border-indigo-600 bg-indigo-600 text-white" : "border-gray-200 bg-gray-50 text-gray-400 hover:border-indigo-300 disabled:opacity-40"}`}>{label}</button>;
    })}
    {otherDates.map(date => <button key={date} type="button" aria-label={`Quitar día ${date}`} title="Quitar fecha" onClick={() => onChange(dates.filter(item => item !== date))} className="flex h-9 items-center gap-1 rounded-lg border border-indigo-600 bg-indigo-600 px-2 text-xs font-semibold text-white">{formatTaskDate(date)} <span aria-hidden="true">×</span></button>)}
    {dates.length < 7 && <details className="relative"><summary aria-label="Elegir otro día" title="Elegir otro día" className="flex h-9 cursor-pointer list-none items-center justify-center rounded-lg border border-gray-200 bg-gray-50 px-2 text-gray-500 [&::-webkit-details-marker]:hidden"><CalendarDays size={17} /></summary>
      <div className="absolute right-0 top-10 z-30 rounded-xl border border-gray-200 bg-white p-3 shadow-lg"><label className="text-xs font-medium text-gray-600">Elegir otro día<input type="date" aria-label="Otro día para la tarea" onChange={event => { if (event.target.value && dates.length < 7) { onChange([...new Set([...dates, event.target.value])].sort()); event.currentTarget.closest("details")?.removeAttribute("open"); } }} className="mt-2 block h-9 rounded-lg border border-gray-200 px-2 text-sm" /></label><p className="mt-2 text-[10px] text-gray-400">{dates.length}/7 fechas</p></div>
    </details>}
    {dates.length >= 7 && <span className="self-center text-[10px] text-gray-400">7/7 fechas</span>}
  </div>;
}
export function TaskDayToggle({ task }: { task: Task }) {
  const { updateTask } = useApp();
  return <DayButtons dates={taskWorkDates(task)} onChange={workDates => updateTask(task.id, { workDates })} />;
}
export function TaskDayBadges({ task }: { task: DayTask }) {
  const { today, tomorrow } = useTaskDays();
  const dates = task.workDates ?? (task.plannedDate ? [task.plannedDate] : []);
  const futureDates = dates.filter(date => date > tomorrow);
  return <>{[["Hoy", today], ["Mañana", tomorrow]].filter(([, date]) => dates.includes(date)).map(([label]) => <span key={label} className="inline-block rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700">{label}</span>)}
    {futureDates.length > 0 && <span title={futureDates.map(formatTaskDate).join(", ")} className="inline-block rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700">{futureDates.length === 1 ? "Día" : "Días +"}</span>}
    {task.status !== "completed" && task.status !== "cancelled" && !!dates.length && dates.every(date => date < today) && <span className="inline-block rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">Atrasada</span>}</>;
}

function formatTaskDate(date: string) {
  return new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${date}T12:00:00`)).replace(".", "");
}
