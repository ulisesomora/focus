import { useState } from "react";
import { ArrowLeft, Check, Edit3, Target } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { GoalEditorSheet, type GoalDraft } from "../components/goals/GoalEditorSheet";
import { MobileLayout } from "../components/layout/MobileLayout";
import { useApp } from "../context/AppContext";
import { formatGoalDate, getGoalProgress, getHabitProgress, getTaskProgress } from "../utils/goals";
import { getConsistency } from "../utils/habits";

export function GoalDetailPage() {
  const { goalId } = useParams();
  const { goals, tasks, habits, habitLogs, updateGoal, toggleGoalMilestone, setGoalCompleted } = useApp();
  const [editorOpen, setEditorOpen] = useState(false);
  const goal = goals.find((item) => item.id === goalId);

  if (!goal) {
    return <MobileLayout><div className="rounded-3xl border border-gray-200 bg-white p-6"><h1 className="font-bold text-gray-900">Meta no encontrada</h1><Link to="/goals" className="mt-4 inline-block text-sm font-semibold text-gray-600">Volver a metas</Link></div></MobileLayout>;
  }

  const progress = getGoalProgress(goal, tasks, habits, habitLogs);
  const taskProgress = getTaskProgress(goal, tasks);
  const habitProgress = getHabitProgress(goal, habits, habitLogs);
  const linkedTasks = tasks.filter((task) => goal.linkedTaskIds.includes(task.id));
  const linkedHabits = habits.filter((habit) => goal.linkedHabitIds.includes(habit.id));

  function handleSave(value: GoalDraft) {
    updateGoal(goal!.id, value);
  }

  return (
    <MobileLayout>
      <header className="mb-6 flex items-start gap-3">
        <Link to="/goals" className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-gray-600 shadow-sm"><ArrowLeft size={19} /></Link>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-gray-500">{formatGoalDate(goal.targetDate)}</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900 lg:text-3xl">{goal.icon ?? "🎯"} {goal.title}</h1>
          {goal.project && <p className="mt-1 text-sm text-gray-500">{goal.project}</p>}
        </div>
        <button type="button" onClick={() => setEditorOpen(true)} className="flex h-10 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-600"><Edit3 size={16} /><span className="hidden sm:inline">Editar</span></button>
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
        <div className="space-y-5">
          <section className="rounded-3xl border border-gray-200 bg-white p-5 sm:p-6">
            <div className="flex items-end justify-between gap-4">
              <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-gray-400">Progreso</p><p className="mt-2 text-4xl font-bold tracking-tight text-gray-900">{progress}%</p></div>
              <button type="button" onClick={() => setGoalCompleted(goal.id, !goal.completed)} className={`flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold ${goal.completed ? "bg-green-50 text-green-700" : "bg-gray-900 text-white"}`}><Check size={16} />{goal.completed ? "Completada" : "Completar meta"}</button>
            </div>
            <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-gray-900" style={{ width: `${progress}%` }} /></div>
            {goal.description && <p className="mt-5 text-sm leading-6 text-gray-600">{goal.description}</p>}
          </section>

          {goal.milestones.length > 0 && (
            <section className="rounded-3xl border border-gray-200 bg-white p-5 sm:p-6">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-gray-400">Hitos</p>
              <div className="mt-4 space-y-2">
                {goal.milestones.map((milestone, index) => (
                  <button key={milestone.id} type="button" onClick={() => toggleGoalMilestone(goal.id, milestone.id)} className="flex w-full items-center gap-3 rounded-2xl bg-gray-50 px-4 py-3 text-left">
                    <span className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold ${milestone.completed ? "border-gray-900 bg-gray-900 text-white" : "border-gray-300 text-gray-400"}`}>{milestone.completed ? <Check size={14} /> : index + 1}</span>
                    <span className={`text-sm font-semibold ${milestone.completed ? "text-gray-400 line-through" : "text-gray-700"}`}>{milestone.title}</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {linkedTasks.length > 0 && (
            <section className="rounded-3xl border border-gray-200 bg-white p-5 sm:p-6">
              <div className="flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-[0.14em] text-gray-400">Tareas</p><span className="text-sm font-bold text-gray-700">{taskProgress}%</span></div>
              <div className="mt-4 space-y-2">{linkedTasks.map((task) => <Link key={task.id} to={`/tasks/${task.id}`} className="flex items-center gap-3 rounded-2xl border border-gray-100 px-4 py-3 hover:bg-gray-50"><span className={`flex h-6 w-6 items-center justify-center rounded-full border ${task.status === "completed" ? "border-gray-900 bg-gray-900 text-white" : "border-gray-300 text-gray-300"}`}>{task.status === "completed" && <Check size={13} />}</span><span className={`min-w-0 flex-1 truncate text-sm font-semibold ${task.status === "completed" ? "text-gray-400 line-through" : "text-gray-700"}`}>{task.title}</span><span className="text-[11px] text-gray-400">{task.status === "in_progress" ? "En proceso" : task.status === "completed" ? "Finalizada" : "Pendiente"}</span></Link>)}</div>
            </section>
          )}

          {linkedHabits.length > 0 && (
            <section className="rounded-3xl border border-gray-200 bg-white p-5 sm:p-6">
              <div className="flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-[0.14em] text-gray-400">Hábitos</p><span className="text-sm font-bold text-gray-700">{habitProgress}%</span></div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">{linkedHabits.map((habit) => { const consistency = getConsistency(habit, habitLogs, 30); return <Link key={habit.id} to={`/habits/${habit.id}`} className="rounded-2xl border border-gray-100 p-4 hover:bg-gray-50"><div className="flex items-center gap-3"><span className="text-xl">{habit.icon ?? "🔥"}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-gray-700">{habit.title}</p><p className="mt-1 text-xs text-gray-400">{consistency}% consistencia</p></div></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-100"><div className="h-full bg-gray-800" style={{ width: `${consistency}%` }} /></div></Link>; })}</div>
            </section>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-8">
          <div className="rounded-3xl border border-gray-200 bg-white p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gray-100 text-gray-600"><Target size={20} /></div>
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-gray-400">Resumen</p>
            <dl className="mt-3 space-y-3 text-sm">
              <div className="flex justify-between gap-4"><dt className="text-gray-500">Medición</dt><dd className="font-semibold text-gray-700">{goal.progressMode === "combined" ? "Combinada" : goal.progressMode === "tasks" ? "Tareas" : goal.progressMode === "habits" ? "Hábitos" : "Manual"}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-gray-500">Tareas</dt><dd className="font-semibold text-gray-700">{linkedTasks.length}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-gray-500">Hábitos</dt><dd className="font-semibold text-gray-700">{linkedHabits.length}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-gray-500">Hitos</dt><dd className="font-semibold text-gray-700">{goal.milestones.filter((item) => item.completed).length}/{goal.milestones.length}</dd></div>
            </dl>
          </div>
        </aside>
      </div>

      <GoalEditorSheet open={editorOpen} goal={goal} onClose={() => setEditorOpen(false)} onSave={handleSave} tasks={tasks} habits={habits} />
    </MobileLayout>
  );
}
