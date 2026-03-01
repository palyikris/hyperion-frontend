import React from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import type { GridCell } from "../../../types/map";

type GridPopupProps = {
  cell: GridCell;
};

const GridPopup: React.FC<GridPopupProps> = ({ cell }) => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative min-w-56 rounded-3xl bg-hyperion-cream/90 backdrop-blur-md border border-white/60 shadow-[0_20px_50px_rgba(26,95,84,0.2)] p-4 overflow-hidden"
    >
      <div className="pointer-events-none absolute -top-6 -right-6 h-16 w-16 rounded-full bg-hyperion-sage-mint/20 blur-2xl" />

      <div className="relative flex items-center justify-between mb-3">
        <div className="text-[11px] font-black tracking-[0.16em] uppercase text-hyperion-deep-sea">
          {t("map.grid.analysis", "Grid Analysis")}
        </div>
        <span className="px-2 py-0.5 rounded-full bg-white/80 border border-hyperion-sage-mint/40 text-[10px] font-bold text-hyperion-deep-sea">
          {t("map.grid.cell", "Cell")}
        </span>
      </div>

      <div className="relative space-y-2 text-xs text-hyperion-slate-grey">
        <div className="flex items-center justify-between gap-4 rounded-xl bg-white/65 border border-hyperion-sage-mint/20 px-3 py-2.5">
          <span>{t("map.grid.total_hits", "Találatok száma")}</span>
          <span className="font-semibold text-hyperion-deep-sea">{cell.count}</span>
        </div>
        <div className="flex items-center justify-between gap-4 rounded-xl bg-white/65 border border-hyperion-sage-mint/20 px-3 py-2.5">
          <span>{t("map.grid.trash_density", "Szemét sűrűség")}</span>
          <span className="font-semibold text-hyperion-deep-sea">
            {(cell.density).toFixed(1)}%
          </span>
        </div>
        <div className="flex items-center justify-between gap-4 rounded-xl bg-white/65 border border-hyperion-sage-mint/20 px-3 py-2.5">
          <span>{t("map.grid.avg_confidence", "Átlagos AI bizalom")}</span>
          <span className="font-semibold text-hyperion-deep-sea">
            {(cell.confidence).toFixed(1)}%
          </span>
        </div>
        <div className="flex items-center justify-between gap-4 rounded-xl bg-white/65 border border-hyperion-sage-mint/20 px-3 py-2.5">
          <span>{t("map.grid.dominant_label", "Domináns címke")}</span>
          <span className="font-semibold text-hyperion-deep-sea px-2 py-0.5 rounded-full bg-hyperion-sage-mint/20 border border-hyperion-sage-mint/30">
            {cell.dominantLabel ?? t("map.grid.no_label", "N/A")}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default GridPopup;
