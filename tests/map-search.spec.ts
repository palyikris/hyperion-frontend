import { test, expect } from "./fixtures";
import { MapPage } from "./pages/MapPage";

const city = {
  type: "Feature",
  geometry: { type: "Point", coordinates: [19.6922302, 46.9075423] },
  properties: {
    name: "Kecskemét",
    state: "Alföld és Észak",
    country: "Magyarország",
    extent: [19.5068013, 47.0012539, 19.8517741, 46.7699196],
  },
};

test.beforeEach(async ({ page }) => {
  await page.route("**/api/map?*", (route) => route.fulfill({
    json: { items: [], video_detections: {}, total: 0 },
  }));
  await page.route("https://photon.komoot.io/api/**", (route) => {
    const query = new URL(route.request().url()).searchParams.get("q");
    return route.fulfill({ json: {
      type: "FeatureCollection",
      features: query?.startsWith("kecskem") ? [city] : [],
    } });
  });
});

for (const touch of [false, true]) {
  test.describe(touch ? "touch map search" : "desktop map search", () => {
    test.use({ viewport: touch ? { width: 390, height: 844 } : { width: 1280, height: 800 }, hasTouch: touch });

    test("keeps the input and icons aligned when suggestions open and clear", async ({ page }, testInfo) => {
      const map = new MapPage(page);
      await map.goto();
      const form = page.locator(".hyperion-map-search-form");
      const reset = page.getByRole("button", { name: "Clear search" });
      await expect(reset).toBeHidden();
      await expect(map.searchInput).toHaveCSS("height", "48px");
      const idleBox = await form.boundingBox();
      if (touch) {
        const menuBox = (await page.locator(".sidenav-mobile-toggle").boundingBox())!;
        expect(idleBox!.x).toBeGreaterThan(menuBox.x + menuBox.width);
      }
      const iconTop = await form.evaluate((element) => getComputedStyle(element, "::before").top);
      await page.screenshot({ path: testInfo.outputPath("search-idle.png") });

      const request = page.waitForRequest((request) => new URL(request.url()).searchParams.get("q") === "kecskem");
      await map.searchInput.pressSequentially("kecskem");
      const searchUrl = new URL((await request).url());
      expect(Number(searchUrl.searchParams.get("lat"))).toBeCloseTo(47.4979, 2);
      await expect(map.firstSearchResult).toContainText("Kecskemét");
      await expect(reset).toBeVisible();
      expect(await form.boundingBox()).toEqual(idleBox);
      expect(await form.evaluate((element) => getComputedStyle(element, "::before").top)).toBe(iconTop);

      const inputBox = (await map.searchInput.boundingBox())!;
      const resetBox = (await reset.boundingBox())!;
      const resultsBox = (await map.searchResultsList.boundingBox())!;
      expect(resultsBox.y).toBeGreaterThan(inputBox.y + inputBox.height);
      expect(Math.abs(resetBox.y + resetBox.height / 2 - inputBox.y - inputBox.height / 2)).toBeLessThan(1);
      expect(resultsBox.x).toBeGreaterThanOrEqual(0);
      expect(resultsBox.x + resultsBox.width).toBeLessThanOrEqual(page.viewportSize()!.width);
      await page.screenshot({ path: testInfo.outputPath("search-suggestions.png") });

      await reset.click();
      await expect(map.searchInput).toHaveValue("");
      await expect(map.searchResultsList).toBeHidden();
      await expect(reset).toBeHidden();
      expect(await form.boundingBox()).toEqual(idleBox);
    });
  });
}

for (const selection of ["click", "keyboard"]) {
  test(`selects a partial-name result by ${selection} and moves the map without another search`, async ({ page }) => {
    const map = new MapPage(page);
    await map.goto();
    const queries: string[] = [];
    page.on("request", (request) => {
      if (request.url().startsWith("https://photon.komoot.io/api/")) {
        queries.push(new URL(request.url()).searchParams.get("q")!);
      }
    });

    await map.searchInput.pressSequentially("kecskem");
    await expect(map.firstSearchResult).toContainText("Kecskemét");
    if (selection === "click") {
      await map.firstSearchResult.click();
    } else {
      await map.searchInput.press("ArrowDown");
      await map.searchInput.press("Enter");
    }
    await expect(map.searchResultsList).toBeHidden();
    await expect.poll(async () => page.evaluate(() => {
      const viewport = JSON.parse(localStorage.getItem("hyperion.map.viewport")!);
      return viewport.lat;
    })).toBeCloseTo((city.properties.extent[1] + city.properties.extent[3]) / 2, 2);
    expect(queries).toEqual(["kecskem"]);
  });
}

test("keeps the empty-result message below the input", async ({ page }) => {
  const map = new MapPage(page);
  await map.goto();
  await map.searchInput.pressSequentially("unknown-place");
  const empty = page.locator(".hyperion-map-search-notfound");
  await expect(empty).toHaveText("No results found.");
  const inputBox = (await map.searchInput.boundingBox())!;
  expect((await empty.boundingBox())!.y).toBeGreaterThan(inputBox.y + inputBox.height);
});
