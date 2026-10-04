import { useId, useState } from "react";
import { Check, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { labelKey, uniqueLabels } from "../../utils/labels";

export function useLabelCatalog() {
  const { settings, tasks, habits } = useApp();
  return uniqueLabels([...(settings.labels ?? []), ...tasks.flatMap(task => task.labels ?? []), ...habits.flatMap(habit => habit.labels ?? [])]).sort((a, b) => a.localeCompare(b, "es"));
}

export function LabelPicker({ value, onChange }: { value: string[]; onChange: (labels: string[]) => void }) {
  const catalog = useLabelCatalog();
  const { createLabel } = useApp();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const id = useId();
  const selected = (label: string) => value.some(item => labelKey(item) === labelKey(label));
  const matches = catalog.filter(label => labelKey(label).includes(labelKey(query))).sort((a, b) => Number(selected(b)) - Number(selected(a)) || a.localeCompare(b, "es"));
  const exact = catalog.find(label => labelKey(label) === labelKey(query));
  function toggle(label: string) {
    createLabel(label);
    if (selected(label)) onChange(value.filter(item => labelKey(item) !== labelKey(label)));
    else if (value.length < 8) onChange(uniqueLabels([...value, label]));
  }
  function create() {
    if (!query.trim() || value.length >= 8) return;
    const label = createLabel(query);
    if (label && !selected(label)) onChange(uniqueLabels([...value, label]));
    setQuery("");
  }
  return <div className="min-w-0">
    <div className="mb-1.5 flex items-center justify-between"><label htmlFor={id} className="text-xs font-semibold text-gray-500">Etiquetas</label><Link to="/labels" className="text-[11px] text-gray-500">Administrar</Link></div>
    {!!value.length && <div className="mb-2 flex flex-wrap gap-1">{value.map(label => <span key={label} className="inline-flex max-w-full items-center gap-1 rounded bg-indigo-50 px-2 py-1 text-xs text-indigo-700"><span className="truncate">#{label}</span><button type="button" aria-label={`Quitar etiqueta ${label}`} onClick={() => toggle(label)}><X size={12} /></button></span>)}</div>}
    <div className="relative" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false); }}>
      <input id={id} role="combobox" aria-label="Buscar o crear etiqueta" aria-autocomplete="list" aria-expanded={open} aria-controls={`${id}-options`} value={query} onFocus={() => setOpen(true)} onChange={event => { setQuery(event.target.value); setOpen(true); }} onKeyDown={event => {
        if (event.key === "Escape") setOpen(false);
        if (event.key === "Enter") { event.preventDefault(); if (exact) toggle(exact); else if (query.trim()) create(); else if (matches[0]) toggle(matches[0]); }
        if (event.key === "ArrowDown") { event.preventDefault(); setOpen(true); document.getElementById(`${id}-options`)?.querySelector<HTMLButtonElement>('button')?.focus(); }
      }} placeholder="Buscar o crear etiqueta…" className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-indigo-400" />
      {open && <div id={`${id}-options`} role="listbox" aria-multiselectable="true" className="absolute left-0 right-0 top-11 z-20 max-h-56 overflow-y-auto rounded-xl border border-gray-200 bg-white p-1 shadow-lg">
        {matches.map(label => <button type="button" role="option" aria-selected={selected(label)} key={label} disabled={!selected(label) && value.length >= 8} onClick={() => toggle(label)} className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-2 text-left text-xs text-gray-700 hover:bg-indigo-50 disabled:opacity-40"><span className="truncate">#{label}</span>{selected(label) && <Check size={14} className="shrink-0 text-indigo-600" />}</button>)}
        {query.trim() && !exact && <button type="button" disabled={value.length >= 8} onClick={create} className="w-full rounded-lg px-2 py-2 text-left text-xs font-semibold text-indigo-600 disabled:opacity-40">Crear “{query.trim()}”</button>}
        {!matches.length && !query.trim() && <p className="p-2 text-xs text-gray-400">Escribe para crear tu primera etiqueta.</p>}
        {value.length >= 8 && <p className="p-2 text-xs text-gray-400">Hasta 8 etiquetas por tarea.</p>}
      </div>}
    </div>
  </div>;
}

export function LabelFilter({ value, onChange, compact = false }: { value: string; onChange: (value: string) => void; compact?: boolean }) {
  const labels = useLabelCatalog();
  return <label className="block text-xs font-semibold text-gray-500">{!compact && "Filtrar por etiqueta"}<select aria-label="Filtrar por etiqueta" value={value} onChange={event => onChange(event.target.value)} className={`${compact ? "" : "mt-1"} h-10 w-full rounded-lg border border-gray-200 bg-white px-2 text-xs font-normal text-gray-700`}><option value="">{compact ? "Etiquetas" : "Todas las etiquetas"}</option><option value="__none">Sin etiquetas</option>{labels.map(label => <option key={label} value={label}>#{label}</option>)}</select></label>;
}
export function matchesLabel(labels: string[] | undefined, filter: string) { return !filter || (filter === "__none" ? !labels?.length : !!labels?.some(label => labelKey(label) === labelKey(filter))); }
