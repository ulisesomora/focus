import { HabitSection } from "../habits/HabitList";
import { spaceColor } from "../../utils/spaceColors";
import { areaForTask, taskAgendaStyle, taskSpace, taskInSpace } from "../../utils/taskSpaces";
import { DurationBadge } from "../tasks/TaskDuration";
import { TaskDayBadges } from "../tasks/TaskDayToggle";
import { Check, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { tasksForDay, useTaskDays } from "../../utils/taskDays";

export function TodayPreview({ spaceId }: { spaceId?: string }) {
  const { tasks, settings, moveTask } = useApp();
  const { today } = useTaskDays();
  const pending = tasksForDay(tasks.filter(task => !spaceId || taskInSpace(task, spaceId)), today, true);
  return (
    <>
    <HabitSection daily spaceId={spaceId} allSpaces={!spaceId} hideWhenEmpty />
    {!!pending.length && <section aria-label="Para hoy" className="-mx-4 my-3 border-y border-indigo-100 bg-indigo-50/50 px-4 py-2 lg:mx-0 lg:rounded-xl lg:border lg:px-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-bold text-gray-900">Para hoy <span className="text-xs font-medium text-indigo-600">{pending.length}</span></h2>
        <Link to={spaceId ? `/spaces/${spaceId}?view=today` : "/today"} aria-label="Más de hoy" title="Más de hoy" className="flex h-8 w-8 items-center justify-center rounded-lg text-indigo-600"><ChevronRight size={20} /></Link>
      </div>
      {pending.length ? pending.slice(0, 4).map(task => (
        <div key={task.id} style={taskAgendaStyle(task, settings)} className="flex items-start gap-2 border-b border-indigo-100 px-1 py-2 last:border-0">
          <button type="button" onClick={() => moveTask(task.id, "completed")} aria-label={`Completar: ${task.title}`} className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border border-gray-300 bg-white text-transparent hover:text-gray-500"><Check size={14} /></button>
          <Link to={`/tasks/${task.id}`} className="min-w-0 flex-1">
            <p className="text-sm leading-5 text-gray-900">{task.title}</p>
            <div className="mt-1 flex flex-wrap items-center gap-1 text-[10px] text-gray-500"><TaskDayBadges task={task} /><DurationBadge minutes={task.estimatedMinutes} />{taskSpace(task, settings) && <span style={{ color: spaceColor(taskSpace(task, settings)?.color) }}>{taskSpace(task, settings)?.name}</span>}<span>{areaForTask(settings, task)?.name}</span>{task.plannedTime && <span>· {task.plannedTime}</span>}</div>
          </Link>
          <Link to={`/tasks/${task.id}`} aria-label={`Ver tarea: ${task.title}`} className="shrink-0 text-gray-400"><ChevronRight size={18} /></Link>
        </div>
      )) : <p className="py-2 text-xs text-gray-500">No tienes tareas pendientes para hoy.</p>}
    </section>}
    </>
  );
}
