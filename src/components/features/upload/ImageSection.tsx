import type { CardStatus } from "../../../types/upload";
import StatusBadge from "./StatusBadge";
import DeleteButton from "./DeleteButton";
import ZoomButton from "./ZoomButton";
import { useState } from "react";
import { getMediaAssetUrl } from "../../../utils/imageUtils";

type ImageSectionProps = {
  imageUrl: string;
  title: string;
  status: CardStatus;
  isProcessing: boolean;
  config: {
    bgColor: string;
    textColor: string;
  };
  onZoom?: () => void;
  onDelete?: (e: React.MouseEvent) => void;
  onSearchIconClick?: (e: React.MouseEvent) => void;
};

const ImageSection = ({
  imageUrl,
  title,
  status,
  isProcessing,
  config,
  onZoom,
  onDelete,
  onSearchIconClick,
}: ImageSectionProps) => {
  const hasImage = Boolean(imageUrl);

  const [opacity, setOpacity] = useState(0);

  return (
    <div className="aspect-4/3 relative overflow-hidden bg-hyperion-fog-grey">
      {hasImage ? (
        <img
          alt={title}
          src={getMediaAssetUrl(imageUrl)}
          className={`w-full h-full object-cover transition-transform duration-500 ${
            isProcessing ? "opacity-60" : "group-hover:scale-105"
          } ${onZoom ? "cursor-zoom-in" : ""}`}
          onLoad={() => setOpacity(1)}
          style={{ opacity }}
          onClick={(event) => {
            event.stopPropagation();
            if (onZoom) onZoom();
          }}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-hyperion-fog-grey/90">
          <img
            alt="Hyperion logo"
            src="/logo.png"
            className="h-20 opacity-80"
          />
          <p className="text-xs uppercase tracking-[0.2em] text-hyperion-deep-sea/70">
            The image is on its way...
          </p>
        </div>
      )}

      {!isProcessing && hasImage && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-5 rounded-[28px] border border-white/35 opacity-0 group-hover:opacity-100 group-hover:scale-[1.03] transition-all duration-500" />
          <div className="absolute -inset-6 rounded-[44px] border border-hyperion-cool-aqua/70 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-500" />
          <div className="absolute -inset-10 rounded-[52px] border border-hyperion-cool-aqua/40 opacity-0 group-hover:opacity-100 blur-3xl transition-opacity duration-700" />
        </div>
      )}

      <StatusBadge status={status} config={config} />

      {!isProcessing && (
        <>
          <DeleteButton onDelete={onDelete} />
          {hasImage && (
            <ZoomButton onZoom={onZoom} onSearchIconClick={onSearchIconClick} />
          )}
        </>
      )}
    </div>
  );
};

export default ImageSection;
