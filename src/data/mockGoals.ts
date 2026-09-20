import type { Goal } from "../types/goal";

export const mockGoals: Goal[] = [
  {
    id: "goal-1",
    title: "Lanzar versión 2",
    icon: "🚀",
    description: "Dejar lista una versión estable con pagos, agenda y flujo principal probado.",
    targetDate: getDateAfter(30),
    project: "Trabajo",
    progressMode: "combined",
    linkedTaskIds: ["1", "2"],
    linkedHabitIds: ["3"],
    milestones: [
      { id: "m1", title: "MVP", completed: true },
      { id: "m2", title: "Integración principal", completed: false },
      { id: "m3", title: "Pruebas", completed: false },
      { id: "m4", title: "Producción", completed: false },
    ],
    createdAt: new Date(),
  },
  {
    id: "goal-2",
    title: "Mejorar condición física",
    icon: "🏃",
    description: "Crear constancia con ejercicio y hábitos diarios.",
    targetDate: getDateAfter(100),
    progressMode: "habits",
    linkedTaskIds: [],
    linkedHabitIds: ["1", "2"],
    milestones: [],
    createdAt: new Date(),
  },
];

function getDateAfter(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
