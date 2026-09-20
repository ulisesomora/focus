import { ArrowRight, Flame, Inbox, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

type FirstRunCardProps = {
  onCapture: () => void;
  onComplete: () => void;
};

export function FirstRunCard({ onCapture, onComplete }: FirstRunCardProps) {
  return (
    <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6 lg:max-w-3xl">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gray-900 text-white">
          <Sparkles size={22} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-gray-400">Primeros pasos</p>
          <h2 className="mt-1 text-xl font-bold text-gray-900">Construye tu espacio a tu manera</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">
            Ya no hay información de ejemplo. Empieza capturando algo que quieras recordar y agrega hábitos solo cuando realmente los necesites.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <button
          type="button"
          onClick={onCapture}
          className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-left transition hover:border-gray-300 hover:bg-white"
        >
          <Inbox size={18} className="text-gray-700" />
          <p className="mt-3 text-sm font-bold text-gray-900">Captura algo</p>
          <p className="mt-1 text-xs leading-5 text-gray-500">Anota una idea o pendiente sin tener que organizarlo todavía.</p>
        </button>

        <Link
          to="/habits"
          className="rounded-2xl border border-gray-200 bg-gray-50 p-4 transition hover:border-gray-300 hover:bg-white"
        >
          <Flame size={18} className="text-gray-700" />
          <p className="mt-3 text-sm font-bold text-gray-900">Crea un hábito</p>
          <p className="mt-1 text-xs leading-5 text-gray-500">Empieza una rutina de constancia con una meta sencilla.</p>
        </Link>

        <Link
          to="/projects"
          className="rounded-2xl border border-gray-200 bg-gray-50 p-4 transition hover:border-gray-300 hover:bg-white"
        >
          <ArrowRight size={18} className="text-gray-700" />
          <p className="mt-3 text-sm font-bold text-gray-900">Organiza un proyecto</p>
          <p className="mt-1 text-xs leading-5 text-gray-500">Agrupa después tus tareas y metas por contexto.</p>
        </Link>
      </div>

      <button
        type="button"
        onClick={onComplete}
        className="mt-5 inline-flex h-10 items-center rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-600 hover:bg-gray-50"
      >
        Entendido, empezar
      </button>
    </section>
  );
}
