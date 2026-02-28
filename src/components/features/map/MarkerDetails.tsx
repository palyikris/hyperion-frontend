import React from "react";
import { useTranslation } from "react-i18next";
import { History, ChevronRight, Image as ImageIcon } from "lucide-react";
import type { MapItem, MapMediaLog } from "../../../types/map";

type MarkerDetailsProps = { item: MapItem };

const MarkerDetails: React.FC<MarkerDetailsProps> = ({ item }) => {
  const { t } = useTranslation();
  return (
    <>
      {/* 2. Right Content Section */}
      <div className="flex-1 p-0 flex flex-col min-w-0 gap-6">
        {/* Image Preview Card */}
        <div className="w-full flex justify-center">
          <div className="rounded-2xl overflow-hidden shadow border border-hyperion-sage-mint/30 bg-white/80 flex items-center justify-center min-h-[120px] max-w-sm w-full">
            {item.image_url ? (
              <img
                src={`https://huggingface.co/datasets/palyikris/hyperion-media/resolve/main/${item.image_url}`}
                alt={item.filename}
                className="object-cover w-full h-32"
                style={{ maxHeight: '128px' }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center w-full h-32 text-hyperion-slate-grey/60">
                <ImageIcon size={32} />
                <span className="text-xs mt-2">No Image</span>
              </div>
            )}
          </div>
        </div>
        {/* Header Data */}
        {/* Optionally, add more meta here if needed */}

        {/* Status Timeline (Horizontal/Compact) */}
        <section className="bg-white/70 rounded-2xl border border-hyperion-sage-mint/30 p-5 flex flex-col min-h-0 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <History size={16} className="text-hyperion-deep-sea" />
            <span className="text-xs font-bold text-hyperion-deep-sea uppercase tracking-widest">
              {t("map.popup.logs", "Logs")}
            </span>
          </div>
          <div className="flex flex-col gap-4 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
            {item.history.length === 0 && (
              <div className="text-xs text-hyperion-slate-grey italic">No logs available.</div>
            )}
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
                  className="flex gap-3 items-start relative pl-4 border-l-2 border-hyperion-sage-mint/40"
                >
                  <div className="absolute -left-2 top-2 w-3 h-2 rounded-full bg-hyperion-sage-mint shadow" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-hyperion-forest-depth leading-none uppercase truncate">
                        {log.action}
                      </p>
                      {formattedTime && (
                        <span className="text-[10px] text-hyperion-slate-grey ml-1 whitespace-nowrap">{formattedTime}</span>
                      )}
                    </div>
                    <p className="text-xs text-hyperion-slate-grey mt-1 truncate">
                      {log.message}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Quick Action Footer */}
        <button className="mt-6 w-full py-3 bg-hyperion-deep-sea hover:bg-hyperion-forest-depth text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 group/btn shadow-md">
          {t("map.popup.open_lab_view", "Open Lab View")}
          <ChevronRight
            size={14}
            className="group-hover/btn:translate-x-1 transition-transform"
          />
        </button>
      </div>
    </>
  );
};

export default MarkerDetails;