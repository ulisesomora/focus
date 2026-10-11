import { isBacklog } from "../utils/taskBacklog";
import { visibleOutsideProject } from "../utils/projectStructure";
import { ArrowLeft, Check, ChevronRight } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { MobileLayout } from "../components/layout/MobileLayout";
import { useApp } from "../context/AppContext";
import { defaultAreas } from "../types/settings";

export function AreaTasksPage() {
  const { areaId } = useParams();
  const { tasks, settings, moveTask } = useApp();
  const area = (settings.areas?.length ? settings.areas : defaultAreas).find((item) => item.id === areaId);
  const items = tasks.filter((task) => !task.spaceId && visibleOutsideProject(task) && task.area === areaId && !isBacklog(task) && task.status !== "cancelled")
    .sort((a, b) => Number(a.status === "completed") - Number(b.status === "completed"));
  return (
    <MobileLayout>
      <div className="mx-auto max-w-xl">
        <header className="mb-5 flex items-center gap-3">
          <Link to="/areas" aria-label="Volver a áreas" className="flex h-10 w-10 items-center justify-center rounded-full bg-white"><ArrowLeft size={20} /></Link>
          <div><h1 className="text-2xl font-bold text-gray-900">{area?.name ?? "Área"}</h1><p className="text-sm text-gray-500">{items.length} {items.length === 1 ? "tarea" : "tareas"}</p></div>
        </header>
        {items.length ? <div className="overflow-hidden rounded-xl bg-white">
          {items.map((task) => <div key={task.id} className="flex items-start gap-3 border-b border-gray-100 px-4 py-3 last:border-0">
            <button type="button" onClick={() => moveTask(task.id, task.status === "completed" ? "pending" : "completed")}
              aria-label={`${task.status === "completed" ? "Marcar pendiente" : "Marcar realizada"}: ${task.title}`}
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${task.status === "completed" ? "border-gray-400 bg-gray-400 text-white" : "border-gray-300 text-transparent"}`}><Check size={14} /></button>
            <span className={`min-w-0 flex-1 text-sm ${task.status === "completed" ? "text-gray-400 line-through" : "text-gray-900"}`}>{task.title}</span>
            <Link to={`/tasks/${task.id}`} aria-label={`Ver tarea ${task.title}`} className="text-gray-400"><ChevronRight size={18} /></Link>
          </div>)}
        </div> : <p className="rounded-xl bg-white px-4 py-10 text-center text-sm text-gray-500">Esta área todavía no tiene tareas asignadas.</p>}
      </div>
    </MobileLayout>
  );
}
