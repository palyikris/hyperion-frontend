import { test, expect, testUser, testPassword } from "./fixtures";
import { LoginPage } from "./pages/LoginPage";

test.use({ authenticated: false });

test("logs in with valid credentials", async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(testUser.email, testPassword);
  await expect(page).toHaveURL("/dashboard");
  await expect(page.getByText("System overview and key metrics")).toBeVisible();
});

test("shows validation errors for an invalid email and short password", async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();

  await loginPage.login(testUser.email, "short");
  await expect(page.locator("#password-error")).toBeVisible();

  await loginPage.login("invalid-email", testPassword);
  await expect(page.locator("#email-error")).toBeVisible();
  await expect(page).toHaveURL("/login");
});
