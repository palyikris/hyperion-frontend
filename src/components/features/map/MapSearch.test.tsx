import { render } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import MapSearch from "./MapSearch";
import { useMap } from "react-leaflet";

vi.mock("react-leaflet", () => ({
  useMap: vi.fn(),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (s: string) => s }),
}));

describe("MapSearch", () => {
  const mockMap = {
    addControl: vi.fn(),
    removeControl: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useMap).mockReturnValue(mockMap as unknown as ReturnType<typeof useMap>);
  });

  it("initializes the search control with translated labels", () => {
    render(<MapSearch />);
    expect(mockMap.addControl).toHaveBeenCalledWith(expect.objectContaining({
      options: expect.objectContaining({
        searchLabel: "map.search_label",
        clearSearchLabel: "map.clear_search_label",
        notFoundMessage: "map.not_found_message",
      }),
    }));
  });

  it("removes the same search control on unmount", () => {
    const { unmount } = render(<MapSearch />);
    const control = mockMap.addControl.mock.calls[0][0];
    unmount();
    expect(mockMap.removeControl).toHaveBeenCalledWith(control);
  });
});
