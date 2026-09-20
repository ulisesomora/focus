import { ChevronRight, Clock3, Play } from "lucide-react";
import { Link } from "react-router-dom";

import type { Routine } from "../../types/routine";

type RoutinePreviewProps = { routines: Routine[] };

export function RoutinePreview({ routines }: RoutinePreviewProps) {
  if (routines.length === 0) return null;

  return (
    <section className="mt-7">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">Rutinas</h2>
        <Link to="/routines" className="flex items-center text-sm font-medium text-gray-500">Ver todas<ChevronRight size={16}/></Link>
      </div>

      <div className="grid gap-3">
        {routines.map((routine) => (
          <article key={routine.id} className="rounded-2xl border border-gray-200 bg-white p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-xl">{routine.icon ?? "✨"}</div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-900">{routine.title}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-gray-500"><Clock3 size={13}/>{routine.recommendedTime ?? "Sin hora"} · {routine.steps.length} pasos</p>
              </div>
              <Link to={`/routines/${routine.id}/run`} className="flex h-9 items-center gap-1 rounded-xl bg-gray-900 px-3 text-xs font-semibold text-white"><Play size={14}/>Iniciar</Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
