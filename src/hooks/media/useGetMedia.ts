import { useQuery } from "@tanstack/react-query";
import { mediaService } from "../../services/mediaService";

export const useGetMedia = (mediaId?: string) => {
  return useQuery({
    queryKey: ["media", mediaId],
    queryFn: () => {
      if (!mediaId) throw new Error("Media ID is required");
      return mediaService.getMedia(mediaId);
    },
    enabled: !!mediaId,
    refetchOnWindowFocus: false,
  });
};
