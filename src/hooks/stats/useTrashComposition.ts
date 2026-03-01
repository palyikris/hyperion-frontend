import { useQuery } from "@tanstack/react-query";
import { statsService } from "../../services/statsService";

export const useTrashComposition = () => {
  return useQuery({
    queryKey: ["stats", "trash-composition"],
    queryFn: statsService.getTrashComposition,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
