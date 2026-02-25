import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadService } from "../../services/uploadService";

export const useUploadFiles = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      files,
      onProgress,
      signal,
    }: {
      files: File[];
      onProgress?: (progress: number) => void;
      signal?: AbortSignal;
    }) => uploadService.uploadFiles(files, onProgress, signal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["upload", "recent-gallery"] });
    },
  });
};
