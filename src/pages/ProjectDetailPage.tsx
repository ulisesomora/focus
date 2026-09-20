import { useMemo, useState } from "react";
import { ArrowLeft, CalendarDays, Circle, Edit3, History } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { MobileLayout } from "../components/layout/MobileLayout";
import { ProjectEditorSheet, type ProjectDraft } from "../components/projects/ProjectEditorSheet";
import { useApp } from "../context/AppContext";

const tabs = ["Resumen", "Tareas", "Agenda", "Metas", "Actividad"] as const;
type Tab = (typeof tabs)[number];

export function ProjectDetailPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { projects, tasks, goals, activities, updateProject } = useApp();
  const [tab, setTab] = useState<Tab>("Resumen");
  const [editorOpen, setEditorOpen] = useState(false);

  const project = projects.find((item) => item.id === projectId);
  const projectTasks = useMemo(() => tasks.filter((task) => task.project === project?.name), [tasks, project?.name]);
  const projectGoals = useMemo(() => goals.filter((goal) => goal.project === project?.name), [goals, project?.name]);
  const scheduled = useMemo(() => projectTasks.filter((task) => task.plannedDate).sort((a, b) => `${a.plannedDate ?? ""}${a.plannedTime ?? ""}`.localeCompare(`${b.plannedDate ?? ""}${b.plannedTime ?? ""}`)), [projectTasks]);
  const projectActivities = useMemo(
    () => activities
      .filter((activity) => activity.project === project?.name || (activity.entityType === "project" && activity.entityId === project?.id))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
    [activities, project?.id, project?.name],
  );

  if (!project) {
    return <MobileLayout><button onClick={() => navigate("/projects")} className="text-sm font-semibold text-gray-600">← Volver</button><div className="mt-8 rounded-3xl bg-white p-8 text-center"><p className="font-bold text-gray-900">Proyecto no encontrado</p></div></MobileLayout>;
  }

  const openTasks = projectTasks.filter((task) => !["completed", "cancelled"].includes(task.status));
  const completed = projectTasks.filter((task) => task.status === "completed").length;
  const taskProgress = projectTasks.length ? Math.round((completed / projectTasks.length) * 100) : 0;

  const currentProjectId = project.id;

  function saveProject(draft: ProjectDraft) {
    updateProject(currentProjectId, draft);
  }

  return (
    <MobileLayout>
      <header>
        <div className="flex items-center justify-between gap-3">
          <button type="button" onClick={() => navigate("/projects")} className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gray-600 shadow-sm ring-1 ring-gray-200"><ArrowLeft size={18} /></button>
          <button type="button" onClick={() => setEditorOpen(true)} className="flex h-10 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700"><Edit3 size={16} /> Editar</button>
        </div>

        <div className="mt-5 flex items-start gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm ring-1 ring-gray-200">{project.icon ?? "📁"}</div>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            {project.description && <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">{project.description}</p>}
          </div>
        </div>
      </header>

      <div className="mt-6 overflow-x-auto pb-1">
        <div className="flex min-w-max gap-1 rounded-2xl bg-gray-100 p-1">
          {tabs.map((item) => <button key={item} type="button" onClick={() => setTab(item)} className={`rounded-xl px-3 py-2 text-sm font-semibold ${tab === item ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}>{item}</button>)}
        </div>
      </div>

      <div className="mt-5">
        {tab === "Resumen" && (
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="space-y-4">
              <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Stat value={openTasks.length} label="Pendientes" />
                <Stat value={projectTasks.filter((task) => task.status === "in_progress").length} label="En proceso" />
                <Stat value={projectGoals.filter((goal) => !goal.completed).length} label="Metas activas" />
                <Stat value={`${taskProgress}%`} label="Tareas hechas" />
              </section>

              <section className="rounded-3xl border border-gray-200 bg-white p-5">
                <div className="flex items-center justify-between gap-3"><h2 className="font-bold text-gray-900">Próximas tareas</h2><button onClick={() => setTab("Tareas")} className="text-sm font-semibold text-gray-500">Ver todas</button></div>
                <div className="mt-3 space-y-2">
                  {openTasks.slice(0, 4).map((task) => <TaskRow key={task.id} task={task} />)}
                  {openTasks.length === 0 && <Empty text="No hay tareas pendientes en este proyecto." />}
                </div>
              </section>
            </div>

            <aside className="space-y-4">
              <section className="rounded-3xl border border-gray-200 bg-white p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Resumen</p>
                <div className="mt-4 space-y-3 text-sm">
                  <SummaryRow label="Estado" value={project.status === "active" ? "Activo" : project.status === "paused" ? "En pausa" : "Finalizado"} />
                  <SummaryRow label="Tareas" value={String(projectTasks.length)} />
                  <SummaryRow label="Metas" value={String(projectGoals.length)} />
                  <SummaryRow label="Agendadas" value={String(scheduled.length)} />
                </div>
              </section>
            </aside>
          </div>
        )}

        {tab === "Tareas" && <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{projectTasks.map((task) => <TaskCard key={task.id} task={task} />)}{projectTasks.length === 0 && <EmptyCard text="Todavía no hay tareas para este proyecto." />}</section>}

        {tab === "Agenda" && <section className="max-w-3xl space-y-3">{scheduled.map((task) => <TaskCard key={task.id} task={task} showSchedule />)}{scheduled.length === 0 && <EmptyCard text="No hay tareas planeadas en este proyecto." />}</section>}

        {tab === "Metas" && <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{projectGoals.map((goal) => <Link key={goal.id} to={`/goals/${goal.id}`} className="rounded-3xl border border-gray-200 bg-white p-5"><div className="flex items-start gap-3"><span className="text-xl">{goal.icon ?? "🎯"}</span><div className="min-w-0"><p className="font-bold text-gray-900">{goal.title}</p>{goal.targetDate && <p className="mt-1 text-xs text-gray-500">Objetivo: {formatDate(goal.targetDate)}</p>}</div></div></Link>)}{projectGoals.length === 0 && <EmptyCard text="No hay metas relacionadas con este proyecto." />}</section>}

        {tab === "Actividad" && (
          <section className="max-w-3xl rounded-3xl border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-bold text-gray-900">Actividad reciente</h2>
                <p className="mt-1 text-xs text-gray-500">Bitácora real de cambios dentro de este proyecto.</p>
              </div>
              <Link to="/activity" className="text-sm font-semibold text-gray-500">Ver todo</Link>
            </div>
            <div className="mt-4 space-y-1">
              {projectActivities.slice(0, 12).map((activity) => (
                <div key={activity.id} className="flex gap-3 rounded-2xl px-2 py-3 hover:bg-gray-50">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-500"><History size={15} /></div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{activity.message}</p>
                        <p className="mt-0.5 text-xs text-gray-500">{activity.title}</p>
                      </div>
                      <span className="shrink-0 text-[11px] text-gray-400">{formatDateTime(activity.createdAt)}</span>
                    </div>
                    {activity.note && <p className="mt-2 rounded-xl bg-orange-50 px-3 py-2 text-xs text-orange-800">{activity.note}</p>}
                  </div>
                </div>
              ))}
              {projectActivities.length === 0 && <Empty text="Todavía no hay actividad para mostrar." />}
            </div>
          </section>
        )}
      </div>

      <ProjectEditorSheet open={editorOpen} project={project} onClose={() => setEditorOpen(false)} onSave={saveProject} />
    </MobileLayout>
  );
}

function Stat({ value, label }: { value: string | number; label: string }) {
  return <div className="rounded-2xl border border-gray-200 bg-white p-4"><p className="text-xl font-bold text-gray-900">{value}</p><p className="mt-1 text-xs text-gray-500">{label}</p></div>;
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between gap-3"><span className="text-gray-500">{label}</span><span className="font-semibold text-gray-900">{value}</span></div>;
}

function TaskRow({ task }: { task: any }) {
  return <Link to={`/tasks/${task.id}`} className="flex items-center gap-3 rounded-2xl bg-gray-50 px-3 py-3"><Circle size={16} className="shrink-0 text-gray-400" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-gray-800">{task.title}</p><p className="mt-0.5 text-xs text-gray-500">{statusText(task.status)}</p></div></Link>;
}

function TaskCard({ task, showSchedule = false }: { task: any; showSchedule?: boolean }) {
  return <Link to={`/tasks/${task.id}`} className="rounded-3xl border border-gray-200 bg-white p-4"><p className="font-semibold text-gray-900">{task.title}</p><div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500"><span className="rounded-lg bg-gray-100 px-2 py-1">{statusText(task.status)}</span>{task.priority && <span className="rounded-lg bg-gray-100 px-2 py-1">{task.priority === "high" ? "Alta" : task.priority === "medium" ? "Media" : "Baja"}</span>}{showSchedule && task.plannedDate && <span className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-2 py-1"><CalendarDays size={12} /> {formatDate(task.plannedDate)}{task.plannedTime ? ` · ${task.plannedTime}` : ""}</span>}</div></Link>;
}

function Empty({ text }: { text: string }) { return <p className="py-4 text-sm text-gray-400">{text}</p>; }
function EmptyCard({ text }: { text: string }) { return <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-500">{text}</div>; }
function statusText(status: string) { return status === "backlog" ? "Backlog" : status === "pending" ? "Pendiente" : status === "in_progress" ? "En proceso" : status === "paused" ? "En pausa" : status === "review" ? "En revisión" : status === "completed" ? "Finalizada" : "Cancelada"; }
function formatDate(value: string) { const [year, month, day] = value.split("-").map(Number); return new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short", year: year !== new Date().getFullYear() ? "numeric" : undefined }).format(new Date(year, month - 1, day)); }
function formatDateTime(value: Date) { return new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }).format(value); }
