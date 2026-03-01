const THUMBNAIL_TOKEN = "_thumbnail_";

export const getFullResUrl = (thumbnailUrl: string): string => {
  if (!thumbnailUrl || !thumbnailUrl.includes(THUMBNAIL_TOKEN)) {
    return thumbnailUrl;
  }

  return thumbnailUrl.replace(THUMBNAIL_TOKEN, "_");
};