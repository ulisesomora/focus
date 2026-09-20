import { MobileLayout } from "../components/layout/MobileLayout";

import { ActiveTaskCard } from "../components/today/ActiveTaskCard";
import { HabitPreview } from "../components/today/HabitPreview";
import { InboxSummary } from "../components/today/InboxSummary";
import { SummaryStats } from "../components/today/SummaryStats";
import { TodayAgenda } from "../components/today/TodayAgenda";
import { TodayHeader } from "../components/today/TodayHeader";
import { RoutinePreview } from "../components/today/RoutinePreview";
import { FirstRunCard } from "../components/today/FirstRunCard";
import { useApp } from "../context/AppContext";
import { isHabitDueToday } from "../utils/habits";


export function TodayPage() {
  const { captures, tasks, habits, habitLogs, routines, goals, projects, settings, updateSettings, toggleHabit, incrementHabit } = useApp();

  const today = getLocalDateKey();


  const hasUserData =
    captures.length > 0 ||
    tasks.length > 0 ||
    habits.length > 0 ||
    routines.length > 0 ||
    goals.length > 0 ||
    projects.length > 0;

  const openCapture = () => window.dispatchEvent(new Event("focus-open-capture"));

  const activeTask = tasks.find((task) => task.isActive);

  const upcomingTasks = tasks.filter(
    (task) =>
      task.status === "pending" &&
      task.plannedDate === today,
  );

  const activeTasks = tasks.filter(
    (task) => task.status === "in_progress",
  );

  return (
    <MobileLayout>
      <TodayHeader />

      {!hasUserData && !settings.onboardingCompleted ? (
        <FirstRunCard
          onCapture={openCapture}
          onComplete={() => updateSettings({ onboardingCompleted: true })}
        />
      ) : !hasUserData ? (
        <section className="rounded-3xl border border-dashed border-gray-300 bg-white p-7 text-center lg:max-w-2xl">
          <h2 className="text-lg font-bold text-gray-900">Tu día está vacío</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
            Puedes comenzar con una captura rápida y organizarla después. No necesitas asignar fecha, prioridad ni proyecto.
          </p>
          <button type="button" onClick={openCapture} className="mt-5 inline-flex h-10 items-center rounded-xl bg-gray-900 px-4 text-sm font-semibold text-white">
            Capturar algo
          </button>
        </section>
      ) : (
      <div className="lg:grid lg:grid-cols-[minmax(0,720px)_300px] lg:items-start lg:gap-7">
        <div className="min-w-0">
          <SummaryStats
            tasks={upcomingTasks.length}
            active={activeTasks.length}
            habits={habits.filter((habit) => isHabitDueToday(habit, habitLogs)).length}
          />

          {activeTask && <ActiveTaskCard task={activeTask} />}

          <TodayAgenda tasks={upcomingTasks} />
        </div>

        <aside className="min-w-0 lg:-mt-7">
          <HabitPreview
            habits={habits.filter((habit) => isHabitDueToday(habit, habitLogs))}
            onToggle={toggleHabit}
            onIncrement={incrementHabit}
          />

          <RoutinePreview routines={routines.filter((routine) => routine.days.includes(new Date().getDay()))} />

          <InboxSummary count={captures.length} />
        </aside>
      </div>
      )}
    </MobileLayout>
  );
}

function getLocalDateKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
