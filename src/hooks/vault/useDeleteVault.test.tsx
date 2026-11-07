import { act, renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";
import { describe, expect, it, vi } from "vitest";
import { useDeleteAllVault } from "./useDeleteAllVault";
import { useDeleteVaultItem } from "./useDeleteVaultItem";

vi.mock("../../services/vaultService", () => ({
  vaultService: {
    deleteAllMedia: vi.fn().mockResolvedValue({ deleted_count: 1 }),
    deleteVaultItem: vi.fn().mockResolvedValue(undefined),
  },
}));
vi.mock("../../services/toastService", () => ({
  toastService: { success: vi.fn(), error: vi.fn() },
}));

describe("vault deletion", () => {
  it.each(["single", "all"])("invalidates dependent views after %s deletion", async (mode) => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const keys = [["vault"], ["upload", "recent-gallery"], ["map-data"],
      ["map-logs", "id"], ["stats", "summary", 7], ["media", "id"], ["video", "id"]];
    for (const key of keys) client.setQueryData(key, { cached: true });
    client.setQueryData(["authUser"], { id: "user-1" });
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
    const { result, unmount } = renderHook(() => ({
      all: useDeleteAllVault(),
      single: useDeleteVaultItem(),
    }), { wrapper });
    await act(async () => {
      if (mode === "all") await result.current.all.mutateAsync();
      else await result.current.single.mutateAsync("id");
    });
    for (const key of keys) expect(client.getQueryState(key)?.isInvalidated).toBe(true);
    expect(client.getQueryState(["authUser"])?.isInvalidated).toBe(false);
    unmount();
    client.clear();
  });
});
