import type { Task } from "../types/task";
import type { Habit, HabitLog } from "../types/habit";
import type { Goal } from "../types/goal";
import { getConsistency } from "./habits";
import { getGoalProgress } from "./goals";

export function getTaskStateCounts(tasks: Task[]) {
  return {
    backlog: tasks.filter((task) => task.status === "backlog").length,
    pending: tasks.filter((task) => task.status === "pending").length,
    inProgress: tasks.filter((task) => task.status === "in_progress").length,
    paused: tasks.filter((task) => task.status === "paused").length,
    review: tasks.filter((task) => task.status === "review").length,
    completed: tasks.filter((task) => task.status === "completed").length,
    cancelled: tasks.filter((task) => task.status === "cancelled").length,
  };
}

export function getCompletedThisWeek(tasks: Task[]) {
  const { start, end } = getWeekBounds(new Date());
  return tasks.filter((task) => {
    if (task.status !== "completed" || !task.completedAt) return false;
    const completedAt = new Date(task.completedAt);
    return completedAt >= start && completedAt <= end;
  }).length;
}

export function getWorkedMinutes(tasks: Task[]) {
  return tasks.reduce((sum, task) => sum + (task.workedMinutes ?? 0), 0);
}

export function getAverageHabitConsistency(habits: Habit[], logs: HabitLog[]) {
  if (!habits.length) return 0;
  const total = habits.reduce(
    (sum, habit) => sum + getConsistency(habit, logs, 30),
    0,
  );
  return Math.round(total / habits.length);
}

export function getAverageGoalProgress(
  goals: Goal[],
  tasks: Task[],
  habits: Habit[],
  logs: HabitLog[],
) {
  const active = goals.filter((goal) => !goal.completed);
  if (!active.length) return 0;
  const total = active.reduce(
    (sum, goal) => sum + getGoalProgress(goal, tasks, habits, logs),
    0,
  );
  return Math.round(total / active.length);
}

export function getOverdueTasks(tasks: Task[]) {
  const today = getLocalDateKey();
  return tasks.filter((task) => {
    if (!task.deadline) return false;
    if (["completed", "cancelled"].includes(task.status)) return false;
    return task.deadline < today;
  });
}

export function getStalePausedTasks(tasks: Task[]) {
  return tasks.filter((task) => task.status === "paused");
}

export function getOldBacklogTasks(tasks: Task[], days = 30) {
  const threshold = new Date();
  threshold.setDate(threshold.getDate() - days);
  return tasks.filter((task) => {
    if (task.status !== "backlog") return false;
    if (!task.createdAt) return false;
    return new Date(task.createdAt) < threshold;
  });
}

export function formatMinutes(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (!hours) return `${rest}m`;
  if (!rest) return `${hours}h`;
  return `${hours}h ${rest}m`;
}

function getWeekBounds(refDate: Date) {
  const date = new Date(refDate);
  date.setHours(0, 0, 0, 0);
  const mondayOffset = (date.getDay() + 6) % 7;
  const start = new Date(date);
  start.setDate(start.getDate() - mondayOffset);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function getLocalDateKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
