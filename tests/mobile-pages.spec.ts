import { test, expect } from './fixtures';
import { mockPopulatedScreens, revealPageContent, expectContainedControls } from './responsive-support';

test.use({ hasTouch: true, isMobile: true });

for (const language of ['en', 'hu']) {
  for (const width of [320, 390, 600]) {
    test(`mobile page review at ${width}px in ${language}`, async ({ page }, testInfo) => {
      test.setTimeout(60_000);
      await page.setViewportSize({ width, height: 700 });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await mockPopulatedScreens(page, language);

      await test.step('Lab tools and location fields fit without long button stacks', async () => {
        await page.goto('/lab/responsive-0');
        const canvas = page.locator('.konvajs-content canvas').first();
        await expect(canvas).toBeVisible();
        const add = await page.locator('#add-detection-btn').boundingBox();
        const clean = await page.locator('#mark-all-clean-btn').boundingBox();
        expect(Math.abs(add!.y - clean!.y)).toBeLessThan(1);
        expect((await page.locator('.lab-minimap').boundingBox())!.height).toBeLessThan(250);
        const lat = await page.locator('#latitude').boundingBox();
        const lng = await page.locator('#longitude').boundingBox();
        expect(Math.abs(lat!.y - lng!.y)).toBeLessThan(1);
        await expectContainedControls(page);
        await page.screenshot({ path: testInfo.outputPath('lab.png'), fullPage: true });
        const bounds = (await canvas.boundingBox())!;
        await canvas.tap({ position: { x: bounds.width * 0.25, y: bounds.height * 0.25 } });
        await expect(page.locator('#detection-details-label')).toBeVisible();
        await expect(page.locator('#detection-details-bbox-x')).toBeHidden();
        await page.locator('.lab-details summary').tap();
        await expect(page.locator('#detection-details-bbox-x')).toBeVisible();
        await expectContainedControls(page);
        await page.screenshot({ path: testInfo.outputPath('lab-selected.png'), fullPage: true });
      });

      await test.step('Stats keeps its plot area and summaries readable', async () => {
        await page.goto('/stats');
        await expect(page.locator('#chart-temporal')).toBeVisible();
        await revealPageContent(page);
        await expectContainedControls(page);
        const curve = (await page.locator('#chart-temporal .recharts-area-curve').boundingBox())!;
        expect(curve.width).toBeGreaterThan(width * 0.5);
        await page.screenshot({ path: testInfo.outputPath('stats.png'), fullPage: true });
      });

      await test.step('Map keeps its close control reachable while filters scroll', async () => {
        await page.goto('/map');
        await page.locator('#show-filters-btn').tap();
        const panel = page.locator('#map-filters-panel');
        await expect(panel).toHaveCSS('opacity', '1');
        const bounds = (await panel.boundingBox())!;
        expect(bounds.height).toBeLessThanOrEqual(700 * 0.65);
        expect(bounds.y + bounds.height).toBeLessThanOrEqual(701);
        await expectContainedControls(page);
        await page.screenshot({ path: testInfo.outputPath('map-filters.png') });
        await page.locator('.map-filter-body').evaluate(element => { element.scrollTop = element.scrollHeight; });
        const close = panel.getByRole('button', { name: /Close filters|Szűrők bezárása/ });
        await expect(close).toBeInViewport();
        await close.tap();
        await expect(panel).toHaveCount(0);
        await expect(page.locator('#show-filters-btn')).toBeVisible();
      });
    });
  }
}
