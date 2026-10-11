export type ProjectStatus = "active" | "paused" | "stopped" | "completed";

export type Project = {
  id: string;
  name: string;
  icon?: string;
  mainTaskId?: string;
  spaceId?: string;
  area?: string;
  purpose?: string;
  scope?: string;
  doneWhen?: string;
  description?: string;
  status: ProjectStatus;
  createdAt: Date;
};
