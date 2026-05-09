import { api } from "../api/axiosInstance";
import axios from "axios";
import type { GalleryItem } from "../types/upload";
import imageCompression from "browser-image-compression";
import { toastService } from "./toastService";
import i18n from "i18next";
import type { VideoDetectionResponse } from "../types/lab";

const CHUNK_SIZE = 2 * 1024 * 1024;

export const uploadService = {
  uploadFiles: async (
    files: File[],
    onProgress?: (progress: number) => void,
    signal?: AbortSignal,
  ) => {
    const options = {
      maxSizeMB: 5,
      maxWidthOrHeight: 2560,
      useWebWorker: true,
      preserveExif: true,
      initialQuality: 0.85,
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

  uploadVideoChunked: async (
    file: File,
    onProgress?: (progress: number) => void,
    signal?: AbortSignal,
  ) => {
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    let mediaId: string | null = null;
    const CONCURRENCY = 4;
    const MAX_RETRIES = 2;
    let completedChunks = 0;
    let hasError = false;

    const uploadChunk = async (i: number, retries = 0): Promise<void> => {
      if (signal?.aborted) throw new axios.Cancel("Upload cancelled by user");
      const start = i * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const chunk = file.slice(start, end);
      const chunkForm = new FormData();
      chunkForm.append("chunk_index", i.toString());
      chunkForm.append("chunk", chunk);
      try {
        await api.post(`/upload/video/chunk/${mediaId}`, chunkForm, {
          headers: { "Content-Type": "multipart/form-data" },
          signal,
        });
        completedChunks++;
        if (onProgress) {
          const percentCompleted = Math.round(
            (completedChunks / totalChunks) * 100,
          );
          onProgress(percentCompleted);
        }
      } catch (err) {
        if (signal?.aborted) throw new axios.Cancel("Upload cancelled by user");
        if (retries < MAX_RETRIES) {
          return uploadChunk(i, retries + 1);
        } else {
          hasError = true;
          throw err;
        }
      }
    };

    try {
      const initForm = new FormData();
      initForm.append("filename", file.name);
      initForm.append("total_size", file.size.toString());
      initForm.append("total_chunks", totalChunks.toString());

      const initResponse = await api.post("/upload/video/init", initForm, {
        headers: { "Content-Type": "multipart/form-data" },
        signal,
      });

      mediaId = initResponse.data.media_id;
      if (!mediaId)
        throw new Error("Failed to get media_id from init endpoint");

      const chunkIndexes = Array.from({ length: totalChunks }, (_, i) => i);

      // Queue for parallel uploads
      let current = 0;
      const runNext = async (): Promise<void> => {
        if (hasError || current >= chunkIndexes.length) return;
        const idx = current++;
        await uploadChunk(chunkIndexes[idx]);
        if (!hasError && current < chunkIndexes.length) {
          return runNext();
        }
      };

      // Start up to CONCURRENCY parallel uploads
      const runners = Array.from(
        { length: Math.min(CONCURRENCY, totalChunks) },
        () => runNext(),
      );
      await Promise.all(runners);

      if (hasError) throw new Error("One or more chunks failed to upload");

      const completeForm = new FormData();
      completeForm.append("total_chunks", totalChunks.toString());

      const completeResponse = await api.post(
        `/upload/video/complete/${mediaId}`,
        completeForm,
        {
          headers: { "Content-Type": "multipart/form-data" },
          signal,
        },
      );

      return completeResponse.data;
    } catch (error) {
      if (
        mediaId &&
        (axios.isCancel(error) || (error as Error).name === "CanceledError")
      ) {
        console.log(`Upload cancelled. Cleaning up media: ${mediaId}`);
        try {
          await api.delete(`/upload/video/cancel/${mediaId}`);
        } catch (cleanupError) {
          console.error("Failed to clean up cancelled video:", cleanupError);
        }
      }
      throw error;
    }
  },

  getRecentGallery: async (): Promise<{
    image_items: GalleryItem[];
    video_items: VideoDetectionResponse[];
    total: number;
  }> => {
    const { data } = await api.get("/upload/recents");
    return data;
  },
};
