import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { GridCell, MapItem } from "../../types/map";
import { computeGridCells, type MapGridWorkerRequest } from "./mapGridBucketing";
import { useMapGrid } from "./useMapGrid";

vi.mock("./mapGridBucketing", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./mapGridBucketing")>();
  return { ...actual, computeGridCells: vi.fn(actual.computeGridCells) };
});

const bounds = { south: 47, west: 19, north: 48, east: 20 };
const cell: GridCell = {
  id: "cell", count: 1001, density: 1, confidence: 90,
  bounds, dominantLabel: null, labelDistribution: {}, items: [],
};
const workers: FakeWorker[] = [];
class FakeWorker {
  onmessage: ((event: MessageEvent<GridCell[]>) => void) | null = null;
  onerror: (() => void) | null = null;
  onmessageerror: (() => void) | null = null;
  postMessage = vi.fn<(request: MapGridWorkerRequest) => void>();
  terminate = vi.fn();
  constructor() { workers.push(this); }
}
function options(count = 1001) {
  const items: MapItem[] = Array.from({ length: count }, (_, i) => ({
    id: `${i}`, lat: 47.5, lng: 19.05, has_trash: true, confidence: 90,
    status: "READY", detections: [],
  }));
  return { items, zoom: 12, bounds };
}
beforeEach(() => {
  vi.clearAllMocks();
  workers.length = 0;
  vi.stubGlobal("Worker", FakeWorker);
});
afterEach(() => { vi.unstubAllGlobals(); });

describe("map grid execution", () => {
  it("computes small inputs directly without starting a Worker", () => {
    const { result } = renderHook(() => useMapGrid(options(1)));
    expect(result.current[0]).toMatchObject({ count: 1, confidence: 90, density: 1 });
    expect(workers).toHaveLength(0);
    expect(computeGridCells).toHaveBeenCalledTimes(1);
  });

  it("computes large inputs directly when Workers are unavailable", () => {
    vi.stubGlobal("Worker", undefined);
    const { result } = renderHook(() => useMapGrid(options()));
    expect(result.current[0].count).toBe(1001);
    expect(computeGridCells).toHaveBeenCalledTimes(1);
  });

  it("does not compute on the main thread when a Worker succeeds", () => {
    const input = options();
    const { result } = renderHook(() => useMapGrid(input));
    expect(result.current).toEqual([]);
    expect(computeGridCells).not.toHaveBeenCalled();
    expect(workers[0].postMessage).toHaveBeenCalledWith(input);

    act(() => { workers[0].onmessage?.({ data: [cell] } as MessageEvent<GridCell[]>); });
    expect(result.current).toEqual([cell]);
    expect(workers[0].terminate).toHaveBeenCalled();
    expect(computeGridCells).not.toHaveBeenCalled();
  });

  it.each(["onerror", "onmessageerror"] as const)("falls back once after %s", (event) => {
    const input = options();
    const { result } = renderHook(() => useMapGrid(input));
    act(() => { workers[0][event]?.(); });
    expect(result.current[0].count).toBe(1001);
    expect(computeGridCells).toHaveBeenCalledTimes(1);
    expect(workers[0].terminate).toHaveBeenCalled();
    act(() => { workers[0].onmessage?.({ data: [cell] } as MessageEvent<GridCell[]>); });
    expect(result.current[0].id).not.toBe("cell");
  });

  it.each(["construction", "postMessage"])("falls back when %s throws", async (failure) => {
    vi.stubGlobal("Worker", class extends FakeWorker {
      constructor() {
        super();
        if (failure === "construction") throw new Error("Worker blocked");
        this.postMessage.mockImplementation(() => { throw new Error("Cannot clone input"); });
      }
    });
    const input = options();
    const { result } = renderHook(() => useMapGrid(input));
    await waitFor(() => expect(result.current[0]?.count).toBe(1001));
    expect(computeGridCells).toHaveBeenCalledTimes(1);
  });

  it("ignores obsolete results after a viewport change and terminates on unmount", () => {
    const input = options();
    const { result, rerender, unmount } = renderHook(props => useMapGrid(props), { initialProps: input });
    const oldWorker = workers[0];
    rerender({ ...input, zoom: 14 });
    expect(oldWorker.terminate).toHaveBeenCalled();
    act(() => { oldWorker.onmessage?.({ data: [cell] } as MessageEvent<GridCell[]>); });
    expect(result.current).toEqual([]);
    act(() => { workers[1].onmessage?.({ data: [{ ...cell, id: "new" }] } as MessageEvent<GridCell[]>); });
    expect(result.current[0].id).toBe("new");
    expect(computeGridCells).not.toHaveBeenCalled();
    unmount();
    expect(workers[1].terminate).toHaveBeenCalled();
  });

  it("does not start a Worker before viewport bounds are available", () => {
    const input = { ...options(), bounds: null };
    const { result } = renderHook(() => useMapGrid(input));
    expect(result.current).toEqual([]);
    expect(workers).toHaveLength(0);
  });
});
