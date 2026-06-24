import { chromium, FullConfig } from "@playwright/test";
import { VaultPage } from "./tests/pages/VaultPage";
import path from "path";

async function globalTeardown() {
  const storageState = path.join("playwright", ".auth", "user.json");
  const baseURL = "https://hyperion-frontend-blond.vercel.app";
  const browser = await chromium.launch();
  const page = await browser.newPage({ storageState });

  const vaultPage = new VaultPage(page);
  await page.goto(baseURL + "/vault");
  await vaultPage.waitForGalleryResponse();

  const initialCount = await vaultPage.getGalleryImageCardCount();
  if (initialCount > 0) {
    await vaultPage.deleteAllVaultItems();
    await vaultPage.waitForDeleteAllResponse();
  }

  await browser.close();
}

export default globalTeardown;
