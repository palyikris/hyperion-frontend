import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { statsService } from "../../services/statsService";
import { toastService } from "../../services/toastService";

type ExportCleanupManifestPdfParams = {
  days?: number;
  language?: "en" | "hu";
};

const triggerFileDownload = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};

export const useExportCleanupManifestPdf = () => {
  const { t } = useTranslation();

  return useMutation({
    mutationFn: ({ days = 30, language = "en" }: ExportCleanupManifestPdfParams) =>
      statsService.exportCleanupManifestPdf(days, language),
    onSuccess: ({ blob, filename }) => {
      triggerFileDownload(blob, filename);
      toastService.success(
        t("stats.toast.exportPdfSuccessTitle"),
        t("stats.toast.exportPdfSuccessMessage"),
      );
    },
    onError: (error) => {
      console.error("Failed to export PDF report:", error);
      toastService.error(
        t("stats.toast.exportPdfErrorTitle"),
        t("stats.toast.exportPdfErrorMessage"),
      );
    },
  });
};
