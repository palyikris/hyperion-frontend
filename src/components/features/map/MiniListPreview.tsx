import React from "react";
import { useTranslation } from "react-i18next";
import type { MapItem } from "../../../types/map";

type MiniListPreviewProps = {
  items: MapItem[];
  flyTo?: (lat: number, lng: number) => void;
};

type MiniListImageProps = {
  src?: string;
  alt: string;
};

const MiniListImage: React.FC<MiniListImageProps> = ({ src, alt }) => {
  const [isLoaded, setIsLoaded] = React.useState(false);

  if (!src) {
    return <div className="w-full h-full bg-hyperion-fog-grey/80" />;
  }

  return (
    <div className="relative w-full h-full">
      {!isLoaded && (
        <div className="absolute inset-0 animate-pulse bg-hyperion-fog-grey/80" />
      )}
      <img
        src={src}
        className={`w-full h-full object-cover transition-opacity duration-200 ${isLoaded ? "opacity-100" : "opacity-0"}`}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={() => setIsLoaded(true)}
      />
    </div>
  );
};

const MiniListPreview: React.FC<MiniListPreviewProps> = ({ items, flyTo }) => {
  const { t } = useTranslation();
  return (
    <div className="pt-4 border-t border-hyperion-fog-grey">
      <label className="text-[11px] font-black text-hyperion-slate-grey uppercase tracking-widest mb-3 block">
        {t("map.preview.latest_in_view", "Latest In View")}
      </label>
      <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
        {items.slice(0, 3).map((item) => (
          <div
            key={item.id}
            className="group relative flex gap-3 items-center p-2 rounded-2xl bg-white/80 border border-hyperion-fog-grey shadow-[rgba(26,95,84,0.08)_0px_4px_18px] hover:border-hyperion-sage-mint hover:bg-hyperion-soft-sky/30 transition-all duration-300 cursor-pointer"
            onClick={() => {
              if (flyTo) flyTo(item.lat, item.lng);
            }}
          >
            {/* Decorative blob */}
            <div
              className="pointer-events-none absolute -top-3 -left-3 w-8 h-8 bg-hyperion-sage-mint/15 blur-md opacity-80 group-hover:opacity-100 transition-all duration-300"
              style={{ borderRadius: "62% 38% 70% 30% / 44% 56% 44% 56%" }}
            />
            <div className="w-10 h-10 rounded-xl bg-hyperion-fog-grey overflow-hidden shrink-0 shadow-inner">
              <MiniListImage
                src={
                  item.image_url
                    ? `https://huggingface.co/datasets/palyikris/hyperion-media/resolve/main/${item.image_url}`
                    : undefined
                }
                alt={item.filename || "File preview"}
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-bold text-hyperion-deep-sea truncate">
                {item.filename}
              </span>
              <span className="text-[10px] text-hyperion-slate-grey truncate">
                {item.address}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MiniListPreview;
