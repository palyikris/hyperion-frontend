import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { authService } from "../../services/authService";
import { toastService } from "../../services/toastService";
import { changeLanguage } from "i18next";
import { mergeStoredUser } from "../../utils/authStorage";

export const useUpdateMe = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.updateMe,
    onSuccess: (data) => {
      const updatedUser = mergeStoredUser(data);
      queryClient.setQueryData(["authUser"], updatedUser);

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
};