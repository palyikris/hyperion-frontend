import { Eye, EyeOff, Focus } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Detection } from "../../../types/lab";

type DetectionsVisibilityTogglerProps = {
  detections: Detection[];
  detectionKeys?: string[];
  hiddenDetections: Record<string, boolean>;
  selectedId: string | null;
  onShowAll: () => void;
  onShowNone: () => void;
  onToggleDetection: (key: string) => void;
  onIsolateDetection: (key: string) => void;
};

const DetectionsVisibilityToggler = ({
  detections,
  detectionKeys,
  hiddenDetections,
  selectedId,
  onShowAll,
  onShowNone,
  onToggleDetection,
  onIsolateDetection,
}: DetectionsVisibilityTogglerProps) => {
  const { t } = useTranslation();

  return (
    <div className="lab-visibility border-t border-hyperion-fog-grey bg-white/70 p-3 sm:p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-hyperion-deep-sea/80">
          {t("lab.detections.visibility.title", "Detections")}
        </h4>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onShowAll}
            className="rounded-md border border-hyperion-deep-sea/30 px-3 py-1 text-xs font-medium text-hyperion-deep-sea transition-colors hover:bg-hyperion-deep-sea/10"
            id="show-all-detections-button"
          >
            {t("lab.detections.visibility.showAll", "Show all")}
          </button>
          <button
            type="button"
            onClick={onShowNone}
            className="rounded-md border border-hyperion-deep-sea/30 px-3 py-1 text-xs font-medium text-hyperion-deep-sea transition-colors hover:bg-hyperion-deep-sea/10"
            id="show-none-detections-button"
          >
            {t("lab.detections.visibility.showNone", "Show none")}
          </button>
        </div>
      </div>

      <div className="lab-detection-list grid max-h-64 gap-2 overflow-y-auto overscroll-contain sm:grid-cols-2 lg:grid-cols-3">
        {detections.length === 0 && (
          <p className="text-sm text-hyperion-deep-sea/70">
            {t("lab.detections.visibility.empty", "No detections found.")}
          </p>
        )}

        {detections.map((det, index) => {
          const key = detectionKeys?.[index] ?? `${det.id}-${index}`;
          const isVisible = !hiddenDetections[key];
          const isSelected = selectedId === key;

          return (
            <div key={key} className="flex min-w-0 max-w-full items-center gap-2">
              <button
                type="button"
                onClick={() => onToggleDetection(key)}
                aria-pressed={isVisible}
                className={`detection-visibility-toggler min-w-0 min-h-11 flex-1 [overflow-wrap:anywhere] inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${
                  isSelected
                    ? "border-hyperion-burnt-orange bg-hyperion-burnt-orange/20 text-hyperion-deep-sea ring-2 ring-hyperion-burnt-orange/50"
                    : isVisible
                      ? "border-hyperion-deep-sea/35 bg-hyperion-deep-sea/10 text-hyperion-deep-sea"
                      : "border-hyperion-fog-grey bg-white text-hyperion-deep-sea/60"
                }`}
                title={
                  isVisible
                    ? t(
                        "lab.detections.visibility.hideDetection",
                        "Hide detection",
                      )
                    : t(
                        "lab.detections.visibility.showDetection",
                        "Show detection",
                      )
                }
              >
                {isVisible ? (
                  <Eye className="h-3.5 w-3.5" />
                ) : (
                  <EyeOff className="h-3.5 w-3.5" />
                )}
                <span>
                  {det.label} - {Math.round(det.confidence * 100)}%
                </span>
              </button>
              <button
                type="button"
                onClick={() => onIsolateDetection(key)}
                className="inline-flex shrink-0 min-h-11 min-w-11 items-center justify-center rounded-xl border border-hyperion-deep-sea/20 bg-white px-2 py-1 text-hyperion-deep-sea transition-colors hover:bg-hyperion-deep-sea/10"
                title={t(
                  "lab.detections.visibility.showOnlyThis",
                  "Show only this detection",
                )}
                aria-label={t("lab.detections.visibility.showOnlyLabel", {
                  label: det.label,
                  defaultValue: "Show only {{label}}",
                })}
                id="focus-detection-button"
              >
                <Focus className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DetectionsVisibilityToggler;
