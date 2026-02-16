import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "../../services/dashboardService";

export const useSystemHealth = () => {
  return useQuery({
    queryKey: ["dashboard", "system-health"],
    queryFn: dashboardService.getSystemHealth,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
