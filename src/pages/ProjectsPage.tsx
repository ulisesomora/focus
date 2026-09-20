import { useMemo, useState } from "react";
import { ChevronRight, Plus } from "lucide-react";
import { Link } from "react-router-dom";

import { MobileLayout } from "../components/layout/MobileLayout";
import { ProjectEditorSheet, type ProjectDraft } from "../components/projects/ProjectEditorSheet";
import { useApp } from "../context/AppContext";

export function ProjectsPage() {
  const { projects, tasks, goals, addProject } = useApp();
  const [editorOpen, setEditorOpen] = useState(false);

  const activeProjects = useMemo(() => projects.filter((project) => project.status !== "completed"), [projects]);

  function handleSave(project: ProjectDraft) {
    addProject(project);
  }

  return (
    <MobileLayout>
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Proyectos</h1>
          <p className="mt-1 text-sm text-gray-500">Agrupa trabajo, pendientes y metas por contexto.</p>
        </div>
        <button type="button" onClick={() => setEditorOpen(true)} className="flex h-10 shrink-0 items-center gap-2 rounded-xl bg-gray-900 px-3.5 text-sm font-semibold text-white">
          <Plus size={17} />
          <span className="hidden sm:inline">Nuevo proyecto</span>
        </button>
      </header>

      {activeProjects.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-8 text-center">
          <p className="font-semibold text-gray-900">Todavía no tienes proyectos.</p>
          <p className="mt-1 text-sm text-gray-500">Crea uno para empezar a agrupar tus tareas y metas.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {activeProjects.map((project) => {
            const projectTasks = tasks.filter((task) => task.project === project.name);
            const completedTasks = projectTasks.filter((task) => task.status === "completed").length;
            const projectGoals = goals.filter((goal) => goal.project === project.name && !goal.completed);
            const progress = projectTasks.length ? Math.round((completedTasks / projectTasks.length) * 100) : 0;

            return (
              <Link key={project.id} to={`/projects/${project.id}`} className="group rounded-3xl border border-gray-200 bg-white p-5 transition hover:border-gray-300 hover:shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-xl">{project.icon ?? "📁"}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="truncate font-bold text-gray-900">{project.name}</h2>
                      <ChevronRight size={18} className="mt-0.5 shrink-0 text-gray-300 transition group-hover:text-gray-500" />
                    </div>
                    {project.description && <p className="mt-1 line-clamp-2 text-sm leading-5 text-gray-500">{project.description}</p>}
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-2xl bg-gray-50 px-2 py-3"><p className="text-lg font-bold text-gray-900">{projectTasks.filter((task) => task.status !== "completed" && task.status !== "cancelled").length}</p><p className="text-[11px] text-gray-500">Pendientes</p></div>
                  <div className="rounded-2xl bg-gray-50 px-2 py-3"><p className="text-lg font-bold text-gray-900">{projectGoals.length}</p><p className="text-[11px] text-gray-500">Metas</p></div>
                  <div className="rounded-2xl bg-gray-50 px-2 py-3"><p className="text-lg font-bold text-gray-900">{progress}%</p><p className="text-[11px] text-gray-500">Avance</p></div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <ProjectEditorSheet open={editorOpen} onClose={() => setEditorOpen(false)} onSave={handleSave} />
    </MobileLayout>
  );
}
