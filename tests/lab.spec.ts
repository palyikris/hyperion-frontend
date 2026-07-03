import { test, expect, type Page } from "@playwright/test";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { LabPage } from "./pages/LabPage";
import { UploadPage } from "./pages/UploadPage";
import { VaultPage } from "./pages/VaultPage";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fileNames = ["test1.jpg", "test2.jpg", "test3.jpg", "test4.jpg"];

let sharedPage: Page;
let mediaId: string;

async function openLabPage() {
  const labPage = new LabPage(sharedPage);
  await labPage.goto(mediaId);
  await labPage.waitForLabResponse();
  return labPage;
}

test.describe.serial("Lab Feature: Detections and Minimap Lifecycle", () => {
  test.setTimeout(180000);

  test.use({ storageState: "playwright/.auth/user.json" });

  test.beforeAll(
    "should upload images and navigate directly to lab",
    async ({ browser }, testInfo) => {
      testInfo.setTimeout(180000);

      const context = await browser.newContext({
        storageState: "playwright/.auth/user.json",
      });
      sharedPage = await context.newPage();

      const uploadPage = new UploadPage(sharedPage);
      const filePaths = fileNames.map((name) =>
        path.join(__dirname, "fixtures", name),
      );

      await uploadPage.goto();
      await uploadPage.uploadImageFiles(filePaths);
      await uploadPage.waitForRecentsResponse();
      await uploadPage.waitForStatusBadgesToBe("Ready");

      await uploadPage.waitForGalleryImageCardCount(1);
      mediaId = await uploadPage.getFirstImageCardId();

      await openLabPage();
    },
  );

  test.afterAll(async () => {
    const vaultPage = new VaultPage(sharedPage);
    await vaultPage.goto();
    await vaultPage.waitForGalleryResponse();
    if ((await vaultPage.getGalleryImageCardCount()) > 0) {
      await vaultPage.deleteAll();
    }
    await sharedPage.context().close();
  });

  test("should update minimap location", async () => {
    const labPage = await openLabPage();

    await labPage.setMinimapLocation(47.4979, 19.0402, 100);
    await labPage.saveMinimapLocation();
    await labPage.waitForLabResponse();

    expect(await labPage.getMinimapLocation()).toEqual({
      latitude: 47.4979,
      longitude: 19.0402,
      altitude: 100,
    });
  });

  test("should toggle detection visibility", async () => {
    const labPage = await openLabPage();

    await labPage.showNoDetections();
    await labPage.showAllDetections();
  });
});
