import {
  CheckCircle2,
  Circle,
  CirclePause,
  Clock3,
  Play,
} from "lucide-react";

import type { TaskStatus } from "../../types/task";
import { BottomSheet } from "../ui/BottomSheet";

type TaskStatusSheetProps = {
  open: boolean;
  currentStatus: TaskStatus;
  onClose: () => void;
  onSelect: (status: TaskStatus) => void;
};

const options: Array<{
  status: TaskStatus;
  label: string;
  description: string;
  icon: typeof Circle;
}> = [
  {
    status: "pending",
    label: "Pendiente",
    description: "Lista para comenzar.",
    icon: Circle,
  },
  {
    status: "in_progress",
    label: "En proceso",
    description: "La estás trabajando actualmente.",
    icon: Play,
  },
  {
    status: "paused",
    label: "En pausa",
    description: "Detenida temporalmente.",
    icon: CirclePause,
  },
  {
    status: "review",
    label: "En revisión",
    description: "Esperando validación o revisión.",
    icon: Clock3,
  },
  {
    status: "completed",
    label: "Finalizado",
    description: "Trabajo terminado.",
    icon: CheckCircle2,
  },
];

export function TaskStatusSheet({
  open,
  currentStatus,
  onClose,
  onSelect,
}: TaskStatusSheetProps) {
  return (
    <BottomSheet open={open} onClose={onClose} ariaLabel="Cambiar estado">
      <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-gray-200" />
      <h2 className="text-xl font-bold text-gray-900">Mover tarea</h2>
      <p className="mt-1 text-sm text-gray-500">
        Selecciona la etapa a la que quieres moverla.
      </p>

      <div className="mt-5 space-y-2">
        {options.map((option) => {
          const Icon = option.icon;
          const active = option.status === currentStatus;
          const pauseNeedsActiveWork =
            option.status === "paused" && currentStatus !== "in_progress" && currentStatus !== "paused";

          return (
            <button
              key={option.status}
              type="button"
              onClick={() => {
                if (pauseNeedsActiveWork) return;
                onSelect(option.status);
                onClose();
              }}
              disabled={pauseNeedsActiveWork}
              className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left disabled:cursor-not-allowed disabled:opacity-45 ${
                active
                  ? "border-gray-900 bg-gray-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
                <Icon size={19} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-900">{option.label}</p>
                <p className="mt-1 text-xs text-gray-500">
                  {pauseNeedsActiveWork
                    ? "Primero inicia la tarea; al pausarla podrás indicar el motivo."
                    : option.description}
                </p>
              </div>
              {active && (
                <span className="rounded-full bg-gray-900 px-2.5 py-1 text-[10px] font-bold text-white">
                  Actual
                </span>
              )}
            </button>
          );
        })}
      </div>
    </BottomSheet>
  );
}
