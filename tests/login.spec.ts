import { test, expect } from "@playwright/test";
import { LoginPage } from "./pages/LoginPage";

test.describe("Authentication - Login", () => {
  test("should login with valid credentials", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.login("palyi.kristof@gmail.com", "Nem1234!");

    await expect(page).toHaveURL(/.*dashboard/);
  });

  test("should show error with invalid credentials", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.login("palyi.kristof@gmail.com", "Nem1234");
    const errorPWMessage = page.locator("#password-error");
    await expect(errorPWMessage).toBeVisible();

    await loginPage.login("palyi.kristofgmail.com", "Nem1234");
    const errorUnameMessage = page.locator("#email-error");
    await expect(errorUnameMessage).toBeVisible();
  });
});
