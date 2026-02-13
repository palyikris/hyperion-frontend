import { api } from "../api/axiosInstance";
import type { UserData } from "../types/auth/auth";

export const authService = {
  signup: async (userData: UserData) => {
    const { data } = await api.post("/auth/signup", userData);
    return data;
  },

  login: async (credentials: Omit<UserData, "full_name">) => {
    const { data } = await api.post("/auth/login", credentials);
    return data;
  },

  logout: async () => {
    await api.post("/auth/logout");
    return;
  },
};
