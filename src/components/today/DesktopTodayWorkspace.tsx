import { isBacklog } from "../../utils/taskBacklog";
import { projectChildren, visibleOutsideProject } from "../../utils/projectStructure";
import { TaskProjectIcon, TaskProjectLink } from "../projects/TaskProjectLink";
import { spaceColor } from "../../utils/spaceColors";
import { type SpaceView } from "../tasks/SpaceNavigation";
import { tasksForDay, useTaskDays } from "../../utils/taskDays";
import { areasForSpace, taskInSpace } from "../../utils/taskSpaces";
import { TaskDayToggle } from "../tasks/TaskDayToggle";
import { TaskDuration } from "../tasks/TaskDuration";
import { CompletionFilter, type CompletionView } from "../tasks/CompletionFilter";
import { TodayPreview } from "./TodayPreview";
import { orderTasks, reorderVisibleTasks } from "../../utils/taskOrdering";
import { LabelPicker, LabelFilter, matchesLabel, useLabelCatalog } from "../labels/LabelPicker";
import { useEffect, useMemo, useState } from "react";
import { GripVertical, Check, ChevronRight, CirclePause, ClipboardCheck, Pencil, Play, RotateCcw, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import type { Task } from "../../types/task";
import { TaskBadges } from "../tasks/TaskMetadataPanel";
import { HabitEditorSheet } from "../habits/HabitEditorSheet";
import { TaskPlannerSheet } from "../tasks/TaskPlannerSheet";
import { TaskFeaturesPanel } from "../tasks/TaskFeaturesPanel";

const statusNames: Record<string, string> = {
  pending: "Pendiente", in_progress: "En proceso", paused: "En pausa",
  review: "En revisión", completed: "Finalizada",
};

export function DesktopTodayWorkspace({ onAreaChange, spaceId, view = "tasks", projectId, backlog = false }: { onAreaChange: (area: string | null) => void; spaceId?: string; backlog?: boolean; projectId?: string; view?: SpaceView; onViewChange?: (view: SpaceView) => void }) {
  const { tasks, projects, settings, updateSettings, addHabit, moveTask, updateTask, deleteTask, startTask, pauseTask, setActiveTask } = useApp();
  const { today, tomorrow } = useTaskDays();
  const project = projects.find(item => item.id === projectId);
  const areas = project ? [...areasForSpace(settings), ...(settings.spaces ?? []).flatMap(item => item.areas ?? [])].filter((area, index, all) => all.findIndex(item => item.id === area.id) === index) : areasForSpace(settings, spaceId);
  const labelCatalog = useLabelCatalog();
  const [completionView, setCompletionView] = useState<CompletionView>("pending");
  const [labelFilter, setLabelFilter] = useState("");
  const [areaId, setAreaId] = useState<string | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);
  const navigate = useNavigate();
  const [habitOpen, setHabitOpen] = useState(false);
  const [plannerOpen, setPlannerOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [taskTitle, setTaskTitle] = useState("");
  const [pauseReason, setPauseReason] = useState("");
  const assigned = useMemo(() => (project ? projectChildren(tasks, project) : tasks).filter((task) => isBacklog(task) === backlog && task.status !== "cancelled" && (view !== "tasks" || visibleOutsideProject(task)) && (view !== "tasks" && !spaceId || taskInSpace(task, spaceId))), [tasks, spaceId, project, view, backlog]);
  const orderKey = `${backlog ? "backlog:" : ""}${projectId ? `project:${projectId}:` : ""}${spaceId ? `space:${spaceId}:` : ""}${areaId ? `area:${areaId}` : "all"}`;
  const scoped = useMemo(() => orderTasks(assigned.filter(task => !areaId || task.area === areaId), settings.desktopTaskOrders?.[orderKey]), [assigned, areaId, settings.desktopTaskOrders, orderKey]);
  const visible = useMemo(() => scoped.filter(task => (view === "tasks" || tasksForDay([task], view === "today" ? today : tomorrow).length > 0) && matchesLabel(task.labels, labelFilter) && (completionView === "all" || (task.status === "completed") === (completionView === "completed"))), [scoped, labelFilter, completionView, view, today, tomorrow]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{ id: string; edge: "before" | "after" } | null>(null);
  const [orderMessage, setOrderMessage] = useState("");
  useEffect(() => { setDraggingId(null); setDropTarget(null); setOrderMessage(""); }, [areaId, labelFilter]);
  function saveOrder(source: string, target: string, edge: "before" | "after") {
    const ids = reorderVisibleTasks(scoped.map(task => task.id), visible.map(task => task.id), source, target, edge);
    if (ids.some((id, index) => id !== scoped[index]?.id)) {
      updateSettings({ desktopTaskOrders: { ...(settings.desktopTaskOrders ?? {}), [orderKey]: ids } });
      setOrderMessage("Orden actualizado");
    }
    setDraggingId(null); setDropTarget(null);
  }
  const selected = tasks.find((task) => task.id === taskId) ?? null;
  const shownArea = areas.find((area) => area.id === areaId);

  useEffect(() => {
    if (selected && visible.some((task) => task.id === selected.id)) return;
    setTaskId(visible[0]?.id ?? null);
  }, [selected, visible]);

  useEffect(() => { setEditorOpen(false); setPauseReason(""); setHabitOpen(false); setPlannerOpen(false); }, [taskId]);

  useEffect(() => { if (labelFilter && labelFilter !== "__none" && !labelCatalog.includes(labelFilter)) setLabelFilter(""); }, [labelCatalog, labelFilter]);

  useEffect(() => { if (areaId && !areas.some(area => area.id === areaId)) { setAreaId(null); onAreaChange(null); } }, [areas, areaId, onAreaChange]);

  function selectArea(id: string | null) { setAreaId(id); onAreaChange(id); }

  function toggleSubtask(task: Task, subtaskId: string) {
    updateTask(task.id, { subtasks: task.subtasks?.map((item) => item.id === subtaskId ? { ...item, completed: !item.completed } : item) });
  }

  const day = new Intl.DateTimeFormat("es-MX", { weekday: "long", day: "numeric", month: "short" }).format(new Date());
  const date = day.charAt(0).toUpperCase() + day.slice(1).replace(".", "");

  return (
    <div className="hidden lg:block">
      <header className="mb-5 flex items-baseline gap-3">
        <h1 className="text-2xl font-bold text-gray-900">{backlog ? "Backlog" : project?.name ?? settings.spaces?.find(space => space.id === spaceId)?.name ?? "General"}</h1>
        <span className="text-sm text-gray-500">{date}</span>
      </header>
      <div className={`grid ${project ? "h-[calc(100dvh-320px)] min-h-[320px]" : "h-[calc(100dvh-145px)] min-h-0"} min-w-0 grid-cols-[160px_minmax(0,1fr)_minmax(0,1.15fr)] overflow-hidden rounded-2xl border border-gray-200 bg-white xl:grid-cols-[210px_minmax(0,1fr)_minmax(0,1.3fr)]`}>
        <aside className={`grid min-h-0 min-w-0 ${project ? "grid-rows-1" : "grid-rows-2"} border-r border-gray-200`}>
          <div className="min-h-0 overflow-y-auto overscroll-contain p-3">
          <div className="mb-3 flex items-center justify-between px-1">
            <h2 className="text-sm font-bold text-gray-800">Áreas</h2>
            <Link to={spaceId ? `/spaces/${spaceId}/areas` : "/areas"} className="text-xs font-medium text-gray-500">Editar</Link>
          </div>
          <button type="button" onClick={() => selectArea(null)} className={`mb-1 w-full rounded-lg px-2 py-2 text-left text-xs font-semibold ${!areaId ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-50"}`}>Todas <span className="float-right">{assigned.length}</span></button>
          <div className="space-y-1">
            {areas.map((area) => <button key={area.id} type="button" onClick={() => selectArea(area.id)}
              className={`w-full rounded-lg px-2 py-2 text-left text-xs font-medium ${areaId === area.id ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-50"}`}>
              <span className="flex items-center justify-between gap-1"><span className="min-w-0 truncate">{area.name}</span><span>{assigned.filter((task) => task.area === area.id).length}</span></span>
            </button>)}
          </div>
          </div>
          <section aria-label="Espacios registrados" hidden={!!project} className="min-h-0 overflow-y-auto overscroll-contain border-t border-gray-200 p-3">
            <div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-bold text-gray-800">Espacios</h2><Link to="/spaces" className="text-xs text-gray-500">Editar</Link></div>
            <Link to={backlog ? "/backlog" : "/"} className={`mb-1 block rounded-lg px-2 py-2 text-xs font-semibold ${!spaceId ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-50"}`}>General</Link>
            {settings.spaces?.map(space => <Link key={space.id} to={backlog ? `/backlog?space=${space.id}` : `/spaces/${space.id}`} aria-current={spaceId === space.id ? "page" : undefined} className={`mb-1 flex items-center gap-2 rounded-lg px-2 py-2 text-xs ${spaceId === space.id ? "font-semibold" : "text-gray-600 hover:bg-gray-50"}`} style={spaceId === space.id ? { backgroundColor: `${spaceColor(space.color)}18`, color: spaceColor(space.color) } : undefined}><span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: spaceColor(space.color) }} /><span className="min-w-0 flex-1 truncate">{space.name}</span><span>{tasks.filter(task => isBacklog(task) === backlog && task.spaceId === space.id && task.status !== "cancelled").length}</span></Link>)}
            {!settings.spaces?.length && <p className="text-xs text-gray-400">Crea tu primer espacio desde Editar.</p>}
          </section>
        </aside>

        <section className="min-h-0 min-w-0 overflow-y-auto overscroll-contain border-r border-gray-200">
          <div className="border-b border-gray-100 px-4 py-3">
            <h2 className="text-sm font-bold text-gray-900">{shownArea?.name ?? project?.name ?? settings.spaces?.find(space => space.id === spaceId)?.name ?? "General"}</h2>
            <p className="text-xs text-gray-500">{visible.length} {visible.length === 1 ? "tarea" : "tareas"}</p>
            <p className="mt-1 text-[10px] text-gray-400">Arrastra el ícono para ordenar</p>
            <span role="status" className="sr-only">{orderMessage}</span>
            {!project && !backlog && <TodayPreview spaceId={spaceId} />}
            <div className="mt-2 flex items-center gap-2"><CompletionFilter value={completionView} onChange={setCompletionView} /><div className="min-w-0 flex-1"><LabelFilter compact value={labelFilter} onChange={setLabelFilter} /></div></div>
          </div>
          {visible.length ? visible.map((task) => {
            const completed = task.status === "completed";
            const expanded = expandedTasks.has(task.id);
            return <div key={task.id} data-task-row={task.id}
              onDragOver={event => {
                if (!draggingId || draggingId === task.id) return;
                event.preventDefault(); event.dataTransfer.dropEffect = "move";
                const rect = event.currentTarget.getBoundingClientRect();
                setDropTarget({ id: task.id, edge: event.clientY < rect.top + rect.height / 2 ? "before" : "after" });
              }}
              onDrop={event => {
                if (!draggingId || draggingId === task.id) return;
                event.preventDefault();
                const rect = event.currentTarget.getBoundingClientRect();
                saveOrder(draggingId, task.id, event.clientY < rect.top + rect.height / 2 ? "before" : "after");
              }}
              className={`relative border-b border-gray-100 px-3 py-2 last:border-0 ${selected?.id === task.id ? "bg-indigo-50/60" : ""} ${draggingId === task.id ? "opacity-40" : ""}`}>
              {dropTarget?.id === task.id && <span aria-hidden="true" className={`pointer-events-none absolute inset-x-0 z-10 h-0.5 bg-indigo-500 ${dropTarget.edge === "before" ? "top-0" : "bottom-0"}`} />}

              <div className="flex items-start gap-2">
                <button type="button" draggable aria-label={`Ordenar tarea: ${task.title}`} title="Arrastra para ordenar. Alt + flecha arriba/abajo también mueve la tarea." onDragStart={event => { event.dataTransfer.effectAllowed = "move"; event.dataTransfer.setData("application/x-focus-task", task.id); setDraggingId(task.id); setOrderMessage(""); }} onDragEnd={() => { setDraggingId(null); setDropTarget(null); }} onKeyDown={event => {
                  if (!event.altKey || !["ArrowUp", "ArrowDown"].includes(event.key)) return;
                  event.preventDefault();
                  const index = visible.findIndex(item => item.id === task.id);
                  const neighbor = visible[index + (event.key === "ArrowUp" ? -1 : 1)];
                  if (neighbor) saveOrder(task.id, neighbor.id, event.key === "ArrowUp" ? "before" : "after");
                }} className="mt-0.5 flex h-5 w-4 shrink-0 cursor-grab items-center justify-center rounded text-gray-300 hover:text-gray-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400 active:cursor-grabbing"><GripVertical size={15} /></button>
                <button type="button" onClick={() => moveTask(task.id, completed ? "pending" : "completed")} aria-label={`${completed ? "Marcar pendiente" : "Completar"} ${task.title}`}
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${completed ? "border-gray-400 bg-gray-400 text-white" : "border-gray-300 text-transparent"}`}><Check size={14} /></button>
                <TaskProjectIcon task={task} />
                <button type="button" onClick={() => setTaskId(task.id)} className="min-w-0 flex-1 text-left">
                  <span className={`block text-sm leading-5 ${completed ? "text-gray-400 line-through" : "text-gray-900"}`}>{task.title}</span>
                  <TaskBadges task={task} includeArea hideProject={!!project} />
                </button>
                {!!task.subtasks?.length && <button type="button" aria-label={`${expanded ? "Ocultar" : "Mostrar"} subtareas de ${task.title}`} aria-expanded={expanded} aria-controls={`subtasks-${task.id}`} onClick={() => setExpandedTasks(current => { const next = new Set(current); if (next.has(task.id)) next.delete(task.id); else next.add(task.id); return next; })} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100">
                  <ChevronRight size={16} className={`transition-transform ${expanded ? "rotate-90" : ""}`} />
                </button>}
              </div>
              {expanded && !!task.subtasks?.length && <div id={`subtasks-${task.id}`} className="ml-12 mt-2 space-y-1 border-l border-gray-200 pl-3">
                {task.subtasks.map(item => <div key={item.id} className="flex items-start gap-2 py-1">
                  <button type="button" aria-label={`${item.completed ? "Marcar pendiente" : "Completar"} subtarea: ${item.title}`} aria-pressed={item.completed} onClick={() => toggleSubtask(task, item.id)} className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${item.completed ? "border-gray-400 bg-gray-400 text-white" : "border-gray-300 text-transparent"}`}><Check size={11} /></button>
                  <button type="button" onClick={() => setTaskId(task.id)} className={`min-w-0 flex-1 break-words text-left text-xs leading-5 ${item.completed ? "text-gray-400 line-through" : "text-gray-600"}`}>{item.title}</button>
                </div>)}
              </div>}
            </div>;
          }) : <p className="px-4 py-10 text-center text-sm text-gray-500">No hay tareas en esta área.</p>}
        </section>

        <section className="min-h-0 min-w-0 overflow-y-auto overscroll-contain p-3 xl:p-4">
          {selected && visible.some((task) => task.id === selected.id) ? (
            <>
              <div className="mb-4 flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1"><p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">Tarea seleccionada</p>
                  {editorOpen ? <form className="mt-2" onSubmit={event => { event.preventDefault(); if (!taskTitle.trim()) return; updateTask(selected.id, { title: taskTitle.trim() }); setEditorOpen(false); }}>
                    <input autoFocus aria-label="Nombre de la tarea" value={taskTitle} onChange={event => setTaskTitle(event.target.value)} onKeyDown={event => { if (event.key === "Escape") setEditorOpen(false); }} className="w-full rounded-lg border border-indigo-300 bg-white px-2 py-1 text-lg font-bold leading-6 text-gray-900 outline-none focus:ring-2 focus:ring-indigo-100" />
                    <div className="mt-2 flex gap-3"><button disabled={!taskTitle.trim()} className="text-xs font-semibold text-indigo-600 disabled:opacity-40">Guardar</button><button type="button" onClick={() => setEditorOpen(false)} className="text-xs text-gray-500">Cancelar</button></div>
                  </form> : <h2 className="mt-2 break-words text-lg font-bold leading-6 text-gray-900">{selected.title}</h2>}
                </div>
                {!editorOpen && <button type="button" onClick={() => { setTaskTitle(selected.title); setEditorOpen(true); }} aria-label="Modificar nombre de la tarea" className="flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100"><Pencil size={14} />Modificar tarea</button>}
              </div>
              <label className="mb-4 block text-xs font-semibold text-gray-500">Área
                <select aria-label="Área de la tarea" value={areasForSpace(settings, selected.spaceId).some(area => area.id === selected.area) ? selected.area : ""} onChange={event => updateTask(selected.id, { area: event.target.value || undefined })} className="mt-1.5 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm font-normal text-gray-700">
                  <option value="">Sin área</option>{areasForSpace(settings, selected.spaceId).map(area => <option key={area.id} value={area.id}>{area.name}</option>)}
                </select>
              </label>
              <div className="mb-4"><TaskDayToggle task={selected} /></div>
              <div className="mb-4"><TaskDuration task={selected} /></div>
              <div className="mb-4"><LabelPicker key={selected.id} value={selected.labels ?? []} onChange={labels => updateTask(selected.id, { labels })} /></div>
              <div className="flex flex-wrap gap-1.5 text-xs">
                <span className="rounded-full bg-gray-100 px-2.5 py-1 font-medium text-gray-700">{statusNames[selected.status] ?? selected.status}</span>

              </div>
              <TaskFeaturesPanel key={selected.id} task={selected} onPlan={() => setPlannerOpen(true)} />
              <div className="mt-5 border-t border-gray-100 pt-4">
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-400">Trabajar en esta tarea</h3>
                {!project && <TaskProjectLink key={selected.id} task={selected} />}
                <div className="flex flex-wrap gap-2">
                  {selected.status !== "completed" && <button type="button" onClick={() => setHabitOpen(true)} className="h-9 rounded-lg border border-gray-200 px-3 text-xs font-semibold text-gray-700">Convertir en hábito</button>}
                  {(selected.status === "pending" || selected.status === "paused") && <button type="button" onClick={() => startTask(selected.id)} className="flex h-9 items-center gap-1 rounded-lg bg-gray-900 px-3 text-xs font-semibold text-white"><Play size={15} />{selected.status === "paused" ? "Reanudar" : "Iniciar"}</button>}
                  {selected.status === "in_progress" && <>
                    <button type="button" onClick={() => pauseTask(selected.id, pauseReason.trim() || "En pausa")} className="flex h-9 items-center gap-1 rounded-lg bg-orange-50 px-3 text-xs font-semibold text-orange-700"><CirclePause size={15} />Pausar</button>
                    <button type="button" onClick={() => moveTask(selected.id, "review")} className="flex h-9 items-center gap-1 rounded-lg border border-gray-200 px-3 text-xs font-semibold text-gray-700"><ClipboardCheck size={15} />Revisión</button>
                    {!selected.isActive && <button type="button" onClick={() => setActiveTask(selected.id)} className="h-9 rounded-lg border border-gray-200 px-3 text-xs font-semibold">Hacer activa</button>}
                  </>}
                  {selected.status === "review" && <button type="button" onClick={() => startTask(selected.id)} className="flex h-9 items-center gap-1 rounded-lg border border-gray-200 px-3 text-xs font-semibold"><RotateCcw size={15} />Regresar</button>}
                  {selected.status !== "completed" ? <button type="button" onClick={() => moveTask(selected.id, "completed")} className="flex h-9 items-center gap-1 rounded-lg bg-green-600 px-3 text-xs font-semibold text-white"><Check size={15} />Finalizar</button>
                    : <button type="button" onClick={() => moveTask(selected.id, "pending")} className="h-9 rounded-lg border border-gray-200 px-3 text-xs font-semibold">Volver a pendiente</button>}
                </div>
                {selected.status === "in_progress" && <input value={pauseReason} onChange={(event) => setPauseReason(event.target.value)} placeholder="Motivo de pausa (opcional)" className="mt-3 h-9 w-full rounded-lg border border-gray-200 px-3 text-xs outline-none" />}
              </div>
              {(selected.plannedDate || selected.estimatedMinutes) && <p className="mt-4 text-xs text-gray-500">{selected.plannedDate ? `Planificada: ${selected.plannedDate} ${selected.plannedTime ?? ""}` : ""}{selected.estimatedMinutes ? ` · ${selected.estimatedMinutes} min estimados` : ""}</p>}
              <button type="button" onClick={() => updateTask(selected.id, { backlog: !isBacklog(selected) })} className="mt-4 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold">{isBacklog(selected) ? "Mover a Tareas" : "Mover a Backlog"}</button>
              <Link to={`/tasks/${selected.id}`} className="mt-5 block text-xs font-semibold text-gray-600">Ver todos los detalles →</Link>
              <button type="button" onClick={() => {
                if (window.confirm(`¿Eliminar “${selected.title}”? Esta acción no se puede deshacer.`)) deleteTask(selected.id);
              }} className="mt-6 flex items-center gap-1 text-xs font-semibold text-red-600"><Trash2 size={14} />Eliminar tarea</button>
            </>
          ) : <div className="flex h-48 items-center justify-center text-center text-sm text-gray-500">Selecciona una tarea de la columna central para ver sus opciones.</div>}
        </section>
      </div>

      {selected && <>
        <HabitEditorSheet key={selected.id} open={habitOpen} initialTitle={selected.title} initialSpaceId={selected.spaceId} initialArea={selected.area} onClose={() => setHabitOpen(false)} onSave={(draft) => {
          if (selected.convertedHabitId) return;
          const habitId = addHabit({ ...draft, sourceTaskId: selected.id, labels: selected.labels, description: selected.description });
          updateTask(selected.id, { status: "cancelled", isActive: false, convertedHabitId: habitId });
          setHabitOpen(false);
          navigate(`/habits/${habitId}`);
        }} />
        <TaskPlannerSheet open={plannerOpen} title={selected.title} initialDate={selected.plannedDate} initialTime={selected.plannedTime} initialDuration={selected.estimatedMinutes}
          onClose={() => setPlannerOpen(false)} onSave={(plan) => updateTask(selected.id, plan)} />
      </>}
    </div>
  );
}
