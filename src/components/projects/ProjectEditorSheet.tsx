import { useEffect, useState } from "react";
import { Columns3, X } from "lucide-react";
import type { Project } from "../../types/project";
import { BottomSheet } from "../ui/BottomSheet";
import { useApp } from "../../context/AppContext";
import { areasForSpace } from "../../utils/taskSpaces";
export type ProjectDraft = Omit<Project, "id" | "createdAt">;
export function ProjectEditorSheet({ open, project, onClose, onSave }: { open: boolean; project?: Project; onClose: () => void; onSave: (draft: ProjectDraft) => void }) {
  const { settings } = useApp();
  const [name, setName] = useState(""); const [description, setDescription] = useState("");
  const [spaceId, setSpaceId] = useState(""); const [area, setArea] = useState("");
  useEffect(() => { if (open) { setName(project?.name ?? ""); setDescription(project?.description ?? ""); setSpaceId(project?.spaceId ?? ""); setArea(project?.area ?? ""); } }, [open, project]);
  return <BottomSheet open={open} onClose={onClose} ariaLabel={project ? "Editar proyecto" : "Nuevo proyecto"}>
    <div className="flex items-center gap-2"><Columns3 size={22} /><h2 className="flex-1 text-xl font-bold">{project ? "Editar proyecto" : "Nuevo proyecto"}</h2><button type="button" aria-label="Cerrar" onClick={onClose}><X size={18} /></button></div>
    <form className="mt-4 space-y-4" onSubmit={event => { event.preventDefault(); if (!name.trim()) return; onSave({ ...project, name: name.trim(), description: description.trim() || undefined, status: project?.status ?? "active", spaceId: spaceId || undefined, area: area || undefined }); onClose(); }}>
      <label className="block text-sm font-semibold">Nombre<input required value={name} onChange={event => setName(event.target.value)} className="mt-2 w-full rounded-lg border p-3" /></label>
      <label className="block text-sm font-semibold">Descripción<textarea value={description} onChange={event => setDescription(event.target.value)} className="mt-2 w-full rounded-lg border p-3" /></label>
      {!project && <><label className="block text-sm font-semibold">Lugar<select value={spaceId} onChange={event => { setSpaceId(event.target.value); setArea(""); }} className="mt-2 w-full rounded-lg border bg-white p-3"><option value="">General</option>{settings.spaces?.map(space => <option key={space.id} value={space.id}>{space.name}</option>)}</select></label><label className="block text-sm font-semibold">Área<select value={area} onChange={event => setArea(event.target.value)} className="mt-2 w-full rounded-lg border bg-white p-3"><option value="">Sin área</option>{areasForSpace(settings, spaceId || undefined).map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label></>}
      {project && <p className="text-xs text-gray-500">Para mover el proyecto de espacio, abre su tarea principal.</p>}
      <button className="rounded-lg bg-gray-900 px-4 py-3 text-sm font-semibold text-white">{project ? "Guardar" : "Crear proyecto"}</button>
    </form>
  </BottomSheet>;
}
