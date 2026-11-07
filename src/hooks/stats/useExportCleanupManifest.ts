import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { statsService } from "../../services/statsService";
import type { ReportDateRange } from "../../services/statsService";
import { toastService } from "../../services/toastService";

type ExportCleanupManifestParams = ReportDateRange & {
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

export const useExportCleanupManifest = () => {
  const { t } = useTranslation();

  return useMutation({
    mutationFn: ({ language = "en", ...range }: ExportCleanupManifestParams) =>
      statsService.exportCleanupManifest(range, language),
    onSuccess: ({ blob, filename }) => {
      triggerFileDownload(blob, filename);
      toastService.success(
        t("stats.toast.exportManifestSuccessTitle"),
        t("stats.toast.exportManifestSuccessMessage"),
      );
    },
    onError: (error) => {
      console.error("Failed to export cleanup manifest:", error);
      toastService.error(
        t("stats.toast.exportManifestErrorTitle"),
        t("stats.toast.exportManifestErrorMessage"),
      );
    },
  });
};
