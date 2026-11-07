import { test, expect } from "@playwright/test";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { UploadPage } from "../pages/UploadPage";
import { VaultPage } from "../pages/VaultPage";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe.serial("Vault features and file handling", () => {
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

  test("should upload the four test files", async ({ page }) => {
    const uploadPage = new UploadPage(page);
    const vaultPage = new VaultPage(page);

    const fileNames = ["test1.jpg", "test2.jpg", "test3.jpg", "test4.jpg"];
    const filePaths = fileNames.map((name) =>
      path.join(__dirname, "../fixtures", name),
    );

    await uploadPage.goto();
    await uploadPage.uploadImageFiles(filePaths);

    await expect(async () => {
      const titles = await uploadPage.getGalleryImageCardTitles();
      for (const name of fileNames) {
        expect(titles.some((title) => title.includes(name))).toBe(true);
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

  test("should already contain uploaded images", async ({ page }) => {
    const vaultPage = new VaultPage(page);

    await vaultPage.goto();

    const cardCount = await vaultPage.getGalleryImageCardCount();
    expect(cardCount).toBeGreaterThanOrEqual(4);
  });

  test("search and filter uploaded images in the vault", async ({ page }) => {
    const vaultPage = new VaultPage(page);

    await vaultPage.goto();

    await vaultPage.searchForItem("test1.jpg");
    await expect(async () => {
      const titles = await vaultPage.getGalleryImageCardTitles();
      expect(titles.length).toBeGreaterThanOrEqual(1);
      expect(titles.every((title) => title.includes("test1.jpg"))).toBe(true);
    }).toPass();

    await vaultPage.resetFilters();
    await expect(async () => {
      expect(await vaultPage.getGalleryImageCardCount()).toBeGreaterThanOrEqual(4);
    }).toPass();

    await vaultPage.selectStatusFilter("Ready");
    await expect(async () => {
      expect(await vaultPage.getGalleryImageCardCount()).toBeGreaterThanOrEqual(1);
      const statuses = await page.locator("#image-items .gallery-card-status-badge").allTextContents();
      expect(statuses.every((status) => status.trim() === "Ready")).toBe(true);
    }).toPass({ timeout: 120000 });

    await vaultPage.resetFilters();
    await expect(async () => {
      expect(await vaultPage.getGalleryImageCardCount()).toBeGreaterThanOrEqual(4);
    }).toPass();
  });
});
