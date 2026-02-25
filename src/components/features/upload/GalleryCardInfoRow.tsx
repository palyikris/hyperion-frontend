import React from "react";

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value?: string | number | null;
}

const GalleryCardInfoRow: React.FC<InfoRowProps> = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="mt-1 text-hyperion-cool-aqua shrink-0">{icon}</div>
    <div>
      <span className="block text-[9px] uppercase tracking-wider opacity-50 mb-0.5">
        {label}
      </span>
      <span className="text-xs font-medium block leading-tight">
        {value || "N/A"}
      </span>
    </div>
  </div>
);

export default GalleryCardInfoRow;