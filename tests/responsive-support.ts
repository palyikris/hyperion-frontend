import type { Page } from "@playwright/test";
import { expect, galleryItem, testUser, timestamp } from "./fixtures";

export const longName = "Budapest_riverside_cleanup_report_with_extended_metadata_2026.jpg";
export const images = Array.from({ length: 24 }, (_, index) => ({
  ...galleryItem(index === 0 ? longName : `cleanup-${index}.jpg`, `responsive-${index}`),
  address: "Budapest, District XIII, Margaret Island northern riverside observation point",
  assigned_worker: "Helios-Observation-Worker-01",
  technical_metadata: {
    make: "Professional Camera", model: "Field Survey Edition", software: "Hyperion-Mobile-Image-Processor-2026",
    date_taken: timestamp, gps: { lat: 47.497912345, lng: 19.040212345, altitude: 100, address: "Budapest, Margaret Island" },
  },
}));

export async function mockPopulatedScreens(page: Page, language: string) {
  await page.route("**/src/api/**", route => route.continue());
  await page.route("https://huggingface.co/**", route => route.fulfill({ path: "tests/fixtures/test1.jpg", contentType: "image/jpeg" }));
  await page.route("**/api/auth/me", route => route.fulfill({ json: {
    ...testUser, language, email: "field.survey.operator.with.a.long.email@example.test",
  } }));
  await page.route("**/api/dashboard/ai-workers", route => route.fulfill({ json: {
    total_active_fleet: 12, cluster_status: "operational", queue_depth: 42, last_updated: timestamp,
    nodes: [{ name: "Helios-Observation-Worker-01", status: "busy", tasks_processed_today: 1024, current_task_status: "processing", current_task_id: longName }],
  } }));
  const responses: Record<string, unknown> = {
    "fun-facts": { facts: Array.from({ length: 4 }, (_, index) => ({ title: `Field observation ${index + 1}`, fact: "Detailed environmental observations help teams identify and clean up waste across the entire region.", icon: "compass" })) },
    "trash-composition": ["Plastic", "Metal", "Glass", "Paper", "Organic", "Other"].map((label, index) => ({ label, count: 60 - index * 5, percentage: 100 / 6 })),
    "temporal-trends": Array.from({ length: 14 }, (_, index) => ({ date: `2026-10-${String(index + 1).padStart(2, "0")}`, count: index * 12 + 5 })),
    "ai-fleet-efficiency": { workers: ["Helios-Observation-Worker-01", "Apollo-02", "Hermes-03"].map(name => ({ name, success_count: 1240, failure_count: 12, tasks_processed_today: 230, reliability_score: 0.99 })), fleet_reliability_score: 0.99, total_successes: 3720, total_failures: 36 },
    "mean-time-to-process": { overall_avg_seconds: 124, by_worker: ["Helios-Observation-Worker-01", "Apollo-02", "Hermes-03"].map(worker_name => ({ worker_name, avg_processing_seconds: 92, task_count: 180 })) },
    "hotspot-density": { hotspot_count: 124, high_confidence_media_count: 2540 },
  };
  await page.route("**/api/stats/**", route => route.fulfill({ json: responses[new URL(route.request().url()).pathname.split("/").pop()!] ?? {} }));
  await page.route("**/api/map?*", route => route.fulfill({ json: {
    items: [{ id: "responsive-0", filename: longName, status: "READY", lat: 47.4979, lng: 19.0402, has_trash: true, confidence: 0.95, detections: [], image_url: "/avatar.png" }], video_detections: {}, total: 1,
  } }));
  await page.route("**/api/lab/image/responsive-0", route => route.fulfill({ json: {
    ...images[0], lat: 47.4979, lng: 19.0402, altitude: 90, has_trash: true,
    detections: [{ id: "plastic", label: "Plastic", confidence: 0.95, bbox: { x: 0.1, y: 0.1, w: 0.4, h: 0.4 }, area_sqm: 1.5 }],
  } }));
}

export async function expectContainedControls(page: Page) {
  // Check actual control bounds and label overflow, including content below the fold.
  // Leaflet tiles/canvases and the intentionally collapsed navigation are excluded.
  const problems = await page.evaluate(() => {
    const problems: string[] = [];
    const width = document.documentElement.clientWidth;
    if (document.documentElement.scrollWidth > width + 1) problems.push(`page scrollWidth ${document.documentElement.scrollWidth} > ${width}`);
    const elements = document.querySelectorAll<HTMLElement>("button,input,select,h1,h2,h3,p,label");
    for (const element of elements) {
      if (element.closest("#main-navigation,.sr-only,.recharts-wrapper,[aria-hidden='true']")) continue;
      if (element.closest(".leaflet-pane") && !element.closest(".leaflet-popup-pane")) continue;
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      if (!rect.width || !rect.height || style.visibility === "hidden" || style.display === "none") continue;
      const name = `${element.tagName}#${element.id} ${(element.textContent || "").trim().slice(0, 65)}`;
      if (rect.x < -1 || rect.right > width + 1) problems.push(`${name}: bounds ${Math.round(rect.x)}..${Math.round(rect.right)}`);
      if (element.tagName !== "INPUT" && element.tagName !== "SELECT" && style.textOverflow !== "ellipsis" && element.scrollWidth > element.clientWidth + 2) problems.push(`${name}: clipped text ${element.scrollWidth} > ${element.clientWidth}`);
    }
    // Crowding is checked within each action group instead of relying on page overflow.
    for (const group of document.querySelectorAll(".action-grid,#filters-view-mode-section")) {
      const buttons = Array.from(group.querySelectorAll("button"));
      for (let i = 0; i < buttons.length; i++) {
        const a = buttons[i].getBoundingClientRect();
        for (let j = i + 1; j < buttons.length; j++) {
          const b = buttons[j].getBoundingClientRect();
          if (a.width && b.width && Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1) problems.push("overlapping action buttons");
        }
      }
    }
    return problems;
  });
  expect(problems).toEqual([]);
}

export async function revealPageContent(page: Page) {
  // Visit the actual scroll positions so lazy charts and below-fold content render.
  await page.evaluate(async () => {
    const step = Math.max(100, window.innerHeight * 0.65);
    for (let top = 0; top < document.documentElement.scrollHeight; top += step) {
      window.scrollTo(0, top);
      await new Promise(resolve => setTimeout(resolve, 35));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(700);
}
