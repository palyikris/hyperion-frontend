import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { setUser, clearUser } from "../../store/userSlice";
import { authService } from "../../services/authService";
import { toastService } from "../../services/toastService";

export const useAuth = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  const clearSessionData = async () => {
    // Cancel first so a late response cannot restore the previous user's data.
    await queryClient.cancelQueries();
    queryClient.clear();
    dispatch(clearUser());
    localStorage.removeItem("user");
  };

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
    onSuccess: async (data) => {
      await clearSessionData();
      if (data && data.user) {
        dispatch(setUser(data.user));
        queryClient.setQueryData(["authUser"], data.user);
      }
      toastService.success(
        t("auth.toast.loginSuccessTitle"),
        t("auth.toast.loginSuccessMessage"),
      );
      navigate("/dashboard", { replace: true });
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
    onSuccess: async () => {
      await clearSessionData();
      // Keep a signed-out result so Back cannot reuse the previous identity.
      queryClient.setQueryData(["authUser"], null);
      toastService.success(
        t("auth.toast.logoutSuccessTitle"),
        t("auth.toast.logoutSuccessMessage"),
      );
      navigate("/login", { replace: true });
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
    isLoggingOut: logoutMutation.isPending,
    isLoading: signupMutation.isPending || loginMutation.isPending,
    error: signupMutation.error || loginMutation.error,
  };
};
