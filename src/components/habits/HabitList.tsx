import { useState } from "react";
import { Check, ChevronRight, Plus, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import type { Habit } from "../../types/habit";
import { getDateKey, getFrequencyLabel, getHabitLog, isHabitDueToday, parseDateKey } from "../../utils/habits";
import { areasForSpace } from "../../utils/taskSpaces";
import { HabitEditorSheet } from "./HabitEditorSheet";

export function HabitRow({ habit, date = getDateKey(), controls = true, detailView = false }: { habit: Habit; date?: string; controls?: boolean; detailView?: boolean }) {
  const { habitLogs, settings, toggleHabit, incrementHabit, skipHabit } = useApp();
  const log = getHabitLog(habitLogs, habit.id, date);
  const space = settings.spaces?.find(item => item.id === habit.spaceId);
  const area = areasForSpace(settings, habit.spaceId).find(item => item.id === habit.area);
  const future = date > getDateKey();
  const due = isHabitDueToday(habit, habitLogs, parseDateKey(date));
  const disabled = future || !due;
  return <div className="flex min-w-0 items-center gap-2 border-b border-gray-100 py-2.5">
    {controls && <button type="button" disabled={disabled} aria-pressed={Boolean(log?.completed)} aria-label={`Marcar ${log?.completed ? "pendiente" : "hecho"}: ${habit.title}`} onClick={() => habit.type === "complete" ? toggleHabit(habit.id, date) : incrementHabit(habit.id, log?.completed ? -(log.value) : (habit.target ?? 1) - (log?.value ?? 0), date)} className={`flex h-7 w-7 shrink-0 items-center justify-center rounded border disabled:opacity-40 ${log?.completed ? "border-green-600 bg-green-600 text-white" : "border-gray-300 text-transparent"}`}><Check size={16} /></button>}
    {detailView ? <div className="min-w-0 flex-1">      <p className={`text-sm ${log?.completed ? "text-gray-400 line-through" : "text-gray-900"}`}>{habit.title}</p>
      <div className="mt-0.5 flex flex-wrap gap-x-2 text-[10px] text-gray-500"><span className="font-semibold text-indigo-600">Hábito</span>{space && <span>{space.name}</span>}{area && <span>{area.name}</span>}<span>{getFrequencyLabel(habit)}</span>{habit.plannedTime && <span>{habit.plannedTime} · {habit.estimatedMinutes ?? 30} min</span>}<span>{log?.status === "skipped" ? "No realizado" : log?.completed ? "Hecho" : future ? "Programado" : !due ? "No toca hoy" : "Pendiente"}</span>{habit.type !== "complete" && <span>{log?.value ?? 0}/{habit.target ?? 1} {habit.unit}</span>}</div>
</div> : <Link to={`/habits/${habit.id}`} className="min-w-0 flex-1">
      <p className={`text-sm ${log?.completed ? "text-gray-400 line-through" : "text-gray-900"}`}>{habit.title}</p>
      <div className="mt-0.5 flex flex-wrap gap-x-2 text-[10px] text-gray-500"><span className="font-semibold text-indigo-600">Hábito</span>{space && <span>{space.name}</span>}{area && <span>{area.name}</span>}<span>{getFrequencyLabel(habit)}</span>{habit.plannedTime && <span>{habit.plannedTime} · {habit.estimatedMinutes ?? 30} min</span>}<span>{log?.status === "skipped" ? "No realizado" : log?.completed ? "Hecho" : future ? "Programado" : !due ? "No toca hoy" : "Pendiente"}</span>{habit.type !== "complete" && <span>{log?.value ?? 0}/{habit.target ?? 1} {habit.unit}</span>}</div>
    </Link>}

    {controls && habit.type !== "complete" && <button type="button" disabled={disabled} aria-label={`Agregar progreso: ${habit.title}`} onClick={() => incrementHabit(habit.id, habit.type === "time" ? 5 : 1, date)} className="flex h-8 w-8 items-center justify-center rounded text-gray-500 disabled:opacity-30"><Plus size={16} /></button>}
    {controls && <button type="button" disabled={disabled} aria-pressed={log?.status === "skipped"} aria-label={`${log?.status === "skipped" ? "Marcar pendiente" : "No realizado"}: ${habit.title}`} title="No realizado" onClick={() => skipHabit(habit.id, date)} className={`flex h-8 w-8 shrink-0 items-center justify-center rounded disabled:opacity-30 ${log?.status === "skipped" ? "bg-amber-100 text-amber-700" : "text-gray-400"}`}><X size={15} /></button>}
    {!detailView && <Link to={`/habits/${habit.id}`} aria-label={`Ver hábito: ${habit.title}`} className="text-gray-400"><ChevronRight size={17} /></Link>}
  </div>;
}

export function HabitSection({ daily = false, spaceId, allSpaces = false, title, date = getDateKey(), onlyUntimed = false, respectAgenda = false, hideWhenEmpty = false }: { daily?: boolean; spaceId?: string; allSpaces?: boolean; title?: string; date?: string; onlyUntimed?: boolean; respectAgenda?: boolean; hideWhenEmpty?: boolean }) {
  const { habits, habitLogs, addHabit, settings } = useApp();
  const [creating, setCreating] = useState(false);
  const visible = habits.filter(habit => (allSpaces || habit.spaceId === spaceId) && (!daily || isHabitDueToday(habit, habitLogs, parseDateKey(date))) && (!onlyUntimed || !habit.plannedTime) && (!respectAgenda || !allSpaces || !habit.spaceId || settings.spaces?.find(space => space.id === habit.spaceId)?.showInAgenda !== false));
  if (hideWhenEmpty && !visible.length) return null;
  return <section aria-label={title ?? (daily ? "Hábitos de hoy" : "Hábitos")} className="my-4">
    <div className="flex items-center justify-between gap-2"><h2 className="text-sm font-semibold text-gray-800">{title ?? (daily ? "Hábitos de hoy" : "Hábitos")} <span className="text-xs text-gray-400">{visible.length}</span></h2><div className="flex gap-3"><button type="button" onClick={() => setCreating(true)} className="text-xs font-semibold text-indigo-600">+ Hábito</button><Link to="/habits" className="text-xs text-gray-500">Ver todos</Link></div></div>
    {visible.map(habit => <HabitRow key={habit.id} habit={habit} date={date} />)}
    {!visible.length && <p className="py-2 text-xs text-gray-400">{daily ? "Sin hábitos para este día." : "Agrega un hábito para empezar."}</p>}
    <HabitEditorSheet initialSpaceId={spaceId} open={creating} onClose={() => setCreating(false)} onSave={draft => { addHabit({ ...draft }); }} />
  </section>;
}
