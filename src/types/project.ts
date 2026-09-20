export type ProjectStatus = "active" | "paused" | "completed";

export type Project = {
  id: string;
  name: string;
  icon?: string;
  description?: string;
  status: ProjectStatus;
  createdAt: Date;
};
