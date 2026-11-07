import { useEffect } from "react";
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useMeAuth } from "../../hooks/auth/useMeAuth";
import { clearUser, setUser } from "../../store/userSlice";
import i18n from "../../i18n";
import LoadingScreen from "./LoadingScreen";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { data: user, isLoading, isError } = useMeAuth();
  const dispatch = useDispatch();

  useEffect(() => {
    if (isLoading) return;

    if (isError || !user) {
      dispatch(clearUser());
      localStorage.removeItem("user");
      return;
    }

    dispatch(setUser(user));
    localStorage.setItem("user", JSON.stringify(user));

    const language =
      typeof user.language === "string" ? user.language.trim() : "";
    if (language && i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, [dispatch, user, isLoading, isError]);

  if (isLoading) return <LoadingScreen />;

  if (isError || !user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
