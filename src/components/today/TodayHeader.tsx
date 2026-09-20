export function TodayHeader() {
  const formattedDate = new Intl.DateTimeFormat("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  return (
    <header className="mb-4 flex items-center justify-between">
      <p className="text-sm font-medium capitalize text-gray-500">
        {formattedDate}
      </p>
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-700"
        >
          U
        </button>
    </header>
  );
}
