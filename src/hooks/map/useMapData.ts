import { useQuery } from "@tanstack/react-query";
import { mapService } from "../../services/mapService";
import type { MapFilters } from "../../types/map";

export const useMapData = (filters: MapFilters = {}) => {
  return useQuery({
    queryKey: ["map-data", filters],
    queryFn: () => mapService.getMapData(filters),
    staleTime: 1000 * 60 * 5,
    // only fetch if have coordinates (or a valid session)
    enabled: true,
  });
};
