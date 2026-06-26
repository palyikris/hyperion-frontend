// import { test, expect } from "@playwright/test";
// import path from "node:path";
// import { fileURLToPath } from "node:url";
// import { UploadPage } from "./pages/UploadPage";
// import { VaultPage } from "./pages/VaultPage";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// test.describe.serial("Vault features and file handling", () => {
//   test.use({ storageState: "playwright/.auth/user.json" });

//   test.afterAll(async ({ browser }) => {
//     const context = await browser.newContext({
//       storageState: "playwright/.auth/user.json",
//     });
//     const page = await context.newPage();
//     const vaultPage = new VaultPage(page);

//     await vaultPage.goto();
//     await vaultPage.waitForGalleryResponse();

//     const cardCount = await vaultPage.getGalleryImageCardCount();
//     if (cardCount > 0) {
//       await vaultPage.deleteAll();
//     }

//     await context.close();
//   });

//   test("should upload the four test files", async ({ page }) => {
//     const uploadPage = new UploadPage(page);
//     const vaultPage = new VaultPage(page);

//     const fileNames = ["test1.jpg", "test2.jpg", "test3.jpg", "test4.jpg"];
//     const filePaths = fileNames.map((name) =>
//       path.join(__dirname, "fixtures", name),
//     );

//     await uploadPage.goto();
//     await uploadPage.uploadImageFiles(filePaths);

//     await uploadPage.waitForRecentsResponse();

//     const recentImageCount = await uploadPage.getGalleryImageCardCount();
//     expect(recentImageCount).toBeGreaterThanOrEqual(fileNames.length);

//     const recentTitles = await uploadPage.getGalleryImageCardTitles();
//     for (const name of fileNames) {
//       const titleExists = recentTitles.some((t) => t.includes(name));
//       expect(titleExists, `Title containing ${name} not found`).toBe(true);
//     }

//     await vaultPage.goto();
//     await vaultPage.waitForGalleryResponse();

//     const cardCount = await vaultPage.getGalleryImageCardCount();
//     expect(cardCount).toBeGreaterThanOrEqual(fileNames.length);

//     const titles = await vaultPage.getGalleryImageCardTitles();

//     for (const name of fileNames) {
//       const titleExists = titles.some((t) => t.includes(name));
//       expect(titleExists, `Title containing ${name} not found`).toBe(true);
//     }
//   });

//   test("should already contain uploaded images", async ({ page }) => {
//     const vaultPage = new VaultPage(page);

//     await vaultPage.goto();
//     await vaultPage.waitForGalleryResponse();

//     const cardCount = await vaultPage.getGalleryImageCardCount();
//     expect(cardCount).toBeGreaterThanOrEqual(4);
//   });

//   test("search and filter uploaded images in the vault", async ({ page }) => {
//     const vaultPage = new VaultPage(page);

//     await vaultPage.goto();
//     await vaultPage.waitForGalleryResponse();

//     await vaultPage.searchForItem("test1.jpg");
//     await vaultPage.waitForGalleryResponse();
//     expect(await vaultPage.getGalleryImageCardCount()).toBeGreaterThanOrEqual(
//       1,
//     );
//     const titles = await vaultPage.getGalleryImageCardTitles();
//     const titleExists = titles.some((t) => t.includes("test1.jpg"));
//     expect(titleExists, `Title containing test1.jpg not found`).toBe(true);

//     await vaultPage.resetFilters();
//     expect(await vaultPage.getGalleryImageCardCount()).toBeGreaterThanOrEqual(
//       4,
//     );

//     await vaultPage.waitForTimeout(5000);

//     await vaultPage.selectStatusFilter("Ready");
//     expect(await vaultPage.getGalleryImageCardCount()).toBeGreaterThanOrEqual(
//       2,
//     );

//     await vaultPage.resetFilters();
//     expect(await vaultPage.getGalleryImageCardCount()).toBeGreaterThanOrEqual(
//       4,
//     );
//   });
// });
