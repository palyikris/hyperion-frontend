import { test, expect, timestamp } from "./fixtures";
import { images, longName, mockPopulatedScreens, expectContainedControls, revealPageContent } from "./responsive-support";

test.use({ initialGallery: { images } });
test.describe.configure({ mode: "parallel" });

test.describe("touch and rotation", () => {
  test.use({ hasTouch: true, isMobile: true });

  for (const width of [320, 390, 768]) {
    test(`navigation and media controls remain usable at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 700 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await mockPopulatedScreens(page, "en");
      await page.goto("/dashboard");
      await expect(page.getByRole("heading", { name: "Dashboard", exact: true })).toBeVisible();
      if (width < 768) {
        await page.locator(".sidenav-mobile-toggle").tap();
        const navigation = page.locator("#main-navigation");
        await expect(navigation.locator("nav a")).toHaveCount(6);
        await navigation.locator("a[href='/settings']").scrollIntoViewIfNeeded();
        await expect(navigation.locator("a[href='/settings']")).toBeInViewport();
        await page.keyboard.press("Escape");
        await expect(page.locator(".sidenav-mobile-toggle")).toBeFocused();
        await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
      }
      await page.goto("/vault");
      const editorButton = page.locator(".image-card-zoom-button").first();
      await expect(editorButton.locator("..")).toHaveCSS("opacity", "1");
      await editorButton.tap();
      await expect(page.locator("#latitude")).toBeVisible();
      const canvas = page.locator(".konvajs-content canvas").first();
      await expect(canvas).toBeVisible();
      const bounds = await canvas.boundingBox();
      await canvas.tap({ position: { x: bounds!.width * 0.25, y: bounds!.height * 0.25 } });
      await expect(page.locator("#detection-details-label")).toBeVisible();
      await expectContainedControls(page);
      await page.locator("#detection-details-label").tap();
      await expect(page.getByRole("listbox")).toBeVisible();
      await expectContainedControls(page);
      await page.setViewportSize({ width: 844, height: 390 });
      await expectContainedControls(page);
      await page.setViewportSize({ width, height: 700 });
      await expectContainedControls(page);
    });
  }
});

const viewports = [
  { width: 320, height: 568 }, { width: 390, height: 844 }, { width: 600, height: 960 },
  { width: 768, height: 1024 }, { width: 1024, height: 768 }, { width: 1366, height: 768 },
  { width: 1920, height: 1080 }, { width: 2560, height: 1440 }, { width: 844, height: 390 },
];

for (const language of ["en", "hu"]) {
  for (const viewport of viewports) {
    test(`all screens fit ${viewport.width}x${viewport.height} in ${language}`, async ({ page }, testInfo) => {
      test.setTimeout(120_000);
      await page.setViewportSize(viewport);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.addInitScript(language => localStorage.setItem("i18nextLng", language), language);
      await mockPopulatedScreens(page, language);
      const errors: string[] = [];
      page.on("pageerror", error => errors.push(error.message));
      for (const route of ["/login", "/signup", "/dashboard", "/upload", "/vault", "/stats", "/settings", "/lab/responsive-0", "/map"]) {
        await test.step(route, async () => {
          await page.goto(route);
          await expect(page.locator(route === "/map" ? ".leaflet-container" : route === "/settings" ? "h2" : "h1").first()).toBeVisible();
          if (route === "/lab/responsive-0") await expect(page.locator("#latitude")).toBeVisible();
          // Allow the text reveal and initial layout animations to settle.
          await revealPageContent(page);
          await expectContainedControls(page);
          if (route === "/stats") {
            await expect(page.locator("#chart-temporal .chart-plot")).toHaveCSS("opacity", "1");
            await expect(page.locator("#chart-temporal .recharts-area-curve")).toBeVisible();
          }
          if ([320, 768, 1366, 2560].includes(viewport.width) && language === "en") {
            await page.screenshot({ path: testInfo.outputPath(`${route.replaceAll("/", "-")}.png`), fullPage: true });
          }
          if (route === "/vault") {
            await page.getByRole("button", { name: /Technical Specs|Technikai/i }).first().click();
            await expectContainedControls(page);
            await page.keyboard.press("Escape");
            // Close the metadata overlay explicitly; it is an in-card panel.
            await page.locator(".gallery-grid").first().getByRole("button", { name: /Close|Bezárás/i }).first().click();
            await page.locator("[data-id='responsive-0'] img").first().click();
            await expect(page.getByRole("dialog")).toBeVisible();
            await expectContainedControls(page);
            await page.keyboard.press("Escape");
            await page.locator("#delete-all-button").click();
            await expect(page.getByRole("dialog")).toBeVisible();
            await expectContainedControls(page);
            await page.keyboard.press("Escape");
          }
          if (route === "/upload") {
            await page.locator('input[type="file"]').first().setInputFiles("tests/fixtures/test1.jpg");
            await expect(page.locator("#selected-images-section")).toBeVisible();
            await expectContainedControls(page);
          }
          if (route === "/stats") {
            const buttons = page.locator("header button");
            await buttons.last().click();
            const dialog = page.getByRole("dialog").first();
            await expect(dialog).toBeVisible();
            await expectContainedControls(page);
            await page.locator("button[aria-haspopup='dialog']").first().click();
            await expect(page.getByRole("grid")).toBeVisible();
            await expectContainedControls(page);
            await page.keyboard.press("Escape");
            await page.keyboard.press("Escape");
          }
          if (route === "/map") {
            await page.locator("#show-filters-btn").click();
            const panel = page.locator("#map-filters-panel");
            await expect(panel).toBeVisible();
            await expect(panel).toHaveCSS("opacity", "1");
            const bounds = await panel.boundingBox();
            expect(bounds!.x).toBeGreaterThanOrEqual(0);
            expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(viewport.height + 1);
            await expectContainedControls(page);
            if (viewport.width === 320 && language === "en") await page.screenshot({ path: testInfo.outputPath("map-filters.png") });
          }
        });
      }
      expect(errors).toEqual([]);
    });
  }
}

test.describe("loading, empty, error, and map details", () => {
  for (const viewport of [{ width: 320, height: 568 }, { width: 844, height: 390 }]) {
    test(`secondary states fit ${viewport.width}x${viewport.height}`, async ({ page }, testInfo) => {
      test.setTimeout(90_000);
      await page.setViewportSize(viewport);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await mockPopulatedScreens(page, "en");
      let releaseDashboard!: () => void;
      const dashboardReady = new Promise<void>(resolve => { releaseDashboard = resolve; });
      await page.route("**/api/dashboard/system-health", async route => {
        await dashboardReady;
        await route.fulfill({ json: { status: "operational", environment: "test" } });
      });
      await page.goto("/dashboard");
      await expect(page.locator("body")).toHaveAttribute("data-loading-screen", "true");
      await expectContainedControls(page);
      releaseDashboard();
      await expect(page.locator("body")).not.toHaveAttribute("data-loading-screen");
      await page.route("**/api/vault?*", route => route.fulfill({ json: { image_items: [], video_items: [], total: 0, page: 1, page_size: 20, total_pages: 0 } }));
      await page.goto("/vault");
      await expect(page.locator("#vault-search")).toBeVisible();
      await expectContainedControls(page);
      await page.route("**/api/upload/recents", route => route.fulfill({ status: 400, json: { detail: "Unavailable" } }));
      await page.goto("/upload");
      await expect(page.getByRole("alert")).toBeVisible({ timeout: 15_000 });
      await expectContainedControls(page);
      await page.goto("/login");
      await page.locator("button[type='submit']").click();
      await expect(page.locator("#email")).toHaveAttribute("aria-invalid", "true");
      await expectContainedControls(page);
      await page.route("**/api/map/responsive-0/logs", route => route.fulfill({ json: {
        media_id: "responsive-0", history: [{ action: "PROCESSING_COMPLETED", timestamp, message: "Processing_finished_for_" + longName }], total: 1,
      } }));
      await page.goto("/map");
      await page.locator(".leaflet-marker-icon").first().click();
      const sidebar = page.locator("#marker-sidebar");
      await expect(sidebar).toBeVisible();
      await expect(sidebar).toHaveCSS("transform", /^(none|matrix\(1, 0, 0, 1, 0, 0\))$/);
      await expectContainedControls(page);
      await sidebar.screenshot({ path: testInfo.outputPath("marker-details.png") });
      await sidebar.getByRole("button", { name: "Close", exact: true }).click();
      await page.locator("#show-filters-btn").click();
      await page.getByRole("button", { name: "Analysis Grid", exact: true }).click();
      await page.getByRole("button", { name: "Close filters", exact: true }).click();
      await page.locator(".leaflet-overlay-pane path.leaflet-interactive").first().click();
      await expect(page.locator(".leaflet-popup-content")).toBeVisible();
      await expect.poll(async () => {
        const bounds = await page.locator(".leaflet-popup").boundingBox();
        return !!bounds && bounds.x >= 0 && bounds.x + bounds.width <= viewport.width
          && bounds.y >= 76 && bounds.y + bounds.height <= viewport.height - 64;
      }).toBe(true);
      await expectContainedControls(page);
      await page.screenshot({ path: testInfo.outputPath("grid-popup.png") });
    });
  }
});
