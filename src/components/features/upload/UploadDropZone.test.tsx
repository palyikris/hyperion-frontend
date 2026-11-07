import { act, fireEvent, render, screen } from "@testing-library/react";
import type { HTMLAttributes, PropsWithChildren } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import axios from "axios";
import type { FileUploadProgress } from "../../../types/upload";
import UploadDropZone from "./UploadDropZone";

const { images, videos, notify } = vi.hoisted(() => ({ images: vi.fn(), videos: vi.fn(), notify: vi.fn() }));
vi.mock("../../../hooks/upload/useUploadFiles", () => ({ useUploadFiles: () => ({ mutateAsync: images }) }));
vi.mock("../../../hooks/upload/useUploadVideoChunked", () => ({ useUploadVideoChunked: () => ({ mutateAsync: videos }) }));
vi.mock("../../../services/toastService", () => ({ toastService: { error: notify } }));
vi.mock("../../shared/animation/ScrollReveal", () => ({
  ScrollReveal: ({ children }: PropsWithChildren) => <div>{children}</div>,
}));
vi.mock("../../shared/animation/MorphBox", () => ({
  MorphBox: ({ children, onDrop, onDragOver, onDragLeave }: HTMLAttributes<HTMLDivElement>) =>
    <div data-testid="drop-zone" onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave}>{children}</div>,
}));
vi.mock("../../shared/Button", () => ({
  Button: ({ text, onClick, disabled }: { text: string; onClick?: () => void; disabled?: boolean }) =>
    <button onClick={onClick} disabled={disabled}>{text}</button>,
}));

function deferred() {
  let resolve!: (value?: unknown) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise((done, fail) => { resolve = done; reject = fail; });
  return { promise, resolve, reject };
}
const first = new File(["one"], "one.jpg", { type: "image/jpeg" });
const second = new File(["two"], "two.jpg", { type: "image/jpeg" });

function select(container: HTMLElement, files: File[]) {
  fireEvent.change(container.querySelector("input[type=file]")!, { target: { files } });
}
function progress(update: FileUploadProgress, call = 0) {
  act(() => { images.mock.calls[call][0].onProgress(update); });
}
function bar(name: string) { return screen.getByRole("progressbar", { name }); }

