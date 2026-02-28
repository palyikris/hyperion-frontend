import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Filter } from "lucide-react";
import MiniListPreview from "./MiniListPreview";
import { ScrollReveal } from "../../shared/animation/ScrollReveal";
import { Title } from "../../shared/Title";
import { Button } from "../../shared/Button";
import type { MapItem } from "../../../types/map";

type MapFiltersProps = {
  filters: { has_trash: boolean | undefined; min_confidence: number };
  setFilters: React.Dispatch<
    React.SetStateAction<{
      has_trash: boolean | undefined;
      min_confidence: number;
    }>
  >;
  items?: MapItem[];
  flyTo?: (lat: number, lng: number) => void;
  showFilters: boolean;
  setShowFilters: React.Dispatch<React.SetStateAction<boolean>>;
};

const MapFilters: React.FC<MapFiltersProps> = ({
  filters,
  setFilters,
  items,
  flyTo,
  showFilters,
  setShowFilters,
}) => {
  const { t } = useTranslation();
  // Animate in/out using showFilters prop
  return (
    <AnimatePresence>
      {showFilters && (
        <motion.div
          key="filters-content"
          initial={{ opacity: 0, scale: 0.96, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 24 }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
          className="absolute top-6 right-6 z-[1000] w-80"
        >
          <ScrollReveal className="relative overflow-visible" delay={0.1}>
            {/* Decorative amorphous blobs */}
            <div
              className="pointer-events-none absolute -top-10 -left-10 w-32 h-32 bg-hyperion-soft-sky/30 blur-2xl animate-floaty"
              style={{ borderRadius: "62% 38% 70% 30% / 44% 56% 44% 56%" }}
            />
            <div
              className="pointer-events-none absolute -bottom-8 -right-8 w-28 h-28 bg-hyperion-sage-mint/25 blur-2xl animate-floaty"
              style={{ borderRadius: "58% 42% 36% 64% / 48% 62% 38% 52%" }}
            />

            <div className="relative bg-white/90 backdrop-blur-md border border-hyperion-muted-gold/60 shadow-[rgba(26,95,84,0.16)_0px_18px_60px] px-7 py-8 rounded-3xl space-y-7">
              {/* Close button (top right) */}
              {setShowFilters && (
                <motion.button
                  whileHover={{ scale: 1.15, rotate: 90 }}
                  whileTap={{ scale: 0.9, rotate: -90 }}
                  onClick={() => setShowFilters(false)}
                  className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 transition"
                  title={t("map.hide_filters", "Hide filters")}
                  style={{ fontSize: 22, fontWeight: "bold", lineHeight: 1 }}
                >
                  &times;
                </motion.button>
              )}
              <div className="flex items-center gap-3 pb-2">
                <span className="inline-flex items-center justify-center bg-hyperion-deep-sea/10 rounded-xl p-2">
                  <Filter size={20} className="text-hyperion-deep-sea" />
                </span>
                <Title
                  text={t("map.filters.spatial", "Spatial Filters")}
                  colorFrom="hyperion-forest"
                  colorVia="hyperion-deep-sea"
                  colorTo="hyperion-cool-aqua"
                  size="lg"
                  className="tracking-tight text-base!"
                />
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-hyperion-slate-grey uppercase tracking-widest">
                    {t("map.filters.detection_quality", "Detection Quality")}
                  </label>
                  <input
                    type="range"
                    className="w-full h-2 bg-hyperion-fog-grey rounded-lg appearance-none cursor-pointer accent-hyperion-sage-mint transition-all"
                    min="0"
                    max="100"
                    value={filters.min_confidence}
                    onChange={(e) =>
                      setFilters((f) => ({
                        ...f,
                        min_confidence: Number(e.target.value),
                      }))
                    }
                    style={{ accentColor: "var(--color-hyperion-sage-mint)" }}
                  />
                  <div className="flex justify-between text-[11px] font-bold text-hyperion-deep-sea">
                    <span>0%</span>
                    <span className="bg-hyperion-sage-mint/20 px-2 rounded">
                      {t("map.filters.min", "Min")}: {filters.min_confidence}%
                    </span>
                    <span>100%</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    text={t("map.filters.has_trash", "HAS TRASH")}
                    onClick={() =>
                      setFilters((f) => ({ ...f, has_trash: true }))
                    }
                    theme={filters.has_trash === true ? "danger" : "info"}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-300 ${filters.has_trash === true ? "shadow-inner" : "border border-hyperion-fog-grey bg-white/80 text-hyperion-slate-grey"}`}
                  />
                  <Button
                    text={t("map.filters.clean", "CLEAN")}
                    onClick={() =>
                      setFilters((f) => ({ ...f, has_trash: false }))
                    }
                    theme={filters.has_trash === false ? "info" : "primary"}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-300 ${filters.has_trash === false ? "shadow-inner" : "border border-hyperion-fog-grey bg-white/80 text-hyperion-slate-grey"}`}
                  />
                </div>
              </div>

              {/* Mini List Preview inside sidebar */}
              {items && items.length > 0 && (
                <MiniListPreview items={items} flyTo={flyTo} />
              )}
            </div>
          </ScrollReveal>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MapFilters;
