import type { ReactNode } from "react";
import { useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  ListTodo,
  Trash2,
  Zap,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import { MobileLayout } from "../components/layout/MobileLayout";
import { TaskPlannerSheet } from "../components/tasks/TaskPlannerSheet";
import { RemindLaterSheet } from "../components/capture/RemindLaterSheet";
import { useApp } from "../context/AppContext";

export function ProcessInboxPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    captures,
    processCapture,
    processCapturePlanned,
    removeCapture,
    snoozeCapture,
  } = useApp();
  const [plannerOpen, setPlannerOpen] = useState(false);
  const [reminderOpen, setReminderOpen] = useState(false);

  const selectedIds = (location.state as { selectedIds?: string[] } | null)?.selectedIds;
  const processingCaptures = selectedIds?.length
    ? selectedIds
        .map((id) => captures.find((capture) => capture.id === id))
        .filter((capture): capture is (typeof captures)[number] => Boolean(capture))
    : captures;
  const current = processingCaptures[0];
  const total = processingCaptures.length;

  if (!current) {
    const hasRemainingCaptures = captures.length > 0;

    return (
      <MobileLayout>
        <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 text-2xl text-green-600">
            ✓
          </div>
          <h1 className="mt-5 text-xl font-bold text-gray-900">
            {hasRemainingCaptures ? "Selección procesada" : "Inbox en orden"}
          </h1>
          <p className="mt-2 max-w-xs text-sm leading-6 text-gray-500">
            {hasRemainingCaptures
              ? "Terminaste las capturas que habías seleccionado."
              : "Ya procesaste todo lo que tenías pendiente."}
          </p>
          <button
            type="button"
            onClick={() => navigate(hasRemainingCaptures ? "/inbox" : "/")}
            className="mt-6 h-11 rounded-xl bg-gray-900 px-5 text-sm font-semibold text-white"
          >
            {hasRemainingCaptures ? "Volver al Inbox" : "Volver a Hoy"}
          </button>
        </div>
      </MobileLayout>
    );
  }

  return (
    <>
      <MobileLayout>
        <header className="mb-8 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/inbox")}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-700 shadow-sm ring-1 ring-gray-200"
          >
            <ArrowLeft size={19} />
          </button>

          <div className="text-center">
            <h1 className="font-semibold text-gray-900">Procesar Inbox</h1>
            <p className="text-xs text-gray-400">{total} por organizar</p>
          </div>

          <div className="h-10 w-10" />
        </header>

        <section className="rounded-3xl border border-gray-200 bg-white p-6 text-center shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
            Captura actual
          </p>
          <h2 className="mt-5 text-2xl font-bold leading-8 text-gray-900">
            {current.title}
          </h2>
          <p className="mt-2 text-sm text-gray-400">¿Qué quieres hacer con esto?</p>
        </section>

        <div className="mt-6 space-y-3 lg:grid lg:max-w-3xl lg:grid-cols-2 lg:gap-3 lg:space-y-0">
          <ActionButton
            icon={<Zap size={19} />}
            title="Hacer hoy"
            description="Conviértela en una tarea pendiente para hoy."
            onClick={() => processCapture(current.id, "today")}
          />

          <ActionButton
            icon={<ListTodo size={19} />}
            title="Enviar a Backlog"
            description="Guárdala como tarea sin fecha para organizar después."
            onClick={() => processCapture(current.id, "backlog")}
          />

          <ActionButton
            icon={<CalendarDays size={19} />}
            title="Planificar"
            description="Elige el día, la hora y una duración estimada."
            onClick={() => setPlannerOpen(true)}
          />

          <ActionButton
            icon={<Clock3 size={19} />}
            title="Recordar después"
            description="Ocúltala temporalmente y haz que vuelva al Inbox más adelante."
            onClick={() => setReminderOpen(true)}
          />
        </div>

        <button
          type="button"
          onClick={() => removeCapture(current.id)}
          className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-red-500 lg:w-auto lg:px-4"
        >
          <Trash2 size={17} />
          Descartar captura
        </button>
      </MobileLayout>

      <TaskPlannerSheet
        open={plannerOpen}
        title={current.title}
        onClose={() => setPlannerOpen(false)}
        onSave={(plan) => processCapturePlanned(current.id, plan)}
      />

      <RemindLaterSheet
        open={reminderOpen}
        title={current.title}
        onClose={() => setReminderOpen(false)}
        onSave={(date) => snoozeCapture(current.id, date)}
      />
    </>
  );
}

type ActionButtonProps = {
  icon: ReactNode;
  title: string;
  description: string;
  onClick?: () => void;
  disabled?: boolean;
};

function ActionButton({
  icon,
  title,
  description,
  onClick,
  disabled = false,
}: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 text-left transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-45"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-gray-900">{title}</p>
        <p className="mt-1 text-xs leading-5 text-gray-500">{description}</p>
      </div>
    </button>
  );
}
