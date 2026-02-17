import { useQuery } from "@tanstack/react-query";
import { uploadService } from "../../services/uploadService";

export const useRecentGallery = () => {
  return useQuery({
    queryKey: ["upload", "recent-gallery"],
    queryFn: uploadService.getRecentGallery,
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: false,
  });
};
