
import axios from 'axios';

const apiBaseUrl =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
  "http://localhost:8000/api";

export const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error?.response?.status === 401 &&
      window.location.pathname !== "/login"
    ) {
      window.location.assign("/login");
    }

    return Promise.reject(error);
  }
);


