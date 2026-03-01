import { useEffect, useMemo, useRef, useState } from "react";
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

export const useMapGrid = ({
  items,
  zoom,
  bounds,
}: UseMapGridOptions): GridCell[] => {
  const [workerCells, setWorkerCells] = useState<GridCell[]>([]);
  const requestIdRef = useRef(0);

  const shouldUseWorker =
    bounds !== null && items.length > GRID_WORKER_THRESHOLD;

  const syncCells = useMemo(
    () =>
      computeGridCells({
        items,
        zoom,
        bounds,
      }),
    [items, zoom, bounds],
  );

  useEffect(() => {
    if (!shouldUseWorker) {
      return;
    }

    if (typeof Worker === "undefined") {
      return;
    }

    const requestId = ++requestIdRef.current;
    const worker = new Worker(
      new URL("./workers/mapGrid.worker.ts", import.meta.url),
      {
        type: "module",
      },
    );

    worker.onmessage = (event: MessageEvent<GridCell[]>) => {
      if (requestId !== requestIdRef.current) return;
      setWorkerCells(event.data);
      worker.terminate();
    };

    worker.onerror = () => {
      if (requestId !== requestIdRef.current) return;
      setWorkerCells(syncCells);
      worker.terminate();
    };

    const payload: MapGridWorkerRequest = {
      items,
      zoom,
      bounds,
    };

    worker.postMessage(payload);

    return () => {
      worker.terminate();
    };
  }, [shouldUseWorker, items, zoom, bounds, syncCells]);

  return shouldUseWorker ? workerCells : syncCells;
};
