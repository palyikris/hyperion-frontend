import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPinned, Filter as FilterIcon } from "lucide-react";

type MapFloatingControlsProps = {
  showFilters: boolean;
  onShowFilters: () => void;
  onGoToMyLocation: () => void;
  locating: boolean;
  showFiltersLabel: string;
  goToMyLocationLabel: string;
};

const MapFloatingControls: React.FC<MapFloatingControlsProps> = ({
  showFilters,
  onShowFilters,
  onGoToMyLocation,
  locating,
  showFiltersLabel,
  goToMyLocationLabel,
}) => {
  return (
    <AnimatePresence>
      {!showFilters && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="map-floating-controls absolute z-1000 right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] flex items-center gap-3 md:right-6 md:bottom-6 md:flex-col"
        >
          <motion.button
            type="button"
            key="show-filters-btn"
            initial={{ opacity: 0, scale: 0.7, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: 10 }}
            onClick={onShowFilters}
            className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-hyperion-deep-sea px-4 py-3 text-sm text-hyperion-cream shadow-lg transition-colors hover:bg-hyperion-forest"
            title={showFiltersLabel}
            aria-label={showFiltersLabel}
            id="show-filters-btn"
          >
            <FilterIcon className="text-hyperion-cream w-5 h-5" />
            <span className="md:sr-only">{showFiltersLabel}</span>
          </motion.button>

          <button
            type="button"
            onClick={onGoToMyLocation}
            className="flex h-12 w-12 items-center justify-center rounded-2xl border border-hyperion-deep-sea/15 bg-white text-hyperion-deep-sea shadow-lg transition-colors hover:bg-hyperion-soft-sky disabled:opacity-60"
            title={goToMyLocationLabel}
            aria-label={goToMyLocationLabel}
            disabled={locating}
          >
            <MapPinned
              className={`w-5 h-5 ${locating ? "animate-pulse" : ""}`}
            />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MapFloatingControls;
