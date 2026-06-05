import { render, screen } from "@testing-library/react";
import GalleryCardInfoRow from "./GalleryCardInfoRow";
import { describe, it, expect} from "vitest";

describe("GalleryCardInfoRow", () => {
  it("renders label and value", () => {
    render(
      <GalleryCardInfoRow
        icon={<span>icon</span>}
        label="TestLabel"
        value="TestValue"
      />,
    );
    expect(screen.getByText("TestLabel")).toBeInTheDocument();
    expect(screen.getByText("TestValue")).toBeInTheDocument();
  });
});
