import { useQuery } from "@tanstack/react-query";
import { statsService } from "../../services/statsService";

export const useHotspotDensity = () => {
  return useQuery({
    queryKey: ["stats", "hotspot-density"],
    queryFn: statsService.getHotspotDensity,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
