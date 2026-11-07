import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import i18n from "i18next";
import en from "../../../public/locales/en/translations.json";
import hu from "../../../public/locales/hu/translations.json";
import type { CardStatus, WSStatusUpdate } from "../../types/upload";
import { toastService } from "../../services/toastService";
import { useUploadSocket } from "./useUploadSocket";
import { api } from "../../api/axiosInstance";

vi.mock("../../services/toastService", () => ({
  toastService: { error: vi.fn() },
}));

class FakeWebSocket {
  static OPEN = 1;
  static instances: FakeWebSocket[] = [];
  readyState = 1;
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onclose: ((event: { wasClean: boolean; code?: number }) => void) | null = null;
  onerror: (() => void) | null = null;
  close = vi.fn();

  url: string;
  constructor(url: string) { this.url = url; FakeWebSocket.instances.push(this); }

  receive(status: CardStatus, overrides: Partial<WSStatusUpdate> = {}) {
    const update: WSStatusUpdate = {
      type: "MEDIA_STATUS_UPDATE", media_id: "media-1", status,
      timestamp: "2026-10-31T12:00:00Z",
      failed_reason: status === "FAILED" ? "AI unavailable" : undefined,
      ...overrides,
    };
    this.onmessage?.({ data: JSON.stringify(update) });
  }
}

const clients: QueryClient[] = [];
const originalBaseURL = api.defaults.baseURL;
const dependentKeys = [
  ["upload", "recent-gallery"], ["vault", { page: 1 }], ["vault", { page: 2 }],
  ["map-data", {}], ["map-data", { min_confidence: 80 }], ["map-logs", "media-1"],
  ["stats", "summary", 7], ["stats", "temporal-trends", 30],
  ["stats", "fun-facts", "en", 4],
];

function context() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });
  clients.push(client);
  for (const key of dependentKeys) {
    client.setQueryData(key, { total: 0, image_items: [], video_items: [] });
  }
  client.setQueryData(["authUser"], { id: "user-1" });
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  const hook = renderHook(() => useUploadSocket(), { wrapper });
  return { client, socket: FakeWebSocket.instances[0], ...hook };
}

beforeAll(async () => {
  await i18n.init({
    lng: "en", fallbackLng: "en", defaultNS: "translations",
    resources: { en: { translations: en }, hu: { translations: hu } },
    interpolation: { escapeValue: false },
  });
});
beforeEach(async () => {
  await i18n.changeLanguage("en");
  vi.clearAllMocks();
  FakeWebSocket.instances = [];
  vi.stubGlobal("WebSocket", FakeWebSocket);
  api.defaults.baseURL = originalBaseURL;
});
afterEach(() => {
  for (const client of clients.splice(0)) client.clear();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  api.defaults.baseURL = originalBaseURL;
});

