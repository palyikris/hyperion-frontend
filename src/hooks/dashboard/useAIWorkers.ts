import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "../../services/dashboardService";

export const useAIWorkers = () => {
  return useQuery({
    queryKey: ["dashboard", "ai-workers"],
    queryFn: dashboardService.getAIWorkers,
    staleTime: 20 * 1000,
    refetchInterval: 20 * 1000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: false,
  });
};
