import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/axiosInstance";
import { getStoredUser } from "../../utils/authStorage";

export const useMeAuth = () => {
  const storedUser = getStoredUser();
  const placeholderData =
    Object.keys(storedUser).length > 0 ? storedUser : undefined;

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
    placeholderData,
  });
};
