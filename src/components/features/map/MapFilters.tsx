import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import MiniListPreview from "./MiniListPreview";
import { ScrollReveal } from "../../shared/animation/ScrollReveal";
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

              <FilterPanelHeader />

              <div className="space-y-6">
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
          </ScrollReveal>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MapFilters;
