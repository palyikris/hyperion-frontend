import { render, screen } from "@testing-library/react";
import { describe, it, expect} from "vitest";
import StatusBadge from "./StatusBadge";

describe("StatusBadge", () => {
  it("renders the correct label for PENDING status", () => {
    render(
      <StatusBadge status="PENDING" config={{ bgColor: "", textColor: "" }} />,
    );
    expect(screen.getByText(/upload.status.pending/i)).toBeInTheDocument();
  });
});
