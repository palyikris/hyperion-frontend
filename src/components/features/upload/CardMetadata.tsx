import { useTranslation } from "react-i18next";
import type { CardStatus } from "../../../types/upload";
import { Calendar, FileText, User2 } from "lucide-react";

type CardMetadataProps = {
  title: string;
  gpsCoordinates: string;
  timestamp: string;
  metadataInfo: string;
  status: CardStatus;
  isDeleting?: boolean;
  worker_name?: string;
};

const CardMetadata = ({
  title,
  gpsCoordinates,
  timestamp,
  metadataInfo,
  status,
  isDeleting,
  worker_name,
}: CardMetadataProps) => {
  const { t } = useTranslation();

  return (
    <div className="px-4 py-10 pt-4 space-y-3">
      <div className="flex justify-between items-start gap-2">
        <h4 className="font-bold text-hyperion-forest truncate">
          {isDeleting ? t("upload.card.deleting") : title}
        </h4>
        <span className="text-[10px] font-bold text-hyperion-slate-grey/60 bg-hyperion-fog-grey px-1.5 py-0.5 rounded whitespace-nowrap">
          {t("upload.card.gpsLabel")} {gpsCoordinates}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs text-hyperion-slate-grey/70">
          <Calendar className="w-4 h-4" />
          {new Date(timestamp).toISOString().split("T")[0]}
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
      </div>
    </div>
  );
};

export default CardMetadata;
