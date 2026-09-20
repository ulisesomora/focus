import type { Routine } from "../types/routine";

export const mockRoutines: Routine[] = [
  {
    id: "routine-morning",
    title: "Rutina de mañana",
    icon: "☀️",
    days: [1, 2, 3, 4, 5],
    recommendedTime: "07:00",
    steps: [
      { id: "step-1", type: "action", title: "Tender la cama" },
      { id: "step-2", type: "habit", title: "Tomar agua", habitId: "2" },
      { id: "step-3", type: "timer", title: "Ejercicio", durationMinutes: 30 },
      { id: "step-4", type: "action", title: "Bañarme" },
      { id: "step-5", type: "action", title: "Revisar agenda" },
    ],
  },
  {
    id: "routine-night",
    title: "Rutina de noche",
    icon: "🌙",
    days: [0, 1, 2, 3, 4, 5, 6],
    recommendedTime: "22:00",
    steps: [
      { id: "step-6", type: "action", title: "Preparar mañana" },
      { id: "step-7", type: "habit", title: "Leer", habitId: "3" },
      { id: "step-8", type: "timer", title: "Respirar y desconectar", durationMinutes: 5 },
    ],
  },
];
