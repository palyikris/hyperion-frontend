/**
 * Stable color palette for detection bounding boxes
 */
export const DETECTION_COLOR_PALETTE: ReadonlyArray<[number, number, number]> = [
  [170, 30, 30], // Red
  [22, 120, 38], // Green
  [194, 104, 20], // Orange
  [20, 96, 138], // Blue
  [124, 48, 156], // Purple
  [158, 144, 20], // Yellow
  [26, 58, 158], // Dark Blue
  [150, 70, 96], // Pink
];

/**
 * Generate a stable color for a detection based on its ID.
 * Same ID will always produce the same color.
 */
export const getStableDetectionColor = (id: string): [number, number, number] => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash) + id.charCodeAt(i);
    hash = hash & hash; // Convert to 32-bit integer
  }
  const index = Math.abs(hash) % DETECTION_COLOR_PALETTE.length;
  return DETECTION_COLOR_PALETTE[index];
};

/**
 * Convert RGB values to rgba color string
 */
export const rgbToRgba = (
  rgb: [number, number, number],
  alpha: number
): string => {
  const [r, g, b] = rgb;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
