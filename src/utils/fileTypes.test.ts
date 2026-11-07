import { describe, expect, it } from "vitest";
import { getVideoContentType, isVideoFile } from "./fileTypes";

describe("video type recognition", () => {
  it.each([
    ["clip.MP4", "video/mp4"], ["clip.webm", "video/webm"],
    ["clip.ogg", "video/ogg"], ["clip.ogv", "video/ogg"],
  ])("recognizes %s when the MIME type is missing or generic", (name, expected) => {
    for (const type of ["", "application/octet-stream"]) {
      const file = new File(["video"], name, { type });
      expect(isVideoFile(file)).toBe(true);
      expect(getVideoContentType(file)).toBe(expected);
    }
  });

  it("does not override a specific non-video MIME type based only on the extension", () => {
    expect(isVideoFile(new File(["image"], "image.mp4", { type: "image/jpeg" }))).toBe(false);
    expect(isVideoFile(new File(["image"], "image.jpg"))).toBe(false);
  });
});
