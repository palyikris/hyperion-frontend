import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import GalleryCard from "./GalleryCard";

// Mock dependencies
vi.mock("../../../hooks/vault/useDeleteVaultItem", () => ({
  useDeleteVaultItem: () => ({ mutate: vi.fn(), isPending: false }),
}));
vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
}));

describe("GalleryCard", () => {
  const defaultProps = {
    id: "1",
    title: "Test Image",
    imageUrl: "test.jpg",
    status: "READY" as any,
    gpsCoordinates: "N/A",
    timestamp: "2026-06-05T12:00:00Z",
    metadataInfo: "10 MB, 100x100",
    index: 0,
  };

  it("toggles the info overlay when info button is clicked", async () => {
    render(<GalleryCard {...defaultProps} />);

    // Check initial state (hidden)
    expect(screen.queryByText(/Technical Specs/i)).not.toBeInTheDocument();

    const infoBtn = screen.getByRole("button", { name: "" }); // Find by the icon button
    fireEvent.click(infoBtn);

    // Check if overlay opened
    expect(await screen.findByText(/Technical Specs/i)).toBeInTheDocument();
  });
});
