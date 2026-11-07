export interface PixelRect { x: number; y: number; w: number; h: number }

export const clipDrawingRect = (
  rect: PixelRect, dimensions: { width: number; height: number },
): PixelRect => {
  const clip = (value: number, maximum: number) => Math.max(0, Math.min(maximum, value));
  const x1 = clip(rect.x, dimensions.width);
  const y1 = clip(rect.y, dimensions.height);
  const x2 = clip(rect.x + rect.w, dimensions.width);
  const y2 = clip(rect.y + rect.h, dimensions.height);
  return { x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1), h: Math.abs(y2 - y1) };
};
