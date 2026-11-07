import { test, expect } from "@playwright/test";
import { LoginPage } from "./pages/LoginPage";
import { getTestCredentials } from "./testAccount";

test.describe("Authentication - Login", () => {
  test("should login with valid credentials", async ({ page }) => {
    const { email, password } = getTestCredentials();
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.login(email, password);

    await expect(page).toHaveURL(/.*dashboard/);
  });

  test("should validate malformed login fields", async ({ page }) => {
    const loginRequests: string[] = [];
    page.on("request", (request) => {
      if (request.url().endsWith("/api/auth/login")) loginRequests.push(request.url());
    });
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.login("test@example.com", "short");
    const errorPWMessage = page.locator("#password-error");
    await expect(errorPWMessage).toBeVisible();

    await loginPage.login("invalid-email", "short");
    const errorUnameMessage = page.locator("#email-error");
    await expect(errorUnameMessage).toBeVisible();
    expect(loginRequests).toHaveLength(0);
  });
});
