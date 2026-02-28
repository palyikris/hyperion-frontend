import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Filter, Navigation, Maximize, X, RefreshCcw } from "lucide-react";
import MiniListPreview from "./MiniListPreview";
import { ScrollReveal } from "../../shared/animation/ScrollReveal";
import { Title } from "../../shared/Title";
import { Button } from "../../shared/Button";
import type { MapItem } from "../../../types/map";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { mapFilterSchema } from "../../../schemas/map/filters";
import type { MapFiltersFormData } from "../../../schemas/map/filters";

type MapFiltersProps = {
  filters: MapFiltersFormData;
  onFiltersChange: (filters: MapFiltersFormData) => void;
  items?: MapItem[];
  flyTo?: (lat: number, lng: number) => void;
  showFilters: boolean;
  setShowFilters: React.Dispatch<React.SetStateAction<boolean>>;
  onCaptureBounds: () => void;
};

const MapFilters: React.FC<MapFiltersProps> = ({
  filters,
  onFiltersChange,
  items,
  flyTo,
  showFilters,
  setShowFilters,
  onCaptureBounds,
}) => {
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
  } = useForm<MapFiltersFormData>({
    resolver: zodResolver(mapFilterSchema),
    defaultValues: filters,
    mode: "onChange",
  });

  console.error(errors);

  React.useEffect(() => {
    setValue("min_lat", filters.min_lat);
    setValue("max_lat", filters.max_lat);
    setValue("min_lng", filters.min_lng);
    setValue("max_lng", filters.max_lng);
  }, [filters, setValue]);

  const handleClearRegion = () => {
    setValue("min_lat", undefined);
    setValue("max_lat", undefined);
    setValue("min_lng", undefined);
    setValue("max_lng", undefined);
    // Call onFiltersChange with the updated values
    const currentValues = {
      ...watch(),
      min_lat: undefined,
      max_lat: undefined,
      min_lng: undefined,
      max_lng: undefined,
    };
    onFiltersChange(currentValues);
  };

  const isRegionActive = watch("min_lat") !== undefined;

  return (
    <AnimatePresence>
      {showFilters && (
        <motion.div
          key="filters-content"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 24 }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
          className="absolute top-6 right-6 z-1000 w-85"
        >
          <ScrollReveal className="relative overflow-visible" delay={0.1}>
            <form
              onSubmit={handleSubmit((values) => {
                onFiltersChange(values as MapFiltersFormData);
              })}
              className="relative bg-white/95 backdrop-blur-xl border border-hyperion-muted-gold/40 shadow-[rgba(26,95,84,0.18)_0px_25px_70px] px-7 py-8 rounded-[2.5rem] space-y-7"
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
                            {t("map.filters.area_locked_desc", "Filtering data within current map boundaries.")}
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
                    {...register("min_confidence", { valueAsNumber: true })}
                  />
                  <div className="flex justify-between text-[10px] font-bold text-hyperion-deep-sea px-1">
                    <span>{t("map.filters.zero_percent", "0%")}</span>
                    <span className="bg-hyperion-sage-mint/20 px-2 py-0.5 rounded-full text-[9px]">
                      {t("map.filters.min", "Min")}: {watch("min_confidence")}%
                    </span>
                    <span>{t("map.filters.hundred_percent", "100%")}</span>
                  </div>
                </div>

                {/* 3. Status Filter */}
                <div className="flex gap-4">
                  <Button
                    text={t("map.filters.has_trash", "HAS TRASH")}
                    onClick={() => setValue("has_trash", true)}
                    type="button"
                    theme="danger"
                    className="px-4 text-xs w-full"
                  />
                  <Button
                    text={t("map.filters.clean", "CLEAN")}
                    onClick={() => setValue("has_trash", false)}
                    type="button"
                    theme="info"
                    className="px-4 text-xs w-full"
                  />
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
