import { api } from "../api/axiosInstance";
import type { GalleryItem } from "../types/upload";

export const uploadService = {
  uploadFiles: async (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    const { data } = await api.post("/upload/files", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
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
