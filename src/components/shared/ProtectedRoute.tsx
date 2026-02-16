import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useMeAuth } from "../../hooks/auth/useMeAuth";
import i18n from "../../i18n";
import LoadingScreen from "./LoadingScreen";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { data: user, isLoading, isError } = useMeAuth();
  const [minDelayDone, setMinDelayDone] = useState(false);
  const loadingStartRef = useRef<number | null>(null);

  useEffect(() => {
    if (!user) return;

    localStorage.setItem("user", JSON.stringify(user));

    const language =
      typeof user.language === "string" ? user.language.trim() : "";
    if (language && i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, [user]);

  useEffect(() => {
    if (isLoading) {
      if (loadingStartRef.current === null) {
        loadingStartRef.current = Date.now();
      }
      return;
    }

    const startedAt = loadingStartRef.current;
    if (startedAt === null) {
      setMinDelayDone(true);
      return;
    }

    const elapsed = Date.now() - startedAt;
    const remaining = 1500 - elapsed;

    if (remaining <= 0) {
      setMinDelayDone(true);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setMinDelayDone(true);
    }, remaining);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isLoading]);

  useEffect(() => {
    if (isLoading) {
      setMinDelayDone(false);
      loadingStartRef.current = null;
    }
  }, [isLoading]);

  if (isLoading || !minDelayDone) return <LoadingScreen />;

  if (isError || !user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
