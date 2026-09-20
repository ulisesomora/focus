export type RoutineStepType = "action" | "habit" | "timer";

export type RoutineStep = {
  id: string;
  type: RoutineStepType;
  title: string;
  habitId?: string;
  durationMinutes?: number;
};

export type Routine = {
  id: string;
  title: string;
  icon?: string;
  days: number[];
  recommendedTime?: string;
  steps: RoutineStep[];
};
