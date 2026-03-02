import { useQuery } from "@tanstack/react-query";
import { statsService } from "../../services/statsService";

export const useFunFacts = (lang: "en" | "hu" = "en", limit: number = 5) => {
  return useQuery({
    queryKey: ["stats", "fun-facts", lang, limit],
    queryFn: () => statsService.getFunFacts(lang, limit),
    enabled: limit >= 1 && limit <= 5,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
