import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import MapLayerRenderer from "./MapLayerRenderer";
import type { GridCell } from "../../../types/map";

vi.mock("react-leaflet", () => ({
  Marker: () => <div data-testid="mock-marker" />,
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

  it("renders grid cells in grid view", () => {
    const mockGridCells: GridCell[] = [
      {
        id: "1",
        count: 10,
        density: 50,
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
  });
});
