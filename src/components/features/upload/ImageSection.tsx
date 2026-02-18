import type { CardStatus } from "../../../types/upload";
import StatusBadge from "./StatusBadge";
import ZoomButton from "./ZoomButton";

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
};

const ImageSection = ({
  imageUrl,
  title,
  status,
  isProcessing,
  config,
  onZoom,
}: ImageSectionProps) => {
  return (
    <div className="aspect-4/3 relative overflow-hidden bg-hyperion-fog-grey">
      <img
        alt={title}
        src={imageUrl}
        className={`w-full h-full object-cover transition-transform duration-500 ${
          isProcessing ? "opacity-60" : "group-hover:scale-105"
        }`}
      />

      {!isProcessing && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-5 rounded-[28px] border border-white/35 opacity-0 group-hover:opacity-100 group-hover:scale-[1.03] transition-all duration-500" />
          <div className="absolute -inset-6 rounded-[44px] border border-hyperion-cool-aqua/70 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-500" />
          <div className="absolute -inset-10 rounded-[52px] border border-hyperion-cool-aqua/40 opacity-0 group-hover:opacity-100 blur-3xl transition-opacity duration-700" />
        </div>
      )}

      <StatusBadge status={status} config={config} />

      {!isProcessing && <ZoomButton onZoom={onZoom} />}
    </div>
  );
};

export default ImageSection;
