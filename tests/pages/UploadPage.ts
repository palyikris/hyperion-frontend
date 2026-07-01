import { type Locator, type Page } from "@playwright/test";
import { BasePage } from "./BasePage.ts";

export class UploadPage extends BasePage {
  private readonly dropZones: Locator;
  private readonly imageDropZone: Locator;
  private readonly videoDropZone: Locator;
  private readonly selectedImagesSection: Locator;
  private readonly selectedVideoSection: Locator;
  private readonly imageUploadButton: Locator;
  private readonly videoUploadButton: Locator;
  private readonly galleryImageCards: Locator;
  private readonly galleryVideoCards: Locator;
  // private readonly statusBadges: Locator;

  constructor(page: Page) {
    super(page);
    this.dropZones = page.locator('input[type="file"]');
    this.imageDropZone = this.dropZones.nth(0);
    this.videoDropZone = this.dropZones.nth(1);
    this.selectedImagesSection = page.locator("#selected-images-section");
    this.selectedVideoSection = page.locator("#selected-video-section");
    this.imageUploadButton = page
      .locator("#selected-images-section")
      .getByRole("button", { name: /upload/i });
    this.videoUploadButton = page
      .locator("#selected-video-section")
      .getByRole("button", { name: /upload/i });
    this.galleryImageCards = page.locator("#image-items > div");
    this.galleryVideoCards = page.locator("#video-items > div");
    // this.statusBadges = page.locator(".gallery-card-status-badge");
  }

  async goto() {
    await this.navigate("/upload");
  }

  async uploadImageFiles(filePaths: string[]) {
    for (const filePath of filePaths) {
      await this.imageDropZone.setInputFiles(filePath);
    }

    await this.page.waitForTimeout(1000);
    await this.selectedImagesSection.waitFor({ state: "visible" });

    await this.imageUploadButton.click();
    await this.waitForResponseWithStatus("/api/upload/files", 201);
  }

  async uploadVideoFile(filePath: string) {
    await this.videoDropZone.setInputFiles(filePath);
    await this.page.waitForTimeout(1000);
    await this.selectedVideoSection.waitFor({ state: "visible" });

    await this.videoUploadButton.click();
    await this.waitForResponseWithStatus("api/upload/video/complete", 200);
  }

  async waitForResponseWithStatus(includeText: string, statusCode: number) {
    await super.waitForResponse(
      (response) =>
        response.url().includes(includeText) &&
        response.status() === statusCode,
    );
  }

  async getGalleryImageCardCount() {
    return await this.galleryImageCards.count();
  }

  async getGalleryVideoCardCount() {
    return await this.galleryVideoCards.count();
  }

  async getGalleryImageCardTitles() {
    const titles = [];
    const count = await this.galleryImageCards.count();
    for (let i = 0; i < count; i++) {
      const title = await this.galleryImageCards
        .nth(i)
        .getByRole("heading")
        .textContent();
      if (title) titles.push(title);
    }
    return titles;
  }

  async getGalleryVideoCardTitles() {
    const titles = [];
    const count = await this.galleryVideoCards.count();
    for (let i = 0; i < count; i++) {
      const title = await this.galleryVideoCards
        .nth(i)
        .getByRole("heading")
        .textContent();
      if (title) titles.push(title);
    }
    return titles;
  }

  async waitForRecentsResponse() {
    await this.waitForResponseWithStatus("/api/upload/recents", 200);
  }

  async waitForStatusBadgesToBe(status: string) {
    const targetStatus = status.toLowerCase();

    await this.page.waitForFunction(
      ({ selector, target }) => {
        const badges = document.querySelectorAll(selector);
        if (badges.length === 0) return false;

        return Array.from(badges).every(
          (badge) => badge.textContent?.toLowerCase().trim() === target,
        );
      },
      { selector: ".gallery-card-status-badge", target: targetStatus },
      { timeout: 120000 },
    );
  }

  async waitForAStatusBadgeToBe(status: string) {
    const targetStatus = status.toLowerCase();

    await this.page.waitForFunction(
      ({ selector, target }) => {
        const badges = document.querySelectorAll(selector);
        if (badges.length === 0) return false;

        return Array.from(badges).some(
          (badge) => badge.textContent?.toLowerCase().trim() === target,
        );
      },
      { selector: ".gallery-card-status-badge", target: targetStatus },
      { timeout: 120000 },
    );
  }
}
