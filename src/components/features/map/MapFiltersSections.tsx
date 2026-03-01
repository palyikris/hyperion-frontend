import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Filter, Navigation, Maximize, X, RefreshCcw } from "lucide-react";

import { Title } from "../../shared/Title";
import { Button } from "../../shared/Button";

type ViewMode = "markers" | "heatmap" | "grid";

type RegionSelectionSectionProps = {
  isRegionActive: boolean;
  onCaptureBounds: () => void;
  onClearRegion: () => void;
};

type DetectionQualitySectionProps = {
  minConfidenceValue: number;
  onChange: (value: number) => void;
};

type StatusFilterSectionProps = {
  effectiveHasTrashValue: boolean | undefined;
  isGridMode: boolean;
  onHasTrashChange: (value: boolean | undefined) => void;
};

type ViewModeSectionProps = {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
};

export const FilterPanelHeader: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-3 pb-2 border-b border-hyperion-fog-grey/50">
      <span className="inline-flex items-center justify-center bg-hyperion-deep-sea/10 rounded-xl p-2">
        <Filter size={18} className="text-hyperion-deep-sea" />
      </span>
      <Title
        text={t("map.filters.spatial", "Spatial Filters")}
        colorFrom="hyperion-forest"
        colorVia="hyperion-deep-sea"
        colorTo="hyperion-cool-aqua"
        size="sm"
        className="tracking-tight text-base!"
      />
    </div>
  );
};

export const RegionSelectionSection: React.FC<RegionSelectionSectionProps> = ({
  isRegionActive,
  onCaptureBounds,
  onClearRegion,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-end mb-1">
        {isRegionActive && (
          <button
            type="button"
            onClick={onClearRegion}
            className="text-[10px] font-bold text-hyperion-burnt-orange hover:underline flex items-center gap-1"
          >
            <RefreshCcw size={10} /> {t("map.filters.clear", "clear")}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-2">
        <Button
          type="button"
          text={
            isRegionActive
              ? t("map.filters.update_selection", "Update Selection")
              : t("map.filters.sync_view", "Sync with Viewport")
          }
          onClick={onCaptureBounds}
          theme="primary"
          className="w-full py-3 text-[10px] font-bold rounded-xl tracking-widest shadow-sm"
          icon={<Navigation size={12} className="rotate-45" />}
        />

        {isRegionActive && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-hyperion-sage-mint/10 border border-hyperion-sage-mint/30 rounded-xl p-3 flex items-start gap-3"
          >
            <Maximize size={12} className="text-hyperion-deep-sea mt-0.5" />
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-hyperion-deep-sea uppercase">
                {t("map.filters.area_locked", "Area Locked")}
              </span>
              <span className="text-[8px] text-hyperion-slate-grey leading-tight mt-0.5">
                {t(
                  "map.filters.area_locked_desc",
                  "Filtering data within current map boundaries.",
                )}
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export const DetectionQualitySection: React.FC<DetectionQualitySectionProps> = ({
  minConfidenceValue,
  onChange,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      <label className="text-[10px] font-black text-hyperion-slate-grey uppercase tracking-[0.2em]">
        {t("map.filters.detection_quality", "Detection Quality")}
      </label>
      <input
        type="range"
        className="w-full h-1.5 bg-hyperion-fog-grey rounded-lg appearance-none cursor-pointer accent-hyperion-sage-mint transition-all"
        min="0"
        max="100"
        value={minConfidenceValue}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <div className="flex justify-between text-[10px] font-bold text-hyperion-deep-sea px-1">
        <span>{t("map.filters.zero_percent", "0%")}</span>
        <span className="bg-hyperion-sage-mint/20 px-2 py-0.5 rounded-full text-[9px]">
          {t("map.filters.min", "Min")}: {minConfidenceValue}%
        </span>
        <span>{t("map.filters.hundred_percent", "100%")}</span>
      </div>
    </div>
  );
};

export const StatusFilterSection: React.FC<StatusFilterSectionProps> = ({
  effectiveHasTrashValue,
  isGridMode,
  onHasTrashChange,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <div className="flex gap-4">
        <Button
          text={t("map.filters.has_trash", "HAS TRASH")}
          onClick={() => onHasTrashChange(true)}
          type="button"
          theme="danger"
          className={`px-4 text-xs w-full transition-all ${
            effectiveHasTrashValue === true
              ? "ring-2 ring-hyperion-muted-gold/90"
              : "opacity-70"
          }`}
          disabled={isGridMode}
        />
        <Button
          text={t("map.filters.clean", "CLEAN")}
          onClick={() => onHasTrashChange(false)}
          type="button"
          theme="info"
          className={`px-4 text-xs w-full transition-all ${
            effectiveHasTrashValue === false
              ? "ring-2 ring-hyperion-deep-sea/50"
              : "opacity-70"
          }`}
          disabled={isGridMode}
        />
        <button
          type="button"
          onClick={() => onHasTrashChange(undefined)}
          disabled={isGridMode}
          aria-label={t("map.filters.clear_status", "Clear status filter")}
          title={t("map.filters.clear_status", "Clear status filter")}
          className={`h-11 w-11 rounded-xl border flex items-center justify-center transition-all ${
            effectiveHasTrashValue === undefined
              ? "bg-hyperion-deep-sea text-hyperion-cream border-hyperion-deep-sea"
              : "bg-hyperion-cream text-hyperion-deep-sea border-hyperion-fog-grey hover:bg-hyperion-fog-grey/50"
          } ${isGridMode ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <X size={16} />
        </button>
      </div>
      {isGridMode && (
        <p className="text-[9px] font-semibold text-hyperion-burnt-orange">
          {t(
            "map.filters.has_trash_locked_grid",
            "Analysis Grid always filters to HAS TRASH.",
          )}
        </p>
      )}
    </>
  );
};

export const ViewModeSection: React.FC<ViewModeSectionProps> = ({
  viewMode,
  onViewModeChange,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      <label className="text-[10px] font-black text-hyperion-slate-grey uppercase tracking-[0.2em]">
        {t("map.filters.view_mode", "View Mode")}
      </label>
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => onViewModeChange("markers")}
          className={`rounded-xl px-3 py-2 text-[10px] font-bold tracking-wider border transition-all ${
            viewMode === "markers"
              ? "bg-hyperion-deep-sea text-hyperion-cream border-hyperion-deep-sea"
              : "bg-hyperion-cream text-hyperion-deep-sea border-hyperion-fog-grey"
          }`}
        >
          {t("map.filters.markers", "Markers")}
        </button>
        <button
          type="button"
          onClick={() => onViewModeChange("heatmap")}
          className={`rounded-xl px-3 py-2 text-[10px] font-bold tracking-wider border transition-all ${
            viewMode === "heatmap"
              ? "bg-hyperion-deep-sea text-hyperion-cream border-hyperion-deep-sea"
              : "bg-hyperion-cream text-hyperion-deep-sea border-hyperion-fog-grey"
          }`}
        >
          {t("map.filters.heatmap", "Heatmap")}
        </button>
        <button
          type="button"
          onClick={() => onViewModeChange("grid")}
          className={`rounded-xl px-3 py-2 text-[10px] font-bold tracking-wider border transition-all ${
            viewMode === "grid"
              ? "bg-hyperion-deep-sea text-hyperion-cream border-hyperion-deep-sea"
              : "bg-hyperion-cream text-hyperion-deep-sea border-hyperion-fog-grey"
          }`}
        >
          {t("map.filters.analysis_grid", "Analysis Grid")}
        </button>
      </div>
    </div>
  );
};
