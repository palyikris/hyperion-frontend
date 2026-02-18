import { useNavigate } from "react-router-dom";
import type { CardStatus } from "../../../types/upload";
import { ScrollReveal } from "../../shared/animation/ScrollReveal";
import ImageSection from "./ImageSection";
import CardMetadata from "./CardMetadata";

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
  const config = statusConfig[status];
  const isProcessing = config.processing ?? false;
  const navigate = useNavigate();

  const handleClick = () => {
    if (isProcessing) {
      return;
    }

    navigate(`/lab/${id}`);
  };

  return (
    <ScrollReveal
      className={`${isProcessing ? "" : "group"} bg-white overflow-hidden border ${config.borderColor} transition-all duration-300 ${isProcessing ? "cursor-not-allowed" : "cursor-pointer hover:shadow-2xl"}`}
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
      onMouseEnter={
        isProcessing
          ? undefined
          : (e) => {
              e.currentTarget.style.borderRadius =
                "86px 42px 76px 36px / 46px 78px 38px 68px";
            }
      }
      onMouseLeave={
        isProcessing
          ? undefined
          : (e) => {
              e.currentTarget.style.borderRadius =
                "36px 76px 42px 86px / 68px 38px 78px 46px";
            }
      }
      onClick={handleClick}
      delay={index * 0.15}
    >
      <ImageSection
        imageUrl={imageUrl}
        title={title}
        status={status}
        isProcessing={isProcessing}
        config={config}
        onZoom={onZoom}
      />

      <CardMetadata
        title={title}
        gpsCoordinates={gpsCoordinates}
        timestamp={timestamp}
        metadataInfo={metadataInfo}
        status={status}
      />
    </ScrollReveal>
  );
};

export default GalleryCard;
