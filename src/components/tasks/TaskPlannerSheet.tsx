import { DurationPicker } from "./TaskDuration";
import { useTaskDays } from "../../utils/taskDays";
import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock3 } from "lucide-react";

import { BottomSheet } from "../ui/BottomSheet";

type TaskPlannerSheetProps = {
  open: boolean;
  title: string;
  initialDate?: string;
  initialTime?: string;
  initialDuration?: number;
  onClose: () => void;
  onSave: (value: {
    plannedDate: string;
    plannedTime?: string;
    estimatedMinutes?: number;
  }) => void;
};

export function TaskPlannerSheet({
  open,
  title,
  initialDate,
  initialTime,
  initialDuration,
  onClose,
  onSave,
}: TaskPlannerSheetProps) {
  const { today, tomorrow } = useTaskDays();
  const defaultDate = useMemo(() => initialDate ?? getLocalDateKey(), [initialDate]);
  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState(initialTime ?? "");
  const [duration, setDuration] = useState<number | undefined>(initialDuration);

  useEffect(() => {
    if (!open) return;
    setDate(initialDate ?? getLocalDateKey());
    setTime(initialTime ?? "");
    setDuration(initialDuration);
  }, [open, initialDate, initialTime, initialDuration]);

  function handleSave() {
    onSave({
      plannedDate: date,
      plannedTime: time || undefined,
      estimatedMinutes: duration,
    });
    onClose();
  }

  return (
    <BottomSheet open={open} onClose={onClose} ariaLabel="Planificar tarea">
      <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
        Planificar
      </p>
      <h2 className="mt-1 text-xl font-bold text-gray-900">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-gray-500">
        Esto indica cuándo quieres trabajar en la tarea. No es su fecha límite.
      </p>

      <label className="mt-6 block text-sm font-semibold text-gray-700">
        <span className="flex items-center gap-2">
          <CalendarDays size={17} /> Día
        </span>
      </label>
      <div className="mt-2 flex gap-2">
        {[["Hoy", today], ["Mañana", tomorrow]].map(([label, value]) => <button key={label} type="button" onClick={() => setDate(value)} className={`rounded-lg px-3 py-2 text-xs font-semibold ${date === value ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600"}`}>{label}</button>)}
      </div>
      <input
        type="date"
        value={date}
        onChange={(event) => setDate(event.target.value)}
        className="mt-2 h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm text-gray-900 outline-none focus:border-gray-400"
      />

      <label className="mt-5 block text-sm font-semibold text-gray-700">
        <span className="flex items-center gap-2">
          <Clock3 size={17} /> Hora opcional
        </span>
      </label>
      <input
        type="time"
        value={time}
        onChange={(event) => setTime(event.target.value)}
        className="mt-2 h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm text-gray-900 outline-none focus:border-gray-400"
      />

      <div className="mt-5"><DurationPicker value={duration} onChange={setDuration} /></div>

      <button
        type="button"
        onClick={handleSave}
        disabled={!date}
        className="mt-7 h-12 w-full rounded-2xl bg-gray-900 px-5 text-sm font-semibold text-white disabled:bg-gray-200 disabled:text-gray-400 sm:ml-auto sm:block sm:w-auto sm:min-w-40"
      >
        Guardar planificación
      </button>
    </BottomSheet>
  );
}

function getLocalDateKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
