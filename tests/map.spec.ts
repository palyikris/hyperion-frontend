import { test, expect } from "@playwright/test";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MapPage } from "./pages/MapPage";
import { UploadPage } from "./pages/UploadPage";
import { VaultPage } from "./pages/VaultPage";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fileNames = ["test1.jpg", "test2.jpg", "test3.jpg", "test4.jpg"];

test.describe.serial("Map Feature with data lifecycle", () => {
  test.setTimeout(120000);

  test.use({ storageState: "playwright/.auth/user.json" });

  test.afterAll(async ({ browser }) => {
    const context = await browser.newContext({
      storageState: "playwright/.auth/user.json",
    });
    const page = await context.newPage();
    const vaultPage = new VaultPage(page);
    await vaultPage.goto();
    await vaultPage.waitForGalleryResponse();
    if ((await vaultPage.getGalleryImageCardCount()) > 0) {
      await vaultPage.deleteAll();
    }
    await context.close();
  });

  test("should setup data: upload files to generate markers", async ({
    page,
  }) => {
    const uploadPage = new UploadPage(page);
    const filePaths = fileNames.map((name) =>
      path.join(__dirname, "fixtures", name),
    );

    await uploadPage.goto();
    await uploadPage.uploadImageFiles(filePaths);
    await uploadPage.waitForRecentsResponse();
    await uploadPage.waitForStatusBadgesToBe("Ready");
    await uploadPage.waitForTimeout(5000);
  });

  test("should display markers on the map", async ({ page }) => {
    const mapPage = new MapPage(page);
    await mapPage.goto();

    await mapPage.waitForMapResponse();
    await mapPage.waitForTimeout(5000);

    await expect(async () => {
      expect(await mapPage.getMarkerCount()).toBeGreaterThanOrEqual(1);
    }).toPass();
  });

  test("should interact with markers and filters", async ({ page }) => {
    const mapPage = new MapPage(page);
    await mapPage.goto();

    await mapPage.openFilters();
    await mapPage.setViewMode("Heatmap");
    await expect(async () => {
      expect(await mapPage.isHeatmapLayerVisible()).toBe(true);
    }).toPass();

    await mapPage.filterForUploadsWithTrash();
    await mapPage.waitForMapResponse();
    await mapPage.waitForTimeout(5000);

    const markerCountAfterFilter = await mapPage.getMarkerCount();

    await mapPage.setViewMode("Analysis Grid");
    await mapPage.waitForTimeout(5000);
    if (markerCountAfterFilter > 0) {
      await expect(async () => {
        expect(await mapPage.areGridsVisible()).toBe(true);
      }).toPass();
    }
  });
});
