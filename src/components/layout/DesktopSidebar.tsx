import { useEffect, useState } from "react";
import {
  CalendarDays,
  CheckSquare2,
  Columns3,
  Flame,
  Repeat2,
  Target,
  BarChart3,
  RefreshCw,
  FolderKanban,
  History,
  Home,
  Inbox,
  ListTodo,
  Plus,
  Settings,
} from "lucide-react";
import { NavLink } from "react-router-dom";

import { QuickCapture } from "../capture/QuickCapture";
import { useApp } from "../../context/AppContext";

const items = [
  { label: "Hoy", to: "/", icon: Home },
  { label: "Inbox", to: "/inbox", icon: Inbox },
  { label: "Backlog", to: "/backlog", icon: ListTodo },
  { label: "Tareas", to: "/tasks", icon: CheckSquare2 },
  { label: "Agenda", to: "/agenda", icon: CalendarDays },
  { label: "Hábitos", to: "/habits", icon: Flame },
  { label: "Rutinas", to: "/routines", icon: Repeat2 },
  { label: "Metas", to: "/goals", icon: Target },
  { label: "Proyectos", to: "/projects", icon: FolderKanban },
  { label: "Actividad", to: "/activity", icon: History },
  { label: "Estadísticas", to: "/stats", icon: BarChart3 },
  { label: "Revisión semanal", to: "/weekly-review", icon: RefreshCw },
  { label: "Configuración", to: "/settings", icon: Settings },
];

export function DesktopSidebar() {
  const [captureOpen, setCaptureOpen] = useState(false);

  useEffect(() => {
    const openCapture = () => {
      if (window.matchMedia("(min-width: 1024px)").matches) setCaptureOpen(true);
    };
    window.addEventListener("focus-open-capture", openCapture);
    return () => window.removeEventListener("focus-open-capture", openCapture);
  }, []);
  const { account, firebaseConfigured } = useApp();

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-gray-200 bg-white lg:flex lg:flex-col">
        <div className="px-6 pb-5 pt-7">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">Mi espacio</p>
          <h2 className="mt-2 text-xl font-bold text-gray-900">Focus</h2>
        </div>

        <div className="px-4">
          <button
            type="button"
            onClick={() => setCaptureOpen(true)}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gray-900 text-sm font-semibold text-white"
          >
            <Plus size={18} />
            Capturar
          </button>
        </div>

        <nav className="mt-6 flex-1 space-y-1 px-3">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  }`
                }
              >
                <Icon size={19} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-gray-100 p-4">
          <NavLink
            to="/settings"
            className="mb-2 flex items-center gap-3 rounded-xl bg-gray-50 px-3 py-2.5"
          >
            {account?.photoURL && !account.isAnonymous ? (
              <img src={account.photoURL} alt="" className="h-8 w-8 rounded-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-xs font-bold text-gray-600 ring-1 ring-gray-200">
                {account && !account.isAnonymous
                  ? (account.displayName || account.email || "U").slice(0, 1).toUpperCase()
                  : "I"}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-gray-800">
                {!firebaseConfigured
                  ? "Modo local"
                  : account && !account.isAnonymous
                    ? account.displayName || "Cuenta Focus"
                    : "Sin sesión"}
              </p>
              <p className="truncate text-[11px] text-gray-400">
                {account && !account.isAnonymous ? account.email : "Configurar cuenta"}
              </p>
            </div>
          </NavLink>

          <NavLink
            to="/more"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900"
          >
            <Columns3 size={19} />
            Más opciones
          </NavLink>
        </div>
      </aside>

      <QuickCapture open={captureOpen} onClose={() => setCaptureOpen(false)} />
    </>
  );
}
