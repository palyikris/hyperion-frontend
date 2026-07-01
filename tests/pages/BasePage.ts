import { type Page } from "@playwright/test";

export abstract class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  protected async navigate(path: string) {
    await this.page.goto(path);
  }

  async waitForTimeout(ms: number) {
    await this.page.waitForTimeout(ms);
  }

  async waitForResponse(
    predicate: Parameters<Page["waitForResponse"]>[0],
    options?: Parameters<Page["waitForResponse"]>[1],
  ) {
    await this.page.waitForResponse(predicate, options);
  }
}