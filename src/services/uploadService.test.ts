import { beforeEach, describe, expect, it, vi } from "vitest";
import { waitFor } from "@testing-library/react";
import axios from "axios";
import { uploadService } from "./uploadService";

const { post, remove, compress } = vi.hoisted(() => ({
  post: vi.fn(), remove: vi.fn(), compress: vi.fn(),
}));
vi.mock("../api/axiosInstance", () => ({ api: { post, delete: remove } }));
vi.mock("browser-image-compression", () => ({ default: compress }));
vi.mock("./toastService", () => ({ toastService: { error: vi.fn() } }));

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((done, fail) => { resolve = done; reject = fail; });
  return { promise, resolve, reject };
}
const image = (name: string) => new File(["image"], name, { type: "image/jpeg" });
const video = (chunks = 1) => new File([new Uint8Array(chunks * 2 * 1024 * 1024)], "video.mp4", { type: "video/mp4" });

beforeEach(() => {
  vi.resetAllMocks();
  compress.mockImplementation(async (file: File) => file);
  remove.mockResolvedValue({ data: {} });
});

describe("individual image uploads", () => {
  it("sends one request per file and reports independent progress and completion", async () => {
    const gates = [deferred<{ data: { media_ids: string[] } }>(), deferred<{ data: { media_ids: string[] } }>()];
    const progress = vi.fn();
    post.mockImplementation((_url, body: FormData) => gates[(body.get("files") as File).name === "one.jpg" ? 0 : 1].promise);
    const pending = uploadService.uploadFiles([image("one.jpg"), image("two.jpg")], progress);
    await waitFor(() => expect(post).toHaveBeenCalledTimes(2));
    for (const [, body] of post.mock.calls) expect((body as FormData).getAll("files")).toHaveLength(1);
    post.mock.calls[0][2].onUploadProgress({ loaded: 20, total: 100 });
    post.mock.calls[1][2].onUploadProgress({ loaded: 70, total: 100 });
    expect(progress).toHaveBeenCalledWith({ index: 0, progress: 20, status: "uploading" });
    expect(progress).toHaveBeenCalledWith({ index: 1, progress: 70, status: "uploading" });
    post.mock.calls[0][2].onUploadProgress({ loaded: 100, total: 100 });
    expect(progress).not.toHaveBeenCalledWith(expect.objectContaining({ status: "completed" }));
    gates[0].resolve({ data: { media_ids: ["one"] } });
    await waitFor(() => expect(progress).toHaveBeenCalledWith({ index: 0, progress: 100, status: "completed" }));
    expect(progress).not.toHaveBeenCalledWith(expect.objectContaining({ index: 1, status: "completed" }));
    gates[1].resolve({ data: { media_ids: ["two"] } });
    await expect(pending).resolves.toMatchObject({ media_ids: ["one", "two"] });
  });

  it("keeps successful file results and continues the queue when another file fails", async () => {
    const progress = vi.fn();
    post.mockImplementation(async (_url, body: FormData) => {
      const name = (body.get("files") as File).name;
      if (name === "bad.jpg") throw new Error("File rejected");
      return { data: { media_ids: [name] } };
    });
    await expect(uploadService.uploadFiles([
      image("one.jpg"), image("bad.jpg"), image("three.jpg"), image("four.jpg"), image("five.jpg"),
    ], progress)).rejects.toBeInstanceOf(AggregateError);
    expect(post).toHaveBeenCalledTimes(5);
    expect(progress).toHaveBeenCalledWith(expect.objectContaining({ index: 1, status: "error", error: "File rejected" }));
    for (const index of [0, 2, 3, 4]) {
      expect(progress).toHaveBeenCalledWith({ index, progress: 100, status: "completed" });
      expect(progress).not.toHaveBeenCalledWith(expect.objectContaining({ index, status: "error" }));
    }
  });

  it("limits simultaneous file transfers to four", async () => {
    const gate = deferred<{ data: { media_ids: string[] } }>();
    post.mockReturnValue(gate.promise);
    const pending = uploadService.uploadFiles(Array.from({ length: 6 }, (_, index) => image(`${index}.jpg`)));
    await waitFor(() => expect(post).toHaveBeenCalledTimes(4));
    gate.resolve({ data: { media_ids: ["id"] } });
    await pending;
    expect(post).toHaveBeenCalledTimes(6);
  });

  it("forwards cancellation to compression and does not start HTTP requests afterwards", async () => {
    const controller = new AbortController();
    compress.mockImplementation((_file, options: { signal: AbortSignal }) => new Promise((_resolve, reject) => {
      expect(options.signal).toBe(controller.signal);
      options.signal.addEventListener("abort", () => reject(new axios.CanceledError()), { once: true });
    }));
    const pending = uploadService.uploadFiles([image("one.jpg")], undefined, controller.signal);
    const rejected = expect(pending).rejects.toSatisfy(axios.isCancel);
    controller.abort();
    await rejected;
    expect(post).not.toHaveBeenCalled();
  });
});

