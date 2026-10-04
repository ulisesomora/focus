import { Circle, CircleCheck, ListTodo } from "lucide-react";
export type CompletionView = "pending" | "completed" | "all";
export function CompletionFilter({ value, onChange }: { value: CompletionView; onChange: (view: CompletionView) => void }) {
  return <div className="flex shrink-0 gap-1 rounded-lg bg-gray-100 p-1" aria-label="Estado de las tareas">
    {([["pending", "Pendientes", Circle], ["completed", "Completadas", CircleCheck], ["all", "Todas", ListTodo]] as const).map(([key, label, Icon]) => <button key={key} type="button" aria-label={label} title={label} aria-pressed={value === key} onClick={() => onChange(key)} className={`flex h-8 w-8 items-center justify-center rounded-md ${value === key ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}><Icon size={18} /></button>)}
  </div>;
}
