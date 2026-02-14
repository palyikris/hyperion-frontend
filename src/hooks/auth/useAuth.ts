import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { authService } from "../../services/authService";
import { toastService } from "../../services/toastService";

export const useAuth = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Signup Hook
  const signupMutation = useMutation({
    mutationFn: authService.signup,
    onSuccess: () => {
      toastService.success(
        t("auth.toast.signupSuccessTitle"),
        t("auth.toast.signupSuccessMessage"),
      );
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    },
    onError: (err) => {
      toastService.error(
        t("auth.toast.signupErrorTitle"),
        t("auth.toast.signupErrorMessage"),
      );
      console.error("Signup failed:", err);
    },
  });

  // Login Hook
  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: () => {
      toastService.success(
        t("auth.toast.loginSuccessTitle"),
        t("auth.toast.loginSuccessMessage"),
      );
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    },
    onError: (err) => {
      console.error("Invalid email or password", err);
      toastService.error(
        t("auth.toast.loginErrorTitle"),
        t("auth.toast.loginErrorMessage"),
      );
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      toastService.success(
        t("auth.toast.logoutSuccessTitle"),
        t("auth.toast.logoutSuccessMessage"),
      );
      localStorage.removeItem("user");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    },
    onError: (err) => {
      console.error("Logout failed", err);
      toastService.error(
        t("auth.toast.logoutErrorTitle"),
        t("auth.toast.logoutErrorMessage"),
      );
    },
  });

  return {
    signup: signupMutation.mutate,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    isLoading: signupMutation.isPending || loginMutation.isPending,
    error: signupMutation.error || loginMutation.error,
  };
};
