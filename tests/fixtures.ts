import { test as base, type Request } from "@playwright/test";
import type { GalleryItem } from "../src/types/upload";
import type { VideoDetectionResponse } from "../src/types/lab";

export { expect } from "@playwright/test";

export const testUser = {
  id: "test-user",
  email: "tester@example.test",
  full_name: "Test User",
  language: "en",
};
export const testPassword = "LocalTestPass123!";
export const timestamp = "2026-01-01T00:00:00Z";
export const imageNames = ["test1.jpg", "test2.jpg", "test3.jpg", "test4.jpg"];

export function galleryItem(filename: string, id = filename) {
  return {
    id,
    uploader_id: testUser.id,
    status: "READY",
    hf_path: "/avatar.png",
    initial_metadata: { filename, size: 1024 },
    created_at: timestamp,
    updated_at: timestamp,
  } satisfies GalleryItem;
}

function readForm(request: Request) {
  return new Response(new Uint8Array(request.postDataBuffer()!), {
    headers: { "content-type": request.headers()["content-type"] },
  }).formData();
}

export const test = base.extend<{
  authenticated: boolean;
  initialGallery: { images: GalleryItem[] };
}>({
  authenticated: [true, { option: true }],
  initialGallery: [{ images: [] }, { option: true }],

  context: async ({ context, baseURL, authenticated, initialGallery }, provide) => {
    if (!baseURL) throw new Error("Playwright requires a local baseURL.");
    const { hostname, origin } = new URL(baseURL);
    if (hostname !== "127.0.0.1") {
      throw new Error("Playwright must run against the local build.");
    }
    let signedIn = authenticated;
    let account = { ...testUser, password: testPassword };
    const images = [...initialGallery.images];
    const detections: VideoDetectionResponse[] = [];
    let videoFilename: string | undefined;
    let uploadedChunks = 0;

    await context.route((url) => url.origin !== origin, (route) => route.abort());
    await context.routeWebSocket("**/api/upload/ws/updates", () => {
      // Leave the socket open locally without connecting to a server.
    });

    await context.route("**/api/**", async (route) => {
      const request = route.request();
      const { pathname, searchParams } = new URL(request.url());
      const method = request.method();

      switch (`${method} ${pathname}`) {
        case "POST /api/auth/signup": {
          const { email, full_name, password } = request.postDataJSON();
          account = { ...testUser, email, full_name, password };
          return route.fulfill({ status: 201, json: { message: "User created" } });
        }
        case "POST /api/auth/login": {
          const { email, password } = request.postDataJSON();
          if (email !== account.email || password !== account.password) {
            return route.fulfill({ status: 401, json: { detail: "Invalid credentials" } });
          }

          signedIn = true;
          const user = { ...testUser, email: account.email, full_name: account.full_name };
          return route.fulfill({ json: { message: "Logged in", user } });
        }
        case "GET /api/auth/me":
          return signedIn
            ? route.fulfill({ json: { ...testUser, email: account.email, full_name: account.full_name } })
            : route.fulfill({ status: 401, json: { detail: "Unauthorized" } });

        case "GET /api/dashboard/system-health":
          return route.fulfill({ json: { status: "operational", environment: "test" } });
        case "GET /api/dashboard/user-experience":
          return route.fulfill({ json: { active_now: 1, active_trend: [], avg_response_time: 0, daily_activity: [], last_updated: timestamp } });
        case "GET /api/dashboard/ai-workers":
          return route.fulfill({ json: { total_active_fleet: 0, cluster_status: "idle", nodes: [], queue_depth: 0, last_updated: timestamp } });

        case "POST /api/upload/files": {
          const form = await readForm(request);
          const uploaded = form.getAll("files").flatMap((file) =>
            typeof file === "string" ? [] : [galleryItem(file.name)],
          );
          images.push(...uploaded);
          return route.fulfill({ status: 201, json: { media_ids: uploaded.map(({ id }) => id) } });
        }
        case "POST /api/upload/video/init": {
          const form = await readForm(request);
          videoFilename = String(form.get("filename"));
          uploadedChunks = 0;
          return route.fulfill({ json: { media_id: "video-1" } });
        }
        case "POST /api/upload/video/chunk/video-1":
          uploadedChunks += 1;
          return route.fulfill({ json: { message: "Chunk uploaded" } });
        case "POST /api/upload/video/complete/video-1": {
          const form = await readForm(request);
          if (!videoFilename || uploadedChunks !== Number(form.get("total_chunks"))) {
            return route.fulfill({ status: 400, json: { detail: "Missing video chunks" } });
          }
          images.push(galleryItem(videoFilename, "video-1"));
          detections.push({
            id: "video-detection-1",
            media_id: "video-1",
            label: "Plastic",
            confidence: 0.95,
            bbox: { x: 10, y: 10, w: 100, h: 100 },
            timestamp_in_video: 1,
            frame_hf_path: "/avatar.png",
            created_at: timestamp,
          });
          return route.fulfill({ json: { media_id: "video-1" } });
        }
        case "GET /api/upload/recents":
          return route.fulfill({ json: { image_items: images, video_items: detections, total: images.length } });

        case "GET /api/vault": {
          const search = searchParams.get("search")?.toLowerCase() ?? "";
          const status = searchParams.get("status");
          const items = images.filter(
            (image) =>
              (!status || image.status === status) &&
              String(image.initial_metadata?.filename).toLowerCase().includes(search),
          );
          const pageSize = Number(searchParams.get("page_size") ?? 12);
          const page = Number(searchParams.get("page") ?? 1);
          return route.fulfill({
            json: {
              image_items: items.slice((page - 1) * pageSize, page * pageSize),
              video_items: detections,
              total: items.length,
              page,
              page_size: pageSize,
              total_pages: Math.ceil(items.length / pageSize),
            },
          });
        }
        default:
          return route.fulfill({ status: 404, json: { detail: `Unmocked endpoint: ${method} ${pathname}` } });
      }
    });

    await provide(context);
  },
});
