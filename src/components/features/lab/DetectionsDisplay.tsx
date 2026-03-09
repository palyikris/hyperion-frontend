import { useEffect, useMemo, useRef, useState } from "react";
import { getFullResUrl } from "../../../utils/imageUtils";
import type { Detection } from "../../../types/lab";
import DetectionsStage from "./DetectionsStage";
import DetectionsVisibilityToggler from "./DetectionsVisibilityToggler";

type DetectionsDisplayProps = {
  hfPath?: string;
  detections: Detection[];
};

const hfBaseUrl =
  "https://huggingface.co/datasets/palyikris/hyperion-media/resolve/main";

const DetectionsDisplay = ({ hfPath, detections }: DetectionsDisplayProps) => {
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [hiddenDetections, setHiddenDetections] = useState<Record<string, boolean>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    // ensure the canvas perfectly matches the image
    // even if the user resizes their browser window.
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        const { width, height } = entries[0].contentRect;
        setDimensions({ width, height });
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const isImageTransparent = useMemo(() => {
    // Detections are visible by default unless explicitly hidden.
    return detections.some((det, index) => !hiddenDetections[`${det.id}-${index}`]);
  }, [detections, hiddenDetections]);

  if (!hfPath) {
    return null;
  }

  const imageUrl = getFullResUrl(hfPath);

  const showAll = () => {
    setHiddenDetections({});
  };

  const showNone = () => {
    const next: Record<string, boolean> = {};
    detections.forEach((det, index) => {
      next[`${det.id}-${index}`] = true;
    });
    setHiddenDetections(next);
  };

  const toggleDetection = (key: string) => {
    setHiddenDetections((prev) => ({
      ...prev,
      [key]: !(prev[key] ?? false),
    }));
  };

  const isolateDetection = (key: string) => {
    const next: Record<string, boolean> = {};

    detections.forEach((det, index) => {
      const detKey = `${det.id}-${index}`;
      next[detKey] = detKey !== key;
    });

    setHiddenDetections(next);
  };

  console.log(selectedId)

  return (
    <div className="col-span-12 rounded-lg bg-white/80 p-6 shadow-lg">
      <div className="relative h-auto w-full overflow-hidden rounded-2xl border border-hyperion-fog-grey">
        {/* Loading State */}
        {isImageLoading && !hasError && (
          <div className="absolute w-full h-full flex flex-col items-center justify-center gap-4 bg-hyperion-fog-grey/90">
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

        {/* Error State */}
        {hasError && (
          <div className="flex items-center justify-center p-8 text-red-500">
            <p>Failed to load image</p>
          </div>
        )}

        {/* Image */}
        <div className="w-full relative" ref={containerRef}>
          <img
            src={`${hfBaseUrl}/${imageUrl}`}
            alt="Main media image full res"
            className="h-auto w-full transition-opacity duration-500"
            style={{ opacity: isImageLoading ? 0 : isImageTransparent ? 0.4 : 1 }}
            onLoad={() => setIsImageLoading(false)}
            onError={() => {
              setIsImageLoading(false);
              setHasError(true);
            }}
          />
          <DetectionsStage
            detections={detections}
            hiddenDetections={hiddenDetections}
            dimensions={dimensions}
            isImageLoading={isImageLoading}
            hasError={hasError}
            selectedId={selectedId}
            onSelectDetection={(id) => setSelectedId(id)}
          />
        </div>

        <DetectionsVisibilityToggler
          detections={detections}
          hiddenDetections={hiddenDetections}
          onShowAll={showAll}
          onShowNone={showNone}
          onToggleDetection={toggleDetection}
          onIsolateDetection={isolateDetection}
        />
      </div>
    </div>
  );
};

export default DetectionsDisplay;