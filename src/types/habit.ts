export type HabitType = "complete" | "quantity" | "time";

export type HabitFrequency =
  | { type: "daily" }
  | { type: "specific_days"; days: number[] }
  | { type: "times_per_week"; times: number };

export type Habit = {
  id: string;
  sourceTaskId?: string;
  area?: string;
  labels?: string[];
  description?: string;
  title: string;
  icon?: string;
  type: HabitType;
  target?: number;
  unit?: string;
  frequency: HabitFrequency;

  // Valores derivados del registro del día actual.
  current?: number;
  completed?: boolean;
  streak?: number;
  bestStreak?: number;
};

export type HabitLog = {
  habitId: string;
  date: string;
  value: number;
  completed: boolean;
};
