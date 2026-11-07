import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import MapLayerRenderer from "./MapLayerRenderer";
import type { GridCell } from "../../../types/map";
import type { VideoDetection } from "../../../types/lab";

vi.mock("react-leaflet", () => ({
  Marker: ({ eventHandlers }: { eventHandlers: { click: () => void } }) => (
    <button data-testid="mock-marker" onClick={eventHandlers.click}>Marker</button>
  ),
  Popup: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Rectangle: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  Polyline: () => null,
  useMap: () => ({}),
}));

vi.mock("react-leaflet-cluster", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("./HeatmapLayer", () => ({
  default: () => <div data-testid="mock-heatmap" />,
}));

describe("MapLayerRenderer", () => {
  const defaultProps = {
    viewMode: "markers" as const,
    items: [],
    video_detections: {},
    heatmapPoints: [],
    gridCells: [],
    maxGridCount: 1,
    createClusterCustomIcon: vi.fn(),
    createMapIcon: vi.fn(),
    mixHexColors: vi.fn(),
    onMarkerClick: vi.fn(),
  };

  it("renders heatmap view correctly", () => {
    render(<MapLayerRenderer {...defaultProps} viewMode="heatmap" />);
    expect(screen.getByTestId("mock-heatmap")).toBeInTheDocument();
  });

  it("labels the displayed grid percentage as relative to the densest visible cell", () => {
    const mockGridCells: GridCell[] = [
      {
        id: "1",
        count: 10,
        density: 0.5,
        confidence: 80,
        bounds: { north: 0, south: 0, east: 0, west: 0 },
        dominantLabel: "plastic",
        // Added missing required properties
        labelDistribution: { plastic: 1.0 },
        items: [],
      },
    ];

    render(
      <MapLayerRenderer
        {...defaultProps}
        viewMode="grid"
        gridCells={mockGridCells}
      />,
    );

    expect(screen.getByText("Grid Analysis")).toBeInTheDocument();
    expect(screen.getByText("80.0%")).toBeInTheDocument();
    expect(screen.getByText("50.0%")).toBeInTheDocument();
    expect(screen.getByText("Relative trash density")).toBeInTheDocument();
    expect(screen.getByText("100% marks the visible cell with the most trash-positive hits."))
      .toBeInTheDocument();
  });

  it("uses relative density to color sparse and dense positive-only cells differently", () => {
    const mixHexColors = vi.fn(() => "rgb(0, 0, 0)");
    const base: GridCell = {
      id: "sparse", count: 1, density: 0.25, confidence: 90,
      bounds: { south: 47.5, west: 19.05, north: 47.505, east: 19.055 },
      dominantLabel: null, labelDistribution: {}, items: [],
    };

    render(<MapLayerRenderer {...defaultProps} viewMode="grid"
      gridCells={[base, { ...base, id: "dense", count: 4, density: 1 }]}
      maxGridCount={4} mixHexColors={mixHexColors} />);

    expect(mixHexColors).toHaveBeenNthCalledWith(1, "#8FCACA", "#D97B5A", 0.25);
    expect(mixHexColors).toHaveBeenNthCalledWith(2, "#8FCACA", "#D97B5A", 1);
    expect(screen.getByText("25.0%")).toBeInTheDocument();
    expect(screen.getByText("100.0%")).toBeInTheDocument();
  });

  it("selects the clicked video detection without changing its parent media target", () => {
    const detection: VideoDetection = {
      id: "detection-2", media_id: "video-1", lat: 47.5, lng: 19.05,
      altitude: 80, address: "Frame address", image_url: "frame-2.jpg",
      confidence: 0.9, label: "plastic", bbox: { x: 0, y: 0, w: 0.2, h: 0.2 },
      timestamp_in_video: 6,
      media: {
        id: "video-1", status: "READY", lat: 46, lng: 18, detections: [],
        confidence: 95, has_trash: true, initial_metadata: { filename: "video.mp4" },
        uploader_id: "user-1", hf_path: "video.mp4", created_at: "2026-10-31", updated_at: "2026-10-31",
      },
    };
    const onMarkerClick = vi.fn();
    render(<MapLayerRenderer {...defaultProps}
      video_detections={{ "video-1": [detection] }} onMarkerClick={onMarkerClick} />);

    fireEvent.click(screen.getByTestId("mock-marker"));
    expect(onMarkerClick).toHaveBeenCalledWith(expect.objectContaining({
      id: "video-1", video_detection_id: "detection-2", lat: 47.5, lng: 19.05,
      altitude: 80, address: "Frame address", image_url: "frame-2.jpg",
      filename: "video.mp4", confidence: 90, detections: [detection],
    }));
  });
});
