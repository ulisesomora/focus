import { spaceColor } from "./spaceColors";
import type { Task } from "../types/task";
import { defaultAreas } from "../types/settings";
import type { AppSettings } from "../types/settings";

export function taskInSpace(task: Pick<Task, "spaceId">, spaceId?: string) {
  return (task.spaceId || undefined) === (spaceId || undefined);
}
export function taskSpace(task: Pick<Task, "spaceId">, settings: AppSettings) {
  return settings.spaces?.find(space => space.id === task.spaceId);
}
export function taskAgendaStyle(task: Pick<Task, "spaceId">, settings: AppSettings) {
  const space = taskSpace(task, settings);
  return space ? { borderColor: spaceColor(space.color), backgroundColor: `${spaceColor(space.color)}18`, borderLeftWidth: 4 } : {};
}
export function taskInAgenda(task: Pick<Task, "spaceId">, settings: AppSettings) {
  return !task.spaceId || taskSpace(task, settings)?.showInAgenda !== false;
}

export function areasForSpace(settings: AppSettings, spaceId?: string) {
  return spaceId ? settings.spaces?.find(space => space.id === spaceId)?.areas ?? [] : settings.areas?.length ? settings.areas : defaultAreas;
}

export function areaForTask(settings: AppSettings, task: Pick<Task, "spaceId" | "area">) {
  return areasForSpace(settings, task.spaceId).find(area => area.id === task.area)
    ?? areasForSpace(settings).find(area => area.id === task.area)
    ?? settings.spaces?.flatMap(space => space.areas ?? []).find(area => area.id === task.area);
}

export function prepareTaskSpaceMove(settings: AppSettings, task: Pick<Task, "spaceId" | "area">, spaceId?: string, newAreaId = crypto.randomUUID()) {
  if ((task.spaceId || undefined) === spaceId) return { patch: { spaceId, area: task.area }, settingsPatch: undefined };
  const source = areaForTask(settings, task);
  if (!source) return { patch: { spaceId, area: undefined }, settingsPatch: undefined };
  const targetAreas = areasForSpace(settings, spaceId);
  const match = targetAreas.find(area => area.name.trim().toLocaleLowerCase("es") === source.name.trim().toLocaleLowerCase("es"));
  if (match) return { patch: { spaceId, area: match.id }, settingsPatch: undefined };
  const areas = [...targetAreas, { id: newAreaId, name: source.name }];
  return { patch: { spaceId, area: newAreaId }, settingsPatch: spaceId ? { spaces: settings.spaces?.map(space => space.id === spaceId ? { ...space, areas } : space) } : { areas } };
}
