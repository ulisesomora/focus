import type { Project } from "../types/project";
import type { Task } from "../types/task";

export function projectChildren(tasks: Task[], project: Project) {
  return tasks.filter(task => task.id !== project.mainTaskId && task.projectRole !== "main" && task.status !== "cancelled"
    && (task.projectId === project.id || (!task.projectId && task.project === project.name)));
}
export function projectColumn(task: Task) {
  return task.status === "completed" ? "completed" : ["in_progress", "paused", "review"].includes(task.status) ? "in_progress" : "pending";
}
export function buildTaskProject(task: Task, splitSubtasks: boolean, projectId: string, newId: () => string, now = new Date()) {
  const project: Project = { id: projectId, name: task.title, description: task.description, status: task.status === "completed" ? "completed" : "active", createdAt: now, mainTaskId: task.id, spaceId: task.spaceId, area: task.area };
  const main: Task = { ...task, projectId, projectRole: "main", kind: "project", project: task.title, ...(splitSubtasks ? { subtasks: [] } : {}) };
  const children: Task[] = splitSubtasks ? (task.subtasks ?? []).map(item => ({ id: newId(), title: item.title, status: item.completed ? "completed" : "pending", completedAt: item.completed ? now : undefined, createdAt: now, spaceId: task.spaceId, area: task.area, labels: [...(task.labels ?? [])], projectId, projectRole: "child", project: task.title })) : [];
  return { project, main, children };
}

// A project owns its children; external lists are an optional view of the same task.
export function visibleOutsideProject(task: Task) {
  return task.projectRole !== "child" || task.showOutsideProject === true;
}
export function projectDeletion(tasks: Task[], project: Project, deleteChildren: boolean) {
  const linked = tasks.filter(task => task.id === project.mainTaskId || task.projectId === project.id || (!task.projectId && task.project === project.name));
  const removedIds = linked.filter(task => deleteChildren || task.id === project.mainTaskId || task.projectRole === "main").map(task => task.id);
  const kept = linked.filter(task => !removedIds.includes(task.id)).map(task => ({ ...task, kind: "task" as const, projectId: undefined, projectRole: undefined, project: undefined, showOutsideProject: undefined }));
  return { removedIds, kept };
}
