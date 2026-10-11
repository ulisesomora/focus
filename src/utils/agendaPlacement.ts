import type { Task } from "../types/task";
import { taskWorkDates } from "./taskDays";

export function agendaPlacement(task: Task, date: string, time?: string, duration?: number) {
  const dates = taskWorkDates(task);
  const remaining = dates.filter(day => day !== task.plannedDate || day === date);
  const workDates = [...new Set([...remaining, date])].sort();
  if (workDates.length > 7) throw new Error("La tarea ya tiene 7 fechas. Quita una fecha antes de elegir otra.");
  const estimatedMinutes = time ? duration ?? task.estimatedMinutes ?? 30 : duration ?? task.estimatedMinutes;
  if (time && estimatedMinutes) {
    const [hours, minutes] = time.split(":").map(Number);
    if (hours * 60 + minutes + estimatedMinutes > 1440) throw new Error("El horario y la duración deben terminar dentro del mismo día.");
  }
  return { workDates, plannedDate: date, plannedTime: time, estimatedMinutes };
}
export function agendaDropTime(y: number, startHour: number, hourHeight: number, duration = 30) {
  const minutes = Math.max(0, Math.min(1440 - duration, Math.round((startHour * 60 + y / hourHeight * 60) / 15) * 15));
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}
