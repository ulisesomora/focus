import { buildTaskProject, projectChildren, projectDeletion } from "../utils/projectStructure";
import { prepareTaskSpaceMove } from "../utils/taskSpaces";
import { labelKey, uniqueLabels } from "../utils/labels";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { Capture } from "../types/capture";
import type { Task, TaskStatus } from "../types/task";
import type { Habit, HabitLog } from "../types/habit";
import type { Routine } from "../types/routine";
import type { Goal } from "../types/goal";
import type { Project } from "../types/project";
import type { Activity, ActivityEntityType, ActivityKind } from "../types/activity";
import type { AppSettings } from "../types/settings";
import { defaultAppSettings } from "../types/settings";
import { calculateBestStreak, calculateCurrentStreak, getDateKey, getHabitLog } from "../utils/habits";
import {
  connectEmailAccount,
  disconnectAccount,
  isFirebaseConfigured,
  observeFirebaseUser,
} from "../lib/firebase";
import { LoginScreen } from "../components/auth/LoginScreen";
import type { User } from "firebase/auth";
import {
  connectCorePersistence,
  deleteProjectData,
  deleteCapture as deletePersistedCapture,
  deleteTask as deletePersistedTask,
  deleteHabit as deletePersistedHabit,
  saveActivity,
  saveCapture,
  saveGoal,
  saveHabit,
  saveHabitLog,
  saveProject,
  saveRoutine,
  saveSettings,
  saveTask,
  saveTasks,
  removeKnownDemoData,
  type SyncStatus,
} from "../services/corePersistence";

type ProcessDestination = "today" | "backlog";

type PlannedCapture = {
  plannedDate: string;
  plannedTime?: string;
  estimatedMinutes?: number;
};

type TaskPatch = Partial<Omit<Task, "id">>;
type GoalPatch = Partial<Omit<Goal, "id" | "createdAt">>;
type ProjectPatch = Partial<Omit<Project, "id" | "createdAt">>;
type SettingsPatch = Partial<AppSettings>;

export type AccountProfile = {
  uid: string;
  displayName?: string;
  email?: string;
  photoURL?: string;
  isAnonymous: boolean;
};

