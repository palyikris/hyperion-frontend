import { api } from "../api/axiosInstance";
import type { GalleryItem, CardStatus } from "../types/upload";

export interface VaultParams {
  search?: string;
  status?: CardStatus;
  order_by?: string;
  direction?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

export const vaultService = {
  getVaultItems: async (params: VaultParams): Promise<{
    total: number;
    items: GalleryItem[];
  }> => {
    const { data } = await api.get("/vault", { params });
    return data;
  },
  deleteVaultItem: async (id: string): Promise<void> => {
    await api.delete(`/vault/${id}`);
  }
};
