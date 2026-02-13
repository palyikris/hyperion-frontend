
import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/axiosInstance';

export const useMeAuth = () => {
  return useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      const { data } = await api.get("/auth/me");
      return data;
    },
    retry: false,
  });
}