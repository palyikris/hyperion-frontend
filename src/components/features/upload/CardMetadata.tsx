import { useTranslation } from "react-i18next";
import type { CardStatus } from "../../../types/upload";

type CardMetadataProps = {
  title: string;
  gpsCoordinates: string;
  timestamp: string;
  metadataInfo: string;
  status: CardStatus;
};

const CardMetadata = ({
  title,
  gpsCoordinates,
  timestamp,
  metadataInfo,
  status,
}: CardMetadataProps) => {
  const { t } = useTranslation();

  return (
    <div className="px-4 py-10 pt-4 space-y-3">
      <div className="flex justify-between items-start gap-2">
        <h4 className="font-bold text-hyperion-forest truncate">{title}</h4>
        <span className="text-[10px] font-bold text-hyperion-slate-grey/60 bg-hyperion-fog-grey px-1.5 py-0.5 rounded whitespace-nowrap">
          {t("upload.card.gpsLabel")} {gpsCoordinates}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs text-hyperion-slate-grey/70">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          {timestamp}
        </div>

        <div
          className={`flex items-center gap-2 text-xs font-medium ${
            status === "processing"
              ? "text-hyperion-slate-grey/60"
              : "text-hyperion-forest"
          }`}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          {t("upload.card.metadataLabel")} {metadataInfo}
        </div>
      </div>
    </div>
  );
};

export default CardMetadata;
