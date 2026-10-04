import { useState } from "react";
import { X } from "lucide-react";

import { useApp } from "../../context/AppContext";
import { BottomSheet } from "../ui/BottomSheet";
import { TaskEditorSheet, type TaskEditorValue } from "../tasks/TaskEditorSheet";

type QuickCaptureProps = {
  open: boolean;
  onClose: () => void;
};

export function QuickCapture({ open, onClose }: QuickCaptureProps) {
  const { createTask } = useApp();
  const [title, setTitle] = useState("");
  const [detailsOpen, setDetailsOpen] = useState(false);

  function handleSave() {
    const cleanTitle = title.trim();
    if (!cleanTitle) return;
    createTask({ title: cleanTitle, status: "pending" });
    setTitle("");
    onClose();
  }

  function handleClose() {
    setTitle("");
    onClose();
  }

  function openDetails() {
    setDetailsOpen(true);
    onClose();
  }

  function createDetailedTask(value: TaskEditorValue) {
    createTask({
      ...value,
      status: "pending",
    });
    setTitle("");
  }

  return (
    <>
      <BottomSheet open={open} onClose={handleClose} ariaLabel="Captura rápida">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold text-gray-900">¿Qué tienes en mente?</h2>
            <p className="mt-1 text-sm text-gray-500">
              Anótalo ahora. Puedes organizarlo después.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Cerrar"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600"
          >
            <X size={18} />
          </button>
        </div>

        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && handleSave()}
          placeholder="Ej. Comprar focos..."
          className="mt-5 h-14 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 text-base text-gray-900 outline-none transition focus:border-gray-400 focus:bg-white"
        />

        <button
          type="button"
          onClick={openDetails}
          className="mt-3 text-sm font-medium text-gray-500"
        >
          + Agregar detalles
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={!title.trim()}
          className="mt-6 h-12 w-full rounded-2xl bg-gray-900 font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
        >
          Guardar tarea
        </button>
      </BottomSheet>

      <TaskEditorSheet
        open={detailsOpen}
        initialTitle={title}
        onClose={() => setDetailsOpen(false)}
        onSave={createDetailedTask}
      />
    </>
  );
}
