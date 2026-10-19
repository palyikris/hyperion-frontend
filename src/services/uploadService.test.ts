import { beforeEach, describe, expect, it, vi } from "vitest";
import axios from "axios";
import imageCompression from "browser-image-compression";
import { api } from "../api/axiosInstance";
import { toastService } from "./toastService";
import { uploadService } from "./uploadService";

vi.mock("../api/axiosInstance", () => ({ api: { post: vi.fn() } }));
vi.mock("browser-image-compression", () => ({ default: vi.fn() }));
vi.mock("./toastService", () => ({ toastService: { error: vi.fn() } }));
vi.mock("i18next", () => ({ default: { t: (key: string) => key } }));

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(api.post).mockResolvedValue({ data: { media_ids: ["image-1"] } });
});

describe("image upload preparation", () => {
  it("does not start compression or a request when already cancelled", async () => {
    const controller = new AbortController();
    controller.abort();
    await expect(uploadService.uploadFiles(
      [new File(["image"], "photo.jpg", { type: "image/jpeg" })], undefined, controller.signal,
    )).rejects.toSatisfy(axios.isCancel);
    expect(imageCompression).not.toHaveBeenCalled();
    expect(api.post).not.toHaveBeenCalled();
  });

  it("passes cancellation through compression without a misleading error toast", async () => {
    const controller = new AbortController();
    vi.mocked(imageCompression).mockImplementation(async (_file, options) => {
      expect(options?.signal).toBe(controller.signal);
      controller.abort();
      throw new Error("Compression aborted");
    });
    await expect(uploadService.uploadFiles(
      [new File(["image"], "photo.jpg", { type: "image/jpeg" })], undefined, controller.signal,
    )).rejects.toSatisfy(axios.isCancel);
    expect(toastService.error).not.toHaveBeenCalled();
    expect(api.post).not.toHaveBeenCalled();
  });

  it("does not send prepared files if cancellation happened while awaiting compression", async () => {
    const controller = new AbortController();
    const file = new File(["image"], "photo.jpg", { type: "image/jpeg" });
    vi.mocked(imageCompression).mockImplementation(async () => {
      controller.abort();
      return file;
    });
    await expect(uploadService.uploadFiles([file], undefined, controller.signal))
      .rejects.toSatisfy(axios.isCancel);
    expect(api.post).not.toHaveBeenCalled();
  });

  it("uploads TIFF directly instead of attempting unsupported browser compression", async () => {
    const file = new File(["tiff"], "photo.tif", { type: "image/tiff" });
    await uploadService.uploadFiles([file]);
    expect(imageCompression).not.toHaveBeenCalled();
    const body = vi.mocked(api.post).mock.calls[0][1] as FormData;
    expect((body.get("files") as File).name).toBe("photo.tif");
    expect(toastService.error).not.toHaveBeenCalled();
  });

  it("retains the compressed MIME type and original filename and modification time", async () => {
    const file = new File(["image"], "photo.png", { type: "image/png", lastModified: 123 });
    vi.mocked(imageCompression).mockResolvedValue(new File(["jpeg"], "blob", { type: "image/jpeg" }));
    await uploadService.uploadFiles([file]);
    const body = vi.mocked(api.post).mock.calls[0][1] as FormData;
    const uploaded = body.get("files") as File;
    expect(uploaded.name).toBe(file.name);
    expect(uploaded.type).toBe("image/jpeg");
    expect(uploaded.lastModified).toBe(123);
  });
});
