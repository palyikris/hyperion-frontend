import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Save, RotateCcw } from "lucide-react";
import { getFullResUrl, getMediaAssetUrl } from "../../../utils/imageUtils";
import type { Detection, MediaPatchRequest } from "../../../types/lab";
import DetectionsStage from "./DetectionsStage";
import DetectionsVisibilityToggler from "./DetectionsVisibilityToggler";
import DetectionDetailsPanel from "./DetectionDetailsPanel";
import ZoomableContainer from "./ZoomableContainer";
import ConfidenceFilter from "./ConfidenceFilter";
import { Button } from "../../shared/Button";
import { useUpdateMedia } from "../../../hooks/lab/useUpdateMedia";

type DetectionsDisplayProps = {
  mediaId?: string;
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

const DetectionsDisplay = ({
  mediaId,
  hfPath,
  detections,
}: DetectionsDisplayProps) => {
  const { t } = useTranslation();
  const updateMediaMutation = useUpdateMedia();
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

  // Track if detections have been modified
  const hasDirtyDetections = useMemo(() => {
    return Object.keys(bboxOverrides).length > 0;
  }, [bboxOverrides]);

  const handleSaveDetections = async () => {
    if (!mediaId || !hasDirtyDetections) {
      return;
    }

    // Build updated detections array with overridden bboxes
    const updatedDetections = detections.map((det, index) => {
      const key = `${det.id}-${index}`;
      const override = bboxOverrides[key];

      return {
        label: det.label,
        bbox: override || det.bbox,
        area_sqm: det.area_sqm,
      };
    });

    const patchData: MediaPatchRequest = {
      detections: updatedDetections,
    };

    await updateMediaMutation.mutateAsync({
      mediaId,
      patchData,
    });

    // Clear overrides after successful save
    setBboxOverrides({});
  };

  const handleResetDetections = () => {
    setBboxOverrides({});
    setSelectedId(null);
  };

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
              alt={t("lab.detections.loading.logoAlt", "Hyperion logo")}
              src="/logo.png"
              className="h-20 opacity-80"
            />
            <p className="text-xs uppercase tracking-[0.2em] text-hyperion-deep-sea/70">
              {t(
                "lab.detections.loading.imageIncoming",
                "The image is on its way...",
              )}
            </p>
          </div>
        )}

        {/* Error State */}
        {hasError && (
          <div className="flex items-center justify-center p-8 text-red-500">
            <p>{t("lab.detections.error.loadImage", "Failed to load image")}</p>
          </div>
        )}

        {/* Image with Zoom & Pan */}
        <ZoomableContainer>
          <div className="w-full relative" ref={containerRef}>
            <img
              src={getMediaAssetUrl(imageUrl)}
              alt={t(
                "lab.detections.image.mainAlt",
                "Main media image full resolution",
              )}
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

      {/* Save and Reset Buttons */}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <Button
          type="button"
          text={
            t("lab.form.save", "Save metadata") +
            (updateMediaMutation.isPending ? "..." : "")
          }
          icon={<Save className="h-4 w-4 text-white" />}
          className="px-6"
          disabled={
            !mediaId || !hasDirtyDetections || updateMediaMutation.isPending
          }
          onClick={handleSaveDetections}
        />
        <Button
          type="button"
          theme="danger"
          text={t("lab.form.reset", "Reset")}
          icon={<RotateCcw className="h-4 w-4 text-white" />}
          onClick={handleResetDetections}
          className="px-6"
          disabled={updateMediaMutation.isPending}
        />
      </div>
    </div>
  );
};

export default DetectionsDisplay;