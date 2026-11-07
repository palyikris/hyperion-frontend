import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Save, RotateCcw, PlusSquare, Trash2 } from "lucide-react";
import { getFullResUrl, getMediaAssetUrl } from "../../../utils/imageUtils";
import type { Detection, MediaPatchRequest } from "../../../types/lab";
import DetectionsStage from "./DetectionsStage";
import DetectionsVisibilityToggler from "./DetectionsVisibilityToggler";
import DetectionDetailsPanel from "./DetectionDetailsPanel";
import ZoomableContainer from "./ZoomableContainer";
import ConfidenceFilter from "./ConfidenceFilter";
import { Button } from "../../shared/Button";
import { useUpdateMedia } from "../../../hooks/lab/useUpdateMedia";
import { useNavigate } from "react-router-dom";
import { useIsMutating } from "@tanstack/react-query";

type DetectionsDisplayProps = {
  mediaId?: string;
  hfPath?: string;
  detections: Detection[];
  item_type: "image" | "video" | undefined;
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

const DetectionsEditor = ({
  mediaId,
  hfPath,
  detections,
  item_type,
}: DetectionsDisplayProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const updateMediaMutation = useUpdateMedia(mediaId);
  const isSaving = useIsMutating({ mutationKey: ["lab", "update", mediaId] }) > 0;
  const savingRef = useRef(false);
  const [draftBase, setDraftBase] = useState<Detection[] | null>(null);
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

  // States for Drawing & Deleting Mode
  const [newDetections, setNewDetections] = useState<Detection[]>([]);
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [isDrawingMode, setIsDrawingMode] = useState(false);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Combine fetched detections + locally added detections
  const allDetections = useMemo(() => {
    return [...(draftBase ?? detections), ...newDetections];
  }, [detections, newDetections, draftBase]);
  const startEditing = () => setDraftBase((current) => current ?? detections);

  // Keep original indices intact to prevent key-shifting bugs
  const keyedDetections = useMemo<KeyedDetection[]>(() => {
    return allDetections.map((det, originalIndex) => {
      const key = `${det.id}-${originalIndex}`;
      const override = bboxOverrides[key];
      return {
        key,
        originalIndex,
        detection: {
          ...det,
          label: labelOverrides[key] ?? det.label,
          bbox: override ?? det.bbox,
          area_sqm: override ? undefined : det.area_sqm,
        },
      };
    });
  }, [allDetections, bboxOverrides, labelOverrides]);

  // Filter out deleted items and items below confidence threshold
  const filteredDetections = useMemo<KeyedDetection[]>(() => {
    return keyedDetections.filter(
      ({ detection }) =>
        detection.confidence >= confidenceThreshold / 100 &&
        !deletedIds.has(detection.id),
    );
  }, [keyedDetections, confidenceThreshold, deletedIds]);

  const selectedDetection = useMemo(() => {
    if (!selectedId) return null;
    const selected = filteredDetections.find((item) => item.key === selectedId);
    return selected
      ? {
          detection: selected.detection,
          index: selected.originalIndex,
        }
      : null;
  }, [selectedId, filteredDetections]);

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

  // Keyboard shortcut for deleting a detection
  const handleDeleteSelected = useCallback(() => {
    if (!selectedId || isSaving || savingRef.current) return;
    const item = keyedDetections.find((d) => d.key === selectedId);
    if (!item) return;

    setDraftBase((current) => current ?? detections);
    setDeletedIds((prev) => new Set(prev).add(item.detection.id));
    setSelectedId(null);
  }, [selectedId, keyedDetections, isSaving, detections]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Backspace" || e.key === "Delete") {
        // Prevent deletion if user is typing in an input inside the details panel
        const active = document.activeElement;
        if (
          active &&
          (active.tagName === "INPUT" || active.tagName === "TEXTAREA")
        ) {
          return;
        }
        if (selectedId) {
          handleDeleteSelected();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedId, handleDeleteSelected]);

  const isImageTransparent = useMemo(() => {
    return filteredDetections.some((item) => !hiddenDetections[item.key]);
  }, [filteredDetections, hiddenDetections]);

  // Track if detections have been modified
  const hasDirtyDetections = useMemo(() => {
    return (
      Object.keys(bboxOverrides).length > 0 ||
      Object.keys(labelOverrides).length > 0 ||
      newDetections.length > 0 ||
      deletedIds.size > 0
    );
  }, [bboxOverrides, labelOverrides, newDetections, deletedIds]);

  const handleSaveDetections = async () => {
    if (!mediaId || !hasDirtyDetections || isSaving || savingRef.current) return;

    // Build the final array: apply overrides, filter out deleted, strip internal IDs
    const updatedDetections = allDetections
      .map((det, index) => {
        const key = `${det.id}-${index}`;
        const bboxOverride = bboxOverrides[key];
        const labelOverride = labelOverrides[key];

        return {
          id: det.id,
          label: labelOverride || det.label,
          bbox: bboxOverride || det.bbox,
          area_sqm: bboxOverride ? undefined : det.area_sqm,
        };
      })
      .filter((det) => !deletedIds.has(det.id))
      .map((det) => ({
        id: det.id.startsWith("new-") ? undefined : det.id,
        label: det.label,
        bbox: det.bbox,
        area_sqm: det.area_sqm,
      }));

    const patchData: MediaPatchRequest = {
      item_type: item_type || "image", // Default to "image" if item_type is undefined
      detections: updatedDetections,
    };

    savingRef.current = true;
    try {
      await updateMediaMutation.mutateAsync({ mediaId, patchData });

      if (item_type === "video" && updatedDetections.length === 0) {
        navigate("/vault");
        return;
      }

      setBboxOverrides({});
      setLabelOverrides({});
      setNewDetections([]);
      setDeletedIds(new Set());
      setIsDrawingMode(false);
      setSelectedId(null);
      setDraftBase(null);
    } catch {
      // The mutation displays the error. Keep the unsaved draft for retry.
    } finally {
      savingRef.current = false;
    }
  };

  const handleResetDetections = () => {
    if (isSaving || savingRef.current) return;
    setBboxOverrides({});
    setLabelOverrides({});
    setNewDetections([]);
    setDeletedIds(new Set());
    setSelectedId(null);
    setIsDrawingMode(false);
    setDraftBase(null);
  };

  const handleAddDetection = (bbox: NormalizedBBox) => {
    if (isSaving || savingRef.current) return;
    startEditing();
    const newDet: Detection = {
      id: `new-${crypto.randomUUID()}`,
      label: "unknown",
      confidence: 1.0,
      bbox,
    };

    setNewDetections((prev) => [...prev, newDet]);
    setIsDrawingMode(false);

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

        <ZoomableContainer panEnabled={!isDrawingMode && !isSaving}>
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
              disabled={isSaving || updateMediaMutation.isPending}
              onSelectDetection={(id) => setSelectedId(id)}
              onUpdateDetectionBBox={(id, bbox) => {
                if (isSaving || savingRef.current) return;
                startEditing();
                setBboxOverrides((prev) => ({ ...prev, [id]: bbox }));
              }}
              onAddDetection={handleAddDetection}
            />
          </div>
        </ZoomableContainer>

        <ConfidenceFilter
          confidenceThreshold={confidenceThreshold}
          filteredCount={filteredDetections.length}
          totalCount={allDetections.filter((d) => !deletedIds.has(d.id)).length}
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
            disabled={isSaving}
            onClose={() => setSelectedId(null)}
            onLabelChange={(label) => {
              if (isSaving || savingRef.current) return;
              startEditing();
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
          className="px-6"
          onClick={() => {
            if (isSaving || savingRef.current) return;
            setIsDrawingMode(!isDrawingMode);
            setSelectedId(null);
          }}
          id="add-detection-btn"
          disabled={isSaving}
        />

        {selectedId && !isDrawingMode && (
          <Button
            type="button"
            text={t("lab.form.delete_selected", "Delete")}
            icon={<Trash2 className="h-4 w-4 text-white" />}
            onClick={handleDeleteSelected}
            className="px-6"
            theme="danger"
            id="delete-selected-detection-btn"
            disabled={isSaving}
          />
        )}

        <div className="flex-grow"></div>

        <Button
          type="button"
          text={
            t("lab.form.save", "Save metadata") +
            (updateMediaMutation.isPending ? "..." : "")
          }
          icon={<Save className="h-4 w-4 text-white" />}
          className="px-6"
          disabled={
            !mediaId || !hasDirtyDetections || isSaving || updateMediaMutation.isPending
          }
          onClick={handleSaveDetections}
          id="save-detections-btn"
        />
        <Button
          type="button"
          theme="danger"
          text={t("lab.form.reset", "Reset")}
          icon={<RotateCcw className="h-4 w-4 text-white" />}
          onClick={handleResetDetections}
          className="px-6"
          disabled={isSaving || updateMediaMutation.isPending}
          id="reset-detections-btn"
        />
      </div>
    </div>
  );
};

const DetectionsDisplay = (props: DetectionsDisplayProps) =>
  <DetectionsEditor key={`${props.item_type}:${props.mediaId}:${props.hfPath}`} {...props} />;

export default DetectionsDisplay;
