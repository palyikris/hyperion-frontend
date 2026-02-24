import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toastService } from "../../services/toastService";
import { vaultService } from "../../services/vaultService";

export const useDeleteAllVault = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => vaultService.deleteAllMedia(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vault"] });
      toastService.success(
        t("vault.toast.deleteAllSuccessTitle"),
        t("vault.toast.deleteAllSuccessMessage"),
      );
    },
    onError: (error) => {
      console.error("Failed to delete all vault items:", error);
      toastService.error(
        t("vault.toast.deleteAllErrorTitle"),
        t("vault.toast.deleteAllErrorMessage"),
      );
    },
  });
};
