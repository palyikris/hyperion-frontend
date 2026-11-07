import { useEffect, useMemo, useState } from "react";
import type { GridCell, MapItem } from "../../types/map";
import {
  computeGridCells,
  type MapGridWorkerRequest,
  type ViewportBounds,
} from "./mapGridBucketing";

type UseMapGridOptions = {
  items: MapItem[];
  zoom: number;
  bounds: ViewportBounds | null;
};

const GRID_WORKER_THRESHOLD = 1000;
const EMPTY_CELLS: GridCell[] = [];

type WorkerResult = {
  request: MapGridWorkerRequest;
  cells: GridCell[];
};

export const useMapGrid = ({
  items,
  zoom,
  bounds,
}: UseMapGridOptions): GridCell[] => {
  const [workerResult, setWorkerResult] = useState<WorkerResult | null>(null);
  const request = useMemo(() => ({ items, zoom, bounds }), [items, zoom, bounds]);

  const shouldUseWorker =
    bounds !== null && items.length > GRID_WORKER_THRESHOLD &&
    typeof Worker !== "undefined";

  const syncCells = useMemo(
    () => shouldUseWorker ? EMPTY_CELLS : computeGridCells(request),
    [shouldUseWorker, request],
  );

  useEffect(() => {
    if (!shouldUseWorker) {
      return;
    }

    let active = true;
    let worker: Worker | undefined;
    const fallback = () => {
      if (!active) return;
      active = false;
      worker?.terminate();
      setWorkerResult({ request, cells: computeGridCells(request) });
    };

    try {
      worker = new Worker(
        new URL("./workers/mapGrid.worker.ts", import.meta.url),
        { type: "module" },
      );
      worker.onmessage = (event: MessageEvent<GridCell[]>) => {
        if (!active) return;
        active = false;
        setWorkerResult({ request, cells: event.data });
        worker?.terminate();
      };
      worker.onerror = fallback;
      worker.onmessageerror = fallback;
      worker.postMessage(request);
    } catch {
      // Worker creation or structured cloning may fail synchronously.
      queueMicrotask(fallback);
    }

    return () => {
      active = false;
      worker?.terminate();
    };
  }, [shouldUseWorker, request]);

  if (!shouldUseWorker) return syncCells;
  return workerResult?.request === request ? workerResult.cells : EMPTY_CELLS;
};
