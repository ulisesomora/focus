import { useState } from "react";
import { ArrowLeft, Clock3, Edit3, Flame, Play, Timer } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { MobileLayout } from "../components/layout/MobileLayout";
import { RoutineEditorSheet, type RoutineDraft } from "../components/routines/RoutineEditorSheet";
import { useApp } from "../context/AppContext";

const dayNames: Record<number, string> = { 1: "Lun", 2: "Mar", 3: "Mié", 4: "Jue", 5: "Vie", 6: "Sáb", 0: "Dom" };

export function RoutineDetailPage() {
  const { routineId } = useParams();
  const { routines, habits, updateRoutine } = useApp();
  const [editing, setEditing] = useState(false);
  const routine = routines.find((item) => item.id === routineId);

  if (!routine) return <MobileLayout><p className="text-sm text-gray-500">Rutina no encontrada.</p></MobileLayout>;

  const currentRoutineId = routine.id;

  function handleSave(value: RoutineDraft) {
    updateRoutine(currentRoutineId, value);
  }

  return (
    <MobileLayout>
      <header className="mb-6 flex items-start gap-3">
        <Link to="/routines" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-gray-600 shadow-sm"><ArrowLeft size={19} /></Link>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-gray-500">Rutina</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">{routine.icon} {routine.title}</h1>
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
            <span>{routine.days.map((day) => dayNames[day]).join(" · ")}</span>
            {routine.recommendedTime && <span>· {routine.recommendedTime}</span>}
          </div>
        </div>
        <button type="button" onClick={() => setEditing(true)} className="flex h-10 items-center gap-2 rounded-xl bg-white px-3 text-sm font-semibold text-gray-600 shadow-sm"><Edit3 size={16} /> <span className="hidden sm:inline">Editar</span></button>
      </header>

      <div className="lg:grid lg:grid-cols-[minmax(0,680px)_260px] lg:gap-8">
        <section className="rounded-3xl border border-gray-200 bg-white p-5 lg:p-6">
          <div className="flex items-center justify-between">
            <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-gray-400">Pasos</p><p className="mt-1 text-sm text-gray-500">{routine.steps.length} en total</p></div>
            <Link to={`/routines/${routine.id}/run`} className="flex h-10 items-center gap-2 rounded-xl bg-gray-900 px-4 text-sm font-semibold text-white"><Play size={16}/>Iniciar</Link>
          </div>

          <div className="mt-5 space-y-2">
            {routine.steps.map((step, index) => (
              <div key={step.id} className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50/60 p-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-bold text-gray-500">{index + 1}</div>
                <div className="min-w-0 flex-1"><p className="font-semibold text-gray-900">{step.title}</p><p className="mt-0.5 flex items-center gap-1 text-xs text-gray-400">{step.type === "habit" ? <><Flame size={13}/> Hábito</> : step.type === "timer" ? <><Timer size={13}/> {step.durationMinutes} minutos</> : "Acción simple"}</p></div>
              </div>
            ))}
          </div>
        </section>

        <aside className="mt-5 lg:mt-0">
          <div className="rounded-3xl border border-gray-200 bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-gray-400">Resumen</p>
            <div className="mt-4 space-y-4 text-sm">
              <div><p className="text-gray-400">Hora recomendada</p><p className="mt-1 flex items-center gap-2 font-semibold text-gray-900"><Clock3 size={16}/>{routine.recommendedTime ?? "Sin hora"}</p></div>
              <div><p className="text-gray-400">Frecuencia</p><p className="mt-1 font-semibold text-gray-900">{routine.days.length === 7 ? "Todos los días" : `${routine.days.length} días por semana`}</p></div>
            </div>
          </div>
        </aside>
      </div>

      <RoutineEditorSheet open={editing} onClose={() => setEditing(false)} onSave={handleSave} habits={habits} initialValue={routine} />
    </MobileLayout>
  );
}
