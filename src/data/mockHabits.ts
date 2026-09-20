import type { Habit, HabitLog } from "../types/habit";
import { getDateKey } from "../utils/habits";

export const mockHabits: Habit[] = [
  {
    id: "1",
    title: "Ejercicio",
    icon: "🔥",
    type: "complete",
    frequency: { type: "specific_days", days: [1, 2, 3, 4, 5] },
  },
  {
    id: "2",
    title: "Tomar agua",
    icon: "💧",
    type: "quantity",
    target: 8,
    unit: "vasos",
    frequency: { type: "daily" },
  },
  {
    id: "3",
    title: "Leer",
    icon: "📖",
    type: "time",
    target: 30,
    unit: "min",
    frequency: { type: "times_per_week", times: 5 },
  },
];

export const mockHabitLogs: HabitLog[] = buildMockLogs();

function buildMockLogs() {
  const logs: HabitLog[] = [];
  const today = new Date();

  for (let offset = 20; offset >= 1; offset -= 1) {
    const date = new Date(today);
    date.setDate(date.getDate() - offset);
    const key = getDateKey(date);
    const weekday = date.getDay();

    if ([1, 2, 3, 4, 5].includes(weekday) && offset % 7 !== 3) {
      logs.push({ habitId: "1", date: key, value: 1, completed: true });
    }

    if (offset % 6 !== 0) {
      logs.push({ habitId: "2", date: key, value: 8, completed: true });
    }

    if (![0, 6].includes(weekday) && offset % 5 !== 0) {
      logs.push({ habitId: "3", date: key, value: 30, completed: true });
    }
  }

  logs.push({ habitId: "2", date: getDateKey(today), value: 5, completed: false });
  logs.push({ habitId: "3", date: getDateKey(today), value: 20, completed: false });

  return logs;
}
