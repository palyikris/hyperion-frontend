import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "../../services/dashboardService";

export const useUserExperience = () => {
  return useQuery({
    queryKey: ["dashboard", "user-experience"],
    queryFn: dashboardService.getUserExperience,
    staleTime: 20 * 1000,
    refetchInterval: 20 * 1000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: false,
  });
};
