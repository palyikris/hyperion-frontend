/// <reference lib="webworker" />

import {
  computeGridCells,
  type MapGridWorkerRequest,
} from "../mapGridBucketing";

self.onmessage = (event: MessageEvent<MapGridWorkerRequest>) => {
  const cells = computeGridCells(event.data);
  self.postMessage(cells);
};

export {};