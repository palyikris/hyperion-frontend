import { act, renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";
import { describe, expect, it, vi } from "vitest";
import { useMarkClean } from "./useMarkClean";

const { markClean } = vi.hoisted(() => ({ markClean: vi.fn() }));
vi.mock("../../services/mediaService", () => ({ mediaService: { markClean } }));
vi.mock("../../services/toastService", () => ({ toastService: { success: vi.fn(), error: vi.fn() } }));

describe("useMarkClean", () => {
  it.each([false, true])("refreshes all dependent views and removes cleaned cached frames (all: %s)", async (all) => {
    const client = new QueryClient();
    const keys = [["media", "parent"], ["vault"], ["upload", "recent-gallery"],
      ["map-data", { has_trash: true }], ["map-logs", "selected"], ["stats", "summary", 7]];
    keys.forEach(key => client.setQueryData(key, { cached: true }));
    client.setQueryData(["video", "selected"], { id: "selected", media_id: "parent" });
    client.setQueryData(["video", "sibling"], { id: "sibling", media_id: "parent" });
    client.setQueryData(["video", "unrelated"], { id: "unrelated", media_id: "other" });
    client.setQueryData(["authUser"], { id: "owner" });
    const wrapper = ({ children }: PropsWithChildren) =>
      <QueryClientProvider client={client}>{children}</QueryClientProvider>;
    const { result, unmount } = renderHook(() => useMarkClean("selected"), { wrapper });
    await act(async () => {
      await result.current.mutateAsync({ mediaId: "parent", detectionId: all ? undefined : "selected" });
    });
    keys.forEach(key => expect(client.getQueryState(key)?.isInvalidated).toBe(true));
    expect(client.getQueryData(["video", "selected"])).toBeUndefined();
    expect(client.getQueryData(["video", "sibling"])).toEqual(all ? undefined : { id: "sibling", media_id: "parent" });
    expect(client.getQueryData(["video", "unrelated"])).toEqual({ id: "unrelated", media_id: "other" });
    expect(client.getQueryState(["authUser"])?.isInvalidated).toBe(false);
    unmount();
    client.clear();
  });
});
