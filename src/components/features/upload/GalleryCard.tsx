import { useNavigate } from "react-router-dom";
import type { CardStatus } from "../../../types/upload";
import { useTranslation } from "react-i18next";
import { ScrollReveal } from "../../shared/animation/ScrollReveal";

type GalleryCardProps = {
  id: string;
  title: string;
  imageUrl: string;
  status: CardStatus;
  gpsCoordinates: string;
  timestamp: string;
  metadataInfo: string;
  onZoom?: () => void;
  index: number;
};

const statusConfig: Record<
  CardStatus,
  {
    bgColor: string;
    textColor: string;
    borderColor: string;
    processing?: boolean;
  }
> = {
  "trash-detected": {
    bgColor: "bg-hyperion-burnt-orange",
    textColor: "text-white",
    borderColor: "border-hyperion-burnt-orange",
  },
  processing: {
    bgColor: "bg-hyperion-cool-aqua",
    textColor: "text-hyperion-forest",
    borderColor: "border-hyperion-cool-aqua",
    processing: true,
  },
  clear: {
    bgColor: "bg-hyperion-forest",
    textColor: "text-white",
    borderColor: "border-hyperion-forest",
  },
  default: {
    bgColor: "",
    textColor: "",
    borderColor: "border-hyperion-fog-grey",
  },
};

const GalleryCard = ({
  id,
  title,
  imageUrl,
  status,
  gpsCoordinates,
  timestamp,
  metadataInfo,
  index,
  onZoom,
}: GalleryCardProps) => {
  const { t } = useTranslation();
  const config = statusConfig[status];
  const isProcessing = config.processing;
  const navigate = useNavigate();

  const getStatusLabel = (cardStatus: CardStatus): string => {
    switch (cardStatus) {
      case "trash-detected":
        return t("upload.card.status.trashDetected");
      case "processing":
        return t("upload.card.status.processing");
      case "clear":
        return t("upload.card.status.clear");
      default:
        return "";
    }
  };

  const handleClick = () => {
    if (isProcessing) {
      return;
    }

    navigate(`/lab/${id}`);
  };

  return (
    <ScrollReveal
      className={`group bg-white overflow-hidden border ${config.borderColor} hover:shadow-2xl transition-all duration-300 ${isProcessing ? "cursor-not-allowed" : "cursor-pointer"}`}
      style={{
        borderRadius: "36px 76px 42px 86px / 68px 38px 78px 46px",
        boxShadow: "0 10px 24px rgba(8, 36, 33, 0.08)",
        transition: "all 0.3s ease, border-radius 0.3s ease",
      }}
      whileHover={
        isProcessing
          ? undefined
          : {
              y: -6,
              rotate: -0.6,
              scale: 1.01,
              boxShadow: "0 18px 44px rgba(8, 36, 33, 0.16)",
            }
      }
      onMouseEnter={(e) => {
        e.currentTarget.style.borderRadius =
          "86px 42px 76px 36px / 46px 78px 38px 68px";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderRadius =
          "36px 76px 42px 86px / 68px 38px 78px 46px";
      }}
      onClick={handleClick}
      delay={index * 0.15}
    >
      <div className="aspect-[4/3] relative overflow-hidden bg-hyperion-fog-grey">
        <img
          alt={title}
          src={imageUrl}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
            isProcessing ? "opacity-60" : ""
          }`}
        />

        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-5 rounded-[28px] border border-white/35 opacity-0 group-hover:opacity-100 group-hover:scale-[1.03] transition-all duration-500" />
          <div className="absolute -inset-6 rounded-[44px] border border-hyperion-cool-aqua/70 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-500" />
          <div className="absolute -inset-10 rounded-[52px] border border-hyperion-cool-aqua/40 opacity-0 group-hover:opacity-100 blur-3xl transition-opacity duration-700" />
        </div>

        {status !== "default" && (
          <div className="absolute top-6 left-6">
            <span
              className={`px-3 py-1 ${config.bgColor} ${config.textColor} text-xs font-bold rounded-full shadow-sm flex items-center gap-1`}
            >
              {getStatusLabel(status)}
            </span>
          </div>
        )}

        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onZoom}
            className="bg-white/90 p-2 rounded-full shadow-lg hover:bg-white transition-colors"
          >
            <svg
              className="w-5 h-5 text-hyperion-forest"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        </div>
      </div>

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
    </ScrollReveal>
  );
};

export default GalleryCard;
