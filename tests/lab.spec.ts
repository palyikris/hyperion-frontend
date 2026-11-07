import { test, expect, galleryItem } from "./fixtures";
import { LabPage } from "./pages/LabPage";
import type { MediaPatchRequest, MediaResponse } from "../src/types/lab";

const mediaId = "lab-image";

test.beforeEach(async ({ page }) => {
  let media: MediaResponse = {
    ...galleryItem("test1.jpg", mediaId),
    lat: 47.5,
    lng: 19.05,
    altitude: 90,
    detections: [
      { id: "plastic", label: "Plastic", confidence: 0.95, bbox: { x: 10, y: 10, w: 100, h: 100 } },
    ],
  };

  await page.route(`**/api/lab/image/${mediaId}`, (route) => route.fulfill({ json: media }));
  await page.route(`**/api/lab/${mediaId}`, (route) => {
    const { lat, lng, altitude } = route.request().postDataJSON() as MediaPatchRequest;
    media = { ...media, lat, lng, altitude };
    return route.fulfill({ json: media });
  });
});

test("saves new minimap coordinates and loads them again", async ({ page }) => {
  const labPage = new LabPage(page);
  await labPage.goto(mediaId);

  await labPage.setMinimapLocation(47.4979, 19.0402, 100);
  const [response] = await Promise.all([
    page.waitForResponse((result) =>
      result.url().endsWith(`/api/lab/${mediaId}`) && result.request().method() === "PATCH",
    ),
    labPage.saveMinimapLocation(),
  ]);
  expect(response.ok()).toBe(true);
  expect(response.request().postDataJSON()).toEqual({
    item_type: "image",
    lat: 47.4979,
    lng: 19.0402,
    altitude: 100,
  });

  await page.reload();
  await expect(page.locator("#latitude")).toHaveValue("47.4979");
  await expect(page.locator("#longitude")).toHaveValue("19.0402");
  await expect(page.locator("#altitude")).toHaveValue("100");
});

test("hides and restores detections", async ({ page }) => {
  const labPage = new LabPage(page);
  await labPage.goto(mediaId);
  const toggle = page.getByRole("button", { name: "Plastic - 95%" });

  await expect(toggle).toHaveAttribute("title", "Hide detection");
  await labPage.showNoDetections();
  await expect(toggle).toHaveAttribute("title", "Show detection");
  await labPage.showAllDetections();
  await expect(toggle).toHaveAttribute("title", "Hide detection");
});