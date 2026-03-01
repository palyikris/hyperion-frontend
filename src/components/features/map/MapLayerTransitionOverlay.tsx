import React from "react";
import { motion, AnimatePresence } from "framer-motion";

type ViewMode = "markers" | "heatmap" | "grid";

type MapLayerTransitionOverlayProps = {
  showLayerTransition: boolean;
  viewMode: ViewMode;
};

const MapLayerTransitionOverlay: React.FC<MapLayerTransitionOverlayProps> = ({
  showLayerTransition,
  viewMode,
}) => {
  return (
    <AnimatePresence>
      {showLayerTransition && (
        <motion.div
          key={`transition-${viewMode}`}
          initial={{ opacity: 0.32 }}
          animate={{ opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="pointer-events-none absolute inset-0 z-1100 bg-hyperion-cream"
        />
      )}
    </AnimatePresence>
  );
};

export default MapLayerTransitionOverlay;
