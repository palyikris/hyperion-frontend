const parseHexColor = (hex: string) => {
  const cleanHex = hex.replace("#", "");
  const bigint = Number.parseInt(cleanHex, 16);

  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
};

export const mixHexColors = (
  startHex: string,
  endHex: string,
  ratio: number,
) => {
  const clamped = Math.min(Math.max(ratio, 0), 1);
  const start = parseHexColor(startHex);
  const end = parseHexColor(endHex);

  const r = Math.round(start.r + (end.r - start.r) * clamped);
  const g = Math.round(start.g + (end.g - start.g) * clamped);
  const b = Math.round(start.b + (end.b - start.b) * clamped);

  return `rgb(${r}, ${g}, ${b})`;
};
