import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { authService } from "../../services/authService";
import { toastService } from "../../services/toastService";
import { changeLanguage } from "i18next";
import { useDispatch } from "react-redux";
import { setUser } from "../../store/userSlice";

export const useUpdateMe = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: authService.updateMe,
    onSuccess: (data) => {
      dispatch(setUser(data));
      queryClient.setQueryData(["authUser"], data);

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