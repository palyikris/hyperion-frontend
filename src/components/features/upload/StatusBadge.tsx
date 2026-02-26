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

  const getStatusLabel = (status: CardStatus) => {
    switch (status) {
      case "PENDING":
        return t("upload.status.pending");
      case "UPLOADED":
        return t("upload.status.uploaded");
      case "EXTRACTING":
        return t("upload.status.extracting");
      case "PROCESSING":
        return t("upload.status.processing");
      case "READY":
        return t("upload.status.ready");
      case "FAILED":
        return t("upload.status.failed");
      default:
        return t("upload.status.unknown");
    }
  };

  return (
    <div className="absolute top-4 left-4">
      <span
        className={`px-3 py-1 ${config.bgColor} ${config.textColor} text-xs font-bold rounded-full shadow-sm flex items-center gap-1`}
      >
        {getStatusLabel(status)}
      </span>
    </div>
  );
};

export default StatusBadge;
