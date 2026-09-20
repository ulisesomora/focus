import { useMemo, useState } from "react";
import { ChevronRight, Plus, Target } from "lucide-react";
import { Link } from "react-router-dom";

import { GoalEditorSheet, type GoalDraft } from "../components/goals/GoalEditorSheet";
import { MobileLayout } from "../components/layout/MobileLayout";
import { useApp } from "../context/AppContext";
import type { Goal } from "../types/goal";
import { formatGoalDate, getGoalProgress } from "../utils/goals";

export function GoalsPage() {
  const { goals, tasks, habits, habitLogs, addGoal } = useApp();
  const [editorOpen, setEditorOpen] = useState(false);
  const activeGoals = useMemo(() => goals.filter((goal) => !goal.completed), [goals]);
  const completedGoals = goals.filter((goal) => goal.completed);

  function handleCreate(value: GoalDraft) {
    addGoal(value);
  }

  return (
    <MobileLayout>
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500">Resultados que importan</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900 lg:text-3xl">Metas</h1>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Conecta tareas y hábitos con algo más grande que quieras conseguir.</p>
        </div>
        <button type="button" onClick={() => setEditorOpen(true)} className="flex h-11 shrink-0 items-center gap-2 rounded-xl bg-gray-900 px-4 text-sm font-semibold text-white">
          <Plus size={18} /><span className="hidden sm:inline">Nueva meta</span>
        </button>
      </header>

      {activeGoals.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-8 text-center lg:max-w-xl">
          <Target className="mx-auto text-gray-300" size={34} />
          <h2 className="mt-4 font-bold text-gray-900">Todavía no tienes metas</h2>
          <p className="mt-2 text-sm text-gray-500">Crea una y relaciona las tareas o hábitos que te ayudan a avanzar.</p>
        </div>
      ) : (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-gray-400">Activas</p>
            <span className="text-sm font-semibold text-gray-500">{activeGoals.length}</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[repeat(auto-fit,minmax(300px,360px))]">
            {activeGoals.map((goal) => <GoalCard key={goal.id} goal={goal} tasks={tasks} habits={habits} habitLogs={habitLogs} />)}
          </div>
        </section>
      )}

      {completedGoals.length > 0 && (
        <section className="mt-8">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-gray-400">Completadas</p>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[repeat(auto-fit,minmax(300px,360px))]">
            {completedGoals.map((goal) => <GoalCard key={goal.id} goal={goal} tasks={tasks} habits={habits} habitLogs={habitLogs} />)}
          </div>
        </section>
      )}

      <GoalEditorSheet open={editorOpen} onClose={() => setEditorOpen(false)} onSave={handleCreate} tasks={tasks} habits={habits} />
    </MobileLayout>
  );
}

function GoalCard({ goal, tasks, habits, habitLogs }: { goal: Goal; tasks: ReturnType<typeof useApp>["tasks"]; habits: ReturnType<typeof useApp>["habits"]; habitLogs: ReturnType<typeof useApp>["habitLogs"] }) {
  const progress = getGoalProgress(goal, tasks, habits, habitLogs);
  const linkedTasks = tasks.filter((task) => goal.linkedTaskIds.includes(task.id));
  const completedTasks = linkedTasks.filter((task) => task.status === "completed").length;

  return (
    <Link to={`/goals/${goal.id}`} className="block rounded-3xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-gray-300">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gray-50 text-2xl">{goal.icon ?? "🎯"}</div>
        <div className="min-w-0 flex-1">
          <h2 className="font-bold text-gray-900">{goal.title}</h2>
          <p className="mt-1 text-xs text-gray-500">{formatGoalDate(goal.targetDate)}</p>
        </div>
        <ChevronRight size={18} className="mt-1 text-gray-300" />
      </div>

      <div className="mt-5 flex items-end justify-between gap-4">
        <div>
          <span className="text-3xl font-bold tracking-tight text-gray-900">{progress}%</span>
          <p className="mt-1 text-xs text-gray-400">progreso</p>
        </div>
        <div className="text-right text-xs leading-5 text-gray-500">
          {linkedTasks.length > 0 && <p>{completedTasks}/{linkedTasks.length} tareas</p>}
          {goal.linkedHabitIds.length > 0 && <p>{goal.linkedHabitIds.length} hábito{goal.linkedHabitIds.length !== 1 ? "s" : ""}</p>}
        </div>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-gray-900 transition-all" style={{ width: `${progress}%` }} /></div>

      {goal.milestones.length > 0 && (
        <p className="mt-4 text-xs text-gray-500">{goal.milestones.filter((item) => item.completed).length}/{goal.milestones.length} hitos completados</p>
      )}
    </Link>
  );
}
