import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ConfidenceFilter from "./ConfidenceFilter";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe("ConfidenceFilter", () => {
  it("calls onChange when slider value changes", () => {
    const onChange = vi.fn();
    render(
      <ConfidenceFilter
        confidenceThreshold={50}
        filteredCount={10}
        totalCount={20}
        onChange={onChange}
      />,
    );

    const slider = screen.getByRole("slider");
    fireEvent.change(slider, { target: { value: "80" } });

    expect(onChange).toHaveBeenCalledWith(80);
  });
});
