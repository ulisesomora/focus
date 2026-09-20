import {
  CalendarDays,
  Clock3,
  ListTodo,
  MoreHorizontal,
  Plus,
  Trash2,
  Zap,
} from "lucide-react";
import { useState, type ReactNode } from "react";

import { MobileLayout } from "../components/layout/MobileLayout";
import { RemindLaterSheet } from "../components/capture/RemindLaterSheet";
import { TaskPlannerSheet } from "../components/tasks/TaskPlannerSheet";
import { useApp } from "../context/AppContext";

export function InboxPage() {
  const {
    captures,
    snoozedCount,
    removeCapture,
    snoozeCapture,
    processCapture,
    processCapturePlanned,
  } = useApp();
  const [menuId, setMenuId] = useState<string | null>(null);
  const [reminderId, setReminderId] = useState<string | null>(null);
  const [plannerId, setPlannerId] = useState<string | null>(null);

  const reminderCapture = captures.find((capture) => capture.id === reminderId);
  const plannerCapture = captures.find((capture) => capture.id === plannerId);

  function confirmDelete(id: string) {
    const capture = captures.find((item) => item.id === id);
    if (!capture) return;

    if (window.confirm(`¿Eliminar “${capture.title}”? Esta acción no se puede deshacer.`)) {
      removeCapture(id);
      setMenuId(null);
    }
  }

  return (
    <MobileLayout>
      <header className="mb-6 lg:max-w-3xl">
        <h1 className="text-2xl font-bold text-gray-900">
          Inbox
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          {captures.length === 0
            ? "Todo está organizado."
            : `${captures.length} ${
                captures.length === 1
                  ? "cosa sin organizar"
                  : "cosas sin organizar"
              }`}
        </p>
      </header>

      {snoozedCount > 0 && (
        <div className="mb-4 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 lg:max-w-3xl">
          <p className="text-sm font-semibold text-amber-800">
            {snoozedCount} {snoozedCount === 1 ? "captura pospuesta" : "capturas pospuestas"}
          </p>
          <p className="mt-1 text-xs leading-5 text-amber-700">
            Volverán automáticamente al Inbox cuando llegue su recordatorio.
          </p>
        </div>
      )}

      {captures.length > 0 ? (
        <>
          <div className="rounded-2xl border border-gray-200 bg-white lg:max-w-3xl">
            {captures.map(
              (capture, index) => (
                <div
                  key={capture.id}
                  className={`relative ${
                    index !==
                    captures.length - 1
                      ? "border-b border-gray-100"
                      : ""
                  }`}
                >
                  <div className="flex items-start gap-3 rounded-2xl bg-white px-4 py-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900">{capture.title}</p>

                      <p className="mt-1 text-xs text-gray-400">
                        {formatTime(capture.createdAt)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setMenuId((current) => current === capture.id ? null : capture.id)}
                      aria-label={`Opciones de ${capture.title}`}
                      aria-expanded={menuId === capture.id}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                    >
                      <MoreHorizontal size={19} />
                    </button>
                  </div>

                  {menuId === capture.id && (
                    <div className="mx-3 mb-3 grid grid-cols-2 gap-2 rounded-2xl bg-gray-50 p-2 sm:grid-cols-5">
                      <MenuButton icon={<Zap size={17} />} label="Hacer hoy" onClick={() => processCapture(capture.id, "today")} />
                      <MenuButton icon={<ListTodo size={17} />} label="Backlog" onClick={() => processCapture(capture.id, "backlog")} />
                      <MenuButton
                        icon={<CalendarDays size={17} />}
                        label="Planificar"
                        onClick={() => {
                          setPlannerId(capture.id);
                          setMenuId(null);
                        }}
                      />
                      <MenuButton
                        icon={<Clock3 size={17} />}
                        label="Recordar"
                        onClick={() => {
                          setReminderId(capture.id);
                          setMenuId(null);
                        }}
                      />
                      <MenuButton icon={<Trash2 size={17} />} label="Eliminar" danger onClick={() => confirmDelete(capture.id)} />
                    </div>
                  )}
                </div>
              ),
            )}
          </div>
        </>
      ) : (
        <InboxEmpty />
      )}

      <RemindLaterSheet
        open={Boolean(reminderCapture)}
        title={reminderCapture?.title ?? ""}
        onClose={() => setReminderId(null)}
        onSave={(date) => {
          if (reminderId) snoozeCapture(reminderId, date);
          setReminderId(null);
        }}
      />

      <TaskPlannerSheet
        open={Boolean(plannerCapture)}
        title={plannerCapture?.title ?? ""}
        onClose={() => setPlannerId(null)}
        onSave={(plan) => {
          if (plannerId) processCapturePlanned(plannerId, plan);
          setPlannerId(null);
        }}
      />
    </MobileLayout>
  );
}

type MenuButtonProps = {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
};

function MenuButton({ icon, label, onClick, danger = false }: MenuButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition hover:bg-gray-50 ${
        danger ? "text-red-600" : "text-gray-700"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function InboxEmpty() {
  return (
    <div className="flex min-h-[55vh] flex-col items-center justify-center text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 text-green-600">
        ✓
      </div>

      <h2 className="mt-5 text-xl font-bold text-gray-900">
        Inbox en orden
      </h2>

      <p className="mt-2 max-w-xs text-sm leading-6 text-gray-500">
        No tienes nada pendiente por
        organizar.
      </p>

      <button
        type="button"
        className="mt-6 flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700"
      >
        <Plus size={17} />
        Capturar algo
      </button>
    </div>
  );
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat(
    "es-MX",
    {
      hour: "numeric",
      minute: "2-digit",
    },
  ).format(date);
}
