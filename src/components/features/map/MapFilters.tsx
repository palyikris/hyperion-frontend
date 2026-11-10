import React from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import MiniListPreview from "./MiniListPreview";
import type { MapItem } from "../../../types/map";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { mapFilterSchema } from "../../../schemas/map/filters";
import type { MapFiltersFormData } from "../../../schemas/map/filters";
import {
  DetectionQualitySection,
  FilterPanelHeader,
  RegionSelectionSection,
  StatusFilterSection,
  ViewModeSection,
} from "./MapFiltersSections";

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

  const { handleSubmit, getValues, setValue, reset, control } =
    useForm<MapFiltersFormData>({
      resolver: zodResolver(mapFilterSchema),
      defaultValues: filters,
      mode: "onChange",
    });

  React.useEffect(() => {
    reset(filters);
  }, [filters, reset]);

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

  React.useEffect(() => {
    if (!showFilters) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowFilters(false);
        requestAnimationFrame(() => document.getElementById("show-filters-btn")?.focus());
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showFilters, setShowFilters]);

  return (
    <AnimatePresence>
      {showFilters && (
        <motion.div
          key="filters-content"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
          className="map-filter-panel absolute inset-x-0 bottom-0 z-1000 h-[min(64dvh,36rem)] md:inset-x-auto md:inset-y-6 md:right-6 md:h-auto md:w-88"
          id="map-filters-panel"
          role="region"
          aria-label={t("map.filters.spatial", "Spatial Filters")}
        >
          <div className="map-filter-surface relative flex h-full flex-col overflow-hidden rounded-t-3xl border border-hyperion-deep-sea/10 bg-white shadow-[0_-8px_40px_rgba(26,95,84,0.15)] md:rounded-3xl">
            <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-hyperion-deep-sea/15 md:hidden" aria-hidden="true" />
            <div className="relative shrink-0 border-b border-hyperion-fog-grey px-4 py-3">
              <FilterPanelHeader />
              <button
                type="button"
                onClick={() => setShowFilters(false)}
                aria-label={t("common.closeFilters", "Close filters")}
                className="absolute top-2 right-3 flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-hyperion-cream text-hyperion-deep-sea hover:bg-hyperion-soft-sky"
              >
                <X size={20} />
              </button>
            </div>
            <form
              onSubmit={handleSubmit((values) => {
                onFiltersChange(values as MapFiltersFormData);
              })}
              onWheel={(event) => event.stopPropagation()}
              className="map-filter-body relative min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 pb-[max(1rem,env(safe-area-inset-bottom))] space-y-5"
              autoComplete="off"
            >
              <div className="space-y-5">
                <RegionSelectionSection
                  isRegionActive={isRegionActive}
                  onCaptureBounds={onCaptureBounds}
                  onClearRegion={handleClearRegion}
                />

                <DetectionQualitySection
                  minConfidenceValue={minConfidenceValue ?? 0}
                  onChange={(value) =>
                    handleFilterFieldChange("min_confidence", value)
                  }
                />

                <StatusFilterSection
                  effectiveHasTrashValue={effectiveHasTrashValue}
                  isGridMode={isGridMode}
                  onHasTrashChange={(value) =>
                    handleFilterFieldChange("has_trash", value)
                  }
                />

                <ViewModeSection
                  viewMode={viewMode}
                  onViewModeChange={onViewModeChange}
                />
              </div>

              {/* List Preview */}
              {items && items.length > 0 && (
                <div className="pt-2">
                  <MiniListPreview items={items} flyTo={flyTo} />
                </div>
              )}
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MapFilters;
