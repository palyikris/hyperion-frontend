import { api } from "../api/axiosInstance";
import type {
  MediaResponse,
  MediaPatchRequest,
  VideoDetectionResponse,
} from "../types/lab";

export const mediaService = {
  markClean: async (mediaId: string, detectionId?: string): Promise<void> => {
    const path = `/lab/${mediaId}/detections`;
    await api.delete(detectionId ? `${path}/${detectionId}` : path);
  },

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
  ): Promise<MediaResponse | VideoDetectionResponse | null> => {
    const response = await api.patch(`/lab/${mediaId}`, patchData);
    return response.status === 204 ? null : response.data;
  },
};
