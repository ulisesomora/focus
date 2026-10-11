import { useEffect, useState } from "react";
import { X } from "lucide-react";

import { useApp } from "../../context/AppContext";
import { areasForSpace } from "../../utils/taskSpaces";
import type { Habit, HabitFrequency, HabitType } from "../../types/habit";
import { BottomSheet } from "../ui/BottomSheet";

export type HabitDraft = {
  spaceId?: string;
  area?: string;
  plannedTime?: string;
  estimatedMinutes?: number;
  title: string;
  icon: string;
  type: HabitType;
  target?: number;
  unit?: string;
  frequency: HabitFrequency;
};

type Props = {
  initialTitle?: string;
  initialSpaceId?: string;
  initialArea?: string;
  initialHabit?: Habit;
  open: boolean;
  onClose: () => void;
  onSave: (habit: HabitDraft) => void;
};

const weekdayOptions = [
  { value: 1, label: "L" },
  { value: 2, label: "M" },
  { value: 3, label: "X" },
  { value: 4, label: "J" },
  { value: 5, label: "V" },
  { value: 6, label: "S" },
  { value: 0, label: "D" },
];

export function HabitEditorSheet({ open, initialTitle = "", initialHabit, initialSpaceId, initialArea, onClose, onSave }: Props) {
  const { settings } = useApp();
  const [spaceId, setSpaceId] = useState("");
  const [area, setArea] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState(30);
  const [customDuration, setCustomDuration] = useState(false);
  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState("✨");
  const [type, setType] = useState<HabitType>("complete");
  const [target, setTarget] = useState(1);
  const [unit, setUnit] = useState("");
  const [frequencyType, setFrequencyType] = useState<HabitFrequency["type"]>("daily");
  const [specificDays, setSpecificDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [timesPerWeek, setTimesPerWeek] = useState(3);

  useEffect(() => {
    if (!open) return;
    setTitle(initialHabit?.title ?? initialTitle);
    setIcon(initialHabit?.icon ?? "✨"); setType(initialHabit?.type ?? "complete");
    setTarget(initialHabit?.target ?? 1); setUnit(initialHabit?.unit ?? "");
    setFrequencyType(initialHabit?.frequency.type ?? "daily");
    setSpecificDays(initialHabit?.frequency.type === "specific_days" ? initialHabit.frequency.days : [1,2,3,4,5]);
    setTimesPerWeek(initialHabit?.frequency.type === "times_per_week" ? initialHabit.frequency.times : 3);
    setSpaceId(initialHabit?.spaceId ?? initialSpaceId ?? ""); setArea(initialHabit?.area ?? initialArea ?? "");
    setTime(initialHabit?.plannedTime ?? ""); setDuration(initialHabit?.type === "time" ? initialHabit.target ?? initialHabit.estimatedMinutes ?? 30 : initialHabit?.estimatedMinutes ?? 30);
    setCustomDuration(!!initialHabit?.estimatedMinutes && ![15, 30, 60, 120].includes(initialHabit.estimatedMinutes));
  }, [open, initialTitle, initialHabit, initialSpaceId, initialArea]);

  function handleSave() {
    const clean = title.trim();
    if (!clean) return;

    const frequency: HabitFrequency =
      frequencyType === "daily"
        ? { type: "daily" }
        : frequencyType === "specific_days"
          ? { type: "specific_days", days: specificDays.length ? specificDays : [1] }
          : { type: "times_per_week", times: Math.max(1, Math.min(7, timesPerWeek)) };

    onSave({
      spaceId: spaceId || undefined, area: area || undefined,
      plannedTime: type === "time" ? time || undefined : undefined,
      estimatedMinutes: type === "time" ? Math.max(1, Math.min(1440, duration || 30)) : undefined,
      title: clean,
      icon: icon.trim() || "✨",
      type,
      frequency,
      target: type === "time" ? Math.max(1, Math.min(1440, duration || 30)) : type === "quantity" ? Math.max(1, target) : undefined,
      unit: type === "time" ? "min" : type === "quantity" ? unit.trim() || "veces" : undefined,
    });

    reset();
    onClose();
  }

  function reset() {
    setTitle("");
    setIcon("✨");
    setType("complete");
    setTarget(1);
    setUnit("");
    setFrequencyType("daily");
    setSpecificDays([1, 2, 3, 4, 5]);
    setTimesPerWeek(3);
  }

  function toggleDay(day: number) {
    setSpecificDays((current) =>
      current.includes(day) ? current.filter((item) => item !== day) : [...current, day],
    );
  }

  return (
    <BottomSheet open={open} onClose={onClose} ariaLabel={initialHabit ? "Editar hábito" : "Crear hábito"} maxWidthClass="max-w-xl">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-gray-400">{initialHabit ? "Hábito" : "Nuevo hábito"}</p>
          <h2 className="mt-1 text-xl font-bold text-gray-900">{initialHabit ? "Editar hábito" : "Crear hábito"}</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500"
          aria-label="Cerrar"
        >
          <X size={18} />
        </button>
      </div>

      <label className="block text-sm font-semibold text-gray-700">Nombre</label>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Ej. Leer"
        className="mt-2 h-12 w-full rounded-2xl border border-gray-200 px-4 outline-none focus:border-gray-400"
      />

      <div className="mt-4 grid grid-cols-2 gap-3">
        <label className="text-sm font-semibold">Espacio<select value={spaceId} onChange={e => { setSpaceId(e.target.value); setArea(""); }} className="mt-2 w-full rounded-xl border p-2"><option value="">General</option>{settings.spaces?.map(space => <option key={space.id} value={space.id}>{space.name}</option>)}</select></label>
        <label className="text-sm font-semibold">Área<select value={area} onChange={e => setArea(e.target.value)} className="mt-2 w-full rounded-xl border p-2"><option value="">Sin área</option>{areasForSpace(settings, spaceId || undefined).map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      </div>
      <label className="mt-5 block text-sm font-semibold text-gray-700">Icono</label>
      <input
        value={icon}
        onChange={(e) => setIcon(e.target.value)}
        className="mt-2 h-12 w-24 rounded-2xl border border-gray-200 px-4 text-center text-xl outline-none focus:border-gray-400"
      />

      <p className="mt-5 text-sm font-semibold text-gray-700">Tipo</p>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {([
          ["complete", "Completar"],
          ["quantity", "Cantidad"],
          ["time", "Tiempo"],
        ] as const).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setType(value)}
            className={`h-11 rounded-xl border px-3 text-sm font-semibold ${
              type === value
                ? "border-gray-900 bg-gray-900 text-white"
                : "border-gray-200 bg-white text-gray-600"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {type === "time" && <div className="mt-4 grid grid-cols-2 gap-3">
        <label className="text-sm font-semibold">Hora (opcional)<input type="time" value={time} onChange={e => setTime(e.target.value)} className="mt-2 w-full rounded-xl border p-2" /></label>
        <div className="col-span-2">
          <p className="text-sm font-semibold">Duración</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {[15, 30, 60, 120].map(minutes => <button key={minutes} type="button" aria-pressed={!customDuration && duration === minutes} onClick={() => { setDuration(minutes); setCustomDuration(false); }} className={`rounded-lg border px-2.5 py-2 text-xs font-semibold ${!customDuration && duration === minutes ? "border-indigo-600 bg-indigo-600 text-white" : "border-gray-200 text-gray-600"}`}>{minutes < 60 ? `${minutes} min` : `${minutes / 60} h`}</button>)}
            <button type="button" aria-pressed={customDuration} onClick={() => setCustomDuration(true)} className={`rounded-lg border px-2.5 py-2 text-xs font-semibold ${customDuration ? "border-indigo-600 bg-indigo-600 text-white" : "border-gray-200 text-gray-600"}`}>Elegir tiempo</button>
          </div>
          {customDuration && <label className="mt-2 flex items-center gap-2 text-xs text-gray-500"><input aria-label="Duración del hábito en minutos" type="number" min={1} max={1440} value={duration} onChange={e => setDuration(Number(e.target.value))} className="w-24 rounded-lg border p-2" /> minutos</label>}
        </div>

      {time && <button type="button" onClick={() => setTime("")} className="col-span-2 text-left text-xs text-gray-500">Quitar horario</button>}
      </div>}

      {type === "quantity" && (
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-semibold text-gray-700">Meta</label>
            <input
              type="number"
              min={1}
              value={target}
              onChange={(e) => setTarget(Number(e.target.value))}
              className="mt-2 h-12 w-full rounded-2xl border border-gray-200 px-4 outline-none focus:border-gray-400"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700">Unidad</label>
            <input
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder={defaultUnit(type)}
              className="mt-2 h-12 w-full rounded-2xl border border-gray-200 px-4 outline-none focus:border-gray-400"
            />
          </div>
        </div>
      )}

      <p className="mt-6 text-sm font-semibold text-gray-700">Frecuencia</p>
      <div className="mt-2 grid gap-2 sm:grid-cols-3">
        {([
          ["daily", "Todos los días"],
          ["specific_days", "Días específicos"],
          ["times_per_week", "X veces / semana"],
        ] as const).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setFrequencyType(value)}
            className={`min-h-11 rounded-xl border px-3 py-2 text-sm font-semibold ${
              frequencyType === value
                ? "border-gray-900 bg-gray-900 text-white"
                : "border-gray-200 bg-white text-gray-600"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {frequencyType === "specific_days" && (
        <div className="mt-4 flex flex-wrap gap-2">
          {weekdayOptions.map((day) => {
            const active = specificDays.includes(day.value);
            return (
              <button
                key={day.value}
                type="button"
                onClick={() => toggleDay(day.value)}
                className={`h-10 w-10 rounded-full text-sm font-semibold ${
                  active ? "bg-gray-900 text-white" : "border border-gray-200 bg-white text-gray-500"
                }`}
              >
                {day.label}
              </button>
            );
          })}
        </div>
      )}

      {frequencyType === "times_per_week" && (
        <div className="mt-4 max-w-44">
          <label className="text-sm font-semibold text-gray-700">Veces por semana</label>
          <input
            type="number"
            min={1}
            max={7}
            value={timesPerWeek}
            onChange={(e) => setTimesPerWeek(Number(e.target.value))}
            className="mt-2 h-12 w-full rounded-2xl border border-gray-200 px-4 outline-none focus:border-gray-400"
          />
        </div>
      )}


      <div className="mt-7 flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={!title.trim() || (frequencyType === "specific_days" && !specificDays.length)}
          className="h-11 rounded-xl bg-gray-900 px-5 text-sm font-semibold text-white disabled:bg-gray-200 disabled:text-gray-400 sm:min-w-36"
        >
          {initialHabit ? "Guardar cambios" : "Crear hábito"}
        </button>
      </div>
    </BottomSheet>
  );
}

function defaultUnit(type: HabitType) {
  return type === "time" ? "min" : "veces";
}
