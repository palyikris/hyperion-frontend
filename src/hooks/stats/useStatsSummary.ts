import { useQuery } from "@tanstack/react-query";
import { statsService } from "../../services/statsService";

export const useStatsSummary = (days = 7) => {
  return useQuery({
    queryKey: ["stats", "summary", days],
    queryFn: () => statsService.getStatsSummary(days),
    enabled: days >= 1 && days <= 365,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
