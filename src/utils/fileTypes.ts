const VIDEO_CONTENT_TYPE_BY_EXTENSION: Record<string, string> = {
  mp4: "video/mp4",
  webm: "video/webm",
  ogg: "video/ogg",
  ogv: "video/ogg",
};

export const getVideoContentType = (file: Pick<File, "name" | "type">): string => {
  if (file.type && file.type !== "application/octet-stream") return file.type;
  const extension = file.name.split(".").pop()?.toLowerCase() || "";
  return VIDEO_CONTENT_TYPE_BY_EXTENSION[extension] || "application/octet-stream";
};

export const isVideoFile = (file: Pick<File, "name" | "type">): boolean =>
  getVideoContentType(file).startsWith("video/");
