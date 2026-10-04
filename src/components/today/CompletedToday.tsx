import { Link } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { completedOnDay, useTaskDays } from "../../utils/taskDays";
export function CompletedToday() {
  const { tasks, moveTask } = useApp();
  const { today } = useTaskDays();
  const completed = completedOnDay(tasks, today);
  return <details className="mt-6 rounded-xl border border-gray-200 bg-white p-3">
    <summary className="cursor-pointer text-sm font-semibold text-gray-600">Completadas hoy · {completed.length}</summary>
    {completed.length ? completed.map(task => <div key={task.id} className="mt-2 flex items-center gap-2 border-t border-gray-100 py-2">
      <Link to={`/tasks/${task.id}`} className="min-w-0 flex-1 text-sm text-gray-400 line-through">{task.title}</Link>
      <button type="button" onClick={() => moveTask(task.id, "pending")} className="shrink-0 rounded-lg bg-gray-100 px-2 py-2 text-xs font-medium text-gray-600">Volver a pendiente</button>
    </div>) : <p className="mt-3 text-xs text-gray-500">Todavía no has completado tareas hoy.</p>}
  </details>;
}
