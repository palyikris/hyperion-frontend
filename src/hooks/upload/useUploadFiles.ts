import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadService } from "../../services/uploadService";
import type { FileUploadProgress } from "../../types/upload";

export const useUploadFiles = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      files,
      onProgress,
      signal,
    }: {
      files: File[];
      onProgress?: (update: FileUploadProgress) => void;
      signal?: AbortSignal;
    }) => uploadService.uploadFiles(files, onProgress, signal),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["upload", "recent-gallery"] });
    },
  });
};
