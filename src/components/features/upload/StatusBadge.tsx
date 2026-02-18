import { useTranslation } from "react-i18next";
import type { CardStatus } from "../../../types/upload";

type StatusBadgeProps = {
  status: CardStatus;
  config: {
    bgColor: string;
    textColor: string;
  };
};

const StatusBadge = ({ status, config }: StatusBadgeProps) => {
  const { t } = useTranslation();

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

  if (status === "default") return null;

  return (
    <div className="absolute top-6 left-6">
      <span
        className={`px-3 py-1 ${config.bgColor} ${config.textColor} text-xs font-bold rounded-full shadow-sm flex items-center gap-1`}
      >
        {getStatusLabel(status)}
      </span>
    </div>
  );
};

export default StatusBadge;
