import { createBrowserRouter } from "react-router-dom";
import { TodayPage } from "../pages/TodayPage";
import { InboxPage } from "../pages/InboxPage";
import { BacklogPage } from "../pages/BacklogPage";
import { TasksPage } from "../pages/TasksPage";
import { AgendaPage } from "../pages/AgendaPage";
import { MorePage } from "../pages/MorePage";
import { TaskDetailPage } from "../pages/TaskDetailPage";
import { HabitsPage } from "../pages/HabitsPage";
import { HabitDetailPage } from "../pages/HabitDetailPage";
import { RoutinesPage } from "../pages/RoutinesPage";
import { RoutineDetailPage } from "../pages/RoutineDetailPage";
import { RoutineRunPage } from "../pages/RoutineRunPage";
import { GoalsPage } from "../pages/GoalsPage";
import { GoalDetailPage } from "../pages/GoalDetailPage";
import { StatsPage } from "../pages/StatsPage";
import { WeeklyReviewPage } from "../pages/WeeklyReviewPage";
import { ProjectsPage } from "../pages/ProjectsPage";
import { ProjectDetailPage } from "../pages/ProjectDetailPage";
import { ActivityPage } from "../pages/ActivityPage";
import { SettingsPage } from "../pages/SettingsPage";

export const router = createBrowserRouter([
  { path: "/", element: <TodayPage /> },
  { path: "/inbox", element: <InboxPage /> },
  { path: "/backlog", element: <BacklogPage /> },
  { path: "/tasks", element: <TasksPage /> },
  { path: "/tasks/:taskId", element: <TaskDetailPage /> },
  { path: "/agenda", element: <AgendaPage /> },
  { path: "/habits", element: <HabitsPage /> },
  { path: "/habits/:habitId", element: <HabitDetailPage /> },
  { path: "/routines", element: <RoutinesPage /> },
  { path: "/routines/:routineId", element: <RoutineDetailPage /> },
  { path: "/routines/:routineId/run", element: <RoutineRunPage /> },
  { path: "/goals", element: <GoalsPage /> },
  { path: "/goals/:goalId", element: <GoalDetailPage /> },
  { path: "/stats", element: <StatsPage /> },
  { path: "/weekly-review", element: <WeeklyReviewPage /> },
  { path: "/projects", element: <ProjectsPage /> },
  { path: "/projects/:projectId", element: <ProjectDetailPage /> },
  { path: "/activity", element: <ActivityPage /> },
  { path: "/settings", element: <SettingsPage /> },
  { path: "/more", element: <MorePage /> },
]);
