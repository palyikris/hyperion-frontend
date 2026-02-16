import { api } from "../api/axiosInstance";
import type {
  AIWorkersResponse,
  SystemHealthResponse,
  UXResponse,
} from "../types/dashboard";

export const dashboardService = {
  getSystemHealth: async () => {
    const { data } = await api.get<SystemHealthResponse>(
      "/dashboard/system-health",
    );
    return data;
  },

  getUserExperience: async () => {
    const { data } = await api.get<UXResponse>("/dashboard/user-experience");
    return data;
  },

  getAIWorkers: async () => {
    const { data } = await api.get<AIWorkersResponse>("/dashboard/ai-workers");
    return data;
  },
};
