import type { Task } from "../types/task";

// Classification is derived from the task's real data, never from a manual type.
export function getTaskClassification(task: Task): string {
  if (task.projectRole === "main") return "Proyecto";
  if (task.convertedHabitId) return "Hábito";
  if (task.plannedDate && task.plannedTime) return "En agenda";
  if (task.plannedDate) return "Planificada";
  if (task.projectRole !== "child" && task.project?.trim()) return "Proyecto";
  if (task.subtasks?.length) return "Con subtareas";
  return "Tarea";
}
