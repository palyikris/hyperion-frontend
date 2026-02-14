

import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { authService } from "../../services/authService";
import { toastService } from "../../services/toastService";
import {changeLanguage} from "i18next";

export const useUpdateMe = () => {
  const { t } = useTranslation();

  return useMutation({
    mutationFn: authService.updateMe,
    onSuccess: (data) => {
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      const updatedUser = { ...currentUser, ...data };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      if (data.language) {
        changeLanguage(data.language);
      }
      toastService.success(
        t("settings.toast.updateSuccessTitle"),
        t("settings.toast.updateSuccessMessage"),
      );
    },
    onError: (err) => {
      console.error("Failed to update user data:", err);
      toastService.error(
        t("settings.toast.updateErrorTitle"),
        t("settings.toast.updateErrorMessage"),
      );
    },
  });
}