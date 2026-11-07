import { act, renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { afterEach, expect, it, vi } from "vitest";
import { useUploadSocket } from "./useUploadSocket";

vi.mock("../../api/axiosInstance", () => ({ api: { defaults: { baseURL: "/api" } } }));

vi.mock("../../services/toastService", () => ({ toastService: { error: vi.fn() } }));

class TestSocket {
  static OPEN = 1;
  static latest: TestSocket;
  readyState = 0;
  onopen: (() => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  close = vi.fn();
  url: string;
  constructor(url: string) {
    this.url = url;
    TestSocket.latest = this;
  }
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

it("uses the server's img_url to update thumbnails in recent and vault galleries", () => {
  vi.stubGlobal("WebSocket", TestSocket);
  vi.stubEnv("VITE_API_BASE_URL", "/api");
  const client = new QueryClient();
  const recentKey = ["upload", "recent-gallery"];
  const vaultKey = ["vault", { page: 1 }];
  const data = { total: 1, image_items: [{ id: "image-1", hf_path: "", status: "PENDING" }], video_items: [] };
  client.setQueryData(recentKey, data);
  client.setQueryData(vaultKey, data);
  const { unmount } = renderHook(() => useUploadSocket(), {
    wrapper: ({ children }: { children: ReactNode }) =>
      <QueryClientProvider client={client}>{children}</QueryClientProvider>,
  });
  expect(TestSocket.latest.url).toBe(new URL("/api/upload/ws/updates", window.location.origin).href.replace("http", "ws"));
  act(() => TestSocket.latest.onmessage?.({ data: JSON.stringify({
    type: "MEDIA_STATUS_UPDATE", media_id: "image-1", status: "UPLOADED",
    img_url: "media/thumbnail.jpg", worker: "Helios",
  }) }));
  for (const key of [recentKey, vaultKey]) {
    expect(client.getQueryData<typeof data>(key)?.image_items[0]).toMatchObject({
      status: "UPLOADED", hf_path: "media/thumbnail.jpg", assigned_worker: "Helios",
    });
  }
  act(() => TestSocket.latest.onmessage?.({ data: JSON.stringify({
    type: "MEDIA_STATUS_UPDATE", media_id: "image-1", status: "PROCESSING", img_url: null,
  }) }));
  expect(client.getQueryData<typeof data>(recentKey)?.image_items[0].hf_path).toBe("media/thumbnail.jpg");
  unmount();
  client.clear();
});
