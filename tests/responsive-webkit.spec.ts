import { test, expect } from "./fixtures";
import { images, mockPopulatedScreens, expectContainedControls, revealPageContent } from "./responsive-support";

// WebKit needs its platform libraries installed; opt in where available.
test.skip(process.env.HYPERION_TEST_WEBKIT !== "1", "Set HYPERION_TEST_WEBKIT=1 on a host with WebKit dependencies installed.");
test.use({ browserName: "webkit", initialGallery: { images } });

test.describe("WebKit layouts", () => {

  test("all screens fit on a phone and laptop in WebKit", async ({ page }) => {
    test.setTimeout(120_000);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await mockPopulatedScreens(page, "en");
    for (const viewport of [{ width: 390, height: 844 }, { width: 1366, height: 768 }]) {
      await page.setViewportSize(viewport);
      for (const route of ["/login", "/signup", "/dashboard", "/upload", "/vault", "/stats", "/settings", "/lab/responsive-0", "/map"]) {
        await page.goto(route);
        await expect(page.locator(route === "/map" ? ".leaflet-container" : route === "/settings" ? "h2" : "h1").first()).toBeVisible();
        await revealPageContent(page);
        await expectContainedControls(page);
      }
    }
  });
});
