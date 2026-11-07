import { act, renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";
import { describe, expect, it, vi } from "vitest";
import { useUploadFiles } from "./useUploadFiles";
import { useUploadVideoChunked } from "./useUploadVideoChunked";

vi.mock("../../services/uploadService", () => ({ uploadService: {
  uploadFiles: vi.fn().mockRejectedValue(new AggregateError([], "Partial upload failure")),
  uploadVideoChunked: vi.fn().mockRejectedValue(new Error("Video upload failed")),
} }));

describe("gallery synchronization after upload errors", () => {
  it.each(["images", "video"])("refreshes recents even when %s upload fails", async (mode) => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    client.setQueryData(["upload", "recent-gallery"], { image_items: [] });
    client.setQueryData(["authUser"], { id: "user-1" });
    const wrapper = ({ children }: PropsWithChildren) =>
      <QueryClientProvider client={client}>{children}</QueryClientProvider>;
    const { result, unmount } = renderHook(() => ({ images: useUploadFiles(), video: useUploadVideoChunked() }), { wrapper });
    await act(async () => {
      if (mode === "images") await result.current.images.mutateAsync({ files: [] }).catch(() => {});
      else await result.current.video.mutateAsync({ file: new File(["video"], "clip.mp4") }).catch(() => {});
    });
    expect(client.getQueryState(["upload", "recent-gallery"])?.isInvalidated).toBe(true);
    expect(client.getQueryState(["authUser"])?.isInvalidated).toBe(false);
    unmount();
    client.clear();
  });
});
