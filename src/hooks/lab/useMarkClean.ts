import { useMutation, useQueryClient } from "@tanstack/react-query";
import i18n from "i18next";
import { mediaService } from "../../services/mediaService";
import { toastService } from "../../services/toastService";
import type { VideoDetectionResponse } from "../../types/lab";

export const useMarkClean = (labId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    // Share the lab editing lock with detection and location saves.
    mutationKey: ["lab", "update", labId],
    mutationFn: ({ mediaId, detectionId }: { mediaId: string; detectionId?: string }) =>
      mediaService.markClean(mediaId, detectionId),
    onSuccess: async (_, { mediaId, detectionId }) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: ["media", mediaId] }),
        queryClient.cancelQueries({ queryKey: ["video"] }),
      ]);
      for (const [queryKey, video] of queryClient.getQueriesData<VideoDetectionResponse>({ queryKey: ["video"] })) {
        if (video?.media_id === mediaId && (!detectionId || video.id === detectionId)) {
          queryClient.removeQueries({ queryKey, exact: true });
        }
      }
      await Promise.all([
        ["media", mediaId], ["video"], ["vault"], ["upload", "recent-gallery"],
        ["map-data"], ["map-logs"], ["stats"],
      ].map(queryKey => queryClient.invalidateQueries({ queryKey })));
      toastService.success(i18n.t("lab.clean.success"));
    },
    onError: () => toastService.error(i18n.t("lab.clean.error")),
  });
};
