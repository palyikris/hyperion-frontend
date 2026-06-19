import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import DetectionsVisibilityToggler from "./DetectionsVisibilityToggler";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe("DetectionsVisibilityToggler", () => {
  const props = {
    detections: [
      {
        id: "1",
        label: "plastic",
        confidence: 0.9,
        bbox: { x: 0, y: 0, w: 0, h: 0 },
      },
    ],
    hiddenDetections: {},
    selectedId: null,
    onShowAll: vi.fn(),
    onShowNone: vi.fn(),
    onToggleDetection: vi.fn(),
    onIsolateDetection: vi.fn(),
  };

  it("calls onShowAll when show all button is clicked", () => {
    render(<DetectionsVisibilityToggler {...props} />);
    fireEvent.click(screen.getByText(/lab.detections.visibility.showAll/i));
    expect(props.onShowAll).toHaveBeenCalled();
  });
});
