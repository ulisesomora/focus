import { HabitSection } from "../components/habits/HabitList";
import { isBacklog } from "../utils/taskBacklog";
import { visibleOutsideProject } from "../utils/projectStructure";
import { TaskProjectIcon } from "../components/projects/TaskProjectLink";
import { spaceColor } from "../utils/spaceColors";
import { type SpaceView } from "../components/tasks/SpaceNavigation";
import { areaForTask, areasForSpace, taskAgendaStyle, taskSpace, taskInSpace } from "../utils/taskSpaces";
import { DurationBadge } from "../components/tasks/TaskDuration";
import { CompletedToday } from "../components/today/CompletedToday";
import { CompletionFilter, type CompletionView } from "../components/tasks/CompletionFilter";
import { TaskDayBadges, TaskDayToggle } from "../components/tasks/TaskDayToggle";
import { TodayPreview } from "../components/today/TodayPreview";
import { useTaskDays, tasksForDay, overdueTasks } from "../utils/taskDays";
import { LabelFilter, matchesLabel } from "../components/labels/LabelPicker";
import { useEffect, useMemo, useState } from "react";
import { Check, ChevronRight, MoreHorizontal } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { MobileLayout } from "../components/layout/MobileLayout";
import { SimpleTaskSheet } from "../components/tasks/SimpleTaskSheet";
import { DesktopTodayWorkspace } from "../components/today/DesktopTodayWorkspace";
import type { TaskEditorValue } from "../components/tasks/TaskEditorSheet";
import { useApp } from "../context/AppContext";
import type { Task } from "../types/task";

const colors = [
  { card: "bg-indigo-50 text-indigo-700", label: "bg-indigo-50 text-indigo-700" },
  { card: "bg-emerald-50 text-emerald-700", label: "bg-emerald-50 text-emerald-700" },
  { card: "bg-pink-50 text-pink-700", label: "bg-pink-50 text-pink-700" },
  { card: "bg-gray-100 text-gray-700", label: "bg-gray-100 text-gray-600" },
];

