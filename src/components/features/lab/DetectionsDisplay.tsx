import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Save, RotateCcw, PlusSquare } from "lucide-react";
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
  const [labelOverrides, setLabelOverrides] = useState<Record<string, string>>(
    {},
  );

  // New States for Drawing Mode
  const [newDetections, setNewDetections] = useState<Detection[]>([]);
  const [isDrawingMode, setIsDrawingMode] = useState(false);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Combine fetched detections + locally added detections
  const allDetections = useMemo(() => {
    return [...detections, ...newDetections];
  }, [detections, newDetections]);

  const keyedDetections = useMemo<KeyedDetection[]>(() => {
    return allDetections.map((det, originalIndex) => {
      const key = `${det.id}-${originalIndex}`;
      const override = bboxOverrides[key];
      return {
        key,
        originalIndex,
        detection: override ? { ...det, bbox: override } : det,
      };
    });
  }, [allDetections, bboxOverrides]);

  const filteredDetections = useMemo<KeyedDetection[]>(() => {
    return keyedDetections.filter(
      ({ detection }) => detection.confidence >= confidenceThreshold / 100,
    );
  }, [keyedDetections, confidenceThreshold]);

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
    return filteredDetections.some((item) => !hiddenDetections[item.key]);
  }, [filteredDetections, hiddenDetections]);

  // Track if detections have been modified (or if new ones were added)
  const hasDirtyDetections = useMemo(() => {
    return (
      Object.keys(bboxOverrides).length > 0 ||
      Object.keys(labelOverrides).length > 0 ||
      newDetections.length > 0
    );
  }, [bboxOverrides, labelOverrides, newDetections]);

  const handleSaveDetections = async () => {
    if (!mediaId || !hasDirtyDetections) return;

    // Send the combined list of all updated/new detections
    const updatedDetections = allDetections.map((det, index) => {
      const key = `${det.id}-${index}`;
      const bboxOverride = bboxOverrides[key];
      const labelOverride = labelOverrides[key];

      return {
        label: labelOverride || det.label,
        bbox: bboxOverride || det.bbox,
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

    setBboxOverrides({});
    setLabelOverrides({});
    setNewDetections([]); // Cleared because the mutation syncs the updated backend list
    setIsDrawingMode(false);
  };

  const handleResetDetections = () => {
    setBboxOverrides({});
    setLabelOverrides({});
    setNewDetections([]);
    setSelectedId(null);
    setIsDrawingMode(false);
  };

  const handleAddDetection = (bbox: NormalizedBBox) => {
    const newDet: Detection = {
      id: `new-${Date.now()}`,
      label: "unknown",
      confidence: 1.0,
      bbox,
    };

    setNewDetections((prev) => [...prev, newDet]);
    setIsDrawingMode(false); // Snap out of draw mode after creating one

    // Automatically select the new detection so the user can easily rename it
    const newIndex = allDetections.length;
    setSelectedId(`${newDet.id}-${newIndex}`);
  };

  if (!hfPath) return null;

  const imageUrl = getFullResUrl(hfPath);

  const showAll = () => setHiddenDetections({});
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

        {hasError && (
          <div className="flex items-center justify-center p-8 text-red-500">
            <p>{t("lab.detections.error.loadImage", "Failed to load image")}</p>
          </div>
        )}

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
              isDrawingMode={isDrawingMode}
              onSelectDetection={(id) => setSelectedId(id)}
              onUpdateDetectionBBox={(id, bbox) => {
                setBboxOverrides((prev) => ({ ...prev, [id]: bbox }));
              }}
              onAddDetection={handleAddDetection}
            />
          </div>
        </ZoomableContainer>

        <ConfidenceFilter
          confidenceThreshold={confidenceThreshold}
          filteredCount={filteredDetections.length}
          totalCount={allDetections.length}
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

        {selectedDetection && !isDrawingMode && (
          <DetectionDetailsPanel
            detection={selectedDetection.detection}
            onClose={() => setSelectedId(null)}
            onLabelChange={(label) => {
              const key = `${selectedDetection.detection.id}-${selectedDetection.index}`;
              setLabelOverrides((prev) => ({ ...prev, [key]: label }));
            }}
          />
        )}
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <Button
          type="button"
          text={
            isDrawingMode
              ? t("lab.form.cancel_draw", "Cancel Drawing")
              : t("lab.form.add_detection", "Add Detection")
          }
          icon={!isDrawingMode && <PlusSquare className="h-4 w-4 text-white" />}
          onClick={() => {
            setIsDrawingMode(!isDrawingMode);
            setSelectedId(null);
          }}
          className={`px-6 ${isDrawingMode ? "bg-amber-600 hover:bg-amber-700 text-white" : ""}`}
        />
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
