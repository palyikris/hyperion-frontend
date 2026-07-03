import { type Locator, type Page } from "@playwright/test";
import { BasePage } from "./BasePage.ts";

export class VaultPage extends BasePage {
  // Filters
  private readonly searchInput: Locator;
  private readonly statusSelect: Locator;
  private readonly sortSelect: Locator;
  private readonly pageSizeSelect: Locator;
  private readonly applyFiltersButton: Locator;
  private readonly resetFiltersButton: Locator;

  // Gallery
  private readonly galleryImageCards: Locator;
  private readonly galleryVideoCards: Locator;

  // Actions
  private readonly deleteAllButton: Locator;
  private readonly confirmDeleteButton: Locator;

  constructor(page: Page) {
    super(page);
    this.searchInput = page.locator("#vault-search");
    this.statusSelect = page.locator("#vault-status");
    this.sortSelect = page.locator("#vault-order-by");
    this.pageSizeSelect = page.locator("#vault-page-size");
    this.applyFiltersButton = page.locator("#apply-filters-button");
    this.resetFiltersButton = page.locator("#reset-filters-button");

    this.galleryImageCards = page.locator("#image-items > div");
    this.galleryVideoCards = page.locator("#video-items > div");

    this.deleteAllButton = page.locator("#delete-all-button");
    this.confirmDeleteButton = page.locator("#confirm-button");
  }

  async goto() {
    await this.navigate("/vault");
  }

  async deleteAllVaultItems() {
    await this.deleteAllButton.click();
    await this.confirmDeleteButton.click();
  }

  async goToPageNumber(pageNumber: number) {
    await this.page
      .getByRole("button", { name: pageNumber.toString(), exact: true })
      .click();
  }

  async resetFilters() {
    await this.resetFiltersButton.click();
  }

  async isEmptyStateVisible() {
    return await this.page.locator("#vault-empty-state").isVisible();
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

  async getGalleryImageSources() {
    const sources = [];
    const count = await this.galleryImageCards.count();
    for (let i = 0; i < count; i++) {
      const src = await this.galleryImageCards
        .nth(i)
        .locator("img")
        .getAttribute("src");
      if (src) sources.push(src);
    }
    return sources;
  }

  async getGalleryVideoSources() {
    const sources = [];
    const count = await this.galleryVideoCards.count();
    for (let i = 0; i < count; i++) {
      const src = await this.galleryVideoCards
        .nth(i)
        .locator("video")
        .getAttribute("src");
      if (src) sources.push(src);
    }
    return sources;
  }

  async waitForGalleryResponse() {
    await this.waitForResponse(
      (response) =>
        response.url().includes("/api/vault") && response.status() === 200,
    );
  }

  async waitForDeleteAllResponse() {
    await this.waitForResponse(
      (response) =>
        response.url().includes("/api/vault/all") &&
        response.status() === 200 &&
        response.request().method() === "DELETE",
    );
  }

  async deleteAll() {
    await this.deleteAllButton.click();
    await this.page.waitForSelector("#confirm-button", { state: "visible" });
    await this.confirmDeleteButton.click();
    await this.waitForDeleteAllResponse();
  }

  async searchForItem(searchTerm: string) {
    await this.searchInput.fill(searchTerm);
    await this.applyFiltersButton.click();
    await this.waitForGalleryResponse();
  }

  async selectStatusFilter(status: string) {
    await this.statusSelect.selectOption(status);
    await this.applyFiltersButton.click();
    await this.waitForGalleryResponse();
  }

  async selectSortOption(sortOption: string) {
    await this.sortSelect.selectOption(sortOption);
    await this.applyFiltersButton.click();
    await this.waitForGalleryResponse();
  }

  async selectPageSize(pageSize: string) {
    await this.pageSizeSelect.selectOption(pageSize);
    await this.applyFiltersButton.click();
    await this.waitForGalleryResponse();
  }

  async getFirstImageCardId() {
    const firstImageCard = this.galleryImageCards.first();
    const id = await firstImageCard.getAttribute("data-id");
    if (!id) throw new Error("No ID found for the first image card.");
    return id;
  }

  async getNthImageCardId(n: number) {
    const nthImageCard = this.galleryImageCards.nth(n);
    const id = await nthImageCard.getAttribute("data-id");
    if (!id) throw new Error(`No ID found for the ${n}th image card.`);
    return id;
  }

  async getNthVideoCardId(n: number) {
    const nthVideoCard = this.galleryVideoCards.nth(n);
    const id = await nthVideoCard.getAttribute("data-id");
    if (!id) throw new Error(`No ID found for the ${n}th video card.`);
    return id;
  }
}
