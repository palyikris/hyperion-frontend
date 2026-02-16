
import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/axiosInstance";

export const useMeAuth = () => {
  const storedUser = (() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  return useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      const { data } = await api.get("/auth/me");
      return data;
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    ...(storedUser
      ? { initialData: storedUser, initialDataUpdatedAt: Date.now() }
      : {}),
  });
};