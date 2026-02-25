import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadService } from "../../services/uploadService";

export const useUploadFiles = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      files,
      onProgress,
    }: {
      files: File[];
      onProgress?: (progress: number) => void;
    }) => uploadService.uploadFiles(files, onProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["upload", "recent-gallery"] });
    },
  });
};
