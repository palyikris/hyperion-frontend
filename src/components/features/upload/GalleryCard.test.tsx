import { StrictMode } from "react";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CardStatus } from "../../../types/upload";
import GalleryCard from "./GalleryCard";

describe("GalleryCard visibility", () => {
  beforeEach(() => {
    // Reproduce a card whose scroll-reveal observer hasn't reported an entry.
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it.each(["PROCESSING", "EXTRACTING"] as const)(
    "keeps a %s card visible when it becomes Ready without a scroll event",
    (status) => {
      const queryClient = new QueryClient();
      const card = (currentStatus: CardStatus) => (
        <StrictMode>
          <QueryClientProvider client={queryClient}>
            <MemoryRouter>
              <GalleryCard
                id="media-1"
                title="image.jpg"
                imageUrl="image.jpg"
                status={currentStatus}
                gpsCoordinates="N/A"
                timestamp="2026-10-19T12:00:00Z"
                metadataInfo="1 MB, 2560x1440"
                index={14}
              />
            </MemoryRouter>
          </QueryClientProvider>
        </StrictMode>
      );
      const { rerender } = render(card(status));
      const heading = screen.getByRole("heading", { name: "image.jpg" });

      rerender(card("READY"));

      expect(screen.getByText("upload.status.ready")).toBeVisible();
      expect(screen.getByRole("heading", { name: "image.jpg" })).toBe(heading);
      expect(heading).toBeVisible();
    },
  );
});
