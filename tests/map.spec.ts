import { test, expect } from "./fixtures";
import { MapPage } from "./pages/MapPage";
import type { MapItem } from "../src/types/map";

const trash: MapItem = {
  id: "trash",
  filename: "trash.jpg",
  status: "READY",
  lat: 47.4979,
  lng: 19.0402,
  has_trash: true,
  confidence: 0.95,
  detections: [],
};
const clean: MapItem = {
  ...trash,
  id: "clean",
  filename: "clean.jpg",
  lng: 19.08,
  has_trash: false,
};

test.beforeEach(async ({ page }) => {
  await page.route("**/api/map?*", (route) => {
    const { searchParams } = new URL(route.request().url());
    const items = searchParams.get("has_trash") === "true" ? [trash] : [trash, clean];
    return route.fulfill({ json: { items, video_detections: {}, total: items.length } });
  });
});

test("displays markers and filters them to uploads with trash", async ({ page }) => {
  const mapPage = new MapPage(page);
  await mapPage.goto();
  await expect(mapPage.markers).toHaveCount(2);

  await mapPage.openFilters();
  await mapPage.filterForUploadsWithTrash();
  await expect(mapPage.markers).toHaveCount(1);
});

test("switches from markers to heatmap and analysis grid", async ({ page }) => {
  const mapPage = new MapPage(page);
  await mapPage.goto();
  await expect(mapPage.markers).toHaveCount(2);

  await mapPage.openFilters();
  await mapPage.setViewMode("Heatmap");
  await expect(mapPage.heatmapLayer).toBeVisible();

  await mapPage.setViewMode("Analysis Grid");
  await expect(mapPage.mapOverlayPane.locator("path.leaflet-interactive").first()).toBeVisible();
});