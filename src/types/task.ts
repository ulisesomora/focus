export type TaskStatus =
  | "backlog"
  | "pending"
  | "in_progress"
  | "paused"
  | "review"
  | "completed"
  | "cancelled";

export type TaskPriority = "low" | "medium" | "high";

export type TaskSubtask = {
  id: string;
  title: string;
  completed: boolean;
};

export type Task = {
  id: string;
  title: string;
  status: TaskStatus;
  project?: string;
  priority?: TaskPriority;
  description?: string;
  subtasks?: TaskSubtask[];

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
