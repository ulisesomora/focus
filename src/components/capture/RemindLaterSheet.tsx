import { useMemo, useState } from "react";
import { CalendarDays, Clock3, X } from "lucide-react";

import { BottomSheet } from "../ui/BottomSheet";

type RemindLaterSheetProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  onSave: (date: Date) => void;
};

type Preset = "tomorrow" | "weekend" | "next_week" | "custom";

export function RemindLaterSheet({
  open,
  title,
  onClose,
  onSave,
}: RemindLaterSheetProps) {
  const [preset, setPreset] = useState<Preset>("tomorrow");
  const [customDate, setCustomDate] = useState(getTomorrowDateKey());
  const [time, setTime] = useState("09:00");

  const previewDate = useMemo(() => {
    return getReminderDate(preset, customDate, time);
  }, [preset, customDate, time]);

  function handleSave() {
    onSave(previewDate);
    onClose();
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      ariaLabel="Recordar después"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-gray-400">
            Recordar después
          </p>
          <h2 className="mt-2 text-xl font-bold text-gray-900">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            La captura desaparecerá temporalmente del Inbox y volverá cuando llegue este momento.
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500"
        >
          <X size={18} />
        </button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-2">
        <PresetButton
          active={preset === "tomorrow"}
          label="Mañana"
          onClick={() => setPreset("tomorrow")}
        />
        <PresetButton
          active={preset === "weekend"}
          label="Este fin"
          onClick={() => setPreset("weekend")}
        />
        <PresetButton
          active={preset === "next_week"}
          label="Próxima semana"
          onClick={() => setPreset("next_week")}
        />
        <PresetButton
          active={preset === "custom"}
          label="Elegir fecha"
          onClick={() => setPreset("custom")}
        />
      </div>

      {preset === "custom" && (
        <div className="mt-5">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <CalendarDays size={17} />
            Día
          </label>
          <input
            type="date"
            value={customDate}
            min={getTodayDateKey()}
            onChange={(event) => setCustomDate(event.target.value)}
            className="mt-2 h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm text-gray-900 outline-none focus:border-gray-400"
          />
        </div>
      )}

      <div className="mt-5">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Clock3 size={17} />
          Hora
        </label>
        <input
          type="time"
          value={time}
          onChange={(event) => setTime(event.target.value)}
          className="mt-2 h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm text-gray-900 outline-none focus:border-gray-400"
        />
      </div>

      <div className="mt-5 rounded-2xl bg-gray-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          Volverá al Inbox
        </p>
        <p className="mt-1 font-semibold text-gray-900">
          {formatReminder(previewDate)}
        </p>
      </div>

      <button
        type="button"
        onClick={handleSave}
        className="mt-6 h-12 w-full rounded-2xl bg-gray-900 text-sm font-semibold text-white"
      >
        Recordarme después
      </button>
    </BottomSheet>
  );
}

type PresetButtonProps = {
  active: boolean;
  label: string;
  onClick: () => void;
};

function PresetButton({ active, label, onClick }: PresetButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-11 rounded-xl border text-sm font-semibold transition ${
        active
          ? "border-gray-900 bg-gray-900 text-white"
          : "border-gray-200 bg-white text-gray-600"
      }`}
    >
      {label}
    </button>
  );
}

function getReminderDate(preset: Preset, customDate: string, time: string) {
  const now = new Date();
  let target = new Date(now);

  if (preset === "tomorrow") {
    target.setDate(target.getDate() + 1);
  } else if (preset === "weekend") {
    const day = target.getDay();
    const daysUntilSaturday = day === 6 ? 7 : (6 - day + 7) % 7;
    target.setDate(target.getDate() + (daysUntilSaturday || 7));
  } else if (preset === "next_week") {
    const day = target.getDay();
    const daysUntilNextMonday = ((8 - day) % 7) || 7;
    target.setDate(target.getDate() + daysUntilNextMonday);
  } else {
    const [year, month, day] = customDate.split("-").map(Number);
    target = new Date(year, month - 1, day);
  }

  const [hours, minutes] = time.split(":").map(Number);
  target.setHours(hours || 0, minutes || 0, 0, 0);

  return target;
}

function formatReminder(date: Date) {
  return new Intl.DateTimeFormat("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function getTodayDateKey() {
  return toLocalDateKey(new Date());
}

function getTomorrowDateKey() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return toLocalDateKey(tomorrow);
}

function toLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
