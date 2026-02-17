import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadService } from "../../services/uploadService";

export const useUploadFiles = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadService.uploadFiles,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["upload", "recent-gallery"] });
    },
  });
};
