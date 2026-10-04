import type { ReactNode } from "react";
import { ArrowLeft, Check, Flame, Trophy } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { MobileLayout } from "../components/layout/MobileLayout";
import { defaultAreas } from "../types/settings";
import { useApp } from "../context/AppContext";
import {
  getConsistency,
  getDateKey,
  getFrequencyLabel,
  getHabitLog,
  getLastDays,
  getWeeklyCompletedCount,
  getWeeklyTarget,
  isHabitScheduledForDate,
} from "../utils/habits";

export function HabitDetailPage() {
  const { habitId } = useParams();
  const { habits, habitLogs, settings } = useApp();
  const habit = habits.find((item) => item.id === habitId);

  if (!habit) {
    return (
      <MobileLayout>
        <Link to="/habits" className="text-sm font-semibold text-gray-500">← Volver a hábitos</Link>
        <p className="mt-8 text-gray-500">No encontramos este hábito.</p>
      </MobileLayout>
    );
  }

  const last14 = getLastDays(14);
  const consistency = getConsistency(habit, habitLogs, 30);
  const weekCount = getWeeklyCompletedCount(habit, habitLogs);
  const weekTarget = getWeeklyTarget(habit);

  return (
    <MobileLayout>
      <header className="mb-6">
        <Link to="/habits" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500">
          <ArrowLeft size={17} /> Hábitos
        </Link>
        <div className="mt-5 flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
            {habit.icon ?? "✨"}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 lg:text-3xl">{habit.title}</h1>
            <p className="mt-1 text-sm text-gray-500">{getFrequencyLabel(habit)}</p>
          </div>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-3 lg:max-w-3xl">
        <Metric icon={<Flame size={18} />} label="Racha actual" value={`${habit.streak ?? 0}`} suffix={habit.frequency.type === "times_per_week" ? " sem" : " días"} />
        <Metric icon={<Trophy size={18} />} label="Mejor racha" value={`${habit.bestStreak ?? 0}`} suffix={habit.frequency.type === "times_per_week" ? " sem" : " días"} />
        <Metric icon={<Check size={18} />} label="Consistencia" value={`${consistency}%`} />
      </div>

      {(habit.area || habit.labels?.length || habit.description || habit.sourceTaskId) && <section className="mt-4 max-w-3xl space-y-2 text-sm text-gray-600">
        <div className="flex flex-wrap items-center gap-2">
          {habit.area && <span>{(settings.areas?.length ? settings.areas : defaultAreas).find(area => area.id === habit.area)?.name ?? "Sin área"}</span>}
          <span className="rounded bg-gray-100 px-2 py-0.5 text-xs">Hábito</span>
          {habit.labels?.map(label => <span key={label} className="rounded bg-indigo-50 px-2 py-0.5 text-xs text-indigo-600">#{label}</span>)}
        </div>
        {habit.description && <p className="whitespace-pre-wrap">{habit.description}</p>}
        {habit.sourceTaskId && <Link to={`/tasks/${habit.sourceTaskId}`} className="block text-xs font-semibold text-gray-500">Ver tarea de origen y comentarios →</Link>}
      </section>}

      <section className="mt-6 max-w-3xl rounded-3xl border border-gray-200 bg-white p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Esta semana</p>
            <p className="mt-1 text-lg font-bold text-gray-900">{weekCount} de {weekTarget}</p>
          </div>
          <span className="text-sm font-semibold text-gray-500">
            {Math.min(100, Math.round((weekCount / Math.max(1, weekTarget)) * 100))}%
          </span>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-gray-900"
            style={{ width: `${Math.min(100, (weekCount / Math.max(1, weekTarget)) * 100)}%` }}
          />
        </div>
      </section>

      <section className="mt-6 max-w-3xl rounded-3xl border border-gray-200 bg-white p-5">
        <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Últimos 14 días</p>
        <div className="mt-5 grid grid-cols-7 gap-2">
          {last14.map((date) => {
            const key = getDateKey(date);
            const log = getHabitLog(habitLogs, habit.id, key);
            const scheduled = habit.frequency.type === "times_per_week" || isHabitScheduledForDate(habit, date);
            return (
              <div key={key} className="text-center">
                <div
                  className={`mx-auto flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold ${
                    log?.completed
                      ? "bg-gray-900 text-white"
                      : scheduled
                        ? "bg-gray-100 text-gray-400"
                        : "bg-white text-gray-300 ring-1 ring-gray-100"
                  }`}
                >
                  {date.getDate()}
                </div>
                <p className="mt-1 text-[10px] font-medium text-gray-400">
                  {new Intl.DateTimeFormat("es-MX", { weekday: "narrow" }).format(date)}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </MobileLayout>
  );
}

function Metric({ icon, label, value, suffix = "" }: { icon: ReactNode; label: string; value: string; suffix?: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-2 text-gray-400">{icon}<span className="text-xs font-bold uppercase tracking-wide">{label}</span></div>
      <p className="mt-3 text-2xl font-bold text-gray-900">{value}<span className="text-sm font-semibold text-gray-400">{suffix}</span></p>
    </div>
  );
}
