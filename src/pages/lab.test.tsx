import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider, useIsMutating } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import type { PropsWithChildren } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { MediaResponse } from "../types/lab";
import { useUpdateMedia } from "../hooks/lab/useUpdateMedia";
import { toastService } from "../services/toastService";
import LabPage from "./lab";

const { getImage, getVideo, patch } = vi.hoisted(() => ({ getImage: vi.fn(), getVideo: vi.fn(), patch: vi.fn() }));
vi.mock("../services/mediaService", () => ({ mediaService: { getMedia: getImage, getVideoMedia: getVideo, patchMedia: patch } }));
vi.mock("../services/toastService", () => ({ toastService: { success: vi.fn(), error: vi.fn() } }));
vi.mock("../components/shared/decoration", () => ({ PageAtmosphere: () => null }));
vi.mock("../components/shared/Title", () => ({ Title: ({ text }: { text: string }) => <h1>{text}</h1> }));
vi.mock("../components/shared/LoadingScreen", () => ({ default: () => <div>Loading media</div> }));
vi.mock("../components/shared/Button", () => ({ Button: ({ text, onClick, disabled, type }: {
  text: string; onClick?: () => void; disabled?: boolean; type?: "submit" | "button";
}) => <button type={type ?? "button"} onClick={onClick} disabled={disabled}>{text}</button> }));
vi.mock("../components/features/lab/MiniMap", () => ({ default: ({ disabled }: { disabled: boolean }) => <button disabled={disabled}>Map marker</button> }));
vi.mock("../components/features/lab/DetectionsDisplay", () => ({
  default: function DetectionsMock({ mediaId }: { mediaId: string }) {
    const mutation = useUpdateMedia(mediaId);
    const busy = useIsMutating({ mutationKey: ["lab", "update", mediaId] }) > 0;
    return <button disabled={busy} onClick={() => {
      mutation.mutate({ mediaId, patchData: { item_type: "image", detections: [] } });
    }}>Save detections</button>;
  },
}));

const media = { id: "media-1", lat: 47, lng: 19, altitude: 100, hf_path: "image.jpg", detections: [] } as unknown as MediaResponse;
const clients: QueryClient[] = [];
function setup(cached = true, cachedMedia = media) {
  const client = new QueryClient({ defaultOptions: { queries: { retryDelay: 0, staleTime: Infinity } } });
  clients.push(client);
  if (cached) client.setQueryData(["media", "media-1"], cachedMedia);
  const wrapper = ({ children }: PropsWithChildren) => <QueryClientProvider client={client}>
    <MemoryRouter initialEntries={["/lab/media-1"]}><Routes><Route path="/lab/:id" element={children} /></Routes></MemoryRouter>
  </QueryClientProvider>;
  return { client, ...render(<LabPage />, { wrapper }) };
}
const httpError = (status: number) => ({ isAxiosError: true, response: { status } });
beforeEach(() => { vi.clearAllMocks(); getImage.mockResolvedValue(media); });
afterEach(() => { clients.splice(0).forEach(client => client.clear()); });

