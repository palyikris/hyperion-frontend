import type { GridBounds, GridCell, MapItem } from "../../types/map";

export type ViewportBounds = {
  south: number;
  west: number;
  north: number;
  east: number;
};

type ComputeGridCellsOptions = {
  items: MapItem[];
  zoom: number;
  bounds: ViewportBounds | null;
};

export type MapGridWorkerRequest = ComputeGridCellsOptions;

type GridAnchor = {
  lat: number;
  lng: number;
};

const getGridStepByZoom = (zoom: number) => {
  if (zoom >= 16) return 0.001;
  if (zoom >= 14) return 0.002;
  if (zoom >= 12) return 0.005;
  if (zoom >= 10) return 0.01;
  return 0.02;
};

const GRID_ANCHOR: GridAnchor = {
  lat: 0,
  lng: 0,
};

const FLOAT_EPSILON = 1e-9;

const getStepPrecision = (step: number) => {
  const stepText = step.toString();
  const decimalSeparator = stepText.indexOf(".");
  return decimalSeparator === -1 ? 0 : stepText.length - decimalSeparator - 1;
};

const roundToStepPrecision = (value: number, step: number) =>
  Number(value.toFixed(getStepPrecision(step)));

const toGridIndex = (value: number, step: number, origin: number) => {
  const scaled = (value - origin) / step;
  return Math.floor(scaled + FLOAT_EPSILON);
};

const buildGridCellBounds = (
  latIndex: number,
  lngIndex: number,
  step: number,
  anchor: GridAnchor,
): GridBounds => {
  const south = roundToStepPrecision(anchor.lat + latIndex * step, step);
  const west = roundToStepPrecision(anchor.lng + lngIndex * step, step);

  return {
    south,
    west,
    north: roundToStepPrecision(south + step, step),
    east: roundToStepPrecision(west + step, step),
  };
};

export const computeGridCells = ({
  items,
  zoom,
  bounds,
}: ComputeGridCellsOptions): GridCell[] => {
  if (!bounds) return [];

  const step = getGridStepByZoom(zoom);
  const anchor = GRID_ANCHOR;
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

    const latIndex = toGridIndex(item.lat, step, anchor.lat);
    const lngIndex = toGridIndex(item.lng, step, anchor.lng);
    const id = `${latIndex}:${lngIndex}`;

    if (!byCell.has(id)) {
      byCell.set(id, {
        id,
        bounds: buildGridCellBounds(latIndex, lngIndex, step, anchor),
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

  return Array.from(byCell.values()).map((cell) => {
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
  });
};