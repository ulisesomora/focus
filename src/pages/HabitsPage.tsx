import { useMemo, useState } from "react";
import { Check, ChevronRight, Minus, Plus } from "lucide-react";
import { Link } from "react-router-dom";

import { HabitEditorSheet, type HabitDraft } from "../components/habits/HabitEditorSheet";
import { MobileLayout } from "../components/layout/MobileLayout";
import { useApp } from "../context/AppContext";
import type { Habit } from "../types/habit";
import {
  getFrequencyLabel,
  getWeeklyCompletedCount,
  getWeeklyTarget,
  isHabitDueToday,
} from "../utils/habits";

export function HabitsPage() {
  const { habits, habitLogs, addHabit, toggleHabit, incrementHabit } = useApp();
  const [editorOpen, setEditorOpen] = useState(false);

  const dueHabits = useMemo(
    () => habits.filter((habit) => isHabitDueToday(habit, habitLogs)),
    [habits, habitLogs],
  );

  const completedCount = useMemo(
    () => dueHabits.filter(isHabitComplete).length,
    [dueHabits],
  );

  const completion = dueHabits.length
    ? Math.round((completedCount / dueHabits.length) * 100)
    : 100;

  function handleCreate(draft: HabitDraft) {
    addHabit({ ...draft });
  }

  return (
    <MobileLayout>
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500">Tu constancia</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900 lg:text-3xl">Hábitos</h1>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Define cuándo quieres repetirlos y registra el progreso sin convertirlos en tareas.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setEditorOpen(true)}
          className="flex h-11 shrink-0 items-center gap-2 rounded-xl bg-gray-900 px-4 text-sm font-semibold text-white"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Nuevo hábito</span>
        </button>
      </header>

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-8">
        <section>
          <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-4 lg:hidden">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900">Hoy</p>
                <p className="mt-1 text-xs text-gray-500">
                  {completedCount} de {dueHabits.length} completados
                </p>
              </div>
              <span className="text-2xl font-bold text-gray-900">{completion}%</span>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100">
              <div className="h-full rounded-full bg-gray-900" style={{ width: `${completion}%` }} />
            </div>
          </div>

          {habits.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-7 text-center lg:max-w-xl">
              <p className="font-bold text-gray-900">Todavía no tienes hábitos</p>
              <p className="mt-2 text-sm leading-6 text-gray-500">Empieza con uno sencillo. Puedes medirlo como completado, cantidad o tiempo.</p>
              <button type="button" onClick={() => setEditorOpen(true)} className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-gray-900 px-4 text-sm font-semibold text-white"><Plus size={16} /> Crear primer hábito</button>
            </div>
          ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[repeat(auto-fit,minmax(250px,300px))]">
            {habits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                dueToday={isHabitDueToday(habit, habitLogs)}
                weekCount={getWeeklyCompletedCount(habit, habitLogs)}
                weekTarget={getWeeklyTarget(habit)}
                onToggle={() => toggleHabit(habit.id)}
                onIncrement={(amount) => incrementHabit(habit.id, amount)}
              />
            ))}
          </div>
          )}
        </section>

        <aside className="hidden lg:block">
          <div className="sticky top-8 rounded-3xl border border-gray-200 bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Resumen de hoy</p>
            <div className="mt-5 flex items-end justify-between">
              <div>
                <p className="text-4xl font-bold text-gray-900">{completion}%</p>
                <p className="mt-1 text-sm text-gray-500">cumplimiento de hoy</p>
              </div>
              <p className="text-sm font-semibold text-gray-700">{completedCount}/{dueHabits.length}</p>
            </div>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-gray-100">
              <div className="h-full rounded-full bg-gray-900" style={{ width: `${completion}%` }} />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Stat label="Activos" value={habits.length} />
              <Stat label="Para hoy" value={dueHabits.length} />
            </div>
          </div>
        </aside>
      </div>

      <HabitEditorSheet open={editorOpen} onClose={() => setEditorOpen(false)} onSave={handleCreate} />
    </MobileLayout>
  );
}

type HabitCardProps = {
  habit: Habit;
  dueToday: boolean;
  weekCount: number;
  weekTarget: number;
  onToggle: () => void;
  onIncrement: (amount: number) => void;
};

function HabitCard({ habit, dueToday, weekCount, weekTarget, onToggle, onIncrement }: HabitCardProps) {
  const progress = getProgress(habit);

  return (
    <article className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm lg:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gray-50 text-xl">
            {habit.icon ?? "✨"}
          </div>
          <div className="min-w-0">
            <h2 className="truncate font-bold text-gray-900">{habit.title}</h2>
            <p className="mt-0.5 text-xs text-gray-500">{getFrequencyLabel(habit)}</p>
          </div>
        </div>
        {isHabitComplete(habit) && (
          <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">Listo</span>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <span>{dueToday ? "Corresponde hoy" : "No toca hoy"}</span>
        <span>{weekCount}/{weekTarget} esta semana</span>
      </div>

      {habit.type !== "complete" && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-gray-900">
              {habit.current ?? 0} / {habit.target ?? 0} {habit.unit ?? ""}
            </span>
            <span className="text-gray-400">{progress}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
            <div className="h-full rounded-full bg-gray-900" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {habit.type === "complete" ? (
          <button
            type="button"
            onClick={onToggle}
            className={`flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold ${
              habit.completed ? "bg-green-50 text-green-700" : "bg-gray-900 text-white"
            }`}
          >
            <Check size={17} />
            {habit.completed ? "Completado" : "Completar"}
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={() => onIncrement(-habitStep(habit))}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600"
            >
              <Minus size={17} />
            </button>
            <button
              type="button"
              onClick={() => onIncrement(habitStep(habit))}
              className="flex h-10 items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 text-sm font-semibold text-white"
            >
              <Plus size={17} />
              {habit.type === "time" ? `+${habitStep(habit)} min` : `+${habitStep(habit)}`}
            </button>
          </>
        )}

        <Link
          to={`/habits/${habit.id}`}
          className="ml-auto flex h-10 items-center gap-1 rounded-xl px-2 text-sm font-semibold text-gray-500 hover:bg-gray-50"
        >
          Progreso
          <ChevronRight size={16} />
        </Link>
      </div>
    </article>
  );
}

function isHabitComplete(habit: Habit) {
  if (habit.type === "complete") return Boolean(habit.completed);
  return (habit.current ?? 0) >= (habit.target ?? 1);
}

function getProgress(habit: Habit) {
  if (habit.type === "complete") return habit.completed ? 100 : 0;
  const target = habit.target ?? 1;
  return Math.min(100, Math.round(((habit.current ?? 0) / target) * 100));
}

function habitStep(habit: Habit) {
  return habit.type === "time" ? 5 : 1;
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-gray-50 p-4">
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="mt-1 text-xs text-gray-500">{label}</p>
    </div>
  );
}
