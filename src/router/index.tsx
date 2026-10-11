import { CompletedTasksPage } from "../pages/CompletedTasksPage";
import { SpaceAreasPage } from "../pages/SpaceAreasPage";
import { SpacesPage, SpaceTasksPage } from "../pages/SpacesPage";
import { LabelsPage } from "../pages/LabelsPage";
import { Navigate, createBrowserRouter } from "react-router-dom";
import { TodayPage } from "../pages/TodayPage";
import { AreasPage } from "../pages/AreasPage";
import { AreaTasksPage } from "../pages/AreaTasksPage";
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
  { path: "/", element: <TodayPage key="tasks" /> },
  { path: "/today", element: <TodayPage key="today" daily /> },
  { path: "/completed-tasks", element: <CompletedTasksPage /> },
  { path: "/spaces", element: <SpacesPage /> },
  { path: "/spaces/:spaceId/areas", element: <SpaceAreasPage /> },
  { path: "/spaces/:spaceId", element: <SpaceTasksPage /> },
  { path: "/labels", element: <LabelsPage /> },
  { path: "/areas", element: <AreasPage /> },
  { path: "/areas/:areaId", element: <AreaTasksPage /> },
  { path: "/inbox", element: <Navigate to="/" replace /> },
  { path: "/backlog", element: <TodayPage key="backlog" backlog /> },
  { path: "/tasks", element: <Navigate to="/" replace /> },
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