describe("Lab loading and draft safety", () => {
  it("does not search for a video after a network/server error and exposes retry", async () => {
    getImage.mockRejectedValue(httpError(500));
    setup(false);
    expect(await screen.findByRole("alert")).toHaveTextContent("lab.page.load_error");
    expect(getVideo).not.toHaveBeenCalled();
    expect(screen.queryByLabelText("Latitude")).not.toBeInTheDocument();
    getImage.mockResolvedValue(media);
    fireEvent.click(screen.getByRole("button", { name: "lab.page.retry" }));
    expect(await screen.findByLabelText("Latitude")).toHaveValue(47);
  });

  it("only falls back to video on image 404 and displays missing media without editors", async () => {
    getImage.mockRejectedValue(httpError(404)); getVideo.mockRejectedValue(httpError(404));
    setup(false);
    expect(await screen.findByRole("alert")).toHaveTextContent("lab.page.not_found");
    expect(getVideo).toHaveBeenCalled();
    expect(screen.queryByText("Save detections")).not.toBeInTheDocument();
  });

  it("loads the video editor after an image 404", async () => {
    getImage.mockRejectedValue(httpError(404));
    getVideo.mockResolvedValue({ id: "media-1", frame_hf_path: "frame.jpg", lat: 47, lng: 19 });
    setup(false);
    expect(await screen.findByLabelText("Latitude")).toHaveValue(47);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("keeps dirty location fields when background results or coordinates change", () => {
    const { client } = setup();
    fireEvent.change(screen.getByLabelText("Latitude"), { target: { value: "48" } });
    act(() => { client.setQueryData(["media", "media-1"], { ...media, detections: [{ label: "Metal" }] }); });
    expect(screen.getByLabelText("Latitude")).toHaveValue(48);
    act(() => { client.setQueryData(["media", "media-1"], { ...media, lat: 46, lng: 20 }); });
    expect(screen.getByLabelText("Latitude")).toHaveValue(48);
  });

  it("locks both editors during save and keeps unsaved coordinates after detection save", async () => {
    let finish!: (value: MediaResponse) => void;
    patch.mockReturnValueOnce(new Promise(resolve => { finish = resolve; }));
    setup();
    fireEvent.change(screen.getByLabelText("Latitude"), { target: { value: "48" } });
    fireEvent.click(screen.getByText("Save detections"));
    await waitFor(() => expect(screen.getByLabelText("Latitude")).toBeDisabled());
    expect(screen.getByText("Map marker")).toBeDisabled();
    await act(async () => { finish(media); });
    await waitFor(() => expect(screen.getByLabelText("Latitude")).toBeEnabled());
    expect(screen.getByLabelText("Latitude")).toHaveValue(48);
  });

  it("keeps a failed location-save draft and does not raise an unhandled rejection", async () => {
    patch.mockRejectedValueOnce(new Error("Save failed"));
    setup();
    fireEvent.change(screen.getByLabelText("Latitude"), { target: { value: "48" } });
    fireEvent.click(screen.getByRole("button", { name: "Save metadata" }));
    await waitFor(() => expect(patch).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByLabelText("Latitude")).toBeEnabled());
    expect(screen.getByLabelText("Latitude")).toHaveValue(48);
  });
});

describe("Lab current location", () => {
  const missingLocation = { ...media, lat: undefined, lng: undefined };
  const getCurrentPosition = vi.fn<Geolocation["getCurrentPosition"]>();
  const originalGeolocation = Object.getOwnPropertyDescriptor(navigator, "geolocation");

  beforeEach(() => {
    getCurrentPosition.mockReset();
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: { getCurrentPosition },
    });
    getImage.mockResolvedValue(missingLocation);
  });

  afterEach(() => {
    if (originalGeolocation) {
      Object.defineProperty(navigator, "geolocation", originalGeolocation);
    } else {
      Reflect.deleteProperty(navigator, "geolocation");
    }
  });

  it.each([[47.4979, 19.0402], [0, 0]])(
    "previews coordinates %s, %s and only persists them on save",
    async (latitude, longitude) => {
      const saved = { ...missingLocation, lat: latitude, lng: longitude };
      patch.mockResolvedValueOnce(saved);
      getImage.mockResolvedValue(saved);
      setup(true, missingLocation);
      const button = screen.getByRole("button", { name: "Use my location" });

      expect(getCurrentPosition).not.toHaveBeenCalled();
      fireEvent.click(button);
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute("aria-busy", "true");
      expect(getCurrentPosition).toHaveBeenCalledWith(
        expect.any(Function), expect.any(Function),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      );

      act(() => {
        getCurrentPosition.mock.calls[0][0]({ coords: { latitude, longitude, altitude: null } } as GeolocationPosition);
      });

      expect(screen.getByLabelText("Latitude")).toHaveValue(latitude);
      expect(screen.getByLabelText("Longitude")).toHaveValue(longitude);
      expect(screen.getByLabelText("Altitude")).toHaveValue(100);
      expect(screen.getByRole("button", { name: "Map marker" })).toBeInTheDocument();
      expect(screen.queryByText("No location metadata is available for this media yet.")).not.toBeInTheDocument();
      expect(patch).not.toHaveBeenCalled();
      await waitFor(() => expect(screen.getByRole("button", { name: "Save metadata" })).toBeEnabled());
      fireEvent.click(screen.getByRole("button", { name: "Save metadata" }));
      await waitFor(() => expect(patch).toHaveBeenCalledWith("media-1", {
        item_type: "image", lat: latitude, lng: longitude,
      }));
      await waitFor(() => expect(screen.getByRole("button", { name: "Save metadata" })).toBeDisabled());
    },
  );

  it.each([1, 2, 3])("keeps the draft and allows retry after location error %s", async (code) => {
    setup(true, missingLocation);
    fireEvent.change(screen.getByLabelText("Latitude"), { target: { value: "48" } });
    const button = screen.getByRole("button", { name: "Use my location" });
    fireEvent.click(button);
    act(() => {
      getCurrentPosition.mock.calls[0][1]?.({ code } as GeolocationPositionError);
    });

    expect(toastService.error).toHaveBeenCalledWith("Unable to retrieve your location.");
    expect(button).toBeEnabled();
    expect(screen.getByLabelText("Latitude")).toHaveValue(48);
    expect(screen.getByLabelText("Longitude")).toHaveValue(null);
    expect(patch).not.toHaveBeenCalled();
    fireEvent.click(button);
    expect(getCurrentPosition).toHaveBeenCalledTimes(2);
  });

  it("reports unsupported geolocation without changing the form", () => {
    Object.defineProperty(navigator, "geolocation", { configurable: true, value: undefined });
    setup(true, missingLocation);
    fireEvent.click(screen.getByRole("button", { name: "Use my location" }));

    expect(toastService.error).toHaveBeenCalledWith("Geolocation is not supported by your browser.");
    expect(screen.getByRole("button", { name: "Use my location" })).toBeEnabled();
    expect(screen.getByLabelText("Latitude")).toHaveValue(null);
    expect(patch).not.toHaveBeenCalled();
  });

  it("clears detected coordinates when resetting media without saved location", async () => {
    setup(true, missingLocation);
    fireEvent.click(screen.getByRole("button", { name: "Use my location" }));
    act(() => {
      getCurrentPosition.mock.calls[0][0]({ coords: { latitude: 47.4979, longitude: 19.0402 } } as GeolocationPosition);
    });
    await waitFor(() => expect(screen.getByRole("button", { name: "Save metadata" })).toBeEnabled());
    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(screen.getByLabelText("Latitude")).toHaveValue(null);
    expect(screen.getByLabelText("Longitude")).toHaveValue(null);
    expect(screen.getByLabelText("Altitude")).toHaveValue(100);
    expect(screen.getByRole("button", { name: "Use my location" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save metadata" })).toBeDisabled();
  });

  it("disables location lookup while media changes are saving", async () => {
    let finish!: (value: MediaResponse) => void;
    patch.mockReturnValueOnce(new Promise(resolve => { finish = resolve; }));
    setup(true, missingLocation);
    fireEvent.click(screen.getByText("Save detections"));
    await waitFor(() => expect(screen.getByRole("button", { name: "Use my location" })).toBeDisabled());
    expect(getCurrentPosition).not.toHaveBeenCalled();
    await act(async () => { finish(missingLocation); });
    await waitFor(() => expect(screen.getByRole("button", { name: "Use my location" })).toBeEnabled());
  });

  it("ignores a canceled location request after resetting and retrying", () => {
    setup(true, missingLocation);
    const button = screen.getByRole("button", { name: "Use my location" });
    fireEvent.click(button);
    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(button).toBeEnabled();
    fireEvent.click(button);

    act(() => {
      getCurrentPosition.mock.calls[0][0]({ coords: { latitude: 40, longitude: 20 } } as GeolocationPosition);
    });
    expect(screen.getByLabelText("Latitude")).toHaveValue(null);
    expect(button).toBeDisabled();

    act(() => {
      getCurrentPosition.mock.calls[1][0]({ coords: { latitude: 47, longitude: 19 } } as GeolocationPosition);
    });
    expect(screen.getByLabelText("Latitude")).toHaveValue(47);
    expect(screen.getByLabelText("Longitude")).toHaveValue(19);
  });

  it("ignores a location error after leaving the editor", () => {
    const { unmount } = setup(true, missingLocation);
    fireEvent.click(screen.getByRole("button", { name: "Use my location" }));
    unmount();
    act(() => {
      getCurrentPosition.mock.calls[0][1]?.({ code: 1 } as GeolocationPositionError);
    });
    expect(toastService.error).not.toHaveBeenCalled();
  });
});
