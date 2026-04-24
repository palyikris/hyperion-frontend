import { api } from "../api/axiosInstance";
import type {
  MediaResponse,
  MediaPatchRequest,
  VideoDetectionResponse,
} from "../types/lab";

export const mediaService = {
  getMedia: async (mediaId: string): Promise<MediaResponse> => {
    const { data } = await api.get(`/lab/image/${mediaId}`);
    return data;
  },

  getVideoMedia: async (mediaId: string): Promise<VideoDetectionResponse> => {
    const { data } = await api.get(`/lab/video/${mediaId}`);
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
