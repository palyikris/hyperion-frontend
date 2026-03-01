import { useMemo } from "react";
import type { GridBounds, GridCell, MapItem } from "../../types/map";

type ViewportBounds = {
  south: number;
  west: number;
  north: number;
  east: number;
};

type UseMapGridOptions = {
  items: MapItem[];
  zoom: number;
  bounds: ViewportBounds | null;
  minDensityPercent?: number;
};

const getGridStepByZoom = (zoom: number) => {
  if (zoom >= 16) return 0.001;
  if (zoom >= 14) return 0.002;
  if (zoom >= 12) return 0.005;
  if (zoom >= 10) return 0.01;
  return 0.02;
};

const buildGridCellBounds = (
  latIndex: number,
  lngIndex: number,
  step: number,
): GridBounds => {
  const south = latIndex * step;
  const west = lngIndex * step;

  return {
    south,
    west,
    north: south + step,
    east: west + step,
  };
};

export const useMapGrid = ({
  items,
  zoom,
  bounds,
  minDensityPercent = 0,
}: UseMapGridOptions): GridCell[] => {
  return useMemo(() => {
    if (!bounds) return [];

    const step = getGridStepByZoom(zoom);
    const byCell = new Map<string, GridCell>();

    for (const item of items) {
      if (
        item.lat < bounds.south ||
        item.lat > bounds.north ||
        item.lng < bounds.west ||
        item.lng > bounds.east
      ) {
        continue;
      }

      const latIndex = Math.floor(item.lat / step);
      const lngIndex = Math.floor(item.lng / step);
      const id = `${latIndex}:${lngIndex}`;

      if (!byCell.has(id)) {
        byCell.set(id, {
          id,
          bounds: buildGridCellBounds(latIndex, lngIndex, step),
          count: 0,
          density: 0,
          confidence: 0,
          dominantLabel: null,
          labelDistribution: {},
          items: [],
        });
      }

      const cell = byCell.get(id);
      if (!cell) continue;

      cell.count += 1;
      cell.items.push(item);
      cell.confidence += item.confidence ?? 0;

      if (item.has_trash) {
        cell.density += 1;
      }

      for (const detection of item.detections ?? []) {
        if (!detection.label) continue;
        cell.labelDistribution[detection.label] =
          (cell.labelDistribution[detection.label] ?? 0) + 1;
      }
    }

    const minDensityRatio = Math.min(Math.max(minDensityPercent, 0), 100) / 100;

    return Array.from(byCell.values())
      .map((cell) => {
        const density = cell.count > 0 ? cell.density / cell.count : 0;
        const confidence = cell.count > 0 ? cell.confidence / cell.count : 0;

        let dominantLabel: string | null = null;
        let dominantCount = 0;
        for (const [label, count] of Object.entries(cell.labelDistribution)) {
          if (count > dominantCount) {
            dominantCount = count;
            dominantLabel = label;
          }
        }

        return {
          ...cell,
          density,
          confidence,
          dominantLabel,
        };
      })
      .filter((cell) => cell.density >= minDensityRatio);
  }, [items, zoom, bounds, minDensityPercent]);
};
