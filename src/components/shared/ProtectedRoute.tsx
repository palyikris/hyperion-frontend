import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";


type ProtectedRouteProps = {
  children: ReactNode;
};

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const token = localStorage.getItem("hyperion_token");
  return token ? children : <Navigate to="/login" replace />;
};
