import { Clock3 } from "lucide-react";
import { useApp } from "../../context/AppContext";
import type { Task } from "../../types/task";
export function durationLabel(minutes: number) {
  return minutes < 60 ? `${minutes} min` : minutes % 60 === 0 ? `${minutes / 60} h` : `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
}
export function DurationPicker({ value, onChange }: { value?: number; onChange: (value: number | undefined) => void }) {
  return <div className="space-y-2">
    <p className="flex items-center gap-1 text-xs font-semibold text-gray-500"><Clock3 size={14} /> Duración</p>
    <div className="flex flex-wrap gap-1.5">{[15,30,60,120].map(minutes => <button key={minutes} type="button" aria-pressed={value === minutes} onClick={() => onChange(value === minutes ? undefined : minutes)} className={`rounded-lg border px-2 py-2 text-xs font-semibold ${value === minutes ? "border-indigo-600 bg-indigo-600 text-white" : "border-gray-200 bg-white text-gray-600"}`}>{durationLabel(minutes)}</button>)}</div>
    <details><summary className="cursor-pointer text-xs font-medium text-gray-500">Elegir tiempo{value && ![15,30,60,120].includes(value) ? ` · ${durationLabel(value)}` : ""}</summary><label className="mt-2 flex items-center gap-2 text-xs text-gray-500"><input aria-label="Duración personalizada en minutos" type="number" min="1" max="1440" step="1" value={value ?? ""} onChange={event => { const number = Number(event.target.value); onChange(event.target.value && Number.isFinite(number) ? Math.min(1440, Math.max(1, Math.round(number))) : undefined); }} className="h-9 w-24 rounded-lg border border-gray-200 px-2" /> minutos</label></details>
    {value && <button type="button" onClick={() => onChange(undefined)} className="text-[11px] text-gray-400">Quitar duración</button>}
  </div>;
}
export function TaskDuration({ task }: { task: Task }) {
  const { updateTask } = useApp();
  return <DurationPicker value={task.estimatedMinutes} onChange={estimatedMinutes => updateTask(task.id, { estimatedMinutes })} />;
}
export function DurationBadge({ minutes }: { minutes?: number }) {
  return minutes ? <span className="inline-flex items-center gap-1 rounded bg-slate-700 px-1.5 py-0.5 text-[10px] font-semibold text-white"><Clock3 size={11} />{durationLabel(minutes)}</span> : null;
}
