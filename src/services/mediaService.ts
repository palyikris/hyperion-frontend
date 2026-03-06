import { api } from "../api/axiosInstance";
import type { MediaResponse, MediaPatchRequest } from "../types/lab";

export const mediaService = {
  getMedia: async (mediaId: string): Promise<MediaResponse> => {
    const { data } = await api.get(`/lab/${mediaId}`);
    return data;
  },

  patchMedia: async (
    mediaId: string,
    patchData: MediaPatchRequest,
  ): Promise<MediaResponse> => {
    const { data } = await api.patch(`/lab/${mediaId}`, patchData);
    return data;
  },
};
