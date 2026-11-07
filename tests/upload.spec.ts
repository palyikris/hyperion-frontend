import path from "node:path";
import { fileURLToPath } from "node:url";
import { test, expect, imageNames } from "./fixtures";
import { UploadPage } from "./pages/UploadPage";
import { VaultPage } from "./pages/VaultPage";

const fixtureDirectory = fileURLToPath(new URL("./fixtures", import.meta.url));

test("uploads images and shows them in recents and the vault", async ({ page }) => {
  const uploadPage = new UploadPage(page);
  const vaultPage = new VaultPage(page);
  const files = imageNames.map((name) => path.join(fixtureDirectory, name));

  await uploadPage.goto();
  await uploadPage.uploadImageFiles(files);
  for (const name of imageNames) {
    await expect(page.locator("#image-items").getByRole("heading", { name, exact: true })).toBeVisible();
  }

  await vaultPage.goto();
  for (const name of imageNames) {
    await expect(page.locator("#image-items").getByRole("heading", { name, exact: true })).toBeVisible();
  }
});

test("uploads a video and shows its detection in recents and the vault", async ({ page }) => {
  const uploadPage = new UploadPage(page);
  const vaultPage = new VaultPage(page);
  const name = "test_video.mp4";
  const detection = page.locator("#video-items").getByRole("heading", { name: `${name} - Plastic` });

  await uploadPage.goto();
  await uploadPage.uploadVideoFile(path.join(fixtureDirectory, name));
  await expect(detection).toBeVisible();

  await vaultPage.goto();
  await expect(detection).toBeVisible();
});