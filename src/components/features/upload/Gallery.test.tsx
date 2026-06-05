import { render, screen } from "@testing-library/react";
import { describe, it, expect} from "vitest";
import Gallery from "./Gallery";

describe("Gallery", () => {
  it("renders a list of images", () => {
    const items = [{ id: "1", hf_path: "img1.jpg", status: "READY" }] as any;
    render(<Gallery items={items} />);

    expect(screen.getByAltText("Untitled")).toBeInTheDocument();
  });
});
