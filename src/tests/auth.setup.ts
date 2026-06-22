import { test as setup, expect } from "@playwright/test";
import { LoginPage } from "./pages/LoginPage";

const authFile = "playwright/.auth/user.json";

setup("authenticate", async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();

  await loginPage.login("palyi.kristof@gmail.com", "Nem1234!");

  await expect(page).toHaveURL(/.*dashboard/);

  await page.context().storageState({ path: authFile });
});