beforeEach(() => {
  vi.resetAllMocks();
  images.mockImplementation(() => new Promise(() => {}));
  videos.mockImplementation(() => new Promise(() => {}));
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => { vi.restoreAllMocks(); });

describe("per-file progress and upload selection", () => {
  it("displays independent progress instead of copying one batch percentage to every file", () => {
    const { container } = render(<UploadDropZone />);
    select(container, [first, second]);
    fireEvent.click(screen.getByRole("button", { name: "nav.main.upload" }));
    progress({ index: 0, progress: 20, status: "uploading" });
    progress({ index: 1, progress: 70, status: "uploading" });
    expect(bar("one.jpg")).toHaveAttribute("aria-valuenow", "20");
    expect(bar("two.jpg")).toHaveAttribute("aria-valuenow", "70");
    progress({ index: 0, progress: 100, status: "uploading" });
    expect(bar("one.jpg")).toHaveAttribute("aria-valuetext", "100%");
    progress({ index: 0, progress: 100, status: "completed" });
    expect(bar("one.jpg")).toHaveAttribute("aria-valuetext", "upload.status.uploaded");
    expect(bar("two.jpg")).toHaveAttribute("aria-valuenow", "70");
  });

  it("preserves successful files on partial failure and retries only the failed file", async () => {
    const failed = deferred();
    images.mockReturnValueOnce(failed.promise);
    const { container } = render(<UploadDropZone />);
    select(container, [first, second]);
    fireEvent.click(screen.getByRole("button", { name: "nav.main.upload" }));
    progress({ index: 0, progress: 100, status: "completed" });
    progress({ index: 1, progress: 30, status: "error", error: "Network unavailable" });
    await act(async () => { failed.reject(new AggregateError([], "Upload failed")); });
    expect(bar("one.jpg")).toHaveAttribute("aria-valuetext", "upload.status.uploaded");
    expect(bar("two.jpg")).toHaveAttribute("aria-valuetext", "upload.status.failed");
    fireEvent.click(screen.getByRole("button", { name: "nav.main.upload" }));
    expect(images.mock.calls[1][0].files).toEqual([second]);
    progress({ index: 0, progress: 40, status: "uploading" }, 1);
    expect(bar("one.jpg")).toHaveAttribute("aria-valuenow", "100");
    expect(bar("two.jpg")).toHaveAttribute("aria-valuenow", "40");
  });

  it("ignores drops, file changes and removal while a transfer is preparing or uploading", () => {
    const onFilesSelected = vi.fn();
    const { container } = render(<UploadDropZone onFilesSelected={onFilesSelected} />);
    select(container, [first]);
    fireEvent.click(screen.getByRole("button", { name: "nav.main.upload" }));
    expect(screen.getByTitle("Remove")).toBeDisabled();
    fireEvent.drop(screen.getByTestId("drop-zone"), { dataTransfer: { files: [second] } });
    select(container, [second]);
    fireEvent.click(screen.getByTitle("Remove"));
    expect(screen.getByText("one.jpg")).toBeInTheDocument();
    expect(screen.queryByText("two.jpg")).not.toBeInTheDocument();
    expect(onFilesSelected).toHaveBeenCalledTimes(1);
    expect(images.mock.calls[0][0].files).toEqual([first]);
  });

  it("also ignores dropped files when the component is externally disabled", () => {
    const onFilesSelected = vi.fn();
    render(<UploadDropZone disabled onFilesSelected={onFilesSelected} />);
    fireEvent.drop(screen.getByTestId("drop-zone"), { dataTransfer: { files: [first] } });
    expect(onFilesSelected).not.toHaveBeenCalled();
    expect(screen.queryByText("one.jpg")).not.toBeInTheDocument();
  });

  it.each(["clip.MP4", "clip.webm", "clip.ogg", "clip.ogv"])(
    "routes %s with missing MIME metadata to the chunked video uploader",
    (name) => {
      const file = new File(["video"], name);
      const { container } = render(<UploadDropZone multiple={false} accept="video/mp4,video/webm,video/ogg" />);
      select(container, [file]);
      fireEvent.click(screen.getByRole("button", { name: "nav.main.upload" }));
      expect(videos).toHaveBeenCalledOnce();
      expect(videos.mock.calls[0][0].file).toBe(file);
      expect(images).not.toHaveBeenCalled();
    },
  );

  it("ignores stale callbacks after cancellation and keeps already completed file states", async () => {
    const old = deferred();
    images.mockReturnValueOnce(old.promise);
    const { container } = render(<UploadDropZone />);
    select(container, [first, second]);
    fireEvent.click(screen.getByRole("button", { name: "nav.main.upload" }));
    progress({ index: 0, progress: 100, status: "completed" });
    fireEvent.click(screen.getByRole("button", { name: "upload.uploadCancel" }));
    expect(bar("one.jpg")).toHaveAttribute("aria-valuetext", "upload.status.uploaded");
    expect(bar("two.jpg")).toHaveAttribute("aria-valuetext", "upload.status.cancelled");
    expect(images.mock.calls[0][0].signal.aborted).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "nav.main.upload" }));
    progress({ index: 0, progress: 10, status: "uploading" }, 1);
    progress({ index: 1, progress: 90, status: "uploading" }, 0);
    await act(async () => { old.reject(new axios.CanceledError()); });
    expect(bar("two.jpg")).toHaveAttribute("aria-valuenow", "10");
    expect(screen.getByRole("button", { name: "upload.uploadCancel" })).toBeInTheDocument();
  });

  it("waits for the video's completion response before showing success at 100 percent", async () => {
    const complete = deferred();
    videos.mockReturnValueOnce(complete.promise);
    const { container } = render(<UploadDropZone multiple={false} />);
    select(container, [new File(["video"], "clip.mp4", { type: "video/mp4" })]);
    fireEvent.click(screen.getByRole("button", { name: "nav.main.upload" }));
    act(() => { videos.mock.calls[0][0].onProgress(100); });
    expect(bar("clip.mp4")).toHaveAttribute("aria-valuetext", "100%");
    await act(async () => { complete.resolve(); });
    expect(bar("clip.mp4")).toHaveAttribute("aria-valuetext", "upload.status.uploaded");
  });

  it("does not reuse a completed file's state when a single-file selection is replaced", async () => {
    const complete = deferred();
    videos.mockReturnValueOnce(complete.promise);
    const { container } = render(<UploadDropZone multiple={false} />);
    select(container, [new File(["old"], "old.mp4")]);
    fireEvent.click(screen.getByRole("button", { name: "nav.main.upload" }));
    await act(async () => { complete.resolve(); });
    fireEvent.click(screen.getByRole("button", { name: "upload.uploadCancel" }));
    const next = new File(["new"], "new.mp4");
    select(container, [next]);
    fireEvent.click(screen.getByRole("button", { name: "nav.main.upload" }));
    expect(videos).toHaveBeenCalledTimes(2);
    expect(videos.mock.calls[1][0].file).toBe(next);
    expect(bar("new.mp4")).toHaveAttribute("aria-valuenow", "0");
    expect(bar("new.mp4")).not.toHaveAttribute("aria-valuetext", "upload.status.uploaded");
  });
});
