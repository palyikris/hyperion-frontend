import { api } from "../api/axiosInstance";
import type { MapFilters, MapResponse } from "../types/map";


export const mapService = {
  
  getMapData: async (filters: MapFilters = {}): Promise<MapResponse> => {
    const { data } = await api.get<MapResponse>("/map", {
      params: filters,
    });
    return data;
  },
};
