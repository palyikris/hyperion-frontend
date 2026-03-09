import { X, Tag, Percent, Move, Maximize } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Detection } from "../../../types/lab";
import { InputField } from "../../shared/InputField";
import Divider from "../../shared/Divider";

type DetectionDetailsPanelProps = {
  detection: Detection;
  onClose: () => void;
};

const DetectionDetailsPanel = ({
  detection,
  onClose,
}: DetectionDetailsPanelProps) => {
  const { t } = useTranslation();
  const confidencePercent = (detection.confidence * 100).toFixed(1);

  return (
    <div className="border-t border-hyperion-fog-grey bg-linear-to-br from-white/90 to-hyperion-cream/50 p-4">
      <div className="mb-3 flex items-start justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-hyperion-deep-sea/80">
          {t("lab.detections.panel.title", "Detection details")}
        </h4>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 text-hyperion-deep-sea/60 transition-colors hover:bg-hyperion-deep-sea/10 hover:text-hyperion-deep-sea"
          aria-label={t("lab.detections.panel.close", "Close details")}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <InputField
            label={t("lab.detections.panel.label", "Label")}
            icon={Tag}
            type="text"
            id={`label-${detection.id}`}
            placeholder=""
            inputProps={{
              value: detection.label,
              disabled: true,
            }}
            className="flex-1"
          />

          {/* Confidence */}
          <InputField
            label={t("lab.detections.panel.confidence", "Confidence")}
            icon={Percent}
            type="text"
            id={`confidence-${detection.id}`}
            placeholder=""
            inputProps={{
              value: `${confidencePercent}%`,
              disabled: true,
            }}
          />

          {/* Area */}
          {detection.area_sqm !== undefined && (
            <InputField
              label={t("lab.detections.panel.area", "Estimated area (m2)")}
              icon={Maximize}
              type="text"
              id={`area-${detection.id}`}
              placeholder=""
              inputProps={{
                value: detection.area_sqm.toFixed(2),
                disabled: true,
              }}
            />
          )}
        </div>

        <Divider
          label={t(
            "lab.detections.panel.boundingBoxTitle",
            "Bounding box (relative to image dimensions)",
          )}
          bgColorClassName="bg-white"
          className="mb-0 py-4"
        ></Divider>

        {/* Bounding Box */}
        <div>
          <div className="grid grid-cols-2 gap-2">
            <InputField
              label={t("lab.detections.panel.x", "X")}
              icon={Move}
              type="text"
              id={`bbox-x-${detection.id}`}
              placeholder=""
              inputProps={{
                value: detection.bbox.x.toFixed(4),
                disabled: true,
              }}
            />
            <InputField
              label={t("lab.detections.panel.y", "Y")}
              icon={Move}
              type="text"
              id={`bbox-y-${detection.id}`}
              placeholder=""
              inputProps={{
                value: detection.bbox.y.toFixed(4),
                disabled: true,
              }}
            />
            <InputField
              label={t("lab.detections.panel.width", "Width")}
              icon={Move}
              type="text"
              id={`bbox-w-${detection.id}`}
              placeholder=""
              inputProps={{
                value: detection.bbox.w.toFixed(4),
                disabled: true,
              }}
            />
            <InputField
              label={t("lab.detections.panel.height", "Height")}
              icon={Move}
              type="text"
              id={`bbox-h-${detection.id}`}
              placeholder=""
              inputProps={{
                value: detection.bbox.h.toFixed(4),
                disabled: true,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetectionDetailsPanel;
