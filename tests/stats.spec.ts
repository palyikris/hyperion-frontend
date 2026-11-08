import type { Page } from "@playwright/test";
import { test, expect, testUser } from "./fixtures";

async function mockStats(page: Page) {
  const responses: Record<string, unknown> = {
    "fun-facts": { facts: [] },
    "trash-composition": [],
    "temporal-trends": [],
    "ai-fleet-efficiency": { workers: [], fleet_reliability_score: 0, total_successes: 0, total_failures: 0 },
    "mean-time-to-process": { overall_avg_seconds: 0, by_worker: [] },
    "hotspot-density": { hotspot_count: 0, high_confidence_media_count: 0 },
  };
  await page.route("**/api/stats/**", route => {
    const path = new URL(route.request().url()).pathname;
    if (path.includes("/reports/")) {
      const extension = path.endsWith("pdf") ? "pdf" : "xlsx";
      return route.fulfill({
        headers: { "content-type": "application/octet-stream", "x-report-filename": `report.${extension}` },
        body: "Test report download",
      });
    }
    return route.fulfill({ json: responses[path.split("/").pop()!] ?? {} });
  });
}

test("exports selected calendar dates in both formats without a browser date picker", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1280, height: 960 });
  await page.clock.setFixedTime(new Date("2026-06-15T12:00:00Z"));
  await mockStats(page);
  await page.goto("/stats");
  for (const [label, endpoint, extension] of [
    ["Export Manifest", "manifest", "xlsx"], ["Export PDF", "pdf", "pdf"],
  ]) {
    await page.getByRole("button", { name: label, exact: true }).click();
    const modal = page.getByRole("dialog", { name: "Choose report dates" });
    await expect(page.locator('input[type="date"]')).toHaveCount(0);
    await expect(modal.getByRole("button", { name: label, exact: true })).toBeDisabled();
    await modal.getByRole("button", { name: "Start date", exact: true }).click();
    await page.getByRole("button", { name: "Monday, 1 June 2026", exact: true }).click();
    await modal.getByRole("button", { name: "End date", exact: true }).click();
    await page.getByRole("button", { name: "Monday, 15 June 2026", exact: true }).click();
    if (endpoint === "pdf") {
      await modal.getByRole("button", { name: "End date", exact: true }).click();
      await page.screenshot({ path: testInfo.outputPath("calendar-desktop.png") });
      await page.keyboard.press("Escape");
    }
    const request = page.waitForRequest(request => new URL(request.url()).pathname === `/api/stats/reports/${endpoint}`);
    const download = page.waitForEvent("download");
    await modal.getByRole("button", { name: label, exact: true }).click();
    const params = new URL((await request).url()).searchParams;
    expect(Object.fromEntries(params)).toEqual({ start_date: "2026-06-01", end_date: "2026-06-15", language: "en" });
    expect((await download).suggestedFilename()).toBe(`report.${extension}`);
    await expect(modal).toHaveCount(0);
  }
});

test("keeps the custom calendar usable on mobile and localizes it in Hungarian", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 700 });
  await page.clock.setFixedTime(new Date("2026-06-15T12:00:00Z"));
  await mockStats(page);
  await page.route("**/api/auth/me", route => route.fulfill({ json: { ...testUser, language: "hu" } }));
  await page.goto("/stats");
  await page.getByRole("button", { name: "PDF exportálása", exact: true }).click();
  const modal = page.getByRole("dialog", { name: "Jelentési időszak kiválasztása" });
  await expect(modal.getByRole("heading").locator("..")).toHaveCSS("opacity", "1");
  await modal.getByRole("button", { name: "Kezdő dátum", exact: true }).click();
  const calendar = page.getByRole("dialog", { name: "Naptár: Kezdő dátum" });
  await expect(calendar.getByRole("button", { name: "Hónap kiválasztása" })).toHaveText("június");
  await expect(calendar.getByRole("columnheader", { name: "hétfő", exact: true })).toBeVisible();
  const bounds = await modal.boundingBox();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.y).toBeGreaterThanOrEqual(0);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(390);
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(701);
  await page.screenshot({ path: testInfo.outputPath("calendar-mobile-hu.png") });
  await calendar.getByRole("button", { name: "2026. június 1., hétfő", exact: true }).click();
  await expect(modal.getByRole("button", { name: "Kezdő dátum", exact: true })).toContainText("2026. jún. 1.");
  await modal.getByRole("button", { name: "Záró dátum", exact: true }).click();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Enter");
  await expect(modal.getByRole("button", { name: "Záró dátum", exact: true })).toContainText("2026. jún. 2.");
  await expect(modal.getByRole("button", { name: "PDF exportálása", exact: true })).toBeEnabled();
  await modal.getByRole("button", { name: "Kezdő dátum", exact: true }).click();
  await modal.getByRole("heading").click();
  await expect(page.getByRole("dialog", { name: "Naptár: Kezdő dátum" })).toHaveCount(0);
  await expect(modal.getByRole("button", { name: "Kezdő dátum", exact: true })).toBeFocused();
  await modal.getByRole("button", { name: "Kezdő dátum", exact: true }).click();
  await page.keyboard.press("Escape");
  await expect(modal).toBeVisible();
  await expect(modal.getByRole("button", { name: "Kezdő dátum", exact: true })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(modal).toHaveCount(0);
});
