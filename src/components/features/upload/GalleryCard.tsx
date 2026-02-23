import { useNavigate } from "react-router-dom";
import type { CardStatus } from "../../../types/upload";
import { ScrollReveal } from "../../shared/animation/ScrollReveal";
import ImageSection from "./ImageSection";
import CardMetadata from "./CardMetadata";
import { useDeleteVaultItem } from "../../../hooks/vault/useDeleteVaultItem";

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
  worker_name?: string;
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
  PENDING: {
    bgColor: "bg-hyperion-muted-gold",
    textColor: "text-hyperion-hyperion-cream",
    borderColor: "border-hyperion-muted-gold",
  },
  UPLOADED: {
    bgColor: "bg-hyperion-sage-mint",
    textColor: "text-hyperion-fog-grey",
    borderColor: "border-hyperion-sage-mint",
  },
  FAILED: {
    bgColor: "bg-hyperion-burnt-orange",
    textColor: "text-hyperion-cream",
    borderColor: "border-hyperion-burnt-orange",
  },
  PROCESSING: {
    bgColor: "bg-hyperion-cool-aqua",
    textColor: "text-hyperion-forest",
    borderColor: "border-hyperion-cool-aqua",
    processing: true,
  },
  EXTRACTING: {
    bgColor: "bg-hyperion-forest",
    textColor: "text-hyperion-cool-aqua",
    borderColor: "border-hyperion-forest",
  },
  READY: {
    bgColor: "bg-hyperion-deep-sea",
    textColor: "text-hyperion-cream",
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
  worker_name,
}: GalleryCardProps) => {
  const config = statusConfig[status];
  const isProcessing = status === "PROCESSING";
  const navigate = useNavigate();
  const deleteMutation = useDeleteVaultItem();
  const isDeleting = deleteMutation.isPending;

  console.log("worker_name:", worker_name);

  const handleClick = () => {
    if (isProcessing || isDeleting) {
      return;
    }

    navigate(`/lab/${id}`);
  };

  return (
    <ScrollReveal
      className={`${isProcessing || isDeleting ? "" : "group"} bg-white overflow-hidden border ${config.borderColor} transition-all duration-300 ${isProcessing || isDeleting ? "cursor-not-allowed" : "cursor-pointer hover:shadow-2xl"}`}
      style={{
        borderRadius: "36px 76px 42px 86px / 68px 38px 78px 46px",
        boxShadow: "0 10px 24px rgba(8, 36, 33, 0.08)",
        transition: "all 0.3s ease, border-radius 0.3s ease",
        opacity: isDeleting ? 0.6 : 1,
      }}
      whileHover={
        isProcessing || isDeleting
          ? undefined
          : {
              y: -6,
              rotate: -0.6,
              scale: 1.01,
              boxShadow: "0 18px 44px rgba(8, 36, 33, 0.16)",
            }
      }
      onMouseEnter={
        isProcessing || isDeleting
          ? undefined
          : (e) => {
              e.currentTarget.style.borderRadius =
                "86px 42px 76px 36px / 46px 78px 38px 68px";
            }
      }
      onMouseLeave={
        isProcessing || isDeleting
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
        isProcessing={isProcessing || isDeleting}
        config={config}
        onZoom={onZoom}
        onDelete={() => {
          deleteMutation.mutate(id);
        }}
      />

      <CardMetadata
        title={title}
        gpsCoordinates={gpsCoordinates}
        timestamp={timestamp}
        metadataInfo={metadataInfo}
        status={status}
        isDeleting={isDeleting}
        worker_name={worker_name}
      />
    </ScrollReveal>
  );
};

export default GalleryCard;
