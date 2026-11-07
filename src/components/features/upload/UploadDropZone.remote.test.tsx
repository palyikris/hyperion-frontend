import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { HTMLAttributes, ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import UploadDropZone from "./UploadDropZone";

const { mutateAsync, videoMutateAsync, toastError } = vi.hoisted(() => ({
  mutateAsync: vi.fn(), videoMutateAsync: vi.fn(), toastError: vi.fn(),
}));
vi.mock("../../../hooks/upload/useUploadFiles", () => ({ useUploadFiles: () => ({ mutateAsync }) }));
vi.mock("../../../hooks/upload/useUploadVideoChunked", () => ({
  useUploadVideoChunked: () => ({ mutateAsync: videoMutateAsync }),
}));
vi.mock("../../../services/toastService", () => ({ toastService: { error: toastError } }));
vi.mock("../../shared/animation/ScrollReveal", () => ({
  ScrollReveal: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));
vi.mock("../../shared/animation/MorphBox", () => ({
  MorphBox: ({ children, onDrop, onDragOver, onDragLeave }: HTMLAttributes<HTMLDivElement>) =>
    <div data-testid="drop-zone" onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave}>{children}</div>,
}));
vi.mock("../../shared/Button", () => ({
  Button: ({ text, onClick, disabled }: { text: string; onClick?: () => void; disabled?: boolean }) =>
    <button onClick={onClick} disabled={disabled}>{text}</button>,
}));

const image = (name = "photo.jpg") => new File(["image"], name, { type: "image/jpeg" });
const input = () => screen.getByLabelText("upload.dropzone.heading") as HTMLInputElement;
const choose = (files: File[]) => fireEvent.change(input(), { target: { files } });
const drop = (files: File[]) => fireEvent.drop(screen.getByTestId("drop-zone"), { dataTransfer: { files } });
const start = () => fireEvent.click(screen.getByRole("button", { name: "nav.main.upload" }));

beforeEach(() => {
  vi.resetAllMocks();
});

describe("upload file selection", () => {
  it("validates dropped files and keeps supported nonempty images", () => {
    render(<UploadDropZone />);
    const large = image("large.jpg");
    Object.defineProperty(large, "size", { value: 50 * 1024 * 1024 + 1 });
    drop([image(), new File(["video"], "video.mp4", { type: "video/mp4" }),
      new File([], "empty.png", { type: "image/png" }), large]);
    expect(screen.getByText("photo.jpg")).toBeInTheDocument();
    expect(screen.queryByText("video.mp4")).not.toBeInTheDocument();
    expect(screen.queryByText("empty.png")).not.toBeInTheDocument();
    expect(screen.queryByText("large.jpg")).not.toBeInTheDocument();
    expect(toastError).toHaveBeenCalledTimes(3);
  });

  it("supports .tif and case-insensitive extensions", () => {
    render(<UploadDropZone />);
    choose([new File(["tiff"], "photo.TIF", { type: "image/tiff" })]);
    expect(screen.getByText("photo.TIF")).toBeInTheDocument();
  });

  it("allows choosing the same file again after removing it", async () => {
    const user = userEvent.setup();
    render(<UploadDropZone />);
    const file = image();
    await user.upload(input(), file);
    await user.click(screen.getByRole("button", { name: "Remove" }));
    await user.upload(input(), file);
    expect(screen.getByText(file.name)).toBeInTheDocument();
  });

  it("ignores drops and disables an existing selection when disabled", () => {
    const { rerender } = render(<UploadDropZone />);
    choose([image()]);
    rerender(<UploadDropZone disabled />);
    drop([image("extra.jpg")]);
    expect(screen.queryByText("extra.jpg")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "nav.main.upload" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Remove" })).toBeDisabled();
  });
});

describe("upload request lifecycle", () => {
  it("locks the selection during preparation and waits for server acceptance at 100%", async () => {
    let finish!: () => void;
    mutateAsync.mockImplementation(() => new Promise<void>((resolve) => { finish = resolve; }));
    render(<UploadDropZone />);
    choose([image()]);
    start();
    expect(screen.getByRole("button", { name: "Remove" })).toBeDisabled();
    drop([image("extra.jpg")]);
    expect(screen.queryByText("extra.jpg")).not.toBeInTheDocument();
    act(() => mutateAsync.mock.calls[0][0].onProgress({ index: 0, progress: 100, status: "uploading" }));
    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(screen.queryByText("upload.status.uploaded")).not.toBeInTheDocument();
    act(() => mutateAsync.mock.calls[0][0].onProgress({ index: 0, progress: 100, status: "completed" }));
    await act(async () => finish());
    expect(screen.getByText("upload.status.uploaded")).toBeInTheDocument();
  });

  it("ignores a cancelled request's late callbacks after retrying", async () => {
    let finishFirst!: () => void;
    mutateAsync.mockImplementationOnce(() => new Promise<void>((resolve) => { finishFirst = resolve; }));
    mutateAsync.mockImplementationOnce(() => new Promise(() => {}));
    render(<UploadDropZone />);
    choose([image()]);
    start();
    const first = mutateAsync.mock.calls[0][0];
    fireEvent.click(screen.getByRole("button", { name: "upload.uploadCancel" }));
    expect(first.signal.aborted).toBe(true);
    start();
    act(() => first.onProgress({ index: 0, progress: 90, status: "uploading" }));
    await act(async () => finishFirst());
    expect(screen.queryByText("90%")).not.toBeInTheDocument();
    expect(screen.queryByText("upload.status.uploaded")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "upload.uploadCancel" })).toBeInTheDocument();
  });

  it("shows one error and allows removing a failed image", async () => {
    mutateAsync.mockImplementation(({ onProgress }) => {
      onProgress({ index: 0, progress: 0, status: "error", error: "Network failure" });
      return Promise.reject(new Error("Network failure"));
    });
    render(<UploadDropZone />);
    choose([image()]);
    start();
    await waitFor(() => expect(screen.getByText("upload.status.failed")).toBeInTheDocument());
    expect(toastError).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.getByRole("button", { name: "Remove" })).toBeEnabled());
    fireEvent.click(screen.getByRole("button", { name: "Remove" }));
    expect(screen.queryByText("photo.jpg")).not.toBeInTheDocument();
  });

  it("aborts preparation when leaving the page", () => {
    mutateAsync.mockImplementation(() => new Promise(() => {}));
    const { unmount } = render(<UploadDropZone />);
    choose([image()]);
    start();
    const signal = mutateAsync.mock.calls[0][0].signal;
    unmount();
    expect(signal.aborted).toBe(true);
  });

  it("still routes a single video through the chunked upload service", async () => {
    videoMutateAsync.mockResolvedValue({});
    render(<UploadDropZone multiple={false} accept="video/mp4" />);
    choose([new File(["video"], "video.mp4", { type: "video/mp4" })]);
    start();
    await waitFor(() => expect(videoMutateAsync).toHaveBeenCalledOnce());
    expect(mutateAsync).not.toHaveBeenCalled();
  });
});
