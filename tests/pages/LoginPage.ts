import { type Locator, type Page } from "@playwright/test";
import { BasePage } from "./BasePage.ts";

export class LoginPage extends BasePage {
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.locator("#email");
    this.passwordInput = page.locator("#password");
    this.loginButton = page.locator('button[type="submit"]');
  }

  async goto() {
    await this.navigate("/login");
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}
