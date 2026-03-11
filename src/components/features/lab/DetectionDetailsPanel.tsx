import { X, Tag, Percent, Move, Maximize, Save } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import type { Detection } from "../../../types/lab";
import { InputField } from "../../shared/InputField";
import Divider from "../../shared/Divider";
import { trashLabelOptions } from "../../../utils/trashLabels";
import SearchableSelectField from "../../shared/SearchableSelectField";

type DetectionDetailsPanelProps = {
  detection: Detection;
  onClose: () => void;
  onSave?: (detection: Detection) => void;
};

const DetectionDetailsPanel = ({
  detection,
  onClose,
  onSave,
}: DetectionDetailsPanelProps) => {
  const { t } = useTranslation();
  const [selectedLabel, setSelectedLabel] = useState(detection.label);
  const [isModified, setIsModified] = useState(false);
  const confidencePercent = (detection.confidence * 100).toFixed(1);

  const handleLabelChange = (value: string | React.ChangeEvent<HTMLSelectElement>) => {
    if (typeof value === "string") {
      setSelectedLabel(value);
    } else {
      setSelectedLabel(value.target.value);
    }
    setIsModified(true);
  };

  const handleSave = () => {
    if (onSave && isModified) {
      onSave({
        ...detection,
        label: selectedLabel,
      });
      setIsModified(false);
    }
  };

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
          {/* Label - now editable SelectField */}
          <SearchableSelectField
            label={t("lab.detections.panel.label", "Label")}
            icon={Tag}
            id={`label-${detection.id}`}
            options={trashLabelOptions}
            value={selectedLabel}
            onChange={handleLabelChange}
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

        {/* Save Button */}
        {isModified && (
          <button
            type="button"
            onClick={handleSave}
            className="mt-4 w-full flex items-center justify-center gap-2 rounded-lg bg-hyperion-deep-sea hover:bg-hyperion-deep-sea/90 text-hyperion-cream font-semibold py-2 px-4 transition-colors"
            aria-label={t("lab.detections.panel.save", "Save changes")}
          >
            <Save className="h-4 w-4" />
            {t("lab.detections.panel.save", "Save changes")}
          </button>
        )}
      </div>
    </div>
  );
};

export default DetectionDetailsPanel;
