import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { mediaService } from "../../services/mediaService";
import type { VideoDetectionResponse } from "../../types/lab";

export const useGetVideoMedia = (mediaId?: string, options?: Partial<UseQueryOptions<VideoDetectionResponse>>) => {
  return useQuery({
    queryKey: ["video", mediaId],
    queryFn: () => {
      if (!mediaId) throw new Error("Media ID is required");
      return mediaService.getVideoMedia(mediaId);
    },
    enabled: !!mediaId,
    refetchOnWindowFocus: false,
    retry: 1,
    ...options,
  });
};
