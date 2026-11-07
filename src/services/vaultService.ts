import { api } from "../api/axiosInstance";
import type { CardStatus, VaultResponse } from "../types/upload";

export interface VaultParams {
  search?: string;
  status?: CardStatus;
  order_by?: string;
  direction?: "asc" | "desc";
  page?: number;
  page_size?: number;
}

export const vaultService = {
  getVaultItems: async (
    params: VaultParams,
  ): Promise<VaultResponse> => {
    const { data } = await api.get<VaultResponse>("/vault", { params });
    return data;
  },
  deleteVaultItem: async (id: string): Promise<void> => {
    await api.delete(`/vault/${id}`);
  },
  deleteAllMedia: async (): Promise<{ deleted_count: number }> => {
    const { data } = await api.delete("/vault/all");
    return data;
  },
};
