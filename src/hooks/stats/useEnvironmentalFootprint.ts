import { useQuery } from "@tanstack/react-query";
import { statsService } from "../../services/statsService";

export const useEnvironmentalFootprint = () => {
  return useQuery({
    queryKey: ["stats", "environmental-footprint"],
    queryFn: statsService.getEnvironmentalFootprint,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
