import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock3, TimerReset } from "lucide-react";

import { BottomSheet } from "../ui/BottomSheet";
import { useApp } from "../../context/AppContext";

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

const durations = [30, 60, 90, 120];

export function TaskPlannerSheet({
  open,
  title,
  initialDate,
  initialTime,
  initialDuration,
  onClose,
  onSave,
}: TaskPlannerSheetProps) {
  const { settings } = useApp();
  const defaultDate = useMemo(() => initialDate ?? getLocalDateKey(), [initialDate]);
  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState(initialTime ?? "");
  const [duration, setDuration] = useState<number | undefined>(initialDuration ?? settings.defaultPlanningMinutes);

  useEffect(() => {
    if (!open) return;
    setDate(initialDate ?? getLocalDateKey());
    setTime(initialTime ?? "");
    setDuration(initialDuration ?? settings.defaultPlanningMinutes);
  }, [open, initialDate, initialTime, initialDuration, settings.defaultPlanningMinutes]);

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

      <div className="mt-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <TimerReset size={17} /> Duración estimada
        </div>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {durations.map((minutes) => (
            <button
              key={minutes}
              type="button"
              onClick={() => setDuration(minutes)}
              className={`h-10 rounded-xl text-xs font-semibold transition ${
                duration === minutes
                  ? "bg-gray-900 text-white"
                  : "border border-gray-200 bg-white text-gray-600"
              }`}
            >
              {formatDuration(minutes)}
            </button>
          ))}
        </div>
        {duration && (
          <button
            type="button"
            onClick={() => setDuration(undefined)}
            className="mt-2 text-xs font-semibold text-gray-400"
          >
            Quitar duración
          </button>
        )}
      </div>

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

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes}m`;
  if (minutes % 60 === 0) return `${minutes / 60}h`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

function getLocalDateKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
