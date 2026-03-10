const THUMBNAIL_TOKEN = "_thumbnail_";

export const HYPERION_MEDIA_BASE_URL =
  "https://huggingface.co/datasets/palyikris/hyperion-media/resolve/main";

export const getMediaAssetUrl = (assetPath?: string | null): string => {
  if (!assetPath) {
    return "";
  }

  return `${HYPERION_MEDIA_BASE_URL}/${assetPath.replace(/^\/+/, "")}`;
};

export const getFullResUrl = (thumbnailUrl: string): string => {
  if (!thumbnailUrl || !thumbnailUrl.includes(THUMBNAIL_TOKEN)) {
    return thumbnailUrl;
  }

  return thumbnailUrl.replace(THUMBNAIL_TOKEN, "_");
};