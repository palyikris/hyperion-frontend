import { test, expect, testPassword } from "./fixtures";
import { SignupPage } from "./pages/SignupPage";
import { LoginPage } from "./pages/LoginPage";

test.use({ authenticated: false });

test("registers a new user who can then sign in", async ({ page }) => {
  const signupPage = new SignupPage(page);
  const loginPage = new LoginPage(page);
  const email = "new-user@example.test";

  await signupPage.goto();
  await signupPage.signup("New User", email, testPassword);
  await expect(page).toHaveURL("/login");

  await loginPage.login(email, testPassword);
  await expect(page).toHaveURL("/dashboard");
  await expect(page.getByText("System overview and key metrics")).toBeVisible();
});
