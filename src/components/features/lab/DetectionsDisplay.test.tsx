import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import type { PropsWithChildren } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Detection, MediaResponse } from "../../../types/lab";
import DetectionsDisplay from "./DetectionsDisplay";

const { patch, markClean } = vi.hoisted(() => ({ patch: vi.fn(), markClean: vi.fn() }));
vi.mock("../../../services/mediaService", () => ({ mediaService: { patchMedia: patch, markClean } }));
vi.mock("../../../services/toastService", () => ({ toastService: { success: vi.fn(), error: vi.fn() } }));
vi.mock("./ZoomableContainer", () => ({ default: ({ children }: PropsWithChildren) => <div>{children}</div> }));
vi.mock("../../shared/Button", () => ({
  Button: ({ text, onClick, disabled, id }: { text: string; onClick: () => void; disabled?: boolean; id?: string }) =>
    <button id={id} onClick={onClick} disabled={disabled}>{text}</button>,
}));
vi.mock("../../shared/SearchableSelectField", () => ({
  default: ({ value, onChange, label }: { value: string; onChange: (value: string) => void; label: string }) =>
    <select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)}>
      <option>Trash</option><option>Metal</option>
    </select>,
}));
vi.mock("./DetectionsStage", () => ({
  default: ({ detections, detectionKeys, disabled, onSelectDetection, onUpdateDetectionBBox, onAddDetection }: {
    detections: Detection[]; detectionKeys: string[]; disabled: boolean;
    onSelectDetection: (key: string) => void;
    onUpdateDetectionBBox: (key: string, bbox: Record<string, number>) => void;
    onAddDetection: (bbox: Record<string, number>) => void;
  }) => <div>
    <output data-testid="detections">{JSON.stringify(detections)}</output>
    <button disabled={disabled} onClick={() => onSelectDetection(detectionKeys[0])}>select first</button>
    <button disabled={disabled} onClick={() => onSelectDetection(detectionKeys.at(-1)!)}>select last</button>
    <button disabled={disabled} onClick={() => onUpdateDetectionBBox(detectionKeys[0], { x: 0.2, y: 0.2, w: 0.4, h: 0.4 })}>resize first</button>
    <button disabled={disabled} onClick={() => onAddDetection({ x: 0.1, y: 0.1, w: 0.1, h: 0.1 })}>draw new</button>
  </div>,
}));

const detection: Detection = { id: "0b7e3031-15e7-455b-a136-d1a77c4c1c44", label: "Trash", confidence: 0.8, bbox: { x: 0, y: 0, w: 0.5, h: 0.5 }, area_sqm: 8 };
const props = { mediaId: "media-1", hfPath: "image.jpg", detections: [detection], item_type: "image" as const };
const clients: QueryClient[] = [];
function setup(overrides: Partial<React.ComponentProps<typeof DetectionsDisplay>> = {}) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  clients.push(client);
  const wrapper = ({ children }: PropsWithChildren) =>
    <MemoryRouter><QueryClientProvider client={client}>{children}</QueryClientProvider></MemoryRouter>;
  return { client, ...render(<DetectionsDisplay {...props} {...overrides} />, { wrapper }) };
}
function shown(): Detection[] { return JSON.parse(screen.getByTestId("detections").textContent!); }
function save() { fireEvent.click(document.querySelector("#save-detections-btn")!); }
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
});

