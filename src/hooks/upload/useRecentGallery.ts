import { useQuery } from "@tanstack/react-query";
import { uploadService } from "../../services/uploadService";

export const useRecentGallery = () => {
  return useQuery({
    queryKey: ["upload", "recent-gallery"],
    queryFn: uploadService.getRecentGallery,
    refetchOnWindowFocus: false,
  });
};
