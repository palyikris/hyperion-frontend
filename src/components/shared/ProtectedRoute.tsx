import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useMeAuth } from "../../hooks/auth/useMeAuth";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { data: user, isLoading, isError } = useMeAuth();

  if (isLoading) return <div>Loading Hyperion...</div>;

  if (isError || !user) {
    return <Navigate to="/login" replace />;
  }

  localStorage.setItem("user", JSON.stringify(user));

  return <>{children}</>;
};

export default ProtectedRoute;
