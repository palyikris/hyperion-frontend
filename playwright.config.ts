import { defineConfig, devices } from "@playwright/test";

const host = "127.0.0.1";
const port = 4173;
const baseURL = `http://${host}:${port}`;

export default defineConfig({
  testDir: "./tests",
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? "line" : "list",
  use: {
    ...devices["Desktop Chrome"],
    baseURL,
    serviceWorkers: "block",
    trace: "retain-on-failure",
  },
  webServer: {
    command: [
      "npm run build -- --outDir playwright/.cache/dist",
      `npm run preview -- --outDir playwright/.cache/dist --host ${host} --port ${port} --strictPort`,
    ].join(" && "),
    url: baseURL,
    env: { VITE_API_BASE_URL: "/api", CARTO_API_KEY: "" },
    stdout: "pipe",
    timeout: 120_000,
  },
});