type AppContextType = {
  captures: Capture[];
  snoozedCount: number;
  tasks: Task[];
  habits: Habit[];
  habitLogs: HabitLog[];
  routines: Routine[];
  goals: Goal[];
  projects: Project[];
  activities: Activity[];
  settings: AppSettings;
  syncStatus: SyncStatus;
  firebaseConfigured: boolean;
  account: AccountProfile | null;
  accountLoading: boolean;
  accountError: string | null;
  signInAccount: (email: string, password: string) => Promise<void>;
  signOutAccount: () => Promise<void>;
  addCapture: (title: string) => void;
  createTask: (task: Omit<Task, "id" | "createdAt">) => string;
  removeCapture: (id: string) => void;
  snoozeCapture: (id: string, remindAt: Date) => void;
  processCapture: (
    captureId: string,
    destination: ProcessDestination,
  ) => void;
  processCapturePlanned: (captureId: string, plan: PlannedCapture) => void;
  updateTask: (taskId: string, patch: TaskPatch) => void;
  deleteTask: (taskId: string) => void;
  moveTask: (taskId: string, status: TaskStatus) => void;
  startTask: (taskId: string) => void;
  pauseTask: (taskId: string, reason: string, note?: string) => void;
  setActiveTask: (taskId: string) => void;
  addHabit: (habit: Omit<Habit, "id">) => string;
  deleteHabit: (habitId: string) => void;
  updateHabit: (habitId: string, changes: Partial<Omit<Habit, "id">>) => void;
  skipHabit: (habitId: string, date?: string) => void;
  toggleHabit: (habitId: string, date?: string) => void;
  incrementHabit: (habitId: string, amount?: number, date?: string) => void;
  addRoutine: (routine: Omit<Routine, "id">) => void;
  updateRoutine: (routineId: string, patch: Omit<Routine, "id">) => void;
  addGoal: (goal: Omit<Goal, "id" | "createdAt">) => void;
  updateGoal: (goalId: string, patch: GoalPatch) => void;
  toggleGoalMilestone: (goalId: string, milestoneId: string) => void;
  setGoalCompleted: (goalId: string, completed: boolean) => void;
  addProject: (project: Omit<Project, "id" | "createdAt">) => string;
  initializeProjectTask: (projectId: string) => void;
  convertTaskToProject: (taskId: string, splitSubtasks: boolean) => string | undefined;
  deleteProject: (projectId: string, deleteChildren: boolean) => void;
  updateProject: (projectId: string, patch: ProjectPatch) => void;
  addActivity: (activity: Omit<Activity, "id" | "createdAt">) => void;
  createLabel: (name: string) => string;
  renameLabel: (name: string, next: string) => boolean;
  deleteLabel: (name: string) => void;
  updateSettings: (patch: SettingsPatch) => void;
  resetSettings: () => void;
  clearDemoData: () => Promise<void>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

type AppProviderProps = {
  children: ReactNode;
};

export function AppProvider({ children }: AppProviderProps) {
  const [captures, setCaptures] = useState<Capture[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habitDefinitions, setHabitDefinitions] = useState<Habit[]>([]);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [settings, setSettings] = useState<AppSettings>(defaultAppSettings);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(isFirebaseConfigured ? "connecting" : "local");
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [accountLoading, setAccountLoading] = useState(isFirebaseConfigured);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [now, setNow] = useState(() => new Date());

  const habits = useMemo(() => {
    const todayKey = getDateKey(now);
    return habitDefinitions.map((habit) => {
      const log = getHabitLog(habitLogs, habit.id, todayKey);
      return {
        ...habit,
        current: habit.type === "complete" ? undefined : (log?.value ?? 0),
        completed: habit.type === "complete" ? Boolean(log?.completed) : undefined,
        streak: calculateCurrentStreak(habit, habitLogs),
        bestStreak: calculateBestStreak(habit, habitLogs),
      };
    });
  }, [habitDefinitions, habitLogs, now]);

  const account = useMemo<AccountProfile | null>(() => {
    if (!firebaseUser) return null;

    return {
      uid: firebaseUser.uid,
      displayName: firebaseUser.displayName ?? undefined,
      email: firebaseUser.email ?? undefined,
      photoURL: firebaseUser.photoURL ?? undefined,
      isAnonymous: firebaseUser.isAnonymous,
    };
  }, [firebaseUser]);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setAccountLoading(false);
      return;
    }

    const unsubscribe = observeFirebaseUser((user) => {
      setFirebaseUser(user);
      setAccountLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 60_000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setSyncStatus("local");
      return;
    }

    // Esperamos a conocer el usuario actual antes de conectar sus colecciones.
    if (!firebaseUser) return;

    let disconnected = false;
    let unsubscribe: () => void = () => {};

    void connectCorePersistence(
      {
        captures,
        tasks,
        habits: habitDefinitions,
        habitLogs,
        routines,
        goals,
        projects,
        activities,
        settings,
      },
      {
        onCaptures: (nextCaptures) => {
          if (!disconnected) setCaptures(nextCaptures);
        },
        onTasks: (nextTasks) => {
          if (!disconnected) setTasks(nextTasks);
        },
        onHabits: (nextHabits) => {
          if (!disconnected) setHabitDefinitions(nextHabits);
        },
        onHabitLogs: (nextLogs) => {
          if (!disconnected) setHabitLogs(nextLogs);
        },
        onRoutines: (nextRoutines) => {
          if (!disconnected) setRoutines(nextRoutines);
        },
        onGoals: (nextGoals) => {
          if (!disconnected) setGoals(nextGoals);
        },
        onProjects: (nextProjects) => {
          if (!disconnected) setProjects(nextProjects);
        },
        onActivities: (nextActivities) => {
          if (!disconnected) setActivities(nextActivities);
        },
        onSettings: (nextSettings) => {
          if (!disconnected) {
            setSettings({
              ...defaultAppSettings,
              ...nextSettings,
            });
          }
        },
        onStatus: (status) => {
          if (!disconnected) setSyncStatus(status);
        },
      },
    ).then((cleanup) => {
      if (disconnected) cleanup();
      else unsubscribe = cleanup;
    });

    return () => {
      disconnected = true;
      unsubscribe();
    };
    // Solo reconectamos si cambia la cuenta/UID. El estado actual sirve como
    // semilla cuando una cuenta nueva todavía no tiene datos.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firebaseUser?.uid]);

  const visibleCaptures = useMemo(
    () => captures.filter((capture) => !capture.remindAt || capture.remindAt <= now),
    [captures, now],
  );

  const snoozedCount = captures.length - visibleCaptures.length;

  function addActivity(activity: Omit<Activity, "id" | "createdAt">) {
    const nextActivity: Activity = {
      ...activity,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    setActivities((current) => [nextActivity, ...current]);
    persistSafely(saveActivity(nextActivity));
  }

  function logEntityActivity(
    entityType: ActivityEntityType,
    entityId: string,
    kind: ActivityKind,
    title: string,
    message: string,
    project?: string,
    note?: string,
  ) {
    addActivity({ entityType, entityId, kind, title, message, project, note });
  }

  function createTask(task: Omit<Task, "id" | "createdAt">) {
    const id = crypto.randomUUID();
    const newTask: Task = {
      ...task,
      backlog: task.backlog ?? task.status === "backlog",
      id,
      createdAt: new Date(),
    };
    setTasks((current) => [newTask, ...current]);
    persistSafely(saveTask(newTask));
    logEntityActivity("task", id, "created", newTask.title, "Creaste la tarea", newTask.project);
    if (newTask.plannedDate) {
      logEntityActivity("task", id, "planned", newTask.title, "Planificaste la tarea", newTask.project);
    }
    return id;
  }

  function addCapture(title: string) {
    const cleanTitle = title.trim();
    if (!cleanTitle) return;

    const newCapture: Capture = {
      id: crypto.randomUUID(),
      title: cleanTitle,
      createdAt: new Date(),
    };

    setCaptures((current) => [newCapture, ...current]);
    persistSafely(saveCapture(newCapture));
    logEntityActivity("capture", newCapture.id, "created", newCapture.title, "Capturaste una idea");
  }

  function removeCapture(id: string) {
    setCaptures((current) =>
      current.filter((capture) => capture.id !== id),
    );
    persistSafely(deletePersistedCapture(id));
  }

  function snoozeCapture(id: string, remindAt: Date) {
    const capture = captures.find((item) => item.id === id);
    setCaptures((current) =>
      current.map((capture) =>
        capture.id === id
          ? { ...capture, remindAt }
          : capture,
      ),
    );
    if (capture) {
      persistSafely(saveCapture({ ...capture, remindAt }));
      logEntityActivity("capture", id, "planned", capture.title, "Pospusiste la captura para después");
    }
  }

  function processCapture(
    captureId: string,
    destination: ProcessDestination,
  ) {
    const capture = captures.find((item) => item.id === captureId);
    if (!capture) return;

    const task: Task = {
      id: crypto.randomUUID(),
      title: capture.title,
      status: destination === "backlog" ? "backlog" : "pending",
      createdAt: new Date(),
      ...(destination === "today"
        ? { plannedDate: getLocalDateKey() }
        : {}),
    };

    setTasks((current) => [task, ...current]);
    persistSafely(saveTask(task));
    logEntityActivity(
      "task",
      task.id,
      "created",
      task.title,
      destination === "backlog" ? "Convertiste la captura en tarea de Backlog" : "Convertiste la captura en tarea para hoy",
      task.project,
    );
    removeCapture(captureId);
  }


  function processCapturePlanned(captureId: string, plan: PlannedCapture) {
    const capture = captures.find((item) => item.id === captureId);
    if (!capture) return;

    const task: Task = {
      id: crypto.randomUUID(),
      title: capture.title,
      status: "pending",
      createdAt: new Date(),
      plannedDate: plan.plannedDate,
      plannedTime: plan.plannedTime,
      estimatedMinutes: plan.estimatedMinutes,
    };

    setTasks((current) => [task, ...current]);
    persistSafely(saveTask(task));
    logEntityActivity("task", task.id, "planned", task.title, "Convertiste y planificaste la captura", task.project);
    removeCapture(captureId);
  }

  function updateTask(taskId: string, patch: TaskPatch) {
    const currentTask = tasks.find((task) => task.id === taskId);
    if (patch.backlog === false && currentTask?.status === "backlog") patch = { ...patch, status: "pending" };
    if (patch.backlog === true) patch = { ...patch, isActive: false };
    let projectSettings = settings;
    if (currentTask?.projectRole === "main") {
      if (patch.title !== undefined) patch = { ...patch, project: patch.title };
      if (Object.prototype.hasOwnProperty.call(patch, "spaceId")) {
        const move = prepareTaskSpaceMove(settings, currentTask, patch.spaceId);
        patch = { ...patch, ...move.patch };
        if (move.settingsPatch) projectSettings = { ...settings, ...move.settingsPatch };
      }
    }
    if (patch.status && patch.status !== currentTask?.status) {
      patch = { ...patch, completedAt: patch.status === "completed" ? new Date() : undefined };
    }
    setTasks((current) =>
      current.map((task) =>
        task.id === taskId ? { ...task, ...patch } : task,
      ),
    );

    if (!currentTask) return;
    persistSafely(saveTask({ ...currentTask, ...patch }));
    if (currentTask.projectRole === "main" && currentTask.projectId) {
      const project = projects.find(item => item.id === currentTask.projectId);
      if (project) {
        const nextProject = { ...project, ...(patch.title !== undefined ? { name: patch.title } : {}), ...(Object.prototype.hasOwnProperty.call(patch, "spaceId") ? { spaceId: patch.spaceId } : {}), ...(Object.prototype.hasOwnProperty.call(patch, "area") ? { area: patch.area } : {}) };
        setProjects(current => current.map(item => item.id === project.id ? nextProject : item)); persistSafely(saveProject(nextProject));
        let nextSettings = projectSettings;
        const children = projectChildren(tasks, project).map(child => {
          const move = !child.showOutsideProject && Object.prototype.hasOwnProperty.call(patch, "spaceId") ? prepareTaskSpaceMove(nextSettings, child, patch.spaceId) : undefined;
          if (move?.settingsPatch) nextSettings = { ...nextSettings, ...move.settingsPatch };
          return { ...child, ...(move?.patch ?? {}), projectId: project.id, projectRole: "child" as const, project: nextProject.name };
        });
        if (nextSettings !== settings) updateSettings(nextSettings);
        const changed = new Map(children.map(child => [child.id, child]));
        setTasks(current => current.map(item => changed.get(item.id) ?? item)); persistSafely(saveTasks(children));
      }
    }
    const nextTitle = patch.title ?? currentTask.title;
    const nextProject = patch.project ?? currentTask.project;

    if (patch.plannedDate !== undefined || patch.plannedTime !== undefined || patch.estimatedMinutes !== undefined) {
      logEntityActivity("task", taskId, "planned", nextTitle, "Actualizaste la planificación", nextProject);
    } else if (patch.status && patch.status !== currentTask.status) {
      logEntityActivity("task", taskId, statusToActivityKind(patch.status), nextTitle, statusToActivityMessage(patch.status), nextProject);
    } else {
      logEntityActivity("task", taskId, "updated", nextTitle, "Actualizaste la tarea", nextProject);
    }
  }

  function deleteTask(taskId: string) {
    if (!tasks.some((task) => task.id === taskId)) return;
    setTasks((current) => current.filter((task) => task.id !== taskId));
    persistSafely(deletePersistedTask(taskId));
  }

  function moveTask(taskId: string, status: TaskStatus) {
    const currentTask = tasks.find((task) => task.id === taskId);
    setTasks((current) =>
      current.map((task) => {
        if (task.id !== taskId) return task;

        return {
          ...task,
          status,
          isActive: status === "in_progress" ? task.isActive : false,
          completedAt: status === "completed" ? (currentTask?.status === "completed" ? currentTask.completedAt : new Date()) : undefined,
        };
      }),
    );
    if (currentTask) {
      persistSafely(
        saveTask({
          ...currentTask,
          status,
          isActive: status === "in_progress" ? currentTask.isActive : false,
          completedAt: status === "completed" ? (currentTask?.status === "completed" ? currentTask.completedAt : new Date()) : undefined,
        }),
      );
    }
    if (currentTask?.projectRole === "main" && currentTask.projectId) {
      const project = projects.find(item => item.id === currentTask.projectId);
      if (project) { const next = { ...project, status: status === "completed" ? "completed" as const : status === "paused" ? "paused" as const : "active" as const }; setProjects(current => current.map(item => item.id === project.id ? next : item)); persistSafely(saveProject(next)); }
    }
    if (currentTask && currentTask.status !== status) {
      logEntityActivity(
        "task", taskId, statusToActivityKind(status), currentTask.title,
        statusToActivityMessage(status), currentTask.project,
      );
    }
  }

  function setActiveTask(taskId: string) {
    const nextTasks = tasks.map((task) => ({
      ...task,
      isActive: task.id === taskId,
    }));
    setTasks(nextTasks);
    persistSafely(saveTasks(nextTasks.filter((task) => task.isActive || tasks.find((item) => item.id === task.id)?.isActive)));
  }

  function startTask(taskId: string) {
    const currentTask = tasks.find((task) => task.id === taskId);
    if (!currentTask) return;

    const alreadyInProgress = currentTask.status === "in_progress";
    const inProgressCount = tasks.filter((task) => task.status === "in_progress").length;
    if (!alreadyInProgress && inProgressCount >= settings.wipLimit) {
      window.alert(`Ya tienes ${settings.wipLimit} tareas en proceso. Pausa o finaliza una antes de iniciar otra.`);
      return;
    }

    const hasActiveTask = tasks.some((task) => task.isActive && task.id !== taskId);
    const makeActive = settings.singleActiveTask || !hasActiveTask;

    const nextTasks = tasks.map((task) => {
      if (task.id === taskId) {
        return {
          ...task,
          status: "in_progress" as TaskStatus,
          isActive: makeActive ? true : task.isActive,
          startedAt: task.startedAt ?? new Date(),
          pauseReason: undefined,
          pauseNote: undefined,
        };
      }

      return settings.singleActiveTask && task.isActive ? { ...task, isActive: false } : task;
    });

    setTasks(nextTasks);
    persistSafely(
      saveTasks(
        nextTasks.filter((task) => {
          const previous = tasks.find((item) => item.id === task.id);
          return task.id === taskId || previous?.isActive !== task.isActive;
        }),
      ),
    );
    if (currentTask) {
      logEntityActivity(
        "task", taskId, currentTask.status === "paused" ? "resumed" : "started", currentTask.title,
        currentTask.status === "paused" ? "Reanudaste la tarea" : "Iniciaste la tarea", currentTask.project,
      );
    }
  }

  function pauseTask(taskId: string, reason: string, note?: string) {
    const currentTask = tasks.find((task) => task.id === taskId);
    const nextTask = currentTask
      ? {
          ...currentTask,
          status: "paused" as TaskStatus,
          isActive: false,
          pauseReason: reason,
          pauseNote: note?.trim() || undefined,
        }
      : null;

    setTasks((current) =>
      current.map((task) =>
        task.id === taskId && nextTask ? nextTask : task,
      ),
    );
    if (nextTask) persistSafely(saveTask(nextTask));
    if (currentTask) {
      logEntityActivity("task", taskId, "paused", currentTask.title, `Pausaste la tarea · ${reason}`, currentTask.project, note?.trim() || undefined);
    }
  }


  function addHabit(habit: Omit<Habit, "id">) {
    const id = crypto.randomUUID();
    const nextHabit: Habit = { ...habit, id };
    setHabitDefinitions((current) => [nextHabit, ...current]);
    persistSafely(saveHabit(nextHabit));
    logEntityActivity("habit", id, "created", habit.title, "Creaste el hábito");
    return id;
  }

  function deleteHabit(habitId: string) {
    setHabitDefinitions(current => current.filter(habit => habit.id !== habitId));
    setHabitLogs(current => current.filter(log => log.habitId !== habitId));
    persistSafely(deletePersistedHabit(habitId));
  }

  function updateHabit(habitId: string, changes: Partial<Omit<Habit, "id">>) {
    const habit = habitDefinitions.find(item => item.id === habitId);
    if (!habit) return;
    const next = { ...habit, ...changes, id: habitId };
    setHabitDefinitions(current => current.map(item => item.id === habitId ? next : item));
    persistSafely(saveHabit(next));
  }

  function skipHabit(habitId: string, date = getDateKey()) {
    if (!habitDefinitions.some(item => item.id === habitId)) return;
    const existing = getHabitLog(habitLogs, habitId, date);
    const nextLog: HabitLog = { habitId, date, value: 0, completed: false, status: existing?.status === "skipped" ? "pending" : "skipped" };
    setHabitLogs(current => upsertHabitLog(current, nextLog));
    persistSafely(saveHabitLog(nextLog));
  }

  function toggleHabit(habitId: string, date = getDateKey()) {
    const habit = habitDefinitions.find((item) => item.id === habitId);
    if (!habit || habit.type !== "complete") return;

    const existing = getHabitLog(habitLogs, habitId, date);
    const completed = !existing?.completed;

    const nextLog: HabitLog = {
      habitId,
      date,
      value: completed ? 1 : 0,
      completed,
    };
    setHabitLogs((current) => upsertHabitLog(current, nextLog));
    persistSafely(saveHabitLog(nextLog));
    logEntityActivity("habit", habitId, completed ? "completed" : "updated", habit.title, completed ? "Completaste el hábito" : "Marcaste el hábito como pendiente");
  }

  function incrementHabit(habitId: string, amount = 1, date = getDateKey()) {
    const habit = habitDefinitions.find((item) => item.id === habitId);
    if (!habit || habit.type === "complete") return;

    const existing = getHabitLog(habitLogs, habitId, date);
    const next = Math.max(0, (existing?.value ?? 0) + amount);
    const target = habit.target ?? 1;

    const nextLog: HabitLog = {
      habitId,
      date,
      value: next,
      completed: next >= target,
    };
    setHabitLogs((current) => upsertHabitLog(current, nextLog));
    persistSafely(saveHabitLog(nextLog));
    if ((existing?.value ?? 0) < target && next >= target) {
      logEntityActivity("habit", habitId, "completed", habit.title, "Completaste la meta diaria del hábito");
    } else {
      logEntityActivity("habit", habitId, "progress", habit.title, `Registraste ${next} ${habit.unit ?? ""}`.trim());
    }
  }


  function addRoutine(routine: Omit<Routine, "id">) {
    const id = crypto.randomUUID();
    const nextRoutine: Routine = { ...routine, id };
    setRoutines((current) => [nextRoutine, ...current]);
    persistSafely(saveRoutine(nextRoutine));
    logEntityActivity("routine", id, "created", routine.title, "Creaste la rutina");
  }

  function updateRoutine(routineId: string, patch: Omit<Routine, "id">) {
    const currentRoutine = routines.find((routine) => routine.id === routineId);
    const nextRoutine = currentRoutine ? { ...currentRoutine, ...patch } : null;
    setRoutines((current) =>
      current.map((routine) =>
        routine.id === routineId && nextRoutine ? nextRoutine : routine,
      ),
    );
    if (nextRoutine) persistSafely(saveRoutine(nextRoutine));
    logEntityActivity("routine", routineId, "updated", patch.title, "Actualizaste la rutina");
  }


  function addGoal(goal: Omit<Goal, "id" | "createdAt">) {
    const id = crypto.randomUUID();
    const nextGoal: Goal = { ...goal, id, createdAt: new Date() };
    setGoals((current) => [nextGoal, ...current]);
    persistSafely(saveGoal(nextGoal));
    logEntityActivity("goal", id, "created", goal.title, "Creaste la meta", goal.project);
  }

  function updateGoal(goalId: string, patch: GoalPatch) {
    const goal = goals.find((item) => item.id === goalId);
    const nextGoal = goal ? { ...goal, ...patch } : null;
    setGoals((current) =>
      current.map((goal) =>
        goal.id === goalId && nextGoal ? nextGoal : goal,
      ),
    );
    if (nextGoal) persistSafely(saveGoal(nextGoal));
    if (goal) logEntityActivity("goal", goalId, "updated", patch.title ?? goal.title, "Actualizaste la meta", patch.project ?? goal.project);
  }

  function toggleGoalMilestone(goalId: string, milestoneId: string) {
    const goal = goals.find((item) => item.id === goalId);
    const milestone = goal?.milestones.find((item) => item.id === milestoneId);
    const nextGoal = goal
      ? {
          ...goal,
          milestones: goal.milestones.map((item) =>
            item.id === milestoneId ? { ...item, completed: !item.completed } : item,
          ),
        }
      : null;
    setGoals((current) =>
      current.map((item) => item.id === goalId && nextGoal ? nextGoal : item),
    );
    if (nextGoal) persistSafely(saveGoal(nextGoal));
    if (goal && milestone) {
      logEntityActivity("goal", goalId, "progress", goal.title, `${milestone.completed ? "Reabriste" : "Completaste"} el hito: ${milestone.title}`, goal.project);
    }
  }

  function setGoalCompleted(goalId: string, completed: boolean) {
    const goal = goals.find((item) => item.id === goalId);
    const nextGoal = goal ? { ...goal, completed } : null;
    setGoals((current) =>
      current.map((item) => item.id === goalId && nextGoal ? nextGoal : item),
    );
    if (nextGoal) persistSafely(saveGoal(nextGoal));
    if (goal) logEntityActivity("goal", goalId, completed ? "completed" : "updated", goal.title, completed ? "Completaste la meta" : "Reabriste la meta", goal.project);
  }



  async function signInAccount(email: string, password: string) {
    if (!isFirebaseConfigured) return;

    setAccountLoading(true);
    setAccountError(null);

    try {
      const user = await connectEmailAccount(email, password);
      if (user) setFirebaseUser(user);
    } catch (error) {
      console.error("No se pudo iniciar sesión:", error);
      setAccountError(getFriendlyAuthError(error));
    } finally {
      setAccountLoading(false);
    }
  }

  async function signOutAccount() {
    if (!isFirebaseConfigured) return;

    setAccountLoading(true);
    setAccountError(null);

    try {
      const user = await disconnectAccount();
      setFirebaseUser(user);
    } catch (error) {
      console.error("No se pudo cerrar la sesión:", error);
      setAccountError("No se pudo cerrar la sesión. Inténtalo de nuevo.");
    } finally {
      setAccountLoading(false);
    }
  }

  function labelCatalog() {
    return uniqueLabels([...(settings.labels ?? []), ...tasks.flatMap(task => task.labels ?? []), ...habitDefinitions.flatMap(habit => habit.labels ?? [])]);
  }

  function createLabel(name: string) {
    const clean = uniqueLabels([name])[0];
    if (!clean) return "";
    const catalog = labelCatalog();
    const canonical = catalog.find(value => labelKey(value) === labelKey(clean)) ?? clean;
    updateSettings({ labels: uniqueLabels([...catalog, canonical]) });
    return canonical;
  }

  function renameLabel(name: string, next: string) {
    const clean = uniqueLabels([next])[0];
    if (!clean) return false;
    const catalog = labelCatalog();
    if (catalog.some(value => labelKey(value) === labelKey(clean) && labelKey(value) !== labelKey(name))) return false;
    updateSettings({ labels: uniqueLabels(catalog.map(value => labelKey(value) === labelKey(name) ? clean : value)) });
    const nextTasks = tasks.map(task => task.labels?.some(value => labelKey(value) === labelKey(name)) ? { ...task, labels: uniqueLabels(task.labels.map(value => labelKey(value) === labelKey(name) ? clean : value)) } : task);
    setTasks(nextTasks);
    nextTasks.forEach((task, index) => { if (task !== tasks[index]) persistSafely(saveTask(task)); });
    const nextHabits = habitDefinitions.map(habit => habit.labels?.some(value => labelKey(value) === labelKey(name)) ? { ...habit, labels: uniqueLabels(habit.labels.map(value => labelKey(value) === labelKey(name) ? clean : value)) } : habit);
    setHabitDefinitions(nextHabits);
    nextHabits.forEach((habit, index) => { if (habit !== habitDefinitions[index]) persistSafely(saveHabit(habit)); });
    return true;
  }

  function deleteLabel(name: string) {
    updateSettings({ labels: labelCatalog().filter(value => labelKey(value) !== labelKey(name)) });
    const nextTasks = tasks.map(task => task.labels?.some(value => labelKey(value) === labelKey(name)) ? { ...task, labels: task.labels.filter(value => labelKey(value) !== labelKey(name)) } : task);
    setTasks(nextTasks);
    nextTasks.forEach((task, index) => { if (task !== tasks[index]) persistSafely(saveTask(task)); });
    const nextHabits = habitDefinitions.map(habit => habit.labels?.some(value => labelKey(value) === labelKey(name)) ? { ...habit, labels: habit.labels.filter(value => labelKey(value) !== labelKey(name)) } : habit);
    setHabitDefinitions(nextHabits);
    nextHabits.forEach((habit, index) => { if (habit !== habitDefinitions[index]) persistSafely(saveHabit(habit)); });
  }

  function updateSettings(patch: SettingsPatch) {
    const nextSettings: AppSettings = {
      ...settings,
      ...patch,
    };
    setSettings(nextSettings);
    persistSafely(saveSettings(nextSettings));
  }

  function resetSettings() {
    setSettings(defaultAppSettings);
    persistSafely(saveSettings(defaultAppSettings));
  }

  async function clearDemoData() {
    if (!isFirebaseConfigured) return;
    await removeKnownDemoData();
  }

  function addProject(project: Omit<Project, "id" | "createdAt">) {
    const id = crypto.randomUUID();
    const mainTaskId = createTask({ title: project.name, description: project.description, status: project.status === "completed" ? "completed" : "pending", spaceId: project.spaceId, area: project.area, kind: "project", projectId: id, projectRole: "main", project: project.name });
    const nextProject: Project = { ...project, id, mainTaskId, createdAt: new Date() };
    setProjects(current => [nextProject, ...current]);
    persistSafely(saveProject(nextProject));
    logEntityActivity("project", id, "created", project.name, "Creaste el proyecto", project.name);
    return id;
  }

  function initializeProjectTask(projectId: string) {
    const project = projects.find(item => item.id === projectId);
    if (!project || tasks.some(task => task.id === project.mainTaskId)) return;
    const id = createTask({ title: project.name, description: project.description, status: project.status === "completed" ? "completed" : "pending", spaceId: project.spaceId, area: project.area, projectId: project.id, projectRole: "main", project: project.name, kind: "project" });
    const next = { ...project, mainTaskId: id }; setProjects(current => current.map(item => item.id === projectId ? next : item)); persistSafely(saveProject(next));
    const children = projectChildren(tasks, project).map(task => ({ ...task, projectId: project.id, projectRole: "child" as const, spaceId: project.spaceId }));
    const byId = new Map(children.map(task => [task.id, task])); setTasks(current => current.map(task => byId.get(task.id) ?? task)); persistSafely(saveTasks(children));
  }

  function convertTaskToProject(taskId: string, splitSubtasks: boolean) {
    const task = tasks.find(item => item.id === taskId);
    if (!task || task.projectRole === "child") return undefined;
    if (task.projectRole === "main" && task.projectId) return task.projectId;
    const result = buildTaskProject(task, splitSubtasks, crypto.randomUUID(), () => crypto.randomUUID());
    setProjects(current => [result.project, ...current]);
    setTasks(current => [...result.children, ...current.map(item => item.id === taskId ? result.main : item)]);
    persistSafely(saveProject(result.project));
    persistSafely(saveTasks([result.main, ...result.children]));
    logEntityActivity("project", result.project.id, "created", result.project.name, "Convertiste la tarea en proyecto", result.project.name);
    return result.project.id;
  }

  function deleteProject(projectId: string, deleteChildren: boolean) {
    const project = projects.find(item => item.id === projectId);
    if (!project) return;
    const { removedIds, kept } = projectDeletion(tasks, project, deleteChildren);
    const replacements = new Map(kept.map(task => [task.id, task]));
    setTasks(current => current.filter(task => !removedIds.includes(task.id)).map(task => replacements.get(task.id) ?? task));
    setProjects(current => current.filter(item => item.id !== projectId));
    persistSafely(deleteProjectData(projectId, removedIds, kept));
  }

  function updateProject(projectId: string, patch: ProjectPatch) {
    const currentProject = projects.find((project) => project.id === projectId);
    const nextProject = currentProject ? { ...currentProject, ...patch } : null;
    setProjects((current) =>
      current.map((project) =>
        project.id === projectId && nextProject ? nextProject : project,
      ),
    );
    if (nextProject) {
      persistSafely(saveProject(nextProject));
      const main = tasks.find(task => task.id === nextProject.mainTaskId);
      if (main) {
        const nextMain = { ...main, title: nextProject.name, project: nextProject.name, status: nextProject.status === "completed" ? "completed" as const : main.status === "completed" ? "pending" as const : main.status, completedAt: nextProject.status === "completed" ? main.completedAt ?? new Date() : undefined };
        setTasks(current => current.map(task => task.id === main.id ? nextMain : task)); persistSafely(saveTask(nextMain));
      }
    }

    if (currentProject?.name && patch.name && patch.name !== currentProject.name) {
      const renamedTasks = tasks
        .filter((task) => task.id !== nextProject?.mainTaskId && (task.projectId === projectId || (!task.projectId && task.project === currentProject.name)))
        .map((task) => ({ ...task, project: patch.name }));
      setTasks((current) =>
        current.map((task) =>
          (task.projectId === projectId || (!task.projectId && task.project === currentProject.name)) ? { ...task, project: patch.name } : task,
        ),
      );
      persistSafely(saveTasks(renamedTasks));
      const renamedGoals = goals
        .filter((goal) => goal.project === currentProject.name)
        .map((goal) => ({ ...goal, project: patch.name }));
      setGoals((current) =>
        current.map((goal) =>
          goal.project === currentProject.name ? { ...goal, project: patch.name } : goal,
        ),
      );
      renamedGoals.forEach((goal) => persistSafely(saveGoal(goal)));

      const renamedActivities = activities
        .filter((activity) => activity.project === currentProject.name)
        .map((activity) => ({ ...activity, project: patch.name }));
      setActivities((current) =>
        current.map((activity) =>
          activity.project === currentProject.name ? { ...activity, project: patch.name } : activity,
        ),
      );
      renamedActivities.forEach((activity) => persistSafely(saveActivity(activity)));
    }
    if (currentProject) {
      const nextName = patch.name ?? currentProject.name;
      logEntityActivity("project", projectId, "updated", nextName, "Actualizaste el proyecto", nextName);
    }
  }

  return (
    <AppContext.Provider
      value={{
        captures: visibleCaptures,
        snoozedCount,
        tasks,
        habits,
        habitLogs,
        routines,
        goals,
        projects,
        activities,
        settings,
        syncStatus,
        firebaseConfigured: isFirebaseConfigured,
        account,
        accountLoading,
        accountError,
        signInAccount,
        signOutAccount,
        addCapture,
        createTask,
        removeCapture,
        snoozeCapture,
        processCapture,
        processCapturePlanned,
        updateTask,
        deleteTask,
        moveTask,
        startTask,
        pauseTask,
        setActiveTask,
        addHabit,
        deleteHabit,
        updateHabit,
        skipHabit,
        toggleHabit,
        incrementHabit,
        addRoutine,
        updateRoutine,
        addGoal,
        updateGoal,
        toggleGoalMilestone,
        setGoalCompleted,
        addProject,
        convertTaskToProject,
        initializeProjectTask,
        updateProject,
        deleteProject,
        addActivity,
        createLabel, renameLabel, deleteLabel,
        updateSettings,
        resetSettings,
        clearDemoData,
      }}
    >
      {accountLoading ? (
        <LoginScreen loading />
      ) : firebaseUser ? (
        children
      ) : (
        <LoginScreen
          configured={isFirebaseConfigured}
          error={accountError}
          onSignIn={(email, password) => void signInAccount(email, password)}
        />
      )}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useApp debe utilizarse dentro de AppProvider");
  }

  return context;
}

function getFriendlyAuthError(error: unknown) {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code?: unknown }).code ?? "")
      : "";

  if (code === "auth/unauthorized-domain") return "Este dominio todavía no está autorizado en Firebase Authentication.";
  if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") {
    return "El correo o la contraseña son incorrectos.";
  }
  if (code === "auth/too-many-requests") return "Hubo demasiados intentos. Espera un momento e inténtalo de nuevo.";

  return "No se pudo iniciar sesión. Inténtalo de nuevo.";
}

