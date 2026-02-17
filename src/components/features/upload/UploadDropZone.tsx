import { useState } from "react";
import { useTranslation } from "react-i18next";

type UploadDropZoneProps = {
  onFilesSelected?: (files: File[]) => void;
};

const UploadDropZone = ({ onFilesSelected }: UploadDropZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const { t } = useTranslation();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    onFilesSelected?.(files);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    onFilesSelected?.(files);
  };

  return (
    <section className="relative">
      <div className="flex flex-col items-center justify-center py-16 px-8 bg-white border border-hyperion-fog-grey shadow-sm relative overflow-hidden" style={{
        borderRadius: "68px 44px 30px 48px / 40px 28px 46px 32px"
      }}>
        {/* Decorative amorph blobs */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-hyperion-burnt-orange/30 rounded-full"></div>
        <div className="absolute top-1/4 -right-32 w-72 h-72 bg-hyperion-forest/30" style={{ borderRadius: "45% 55% 65% 35% / 35% 65% 45% 55%" }}></div>
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-hyperion-cool-aqua/30 blur-3xl" style={{ borderRadius: "20% 80% 60% 40% / 70% 50% 30% 50%" }}></div>

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`amorphous-border w-full max-w-xl min-h-[250px] flex flex-col items-center justify-center cursor-pointer group transition-all duration-500 p-6 rounded-xl ${
            isDragging
              ? "border-hyperion-forest bg-hyperion-cool-aqua/10"
              : "hover:border-hyperion-forest hover:bg-hyperion-cool-aqua/5"
          }`}
          style={{
            borderRadius: "73% 27% 70% 30% / 67% 47% 53% 33% ",
          }}
        >
          <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
            <div className="bg-hyperion-cool-aqua/10 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
              <svg
                className="w-12 h-12 text-hyperion-forest"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-hyperion-forest">
              {t("upload.dropzone.heading")}
            </h3>
            <p className="text-hyperion-slate-grey/70 text-center max-w-xs px-4">
              {t("upload.dropzone.dragDescription")}{" "}
              <span className="text-hyperion-burnt-orange font-semibold">
                {t("upload.dropzone.browseFiles")}
              </span>
            </p>
            <p className="text-xs text-hyperion-slate-grey/50 mt-4 uppercase tracking-widest">
              {t("upload.dropzone.fileSupport")}
            </p>

            <input
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.tiff"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </section>
  );
};

export default UploadDropZone;
