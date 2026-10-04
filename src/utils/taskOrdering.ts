import type { Task } from "../types/task";

export function orderTasks(tasks: Task[], saved: string[] = []): Task[] {
  const positions = new Map(saved.map((id, index) => [id, index]));
  return [...tasks].sort((a, b) => {
    const ai = positions.get(a.id), bi = positions.get(b.id);
    if (ai !== undefined && bi !== undefined) return ai - bi;
    if (ai !== undefined) return 1;
    if (bi !== undefined) return -1;
    return Number(a.status === "completed") - Number(b.status === "completed")
      || (a.plannedDate ?? "9999").localeCompare(b.plannedDate ?? "9999")
      || (a.plannedTime ?? "").localeCompare(b.plannedTime ?? "");
  });
}

// Reorder visible slots only; tasks hidden by a label filter keep their positions.
export function reorderVisibleTasks(fullIds: string[], visibleIds: string[], source: string, target: string, edge: "before" | "after"): string[] {
  if (source === target || !visibleIds.includes(source) || !visibleIds.includes(target)) return fullIds;
  const ordered = visibleIds.filter(id => id !== source);
  ordered.splice(ordered.indexOf(target) + Number(edge === "after"), 0, source);
  const visible = new Set(visibleIds);
  let index = 0;
  return fullIds.map(id => visible.has(id) ? ordered[index++] : id);
}
