import { beforeEach, expect, it, vi } from "vitest";
import { api } from "../api/axiosInstance";
import { statsService } from "./statsService";

vi.mock("../api/axiosInstance", () => ({ api: { get: vi.fn() } }));

beforeEach(() => vi.clearAllMocks());

it("preserves the overall processing average including items without an assigned worker", async () => {
  vi.mocked(api.get).mockResolvedValue({
    data: {
      overall_avg_seconds: 270,
      by_worker: [
        { worker_name: "Helios", avg_processing_seconds: 60, task_count: 1 },
        { worker_name: "Eos", avg_processing_seconds: 120, task_count: 1 },
        { worker_name: "RetiredTitan", avg_processing_seconds: 300, task_count: 1 },
      ],
    },
  });

  const timing = await statsService.getMeanTimeToProcess();

  expect(timing.overallAvgSeconds).toBe(270);
  expect(timing.byWorker).toHaveLength(3);
});
