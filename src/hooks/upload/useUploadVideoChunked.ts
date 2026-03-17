import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadService } from "../../services/uploadService";

interface UseUploadVideoChunkedArgs {
  file: File;
  onProgress?: (progress: number) => void;
  signal?: AbortSignal;
}

export const useUploadVideoChunked = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, onProgress, signal }: UseUploadVideoChunkedArgs) =>
      uploadService.uploadVideoChunked(file, onProgress, signal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["upload", "recent-gallery"] });
    },
  });
};
