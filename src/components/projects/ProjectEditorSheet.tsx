import { useEffect, useState } from "react";
import { X } from "lucide-react";

import type { Project, ProjectStatus } from "../../types/project";
import { BottomSheet } from "../ui/BottomSheet";

export type ProjectDraft = Omit<Project, "id" | "createdAt">;

type Props = {
  open: boolean;
  project?: Project;
  onClose: () => void;
  onSave: (project: ProjectDraft) => void;
};

export function ProjectEditorSheet({ open, project, onClose, onSave }: Props) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("📁");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<ProjectStatus>("active");

  useEffect(() => {
    if (!open) return;
    setName(project?.name ?? "");
    setIcon(project?.icon ?? "📁");
    setDescription(project?.description ?? "");
    setStatus(project?.status ?? "active");
  }, [open, project]);

  function handleSave() {
    const cleanName = name.trim();
    if (!cleanName) return;

    onSave({
      name: cleanName,
      icon: icon.trim() || "📁",
      description: description.trim() || undefined,
      status,
    });
    onClose();
  }

  return (
    <BottomSheet open={open} onClose={onClose} ariaLabel={project ? "Editar proyecto" : "Nuevo proyecto"} maxWidthClass="max-w-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{project ? "Editar proyecto" : "Nuevo proyecto"}</h2>
          <p className="mt-1 text-sm text-gray-500">Agrupa tareas, agenda y metas en un mismo contexto.</p>
        </div>
        <button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500">
          <X size={18} />
        </button>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-[84px_1fr]">
        <label className="block text-sm font-semibold text-gray-700">
          Icono
          <input value={icon} onChange={(e) => setIcon(e.target.value)} className="mt-2 h-12 w-full rounded-2xl border border-gray-200 px-3 text-center text-xl outline-none" />
        </label>
        <label className="block text-sm font-semibold text-gray-700">
          Nombre
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. Trabajo" className="mt-2 h-12 w-full rounded-2xl border border-gray-200 px-4 text-sm font-normal outline-none focus:border-gray-400" />
        </label>
      </div>

      <label className="mt-4 block text-sm font-semibold text-gray-700">
        Descripción
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Qué cosas pertenecen a este proyecto..." className="mt-2 min-h-24 w-full resize-none rounded-2xl border border-gray-200 p-4 text-sm font-normal outline-none" />
      </label>

      <div className="mt-4">
        <p className="text-sm font-semibold text-gray-700">Estado</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {(["active", "paused", "completed"] as ProjectStatus[]).map((value) => (
            <button key={value} type="button" onClick={() => setStatus(value)} className={`rounded-xl border px-3 py-2 text-sm font-semibold ${status === value ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 bg-white text-gray-600"}`}>
              {value === "active" ? "Activo" : value === "paused" ? "En pausa" : "Finalizado"}
            </button>
          ))}
        </div>
      </div>

      <button type="button" disabled={!name.trim()} onClick={handleSave} className="mt-6 h-12 w-full rounded-2xl bg-gray-900 px-5 text-sm font-semibold text-white disabled:bg-gray-200 disabled:text-gray-400 sm:ml-auto sm:block sm:w-auto sm:min-w-36">
        {project ? "Guardar cambios" : "Crear proyecto"}
      </button>
    </BottomSheet>
  );
}
