import { render } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import HeatmapLayer from "./HeatmapLayer";
import L from "leaflet";

vi.mock("react-leaflet", () => ({
  useMap: () => ({ addTo: vi.fn(), removeLayer: vi.fn() }),
}));

(L as any).heatLayer = vi.fn().mockReturnValue({ addTo: vi.fn() });

describe("HeatmapLayer", () => {
  it("renders without crashing", () => {
    const { container } = render(<HeatmapLayer points={[[0, 0, 1]]} />);
    expect(container).toBeDefined();
  });
});
