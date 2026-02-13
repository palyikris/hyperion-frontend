import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";
import { toastService } from "../../services/toastService";

export const useAuth = () => {
  const navigate = useNavigate();

  // Signup Hook
  const signupMutation = useMutation({
    mutationFn: authService.signup,
    onSuccess: () => {
      toastService.success("Account created successfully!", "Please log in to continue.");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    },
    onError: (err) => {
      toastService.error("Signup failed", "Please check your details and try again.");
      console.error("Signup failed:", err);
    },
  });

  // Login Hook
  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: () => {
      toastService.success("Welcome back!", "You have successfully logged in.");
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    },
    onError: (err) => {
      console.error("Invalid email or password", err);
      toastService.error(
        "Login failed",
        "Invalid email or password. Please try again.",
      );
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      toastService.success("Logged out", "You have successfully logged out.");
      localStorage.removeItem("user");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    },
    onError: (err) => {
      console.error("Logout failed", err);
      toastService.error(
        "Logout failed",
        "An error occurred while logging out. Please try again.",
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
