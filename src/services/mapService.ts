import { api } from "../api/axiosInstance";
import type { MapFilters, MapLogsResponse, MapResponse } from "../types/map";
import { mediaService } from "./mediaService";

export const mapService = {
  getMapData: async (filters: MapFilters = {}): Promise<MapResponse> => {
    const { data } = await api.get<MapResponse>("/map", {
      params: filters,
    });

    if (data.video_detections) {
      const entries = Object.entries(data.video_detections);
      await Promise.all(
        entries.map(async ([media_id, detections]) => {
          const media = await mediaService.getMedia(media_id);
          detections.forEach((detection) => {
            detection.media = media;
          });
        }),
      );
    }
    return data;
  },

  getMapLogs: async (id: string): Promise<MapLogsResponse> => {
    const { data } = await api.get<MapLogsResponse>(`/map/${id}/logs`);
    return data;
  },
};
