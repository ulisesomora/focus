import type { ProjectStatus } from "../../types/project";
export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  const styles = { active: "bg-green-50 text-green-700 border-green-200", paused: "bg-yellow-50 text-yellow-800 border-yellow-200", stopped: "bg-red-50 text-red-700 border-red-200", completed: "bg-gray-100 text-gray-700 border-gray-200" };
  const labels = { active: "Activo", paused: "En pausa", stopped: "Detenido", completed: "Finalizado" };
  return <span className={`inline-block rounded-full border px-2 py-1 text-xs font-semibold ${styles[status]}`}>{labels[status]}</span>;
}
