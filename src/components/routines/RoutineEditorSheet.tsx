import { useMemo, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, Clock3, Flame, Plus, Trash2, X } from "lucide-react";

import type { Habit } from "../../types/habit";
import type { Routine, RoutineStep, RoutineStepType } from "../../types/routine";
import { BottomSheet } from "../ui/BottomSheet";

export type RoutineDraft = Omit<Routine, "id">;

type RoutineEditorSheetProps = {
  open: boolean;
  habits: Habit[];
  initialValue?: Routine;
  onClose: () => void;
  onSave: (value: RoutineDraft) => void;
};

const weekDays = [
  { value: 1, label: "L" },
  { value: 2, label: "M" },
  { value: 3, label: "X" },
  { value: 4, label: "J" },
  { value: 5, label: "V" },
  { value: 6, label: "S" },
  { value: 0, label: "D" },
];

export function RoutineEditorSheet({ open, habits, initialValue, onClose, onSave }: RoutineEditorSheetProps) {
  const [title, setTitle] = useState(initialValue?.title ?? "");
  const [icon, setIcon] = useState(initialValue?.icon ?? "☀️");
  const [days, setDays] = useState<number[]>(initialValue?.days ?? [1, 2, 3, 4, 5]);
  const [recommendedTime, setRecommendedTime] = useState(initialValue?.recommendedTime ?? "07:00");
  const [steps, setSteps] = useState<RoutineStep[]>(initialValue?.steps ?? []);
  const [stepType, setStepType] = useState<RoutineStepType>("action");
  const [stepTitle, setStepTitle] = useState("");
  const [habitId, setHabitId] = useState(habits[0]?.id ?? "");
  const [duration, setDuration] = useState(10);

  const canSave = title.trim() && steps.length > 0;

  const selectedHabit = useMemo(
    () => habits.find((habit) => habit.id === habitId),
    [habits, habitId],
  );

  function toggleDay(day: number) {
    setDays((current) =>
      current.includes(day) ? current.filter((item) => item !== day) : [...current, day],
    );
  }

  function addStep() {
    const newStep: RoutineStep = {
      id: crypto.randomUUID(),
      type: stepType,
      title:
        stepType === "habit"
          ? selectedHabit?.title ?? "Hábito"
          : stepTitle.trim() || (stepType === "timer" ? "Temporizador" : "Nueva acción"),
      ...(stepType === "habit" ? { habitId } : {}),
      ...(stepType === "timer" ? { durationMinutes: Math.max(1, duration) } : {}),
    };

    setSteps((current) => [...current, newStep]);
    setStepTitle("");
  }

  function moveStep(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= steps.length) return;
    setSteps((current) => {
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function handleSave() {
    if (!canSave) return;
    onSave({
      title: title.trim(),
      icon: icon.trim() || "✨",
      days,
      recommendedTime: recommendedTime || undefined,
      steps,
    });
    onClose();
  }

  return (
    <BottomSheet open={open} onClose={onClose} ariaLabel="Crear rutina" maxWidthClass="max-w-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-gray-400">Rutina</p>
          <h2 className="mt-2 text-xl font-bold text-gray-900">{initialValue ? "Editar rutina" : "Nueva rutina"}</h2>
          <p className="mt-1 text-sm text-gray-500">Combina hábitos, acciones simples y temporizadores.</p>
        </div>
        <button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500">
          <X size={18} />
        </button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-[88px_1fr]">
        <label>
          <span className="text-sm font-semibold text-gray-700">Icono</span>
          <input value={icon} onChange={(e) => setIcon(e.target.value)} className="mt-2 h-12 w-full rounded-2xl border border-gray-200 px-4 text-center text-xl outline-none focus:border-gray-400" />
        </label>
        <label>
          <span className="text-sm font-semibold text-gray-700">Nombre</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej. Rutina de mañana" className="mt-2 h-12 w-full rounded-2xl border border-gray-200 px-4 outline-none focus:border-gray-400" />
        </label>
      </div>

      <div className="mt-5">
        <p className="text-sm font-semibold text-gray-700">Días</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {weekDays.map((day) => (
            <button key={day.value} type="button" onClick={() => toggleDay(day.value)} className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-semibold ${days.includes(day.value) ? "bg-gray-900 text-white" : "border border-gray-200 bg-white text-gray-500"}`}>
              {day.label}
            </button>
          ))}
        </div>
      </div>

      <label className="mt-5 block sm:max-w-[180px]">
        <span className="text-sm font-semibold text-gray-700">Hora recomendada</span>
        <input type="time" value={recommendedTime} onChange={(e) => setRecommendedTime(e.target.value)} className="mt-2 h-12 w-full rounded-2xl border border-gray-200 px-4 outline-none focus:border-gray-400" />
      </label>

      <div className="mt-7 border-t border-gray-100 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900">Pasos</h3>
            <p className="mt-1 text-xs text-gray-500">Se ejecutarán en este orden.</p>
          </div>
          <span className="text-sm font-semibold text-gray-500">{steps.length}</span>
        </div>

        <div className="mt-4 space-y-2">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-sm font-bold text-gray-500">{index + 1}</div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-900">{step.title}</p>
                <p className="mt-0.5 text-xs text-gray-400">{step.type === "habit" ? "Hábito" : step.type === "timer" ? `${step.durationMinutes} min` : "Acción"}</p>
              </div>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => moveStep(index, -1)} className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-50"><ArrowUp size={15} /></button>
                <button type="button" onClick={() => moveStep(index, 1)} className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-50"><ArrowDown size={15} /></button>
                <button type="button" onClick={() => setSteps((current) => current.filter((item) => item.id !== step.id))} className="flex h-8 w-8 items-center justify-center rounded-lg text-red-400 hover:bg-red-50"><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-2xl bg-gray-50 p-4">
          <div className="flex flex-wrap gap-2">
            <TypeButton active={stepType === "action"} label="Acción" onClick={() => setStepType("action")} />
            <TypeButton active={stepType === "habit"} label="Hábito" icon={<Flame size={15} />} onClick={() => setStepType("habit")} />
            <TypeButton active={stepType === "timer"} label="Temporizador" icon={<Clock3 size={15} />} onClick={() => setStepType("timer")} />
          </div>

          {stepType === "habit" ? (
            <select value={habitId} onChange={(e) => setHabitId(e.target.value)} className="mt-3 h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-gray-400">
              {habits.map((habit) => <option key={habit.id} value={habit.id}>{habit.icon} {habit.title}</option>)}
            </select>
          ) : (
            <input value={stepTitle} onChange={(e) => setStepTitle(e.target.value)} placeholder={stepType === "timer" ? "Ej. Meditar" : "Ej. Tender la cama"} className="mt-3 h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-gray-400" />
          )}

          {stepType === "timer" && (
            <label className="mt-3 block max-w-[180px]">
              <span className="text-xs font-semibold text-gray-500">Duración (min)</span>
              <input type="number" min={1} value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="mt-1 h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-gray-400" />
            </label>
          )}

          <button type="button" onClick={addStep} disabled={stepType === "habit" && !habitId} className="mt-3 flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-gray-700 shadow-sm disabled:opacity-40">
            <Plus size={16} /> Agregar paso
          </button>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button type="button" onClick={handleSave} disabled={!canSave} className="h-11 rounded-xl bg-gray-900 px-5 text-sm font-semibold text-white disabled:bg-gray-200 disabled:text-gray-400">
          {initialValue ? "Guardar cambios" : "Crear rutina"}
        </button>
      </div>
    </BottomSheet>
  );
}

function TypeButton({ active, label, icon, onClick }: { active: boolean; label: string; icon?: ReactNode; onClick: () => void }) {
  return <button type="button" onClick={onClick} className={`flex h-9 items-center gap-2 rounded-xl px-3 text-xs font-semibold ${active ? "bg-gray-900 text-white" : "bg-white text-gray-500"}`}>{icon}{label}</button>;
}
