import { api } from "../api/axiosInstance";
import axios from "axios";
import type { FileUploadProgress, GalleryItem } from "../types/upload";
import imageCompression from "browser-image-compression";
import { toastService } from "./toastService";
import i18n from "i18next";
import type { VideoDetectionResponse } from "../types/lab";
import { getVideoContentType } from "../utils/fileTypes";

const CHUNK_SIZE = 2 * 1024 * 1024;
const UPLOAD_CONCURRENCY = 4;

interface UploadResponse {
  message: string;
  media_ids: string[];
}

export const uploadService = {
  uploadFiles: async (
    files: File[],
    onProgress?: (update: FileUploadProgress) => void,
    signal?: AbortSignal,
  ) => {
    const options = {
      maxSizeMB: 5,
      maxWidthOrHeight: 2560,
      useWebWorker: true,
      preserveExif: true,
      initialQuality: 0.85,
      signal,
    };
    const results: UploadResponse[] = [];
    const errors: unknown[] = [];
    let nextIndex = 0;

    const uploadFile = async (file: File, index: number) => {
      let progress = 0;
      try {
        if (signal?.aborted) throw new axios.CanceledError();
        onProgress?.({ index, progress, status: "preparing" });
        let preparedFile = file;
        if (["image/jpeg", "image/png"].includes(file.type)) {
          try {
            const compressed = await imageCompression(file, options);
            preparedFile = new File([compressed], file.name, {
              type: compressed.type || file.type,
              lastModified: file.lastModified,
            });
          } catch (error) {
            if (signal?.aborted || axios.isCancel(error)) throw error;
            toastService.error(
              i18n.t("upload.toast.compressionErrorTitle"),
              i18n.t("upload.toast.compressionErrorMessage", { fileName: file.name }),
            );
            console.error("Compression error:", error);
          }
        }
        if (signal?.aborted) throw new axios.CanceledError();
        const formData = new FormData();
        formData.append("files", preparedFile);
        onProgress?.({ index, progress, status: "uploading" });
        const { data } = await api.post<UploadResponse>("/upload/files", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          signal,
          onUploadProgress: (event) => {
            if (!event.total || signal?.aborted) return;
            progress = Math.round(event.loaded / event.total * 100);
            onProgress?.({ index, progress, status: "uploading" });
          },
        });
        results[index] = data;
        onProgress?.({ index, progress: 100, status: "completed" });
      } catch (error) {
        errors.push(error);
        onProgress?.({
          index, progress,
          status: signal?.aborted || axios.isCancel(error) ? "cancelled" : "error",
          error: error instanceof Error ? error.message : i18n.t("upload.errors.general"),
        });
      }
    };
    const runners = Array.from({ length: Math.min(UPLOAD_CONCURRENCY, files.length) }, async () => {
      while (nextIndex < files.length && !signal?.aborted) {
        const index = nextIndex++;
        await uploadFile(files[index], index);
      }
    });
    await Promise.all(runners);
    if (signal?.aborted) throw new axios.CanceledError("Upload cancelled by user");
    if (errors.length) throw new AggregateError(errors, "One or more files failed to upload");
    return {
      message: `${results.length} files uploaded successfully`,
      media_ids: results.flatMap((result) => result.media_ids),
    };
  },

  uploadVideoChunked: async (
    file: File,
    onProgress?: (progress: number) => void,
    signal?: AbortSignal,
  ) => {
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    let mediaId: string | null = null;
    const MAX_RETRIES = 2;
    let completedChunks = 0;
    let hasError = false;
    let firstChunkError: unknown;
    let completionStarted = false;
    let runners: Promise<void>[] = [];
    const controller = new AbortController();
    const forwardAbort = () => controller.abort();
    if (signal?.aborted) forwardAbort();
    else signal?.addEventListener("abort", forwardAbort, { once: true });
    const uploadSignal = controller.signal;

    const uploadChunk = async (i: number, retries = 0): Promise<void> => {
      if (uploadSignal.aborted) throw new axios.CanceledError("Upload cancelled by user");
      const start = i * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const chunk = file.slice(start, end);
      const chunkForm = new FormData();
      chunkForm.append("chunk_index", i.toString());
      chunkForm.append("chunk", chunk);
      try {
        await api.post(`/upload/video/chunk/${mediaId}`, chunkForm, {
          headers: { "Content-Type": "multipart/form-data" },
          signal: uploadSignal,
        });
        if (uploadSignal.aborted) throw new axios.CanceledError("Upload cancelled by user");
        completedChunks++;
        if (onProgress) {
          const percentCompleted = Math.round(
            (completedChunks / totalChunks) * 100,
          );
          onProgress(percentCompleted);
        }
      } catch (err) {
        if (uploadSignal.aborted || axios.isCancel(err)) throw err;
        if (retries < MAX_RETRIES) {
          return uploadChunk(i, retries + 1);
        } else {
          throw err;
        }
      }
    };

    try {
      const initForm = new FormData();
      initForm.append("filename", file.name);
      initForm.append("content_type", getVideoContentType(file));
      initForm.append("total_size", file.size.toString());
      initForm.append("total_chunks", totalChunks.toString());

      const initResponse = await api.post("/upload/video/init", initForm, {
        headers: { "Content-Type": "multipart/form-data" },
        signal: uploadSignal,
      });

      mediaId = initResponse.data.media_id;
      if (!mediaId)
        throw new Error("Failed to get media_id from init endpoint");

      const chunkIndexes = Array.from({ length: totalChunks }, (_, i) => i);

      // Queue for parallel uploads
      let current = 0;
      const runNext = async (): Promise<void> => {
        while (!uploadSignal.aborted && current < chunkIndexes.length) {
          const idx = current++;
          try {
            await uploadChunk(chunkIndexes[idx]);
          } catch (error) {
            if (!hasError) { hasError = true; firstChunkError = error; }
            controller.abort();
            throw error;
          }
        }
      };

      // Start a bounded number of parallel uploads.
      runners = Array.from(
        { length: Math.min(UPLOAD_CONCURRENCY, totalChunks) },
        () => runNext(),
      );
      await Promise.all(runners);

      if (uploadSignal.aborted) throw new axios.CanceledError("Upload cancelled by user");

      const completeForm = new FormData();
      completeForm.append("total_chunks", totalChunks.toString());

      completionStarted = true;
      const completeResponse = await api.post(
        `/upload/video/complete/${mediaId}`,
        completeForm,
        {
          headers: { "Content-Type": "multipart/form-data" },
          signal: uploadSignal,
        },
      );

      return completeResponse.data;
    } catch (error) {
      controller.abort();
      // Settle every local upload task before requesting server-side cleanup.
      await Promise.allSettled(runners);
      if (
        mediaId &&
        (!completionStarted || axios.isCancel(error) || signal?.aborted)
      ) {
        try {
          await api.delete(`/upload/video/cancel/${mediaId}`);
        } catch (cleanupError) {
          console.error("Failed to clean up cancelled video:", cleanupError);
        }
      }
      throw hasError ? firstChunkError : error;
    } finally {
      signal?.removeEventListener("abort", forwardAbort);
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
