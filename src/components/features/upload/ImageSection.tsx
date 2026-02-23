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
  const hasImage = Boolean(imageUrl);

  return (
    <div className="aspect-4/3 relative overflow-hidden bg-hyperion-fog-grey">
      {hasImage ? (
        <img
          alt={title}
          src={`https://huggingface.co/datasets/palyikris/hyperion-media/resolve/main/${imageUrl}`}
          className={`w-full h-full object-cover transition-transform duration-500 ${
            isProcessing ? "opacity-60" : "group-hover:scale-105"
          }`}
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

      {!isProcessing && hasImage && <ZoomButton onZoom={onZoom} />}
    </div>
  );
};

export default ImageSection;
