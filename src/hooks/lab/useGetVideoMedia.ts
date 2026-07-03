import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { mediaService } from "../../services/mediaService";

export const useGetVideoMedia = (mediaId?: string, options?: Partial<UseQueryOptions>) => {
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
