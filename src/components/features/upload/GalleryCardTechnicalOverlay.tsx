import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Camera, Cpu, Calendar, MapPin } from "lucide-react";
import GalleryCardInfoRow from "./GalleryCardInfoRow";
import type { GalleryItemTechnicalMetadata } from "../../../types/upload";

interface GalleryCardTechnicalOverlayProps {
  showInfo: boolean;
  setShowInfo: (show: boolean) => void;
  technical_metadata?: GalleryItemTechnicalMetadata;
  address?: string;
  borderRadius?: string;
}

const GalleryCardTechnicalOverlay: React.FC<
  GalleryCardTechnicalOverlayProps
> = ({ showInfo, setShowInfo, technical_metadata, address, borderRadius }) => {
  return (
    <AnimatePresence>
      {showInfo && technical_metadata && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ opacity: { duration: 0.2 } }}
          className="absolute inset-0 z-30 p-6 bg-hyperion-forest text-white flex flex-col"
          style={{
            backgroundClip: "padding-box",
            borderRadius: borderRadius || "0px",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6 border-b border-white/20 pb-2">
            <h5 className="font-bold tracking-widest uppercase text-[10px]">
              Technical Specs
            </h5>
            <button
              onClick={() => setShowInfo(false)}
              className="hover:rotate-90 transition-transform"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
            <GalleryCardInfoRow
              icon={<Camera size={16} />}
              label="Device"
              value={
                technical_metadata.make
                  ? `${technical_metadata.make} ${technical_metadata.model}`
                  : "Unknown"
              }
            />
            <GalleryCardInfoRow
              icon={<Cpu size={16} />}
              label="Software"
              value={technical_metadata.software as string}
            />
            <GalleryCardInfoRow
              icon={<Calendar size={16} />}
              label="Date Taken"
              value={technical_metadata.date_taken as string}
            />

            {technical_metadata.gps && (
              <div className="pt-4 mt-2 border-t border-white/10">
                <div className="flex items-center gap-2 mb-3 text-hyperion-cool-aqua">
                  <MapPin size={16} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    Location
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-[11px]">
                  <div>
                    <span className="opacity-60 block">Lat</span>
                    {technical_metadata.gps.lat}
                  </div>
                  <div>
                    <span className="opacity-60 block">Lng</span>
                    {technical_metadata.gps.lng}
                  </div>
                  <div className="col-span-2 mt-1 italic text-hyperion-cool-aqua/90 text-xs leading-snug">
                    {address || "Address retrieval in progress..."}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GalleryCardTechnicalOverlay;