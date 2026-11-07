import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mediaService } from "../../services/mediaService";
import type { MediaPatchRequest } from "../../types/lab";
import { toastService } from "../../services/toastService";
import i18n from "i18next";

export const useUpdateMedia = (mediaId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["lab", "update", mediaId],
    mutationFn: ({
      mediaId,
      patchData,
    }: {
      mediaId: string;
      patchData: MediaPatchRequest;
    }) => mediaService.patchMedia(mediaId, patchData),
    onSuccess: async (data, variables) => {
      const detailKey = [variables.patchData.item_type === "image" ? "media" : "video", variables.mediaId];
      await queryClient.cancelQueries({ queryKey: detailKey });
      if (data) queryClient.setQueryData(detailKey, data);
      const updates = [
        queryClient.invalidateQueries({ queryKey: ["media", variables.mediaId] }),
        queryClient.invalidateQueries({ queryKey: ["video", variables.mediaId] }),
      ];
      for (const queryKey of [
        ["vault"],
        ["upload", "recent-gallery"],
        ["map-data"],
        ["map-logs"],
        ["stats"],
      ]) {
        updates.push(queryClient.invalidateQueries({ queryKey }));
      }
      await Promise.all(updates);
      toastService.success(i18n.t("media.toast.updateSuccess"));
    },
    onError: () => {
      toastService.error(i18n.t("media.toast.updateError"));
    },
  });
};
