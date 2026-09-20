import { useMemo, useState, type ReactNode } from "react";
import {
  CheckCircle2,
  CirclePause,
  ClipboardList,
  Clock3,
  Flame,
  FolderKanban,
  Play,
  RotateCcw,
  Target,
} from "lucide-react";
import { Link } from "react-router-dom";

import { MobileLayout } from "../components/layout/MobileLayout";
import { useApp } from "../context/AppContext";
import type { Activity, ActivityEntityType } from "../types/activity";

type RangeFilter = "today" | "week" | "all";
type TypeFilter = "all" | ActivityEntityType;

export function ActivityPage() {
  const { activities } = useApp();
  const [range, setRange] = useState<RangeFilter>("today");
  const [type, setType] = useState<TypeFilter>("all");

  const filtered = useMemo(() => {
    const now = new Date();
    const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    return [...activities]
      .filter((activity) => {
        if (range === "today" && activity.createdAt < startToday) return false;
        if (range === "week" && activity.createdAt < weekAgo) return false;
        if (type !== "all" && activity.entityType !== type) return false;
        return true;
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [activities, range, type]);

  const groups = useMemo(() => groupByDate(filtered), [filtered]);

  return (
    <MobileLayout>
      <header className="mb-6 lg:flex lg:items-end lg:justify-between lg:gap-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400">Bitácora</p>
          <h1 className="mt-2 text-2xl font-bold text-gray-900 lg:text-3xl">Actividad</h1>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Revisa qué hiciste, qué cambió y por qué una tarea quedó detenida.
          </p>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 lg:mt-0">
          <FilterButton active={range === "today"} onClick={() => setRange("today")}>Hoy</FilterButton>
          <FilterButton active={range === "week"} onClick={() => setRange("week")}>7 días</FilterButton>
          <FilterButton active={range === "all"} onClick={() => setRange("all")}>Todo</FilterButton>
        </div>
      </header>

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {([
          ["all", "Todo"],
          ["task", "Tareas"],
          ["habit", "Hábitos"],
          ["goal", "Metas"],
          ["project", "Proyectos"],
          ["routine", "Rutinas"],
          ["capture", "Capturas"],
        ] as const).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setType(value)}
            className={`shrink-0 rounded-xl px-3 py-2 text-xs font-semibold transition ${
              type === value ? "bg-gray-900 text-white" : "border border-gray-200 bg-white text-gray-500"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-8 text-center">
          <Clock3 className="mx-auto text-gray-300" size={28} />
          <p className="mt-3 font-semibold text-gray-800">No hay actividad para este filtro.</p>
          <p className="mt-1 text-sm text-gray-500">Las acciones que hagas en la app aparecerán aquí.</p>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px]">
          <div className="space-y-6">
            {groups.map((group) => (
              <section key={group.key}>
                <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-gray-400">{group.label}</h2>
                <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white">
                  {group.items.map((activity, index) => (
                    <ActivityRow key={activity.id} activity={activity} border={index !== group.items.length - 1} />
                  ))}
                </div>
              </section>
            ))}
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-8 rounded-3xl border border-gray-200 bg-white p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Resumen</p>
              <div className="mt-4 space-y-3 text-sm">
                <SummaryRow label="Eventos" value={String(filtered.length)} />
                <SummaryRow label="Tareas" value={String(filtered.filter((item) => item.entityType === "task").length)} />
                <SummaryRow label="Hábitos" value={String(filtered.filter((item) => item.entityType === "habit").length)} />
                <SummaryRow label="Metas" value={String(filtered.filter((item) => item.entityType === "goal").length)} />
              </div>
            </div>
          </aside>
        </div>
      )}
    </MobileLayout>
  );
}

function ActivityRow({ activity, border }: { activity: Activity; border: boolean }) {
  const href = entityHref(activity);
  const content = (
    <div className={`flex gap-3 px-4 py-4 ${border ? "border-b border-gray-100" : ""}`}>
      <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconClass(activity)}`}>
        {activityIcon(activity)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900">{activity.message}</p>
            <p className="mt-0.5 truncate text-sm text-gray-600">{activity.title}</p>
          </div>
          <time className="shrink-0 text-xs text-gray-400">{formatTime(activity.createdAt)}</time>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-400">
          <span>{entityLabel(activity.entityType)}</span>
          {activity.project && <span>· {activity.project}</span>}
        </div>
        {activity.note && (
          <div className="mt-3 rounded-xl bg-orange-50 px-3 py-2 text-xs leading-5 text-orange-800">
            {activity.note}
          </div>
        )}
      </div>
    </div>
  );

  return href ? <Link to={href} className="block hover:bg-gray-50/60">{content}</Link> : content;
}

function FilterButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} className={`rounded-xl px-3 py-2 text-sm font-semibold ${active ? "bg-gray-900 text-white" : "border border-gray-200 bg-white text-gray-600"}`}>
      {children}
    </button>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between gap-3"><span className="text-gray-500">{label}</span><span className="font-semibold text-gray-900">{value}</span></div>;
}

function groupByDate(activities: Activity[]) {
  const groups = new Map<string, Activity[]>();
  activities.forEach((activity) => {
    const key = dateKey(activity.createdAt);
    const current = groups.get(key) ?? [];
    current.push(activity);
    groups.set(key, current);
  });
  return [...groups.entries()].map(([key, items]) => ({ key, label: dateLabel(items[0].createdAt), items }));
}

function dateKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function dateLabel(date: Date) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const value = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diff = Math.round((today.getTime() - value.getTime()) / 86_400_000);
  if (diff === 0) return "Hoy";
  if (diff === 1) return "Ayer";
  return new Intl.DateTimeFormat("es-MX", { weekday: "long", day: "numeric", month: "short" }).format(date);
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("es-MX", { hour: "numeric", minute: "2-digit" }).format(date);
}

function entityHref(activity: Activity) {
  if (activity.entityType === "task") return `/tasks/${activity.entityId}`;
  if (activity.entityType === "habit") return `/habits/${activity.entityId}`;
  if (activity.entityType === "goal") return `/goals/${activity.entityId}`;
  if (activity.entityType === "project") return `/projects/${activity.entityId}`;
  if (activity.entityType === "routine") return `/routines/${activity.entityId}`;
  return undefined;
}

function entityLabel(type: ActivityEntityType) {
  return type === "task" ? "Tarea" : type === "habit" ? "Hábito" : type === "goal" ? "Meta" : type === "project" ? "Proyecto" : type === "routine" ? "Rutina" : "Captura";
}

function activityIcon(activity: Activity) {
  if (activity.kind === "completed") return <CheckCircle2 size={17} />;
  if (activity.kind === "paused") return <CirclePause size={17} />;
  if (activity.kind === "started") return <Play size={17} />;
  if (activity.kind === "resumed") return <RotateCcw size={17} />;
  if (activity.entityType === "habit") return <Flame size={17} />;
  if (activity.entityType === "goal") return <Target size={17} />;
  if (activity.entityType === "project") return <FolderKanban size={17} />;
  return <ClipboardList size={17} />;
}

function iconClass(activity: Activity) {
  if (activity.kind === "completed") return "bg-green-50 text-green-700";
  if (activity.kind === "paused") return "bg-orange-50 text-orange-700";
  if (activity.kind === "review") return "bg-purple-50 text-purple-700";
  if (activity.kind === "started" || activity.kind === "resumed") return "bg-blue-50 text-blue-700";
  return "bg-gray-100 text-gray-600";
}
