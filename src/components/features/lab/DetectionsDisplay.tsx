import { useEffect, useMemo, useRef, useState } from "react";
import { getFullResUrl } from "../../../utils/imageUtils";
import type { Detection } from "../../../types/lab";
import DetectionsStage from "./DetectionsStage";
import DetectionsVisibilityToggler from "./DetectionsVisibilityToggler";
import DetectionDetailsPanel from "./DetectionDetailsPanel";
import ZoomableContainer from "./ZoomableContainer";
import ConfidenceFilter from "./ConfidenceFilter";

type DetectionsDisplayProps = {
  hfPath?: string;
  detections: Detection[];
};

type NormalizedBBox = {
  x: number;
  y: number;
  w: number;
  h: number;
};

type KeyedDetection = {
  key: string;
  detection: Detection;
  originalIndex: number;
};

const hfBaseUrl =
  "https://huggingface.co/datasets/palyikris/hyperion-media/resolve/main";

const DetectionsDisplay = ({ hfPath, detections }: DetectionsDisplayProps) => {
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [hiddenDetections, setHiddenDetections] = useState<
    Record<string, boolean>
  >({});
  const [bboxOverrides, setBboxOverrides] = useState<
    Record<string, NormalizedBBox>
  >({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const keyedDetections = useMemo<KeyedDetection[]>(() => {
    return detections.map((det, originalIndex) => {
      const key = `${det.id}-${originalIndex}`;
      const override = bboxOverrides[key];
      return {
        key,
        originalIndex,
        detection: override ? { ...det, bbox: override } : det,
      };
    });
  }, [detections, bboxOverrides]);

  // Filter detections by confidence threshold
  const filteredDetections = useMemo<KeyedDetection[]>(() => {
    return keyedDetections.filter(
      ({ detection }) => detection.confidence >= confidenceThreshold / 100,
    );
  }, [keyedDetections, confidenceThreshold]);

  // Get the selected detection object
  const selectedDetection = useMemo(() => {
    if (!selectedId) return null;
    const selected = keyedDetections.find((item) => item.key === selectedId);
    return selected
      ? {
          detection: selected.detection,
          index: selected.originalIndex,
        }
      : null;
  }, [selectedId, keyedDetections]);

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
    return filteredDetections.some((item) => !hiddenDetections[item.key]);
  }, [filteredDetections, hiddenDetections]);

  if (!hfPath) {
    return null;
  }

  const imageUrl = getFullResUrl(hfPath);

  const showAll = () => {
    setHiddenDetections({});
  };

  const showNone = () => {
    const next: Record<string, boolean> = {};
    filteredDetections.forEach((item) => {
      next[item.key] = true;
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

    filteredDetections.forEach((item) => {
      next[item.key] = item.key !== key;
    });

    setHiddenDetections(next);
  };

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

        {/* Image with Zoom & Pan */}
        <ZoomableContainer>
          <div className="w-full relative" ref={containerRef}>
            <img
              src={`${hfBaseUrl}/${imageUrl}`}
              alt="Main media image full res"
              className="h-auto w-full transition-opacity duration-500"
              style={{
                opacity: isImageLoading ? 0 : isImageTransparent ? 0.4 : 1,
              }}
              onLoad={() => setIsImageLoading(false)}
              onError={() => {
                setIsImageLoading(false);
                setHasError(true);
              }}
            />
            <DetectionsStage
              detections={filteredDetections.map((item) => item.detection)}
              detectionKeys={filteredDetections.map((item) => item.key)}
              hiddenDetections={hiddenDetections}
              dimensions={dimensions}
              isImageLoading={isImageLoading}
              hasError={hasError}
              selectedId={selectedId}
              onSelectDetection={(id) => setSelectedId(id)}
              onUpdateDetectionBBox={(id, bbox) => {
                setBboxOverrides((prev) => ({
                  ...prev,
                  [id]: bbox,
                }));
              }}
            />
          </div>
        </ZoomableContainer>

        <ConfidenceFilter
          confidenceThreshold={confidenceThreshold}
          filteredCount={filteredDetections.length}
          totalCount={detections.length}
          onChange={setConfidenceThreshold}
        />

        <DetectionsVisibilityToggler
          detections={filteredDetections.map((item) => item.detection)}
          detectionKeys={filteredDetections.map((item) => item.key)}
          hiddenDetections={hiddenDetections}
          selectedId={selectedId}
          onShowAll={showAll}
          onShowNone={showNone}
          onToggleDetection={toggleDetection}
          onIsolateDetection={isolateDetection}
        />

        {/* Detection Details Panel */}
        {selectedDetection && (
          <DetectionDetailsPanel
            detection={selectedDetection.detection}
            onClose={() => setSelectedId(null)}
          />
        )}
      </div>
    </div>
  );
};

export default DetectionsDisplay;