export type TaskStatus =
  | "backlog"
  | "pending"
  | "in_progress"
  | "paused"
  | "review"
  | "completed"
  | "cancelled";

export type TaskPriority = "low" | "medium" | "high";
export type TaskArea = string;

export type TaskSubtask = {
  id: string;
  title: string;
  completed: boolean;
};

export type Task = {
  id: string;
  title: string;
  spaceId?: string;
  status: TaskStatus;
  backlog?: boolean;
  convertedHabitId?: string;
  kind?: "task" | "project";
  comments?: { id: string; text: string; createdAt: string }[];
  project?: string;
  projectId?: string;
  showOutsideProject?: boolean;
  projectRole?: "main" | "child";
  area?: TaskArea;
  priority?: TaskPriority;
  description?: string;
  labels?: string[];
  subtasks?: TaskSubtask[];

  workDates?: string[];
  plannedDate?: string;
  plannedTime?: string;
  deadline?: string;

  workedMinutes?: number;
  estimatedMinutes?: number;

  isActive?: boolean;
  createdAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  pauseReason?: string;
  pauseNote?: string;
};
