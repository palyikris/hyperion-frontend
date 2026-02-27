import React from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion"; //
import { MapPin, History, ChevronRight } from "lucide-react";
import type { MapItem, MapMediaLog } from "../../../types/map";


type MarkerPopupProps = { item: MapItem };

const MarkerPopup: React.FC<MarkerPopupProps> = ({ item }) => {
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative bg-hyperion-cream/90 backdrop-blur-md border border-white/50 shadow-[0_20px_50px_rgba(26,95,84,0.2)] rounded-[1.5rem] overflow-hidden w-auto group flex flex-row h-80"
    >
      {/* 1. Left Visual Section (Fixed Width) */}
      {/* <div className="relative w-40 h-full shrink-0 overflow-hidden bg-hyperion-forest-depth">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-hyperion-forest-depth/40 z-10" />
        <img
          src={`https://huggingface.co/datasets/palyikris/hyperion-media/resolve/main/${item.image_url}`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          alt={item.filename}
        />
        <div className="absolute top-3 left-3 z-20">
          <StatusBadge status={item.status as CardStatus} config={{
            bgColor: "bg-hyperion-sage-mint/20",
            textColor: "text-hyperion-sage-mint"
          }}/>
        </div>
      </div> */}

      {/* 2. Right Content Section */}
      <div className="flex-1 p-5 flex flex-col min-w-0">
        {/* Header Data */}
        <div className="mb-3">
          <h4 className="font-bold text-hyperion-deep-sea text-base leading-tight truncate mb-1">
            {item.filename || t("map.popup.unnamed_report", "Unnamed Report")}
          </h4>
          <div className="flex items-center gap-1.5 text-hyperion-slate-grey">
            <MapPin size={10} className="text-hyperion-sage-mint shrink-0" />
            <p className="text-[10px] font-medium truncate italic">
              {item.address || t("map.popup.location_pending", "Location Pending...")}
            </p>
          </div>
        </div>

        {/* Status Timeline (Horizontal/Compact) */}
        <div className="flex-1 bg-white/40 rounded-xl border border-white/60 p-3 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <History size={10} className="text-hyperion-deep-sea" />
              <span className="text-[8px] font-black text-hyperion-deep-sea uppercase tracking-widest">
                {t("map.popup.logs", "Logs")}
              </span>
            </div>
            <span className="text-[8px] font-bold text-hyperion-slate-grey bg-hyperion-sage-mint/10 px-1.5 py-0.5 rounded">
              {item.worker_name || t("map.popup.default_worker", "Helios-01")}
            </span>
          </div>

          <div className="overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {item.history.slice().map((log: MapMediaLog, i: number) => {
              let formattedTime = "";
              if (log.timestamp) {
                try {
                  const date = new Date(log.timestamp);
                  formattedTime = date.toLocaleString(undefined, {
                    year: "2-digit",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                } catch(error) {
                  console.error("Invalid timestamp format:", log.timestamp, error);
                }
              }
              return (
                <div
                  key={i}
                  className="flex gap-2 items-start relative pl-3 border-l border-hyperion-sage-mint/30"
                >
                  <div className="absolute -left-[3.5px] top-1 w-1.5 h-1.5 rounded-full bg-hyperion-sage-mint" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="text-[9px] font-bold text-hyperion-forest-depth leading-none uppercase truncate">
                        {log.action}
                      </p>
                      {formattedTime && (
                        <span className="text-[8px] text-hyperion-slate-grey ml-1 whitespace-nowrap">{formattedTime}</span>
                      )}
                    </div>
                    <p className="text-[8px] text-hyperion-slate-grey mt-0.5 truncate">
                      {log.message}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Action Footer */}
        <button className="mt-3 w-full py-2 bg-hyperion-deep-sea hover:bg-hyperion-forest-depth text-white rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 group/btn">
          {t("map.popup.open_lab_view", "Open Lab View")}
          <ChevronRight
            size={10}
            className="group-hover/btn:translate-x-1 transition-transform"
          />
        </button>
      </div>

      {/* Decorative Brand Element */}
      <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-hyperion-sage-mint/10 blur-xl pointer-events-none" />
    </motion.div>
  );
};

export default MarkerPopup;
