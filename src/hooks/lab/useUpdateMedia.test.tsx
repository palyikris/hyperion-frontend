import { act, renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";
import { describe, expect, it, vi } from "vitest";
import { useUpdateMedia } from "./useUpdateMedia";

const { patchMedia } = vi.hoisted(() => ({ patchMedia: vi.fn() }));

vi.mock("../../services/mediaService", () => ({
  mediaService: { patchMedia },
}));
vi.mock("../../services/toastService", () => ({
  toastService: { success: vi.fn(), error: vi.fn() },
}));

describe("useUpdateMedia", () => {
  it.each(["image", "video"] as const)(
    "refreshes dependent views after saving a %s edit",
    async (itemType) => {
      const client = new QueryClient({
        defaultOptions: { queries: { retry: false } },
      });
      const keys = [
        ["media", "selected-id"],
        ["video", "selected-id"],
        ["vault", { page: 1 }],
        ["upload", "recent-gallery"],
        ["map-data", { has_trash: true }],
        ["map-logs", "selected-id"],
        ["stats", "summary", 7],
      ];
      for (const key of keys) client.setQueryData(key, { cached: true });
      client.setQueryData(["authUser"], { id: "user-1" });
      patchMedia.mockResolvedValueOnce(itemType === "video" ? null : {});

      const wrapper = ({ children }: PropsWithChildren) => (
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      );
      const { result, unmount } = renderHook(() => useUpdateMedia(), { wrapper });

      await act(async () => {
        await result.current.mutateAsync({
          mediaId: "selected-id",
          patchData: { item_type: itemType, detections: [] },
        });
      });

      for (const key of keys) {
        expect(client.getQueryState(key)?.isInvalidated).toBe(true);
      }
      expect(client.getQueryState(["authUser"])?.isInvalidated).toBe(false);
      unmount();
      client.clear();
    },
  );
});
