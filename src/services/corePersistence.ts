import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  setDoc,
  type DocumentData,
  type Unsubscribe,
} from "firebase/firestore";

import { auth, db, isFirebaseConfigured } from "../lib/firebase";
import type { Activity } from "../types/activity";
import type { Capture } from "../types/capture";
import type { Goal } from "../types/goal";
import type { Habit, HabitLog } from "../types/habit";
import type { Project } from "../types/project";
import type { Routine } from "../types/routine";
import type { AppSettings } from "../types/settings";
import type { Task } from "../types/task";

export type SyncStatus = "local" | "connecting" | "synced" | "error";

type AppSeed = {
  captures: Capture[];
  tasks: Task[];
  habits: Habit[];
  habitLogs: HabitLog[];
  routines: Routine[];
  goals: Goal[];
  projects: Project[];
  activities: Activity[];
  settings: AppSettings;
};

type AppCallbacks = {
  onCaptures: (items: Capture[]) => void;
  onTasks: (items: Task[]) => void;
  onHabits: (items: Habit[]) => void;
  onHabitLogs: (items: HabitLog[]) => void;
  onRoutines: (items: Routine[]) => void;
  onGoals: (items: Goal[]) => void;
  onProjects: (items: Project[]) => void;
  onActivities: (items: Activity[]) => void;
  onSettings: (settings: AppSettings) => void;
  onStatus: (status: SyncStatus) => void;
};

let activeUserId: string | null = null;

export function getPersistenceUserId() {
  return activeUserId;
}

export async function connectCorePersistence(
  seed: AppSeed,
  callbacks: AppCallbacks,
): Promise<Unsubscribe> {
  if (!isFirebaseConfigured || !db) {
    callbacks.onStatus("local");
    return () => undefined;
  }

  callbacks.onStatus("connecting");

  try {
    const user = auth?.currentUser ?? null;
    if (!user) {
      callbacks.onStatus("local");
      return () => undefined;
    }

    activeUserId = user.uid;
    await seedAppData(user.uid, seed);

    const unsubscribers: Unsubscribe[] = [];
    const collectionError = (label: string) => (error: unknown) => {
      console.error(`Error sincronizando ${label}:`, error);
      callbacks.onStatus("error");
    };

    unsubscribers.push(
      onSnapshot(
        collection(db, "users", user.uid, "captures"),
        (snapshot) => {
          callbacks.onCaptures(
            snapshot.docs
              .map((item) => decodeCapture(item.id, item.data()))
              .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
          );
          callbacks.onStatus("synced");
        },
        collectionError("captures"),
      ),
    );

    unsubscribers.push(
      onSnapshot(
        collection(db, "users", user.uid, "tasks"),
        (snapshot) => {
          callbacks.onTasks(
            snapshot.docs
              .map((item) => decodeTask(item.id, item.data()))
              .sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0)),
          );
          callbacks.onStatus("synced");
        },
        collectionError("tasks"),
      ),
    );

    unsubscribers.push(
      onSnapshot(
        collection(db, "users", user.uid, "habits"),
        (snapshot) => {
          callbacks.onHabits(snapshot.docs.map((item) => decodeHabit(item.id, item.data())));
          callbacks.onStatus("synced");
        },
        collectionError("habits"),
      ),
    );

    unsubscribers.push(
      onSnapshot(
        collection(db, "users", user.uid, "habitLogs"),
        (snapshot) => {
          callbacks.onHabitLogs(
            snapshot.docs
              .map((item) => decodeHabitLog(item.data()))
              .sort((a, b) => a.date.localeCompare(b.date)),
          );
          callbacks.onStatus("synced");
        },
        collectionError("habitLogs"),
      ),
    );

    unsubscribers.push(
      onSnapshot(
        collection(db, "users", user.uid, "routines"),
        (snapshot) => {
          callbacks.onRoutines(snapshot.docs.map((item) => decodeRoutine(item.id, item.data())));
          callbacks.onStatus("synced");
        },
        collectionError("routines"),
      ),
    );

    unsubscribers.push(
      onSnapshot(
        collection(db, "users", user.uid, "goals"),
        (snapshot) => {
          callbacks.onGoals(
            snapshot.docs
              .map((item) => decodeGoal(item.id, item.data()))
              .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
          );
          callbacks.onStatus("synced");
        },
        collectionError("goals"),
      ),
    );

    unsubscribers.push(
      onSnapshot(
        collection(db, "users", user.uid, "projects"),
        (snapshot) => {
          callbacks.onProjects(
            snapshot.docs
              .map((item) => decodeProject(item.id, item.data()))
              .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
          );
          callbacks.onStatus("synced");
        },
        collectionError("projects"),
      ),
    );

    unsubscribers.push(
      onSnapshot(
        collection(db, "users", user.uid, "activities"),
        (snapshot) => {
          callbacks.onActivities(
            snapshot.docs
              .map((item) => decodeActivity(item.id, item.data()))
              .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
          );
          callbacks.onStatus("synced");
        },
        collectionError("activities"),
      ),
    );

    unsubscribers.push(
      onSnapshot(
        doc(db, "users", user.uid, "settings", "main"),
        (snapshot) => {
          if (snapshot.exists()) callbacks.onSettings(snapshot.data() as AppSettings);
          callbacks.onStatus("synced");
        },
        collectionError("settings"),
      ),
    );

    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  } catch (error) {
    console.error("No se pudo conectar Firebase:", error);
    callbacks.onStatus("error");
    return () => undefined;
  }
}

export async function saveCapture(capture: Capture) {
  await saveUserDocument("captures", capture.id, capture);
}

export async function deleteCapture(id: string) {
  const userId = await resolveUserId();
  if (!db || !userId) return;
  await deleteDoc(doc(db, "users", userId, "captures", id));
}

