import { useQuery } from "@tanstack/react-query";
import { statsService } from "../../services/statsService";

export const useMeanTimeToProcess = () => {
  return useQuery({
    queryKey: ["stats", "mean-time-to-process"],
    queryFn: statsService.getMeanTimeToProcess,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
