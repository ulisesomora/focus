import { Check, ChevronRight, Plus } from "lucide-react";
import { Link } from "react-router-dom";

import type { Habit } from "../../types/habit";

type HabitPreviewProps = {
  habits: Habit[];
  onToggle?: (habitId: string) => void;
  onIncrement?: (habitId: string, amount: number) => void;
};

export function HabitPreview({ habits, onToggle, onIncrement }: HabitPreviewProps) {
  return (
    <section className="mt-7">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">
          Hábitos
        </h2>

        <Link
          to="/habits"
          className="flex items-center text-sm font-medium text-gray-500"
        >
          Ver todos
          <ChevronRight size={16} />
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        {habits.map((habit, index) => (
          <HabitRow
            key={habit.id}
            habit={habit}
            border={index !== habits.length - 1}
            onToggle={() => onToggle?.(habit.id)}
            onIncrement={(amount) => onIncrement?.(habit.id, amount)}
          />
        ))}
      </div>
    </section>
  );
}

type HabitRowProps = {
  habit: Habit;
  border: boolean;
  onToggle: () => void;
  onIncrement: (amount: number) => void;
};

function HabitRow({ habit, border, onToggle, onIncrement }: HabitRowProps) {
  return (
    <div
      className={`flex min-h-16 items-center gap-3 px-4 py-3 ${
        border ? "border-b border-gray-100" : ""
      }`}
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-50 text-lg">
        {habit.icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-medium text-gray-900">{habit.title}</p>
        <p className="mt-0.5 text-xs text-gray-500">{getProgressText(habit)}</p>
      </div>

      {habit.type === "complete" && (
        <button
          type="button"
          onClick={onToggle}
          className={`flex h-9 w-9 items-center justify-center rounded-full ${
            habit.completed
              ? "bg-green-100 text-green-700"
              : "border border-gray-300 text-gray-400"
          }`}
        >
          {habit.completed && <Check size={18} />}
        </button>
      )}

      {habit.type !== "complete" && (
        <button
          type="button"
          onClick={() => onIncrement(habit.type === "time" ? 5 : 1)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-white"
        >
          <Plus size={17} />
        </button>
      )}
    </div>
  );
}

function getProgressText(habit: Habit) {
  if (habit.type === "complete") {
    if (habit.completed) return "Completado";
    if (habit.streak) return `${habit.streak} días de racha`;
    return "Pendiente";
  }

  return `${habit.current ?? 0} / ${habit.target ?? 0} ${habit.unit ?? ""}`;
}
