import { HabitSection } from "../components/habits/HabitList";
import { MobileLayout } from "../components/layout/MobileLayout";
export function HabitsPage() {
  return <MobileLayout><div className="mx-auto max-w-2xl"><h1 className="text-xl font-bold">Hábitos</h1><HabitSection allSpaces /></div></MobileLayout>;
}
