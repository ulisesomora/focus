import { useEffect, useState } from "react";
import { X } from "lucide-react";

import type { HabitFrequency, HabitType } from "../../types/habit";
import { BottomSheet } from "../ui/BottomSheet";

export type HabitDraft = {
  title: string;
  icon: string;
  type: HabitType;
  target?: number;
  unit?: string;
  frequency: HabitFrequency;
};

type Props = {
  initialTitle?: string;
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

export function HabitEditorSheet({ open, initialTitle = "", onClose, onSave }: Props) {
  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState("✨");
  const [type, setType] = useState<HabitType>("complete");
  const [target, setTarget] = useState(1);
  const [unit, setUnit] = useState("");
  const [frequencyType, setFrequencyType] = useState<HabitFrequency["type"]>("daily");
  const [specificDays, setSpecificDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [timesPerWeek, setTimesPerWeek] = useState(3);

  useEffect(() => { if (open) setTitle(initialTitle); }, [open, initialTitle]);

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
      title: clean,
      icon: icon.trim() || "✨",
      type,
      frequency,
      ...(type !== "complete"
        ? {
            target: Math.max(1, target),
            unit: unit.trim() || defaultUnit(type),
          }
        : {}),
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
    <BottomSheet open={open} onClose={onClose} ariaLabel="Crear hábito" maxWidthClass="max-w-xl">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Nuevo hábito</p>
          <h2 className="mt-1 text-xl font-bold text-gray-900">Crear hábito</h2>
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

      {type !== "complete" && (
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
          disabled={!title.trim()}
          className="h-11 rounded-xl bg-gray-900 px-5 text-sm font-semibold text-white disabled:bg-gray-200 disabled:text-gray-400 sm:min-w-36"
        >
          Crear hábito
        </button>
      </div>
    </BottomSheet>
  );
}

function defaultUnit(type: HabitType) {
  return type === "time" ? "min" : "veces";
}
