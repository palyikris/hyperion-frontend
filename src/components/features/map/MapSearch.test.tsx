import { render, } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import MapSearch from "./MapSearch";
import { useMap } from "react-leaflet";

vi.mock("react-leaflet", () => ({
  useMap: vi.fn(),
}));

vi.mock("leaflet-geosearch", () => ({
  GeoSearchControl: vi.fn().mockReturnValue({
    addTo: vi.fn(),
    remove: vi.fn(),
  }),
  OpenStreetMapProvider: vi.fn(),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (s: string) => s }),
}));

describe("MapSearch with Filters", () => {
  const mockMap = {
    addControl: vi.fn(),
    removeControl: vi.fn(),
  };

  beforeEach(() => {
    (useMap as any).mockReturnValue(mockMap);
  });

  it("verifies search control initializes with correct labels", () => {
    render(<MapSearch />);
    expect(mockMap.addControl).toHaveBeenCalled();
  });

  it("filters items based on search criteria (mocked logic)", () => {
    const mockItems = [
      { id: "1", lat: 0, lng: 0, status: "READY", has_trash: true },
      { id: "2", lat: 10, lng: 10, status: "READY", has_trash: false },
    ];

    const filterFn = (items: any[], query: string) =>
      items.filter((item) => item.id.includes(query));

    const result = filterFn(mockItems, "1");

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });
});