describe("marking detections clean", () => {
  it("offers Mark clean only for a selection and persists it immediately", async () => {
    setup();
    expect(screen.queryByText("Mark clean")).not.toBeInTheDocument();
    expect(screen.getByText("Mark all clean")).toBeEnabled();
    fireEvent.click(screen.getByText("select first"));
    fireEvent.click(screen.getByText("Mark clean"));
    await waitFor(() => expect(shown()).toEqual([]));
    expect(markClean).toHaveBeenCalledWith("media-1", detection.id);
    expect(patch).not.toHaveBeenCalled();
    expect(document.querySelector("#save-detections-btn")).toBeDisabled();
  });

  it("keeps other unsaved edits when a selected detection is marked clean", async () => {
    const other = { ...detection, id: "other-detection" };
    setup({ detections: [detection, other] });
    fireEvent.click(screen.getByText("select last"));
    fireEvent.change(screen.getByLabelText("Label"), { target: { value: "Metal" } });
    fireEvent.click(screen.getByText("select first"));
    fireEvent.click(screen.getByText("Mark clean"));
    await waitFor(() => expect(shown()).toHaveLength(1));
    expect(shown()[0]).toMatchObject({ id: other.id, label: "Metal" });
    expect(document.querySelector("#save-detections-btn")).toBeEnabled();
    patch.mockResolvedValueOnce({ id: "media-1", detections: [] });
    save();
    await waitFor(() => expect(patch).toHaveBeenCalled());
    expect(patch.mock.calls[0][1].detections).toHaveLength(1);
    expect(patch.mock.calls[0][1].detections[0]).toMatchObject({ id: other.id, label: "Metal" });
  });

  it("marks the entire media clean and clears the draft without requiring a selection", async () => {
    setup();
    fireEvent.click(screen.getByText("draw new"));
    fireEvent.click(screen.getByText("Mark all clean"));
    await waitFor(() => expect(shown()).toEqual([]));
    expect(markClean).toHaveBeenCalledWith("media-1", undefined);
    expect(patch).not.toHaveBeenCalled();
    expect(document.querySelector("#save-detections-btn")).toBeDisabled();
  });

  it("uses the parent video ID for Mark all clean", async () => {
    const { client } = setup({ mediaId: detection.id, parentMediaId: "parent-video", item_type: "video" });
    fireEvent.click(screen.getByText("Mark all clean"));
    await waitFor(() => expect(markClean).toHaveBeenCalledWith("parent-video", undefined));
    await waitFor(() => expect(client.isMutating()).toBe(0));
  });

  it("locks editing during a clean request and keeps the selection after failure", async () => {
    let reject!: (error: Error) => void;
    markClean.mockReturnValueOnce(new Promise((_, fail) => { reject = fail; }));
    setup();
    fireEvent.click(screen.getByText("select first"));
    fireEvent.click(screen.getByText("Mark clean"));
    await waitFor(() => expect(screen.getByText("Mark all clean")).toBeDisabled());
    expect(screen.getByText("draw new")).toBeDisabled();
    await act(async () => reject(new Error("Connection lost")));
    await waitFor(() => expect(screen.getByText("Mark clean")).toBeEnabled());
    expect(shown()).toHaveLength(1);
    fireEvent.click(screen.getByText("Mark clean"));
    await waitFor(() => expect(shown()).toEqual([]));
  });

  it("disables Mark all clean for media without detections", () => {
    setup({ detections: [], hasMediaDetections: false });
    expect(screen.getByText("Mark all clean")).toBeDisabled();
  });
});
afterEach(() => { clients.splice(0).forEach(client => client.clear()); vi.unstubAllGlobals(); });

describe("detection editing", () => {
  it("shows the draft label consistently and retains it while resizing", () => {
    setup();
    fireEvent.click(screen.getByText("select first"));
    fireEvent.change(screen.getByLabelText("Label"), { target: { value: "Metal" } });
    expect(shown()[0].label).toBe("Metal");
    expect(screen.getByText("Metal - 80%")).toBeInTheDocument();
    fireEvent.click(screen.getByText("resize first"));
    expect(screen.getByLabelText("Label")).toHaveValue("Metal");
    expect(shown()[0].area_sqm).toBeUndefined();
  });

  it("sends an existing ID and no obsolete area when the geometry changes", async () => {
    const { client } = setup();
    patch.mockResolvedValueOnce({ id: "media-1", detections: [] });
    fireEvent.click(screen.getByText("resize first"));
    save();
    await waitFor(() => expect(patch).toHaveBeenCalled());
    expect(patch.mock.calls[0][1].detections[0]).toMatchObject({ id: detection.id, bbox: { w: 0.4, h: 0.4 } });
    expect(patch.mock.calls[0][1].detections[0].area_sqm).toBeUndefined();
    await waitFor(() => expect(client.isMutating()).toBe(0));
  });

  it("locks editing during save, installs the response in the cache and then unlocks", async () => {
    let finish!: (value: Partial<MediaResponse>) => void;
    patch.mockReturnValueOnce(new Promise(resolve => { finish = resolve; }));
    const { client } = setup();
    fireEvent.click(screen.getByText("resize first"));
    save();
    await waitFor(() => expect(screen.getByText("draw new")).toBeDisabled());
    expect(document.querySelector("#add-detection-btn")).toBeDisabled();
    fireEvent.click(screen.getByText("draw new"));
    expect(shown()).toHaveLength(1);
    const saved = { id: "media-1", detections: [{ ...detection, bbox: { x: 0.2, y: 0.2, w: 0.4, h: 0.4 } }] };
    await act(async () => { finish(saved); });
    await waitFor(() => expect(screen.getByText("draw new")).toBeEnabled());
    expect(client.getQueryData(["media", "media-1"])).toEqual(saved);
  });

  it("preserves the draft after a failed save and permits retry", async () => {
    patch.mockRejectedValueOnce(new Error("Network unavailable"));
    setup();
    fireEvent.click(screen.getByText("resize first"));
    save();
    await waitFor(() => expect(document.querySelector("#save-detections-btn")).toBeEnabled());
    expect(shown()[0].bbox.w).toBe(0.4);
  });

  it("isolates local drafts from background refetches and from other records", () => {
    const { rerender } = setup();
    fireEvent.click(screen.getByText("draw new"));
    rerender(<DetectionsDisplay {...props} detections={[{ ...detection, label: "Metal" }]} />);
    expect(shown()).toHaveLength(2);
    expect(shown()[0].label).toBe("Trash");
    rerender(<DetectionsDisplay {...props} mediaId="media-2" detections={[]} />);
    expect(shown()).toHaveLength(0);
    expect(document.querySelector("#save-detections-btn")).toBeDisabled();
  });
});
