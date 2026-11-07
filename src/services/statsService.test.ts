import { beforeEach, describe, expect, it, vi } from "vitest";
import { statsService } from "./statsService";

const { get } = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("../api/axiosInstance", () => ({ api: { get } }));

beforeEach(() => { get.mockReset(); });

const cases = [
  {
    name: "pipeline time differs from worker time",
    overall_avg_seconds: 10,
    by_worker: [{ worker_name: "Helios", avg_processing_seconds: 8, task_count: 1 }],
  },
  {
    name: "workers have different task counts",
    overall_avg_seconds: 42.25,
    by_worker: [
      { worker_name: "Helios", avg_processing_seconds: 2, task_count: 2 },
      { worker_name: "Eos", avg_processing_seconds: 8, task_count: 3 },
    ],
  },
  {
    name: "the backend average is zero",
    overall_avg_seconds: 0,
    by_worker: [{ worker_name: "Helios", avg_processing_seconds: 8, task_count: 1 }],
  },
  {
    name: "there are no per-worker intervals",
    overall_avg_seconds: 12.75,
    by_worker: [],
  },
  {
    name: "per-worker task counts are zero",
    overall_avg_seconds: 23.875,
    by_worker: [{ worker_name: "Helios", avg_processing_seconds: 8, task_count: 0 }],
  },
];

describe.each(["individual KPI", "summary"])("processing time mapping in %s", (endpoint) => {
  it.each(cases)("preserves the backend average when $name", async (input) => {
    const meanTime = {
      overall_avg_seconds: input.overall_avg_seconds,
      by_worker: input.by_worker,
    };
    const summary = {
      trash_composition: [],
      environmental_footprint: { total_area_sqm: 0, total_detections: 0 },
      ai_fleet_efficiency: {
        workers: [], fleet_reliability_score: 1, total_successes: 0, total_failures: 0,
      },
      temporal_trends: [],
      mean_time_to_process: meanTime,
      hotspot_density: { hotspot_count: 0, high_confidence_media_count: 0 },
      days_window: 30,
    };
    get.mockResolvedValueOnce({ data: endpoint === "summary" ? summary : meanTime });

    const mapped = endpoint === "summary"
      ? (await statsService.getStatsSummary(30)).meanTimeToProcess
      : await statsService.getMeanTimeToProcess();

    expect(mapped.overallAvgSeconds).toBe(input.overall_avg_seconds);
    expect(mapped.byWorker).toEqual(input.by_worker.map((worker) => ({
      workerName: worker.worker_name,
      avgProcessingSeconds: worker.avg_processing_seconds,
      taskCount: worker.task_count,
    })));
    if (endpoint === "summary") {
      expect(get).toHaveBeenCalledWith("/stats/summary", { params: { days: 30 } });
    } else {
      expect(get).toHaveBeenCalledWith("/stats/mean-time-to-process");
    }
  });
});
