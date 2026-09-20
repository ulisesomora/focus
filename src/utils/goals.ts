import type { Goal } from "../types/goal";
import type { Task } from "../types/task";
import type { Habit, HabitLog } from "../types/habit";
import { getConsistency } from "./habits";

export function getGoalProgress(
  goal: Goal,
  tasks: Task[],
  habits: Habit[],
  logs: HabitLog[],
) {
  if (goal.completed) return 100;

  if (goal.progressMode === "manual") {
    return clamp(goal.manualProgress ?? 0);
  }

  const taskProgress = getTaskProgress(goal, tasks);
  const habitProgress = getHabitProgress(goal, habits, logs);

  if (goal.progressMode === "tasks") return taskProgress;
  if (goal.progressMode === "habits") return habitProgress;

  const hasTasks = goal.linkedTaskIds.length > 0;
  const hasHabits = goal.linkedHabitIds.length > 0;

  if (hasTasks && hasHabits) return Math.round((taskProgress + habitProgress) / 2);
  if (hasTasks) return taskProgress;
  if (hasHabits) return habitProgress;
  return clamp(goal.manualProgress ?? 0);
}

export function getTaskProgress(goal: Goal, tasks: Task[]) {
  const linked = tasks.filter((task) => goal.linkedTaskIds.includes(task.id));
  if (!linked.length) return 0;
  const done = linked.filter((task) => task.status === "completed").length;
  return Math.round((done / linked.length) * 100);
}

export function getHabitProgress(goal: Goal, habits: Habit[], logs: HabitLog[]) {
  const linked = habits.filter((habit) => goal.linkedHabitIds.includes(habit.id));
  if (!linked.length) return 0;
  const total = linked.reduce((sum, habit) => sum + getConsistency(habit, logs, 30), 0);
  return Math.round(total / linked.length);
}

export function formatGoalDate(dateKey?: string) {
  if (!dateKey) return "Sin fecha objetivo";
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "short",
    year: year !== new Date().getFullYear() ? "numeric" : undefined,
  }).format(new Date(year, month - 1, day));
}

function clamp(value: number) {
  return Math.min(100, Math.max(0, Math.round(value)));
}
