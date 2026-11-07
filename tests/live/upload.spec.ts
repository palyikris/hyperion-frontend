import { test, expect } from "@playwright/test";
import { UploadPage } from "../pages/UploadPage";
import { VaultPage } from "../pages/VaultPage";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe("Upload files to Vault Workflow", () => {
  test.setTimeout(180000);
  test.use({ storageState: "playwright/.auth/user.json" });

  test.afterAll(async ({ browser }) => {
    const context = await browser.newContext({
      storageState: "playwright/.auth/user.json",
    });
    const page = await context.newPage();
    const vaultPage = new VaultPage(page);

    await vaultPage.goto();

    await vaultPage.deleteAllIfPresent();

    await context.close();
  });

  test("should upload images and verify them in the vault", async ({
    page,
  }) => {
    const uploadPage = new UploadPage(page);
    const vaultPage = new VaultPage(page);

    const fileNames = ["test1.jpg", "test2.jpg", "test3.jpg", "test4.jpg"];
    const filePaths = fileNames.map((name) =>
      path.join(__dirname, "../fixtures", name),
    );

    await uploadPage.goto();
    await uploadPage.uploadImageFiles(filePaths);

    await expect(async () => {
      const recentTitles = await uploadPage.getGalleryImageCardTitles();
      for (const name of fileNames) {
        expect(recentTitles.some((title) => title.includes(name))).toBe(true);
      }
    }).toPass();

    await vaultPage.goto();

    const cardCount = await vaultPage.getGalleryImageCardCount();
    expect(cardCount).toBeGreaterThanOrEqual(fileNames.length);

    const titles = await vaultPage.getGalleryImageCardTitles();

    for (const name of fileNames) {
      const titleExists = titles.some((t) => t.includes(name));
      expect(titleExists, `Title containing ${name} not found`).toBe(true);
    }
  });

  test("should upload a video and verify it in the vault", async ({ page }) => {
    const uploadPage = new UploadPage(page);
    const vaultPage = new VaultPage(page);

    const videoFileName = "test_video.mp4";
    const videoFilePath = path.join(__dirname, "../fixtures", videoFileName);

    await uploadPage.goto();
    await uploadPage.uploadVideoFile(videoFilePath);

    // Upload completion precedes AI completion. Verify the stored video record
    // rather than requiring a detection from the external model.
    await expect(async () => {
      const titles = await uploadPage.getGalleryImageCardTitles();
      expect(titles.some((title) => title.includes(videoFileName))).toBe(true);
    }).toPass();

    await vaultPage.goto();

    await expect(async () => {
      const titles = [
        ...await vaultPage.getGalleryImageCardTitles(),
        ...await vaultPage.getGalleryVideoCardTitles(),
      ];
      expect(titles.some((title) => title.includes(videoFileName))).toBe(true);
    }).toPass();
  });
});
