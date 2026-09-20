import { useEffect, useState } from "react";
import { Check, Plus, Trash2, X } from "lucide-react";

import type { Goal, GoalMilestone, GoalProgressMode } from "../../types/goal";
import type { Task } from "../../types/task";
import type { Habit } from "../../types/habit";
import { BottomSheet } from "../ui/BottomSheet";

type GoalDraft = Omit<Goal, "id" | "createdAt">;

type Props = {
  open: boolean;
  goal?: Goal;
  tasks: Task[];
  habits: Habit[];
  onClose: () => void;
  onSave: (goal: GoalDraft) => void;
};

export function GoalEditorSheet({ open, goal, tasks, habits, onClose, onSave }: Props) {
  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState("🎯");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [project, setProject] = useState("");
  const [progressMode, setProgressMode] = useState<GoalProgressMode>("combined");
  const [manualProgress, setManualProgress] = useState(0);
  const [linkedTaskIds, setLinkedTaskIds] = useState<string[]>([]);
  const [linkedHabitIds, setLinkedHabitIds] = useState<string[]>([]);
  const [milestones, setMilestones] = useState<GoalMilestone[]>([]);
  const [milestoneTitle, setMilestoneTitle] = useState("");

  useEffect(() => {
    if (!open) return;
    setTitle(goal?.title ?? "");
    setIcon(goal?.icon ?? "🎯");
    setDescription(goal?.description ?? "");
    setTargetDate(goal?.targetDate ?? "");
    setProject(goal?.project ?? "");
    setProgressMode(goal?.progressMode ?? "combined");
    setManualProgress(goal?.manualProgress ?? 0);
    setLinkedTaskIds(goal?.linkedTaskIds ?? []);
    setLinkedHabitIds(goal?.linkedHabitIds ?? []);
    setMilestones(goal?.milestones ?? []);
    setMilestoneTitle("");
  }, [open, goal]);

  function toggleTask(id: string) {
    setLinkedTaskIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  function toggleHabit(id: string) {
    setLinkedHabitIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  function addMilestone() {
    const value = milestoneTitle.trim();
    if (!value) return;
    setMilestones((current) => [...current, { id: crypto.randomUUID(), title: value, completed: false }]);
    setMilestoneTitle("");
  }

  function handleSave() {
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      icon: icon.trim() || "🎯",
      description: description.trim() || undefined,
      targetDate: targetDate || undefined,
      project: project.trim() || undefined,
      progressMode,
      manualProgress: progressMode === "manual" ? manualProgress : undefined,
      linkedTaskIds,
      linkedHabitIds,
      milestones,
      completed: goal?.completed ?? false,
    });
    onClose();
  }

  return (
    <BottomSheet open={open} onClose={onClose} ariaLabel={goal ? "Editar meta" : "Nueva meta"} maxWidthClass="max-w-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{goal ? "Editar meta" : "Nueva meta"}</h2>
          <p className="mt-1 text-sm text-gray-500">Define el resultado. Todo lo demás es opcional.</p>
        </div>
        <button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500"><X size={18} /></button>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-[84px_1fr]">
        <label className="block text-sm font-semibold text-gray-700">Icono
          <input value={icon} onChange={(e) => setIcon(e.target.value)} className="mt-2 h-12 w-full rounded-2xl border border-gray-200 px-3 text-center text-xl outline-none" />
        </label>
        <label className="block text-sm font-semibold text-gray-700">Meta
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej. Lanzar versión 2" className="mt-2 h-12 w-full rounded-2xl border border-gray-200 px-4 text-sm font-normal outline-none focus:border-gray-400" />
        </label>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block text-sm font-semibold text-gray-700">Fecha objetivo
          <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} className="mt-2 h-12 w-full rounded-2xl border border-gray-200 bg-white px-3 text-sm font-normal outline-none" />
        </label>
        <label className="block text-sm font-semibold text-gray-700">Proyecto
          <input value={project} onChange={(e) => setProject(e.target.value)} placeholder="Opcional" className="mt-2 h-12 w-full rounded-2xl border border-gray-200 px-3 text-sm font-normal outline-none" />
        </label>
      </div>

      <label className="mt-4 block text-sm font-semibold text-gray-700">Descripción
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-2 min-h-20 w-full resize-none rounded-2xl border border-gray-200 p-4 text-sm font-normal outline-none" placeholder="Qué significa completar esta meta..." />
      </label>

      <section className="mt-5 rounded-2xl bg-gray-50 p-4">
        <p className="text-sm font-semibold text-gray-800">¿Cómo medimos el progreso?</p>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(["combined", "tasks", "habits", "manual"] as GoalProgressMode[]).map((mode) => (
            <button key={mode} type="button" onClick={() => setProgressMode(mode)} className={`rounded-xl border px-3 py-2.5 text-xs font-semibold ${progressMode === mode ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 bg-white text-gray-600"}`}>
              {mode === "combined" ? "Combinado" : mode === "tasks" ? "Tareas" : mode === "habits" ? "Hábitos" : "Manual"}
            </button>
          ))}
        </div>
        {progressMode === "manual" && (
          <div className="mt-4 flex items-center gap-3">
            <input type="range" min="0" max="100" value={manualProgress} onChange={(e) => setManualProgress(Number(e.target.value))} className="min-w-0 flex-1" />
            <span className="w-12 text-right text-sm font-bold text-gray-900">{manualProgress}%</span>
          </div>
        )}
      </section>

      {(progressMode === "tasks" || progressMode === "combined") && (
        <section className="mt-5">
          <p className="text-sm font-semibold text-gray-800">Tareas relacionadas</p>
          <div className="mt-2 max-h-44 space-y-2 overflow-y-auto rounded-2xl border border-gray-200 p-2">
            {tasks.length === 0 ? <p className="p-3 text-sm text-gray-400">No hay tareas todavía.</p> : tasks.map((task) => {
              const selected = linkedTaskIds.includes(task.id);
              return <button key={task.id} type="button" onClick={() => toggleTask(task.id)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left ${selected ? "bg-gray-100" : "hover:bg-gray-50"}`}>
                <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${selected ? "border-gray-900 bg-gray-900 text-white" : "border-gray-300"}`}>{selected && <Check size={13} />}</span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-700">{task.title}</span>
                <span className="text-[11px] text-gray-400">{task.status === "completed" ? "Hecha" : task.status === "backlog" ? "Backlog" : "Activa"}</span>
              </button>;
            })}
          </div>
        </section>
      )}

      {(progressMode === "habits" || progressMode === "combined") && (
        <section className="mt-5">
          <p className="text-sm font-semibold text-gray-800">Hábitos relacionados</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {habits.map((habit) => {
              const selected = linkedHabitIds.includes(habit.id);
              return <button key={habit.id} type="button" onClick={() => toggleHabit(habit.id)} className={`flex items-center gap-3 rounded-2xl border p-3 text-left ${selected ? "border-gray-900 bg-gray-50" : "border-gray-200 bg-white"}`}>
                <span className="text-xl">{habit.icon ?? "🔥"}</span>
                <span className="min-w-0 flex-1 truncate text-sm font-semibold text-gray-700">{habit.title}</span>
                <span className={`flex h-5 w-5 items-center justify-center rounded-md border ${selected ? "border-gray-900 bg-gray-900 text-white" : "border-gray-300"}`}>{selected && <Check size={13} />}</span>
              </button>;
            })}
          </div>
        </section>
      )}

      <section className="mt-5">
        <p className="text-sm font-semibold text-gray-800">Hitos</p>
        {milestones.length > 0 && <div className="mt-2 space-y-2">{milestones.map((item) => (
          <div key={item.id} className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2.5">
            <button type="button" onClick={() => setMilestones((current) => current.map((milestone) => milestone.id === item.id ? { ...milestone, completed: !milestone.completed } : milestone))} className={`flex h-5 w-5 items-center justify-center rounded-md border ${item.completed ? "border-gray-900 bg-gray-900 text-white" : "border-gray-300"}`}>{item.completed && <Check size={13} />}</button>
            <span className={`min-w-0 flex-1 text-sm ${item.completed ? "text-gray-400 line-through" : "text-gray-700"}`}>{item.title}</span>
            <button type="button" onClick={() => setMilestones((current) => current.filter((milestone) => milestone.id !== item.id))} className="text-gray-400"><Trash2 size={15} /></button>
          </div>
        ))}</div>}
        <div className="mt-2 flex gap-2">
          <input value={milestoneTitle} onChange={(e) => setMilestoneTitle(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addMilestone(); } }} placeholder="Agregar hito" className="h-11 min-w-0 flex-1 rounded-xl border border-gray-200 px-3 text-sm outline-none" />
          <button type="button" onClick={addMilestone} className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-gray-700"><Plus size={17} /></button>
        </div>
      </section>

      <button type="button" disabled={!title.trim()} onClick={handleSave} className="mt-6 h-12 w-full rounded-2xl bg-gray-900 px-5 text-sm font-semibold text-white disabled:bg-gray-200 disabled:text-gray-400 sm:ml-auto sm:block sm:w-auto sm:min-w-40">
        {goal ? "Guardar cambios" : "Crear meta"}
      </button>
    </BottomSheet>
  );
}

export type { GoalDraft };
