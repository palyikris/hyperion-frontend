import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollReveal } from "../../shared/animation/ScrollReveal";
import { MorphBox } from "../../shared/animation/MorphBox";

type UploadDropZoneProps = {
  onFilesSelected?: (files: File[]) => void;
};

const UploadDropZone = ({ onFilesSelected }: UploadDropZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
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
    setSelectedFiles([...selectedFiles, ...files]);
    onFilesSelected?.([...selectedFiles, ...files]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles([...selectedFiles, ...files]);
    onFilesSelected?.([...selectedFiles, ...files]);
  };

  const removeFile = (index: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
    onFilesSelected?.(updatedFiles);
  };

  return (
    <section className="relative">
      <ScrollReveal
        className="flex flex-col items-center justify-center py-16 px-8 bg-white border border-hyperion-fog-grey shadow-sm relative overflow-hidden"
        style={{
          borderRadius: "68px 44px 30px 48px / 40px 28px 46px 32px",
        }}
      >
        {/* Decorative amorph blobs */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-hyperion-burnt-orange/30 rounded-full"></div>
        <div
          className="absolute top-1/4 -right-32 w-72 h-72 bg-hyperion-forest/30"
          style={{ borderRadius: "45% 55% 65% 35% / 35% 65% 45% 55%" }}
        ></div>
        <div
          className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-hyperion-cool-aqua/30 blur-3xl"
          style={{ borderRadius: "20% 80% 60% 40% / 70% 50% 30% 50%" }}
        ></div>

        <MorphBox
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`amorphous-border px-20 flex flex-col items-center justify-center cursor-pointer group transition-all duration-500 p-6 rounded-xl ${
            isDragging
              ? "border-hyperion-forest bg-hyperion-cool-aqua/10"
              : "hover:border-hyperion-forest hover:bg-hyperion-cool-aqua/5"
          }`}
          blobShape="73% 27% 70% 30% / 67% 47% 53% 33%"
        >
          <label className="w-full flex flex-col items-center justify-center cursor-pointer relative">
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
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </label>
        </MorphBox>
      </ScrollReveal>

      {/* Selected Files Section */}
      {selectedFiles.length > 0 && (
        <ScrollReveal className="mt-8">
          <div className="bg-white border border-hyperion-fog-grey shadow-sm p-6 rounded-2xl">
            <h3 className="text-lg font-semibold text-hyperion-forest mb-4">
              {t("upload.selectedFiles.heading", {
                count: selectedFiles.length,
              })}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedFiles.map((file, index) => (
                <ScrollReveal
                  key={`${file.name}-${index}`}
                  className="flex items-center justify-between p-4 border border-hyperion-cool-aqua/30 rounded-lg hover:border-hyperion-cool-aqua/60 transition-colors group"
                  delay={index * 0.1}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-hyperion-forest truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-hyperion-slate-grey/60 mt-1">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="ml-3 flex-shrink-0 p-2 text-hyperion-slate-grey/50 hover:text-hyperion-burnt-orange hover:bg-hyperion-burnt-orange/10 rounded-lg transition-colors"
                    title={t("common.remove", "Remove")}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </ScrollReveal>
      )}
    </section>
  );
};

export default UploadDropZone;
