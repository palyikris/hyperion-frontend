import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Filter, Navigation, Maximize, X, RefreshCcw } from "lucide-react";
import MiniListPreview from "./MiniListPreview";
import { ScrollReveal } from "../../shared/animation/ScrollReveal";
import { Title } from "../../shared/Title";
import { Button } from "../../shared/Button";
import type { MapItem } from "../../../types/map";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { mapFilterSchema } from "../../../schemas/map/filters";
import type { MapFiltersFormData } from "../../../schemas/map/filters";

type ViewMode = "markers" | "heatmap" | "grid";

type MapFiltersProps = {
  filters: MapFiltersFormData;
  onFiltersChange: (filters: MapFiltersFormData) => void;
  items?: MapItem[];
  flyTo?: (lat: number, lng: number) => void;
  showFilters: boolean;
  setShowFilters: React.Dispatch<React.SetStateAction<boolean>>;
  onCaptureBounds: () => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
};

const MapFilters: React.FC<MapFiltersProps> = ({
  filters,
  onFiltersChange,
  items,
  flyTo,
  showFilters,
  setShowFilters,
  onCaptureBounds,
  viewMode,
  onViewModeChange,
}) => {
  const { t } = useTranslation();
  const isGridMode = viewMode === "grid";

  const { handleSubmit, getValues, setValue, control } =
    useForm<MapFiltersFormData>({
      resolver: zodResolver(mapFilterSchema),
      defaultValues: filters,
      mode: "onChange",
    });

  React.useEffect(() => {
    setValue("min_confidence", filters.min_confidence);
    setValue("has_trash", filters.has_trash);
    setValue("min_lat", filters.min_lat);
    setValue("max_lat", filters.max_lat);
    setValue("min_lng", filters.min_lng);
    setValue("max_lng", filters.max_lng);
  }, [filters, setValue]);

  const handleFilterFieldChange = (
    field: "min_confidence" | "has_trash",
    value: number | boolean | undefined,
  ) => {
    if (field === "has_trash" && isGridMode) {
      return;
    }

    if (field === "min_confidence") {
      setValue("min_confidence", value as number, {
        shouldDirty: true,
        shouldValidate: true,
      });
    } else {
      setValue("has_trash", value as boolean | undefined, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }

    onFiltersChange({
      ...getValues(),
      [field]: value,
    } as MapFiltersFormData);
  };

  const minLatValue = useWatch({ control, name: "min_lat" });
  const minConfidenceValue = useWatch({
    control,
    name: "min_confidence",
  });
  const hasTrashValue = useWatch({
    control,
    name: "has_trash",
  });
  const effectiveHasTrashValue = isGridMode ? true : hasTrashValue;

  const handleClearRegion = () => {
    setValue("min_lat", undefined);
    setValue("max_lat", undefined);
    setValue("min_lng", undefined);
    setValue("max_lng", undefined);
    // Call onFiltersChange with the updated values
    const currentValues = {
      ...getValues(),
      min_lat: undefined,
      max_lat: undefined,
      min_lng: undefined,
      max_lng: undefined,
    };
    onFiltersChange(currentValues);
  };

  const isRegionActive = minLatValue !== undefined;

  return (
    <AnimatePresence>
      {showFilters && (
        <motion.div
          key="filters-content"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 24 }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
          className="absolute top-6 right-6 z-1000 w-85 h-[calc(100dvh-3rem)]"
        >
          <ScrollReveal className="relative h-full overflow-hidden" delay={0.1}>
            <form
              onSubmit={handleSubmit((values) => {
                onFiltersChange(values as MapFiltersFormData);
              })}
              onWheel={(event) => event.stopPropagation()}
              className="relative h-full overflow-y-auto overscroll-contain [&::-webkit-scrollbar]:hidden bg-white/95 backdrop-blur-xl border border-hyperion-muted-gold/40 shadow-[rgba(26,95,84,0.18)_0px_25px_70px] px-7 py-8 rounded-[2.5rem] space-y-7"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
              autoComplete="off"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowFilters(false)}
                className="absolute top-5 right-6 text-hyperion-slate-grey/50 hover:text-hyperion-deep-sea transition-colors"
              >
                <X size={22} />
              </button>

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

              <div className="space-y-6">
                {/* 1. Region Selection */}
                <div className="space-y-3">
                  <div className="flex justify-between items-end mb-1">
                    {isRegionActive && (
                      <button
                        type="button"
                        onClick={handleClearRegion}
                        className="text-[10px] font-bold text-hyperion-burnt-orange hover:underline flex items-center gap-1"
                      >
                        <RefreshCcw size={10} />{" "}
                        {t("map.filters.clear", "clear")}
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    <Button
                      type="button"
                      text={
                        isRegionActive
                          ? t(
                              "map.filters.update_selection",
                              "Update Selection",
                            )
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
                        <Maximize
                          size={12}
                          className="text-hyperion-deep-sea mt-0.5"
                        />
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

                {/* 2. Detection Quality */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-hyperion-slate-grey uppercase tracking-[0.2em]">
                    {t("map.filters.detection_quality", "Detection Quality")}
                  </label>
                  <input
                    type="range"
                    className="w-full h-1.5 bg-hyperion-fog-grey rounded-lg appearance-none cursor-pointer accent-hyperion-sage-mint transition-all"
                    min="0"
                    max="100"
                    value={minConfidenceValue ?? 0}
                    onChange={(event) =>
                      handleFilterFieldChange(
                        "min_confidence",
                        Number(event.target.value),
                      )
                    }
                  />
                  <div className="flex justify-between text-[10px] font-bold text-hyperion-deep-sea px-1">
                    <span>{t("map.filters.zero_percent", "0%")}</span>
                    <span className="bg-hyperion-sage-mint/20 px-2 py-0.5 rounded-full text-[9px]">
                      {t("map.filters.min", "Min")}: {minConfidenceValue}%
                    </span>
                    <span>{t("map.filters.hundred_percent", "100%")}</span>
                  </div>
                </div>

                {/* 3. Status Filter */}
                <div className="flex gap-4">
                  <Button
                    text={t("map.filters.has_trash", "HAS TRASH")}
                    onClick={() => handleFilterFieldChange("has_trash", true)}
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
                    onClick={() => handleFilterFieldChange("has_trash", false)}
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
                    onClick={() =>
                      handleFilterFieldChange("has_trash", undefined)
                    }
                    disabled={isGridMode}
                    aria-label={t(
                      "map.filters.clear_status",
                      "Clear status filter",
                    )}
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
              </div>

              {/* List Preview */}
              {items && items.length > 0 && (
                <div className="pt-2">
                  <MiniListPreview items={items} flyTo={flyTo} />
                </div>
              )}
            </form>
          </ScrollReveal>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MapFilters;
