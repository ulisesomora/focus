import type { Task } from "../types/task";

export function isBacklog(task: Task): boolean {
  return task.backlog ?? task.status === "backlog";
}
