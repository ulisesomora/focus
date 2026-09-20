export type ActivityEntityType =
  | "task"
  | "habit"
  | "goal"
  | "project"
  | "routine"
  | "capture";

export type ActivityKind =
  | "created"
  | "updated"
  | "started"
  | "paused"
  | "resumed"
  | "moved"
  | "planned"
  | "review"
  | "completed"
  | "cancelled"
  | "progress";

export type Activity = {
  id: string;
  entityType: ActivityEntityType;
  entityId: string;
  kind: ActivityKind;
  title: string;
  message: string;
  project?: string;
  note?: string;
  createdAt: Date;
};
