// import { test, expect } from "@playwright/test";
// import { SignupPage } from "./pages/SignupPage";
// import { LoginPage } from "./pages/LoginPage";

// test.describe("Authentication - Signup", () => {
//   test("should register a new user successfully", async ({ page }) => {
//     const signupPage = new SignupPage(page);
//     const loginPage = new LoginPage(page);
//     await signupPage.goto();

//     const uniqueEmail = `test_${Date.now()}@hyperion.com`;

//     await signupPage.signup(
//       "Test User",
//       uniqueEmail, 
//       "SecurePassword123!",
//     );
//     await expect(page).toHaveURL(/.*login/);

//     await loginPage.login(uniqueEmail, "SecurePassword123!");
//     await expect(page).toHaveURL(/.*dashboard/);
//   });
// });
