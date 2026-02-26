import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, Info } from "lucide-react";
import type {
  CardStatus,
  GalleryItemTechnicalMetadata,
} from "../../../types/upload";
import { ScrollReveal } from "../../shared/animation/ScrollReveal";
import ImageSection from "./ImageSection";
import CardMetadata from "./CardMetadata";
import ConfirmModal from "../../shared/ConfirmModal";
import { useDeleteVaultItem } from "../../../hooks/vault/useDeleteVaultItem";
import { useTranslation } from "react-i18next";
import GalleryCardTechnicalOverlay from "./GalleryCardTechnicalOverlay";

interface GalleryCardProps {
  id: string;
  title: string;
  imageUrl: string;
  status: CardStatus;
  gpsCoordinates: string;
  address?: string;
  timestamp: string;
  metadataInfo: string;
  technical_metadata?: GalleryItemTechnicalMetadata;
  onZoom?: () => void;
  index: number;
  worker_name?: string;
  showInfo?: boolean;
}

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
    textColor: "text-hyperion-cream",
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
  address,
  timestamp,
  metadataInfo,
  index,
  onZoom,
  worker_name,
  technical_metadata,
  showInfo: initialShowInfo = true,
}: GalleryCardProps) => {
  const config = statusConfig[status];
  const isProcessing = status === "PROCESSING" || status === "EXTRACTING";
  const navigate = useNavigate();
  const deleteMutation = useDeleteVaultItem();
  const isDeleting = deleteMutation.isPending;
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const { t } = useTranslation();

  const initialRadius = "36px 76px 42px 86px / 68px 38px 78px 46px";
  const hoverRadius = "86px 42px 76px 36px / 46px 78px 38px 68px";

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    deleteMutation.mutate(id, {
      onSettled: () => setIsDeleteModalOpen(false),
    });
  };

  const handleClick = () => {
    if (isProcessing || isDeleting) return;
    navigate(`/lab/${id}`);
  };

  return (
    <>
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title={t("upload.deleteSingleTitle")}
        description={t("upload.deleteSingleDescription")}
        icon={<Trash2 className="w-6 h-6 text-hyperion-burnt-orange" />}
        onConfirm={handleConfirmDelete}
        onClose={() => setIsDeleteModalOpen(false)}
        confirmText={t("upload.deleteConfirm")}
        cancelText={t("upload.cancel")}
        isDangerous
      />
      <ScrollReveal
        className={`relative ${isProcessing || isDeleting ? "" : "group"} bg-white border ${config.borderColor} ${isProcessing || isDeleting ? "cursor-not-allowed" : "cursor-pointer"}`}
        style={{
          borderRadius: initialRadius,
          boxShadow: "0 10px 24px rgba(8, 36, 33, 0.08)",
          opacity: isDeleting ? 0.6 : 1,
          overflow: "hidden",
          willChange: "transform, border-radius",
          transform: "translateZ(0)",
          isolation: "isolate",
        }}
        whileHover={
          isProcessing || isDeleting
            ? undefined
            : {
                y: -6,
                rotate: -0.6,
                scale: 1.01,
                boxShadow: "0 18px 44px rgba(8, 36, 33, 0.16)",
                borderRadius: hoverRadius,
              }
        }
        onClick={handleClick}
        delay={index * 0.02}
      >
        {status === "READY" && initialShowInfo && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowInfo(true);
            }}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white text-hyperion-forest shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-hyperion-cool-aqua hover:text-white border border-hyperion-fog-grey"
            style={{ boxShadow: "0 2px 8px rgba(8,36,33,0.10)" }}
          >
            <Info size={18} />
          </button>
        )}

        <ImageSection
          imageUrl={imageUrl}
          title={title}
          status={status}
          isProcessing={isProcessing || isDeleting}
          config={config}
          onZoom={onZoom}
          onDelete={handleDelete}
        />

        <GalleryCardTechnicalOverlay
          showInfo={showInfo}
          setShowInfo={setShowInfo}
          technical_metadata={technical_metadata}
          address={address}
          borderRadius={initialRadius}
        />

        <CardMetadata
          title={title}
          timestamp={timestamp}
          metadataInfo={metadataInfo}
          status={status}
          isDeleting={isDeleting}
          worker_name={worker_name}
          address={address}
        />
      </ScrollReveal>
    </>
  );
};

export default GalleryCard;
