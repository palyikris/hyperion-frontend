import { useQuery } from "@tanstack/react-query";
import { mapService } from "../../services/mapService";
import type { MapFilters } from "../../types/map";
import type { MapResponse } from "../../types/map";

type UseMapDataOptions = {
  onSettled?: () => void;
};

export const useMapData = (
  filters: MapFilters = {},
  options: UseMapDataOptions = {},
) => {
  return useQuery<MapResponse>({
    queryKey: ["map-data", filters],
    queryFn: async () => {
      try {
        return await mapService.getMapData(filters);
      } finally {
        options.onSettled?.();
      }
    },
    staleTime: 1000 * 60 * 5,
    placeholderData: (previousData) => previousData,
    // only fetch if have coordinates (or a valid session)
    enabled: true,
  });
};
