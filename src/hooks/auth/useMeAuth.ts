import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/axiosInstance";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";

export const useMeAuth = () => {
  const user = useSelector((state: RootState) => state.user.user);
  const placeholderData = user ? user : undefined;

  console.log("useMeAuth - placeholderData:", placeholderData);

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