function persistSafely(promise: Promise<unknown>) {
  void promise.catch((error) => {
    console.error("Error guardando en Firebase:", error);
  });
}

function statusToActivityKind(status: TaskStatus): ActivityKind {
  if (status === "in_progress") return "started";
  if (status === "paused") return "paused";
  if (status === "review") return "review";
  if (status === "completed") return "completed";
  if (status === "cancelled") return "cancelled";
  return "moved";
}

function statusToActivityMessage(status: TaskStatus) {
  if (status === "backlog") return "Moviste la tarea a Backlog";
  if (status === "pending") return "Moviste la tarea a Pendiente";
  if (status === "in_progress") return "Moviste la tarea a En proceso";
  if (status === "paused") return "Pausaste la tarea";
  if (status === "review") return "Enviaste la tarea a revisión";
  if (status === "completed") return "Finalizaste la tarea";
  return "Cancelaste la tarea";
}

function upsertHabitLog(logs: HabitLog[], nextLog: HabitLog) {
  const exists = logs.some(
    (log) => log.habitId === nextLog.habitId && log.date === nextLog.date,
  );

  if (!exists) return [...logs, nextLog];

  return logs.map((log) =>
    log.habitId === nextLog.habitId && log.date === nextLog.date ? nextLog : log,
  );
}

function getLocalDateKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
