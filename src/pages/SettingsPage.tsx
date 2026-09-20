import { useEffect, useState, type ReactNode } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Cloud,
  CloudOff,
  Clock3,
  RotateCcw,
  Settings2,
  TimerReset,
  Workflow,
  LogOut,
  UserCircle2,
  Trash2,
  Download,
  Smartphone,
} from "lucide-react";

import { MobileLayout } from "../components/layout/MobileLayout";
import { useApp } from "../context/AppContext";
import {
  canInstallPWA,
  installPWA,
  isStandaloneMode,
} from "../lib/pwa";

export function SettingsPage() {
  const {
    settings,
    updateSettings,
    resetSettings,
    syncStatus,
    firebaseConfigured,
    account,
    accountLoading,
    signOutAccount,
    clearDemoData,
  } = useApp();

  const [installAvailable, setInstallAvailable] = useState(() => canInstallPWA());
  const [installed, setInstalled] = useState(() => isStandaloneMode());

  useEffect(() => {
    const refreshInstall = () => {
      setInstallAvailable(canInstallPWA());
      setInstalled(isStandaloneMode());
    };
    window.addEventListener("focus-pwa-install-available", refreshInstall);
    window.addEventListener("focus-pwa-installed", refreshInstall);
    return () => {
      window.removeEventListener("focus-pwa-install-available", refreshInstall);
      window.removeEventListener("focus-pwa-installed", refreshInstall);
    };
  }, []);


  async function handleInstallApp() {
    const accepted = await installPWA();
    setInstallAvailable(canInstallPWA());
    setInstalled(isStandaloneMode() || accepted);
  }


  return (
    <MobileLayout>
      <header className="mb-6 lg:mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400">
          Preferencias
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 lg:text-3xl">
          Configuración
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
          Ajusta cómo quieres planificar y trabajar. Las preferencias
          ya pueden sincronizarse con Firebase cuando la configuración del proyecto está disponible.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2 xl:max-w-[940px]">
        <SettingsCard
          icon={<UserCircle2 size={19} />}
          title="Cuenta"
          description="Tu sesión protege y sincroniza este espacio."
        >
          {account && (
            <div>
              <div className="flex items-center gap-3">
                {account.photoURL ? (
                  <img
                    src={account.photoURL}
                    alt=""
                    className="h-11 w-11 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white">
                    {(account.displayName || account.email || "U").slice(0, 1).toUpperCase()}
                  </div>
                )}

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-900">
                    {account.displayName || "Cuenta de Focus"}
                  </p>
                  <p className="truncate text-xs text-gray-500">{account.email}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                  Cuenta sincronizada
                </span>
                <button
                  type="button"
                  onClick={() => void signOutAccount()}
                  disabled={accountLoading}
                  className="inline-flex h-9 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                >
                  <LogOut size={14} />
                  Cerrar sesión
                </button>
              </div>
            </div>
          )}
        </SettingsCard>
        <SettingsCard icon={<CalendarDays size={19} />} title="Calendario" description="Cómo se organiza tu semana.">
          <SettingRow label="Inicio de semana">
            <Segmented
              value={settings.weekStart}
              options={[
                { value: "monday", label: "Lunes" },
                { value: "sunday", label: "Domingo" },
              ]}
              onChange={(value) => updateSettings({ weekStart: value as "monday" | "sunday" })}
            />
          </SettingRow>

          <SettingRow label="Formato de hora">
            <Segmented
              value={settings.timeFormat}
              options={[
                { value: "12h", label: "12 h" },
                { value: "24h", label: "24 h" },
              ]}
              onChange={(value) => updateSettings({ timeFormat: value as "12h" | "24h" })}
            />
          </SettingRow>
        </SettingsCard>

        <SettingsCard icon={<Clock3 size={19} />} title="Horario personal" description="Tu ventana habitual para planificar actividades.">
          <div className="grid grid-cols-2 gap-3">
            <TimeField
              label="Empieza"
              value={settings.workdayStart}
              onChange={(value) => updateSettings({ workdayStart: value })}
            />
            <TimeField
              label="Termina"
              value={settings.workdayEnd}
              onChange={(value) => updateSettings({ workdayEnd: value })}
            />
          </div>
          <p className="mt-3 text-xs leading-5 text-gray-400">
            Más adelante el planificador utilizará este horario para sugerir espacios disponibles.
          </p>
        </SettingsCard>

        <SettingsCard icon={<TimerReset size={19} />} title="Planificación" description="Valores predeterminados al agendar tareas.">
          <SettingRow label="Duración predeterminada">
            <select
              value={settings.defaultPlanningMinutes}
              onChange={(event) => updateSettings({ defaultPlanningMinutes: Number(event.target.value) })}
              className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 outline-none focus:border-gray-400"
            >
              <option value={15}>15 min</option>
              <option value={30}>30 min</option>
              <option value={45}>45 min</option>
              <option value={60}>1 hora</option>
              <option value={90}>1 h 30</option>
              <option value={120}>2 horas</option>
            </select>
          </SettingRow>
        </SettingsCard>

        <SettingsCard icon={<Workflow size={19} />} title="Flujo de tareas" description="Controla cuánto trabajo mantienes abierto al mismo tiempo.">
          <SettingRow label="Máximo en proceso">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => updateSettings({ wipLimit: Math.max(1, settings.wipLimit - 1) })}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-lg font-semibold text-gray-600"
              >−</button>
              <span className="min-w-8 text-center text-sm font-bold text-gray-900">{settings.wipLimit}</span>
              <button
                type="button"
                onClick={() => updateSettings({ wipLimit: Math.min(10, settings.wipLimit + 1) })}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-lg font-semibold text-gray-600"
              >+</button>
            </div>
          </SettingRow>

          <ToggleRow
            label="Una sola tarea activa"
            description="Puedes tener varias en proceso, pero solo una aparece como Ahora."
            checked={settings.singleActiveTask}
            onChange={(checked) => updateSettings({ singleActiveTask: checked })}
          />
          <ToggleRow
            label="Mostrar finalizadas"
            description="Mantiene las tareas completadas visibles en las vistas de tareas."
            checked={settings.showCompletedTasks}
            onChange={(checked) => updateSettings({ showCompletedTasks: checked })}
          />
        </SettingsCard>


        <SettingsCard
          icon={<Smartphone size={19} />}
          title="Aplicación instalada"
          description="Instala Focus para abrirla como una app desde tu teléfono o computadora."
        >
          <div className="flex flex-wrap items-center gap-2">
            {installed ? (
              <span className="inline-flex h-9 items-center gap-2 rounded-xl bg-green-50 px-3 text-xs font-semibold text-green-700">
                <CheckCircle2 size={15} /> Instalada
              </span>
            ) : installAvailable ? (
              <button
                type="button"
                onClick={() => void handleInstallApp()}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-gray-900 px-4 text-sm font-semibold text-white"
              >
                <Download size={16} /> Instalar aplicación
              </button>
            ) : (
              <p className="max-w-sm text-xs leading-5 text-gray-500">
                Si no aparece el botón de instalación, abre el menú del navegador y busca “Instalar aplicación” o “Agregar a pantalla de inicio”.
              </p>
            )}
          </div>

        </SettingsCard>

        <SettingsCard
          icon={syncStatus === "synced" ? <CheckCircle2 size={19} /> : firebaseConfigured ? <Cloud size={19} /> : <CloudOff size={19} />}
          title="Datos y sincronización"
          description="Estado de la persistencia y sincronización de la aplicación."
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-800">
                {getSyncLabel(syncStatus)}
              </p>
              <p className="mt-1 max-w-sm text-xs leading-5 text-gray-400">
                {firebaseConfigured
                  ? "Tus tareas, hábitos, rutinas, metas, proyectos, actividad y preferencias se sincronizan con Firestore."
                  : "Agrega las variables VITE_FIREBASE_* para activar Firestore. Mientras tanto la app funciona en memoria."}
              </p>
            </div>
            <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${getSyncDotClass(syncStatus)}`} />
          </div>
        </SettingsCard>

        <SettingsCard icon={<Settings2 size={19} />} title="Preferencias" description="Acciones generales de esta versión de prueba.">
          <button
            type="button"
            onClick={resetSettings}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
          >
            <RotateCcw size={16} />
            Restablecer configuración
          </button>
          <p className="mt-3 text-xs leading-5 text-gray-400">
            Si Firebase está activo, esta configuración se guarda automáticamente para el usuario actual.
          </p>

          {firebaseConfigured && (
            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs font-semibold text-gray-700">Datos de demostración antiguos</p>
              <p className="mt-1 text-xs leading-5 text-gray-400">
                Si probaste una versión anterior, puedes borrar únicamente los registros demo conocidos. Tus datos creados con IDs nuevos no se tocan.
              </p>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("¿Eliminar los datos de demostración antiguos de esta cuenta?")) {
                    void clearDemoData();
                  }
                }}
                className="mt-3 inline-flex h-9 items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3 text-xs font-semibold text-red-700 hover:bg-red-100"
              >
                <Trash2 size={14} /> Limpiar datos demo
              </button>
            </div>
          )}
        </SettingsCard>
      </div>
    </MobileLayout>
  );
}

type SettingsCardProps = {
  icon: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
};

function SettingsCard({ icon, title, description, children }: SettingsCardProps) {
  return (
    <section className="self-start rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
          {icon}
        </div>
        <div>
          <h2 className="font-bold text-gray-900">{title}</h2>
          <p className="mt-0.5 text-xs leading-5 text-gray-500">{description}</p>
        </div>
      </div>
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

function SettingRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      {children}
    </div>
  );
}

function Segmented({ value, options, onChange }: { value: string; options: { value: string; label: string }[]; onChange: (value: string) => void }) {
  return (
    <div className="inline-flex w-fit rounded-xl bg-gray-100 p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`h-8 rounded-lg px-3 text-xs font-semibold transition ${
            value === option.value ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function TimeField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-gray-500">{label}</span>
      <input
        type="time"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1.5 h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none focus:border-gray-400"
      />
    </label>
  );
}

function ToggleRow({ label, description, checked, onChange }: { label: string; description?: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-700">{label}</p>
        {description && <p className="mt-0.5 text-xs leading-5 text-gray-400">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${checked ? "bg-gray-900" : "bg-gray-200"}`}
      >
        <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${checked ? "left-6" : "left-1"}`} />
      </button>
    </div>
  );
}

function getSyncLabel(status: "local" | "connecting" | "synced" | "error") {
  if (status === "synced") return "Sincronizado";
  if (status === "connecting") return "Conectando con Firebase";
  if (status === "error") return "Error de sincronización";
  return "Modo local";
}

function getSyncDotClass(status: "local" | "connecting" | "synced" | "error") {
  if (status === "synced") return "bg-emerald-500";
  if (status === "connecting") return "bg-amber-400";
  if (status === "error") return "bg-red-500";
  return "bg-gray-300";
}
