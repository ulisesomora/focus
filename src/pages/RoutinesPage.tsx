import { useMemo, useState } from "react";
import { ChevronRight, Clock3, Plus, Play, Repeat2 } from "lucide-react";
import { Link } from "react-router-dom";

import { MobileLayout } from "../components/layout/MobileLayout";
import { RoutineEditorSheet, type RoutineDraft } from "../components/routines/RoutineEditorSheet";
import { useApp } from "../context/AppContext";
import type { Routine } from "../types/routine";

const dayLabels: Record<number, string> = { 1: "L", 2: "M", 3: "X", 4: "J", 5: "V", 6: "S", 0: "D" };

export function RoutinesPage() {
  const { routines, habits, addRoutine } = useApp();
  const [editorOpen, setEditorOpen] = useState(false);

  const today = new Date().getDay();
  const todayRoutines = useMemo(() => routines.filter((routine) => routine.days.includes(today)), [routines, today]);

  function handleCreate(value: RoutineDraft) {
    addRoutine(value);
  }

  return (
    <MobileLayout>
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500">Secuencias que te ayudan</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900 lg:text-3xl">Rutinas</h1>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Agrupa hábitos, acciones y temporizadores para no decidir cada paso cada vez.
          </p>
        </div>
        <button type="button" onClick={() => setEditorOpen(true)} className="flex h-11 shrink-0 items-center gap-2 rounded-xl bg-gray-900 px-4 text-sm font-semibold text-white">
          <Plus size={18} /><span className="hidden sm:inline">Nueva rutina</span>
        </button>
      </header>

      {todayRoutines.length > 0 && (
        <section className="mb-7">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-gray-400">Para hoy</p>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[repeat(auto-fit,minmax(280px,340px))]">
            {todayRoutines.map((routine) => <RoutineCard key={routine.id} routine={routine} featured />)}
          </div>
        </section>
      )}

      <section>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-gray-400">Todas las rutinas</p>
          <span className="text-sm font-semibold text-gray-500">{routines.length}</span>
        </div>
        {routines.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-7 text-center lg:max-w-xl">
            <Repeat2 className="mx-auto text-gray-300" size={32} />
            <p className="mt-4 font-bold text-gray-900">Todavía no tienes rutinas</p>
            <p className="mt-2 text-sm leading-6 text-gray-500">Combina acciones, hábitos y temporizadores cuando quieras repetir una secuencia.</p>
            <button type="button" onClick={() => setEditorOpen(true)} className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-gray-900 px-4 text-sm font-semibold text-white"><Plus size={16} /> Crear primera rutina</button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[repeat(auto-fit,minmax(280px,340px))]">
            {routines.map((routine) => <RoutineCard key={routine.id} routine={routine} />)}
          </div>
        )}
      </section>

      <RoutineEditorSheet open={editorOpen} onClose={() => setEditorOpen(false)} onSave={handleCreate} habits={habits} />
    </MobileLayout>
  );
}

function RoutineCard({ routine, featured = false }: { routine: Routine; featured?: boolean }) {
  const totalMinutes = routine.steps.reduce((total, step) => total + (step.durationMinutes ?? 0), 0);
  return (
    <article className={`rounded-3xl border bg-white p-5 shadow-sm ${featured ? "border-gray-300" : "border-gray-200"}`}>
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gray-50 text-2xl">{routine.icon ?? "✨"}</div>
        <div className="min-w-0 flex-1">
          <h2 className="font-bold text-gray-900">{routine.title}</h2>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
            {routine.recommendedTime && <span className="flex items-center gap-1"><Clock3 size={13} />{routine.recommendedTime}</span>}
            <span>{routine.steps.length} pasos</span>
            {totalMinutes > 0 && <span>~{totalMinutes} min</span>}
          </div>
        </div>
      </div>

      <div className="mt-4 flex gap-1.5">
        {[1,2,3,4,5,6,0].map((day) => (
          <span key={day} className={`flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-bold ${routine.days.includes(day) ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-300"}`}>{dayLabels[day]}</span>
        ))}
      </div>

      <div className="mt-5 flex items-center gap-2">
        <Link to={`/routines/${routine.id}/run`} className="flex h-10 items-center gap-2 rounded-xl bg-gray-900 px-4 text-sm font-semibold text-white">
          <Play size={16} /> Iniciar
        </Link>
        <Link to={`/routines/${routine.id}`} className="ml-auto flex h-10 items-center gap-1 rounded-xl px-2 text-sm font-semibold text-gray-500 hover:bg-gray-50">
          Ver <ChevronRight size={16} />
        </Link>
      </div>
    </article>
  );
}
