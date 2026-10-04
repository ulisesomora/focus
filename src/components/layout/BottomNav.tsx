import { useEffect, useState } from "react";

import {
  CalendarDays,
  Home,
  Sun,
  Menu,
  Plus,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

import { QuickCapture } from "../capture/QuickCapture";

const navItems = [
  { label: "Tareas", to: "/", icon: Home },
  { label: "Hoy", to: "/today", icon: Sun },
  { label: "Agenda", to: "/agenda", icon: CalendarDays },
  { label: "Más", to: "/more", icon: Menu },
];

export function BottomNav() {
  const [captureOpen, setCaptureOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const openCapture = () => {
      if (!window.matchMedia("(min-width: 1024px)").matches) setCaptureOpen(true);
    };
    window.addEventListener("focus-open-capture", openCapture);
    return () => window.removeEventListener("focus-open-capture", openCapture);
  }, []);

  return (
    <>
      {!captureOpen && (
        <nav className="app-bottom-nav fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white">
          <div
            className="mx-auto flex h-[72px] w-full max-w-md items-center justify-around px-2"
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          >
            <NavItem item={navItems[0]} />
            <NavItem item={navItems[1]} />

            <button
              type="button"
              aria-label={["/", "/today"].includes(location.pathname) ? "Nueva tarea" : "Capturar"}
              onClick={() => ["/", "/today"].includes(location.pathname) ? window.dispatchEvent(new Event("focus-open-task")) : setCaptureOpen(true)}
              className="-mt-7 flex h-14 w-14 items-center justify-center rounded-full bg-gray-900 text-white shadow-lg transition active:scale-95"
            >
              <Plus size={28} />
            </button>

            <NavItem item={navItems[2]} />
            <NavItem item={navItems[3]} />
          </div>
        </nav>
      )}

      <QuickCapture
        open={captureOpen}
        onClose={() => setCaptureOpen(false)}
      />
    </>
  );
}

type NavItemProps = {
  item: (typeof navItems)[number];
};

function NavItem({ item }: NavItemProps) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.to}
      end={item.to === "/"}
      className={({ isActive }) =>
        `flex min-w-14 flex-col items-center justify-center gap-1 text-xs transition ${
          isActive
            ? "font-semibold text-gray-900"
            : "text-gray-400"
        }`
      }
    >
      <Icon size={22} />
      <span>{item.label}</span>
    </NavLink>
  );
}
