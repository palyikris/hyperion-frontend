import { useQuery } from "@tanstack/react-query";
import { mapService } from "../../services/mapService";
import type { MapFilters } from "../../types/map";
import type { MapResponse } from "../../types/map";

export const useMapData = (filters: MapFilters = {}) => {
  return useQuery<MapResponse>({
    queryKey: ["map-data", filters],
    queryFn: async () => await mapService.getMapData(filters),
    staleTime: 1000 * 60 * 5,
    placeholderData: (previousData) => previousData,
    // only fetch if have coordinates (or a valid session)
    enabled: true,
  });
};
