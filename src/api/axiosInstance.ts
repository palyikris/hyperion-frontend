
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


