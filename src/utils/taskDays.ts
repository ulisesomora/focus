import { isBacklog } from "./taskBacklog";
import { useEffect, useState } from "react";
import type { Task } from "../types/task";

// Use the device's local calendar, including across midnight and DST changes.
export function localDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function taskDays(now = new Date()) {
  const next = new Date(now);
  next.setDate(next.getDate() + 1);
  return { today: localDateKey(now), tomorrow: localDateKey(next) };
}

export function tasksForDay(tasks: Task[], date: string, pendingOnly = false) {
  return tasks.filter(task => !isBacklog(task) && taskWorkDates(task).includes(date) && task.status !== "cancelled"
    && (!pendingOnly || task.status !== "completed"))
    .sort((a, b) => Number(a.status === "completed") - Number(b.status === "completed")
      || (a.plannedTime || "99:99").localeCompare(b.plannedTime || "99:99"));
}

export function useTaskDays() {
  const [days, setDays] = useState(() => taskDays());
  useEffect(() => {
    const refresh = () => {
      const next = taskDays();
      setDays(previous => previous.today === next.today ? previous : next);
    };
    const timer = window.setInterval(refresh, 30_000);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);
  return days;
}

// Explicit selections override the legacy planning date, including an empty selection.
export function taskWorkDates(task: Task): string[] {
  return task.workDates ?? (task.plannedDate ? [task.plannedDate] : []);
}

export function overdueTasks(tasks: Task[], today: string): Task[] {
  return tasks.filter(task => {
    const dates = taskWorkDates(task);
    return !isBacklog(task) && task.status !== "completed" && task.status !== "cancelled"
      && dates.length > 0 && dates.every(date => date < today);
  }).sort((a, b) => [...taskWorkDates(a)].sort().slice(-1)[0].localeCompare([...taskWorkDates(b)].sort().slice(-1)[0]));
}

export function completedOnDay(tasks: Task[], day: string): Task[] {
  return tasks.filter(task => task.status === "completed" && task.completedAt
    && localDateKey(new Date(task.completedAt)) === day)
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime());
}
