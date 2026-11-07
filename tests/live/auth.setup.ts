import { test as setup, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { getTestCredentials } from "../testAccount";

const authFile = "playwright/.auth/user.json";

setup("authenticate", async ({ page }) => {
  const { email, password } = getTestCredentials();
  const loginPage = new LoginPage(page);
  await loginPage.goto();

  await loginPage.login(email, password);

  await expect(page).toHaveURL(/.*dashboard/);

  await page.context().storageState({ path: authFile });
});
