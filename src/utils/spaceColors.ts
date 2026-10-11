export const spaceColors = [
  { name: "Azul", value: "#315DA8" }, { name: "Índigo", value: "#4F46A5" },
  { name: "Violeta", value: "#70509B" }, { name: "Lavanda", value: "#7D5F91" },
  { name: "Ciruela", value: "#805071" }, { name: "Rosa", value: "#A04F73" },
  { name: "Frambuesa", value: "#AD425F" }, { name: "Rojo", value: "#AC4949" },
  { name: "Terracota", value: "#A4563F" }, { name: "Cobre", value: "#9C6039" },
  { name: "Ocre", value: "#8C6B2D" }, { name: "Oliva", value: "#70753D" },
  { name: "Verde", value: "#487548" }, { name: "Bosque", value: "#357252" },
  { name: "Esmeralda", value: "#287564" }, { name: "Turquesa", value: "#28747B" },
  { name: "Petróleo", value: "#346C83" }, { name: "Acero", value: "#4D6B91" },
  { name: "Pizarra", value: "#59677C" }, { name: "Café", value: "#80604C" },
] as const;

function hue(hex: string) {
  const [r, g, b] = [1, 3, 5].map(offset => parseInt(hex.slice(offset, offset + 2), 16) / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b), delta = max - min;
  if (!delta) return { h: 0, s: 0 };
  const h = max === r ? ((g - b) / delta + 6) % 6 : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4;
  return { h: h * 60, s: delta / max };
}
// Older custom colors use the nearest calm palette tone in the interface.
export function spaceColor(value?: string) {
  const exact = spaceColors.find(color => color.value.toLowerCase() === value?.toLowerCase());
  if (exact) return exact.value;
  if (!value || !/^#[0-9a-f]{6}$/i.test(value)) return spaceColors[1].value;
  const source = hue(value);
  if (source.s < 0.15) return spaceColors[18].value;
  return [...spaceColors].sort((a, b) => {
    const distance = (color: string) => { const difference = Math.abs(hue(color).h - source.h); return Math.min(difference, 360 - difference); };
    return distance(a.value) - distance(b.value);
  })[0].value;
}
