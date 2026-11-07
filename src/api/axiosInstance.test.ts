import { afterEach, beforeEach, expect, it, vi } from "vitest";

beforeEach(() => { vi.resetModules(); });
afterEach(() => { vi.unstubAllEnvs(); });

it("uses the local backend by default when no API base URL is configured", async () => {
  vi.stubEnv("VITE_API_BASE_URL", "");
  const { api } = await import("./axiosInstance");
  expect(api.defaults.baseURL).toBe("http://localhost:8000/api");
  expect(api.defaults.withCredentials).toBe(true);
});

it("preserves a configured relative API URL for both HTTP and WebSocket use", async () => {
  vi.stubEnv("VITE_API_BASE_URL", "/api");
  const { api } = await import("./axiosInstance");
  expect(api.defaults.baseURL).toBe("/api");
});
