import { type Locator, type Page } from "@playwright/test";

export class MapPage {
  readonly page: Page;
  readonly mapContainer: Locator;
  readonly filterPanel: Locator;
  readonly searchInput: Locator;
  readonly toggleFiltersButton: Locator;
  readonly viewModeSection: Locator;
  readonly searchResultsList: Locator;
  readonly firstSearchResult: Locator;
  readonly markerSidebar: Locator;
  readonly markerDetails: Locator;
  readonly markerLogs: Locator;
  readonly openLabViewButton: Locator;
  readonly mapMarkerPane: Locator;
  readonly heatmapLayer: Locator;
  readonly mapOverlayPane: Locator;
  readonly markers: Locator;
  readonly clearStatusFilterButton: Locator;
  readonly confidenceInput: Locator;
  readonly popupContent: Locator;

  constructor(page: Page) {
    this.page = page;
    this.mapContainer = page.locator(".leaflet-container");
    this.filterPanel = page.locator("#map-filters-panel");
    this.searchInput = page.locator(".hyperion-map-search-input");
    this.toggleFiltersButton = page.locator("#show-filters-btn");
    this.viewModeSection = page.locator("#filters-view-mode-section");
    this.searchResultsList = page.locator(".hyperion-map-search-results");
    this.firstSearchResult = this.searchResultsList
      .locator(".hyperion-map-search-item")
      .first();
    this.markerSidebar = page.locator("#marker-sidebar");
    this.markerDetails = page.locator("#marker-details");
    this.markerLogs = page.locator("#marker-logs");
    this.openLabViewButton = page.locator("#open-lab-view-btn");
    this.mapMarkerPane = page.locator(".leaflet-marker-pane").first();
    this.heatmapLayer = page.locator(".leaflet-heatmap-layer").first();
    this.mapOverlayPane = page.locator(".leaflet-overlay-pane").first();
    this.markers = this.mapMarkerPane.locator(".leaflet-marker-icon");
    this.clearStatusFilterButton = page.locator("#clear-status-filter-btn");
    this.confidenceInput = page.locator("#confidence-filter-input");
    this.popupContent = page.locator(".leaflet-popup-content");
  }

  async goto() {
    await this.page.goto("/map");
  }

  async openFilters() {
    await this.toggleFiltersButton.click();
  }

  async setViewMode(mode: "Markers" | "Heatmap" | "Analysis Grid") {
    const button = this.viewModeSection.locator(`button:has-text("${mode}")`);
    await button.click();
  }

  async isMarkersLayerVisible() {
    return await this.mapMarkerPane.isVisible();
  }

  async getMarkerCount() {
    return await this.markers.count();
  }

  async isHeatmapLayerVisible() {
    return await this.heatmapLayer.isVisible();
  }

  async isGridOverlayVisible() {
    return await this.mapOverlayPane.isVisible();
  }

  async searchLocation(query: string) {
    await this.searchInput.fill(query);
    await this.page.keyboard.press("Enter");
  }

  async clickMapMarker() {
    await this.markers.first().click();
  }

  async setConfidenceFilter(value: number) {
    await this.confidenceInput.fill(value.toString());
    await this.page.keyboard.press("Enter");
  }

  async clearStatusFilter() {
    await this.clearStatusFilterButton.click();
  }

  async waitForMapResponse() {
    await this.page.waitForResponse(
      (response) =>
        response.url().includes("/api/map") && response.status() === 200,
    );
  }

  async waitForTimeout(ms: number) {
    await this.page.waitForTimeout(ms);
  }
}
