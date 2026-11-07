import { describe, expect, it, vi } from "vitest";
import type { MapItem } from "../../types/map";
import { computeGridCells, type MapGridWorkerRequest } from "./mapGridBucketing";

const bounds = { south: 47, west: 19, north: 48, east: 20 };

function pointsAt(lng: number, count: number, hasTrash = true): MapItem[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `${lng}-${hasTrash}-${index}`,
    lat: 47.501,
    lng,
    has_trash: hasTrash,
    confidence: 90,
    status: "READY",
    detections: [],
  }));
}

describe("relative grid density", () => {
  it("distinguishes positive-only cells by their number of hits", () => {
    const cells = computeGridCells({
      items: [...pointsAt(19.051, 1), ...pointsAt(19.061, 2), ...pointsAt(19.071, 4)],
      zoom: 12,
      bounds,
    });

    expect(cells.map(({ count, density, confidence }) => ({ count, density, confidence })))
      .toEqual([
        { count: 1, density: 0.25, confidence: 90 },
        { count: 2, density: 0.5, confidence: 90 },
        { count: 4, density: 1, confidence: 90 },
      ]);
  });

  it("does not dilute density with clean observations or use them as the maximum", () => {
    const cells = computeGridCells({
      items: [
        ...pointsAt(19.051, 1), ...pointsAt(19.051, 9, false),
        ...pointsAt(19.061, 2), ...pointsAt(19.071, 20, false),
      ],
      zoom: 12,
      bounds,
    });

    expect(cells.map(({ count, density }) => ({ count, density }))).toEqual([
      { count: 10, density: 0.5 },
      { count: 2, density: 1 },
      { count: 20, density: 0 },
    ]);
  });

  it("excludes off-screen hits from the reference maximum", () => {
    const cells = computeGridCells({
      items: [...pointsAt(19.051, 1), ...pointsAt(19.061, 4), ...pointsAt(20.051, 100)],
      zoom: 12,
      bounds,
    });

    expect(cells.map(cell => cell.density)).toEqual([0.25, 1]);
  });

  it("recalculates the visible reference without moving the grid cells", () => {
    const items = [...pointsAt(19.051, 1), ...pointsAt(19.061, 4)];
    const wide = computeGridCells({ items, zoom: 12, bounds });
    const narrow = computeGridCells({
      items, zoom: 12, bounds: { ...bounds, east: 19.055 },
    });

    expect(wide[0].density).toBe(0.25);
    expect(narrow).toHaveLength(1);
    expect(narrow[0].density).toBe(1);
    expect(narrow[0].bounds).toEqual(wide[0].bounds);
  });

  it("returns finite zero densities when every observation is clean", () => {
    const cells = computeGridCells({
      items: [...pointsAt(19.051, 2, false), ...pointsAt(19.061, 4, false)],
      zoom: 12,
      bounds,
    });

    expect(cells.map(cell => cell.density)).toEqual([0, 0]);
  });

  it("assigns equal density to cells with equal positive counts", () => {
    const cells = computeGridCells({
      items: [...pointsAt(19.051, 2), ...pointsAt(19.061, 2)],
      zoom: 12,
      bounds,
    });

    expect(cells.map(cell => cell.density)).toEqual([1, 1]);
  });

  it("keeps empty and missing-viewport inputs empty", () => {
    expect(computeGridCells({ items: [], zoom: 12, bounds })).toEqual([]);
    expect(computeGridCells({ items: pointsAt(19.051, 2), zoom: 12, bounds: null }))
      .toEqual([]);
  });

  it("uses the same relative calculation in the real Worker message handler", async () => {
    const input: MapGridWorkerRequest = {
      items: [...pointsAt(19.051, 1), ...pointsAt(19.061, 1001)],
      zoom: 12,
      bounds,
    };
    const workerScope = {
      onmessage: undefined as ((event: MessageEvent<MapGridWorkerRequest>) => void) | undefined,
      postMessage: vi.fn(),
    };
    vi.stubGlobal("self", workerScope);
    try {
      await import("./workers/mapGrid.worker");
      expect(workerScope.onmessage).toBeTypeOf("function");
      workerScope.onmessage?.({ data: input } as MessageEvent<MapGridWorkerRequest>);

      const expected = computeGridCells(input);
      expect(expected.map(cell => cell.density)).toEqual([1 / 1001, 1]);
      expect(workerScope.postMessage).toHaveBeenCalledExactlyOnceWith(expected);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
