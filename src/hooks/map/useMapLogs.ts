import { useQuery } from "@tanstack/react-query";
import { mapService } from "../../services/mapService";

export const useMapLogs = (id?: string) => {
  return useQuery({
    queryKey: ["map-logs", id],
    queryFn: () => {
      if (!id) {
        throw new Error("Map media id is required to fetch logs");
      }
      return mapService.getMapLogs(id);
    },
    staleTime: 1000 * 60,
    enabled: Boolean(id),
  });
};
