import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "../../services/dashboardService";

export const useSystemHealth = () => {
  return useQuery({
    queryKey: ["dashboard", "system-health"],
    queryFn: dashboardService.getSystemHealth,
    staleTime: 10 * 1000,
    refetchInterval: 10 * 1000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: false,
  });
};
