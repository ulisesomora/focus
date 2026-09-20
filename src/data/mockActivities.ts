import type { Activity } from "../types/activity";

const now = new Date();

function minutesAgo(minutes: number) {
  return new Date(now.getTime() - minutes * 60_000);
}

export const mockActivities: Activity[] = [
  {
    id: "activity-1",
    entityType: "task",
    entityId: "1",
    kind: "started",
    title: "Terminar webhook Wompi",
    message: "Iniciaste la tarea",
    project: "Trabajo",
    createdAt: minutesAgo(42),
  },
  {
    id: "activity-2",
    entityType: "habit",
    entityId: "2",
    kind: "progress",
    title: "Tomar agua",
    message: "Registraste progreso en el hábito",
    createdAt: minutesAgo(78),
  },
];
