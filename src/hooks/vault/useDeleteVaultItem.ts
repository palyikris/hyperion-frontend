import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toastService } from "../../services/toastService";
import { vaultService } from "../../services/vaultService";

export const useDeleteVaultItem = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => vaultService.deleteVaultItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vault"] });
      queryClient.invalidateQueries({ queryKey: ["upload", "recent-gallery"] });
      queryClient.invalidateQueries({ queryKey: ["map-data"] });
      queryClient.invalidateQueries({ queryKey: ["map-logs"] });
      toastService.success(
        t("vault.toast.deleteSuccessTitle"),
        t("vault.toast.deleteSuccessMessage"),
      );
    },
    onError: (error) => {
      console.error("Failed to delete vault item:", error);
      toastService.error(
        t("vault.toast.deleteErrorTitle"),
        t("vault.toast.deleteErrorMessage"),
      );
    },
  });
};