export function TodayPage({ daily = false, backlog = false, spaceId: routeSpaceId }: { daily?: boolean; backlog?: boolean; spaceId?: string }) {
  const { today, tomorrow } = useTaskDays();
  const [params, setParams] = useSearchParams();
  const view: SpaceView = backlog ? "tasks" : params.get("view") === "today" ? "today" : params.get("view") === "tomorrow" ? "tomorrow" : "tasks";
  const changeView = (value: SpaceView) => { const next = new URLSearchParams(params); next.set("view", value); setParams(next); };
  const { tasks, settings, createTask, moveTask, updateTask } = useApp();
  const [mobileTab, setMobileTab] = useState<"general" | "spaces">(backlog && params.get("space") ? "spaces" : "general");
  const [mobileSpaceId, setMobileSpaceId] = useState<string | undefined>(backlog ? params.get("space") ?? undefined : undefined);
  const backlogSpace = params.get("space");
  useEffect(() => {
    if (!backlog) return;
    setMobileSpaceId(backlogSpace ?? undefined);
    setMobileTab(backlogSpace ? "spaces" : "general");
    setSelectedArea(null);
  }, [backlog, backlogSpace]);
  const spaceId = routeSpaceId ?? (mobileTab === "spaces" ? mobileSpaceId : undefined);
  const selectingSpace = !daily && !routeSpaceId && mobileTab === "spaces";

  const areas = areasForSpace(settings, spaceId);
  const [completionView, setCompletionView] = useState<CompletionView>("pending");
  const [labelFilter, setLabelFilter] = useState("");
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [menuId, setMenuId] = useState<string | null>(null);

  useEffect(() => {
    const openTask = () => { if (selectingSpace && !spaceId) { window.alert("Selecciona un espacio para crear la tarea."); return; } setEditorOpen(true); };
    window.addEventListener("focus-open-task", openTask);
    return () => window.removeEventListener("focus-open-task", openTask);
  }, [selectingSpace, spaceId]);

  const assigned = useMemo(() => tasks.filter((task) => task.status !== "cancelled" && isBacklog(task) === backlog && (daily || visibleOutsideProject(task)) && (!selectingSpace || !!spaceId) && (daily && !spaceId || taskInSpace(task, spaceId))), [tasks, spaceId, daily, selectingSpace, backlog]);
  const visible = useMemo(() => assigned.filter(task => (!selectedArea || task.area === selectedArea) && (view === "tasks" || tasksForDay([task], view === "today" ? today : tomorrow).length > 0) && matchesLabel(task.labels, labelFilter) && (daily ? task.status !== "completed" : completionView === "all" || (task.status === "completed") === (completionView === "completed")))
    .sort((a, b) => Number(a.status === "completed") - Number(b.status === "completed")
      || (a.plannedDate ?? "9999").localeCompare(b.plannedDate ?? "9999")
      || (a.plannedTime ?? "").localeCompare(b.plannedTime ?? "")), [assigned, labelFilter, daily, completionView, spaceId, selectedArea, view, today, tomorrow]);

  const sections = daily
    ? [...(overdueTasks(visible, today).length ? [{ title: "Tareas atrasadas", tasks: overdueTasks(visible, today) }] : []), { title: "Hoy", tasks: tasksForDay(visible, today) }, { title: "Mañana", tasks: tasksForDay(visible, tomorrow) }]
    : [{ title: settings.spaces?.find(space => space.id === spaceId)?.name ?? (selectingSpace ? "Selecciona un espacio" : "General"), tasks: visible }];

  const day = new Intl.DateTimeFormat("es-MX", { weekday: "long", day: "numeric", month: "short" }).format(new Date());
  const headerDate = day.charAt(0).toUpperCase() + day.slice(1).replace(".", "");

  function toggleSubtask(task: Task, subtaskId: string) {
    updateTask(task.id, { subtasks: task.subtasks?.map((item) => item.id === subtaskId ? { ...item, completed: !item.completed } : item) });
  }

  function create(value: TaskEditorValue) {
    createTask({ ...value, backlog, spaceId, ...(spaceId && view !== "tasks" ? { workDates: [view === "today" ? today : tomorrow] } : {}), status: "pending" });
  }

  function areaFor(task: Task) {
    return areaForTask(settings, task);
  }

  return (
    <MobileLayout wideDesktop>
      {!daily && <DesktopTodayWorkspace backlog={backlog} key={spaceId ?? "general"} view={view} onViewChange={changeView} spaceId={spaceId} onAreaChange={setSelectedArea} />}
      <div className={`mx-auto max-w-2xl ${daily ? "" : "lg:hidden"}`}>
        {backlog && <h1 className="mb-3 text-xl font-bold">Backlog</h1>}
        <header className="mb-4 flex items-baseline gap-2">
          {!daily && !routeSpaceId ? <div role="tablist" aria-label="Lugar de las tareas" className="flex gap-1 rounded-lg bg-gray-100 p-1">
            {([["general", "General"], ["spaces", "Espacios"]] as const).map(([value, label]) => <button key={value} role="tab" aria-selected={mobileTab === value} type="button" onClick={() => { setMobileTab(value); setSelectedArea(null); setMenuId(null); }} className={`rounded-md px-3 py-1.5 text-sm font-semibold ${mobileTab === value ? "bg-white text-gray-950 shadow-sm" : "text-gray-400"}`}>{label}</button>)}
          </div> : <h1 className="text-xl font-bold text-gray-950">{daily ? "Hoy" : settings.spaces?.find(space => space.id === spaceId)?.name ?? "General"}</h1>}
          <span className="text-sm font-medium text-gray-500">{headerDate}</span>
        </header>

        {!daily && <>
        {selectingSpace ? <div className="-mx-4 overflow-x-auto overscroll-x-contain" aria-label="Seleccionar espacio">
          <div className="grid w-max min-w-full auto-cols-[126px] grid-flow-col grid-rows-2 gap-1.5">
            {settings.spaces?.map(space => <button key={space.id} type="button" aria-pressed={spaceId === space.id} onClick={() => { setMobileSpaceId(space.id); setSelectedArea(null); setMenuId(null); }} className={`flex h-9 items-center justify-center gap-1.5 rounded-lg border px-1.5 text-[11px] font-semibold ${spaceId === space.id ? "text-white" : ""}`} style={{ backgroundColor: spaceId === space.id ? spaceColor(space.color) : `${spaceColor(space.color)}18`, color: spaceId === space.id ? "#ffffff" : spaceColor(space.color), borderColor: spaceId === space.id ? spaceColor(space.color) : "transparent" }}><span className="truncate">{space.name}</span><span>{tasks.filter(task => isBacklog(task) === backlog && task.spaceId === space.id && task.status !== "cancelled" && task.status !== "completed").length}</span></button>)}
            <Link to="/spaces" className="flex h-9 items-center justify-center rounded-lg bg-white px-2 text-[11px] text-gray-500">Administrar espacios</Link>
          </div>
        </div> : <>
        <div className="-mx-4 overflow-x-auto overscroll-x-contain" aria-label="Áreas">
          <div className="grid w-max min-w-full auto-cols-[126px] grid-flow-col grid-rows-2 justify-center gap-1.5">
          {areas.map((area, index) => {
            const count = assigned.filter((task) => task.area === area.id && task.status !== "completed").length;
            return (
              <Link key={area.id} to={spaceId ? `?view=${view}` : `/areas/${area.id}`} onClick={spaceId || backlog ? event => { event.preventDefault(); setSelectedArea(current => current === area.id ? null : area.id); } : undefined} aria-current={selectedArea === area.id ? "true" : undefined} className={`flex h-9 min-w-0 items-center justify-center gap-1.5 rounded-lg px-1.5 text-center ${selectedArea === area.id ? "ring-2 ring-indigo-400" : ""} ${colors[index % colors.length].card}`}>
                <span className="truncate text-[11px] font-semibold">{area.name}</span>
                <span className="shrink-0 text-[11px] font-bold">{count}</span>
              </Link>
            );
          })}
          <Link to={spaceId ? `/spaces/${spaceId}/areas` : "/areas"} className="flex h-9 min-w-0 items-center justify-center gap-1 rounded-lg bg-white px-1.5 text-[11px] font-medium text-gray-600">Ver todas las áreas <ChevronRight size={13} /></Link>
          </div>
        </div>

        </>}
        {!backlog && (!selectingSpace || spaceId) && <TodayPreview spaceId={spaceId} />}
        </>}

        {daily && <HabitSection daily spaceId={spaceId} allSpaces hideWhenEmpty />}
        <div className="mt-3 flex items-center gap-2">
          {!daily && <CompletionFilter value={completionView} onChange={setCompletionView} />}
          <div className="min-w-0 flex-1"><LabelFilter compact value={labelFilter} onChange={setLabelFilter} /></div>
        </div>
        {sections.filter(section => !daily || section.tasks.length > 0).map((section) => <section key={section.title} className="mt-5" aria-label={section.title}>
          <h2 className="mb-1 text-sm font-semibold text-gray-800">{section.title} <span className="ml-1 text-xs text-gray-400">{section.tasks.length}</span></h2>
          {section.tasks.length ? section.tasks.map((task) => {
            const completed = task.status === "completed";
            const area = areaFor(task);
            const areaIndex = Math.max(0, areas.findIndex((item) => item.id === area?.id));
            return (
              <div key={task.id} style={daily ? taskAgendaStyle(task, settings) : undefined} className={`border-b border-gray-200 py-3 ${daily && task.spaceId ? "rounded-lg px-3" : ""}`}>
                <div className="flex items-start gap-2.5">
                  <button type="button" onClick={() => moveTask(task.id, completed ? "pending" : "completed")}
                    aria-label={`${completed ? "Marcar pendiente" : "Marcar realizada"}: ${task.title}`}
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${completed ? "border-gray-400 bg-gray-400 text-white" : "border-gray-300 text-transparent hover:border-gray-500"}`}>
                    <Check size={14} strokeWidth={3} />
                  </button>
                  <TaskProjectIcon task={task} />
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm leading-5 ${completed ? "text-gray-400 line-through" : "text-gray-900"}`}>{task.title}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-1">
                      {daily && taskSpace(task, settings) && <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold" style={{ color: spaceColor(taskSpace(task, settings)?.color) }}>{taskSpace(task, settings)?.name}</span>}
                      {area && <span className={`rounded px-1 py-0.5 text-[10px] font-semibold uppercase ${colors[areaIndex % colors.length].label}`}>{area.name}</span>}
                      {task.labels?.map((label) => <span key={label} className="rounded bg-gray-100 px-1 py-0.5 text-[10px] text-gray-600">{label}</span>)}
                      <TaskDayBadges task={task} /><DurationBadge minutes={task.estimatedMinutes} />
                      {completed && <span className="text-[10px] text-gray-500">{task.completedAt ? `Completada: ${new Date(task.completedAt).toLocaleDateString("es-MX")}` : "Completada · Sin fecha registrada"}</span>}
                      {task.plannedTime && <span className="text-[10px] text-gray-500">{task.plannedTime}</span>}
                    </div>
                  </div>
                  <div className="relative flex shrink-0 items-center">
                    <button type="button" onClick={() => setMenuId((current) => current === task.id ? null : task.id)} aria-label={`Opciones de ${task.title}`} aria-expanded={menuId === task.id} className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"><MoreHorizontal size={19} /></button>
                    <Link to={`/tasks/${task.id}`} aria-label={`Ver tarea completa: ${task.title}`} className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"><ChevronRight size={19} /></Link>
                    {menuId === task.id && (
                      <div className="absolute right-0 top-9 z-20 w-44 rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg">
                        <button type="button" onClick={() => { updateTask(task.id, { backlog: !isBacklog(task) }); setMenuId(null); }} className="block w-full rounded-lg px-2 py-2 text-left text-xs font-semibold text-gray-700 hover:bg-gray-100">{backlog ? "Mover a Tareas" : "Mover a Backlog"}</button>
                        <p className="px-2 py-1 text-[11px] font-semibold text-gray-400">Planificar</p>
                        <TaskDayToggle task={task} />
                        <p className="border-t border-gray-100 px-2 py-1 text-[11px] font-semibold text-gray-400">Asignar área</p>
                        <button type="button" onClick={() => { updateTask(task.id, { area: undefined }); setMenuId(null); }} className="block w-full rounded-lg px-2 py-2 text-left text-xs text-gray-700 hover:bg-gray-100">Sin área{!area ? " ✓" : ""}</button>
                        {areasForSpace(settings, task.spaceId).map((option) => <button key={option.id} type="button" onClick={() => { updateTask(task.id, { area: option.id }); setMenuId(null); }} className="block w-full rounded-lg px-2 py-2 text-left text-xs text-gray-700 hover:bg-gray-100">{option.name}{area?.id === option.id ? " ✓" : ""}</button>)}
                        <Link to={spaceId ? `/spaces/${spaceId}/areas` : "/areas"} className="block border-t border-gray-100 px-2 py-2 text-xs font-medium text-gray-600">Administrar áreas</Link>
                      </div>
                    )}
                  </div>
                </div>
                {!!task.subtasks?.length && (
                  <details className="group ml-8 mt-2" aria-label={`Subtareas de ${task.title}`}>
                    <summary className="flex min-h-8 cursor-pointer list-none items-center gap-1.5 text-xs font-medium text-gray-500 [&::-webkit-details-marker]:hidden">
                      <ChevronRight size={14} className="shrink-0 transition-transform group-open:rotate-90" />
                      <span>Subtareas</span>
                      <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-600">{task.subtasks.filter(item => item.completed).length}/{task.subtasks.length}</span>
                    </summary>
                    <div className="mt-1 border-l border-gray-200 pl-3">
                      {task.subtasks.map((subtask) => <button key={subtask.id} type="button" onClick={() => toggleSubtask(task, subtask.id)} aria-pressed={subtask.completed} aria-label={`${subtask.completed ? "Marcar pendiente" : "Completar"} subtarea: ${subtask.title}`} className="flex min-h-9 w-full items-start gap-2 py-1.5 text-left">
                        <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${subtask.completed ? "border-gray-400 bg-gray-400 text-white" : "border-gray-300 text-transparent"}`}><Check size={11} strokeWidth={3} /></span>
                        <span className={`min-w-0 break-words text-xs leading-5 ${subtask.completed ? "text-gray-400 line-through" : "text-gray-700"}`}>{subtask.title}</span>
                      </button>)}
                    </div>
                  </details>
                )}
              </div>
            );
          }) : <p className="py-10 text-center text-sm text-gray-500">{daily ? `No hay tareas planificadas para ${section.title.toLowerCase()}${labelFilter ? " con esta etiqueta" : ""}.` : "No hay tareas con este filtro."}</p>}
        </section>)}
        {daily && <CompletedToday spaceId={spaceId} allSpaces={!spaceId} />}
      </div>
      <SimpleTaskSheet spaceId={spaceId} initialArea={selectedArea ?? undefined} open={editorOpen} onClose={() => setEditorOpen(false)} onSave={create} />
    </MobileLayout>
  );
}
