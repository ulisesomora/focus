import {
  ChevronRight,
  Columns3,
  ListTodo,
  Flame,
  Repeat2,
  Target,
  BarChart3,
  RefreshCw,
  FolderKanban,
  History,
  Settings,
} from "lucide-react";
import { Link } from "react-router-dom";

import { MobileLayout } from "../components/layout/MobileLayout";

export function MorePage() {
  return (
    <MobileLayout>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Más</h1>
        <p className="mt-1 text-sm text-gray-500">
          Organiza y administra tu espacio.
        </p>
      </header>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <Link
          to="/tasks"
          className="flex items-center gap-3 border-b border-gray-100 px-4 py-4"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
            <Columns3 size={20} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="font-semibold text-gray-900">Tareas / Tablero</p>
            <p className="mt-0.5 text-xs text-gray-500">
              Pendientes, proceso, pausas, revisión y finalizadas.
            </p>
          </div>

          <ChevronRight size={18} className="text-gray-400" />
        </Link>

        <Link
          to="/backlog"
          className="flex items-center gap-3 px-4 py-4"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
            <ListTodo size={20} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="font-semibold text-gray-900">Backlog</p>
            <p className="mt-0.5 text-xs text-gray-500">
              Tareas que quieres hacer, pero todavía no tienen fecha.
            </p>
          </div>

          <ChevronRight size={18} className="text-gray-400" />
        </Link>

        <Link
          to="/habits"
          className="flex items-center gap-3 border-t border-gray-100 px-4 py-4"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
            <Flame size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-gray-900">Hábitos</p>
            <p className="mt-0.5 text-xs text-gray-500">
              Constancia, cantidades y tiempo.
            </p>
          </div>
          <ChevronRight size={18} className="text-gray-400" />
        </Link>

        <Link
          to="/routines"
          className="flex items-center gap-3 border-t border-gray-100 px-4 py-4"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
            <Repeat2 size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-gray-900">Rutinas</p>
            <p className="mt-0.5 text-xs text-gray-500">
              Secuencias con hábitos, acciones y temporizadores.
            </p>
          </div>
          <ChevronRight size={18} className="text-gray-400" />
        </Link>


        <Link
          to="/goals"
          className="flex items-center gap-3 border-t border-gray-100 px-4 py-4"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
            <Target size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-gray-900">Metas</p>
            <p className="mt-0.5 text-xs text-gray-500">
              Conecta tareas y hábitos con resultados más grandes.
            </p>
          </div>
          <ChevronRight size={18} className="text-gray-400" />
        </Link>

        <Link
          to="/projects"
          className="flex items-center gap-3 border-t border-gray-100 px-4 py-4"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
            <FolderKanban size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-gray-900">Proyectos</p>
            <p className="mt-0.5 text-xs text-gray-500">
              Agrupa tareas, agenda y metas por contexto.
            </p>
          </div>
          <ChevronRight size={18} className="text-gray-400" />
        </Link>


        <Link
          to="/activity"
          className="flex items-center gap-3 border-t border-gray-100 px-4 py-4"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
            <History size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-gray-900">Actividad</p>
            <p className="mt-0.5 text-xs text-gray-500">
              Bitácora de tareas, hábitos, metas y cambios importantes.
            </p>
          </div>
          <ChevronRight size={18} className="text-gray-400" />
        </Link>

        <Link
          to="/stats"
          className="flex items-center gap-3 border-t border-gray-100 px-4 py-4"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
            <BarChart3 size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-gray-900">Estadísticas</p>
            <p className="mt-0.5 text-xs text-gray-500">
              Tareas, tiempo, hábitos y progreso general.
            </p>
          </div>
          <ChevronRight size={18} className="text-gray-400" />
        </Link>

        <Link
          to="/weekly-review"
          className="flex items-center gap-3 border-t border-gray-100 px-4 py-4"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
            <RefreshCw size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-gray-900">Revisión semanal</p>
            <p className="mt-0.5 text-xs text-gray-500">
              Limpia pendientes y prepara la siguiente semana.
            </p>
          </div>
          <ChevronRight size={18} className="text-gray-400" />
        </Link>


        <Link
          to="/settings"
          className="flex items-center gap-3 border-t border-gray-100 px-4 py-4"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
            <Settings size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-gray-900">Configuración</p>
            <p className="mt-0.5 text-xs text-gray-500">
              Horarios, planificación y flujo de tareas.
            </p>
          </div>
          <ChevronRight size={18} className="text-gray-400" />
        </Link>
      </div>
    </MobileLayout>
  );
}
