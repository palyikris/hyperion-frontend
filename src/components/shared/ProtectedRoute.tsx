import { useEffect } from "react";
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useMeAuth } from "../../hooks/auth/useMeAuth";
import i18n from "../../i18n";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { data: user, isLoading, isError } = useMeAuth();

  useEffect(() => {
    if (!user) return;

    localStorage.setItem("user", JSON.stringify(user));

    const language =
      typeof user.language === "string" ? user.language.trim() : "";
    if (language && i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, [user]);

  if (isLoading) return null;

  if (isError || !user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
