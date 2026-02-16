import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "../../services/dashboardService";

export const useAIWorkers = () => {
  return useQuery({
    queryKey: ["dashboard", "ai-workers"],
    queryFn: dashboardService.getAIWorkers,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
