import { beforeEach, describe, expect, expectTypeOf, it, vi } from "vitest";
import type { VideoDetectionResponse } from "../types/lab";
import type { GalleryItem, VaultResponse } from "../types/upload";
import { vaultService } from "./vaultService";

const { get } = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("../api/axiosInstance", () => ({ api: { get } }));

beforeEach(() => { get.mockReset(); });

const image: GalleryItem = {
  id: "image-id", uploader_id: "user-id", status: "READY", hf_path: "media/image.jpg",
  created_at: "2026-10-31T12:00:00Z", updated_at: "2026-10-31T12:00:00Z",
};
const video: VideoDetectionResponse = {
  id: "video-detection-id", media_id: "video-id", filename: "video.mp4",
  label: "plastic", confidence: 0.8, bbox: { x: 0, y: 0, w: 1, h: 1 },
  timestamp_in_video: 12.75, frame_hf_path: "media/frame.jpg",
  created_at: "2026-10-31T12:00:00Z",
};

describe("Vault response contract", () => {
  it("uses the shared response type with both item lists", () => {
    expectTypeOf<ReturnType<typeof vaultService.getVaultItems>>()
      .toEqualTypeOf<Promise<VaultResponse>>();
    expectTypeOf<VaultResponse["image_items"]>().toEqualTypeOf<GalleryItem[]>();
    expectTypeOf<VaultResponse["video_items"]>().toEqualTypeOf<VideoDetectionResponse[]>();
    expectTypeOf<"items" extends keyof VaultResponse ? true : false>().toEqualTypeOf<false>();
  });

  it.each([
    { name: "empty", image_items: [], video_items: [] },
    { name: "images only", image_items: [image], video_items: [] },
    { name: "videos only", image_items: [], video_items: [video] },
    { name: "mixed", image_items: [image], video_items: [video] },
  ])("preserves the paginated $name response", async (items) => {
    const total = items.image_items.length + items.video_items.length;
    const response: VaultResponse = {
      total, page: 1, page_size: 10, total_pages: total ? 1 : 0,
      image_items: items.image_items, video_items: items.video_items,
    };
    const params = { search: "test", page: 1, page_size: 10 };
    get.mockResolvedValueOnce({ data: response });

    const result = await vaultService.getVaultItems(params);

    expect(result).toEqual(response);
    expect(result).not.toHaveProperty("items");
    expect(get).toHaveBeenCalledWith("/vault", { params });
  });
});
