import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import VaultEmptyState from "./VaultEmptyState";

describe("VaultEmptyState", () => {
  it("renders the empty state message and avatar", () => {
    render(<VaultEmptyState />);

    expect(
      screen.getByText("No media found matching your criteria."),
    ).toBeInTheDocument();
    expect(
      screen.getByAltText("Hyperion avatar confused image"),
    ).toBeInTheDocument();
  });
});