describe("processing completion cache updates", () => {
  it("applies the backend's img_url to the displayed hf_path in every gallery variant", () => {
    const { client, socket } = context();
    const item = { id: "media-1", status: "PENDING", hf_path: "old.jpg" };
    const galleryKeys = [["upload", "recent-gallery"], ["vault", { page: 1 }], ["vault", { page: 2 }]];
    for (const key of galleryKeys) client.setQueryData(key, { image_items: [item], video_items: [], total: 1 });
    act(() => {
      socket.onmessage?.({ data: JSON.stringify({
        type: "MEDIA_STATUS_UPDATE", media_id: "media-1", status: "UPLOADED",
        img_url: "new.jpg", worker: "Helios", address: "Budapest",
      }) });
    });
    for (const key of galleryKeys) {
      expect(client.getQueryData<{ image_items: unknown[] }>(key)?.image_items[0]).toMatchObject({
        hf_path: "new.jpg", status: "UPLOADED", assigned_worker: "Helios", address: "Budapest",
      });
    }
  });

  it.each([
    ["http://localhost:8000/api", "ws://localhost:8000/api/upload/ws/updates"],
    ["https://backend.example.test/api/", "wss://backend.example.test/api/upload/ws/updates"],
    ["/api", `${window.location.origin.replace(/^http/, "ws")}/api/upload/ws/updates`],
  ])("uses the HTTP client's base URL %s for WebSocket connections", (baseURL, expected) => {
    api.defaults.baseURL = baseURL;
    expect(context().socket.url).toBe(expected);
  });

  it("invalidates dependent caches after reconnecting, but not on the first connection", () => {
    vi.useFakeTimers();
    vi.spyOn(console, "log").mockImplementation(() => {});
    const { client, socket } = context();
    act(() => { socket.onopen?.(); });
    for (const key of dependentKeys) expect(client.getQueryState(key)?.isInvalidated).toBe(false);
    act(() => { socket.readyState = 3; socket.onclose?.({ wasClean: false }); });
    act(() => { vi.advanceTimersByTime(1000); });
    act(() => { FakeWebSocket.instances[1].onopen?.(); });
    for (const key of dependentKeys) expect(client.getQueryState(key)?.isInvalidated).toBe(true);
    expect(client.getQueryState(["authUser"])?.isInvalidated).toBe(false);
  });

  it.each(["READY", "FAILED"] as const)(
    "invalidates every dependent query variant on %s",
    (status) => {
      const { client, socket, unmount } = context();
      act(() => { socket.receive(status); });
      for (const key of dependentKeys) {
        expect(client.getQueryState(key)?.isInvalidated, JSON.stringify(key)).toBe(true);
      }
      expect(client.getQueryState(["authUser"])?.isInvalidated).toBe(false);
      unmount();
      expect(socket.close).toHaveBeenCalledOnce();
    },
  );

  it("does not invalidate aggregate views for intermediate progress", () => {
    const { client, socket } = context();
    act(() => { socket.receive("PROCESSING"); });
    for (const key of dependentKeys) {
      expect(client.getQueryState(key)?.isInvalidated).toBe(false);
    }
  });

  it("refetches active dependent queries even when their cached data is fresh", async () => {
    const { client, socket } = context();
    const refresh = vi.fn().mockResolvedValue({ version: 2 });
    const { QueryObserver } = await import("@tanstack/react-query");
    const observer = new QueryObserver(client, {
      queryKey: ["stats", "summary", 7], queryFn: refresh,
    });
    const unsubscribe = observer.subscribe(() => {});
    expect(refresh).not.toHaveBeenCalled();
    act(() => { socket.receive("READY"); });
    await waitFor(() => {
      expect(client.getQueryData(["stats", "summary", 7])).toEqual({ version: 2 });
    });
    expect(refresh).toHaveBeenCalledOnce();
    unsubscribe();
  });

  it("keeps the failure notification and live announcement", () => {
    const { socket, result } = context();
    act(() => { socket.receive("FAILED"); });
    expect(toastService.error).toHaveBeenCalledWith("Media processing failed", "AI unavailable");
    expect(result.current.liveFailureAnnouncement).toContain("AI unavailable");
  });

  it.each(["en", "hu"] as const)(
    "localizes the error title, fallback reason and live announcement in %s",
    async (language) => {
      await i18n.changeLanguage(language);
      const { socket, result } = context();
      const expected = language === "hu"
        ? { title: "A média feldolgozása sikertelen", reason: "A feldolgozás sikertelen." }
        : { title: "Media processing failed", reason: "Processing failed." };
      for (const failed_reason of [undefined, "", " \t "]) {
        act(() => { socket.receive("FAILED", { failed_reason }); });
        expect(toastService.error).toHaveBeenLastCalledWith(expected.title, expected.reason);
        expect(result.current.liveFailureAnnouncement).toBe(`${expected.title}: ${expected.reason}`);
      }
    },
  );

  it("uses the current language for new messages without reconnecting the socket", async () => {
    const { socket, result } = context();
    act(() => { socket.receive("FAILED"); });
    await act(async () => { await i18n.changeLanguage("hu"); });
    act(() => { socket.receive("FAILED", { failed_reason: "  AI <unavailable> & retry  " }); });
    expect(toastService.error).toHaveBeenLastCalledWith(
      "A média feldolgozása sikertelen", "AI <unavailable> & retry",
    );
    expect(result.current.liveFailureAnnouncement).toBe(
      "A média feldolgozása sikertelen: AI <unavailable> & retry",
    );
    expect(FakeWebSocket.instances).toHaveLength(1);
    expect(socket.close).not.toHaveBeenCalled();
  });

  it("reconnects after an unclean close and cancels retries on unmount", () => {
    vi.useFakeTimers();
    vi.spyOn(console, "log").mockImplementation(() => {});
    const { socket, unmount } = context();
    act(() => {
      socket.readyState = 3;
      socket.onclose?.({ wasClean: false });
    });
    expect(FakeWebSocket.instances).toHaveLength(1);
    act(() => { vi.advanceTimersByTime(1000); });
    expect(FakeWebSocket.instances).toHaveLength(2);
    const reconnected = FakeWebSocket.instances[1];
    act(() => {
      reconnected.readyState = 3;
      reconnected.onclose?.({ wasClean: false });
    });
    unmount();
    act(() => { vi.advanceTimersByTime(30_000); });
    expect(FakeWebSocket.instances).toHaveLength(2);
    expect(reconnected.close).toHaveBeenCalledOnce();
  });

  it("reconnects after a server restart even when the closing handshake was clean", () => {
    vi.useFakeTimers();
    vi.spyOn(console, "log").mockImplementation(() => {});
    const { socket, unmount } = context();
    act(() => { socket.readyState = 3; socket.onclose?.({ wasClean: true, code: 1001 }); });
    act(() => { vi.advanceTimersByTime(1000); });
    expect(FakeWebSocket.instances).toHaveLength(2);
    unmount();
  });

  it("does not keep retrying after the server rejects authentication", () => {
    vi.useFakeTimers();
    vi.spyOn(console, "log").mockImplementation(() => {});
    const { socket, unmount } = context();
    act(() => { socket.readyState = 3; socket.onclose?.({ wasClean: true, code: 1008 }); });
    act(() => { vi.advanceTimersByTime(60_000); });
    expect(FakeWebSocket.instances).toHaveLength(1);
    unmount();
  });
});
