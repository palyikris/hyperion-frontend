import { type Page, type Locator } from "@playwright/test";

export class UploadPage {
  private readonly page: Page;
  private readonly dropZones: Locator;


  constructor(page: Page) {
    this.page = page;
    this.dropZones = page.locator('input[type="file"]');
  }

  async goto() {
    await this.page.goto("/upload");
  }

  
  async uploadImageFile(filePath: string) {
    await this.dropZones.first().setInputFiles(filePath);
  }
}
