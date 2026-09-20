type SummaryStatsProps = {
    tasks: number;
    active: number;
    habits: number;
  };
  
  export function SummaryStats({
    tasks,
    active,
    habits,
  }: SummaryStatsProps) {
    return (
      <section className="grid grid-cols-3 gap-2 lg:max-w-[520px] lg:gap-3">
        <Stat
          value={tasks}
          label="Tareas"
        />
  
        <Stat
          value={active}
          label="Activas"
        />
  
        <Stat
          value={habits}
          label="Hábitos"
        />
      </section>
    );
  }
  
  type StatProps = {
    value: number;
    label: string;
  };
  
  function Stat({ value, label }: StatProps) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white px-3 py-4 text-center lg:px-4 lg:py-3">
        <p className="text-xl font-bold text-gray-900">
          {value}
        </p>
  
        <p className="mt-1 text-xs text-gray-500">
          {label}
        </p>
      </div>
    );
  }