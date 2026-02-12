import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/axiosInstance";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const {
    data: user,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      const { data } = await api.get("/auth/me");
      return data;
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // Keep user info for 5 mins
  });

  if (isLoading) return <div>Loading Hyperion...</div>;

  if (isError || !user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
