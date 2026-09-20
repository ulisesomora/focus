import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Flame,
  Inbox,
  ListTodo,
  PauseCircle,
  RotateCcw,
} from "lucide-react";
import { Link } from "react-router-dom";

import { MobileLayout } from "../components/layout/MobileLayout";
import { useApp } from "../context/AppContext";
import { getConsistency } from "../utils/habits";
import {
  formatMinutes,
  getAverageHabitConsistency,
  getCompletedThisWeek,
  getOverdueTasks,
  getWorkedMinutes,
} from "../utils/stats";

const steps = ["Resumen", "Inbox", "Atrasadas", "Pausadas", "Backlog", "Hábitos", "Planificar"];

export function WeeklyReviewPage() {
  const {
    captures,
    snoozedCount,
    tasks,
    habits,
    habitLogs,
    moveTask,
    startTask,
    updateTask,
  } = useApp();
  const [step, setStep] = useState(0);
  const [finished, setFinished] = useState(false);

  const overdue = useMemo(() => getOverdueTasks(tasks), [tasks]);
  const paused = tasks.filter((task) => task.status === "paused");
  const backlog = tasks.filter((task) => task.status === "backlog");
  const completedThisWeek = getCompletedThisWeek(tasks);
  const focusMinutes = getWorkedMinutes(tasks);
  const consistency = getAverageHabitConsistency(habits, habitLogs);

  function next() {
    if (step >= steps.length - 1) {
      setFinished(true);
      return;
    }
    setStep((current) => current + 1);
  }

  function previous() {
    setStep((current) => Math.max(0, current - 1));
  }

  if (finished) {
    return (
      <MobileLayout>
        <div className="mx-auto flex min-h-[68vh] max-w-lg flex-col items-center justify-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-900 text-white">
            <Check size={30} />
          </div>
          <h1 className="mt-5 text-2xl font-bold text-gray-900">Semana revisada</h1>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            Ya viste tu Inbox, bloqueos, backlog, hábitos y lo que conviene planificar.
          </p>
          <div className="mt-6 grid w-full grid-cols-2 gap-3">
            <ReviewSummary value={captures.length} label="Inbox" />
            <ReviewSummary value={overdue.length} label="Atrasadas" />
            <ReviewSummary value={paused.length} label="Pausadas" />
            <ReviewSummary value={backlog.length} label="Backlog" />
          </div>
          <Link to="/" className="mt-7 inline-flex h-11 items-center justify-center rounded-xl bg-gray-900 px-5 text-sm font-semibold text-white">
            Ir a Hoy
          </Link>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <header className="mb-5 lg:mb-7">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400">Revisión semanal</p>
        <h1 className="mt-2 text-2xl font-bold text-gray-900 lg:text-3xl">Pon tu semana en orden</h1>
        <p className="mt-1 text-sm text-gray-500">Paso {step + 1} de {steps.length} · {steps[step]}</p>
      </header>

      <div className="mb-5 flex gap-1.5 lg:max-w-3xl">
        {steps.map((label, index) => (
          <div key={label} className={`h-1.5 flex-1 rounded-full ${index <= step ? "bg-gray-900" : "bg-gray-200"}`} />
        ))}
      </div>

      <div className="lg:max-w-5xl">
        {step === 0 && (
          <ReviewCard title="Así va tu semana" icon={<CheckCircle2 size={20} />}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <ReviewSummary value={completedThisWeek} label="Terminadas" />
              <ReviewSummary value={formatMinutes(focusMinutes)} label="Enfoque" />
              <ReviewSummary value={`${consistency}%`} label="Hábitos" />
              <ReviewSummary value={tasks.filter((task) => task.status === "completed").length} label="Finalizadas total" />
            </div>
          </ReviewCard>
        )}

        {step === 1 && (
          <ReviewCard title="Limpia tu Inbox" icon={<Inbox size={20} />}>
            <p className="text-sm leading-6 text-gray-600">
              Tienes <strong>{captures.length}</strong> {captures.length === 1 ? "captura visible" : "capturas visibles"}
              {snoozedCount ? ` y ${snoozedCount} pospuesta${snoozedCount === 1 ? "" : "s"}.` : "."}
            </p>
            {captures.length > 0 ? (
              <Link to="/inbox" className="mt-5 inline-flex h-10 items-center justify-center rounded-xl bg-gray-900 px-4 text-sm font-semibold text-white">
                Organizar Inbox
              </Link>
            ) : (
              <EmptyMini text="Inbox en orden." />
            )}
          </ReviewCard>
        )}

        {step === 2 && (
          <ReviewCard title="Tareas atrasadas" icon={<CalendarDays size={20} />}>
            {overdue.length === 0 ? <EmptyMini text="No tienes tareas vencidas." /> : (
              <div className="space-y-3">
                {overdue.map((task) => (
                  <div key={task.id} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                    <p className="font-semibold text-gray-900">{task.title}</p>
                    <p className="mt-1 text-xs text-gray-500">Venció {formatDate(task.deadline!)}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button onClick={() => updateTask(task.id, { plannedDate: getTodayKey() })} className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-gray-700 ring-1 ring-gray-200">Hacer hoy</button>
                      <button onClick={() => moveTask(task.id, "backlog")} className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-gray-700 ring-1 ring-gray-200">Backlog</button>
                      <button onClick={() => moveTask(task.id, "cancelled")} className="rounded-lg px-3 py-2 text-xs font-semibold text-red-600">Cancelar</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ReviewCard>
        )}

        {step === 3 && (
          <ReviewCard title="Revisa lo pausado" icon={<PauseCircle size={20} />}>
            {paused.length === 0 ? <EmptyMini text="No tienes tareas en pausa." /> : (
              <div className="space-y-3">
                {paused.map((task) => (
                  <div key={task.id} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                    <p className="font-semibold text-gray-900">{task.title}</p>
                    <p className="mt-1 text-xs text-gray-500">{task.pauseReason ?? "Sin motivo"}</p>
                    {task.pauseNote && <p className="mt-2 text-sm text-gray-600">{task.pauseNote}</p>}
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button onClick={() => startTask(task.id)} className="inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-3 py-2 text-xs font-semibold text-white"><RotateCcw size={14} /> Reanudar</button>
                      <button onClick={() => moveTask(task.id, "cancelled")} className="rounded-lg px-3 py-2 text-xs font-semibold text-red-600">Cancelar</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ReviewCard>
        )}

        {step === 4 && (
          <ReviewCard title="Backlog" icon={<ListTodo size={20} />}>
            <p className="text-sm leading-6 text-gray-600">
              Tienes <strong>{backlog.length}</strong> {backlog.length === 1 ? "tarea" : "tareas"} sin fecha.
            </p>
            {backlog.length > 0 && (
              <div className="mt-4 space-y-2">
                {backlog.slice(0, 5).map((task) => (
                  <div key={task.id} className="flex items-center justify-between gap-3 rounded-xl bg-gray-50 px-3 py-3">
                    <span className="min-w-0 truncate text-sm font-medium text-gray-900">{task.title}</span>
                    <button onClick={() => updateTask(task.id, { plannedDate: getTodayKey(), status: "pending" })} className="shrink-0 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 ring-1 ring-gray-200">Hoy</button>
                  </div>
                ))}
                {backlog.length > 5 && <Link to="/backlog" className="inline-flex pt-2 text-sm font-semibold text-gray-700">Ver todo el Backlog →</Link>}
              </div>
            )}
          </ReviewCard>
        )}

        {step === 5 && (
          <ReviewCard title="Hábitos" icon={<Flame size={20} />}>
            <div className="grid gap-3 sm:grid-cols-2">
              {habits.map((habit) => {
                const value = getConsistency(habit, habitLogs, 30);
                return (
                  <div key={habit.id} className="rounded-xl bg-gray-50 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-gray-900">{habit.icon} {habit.title}</span>
                      <strong className="text-sm text-gray-900">{value}%</strong>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200">
                      <div className="h-full rounded-full bg-gray-900" style={{ width: `${value}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </ReviewCard>
        )}

        {step === 6 && (
          <ReviewCard title="Planifica lo siguiente" icon={<CalendarDays size={20} />}>
            <p className="text-sm leading-6 text-gray-600">
              Elige pocas cosas importantes del Backlog y dales un espacio real en tu Agenda. No necesitas llenar toda la semana.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link to="/backlog" className="inline-flex h-10 items-center justify-center rounded-xl bg-gray-900 px-4 text-sm font-semibold text-white">Revisar Backlog</Link>
              <Link to="/agenda" className="inline-flex h-10 items-center justify-center rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700">Abrir Agenda</Link>
            </div>
          </ReviewCard>
        )}
      </div>

      <footer className="mt-6 flex items-center justify-between gap-3 lg:max-w-5xl">
        <button
          type="button"
          onClick={previous}
          disabled={step === 0}
          className="inline-flex h-11 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 disabled:opacity-40"
        >
          <ArrowLeft size={17} /> Anterior
        </button>
        <button
          type="button"
          onClick={next}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-gray-900 px-4 text-sm font-semibold text-white"
        >
          {step === steps.length - 1 ? "Terminar" : "Continuar"}
          <ArrowRight size={17} />
        </button>
      </footer>
    </MobileLayout>
  );
}

function ReviewCard({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4 lg:p-6">
      <div className="mb-5 flex items-center gap-2 text-gray-500">
        {icon}
        <h2 className="font-bold text-gray-900">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function ReviewSummary({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="rounded-xl bg-gray-50 p-3">
      <p className="text-xl font-bold text-gray-900">{value}</p>
      <p className="mt-1 text-xs text-gray-500">{label}</p>
    </div>
  );
}

function EmptyMini({ text }: { text: string }) {
  return <div className="mt-4 rounded-xl bg-gray-50 px-4 py-4 text-sm font-medium text-gray-500">{text}</div>;
}

function formatDate(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short" }).format(new Date(year, month - 1, day));
}

function getTodayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
