import { DayButtons } from "./TaskDayToggle";
import { LabelPicker } from "../labels/LabelPicker";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { BottomSheet } from "../ui/BottomSheet";
import { TaskEditorSheet, type TaskEditorValue } from "./TaskEditorSheet";
import { useApp } from "../../context/AppContext";
import { defaultAreas } from "../../types/settings";

type Props = { initialArea?: string; open: boolean; onClose: () => void; onSave: (value: TaskEditorValue) => void };

export function SimpleTaskSheet({ open, initialArea, onClose, onSave }: Props) {
  const { settings } = useApp();
  const areas = settings.areas?.length ? settings.areas : defaultAreas;
  const [title, setTitle] = useState("");
  const [area, setArea] = useState("");
  const [workDates, setWorkDates] = useState<string[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    if (open) { setTitle(""); setArea(initialArea ?? ""); setDetailsOpen(false); setLabels([]); setWorkDates([]); }
  }, [open, initialArea]);

  function save() {
    const clean = title.trim();
    if (!clean) return;
    onSave({ title: clean, area: area || undefined, labels, workDates });
    onClose();
  }

  return (
    <>
      <BottomSheet open={open} onClose={onClose} ariaLabel="Nueva tarea">
        <div className="flex items-start justify-between gap-3">
          <div><p className="text-xs font-bold uppercase tracking-wide text-gray-400">Nueva tarea</p><h2 className="mt-1 text-xl font-bold text-gray-900">Anota lo que necesitas hacer</h2></div>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500"><X size={18} /></button>
        </div>
        <label className="mt-6 block text-sm font-semibold text-gray-700">Tarea
          <input autoFocus value={title} onChange={(event) => setTitle(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") save(); }} placeholder="Ej. Comprar madera" className="mt-2 h-12 w-full rounded-xl border border-gray-200 px-4 text-sm font-normal outline-none focus:border-gray-400" />
        </label>
        <label className="mt-4 block text-sm font-semibold text-gray-700">Área <span className="font-normal text-gray-400">(opcional)</span>
          <select value={area} onChange={(event) => setArea(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm font-normal outline-none">
            <option value="">Sin área</option>
            {areas.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
        <div className="mt-4"><DayButtons dates={workDates} onChange={setWorkDates} /></div>
        <div className="mt-4"><LabelPicker value={labels} onChange={setLabels} /></div>
        <div className="mt-6 flex items-center justify-between gap-3">
          <button type="button" onClick={() => { onClose(); setDetailsOpen(true); }} className="text-sm font-semibold text-gray-600">Más opciones</button>
          <button type="button" onClick={save} disabled={!title.trim()} className="h-11 rounded-xl bg-gray-900 px-5 text-sm font-semibold text-white disabled:bg-gray-200 disabled:text-gray-400">Guardar tarea</button>
        </div>
      </BottomSheet>
      <TaskEditorSheet initialWorkDates={workDates} open={detailsOpen} initialTitle={title} initialLabels={labels} initialArea={area || undefined} onClose={() => setDetailsOpen(false)} onSave={(value) => { onSave(value); setDetailsOpen(false); setLabels([]); setWorkDates([]); }} />
    </>
  );
}
