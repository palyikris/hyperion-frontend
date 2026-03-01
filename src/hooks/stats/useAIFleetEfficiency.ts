import { useQuery } from "@tanstack/react-query";
import { statsService } from "../../services/statsService";

export const useAIFleetEfficiency = () => {
  return useQuery({
    queryKey: ["stats", "ai-fleet-efficiency"],
    queryFn: statsService.getAIFleetEfficiency,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
