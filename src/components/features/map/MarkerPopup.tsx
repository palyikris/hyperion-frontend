import React from "react";
import { motion } from "framer-motion";
import type { MapItem } from "../../../types/map";
import MarkerDetails from "./MarkerDetails";

type MarkerPopupProps = { item: MapItem };

const MarkerPopup: React.FC<MarkerPopupProps> = ({ item }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative bg-hyperion-cream/90 backdrop-blur-md border border-white/50 shadow-[0_20px_50px_rgba(26,95,84,0.2)] rounded-3xl overflow-hidden w-auto group flex flex-row h-80"
    >
      <MarkerDetails item={item} />
      {/* Decorative Brand Element */}
      <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-hyperion-sage-mint/10 blur-xl pointer-events-none" />
    </motion.div>
  );
};

export default MarkerPopup;
