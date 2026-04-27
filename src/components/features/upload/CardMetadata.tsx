import { useTranslation } from "react-i18next";
import type { CardStatus } from "../../../types/upload";
import { AlertTriangle, Calendar, FileText, MapPin, User2 } from "lucide-react";

type CardMetadataProps = {
  title: string;
  timestamp: string;
  metadataInfo: string;
  status: CardStatus;
  failed_reason?: string;
  isDeleting?: boolean;
  worker_name?: string;
  address?: string;
};

const CardMetadata = ({
  title,
  timestamp,
  metadataInfo,
  status,
  failed_reason,
  isDeleting,
  worker_name,
  address,
}: CardMetadataProps) => {
  const { t } = useTranslation();

  return (
    <div className="relative overflow-hidden px-4 py-10 pt-4 space-y-3">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-5 -right-5 h-20 w-20 rounded-[58%_42%_35%_65%/56%_44%_60%_40%] bg-hyperion-sage-mint/60"
      />

      <div className="relative z-10 flex items-start gap-2">
        <h4 className="font-bold text-hyperion-forest truncate">
          {isDeleting ? t("upload.card.deleting") : title}
        </h4>
      </div>

      <div className="relative z-10 flex flex-col gap-2">
        {address !== "N/A" && (
          <div className="flex items-start gap-2 text-xs text-hyperion-slate-grey/70">
            <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
            <span className="wrap-break-word leading-tight">
              {t("upload.card.gpsLabel")} {address}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-hyperion-slate-grey/70">
          <Calendar className="w-4 h-4" />
          {timestamp ? new Date(timestamp).toISOString().split("T")[0] : "N/A"}
        </div>

        <div
          className={`flex items-center gap-2 text-xs font-medium ${
            status === "PROCESSING"
              ? "text-hyperion-slate-grey/60"
              : "text-hyperion-forest"
          }`}
        >
          <FileText className="w-4 h-4" />
          {metadataInfo}
        </div>
        {worker_name && (
          <div className="flex items-center gap-2 text-xs font-medium text-hyperion-slate-grey/60">
            <User2 className="w-4 h-4" />
            {worker_name}
          </div>
        )}

        {status === "FAILED" && failed_reason && (
          <div
            className="rounded-lg border border-hyperion-burnt-orange/35 bg-hyperion-burnt-orange/10 p-2.5"
            aria-live="polite"
          >
            <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-hyperion-burnt-orange">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>{t("upload.card.errorDetails", "Error details")}</span>
            </div>
            <p className="text-xs leading-snug text-hyperion-burnt-orange">
              {failed_reason}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CardMetadata;
