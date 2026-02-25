import { api } from "../api/axiosInstance";
import type { GalleryItem } from "../types/upload";
import imageCompression from "browser-image-compression";
import { toastService } from "./toastService";
import i18n from "i18next";

export const uploadService = {
  uploadFiles: async (
    files: File[],
    onProgress?: (progress: number) => void,
    signal?: AbortSignal,
  ) => {
    const options = {
      maxSizeMB: 2,
      maxWidthOrHeight: 2560,
      useWebWorker: true,
      preserveExif: true,
    };

    const formData = new FormData();

    const compressionPromises = files.map(async (file) => {
      if (file.type.startsWith("image/")) {
        try {
          const compressedFile = await imageCompression(file, options);
          return new File([compressedFile], file.name, { type: file.type });
        } catch (error) {
          toastService.error(
            i18n.t("upload.toast.compressionErrorTitle"),
            i18n.t("upload.toast.compressionErrorMessage", {
              fileName: file.name,
            }),
          );
          console.error("Compression error:", error);
          return file;
        }
      }
      return file;
    });

    const compressedFiles = await Promise.all(compressionPromises);

    compressedFiles.forEach((file) => {
      formData.append("files", file);
    });

    const { data } = await api.post("/upload/files", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded / progressEvent.total) * 100,
          );
          onProgress?.(percentCompleted);
        }
      },
      signal,
    });

    return data;
  },
  getRecentGallery: async (): Promise<{
    items: GalleryItem[];
    total: number;
  }> => {
    const { data } = await api.get("/upload/recents");
    return data;
  },
};