describe("chunked video failure cleanup", () => {
  it("retries a failed chunk twice, then requests cleanup and preserves the original error", async () => {
    const failure = new Error("Chunk transfer failed");
    post.mockImplementation(async (url: string) => {
      if (url.endsWith("/init")) return { data: { media_id: "media-1" } };
      throw failure;
    });
    await expect(uploadService.uploadVideoChunked(video())).rejects.toBe(failure);
    expect(post).toHaveBeenCalledTimes(4);
    expect(remove).toHaveBeenCalledOnce();
    expect(remove).toHaveBeenCalledWith("/upload/video/cancel/media-1");
    expect(post.mock.calls.some(([url]) => String(url).includes("/complete/"))).toBe(false);
  });

  it("aborts and waits for parallel chunk requests before requesting cleanup", async () => {
    const failure = new Error("Chunk transfer failed");
    const releaseSibling = deferred<void>();
    let siblingSignal: AbortSignal | undefined;
    post.mockImplementation(async (url: string, body: FormData, config: { signal: AbortSignal }) => {
      if (url.endsWith("/init")) return { data: { media_id: "media-1" } };
      if (body.get("chunk_index") === "0") throw failure;
      siblingSignal = config.signal;
      await releaseSibling.promise;
      return { data: {} };
    });
    const pending = uploadService.uploadVideoChunked(video(2));
    const rejected = expect(pending).rejects.toBe(failure);
    await waitFor(() => expect(siblingSignal?.aborted).toBe(true));
    expect(remove).not.toHaveBeenCalled();
    releaseSibling.resolve();
    await rejected;
    expect(remove).toHaveBeenCalledOnce();
  });

  it("cleans up a user-cancelled transfer without retrying it", async () => {
    const controller = new AbortController();
    post.mockImplementation(async (url: string) => {
      if (url.endsWith("/init")) return { data: { media_id: "media-1" } };
      controller.abort();
      throw new axios.CanceledError();
    });
    await expect(uploadService.uploadVideoChunked(video(), undefined, controller.signal)).rejects.toSatisfy(axios.isCancel);
    expect(post).toHaveBeenCalledTimes(2);
    expect(remove).toHaveBeenCalledWith("/upload/video/cancel/media-1");
  });

  it("does not attempt cleanup without an initialized media identifier", async () => {
    post.mockRejectedValue(new Error("Init failed"));
    await expect(uploadService.uploadVideoChunked(video())).rejects.toThrow("Init failed");
    expect(remove).not.toHaveBeenCalled();
  });

  it("assembles the video after all chunks succeed and does not cancel a successful upload", async () => {
    post.mockImplementation(async (url: string) => ({ data: url.endsWith("/init")
      ? { media_id: "media-1" } : { status: "complete" } }));
    await expect(uploadService.uploadVideoChunked(video(2))).resolves.toEqual({ status: "complete" });
    expect(post.mock.lastCall?.[0]).toBe("/upload/video/complete/media-1");
    expect(remove).not.toHaveBeenCalled();
  });
});
