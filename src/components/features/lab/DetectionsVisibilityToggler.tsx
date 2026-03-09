import { Eye, EyeOff, Focus } from "lucide-react";
import type { Detection } from "../../../types/lab";

type DetectionsVisibilityTogglerProps = {
  detections: Detection[];
  hiddenDetections: Record<string, boolean>;
  onShowAll: () => void;
  onShowNone: () => void;
  onToggleDetection: (key: string) => void;
  onIsolateDetection: (key: string) => void;
};

const DetectionsVisibilityToggler = ({
  detections,
  hiddenDetections,
  onShowAll,
  onShowNone,
  onToggleDetection,
  onIsolateDetection,
}: DetectionsVisibilityTogglerProps) => {
  return (
    <div className="border-t border-hyperion-fog-grey bg-white/70 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-hyperion-deep-sea/80">
          Detections
        </h4>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onShowAll}
            className="rounded-md border border-hyperion-deep-sea/30 px-3 py-1 text-xs font-medium text-hyperion-deep-sea transition-colors hover:bg-hyperion-deep-sea/10"
          >
            Show all
          </button>
          <button
            type="button"
            onClick={onShowNone}
            className="rounded-md border border-hyperion-deep-sea/30 px-3 py-1 text-xs font-medium text-hyperion-deep-sea transition-colors hover:bg-hyperion-deep-sea/10"
          >
            Show none
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {detections.length === 0 && (
          <p className="text-sm text-hyperion-deep-sea/70">No detections found.</p>
        )}

        {detections.map((det, index) => {
          const key = `${det.id}-${index}`;
          const isVisible = !hiddenDetections[key];

          return (
            <div key={key} className="inline-flex items-center gap-1">
              <button
                type="button"
                onClick={() => onToggleDetection(key)}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  isVisible
                    ? "border-hyperion-deep-sea/35 bg-hyperion-deep-sea/10 text-hyperion-deep-sea"
                    : "border-hyperion-fog-grey bg-white text-hyperion-deep-sea/60"
                }`}
                title={isVisible ? "Hide detection" : "Show detection"}
              >
                {isVisible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                <span>{det.label}</span>
              </button>
              <button
                type="button"
                onClick={() => onIsolateDetection(key)}
                className="inline-flex items-center justify-center rounded-full border border-hyperion-deep-sea/30 bg-white px-2 py-1 text-hyperion-deep-sea transition-colors hover:bg-hyperion-deep-sea/10"
                title="Show only this detection"
                aria-label={`Show only ${det.label}`}
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
