import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { ScrollReveal } from "../../shared/animation/ScrollReveal";
import { MorphBox } from "../../shared/animation/MorphBox";
import { useUploadFiles } from "../../../hooks/upload/useUploadFiles";
import { useUploadVideoChunked } from "../../../hooks/upload/useUploadVideoChunked";
import { toastService } from "../../../services/toastService";
import { Button } from "../../shared/Button";
import { UploadIcon, XIcon } from "lucide-react";

type UploadDropZoneProps = {
  onFilesSelected?: (files: File[]) => void;
  multiple?: boolean;
  accept?: string;
  label?: string;
  description?: string;
  browseText?: string;
  fileSupportText?: string;
  disabled?: boolean;
};

type FileUploadState = {
  file: File;
  progress: number;
  status: "pending" | "uploading" | "completed" | "error";
  error?: string;
};

const UploadDropZone = ({
  onFilesSelected,
  multiple = true,
  accept = ".jpg,.jpeg,.png,.tiff",
  label,
  description,
  browseText,
  fileSupportText,
  disabled = false,
}: UploadDropZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadStates, setUploadStates] = useState<FileUploadState[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { t } = useTranslation();
  const uploadMutation = useUploadFiles();
  const uploadVideoMutation = useUploadVideoChunked();
  const abortControllerRef = useRef<AbortController | null>(null);

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
    let files = Array.from(e.dataTransfer.files);
    if (!multiple && files.length > 1) {
      files = [files[0]];
    }
    setSelectedFiles(multiple ? [...selectedFiles, ...files] : files);
    onFilesSelected?.(multiple ? [...selectedFiles, ...files] : files);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let files = Array.from(e.target.files || []);
    if (!multiple && files.length > 1) {
      files = [files[0]];
    }
    setSelectedFiles(multiple ? [...selectedFiles, ...files] : files);
    onFilesSelected?.(multiple ? [...selectedFiles, ...files] : files);
  };

  const removeFile = (index: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
    onFilesSelected?.(updatedFiles);
    setUploadStates(uploadStates.filter((_, i) => i !== index));
  };

  const handleCancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsUploading(false);
    setUploadStates([]);
    toastService.error(t("upload.status.cancelled"));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0 || isUploading) return;

    setIsUploading(true);
    abortControllerRef.current = new AbortController();

    setUploadStates(
      selectedFiles.map((file) => ({ file, progress: 0, status: "pending" })),
    );

    const isSingleVideo =
      selectedFiles.length === 1 && selectedFiles[0].type.startsWith("video/");

    // Common progress handler
    const handleProgress = (progress: number) => {
      setUploadStates((prevStates) =>
        prevStates.map((state) => ({
          ...state,
          progress,
          status: progress < 100 ? "uploading" : "completed",
        })),
      );
    };

    // Common success handler
    const handleSuccess = () => {
      setUploadStates((prevStates) =>
        prevStates.map((state) => ({
          ...state,
          status: "completed",
          progress: 100,
        })),
      );
      setTimeout(() => {
        setSelectedFiles([]);
        setUploadStates([]);
        setIsUploading(false);
        abortControllerRef.current = null;
      }, 1500);
    };

    // Common error handler
    const handleError = (error: unknown) => {
      if (error instanceof Error && error.name === "CanceledError") return;
      setUploadStates((prevStates) =>
        prevStates.map((state) => ({
          ...state,
          status: "error",
          error: error instanceof Error ? error.message : "Upload failed",
        })),
      );
      setIsUploading(false);
      abortControllerRef.current = null;
    };

    try {
      if (isSingleVideo) {
        // Video upload (chunked)
        await uploadVideoMutation.mutateAsync(
          {
            file: selectedFiles[0],
            signal: abortControllerRef.current.signal,
            onProgress: handleProgress,
          },
          {
            onSuccess: handleSuccess,
            onError: handleError,
          },
        );
      } else {
        // Image/files upload
        await uploadMutation.mutateAsync(
          {
            files: selectedFiles,
            signal: abortControllerRef.current.signal,
            onProgress: handleProgress,
          },
          {
            onSuccess: handleSuccess,
            onError: handleError,
          },
        );
      }
    } catch (error) {
      handleError(error);
      if (!(error instanceof Error && error.name === "CanceledError")) {
        console.error("Upload error:", error);
        toastService.error(t("upload.errors.general"));
      }
    }
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
          hoverShape="24px"
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
              {label || t("upload.dropzone.heading")}
            </h3>
            <p className="text-hyperion-slate-grey/70 text-center max-w-xs px-4">
              {description || t("upload.dropzone.dragDescription")}{" "}
              <span className="text-hyperion-burnt-orange font-semibold">
                {browseText || t("upload.dropzone.browseFiles")}
              </span>
            </p>
            <p className="text-xs text-hyperion-slate-grey/50 mt-4 uppercase tracking-widest">
              {fileSupportText || t("upload.dropzone.fileSupport")}
            </p>

            <input
              type="file"
              multiple={multiple}
              accept={accept}
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
              disabled={isUploading || disabled}
            />
          </label>
        </MorphBox>
      </ScrollReveal>

      {/* Selected Files Section */}
      {selectedFiles.length > 0 && (
        <ScrollReveal className="mt-8">
          <div
            className="bg-white border border-hyperion-fog-grey shadow-sm p-6 rounded-2xl"
            style={{
              borderRadius: "68px 44px 30px 48px / 40px 28px 46px 32px",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-hyperion-forest">
                {t("upload.selectedFiles.heading", {
                  count: selectedFiles.length,
                })}
              </h3>
              {isUploading ? (
                <Button
                  onClick={handleCancelUpload}
                  text={t("upload.uploadCancel")}
                  icon={<XIcon className="w-4 h-4" />}
                  className="px-6 bg-hyperion-burnt-orange hover:bg-hyperion-burnt-orange/90"
                ></Button>
              ) : (
                <Button
                  onClick={handleUpload}
                  text={t("nav.main.upload")}
                  icon={<UploadIcon className="w-4 h-4" />}
                  className="px-6"
                ></Button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedFiles.map((file, index) => {
                const uploadState = uploadStates[index];
                const isCompleted = uploadState?.status === "completed";
                const isError = uploadState?.status === "error";
                const isUploading = uploadState?.status === "uploading";

                return (
                  <ScrollReveal
                    key={`${file.name}-${index}`}
                    className="flex flex-col p-4 border border-hyperion-cool-aqua/30 rounded-lg hover:border-hyperion-cool-aqua/60 transition-colors group"
                    delay={index * 0.1}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-hyperion-forest truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-hyperion-slate-grey/60 mt-1">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      {!isUploading && !isCompleted && !isError && (
                        <button
                          onClick={() => removeFile(index)}
                          className="ml-3 shrink-0 p-2 text-hyperion-slate-grey/50 hover:text-hyperion-burnt-orange hover:bg-hyperion-burnt-orange/10 rounded-lg transition-colors"
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
                      )}
                    </div>

                    {/* Progress Bar */}
                    {(isUploading || isCompleted || isError) && (
                      <div className="space-y-2">
                        <div className="w-full h-2 bg-hyperion-fog-grey rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              isError
                                ? "bg-hyperion-burnt-orange"
                                : isCompleted
                                  ? "bg-hyperion-deep-sea"
                                  : "bg-hyperion-forest"
                            }`}
                            style={{
                              width: `${uploadState?.progress || 0}%`,
                            }}
                          ></div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-hyperion-slate-grey">
                            {isCompleted
                              ? t("upload.status.uploaded")
                              : isError
                                ? t("upload.status.failed")
                                : `${uploadState?.progress || 0}%`}
                          </span>
                          {isCompleted && (
                            <svg
                              className="w-4 h-4 text-hyperion-deep-sea"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                          {isError && (
                            <svg
                              className="w-4 h-4 text-red-500"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                        {isError && uploadState?.error && (
                          <p className="text-xs text-red-500 mt-1">
                            {uploadState.error}
                          </p>
                        )}
                      </div>
                    )}
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </ScrollReveal>
      )}
    </section>
  );
};

export default UploadDropZone;
