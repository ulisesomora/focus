import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, ChevronRight, Pause, Play, RotateCcw } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { MobileLayout } from "../components/layout/MobileLayout";
import { useApp } from "../context/AppContext";

export function RoutineRunPage() {
  const { routineId } = useParams();
  const navigate = useNavigate();
  const { routines, habits, toggleHabit, incrementHabit, addActivity } = useApp();
  const routine = routines.find((item) => item.id === routineId);
  const [index, setIndex] = useState(0);
  const [completed, setCompleted] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

  const step = routine?.steps[index];
  const relatedHabit = useMemo(() => step?.habitId ? habits.find((habit) => habit.id === step.habitId) : undefined, [habits, step]);

  useEffect(() => {
    if (!step || step.type !== "timer") {
      setRunning(false);
      setSecondsLeft(0);
      return;
    }
    setSecondsLeft((step.durationMinutes ?? 1) * 60);
    setRunning(false);
  }, [step?.id]);

  useEffect(() => {
    if (!running || secondsLeft <= 0) return;
    const timer = window.setInterval(() => setSecondsLeft((current) => Math.max(0, current - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [running, secondsLeft]);

  useEffect(() => {
    if (running && secondsLeft === 0 && step?.type === "timer") completeCurrentStep();
  }, [secondsLeft, running, step?.type]);

  if (!routine || !step) return <MobileLayout><p className="text-sm text-gray-500">Rutina no encontrada.</p></MobileLayout>;

  function completeCurrentStep() {
    if (!routine || !step) return;

    if (step.type === "habit" && relatedHabit) {
      if (relatedHabit.type === "complete") {
        if (!relatedHabit.completed) toggleHabit(relatedHabit.id);
      } else {
        const missing = Math.max(0, (relatedHabit.target ?? 1) - (relatedHabit.current ?? 0));
        if (missing > 0) incrementHabit(relatedHabit.id, missing);
      }
    }

    setCompleted((current) => current.includes(step.id) ? current : [...current, step.id]);
    setRunning(false);
    if (index < routine.steps.length - 1) setIndex((current) => current + 1);
    else {
      addActivity({
        entityType: "routine",
        entityId: routine.id,
        kind: "completed",
        title: routine.title,
        message: "Completaste la rutina",
      });
      navigate(`/routines/${routine.id}`, { state: { completed: true } });
    }
  }

  const progress = Math.round((completed.length / routine.steps.length) * 100);

  return (
    <MobileLayout>
      <div className="mx-auto max-w-3xl">
        <header className="flex items-center justify-between gap-3">
          <Link to={`/routines/${routine.id}`} className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gray-600 shadow-sm"><ArrowLeft size={19}/></Link>
          <div className="text-center"><p className="text-xs font-bold uppercase tracking-[0.14em] text-gray-400">{routine.icon} {routine.title}</p><p className="mt-1 text-sm font-semibold text-gray-700">Paso {index + 1} de {routine.steps.length}</p></div>
          <div className="w-10" />
        </header>

        <div className="mt-6 h-2 overflow-hidden rounded-full bg-gray-200"><div className="h-full rounded-full bg-gray-900 transition-all" style={{ width: `${Math.max(progress, ((index) / routine.steps.length) * 100)}%` }} /></div>

        <section className="mt-8 rounded-[32px] border border-gray-200 bg-white p-6 text-center shadow-sm sm:p-8 lg:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gray-50 text-3xl">{step.type === "habit" ? relatedHabit?.icon ?? "🔥" : step.type === "timer" ? "⏱️" : "✓"}</div>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.14em] text-gray-400">{step.type === "habit" ? "Hábito" : step.type === "timer" ? "Temporizador" : "Acción"}</p>
          <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">{step.title}</h1>

          {step.type === "habit" && relatedHabit && (
            <p className="mt-3 text-sm text-gray-500">{relatedHabit.type === "complete" ? (relatedHabit.completed ? "Ya está completado hoy" : "Márcalo como parte de esta rutina") : `${relatedHabit.current ?? 0} / ${relatedHabit.target ?? 0} ${relatedHabit.unit ?? ""}`}</p>
          )}

          {step.type === "timer" && (
            <div className="mt-8">
              <p className="font-mono text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">{formatTime(secondsLeft)}</p>
              <div className="mt-6 flex justify-center gap-2">
                <button type="button" onClick={() => setRunning((value) => !value)} className="flex h-11 items-center gap-2 rounded-xl bg-gray-900 px-5 text-sm font-semibold text-white">{running ? <Pause size={17}/> : <Play size={17}/>} {running ? "Pausar" : "Iniciar"}</button>
                <button type="button" onClick={() => { setRunning(false); setSecondsLeft((step.durationMinutes ?? 1) * 60); }} className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500"><RotateCcw size={17}/></button>
              </div>
            </div>
          )}

          {step.type !== "timer" && (
            <button type="button" onClick={completeCurrentStep} className="mx-auto mt-8 flex h-12 items-center gap-2 rounded-2xl bg-gray-900 px-6 text-sm font-semibold text-white"><Check size={18}/> Listo</button>
          )}

          {step.type === "timer" && (
            <button type="button" onClick={completeCurrentStep} className="mx-auto mt-4 flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-gray-500 hover:bg-gray-50">Terminar antes <ChevronRight size={16}/></button>
          )}
        </section>

        <div className="mt-5 flex items-center justify-between text-sm">
          <button type="button" disabled={index === 0} onClick={() => setIndex((current) => Math.max(0, current - 1))} className="rounded-xl px-3 py-2 font-semibold text-gray-500 disabled:opacity-30">← Anterior</button>
          <button type="button" onClick={() => index < routine.steps.length - 1 ? setIndex((current) => current + 1) : navigate(`/routines/${routine.id}`)} className="rounded-xl px-3 py-2 font-semibold text-gray-500">Omitir →</button>
        </div>
      </div>
    </MobileLayout>
  );
}

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
