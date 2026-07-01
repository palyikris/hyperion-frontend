import { type Locator, type Page } from "@playwright/test";
import { BasePage } from "./BasePage.ts";

export class SignupPage extends BasePage {
  private readonly fullNameInput: Locator;
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly submitButton: Locator;

  constructor(page: Page) {
    super(page);
    this.fullNameInput = page.locator("#signup-full-name");
    this.emailInput = page.locator("#signup-email");
    this.passwordInput = page.locator("#signup-password");
    this.submitButton = page.locator('button[type="submit"]');
  }

  async goto() {
    await this.navigate("/signup");
  }

  async signup(name: string, email: string, password: string) {
    await this.fullNameInput.fill(name);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
