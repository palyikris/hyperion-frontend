import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mediaService } from "../../services/mediaService";
import type { MediaPatchRequest } from "../../types/lab";
import { toastService } from "../../services/toastService";
import i18n from "i18next";

export const useUpdateMedia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      mediaId,
      patchData,
    }: {
      mediaId: string;
      patchData: MediaPatchRequest;
    }) => mediaService.patchMedia(mediaId, patchData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["media", variables.mediaId],
      });
      toastService.success(i18n.t("media.toast.updateSuccess"));
    },
    onError: () => {
      toastService.error(i18n.t("media.toast.updateError"));
    },
  });
};
