export const labelKey = (value: string) => value.trim().replace(/^#+/, "").toLocaleLowerCase("es");
export function uniqueLabels(values: string[]): string[] {
  const map = new Map<string, string>();
  for (const value of values) { const clean = value.trim().replace(/^#+/, ""); if (clean && !map.has(labelKey(clean))) map.set(labelKey(clean), clean); }
  return [...map.values()];
}
