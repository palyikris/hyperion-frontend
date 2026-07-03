import { type Locator, type Page } from "@playwright/test";
import { BasePage } from "./BasePage.ts";


export class LabPage extends BasePage {
  private readonly confidenceSlider: Locator;
  private readonly detectionVisibilityTogglers: Locator;
  private readonly focusDetectionButtons: Locator;
  private readonly showAllDetectionsButton: Locator;
  private readonly showNoneDetectionsButton: Locator;
  private readonly addDetectionBtn: Locator;
  private readonly saveDetectionsBtn: Locator;
  private readonly resetDetectionsBtn: Locator;
  private readonly deleteSelectedDetectionBtn: Locator;
  private readonly detectionDetailsLabelSelect: Locator;
  private readonly detectionDetailsBboxX: Locator;
  private readonly detectionDetailsBboxY: Locator;
  private readonly detectionDetailsBboxW: Locator;
  private readonly detectionDetailsBboxH: Locator;
  private readonly minimapLatitudeInput: Locator;
  private readonly minimapLongitudeInput: Locator;
  private readonly minimapAltitudeInput: Locator;
  private readonly saveMinimapLocationBtn: Locator;
  private readonly resetMinimapLocationBtn: Locator;

  constructor(page: Page) {
    super(page);
    this.confidenceSlider = page.locator("#confidence-slider");
    this.detectionVisibilityTogglers = page.locator(
      ".detection-visibility-toggler",
    );
    this.focusDetectionButtons = page.locator(".focus-detection-button");
    this.showAllDetectionsButton = page.locator("#show-all-detections-button");
    this.showNoneDetectionsButton = page.locator(
      "#show-none-detections-button",
    );
    this.addDetectionBtn = page.locator("#add-detection-btn");
    this.saveDetectionsBtn = page.locator("#save-detections-btn");
    this.resetDetectionsBtn = page.locator("#reset-detections-btn");
    this.deleteSelectedDetectionBtn = page.locator(
      "#delete-selected-detection-btn",
    );
    this.detectionDetailsLabelSelect = page.locator("#detection-details-label");
    this.detectionDetailsBboxX = page.locator("#detection-details-bbox-x");
    this.detectionDetailsBboxY = page.locator("#detection-details-bbox-y");
    this.detectionDetailsBboxW = page.locator("#detection-details-bbox-w");
    this.detectionDetailsBboxH = page.locator("#detection-details-bbox-h");
    this.minimapAltitudeInput = page.locator("#altitude");
    this.minimapLatitudeInput = page.locator("#latitude");
    this.minimapLongitudeInput = page.locator("#longitude");
    this.saveMinimapLocationBtn = page.locator("#save-minimap-location-btn");
    this.resetMinimapLocationBtn = page.locator("#reset-minimap-location-btn");
  }

  async goto(mediaId: string) {
    await this.navigate(`/lab/${mediaId}`);
  }

  async setConfidenceSlider(value: number) {
    await this.confidenceSlider.fill(value.toString());
  }

  async selectDetectionLabel(label: string) {
    await this.detectionDetailsLabelSelect.selectOption({ label });
  }

  async setDetectionBbox(x: number, y: number, w: number, h: number) {
    await this.detectionDetailsBboxX.fill(x.toString());
    await this.detectionDetailsBboxY.fill(y.toString());
    await this.detectionDetailsBboxW.fill(w.toString());
    await this.detectionDetailsBboxH.fill(h.toString());
  }

  async setMinimapLocation(
    latitude: number,
    longitude: number,
    altitude: number,
  ) {
    await this.minimapLatitudeInput.fill(latitude.toString());
    await this.minimapLongitudeInput.fill(longitude.toString());
    await this.minimapAltitudeInput.fill(altitude.toString());
  }

  async saveDetections() {
    await this.saveDetectionsBtn.click();
  }

  async resetDetections() {
    await this.resetDetectionsBtn.click();
  }

  async deleteSelectedDetection() {
    await this.deleteSelectedDetectionBtn.click();
  }

  async saveMinimapLocation() {
    await this.saveMinimapLocationBtn.click();
  }

  async resetMinimapLocation() {
    await this.resetMinimapLocationBtn.click();
  }

  async showAllDetections() {
    await this.showAllDetectionsButton.click();
  }

  async showNoDetections() {
    await this.showNoneDetectionsButton.click();
  }

  async addDetection() {
    await this.addDetectionBtn.click();
  }

  async toggleDetectionVisibility(index: number) {
    await this.detectionVisibilityTogglers.nth(index).click();
  }

  async focusDetection(index: number) {
    await this.focusDetectionButtons.nth(index).click();
  }

  async waitForLabResponse() {
    await this.waitForResponse(
      (response) =>
        response.url().includes("/api/lab/image") && response.status() === 200,
    );
  }

  async getMinimapLocation() {
    const latitude = await this.minimapLatitudeInput.inputValue();
    const longitude = await this.minimapLongitudeInput.inputValue();
    const altitude = await this.minimapAltitudeInput.inputValue();
    return {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      altitude: parseFloat(altitude),
    };
  }
}