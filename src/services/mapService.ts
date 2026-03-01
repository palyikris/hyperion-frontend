import { api } from "../api/axiosInstance";
import type { MapFilters, MapLogsResponse, MapResponse } from "../types/map";

export const mapService = {
  getMapData: async (filters: MapFilters = {}): Promise<MapResponse> => {
    const { data } = await api.get<MapResponse>("/map", {
      params: filters,
    });
    return data;
  },

  getMapLogs: async (id: string): Promise<MapLogsResponse> => {
    const { data } = await api.get<MapLogsResponse>(`/map/${id}/logs`);
    return data;
  },
};
