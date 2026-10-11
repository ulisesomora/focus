import type { Habit, HabitLog } from "../types/habit";

export function getDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDateKey(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function isHabitScheduledForDate(habit: Habit, date: Date) {
  if (habit.frequency.type === "daily") return true;
  if (habit.frequency.type === "specific_days") {
    return habit.frequency.days.includes(date.getDay());
  }

  return getWeeklyCompletedCount(habit, [], date) < habit.frequency.times;
}

export function isHabitDueToday(habit: Habit, logs: HabitLog[], date = new Date()) {
  if (habit.frequency.type === "times_per_week") {
    return Boolean(getHabitLog(logs, habit.id, getDateKey(date))) || getWeeklyCompletedCount(habit, logs, date) < habit.frequency.times;
  }
  return isHabitScheduledForDate(habit, date);
}

export function getHabitLog(logs: HabitLog[], habitId: string, dateKey = getDateKey()) {
  return logs.find((log) => log.habitId === habitId && log.date === dateKey);
}

export function getWeeklyCompletedCount(habit: Habit, logs: HabitLog[], refDate = new Date()) {
  const { start, end } = getWeekBounds(refDate);
  return logs.filter((log) => {
    if (log.habitId !== habit.id || !log.completed) return false;
    const date = parseDateKey(log.date);
    return date >= start && date <= end;
  }).length;
}

export function getWeeklyTarget(habit: Habit) {
  if (habit.frequency.type === "times_per_week") return habit.frequency.times;
  if (habit.frequency.type === "specific_days") return habit.frequency.days.length;
  return 7;
}

export function getFrequencyLabel(habit: Habit) {
  if (habit.frequency.type === "daily") return "Todos los días";
  if (habit.frequency.type === "times_per_week") {
    return `${habit.frequency.times} veces por semana`;
  }

  const labels = ["D", "L", "M", "X", "J", "V", "S"];
  return habit.frequency.days.map((day) => labels[day]).join(" · ");
}

export function getConsistency(habit: Habit, logs: HabitLog[], days = 30) {
  const today = startOfDay(new Date());
  let expected = 0;
  let completed = 0;

  if (habit.frequency.type === "times_per_week") {
    const weeks = Math.ceil(days / 7);
    for (let offset = 0; offset < weeks; offset += 1) {
      const ref = new Date(today);
      ref.setDate(ref.getDate() - offset * 7);
      const done = getWeeklyCompletedCount(habit, logs, ref);
      expected += habit.frequency.times;
      completed += Math.min(done, habit.frequency.times);
    }
  } else {
    for (let offset = 0; offset < days; offset += 1) {
      const date = new Date(today);
      date.setDate(date.getDate() - offset);
      if (!isHabitScheduledForDate(habit, date)) continue;
      expected += 1;
      const log = getHabitLog(logs, habit.id, getDateKey(date));
      if (log?.completed) completed += 1;
    }
  }

  if (!expected) return 0;
  return Math.round((completed / expected) * 100);
}

export function calculateCurrentStreak(habit: Habit, logs: HabitLog[]) {
  if (habit.frequency.type === "times_per_week") {
    let streak = 0;
    const today = new Date();
    for (let week = 0; week < 52; week += 1) {
      const ref = new Date(today);
      ref.setDate(ref.getDate() - week * 7);
      const count = getWeeklyCompletedCount(habit, logs, ref);
      if (count >= habit.frequency.times) streak += 1;
      else if (week === 0) continue;
      else break;
    }
    return streak;
  }

  let streak = 0;
  const cursor = startOfDay(new Date());
  let checked = 0;

  while (checked < 365) {
    if (isHabitScheduledForDate(habit, cursor)) {
      const log = getHabitLog(logs, habit.id, getDateKey(cursor));
      if (log?.completed) streak += 1;
      else if (getDateKey(cursor) === getDateKey()) {
        // Hoy todavía puede completarse, no rompe la racha.
      } else {
        break;
      }
    }
    cursor.setDate(cursor.getDate() - 1);
    checked += 1;
  }

  return streak;
}

export function calculateBestStreak(habit: Habit, logs: HabitLog[]) {
  if (habit.frequency.type === "times_per_week") {
    let best = 0;
    let current = 0;
    const today = new Date();
    for (let week = 51; week >= 0; week -= 1) {
      const ref = new Date(today);
      ref.setDate(ref.getDate() - week * 7);
      if (getWeeklyCompletedCount(habit, logs, ref) >= habit.frequency.times) {
        current += 1;
        best = Math.max(best, current);
      } else {
        current = 0;
      }
    }
    return best;
  }

  let best = 0;
  let current = 0;
  const start = new Date();
  start.setDate(start.getDate() - 364);

  for (let offset = 0; offset < 365; offset += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + offset);
    if (!isHabitScheduledForDate(habit, date)) continue;
    const log = getHabitLog(logs, habit.id, getDateKey(date));
    if (log?.completed) {
      current += 1;
      best = Math.max(best, current);
    } else {
      current = 0;
    }
  }
  return best;
}

export function getLastDays(days = 14) {
  const result: Date[] = [];
  const today = startOfDay(new Date());
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(today);
    date.setDate(date.getDate() - offset);
    result.push(date);
  }
  return result;
}

function getWeekBounds(refDate: Date) {
  const date = startOfDay(refDate);
  const mondayOffset = (date.getDay() + 6) % 7;
  const start = new Date(date);
  start.setDate(start.getDate() - mondayOffset);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}
