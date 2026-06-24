// import { test, expect } from "@playwright/test";
// import { VaultPage } from "./pages/VaultPage";


// test.describe.serial("Upload files to Vault Workflow", () => {
//   test.use({ storageState: "playwright/.auth/user.json" });

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

//     // Apply search filter
//     await vaultPage.searchForItem("test1.jpg");
//     await vaultPage.waitForGalleryResponse();
//     expect(await vaultPage.getGalleryImageCardCount()).toBeGreaterThanOrEqual(1);
//     const titles = await vaultPage.getGalleryImageCardTitles();
//     const titleExists = titles.some((t) => t.includes("test1.jpg"));
//     expect(titleExists, `Title containing test1.jpg not found`).toBe(true);

//     // Reset filters
//     await vaultPage.resetFilters();
//     await vaultPage.waitForGalleryResponse();
//     expect(await vaultPage.getGalleryImageCardCount()).toBeGreaterThanOrEqual(4);

//     // Apply status filter
//     await vaultPage.selectStatusFilter("Ready");
//     await vaultPage.waitForGalleryResponse();
//     expect(await vaultPage.getGalleryImageCardCount()).toBeGreaterThanOrEqual(4);

//     // Reset filters
//     await vaultPage.resetFilters();
//     await vaultPage.waitForGalleryResponse();
//     expect(await vaultPage.getGalleryImageCardCount()).toBeGreaterThanOrEqual(4);

//   });
// });