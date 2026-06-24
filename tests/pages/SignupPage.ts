import { type Page, type Locator } from "@playwright/test";

export class SignupPage {
  private readonly page: Page;
  private readonly fullNameInput: Locator;
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.fullNameInput = page.locator("#signup-full-name");
    this.emailInput = page.locator("#signup-email");
    this.passwordInput = page.locator("#signup-password");
    this.submitButton = page.locator('button[type="submit"]');
  }

  async goto() {
    await this.page.goto("/signup");
  }

  async signup(name: string, email: string, password: string) {
    await this.fullNameInput.fill(name);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
