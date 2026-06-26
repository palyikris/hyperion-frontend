// import { test, expect } from "@playwright/test";
// import { UploadPage } from "./pages/UploadPage";
// import { VaultPage } from "./pages/VaultPage";
// import path from "node:path";
// import { fileURLToPath } from "node:url";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// test.describe("Upload files to Vault Workflow", () => {
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

//   test("should upload images and verify them in the vault", async ({
//     page,
//   }) => {
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

//   test("should upload a video and verify it in the vault", async ({ page }) => {
//     const uploadPage = new UploadPage(page);
//     const vaultPage = new VaultPage(page);

//     const videoFileName = "test_video.mp4";
//     const videoFilePath = path.join(__dirname, "fixtures", videoFileName);

//     await uploadPage.goto();
//     await uploadPage.uploadVideoFile(videoFilePath);

//     await uploadPage.waitForRecentsResponse();

//     const recentImageCount = await uploadPage.getGalleryImageCardCount();
//     expect(recentImageCount).toBeGreaterThanOrEqual(1);

//     const recentTitles = await uploadPage.getGalleryImageCardTitles();
//     const recentTitleExists = recentTitles.some((t) =>
//       t.includes(videoFileName),
//     );
//     expect(
//       recentTitleExists,
//       `Title containing ${videoFileName} not found`,
//     ).toBe(true);

//     await vaultPage.goto();
//     await vaultPage.waitForGalleryResponse();

//     const cardCount = await vaultPage.getGalleryImageCardCount();
//     expect(cardCount).toBeGreaterThanOrEqual(2);

//     const titles = await vaultPage.getGalleryImageCardTitles();
//     const titleExists = titles.some((t) => t.includes(videoFileName));
//     expect(titleExists, `Title containing ${videoFileName} not found`).toBe(
//       true,
//     );
//   });
// });
