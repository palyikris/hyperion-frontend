import { useQuery } from "@tanstack/react-query";
import { statsService } from "../../services/statsService";

export const useTemporalTrends = (days: number) => {
  return useQuery({
    queryKey: ["stats", "temporal-trends", days],
    queryFn: () => statsService.getTemporalTrends(days),
    enabled: days > 0,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
