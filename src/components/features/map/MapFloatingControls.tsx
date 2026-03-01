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
    <div className="absolute z-1000 right-6 bottom-6 flex flex-col gap-4">
      <AnimatePresence>
        {!showFilters && (
          <motion.button
            key="show-filters-btn"
            initial={{ opacity: 0, scale: 0.7, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: 10 }}
            onClick={onShowFilters}
            className="bg-hyperion-deep-sea shadow-lg rounded-full p-2.5 hover:bg-hyperion-forest transition-all"
            title={showFiltersLabel}
          >
            <FilterIcon className="text-hyperion-cream w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      <button
        onClick={onGoToMyLocation}
        className="bg-hyperion-deep-sea shadow-lg rounded-full p-2.5 hover:bg-hyperion-forest transition-all"
        title={goToMyLocationLabel}
        disabled={locating}
      >
        <MapPinned
          className={`text-hyperion-cream w-5 h-5 ${locating ? "animate-pulse" : ""}`}
        />
      </button>
    </div>
  );
};

export default MapFloatingControls;
