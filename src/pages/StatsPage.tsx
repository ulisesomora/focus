import type { ReactNode } from "react";
import {
  BarChart3,
  CheckCircle2,
  Clock3,
  Flame,
  PauseCircle,
  Target,
} from "lucide-react";

import { MobileLayout } from "../components/layout/MobileLayout";
import { useApp } from "../context/AppContext";
import { getConsistency } from "../utils/habits";
import {
  formatMinutes,
  getAverageGoalProgress,
  getAverageHabitConsistency,
  getCompletedThisWeek,
  getTaskStateCounts,
  getWorkedMinutes,
} from "../utils/stats";

export function StatsPage() {
  const { tasks, habits, habitLogs, goals } = useApp();
  const counts = getTaskStateCounts(tasks);
  const completedThisWeek = getCompletedThisWeek(tasks);
  const focusMinutes = getWorkedMinutes(tasks);
  const habitConsistency = getAverageHabitConsistency(habits, habitLogs);
  const goalProgress = getAverageGoalProgress(goals, tasks, habits, habitLogs);

  const taskFlow = [
    { label: "Pendientes", value: counts.pending },
    { label: "En proceso", value: counts.inProgress },
    { label: "En pausa", value: counts.paused },
    { label: "Revisión", value: counts.review },
    { label: "Finalizadas", value: counts.completed },
  ];
  const maxTaskValue = Math.max(1, ...taskFlow.map((item) => item.value));

  return (
    <MobileLayout>
      <header className="mb-6 lg:mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400">
          Progreso
        </p>
        <h1 className="mt-2 text-2xl font-bold text-gray-900 lg:text-3xl">
          Estadísticas
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Una vista compacta de cómo estás trabajando, sin convertir la app en un dashboard pesado.
        </p>
      </header>

      <section className="grid grid-cols-2 gap-3 lg:max-w-4xl lg:grid-cols-4">
        <MetricCard icon={CheckCircle2} value={String(completedThisWeek)} label="Terminadas esta semana" />
        <MetricCard icon={Clock3} value={formatMinutes(focusMinutes)} label="Tiempo registrado" />
        <MetricCard icon={Flame} value={`${habitConsistency}%`} label="Consistencia hábitos" />
        <MetricCard icon={Target} value={`${goalProgress}%`} label="Avance metas" />
      </section>

      <div className="mt-7 grid gap-5 lg:max-w-6xl lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,.65fr)] lg:items-start">
        <div className="space-y-5">
          <section className="rounded-2xl border border-gray-200 bg-white p-4 lg:p-5">
            <div className="flex items-center gap-2">
              <BarChart3 size={18} className="text-gray-500" />
              <h2 className="font-bold text-gray-900">Flujo de tareas</h2>
            </div>
            <div className="mt-5 space-y-4">
              {taskFlow.map((item) => (
                <div key={item.label} className="grid grid-cols-[90px_1fr_28px] items-center gap-3 text-sm">
                  <span className="text-gray-500">{item.label}</span>
                  <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-gray-900"
                      style={{ width: `${Math.max(item.value ? 8 : 0, (item.value / maxTaskValue) * 100)}%` }}
                    />
                  </div>
                  <span className="text-right font-semibold text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-4 lg:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-bold text-gray-900">Hábitos</h2>
                <p className="mt-1 text-xs text-gray-500">Consistencia de los últimos 30 días.</p>
              </div>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-bold text-gray-700">
                {habitConsistency}%
              </span>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {habits.map((habit) => {
                const consistency = getConsistency(habit, habitLogs, 30);
                return (
                  <div key={habit.id} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-900">
                          {habit.icon} {habit.title}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          Racha {habit.streak ?? 0}
                        </p>
                      </div>
                      <strong className="text-sm text-gray-900">{consistency}%</strong>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200">
                      <div className="h-full rounded-full bg-gray-900" style={{ width: `${consistency}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-7">
          <section className="rounded-2xl border border-gray-200 bg-white p-4">
            <h2 className="font-bold text-gray-900">Estado actual</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <SmallMetric value={counts.inProgress} label="En proceso" />
              <SmallMetric value={counts.paused} label="En pausa" icon={<PauseCircle size={15} />} />
              <SmallMetric value={counts.review} label="Revisión" />
              <SmallMetric value={counts.backlog} label="Backlog" />
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-gray-400">Lectura rápida</p>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              {counts.paused > 0
                ? `Tienes ${counts.paused} ${counts.paused === 1 ? "tarea pausada" : "tareas pausadas"}. Conviene revisarlas antes de abrir más trabajo.`
                : counts.inProgress > 2
                  ? "Tienes varias tareas en proceso. Terminar alguna antes de iniciar otra puede reducir trabajo abierto."
                  : "Tu carga activa está controlada. Puedes concentrarte en terminar lo que ya está en marcha."}
            </p>
          </section>
        </aside>
      </div>
    </MobileLayout>
  );
}

type MetricCardProps = {
  icon: typeof CheckCircle2;
  value: string;
  label: string;
};

function MetricCard({ icon: Icon, value, label }: MetricCardProps) {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-4 lg:max-w-[220px]">
      <Icon size={19} className="text-gray-400" />
      <p className="mt-4 text-2xl font-bold text-gray-900">{value}</p>
      <p className="mt-1 text-xs leading-5 text-gray-500">{label}</p>
    </article>
  );
}

function SmallMetric({ value, label, icon }: { value: number; label: string; icon?: ReactNode }) {
  return (
    <div className="rounded-xl bg-gray-50 p-3">
      <div className="flex items-center gap-1.5 text-gray-400">{icon}<span className="text-lg font-bold text-gray-900">{value}</span></div>
      <p className="mt-1 text-xs text-gray-500">{label}</p>
    </div>
  );
}
