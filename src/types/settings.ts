export type WeekStart = "monday" | "sunday";
export type TimeFormat = "12h" | "24h";

export type AppSettings = {
  weekStart: WeekStart;
  timeFormat: TimeFormat;
  workdayStart: string;
  workdayEnd: string;
  defaultPlanningMinutes: number;
  wipLimit: number;
  singleActiveTask: boolean;
  showCompletedTasks: boolean;
  onboardingCompleted: boolean;
};

export const defaultAppSettings: AppSettings = {
  weekStart: "monday",
  timeFormat: "12h",
  workdayStart: "08:00",
  workdayEnd: "22:00",
  defaultPlanningMinutes: 30,
  wipLimit: 3,
  singleActiveTask: true,
  showCompletedTasks: true,
  onboardingCompleted: false,
};
