import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useMapPageState } from "./useMapPageState";
import type { MapResponse } from "../../types/map";
import type { VideoDetection } from "../../types/lab";

const { getData } = vi.hoisted(() => ({ getData: vi.fn() }));
vi.mock("./useMapData", () => ({ useMapData: getData }));
vi.mock("../useDebounce", () => ({ useDebounce: <T,>(value: T) => value }));

beforeEach(() => { vi.clearAllMocks(); localStorage.clear(); });

describe("map grid confidence normalization", () => {
  it("averages image percentages and normalized video confidence on the same scale", () => {
    const image = {
      id: "image", status: "READY", lat: 47.5, lng: 19.05,
      has_trash: true, confidence: 90, detections: [],
    };
    const video: VideoDetection = {
      id: "detection", media_id: "video", lat: 47.5, lng: 19.05,
      confidence: 0.9, label: "plastic", bbox: { x: 0, y: 0, w: 0.2, h: 0.2 },
      altitude: 80, timestamp_in_video: 3, image_url: "frame.jpg",
      media: {
        ...image, id: "video", initial_metadata: { filename: "video.mp4" },
        uploader_id: "user-1", hf_path: "video.mp4", created_at: "2026-10-31", updated_at: "2026-10-31",
      },
    };
    const data: MapResponse = { items: [image], video_detections: { video: [video] }, total: 2 };
    getData.mockReturnValue({ data, isLoading: false, isFetching: false, isError: false, dataUpdatedAt: 1 });
    const { result } = renderHook(() => useMapPageState());
    act(() => { result.current.handleViewportChange({
      zoom: 12, center: { lat: 47.5, lng: 19.05 },
      bounds: { south: 47, west: 19, north: 48, east: 20 },
    }); });
    expect(result.current.gridCells).toHaveLength(1);
    expect(result.current.gridCells[0]).toMatchObject({ count: 2, confidence: 90, density: 1 });
    expect(result.current.gridCells[0].items.map(item => item.id)).toEqual(["image", "detection"]);
  });

  it("keeps density informative when grid mode enforces the positive-only filter", () => {
    const image = {
      id: "sparse", status: "READY", lat: 47.501, lng: 19.051,
      has_trash: true, confidence: 90, detections: [],
    };
    const data: MapResponse = {
      items: [image, ...Array.from({ length: 4 }, (_, index) => ({
        ...image, id: `dense-${index}`, lng: 19.061,
      }))],
      video_detections: {},
      total: 5,
    };
    getData.mockReturnValue({ data, isLoading: false, isFetching: false, isError: false, dataUpdatedAt: 1 });
    const { result } = renderHook(() => useMapPageState());

    act(() => {
      result.current.handleViewModeChange("grid");
      result.current.handleViewportChange({
        zoom: 12, center: { lat: 47.5, lng: 19.05 },
        bounds: { south: 47, west: 19, north: 48, east: 20 },
      });
    });

    expect(result.current.filters.has_trash).toBe(true);
    expect(getData).toHaveBeenLastCalledWith(expect.objectContaining({ has_trash: true }));
    expect(result.current.gridCells.map(cell => cell.density)).toEqual([0.25, 1]);
  });
});