export async function saveTask(task: Task) {
  await saveUserDocument("tasks", task.id, task);
}

export async function saveTasks(tasks: Task[]) {
  await Promise.all(tasks.map(saveTask));
}

export async function saveHabit(habit: Habit) {
  // current/completed/streak son valores derivados; no hace falta persistirlos.
  const { current: _current, completed: _completed, streak: _streak, bestStreak: _bestStreak, ...definition } = habit;
  await saveUserDocument("habits", habit.id, definition);
}

export async function saveHabitLog(log: HabitLog) {
  await saveUserDocument("habitLogs", habitLogId(log), log);
}

export async function saveRoutine(routine: Routine) {
  await saveUserDocument("routines", routine.id, routine);
}

export async function saveGoal(goal: Goal) {
  await saveUserDocument("goals", goal.id, goal);
}

export async function saveProject(project: Project) {
  await saveUserDocument("projects", project.id, project);
}

export async function saveActivity(activity: Activity) {
  await saveUserDocument("activities", activity.id, activity);
}

export async function saveSettings(settings: AppSettings) {
  const userId = await resolveUserId();
  if (!db || !userId) return;
  await setDoc(doc(db, "users", userId, "settings", "main"), cleanUndefined(settings));
}

async function saveUserDocument(collectionName: string, id: string, value: unknown) {
  const userId = await resolveUserId();
  if (!db || !userId) return;
  await setDoc(doc(db, "users", userId, collectionName, id), cleanUndefined(value));
}

async function resolveUserId() {
  if (activeUserId) return activeUserId;
  if (!isFirebaseConfigured) return null;

  activeUserId = auth?.currentUser?.uid ?? null;
  return activeUserId;
}

async function seedAppData(userId: string, seed: AppSeed) {
  if (!db) return;

  // Producción: nunca insertamos tareas, hábitos, metas o proyectos de demostración.
  // Únicamente creamos la configuración predeterminada si esta cuenta todavía no tiene una.
  const settingsRef = doc(db, "users", userId, "settings", "main");
  const settingsSnapshot = await getDoc(settingsRef);
  if (!settingsSnapshot.exists()) {
    await setDoc(settingsRef, cleanUndefined(seed.settings));
  }
}

export async function removeKnownDemoData() {
  const userId = await resolveUserId();
  if (!db || !userId) return;

  const knownIds: Record<string, Set<string>> = {
    captures: new Set(["capture-1", "capture-2", "capture-3"]),
    tasks: new Set(["1", "2", "3", "4"]),
    habits: new Set(["1", "2", "3"]),
    routines: new Set(["routine-morning", "routine-night"]),
    goals: new Set(["goal-1", "goal-2"]),
    projects: new Set(["project-work", "project-jardin", "project-personal"]),
    activities: new Set(["activity-1", "activity-2"]),
  };

  const deletes: Promise<unknown>[] = [];
  for (const [collectionName, ids] of Object.entries(knownIds)) {
    const snapshot = await getDocs(collection(db, "users", userId, collectionName));
    snapshot.docs.forEach((item) => {
      if (ids.has(item.id)) {
        deletes.push(deleteDoc(item.ref));
      }
    });
  }

  const logs = await getDocs(collection(db, "users", userId, "habitLogs"));
  logs.docs.forEach((item) => {
    if (["1__", "2__", "3__"].some((prefix) => item.id.startsWith(prefix))) {
      deletes.push(deleteDoc(item.ref));
    }
  });

  await Promise.all(deletes);
}

function habitLogId(log: HabitLog) {
  return `${log.habitId}__${log.date}`;
}

function decodeCapture(id: string, data: DocumentData): Capture {
  return {
    id,
    title: String(data.title ?? ""),
    createdAt: asDate(data.createdAt) ?? new Date(),
    remindAt: asDate(data.remindAt),
  };
}

function decodeTask(id: string, data: DocumentData): Task {
  return {
    ...(data as Omit<Task, "id" | "createdAt" | "startedAt" | "completedAt">),
    id,
    createdAt: asDate(data.createdAt),
    startedAt: asDate(data.startedAt),
    completedAt: asDate(data.completedAt),
  };
}

function decodeHabit(id: string, data: DocumentData): Habit {
  return { ...(data as Omit<Habit, "id">), id };
}

function decodeHabitLog(data: DocumentData): HabitLog {
  return {
    habitId: String(data.habitId ?? ""),
    date: String(data.date ?? ""),
    value: Number(data.value ?? 0),
    completed: Boolean(data.completed),
  };
}

function decodeRoutine(id: string, data: DocumentData): Routine {
  return { ...(data as Omit<Routine, "id">), id };
}

function decodeGoal(id: string, data: DocumentData): Goal {
  return {
    ...(data as Omit<Goal, "id" | "createdAt">),
    id,
    createdAt: asDate(data.createdAt) ?? new Date(),
  };
}

function decodeProject(id: string, data: DocumentData): Project {
  return {
    ...(data as Omit<Project, "id" | "createdAt">),
    id,
    createdAt: asDate(data.createdAt) ?? new Date(),
  };
}

function decodeActivity(id: string, data: DocumentData): Activity {
  return {
    ...(data as Omit<Activity, "id" | "createdAt">),
    id,
    createdAt: asDate(data.createdAt) ?? new Date(),
  };
}

function asDate(value: unknown): Date | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return value;

  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as { toDate?: unknown }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate();
  }

  const date = new Date(value as string | number);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function cleanUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    return value
      .map((item) => cleanUndefined(item))
      .filter((item) => item !== undefined) as T;
  }

  if (value instanceof Date) return value;

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, entry]) => entry !== undefined)
        .map(([key, entry]) => [key, cleanUndefined(entry)]),
    ) as T;
  }

  return value;
}
