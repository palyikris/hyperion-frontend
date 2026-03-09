type ConfidenceFilterProps = {
  confidenceThreshold: number;
  filteredCount: number;
  totalCount: number;
  onChange: (value: number) => void;
};

const ConfidenceFilter = ({
  confidenceThreshold,
  filteredCount,
  totalCount,
  onChange,
}: ConfidenceFilterProps) => {
  return (
    <div className="border-t border-hyperion-fog-grey bg-white/70 px-4 py-3">
      <div className="flex items-center justify-between gap-4">
        <label
          htmlFor="confidence-slider"
          className="text-xs font-semibold uppercase tracking-[0.2em] text-hyperion-deep-sea/80"
        >
          Min Confidence
        </label>
        <span className="text-sm font-medium text-hyperion-deep-sea">
          {confidenceThreshold}%
        </span>
      </div>
      <input
        id="confidence-slider"
        type="range"
        min="0"
        max="100"
        step="5"
        value={confidenceThreshold}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-hyperion-deep-sea"
      />
      <div className="mt-1 flex justify-between text-xs text-hyperion-slate-grey/60">
        <span>0%</span>
        <span className="text-hyperion-deep-sea/70">
          {filteredCount} / {totalCount} detections
        </span>
        <span>100%</span>
      </div>
    </div>
  );
};

export default ConfidenceFilter;