import { type Page, type Locator } from "@playwright/test";

export class VaultPage {
  private readonly page: Page;

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
    this.page = page;
    this.searchInput = page.locator('#search-input');
    this.statusSelect = page.locator('#vault-status');
    this.sortSelect = page.locator('#vault-order-by');
    this.pageSizeSelect = page.locator('#vault-page-size');
    this.applyFiltersButton = page.locator('#apply-filters-button');
    this.resetFiltersButton = page.locator('#reset-filters-button');

    this.galleryImageCards = page.locator("#image-items > div");
    this.galleryVideoCards = page.locator("#video-items > div");

    this.deleteAllButton = page.locator("#delete-all-button");
    this.confirmDeleteButton = page.locator("#confirm-button");
  }

  async goto() {
    await this.page.goto("/vault");
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
      const title = await this.galleryImageCards.nth(i).getByRole("heading").textContent();
      if (title) titles.push(title);
    }
    return titles;
  }

  async getGalleryVideoCardTitles() {
    const titles = [];
    const count = await this.galleryVideoCards.count();
    for (let i = 0; i < count; i++) {
      const title = await this.galleryVideoCards.nth(i).getByRole("heading").textContent();
      if (title) titles.push(title);
    }
    return titles;
  }

  async getGalleryImageSources() {
    const sources = [];
    const count = await this.galleryImageCards.count();
    for (let i = 0; i < count; i++) {
      const src = await this.galleryImageCards.nth(i).locator("img").getAttribute("src");
      if (src) sources.push(src);
    }
    return sources;
  }

  async getGalleryVideoSources() {
    const sources = [];
    const count = await this.galleryVideoCards.count();
    for (let i = 0; i < count; i++) {
      const src = await this.galleryVideoCards.nth(i).locator("video").getAttribute("src");
      if (src) sources.push(src);
    }
    return sources;
  }

  async waitForGalleryResponse() {
    await this.page.waitForResponse((response) =>
      response.url().includes("/api/vault") && response.status() === 200,
    );
  }

  async waitForTimeout(ms: number) {
    await this.page.waitForTimeout(ms);
  }

  async waitForDeleteAllResponse() {
    await this.page.waitForResponse((response) =>
      response.url().includes("/api/vault/all") && response.status() === 200 && response.request().method() === "DELETE",
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
}
