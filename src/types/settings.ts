export type WeekStart = "monday" | "sunday";
export type TimeFormat = "12h" | "24h";
export type AreaDefinition = { id: string; name: string };

export const defaultAreas: AreaDefinition[] = [
  { id: "health", name: "Salud" },
  { id: "work", name: "Trabajo" },
  { id: "study", name: "Estudio" },
  { id: "other", name: "Otros" },
];

export type SpaceDefinition = { id: string; name: string; color: string; showInAgenda: boolean; areas?: AreaDefinition[] };

export type AppSettings = {
  spaces?: SpaceDefinition[];
  labels?: string[];
  desktopTaskOrders?: Record<string, string[]>;
  areas: AreaDefinition[];
  focusAreaIds: string[];
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
  spaces: [],
  areas: defaultAreas,
  focusAreaIds: defaultAreas.map((area) => area.id),
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
