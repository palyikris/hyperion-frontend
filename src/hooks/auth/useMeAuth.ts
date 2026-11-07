import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/axiosInstance";
import type { AuthenticatedUser } from "../../types/auth/auth";

export const useMeAuth = () => {
  return useQuery({
    queryKey: ["authUser"],
    queryFn: async ({ signal }) => {
      const { data } = await api.get<AuthenticatedUser>("/auth/me", { signal });
      return data;
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
};
