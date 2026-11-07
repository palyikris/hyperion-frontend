import { test, expect, galleryItem, imageNames } from "./fixtures";
import { VaultPage } from "./pages/VaultPage";

test.use({
  initialGallery: {
    images: imageNames.map((name, index) => ({
      ...galleryItem(name),
      status: index === 0 ? "READY" : "PROCESSING",
    })),
  },
});

test("lists uploaded images and applies and resets search and status filters", async ({ page }) => {
  const vaultPage = new VaultPage(page);
  const headings = page.locator("#image-items").getByRole("heading");

  await vaultPage.goto();
  await expect(headings).toHaveText(imageNames);

  await vaultPage.searchForItem(imageNames[1]);
  await expect(headings).toHaveText([imageNames[1]]);
  await vaultPage.resetFilters();
  await expect(headings).toHaveText(imageNames);

  await vaultPage.selectStatusFilter("READY");
  await expect(headings).toHaveText([imageNames[0]]);
  await vaultPage.resetFilters();
  await expect(headings).toHaveText(imageNames);
});
