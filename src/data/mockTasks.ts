import type { Task } from "../types/task";

const today = getLocalDateKey();

export const mockTasks: Task[] = [
  {
    id: "1",
    title: "Terminar webhook Wompi",
    status: "in_progress",
    project: "Trabajo",
    priority: "high",
    workedMinutes: 83,
    estimatedMinutes: 180,
    isActive: true,
  },
  {
    id: "2",
    title: "Revisar documentación",
    status: "pending",
    project: "Trabajo",
    priority: "high",
    plannedDate: today,
    plannedTime: "10:30",
    estimatedMinutes: 60,
  },
  {
    id: "3",
    title: "Comprar insumos",
    status: "pending",
    project: "Jardín Allende",
    priority: "medium",
    plannedDate: today,
    plannedTime: "12:00",
    estimatedMinutes: 30,
  },
  {
    id: "4",
    title: "Revisar inventarios",
    status: "pending",
    project: "Jardín Allende",
    plannedDate: today,
    plannedTime: "18:00",
    estimatedMinutes: 60,
  },
];

function getLocalDateKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
