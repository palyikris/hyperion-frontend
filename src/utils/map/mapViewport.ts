export type PersistedMapViewport = {
  lat: number;
  lng: number;
  zoom: number;
};

const MAP_VIEWPORT_STORAGE_KEY = "hyperion.map.viewport";

const isValidViewportNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

export const getStoredMapViewport = (): PersistedMapViewport | null => {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(MAP_VIEWPORT_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<PersistedMapViewport>;

    if (
      !isValidViewportNumber(parsed.lat) ||
      !isValidViewportNumber(parsed.lng) ||
      !isValidViewportNumber(parsed.zoom)
    ) {
      return null;
    }

    const lat = parsed.lat;
    const lng = parsed.lng;
    const zoom = parsed.zoom;

    if (
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180 ||
      zoom < 0 ||
      zoom > 22
    ) {
      return null;
    }

    return {
      lat,
      lng,
      zoom,
    };
  } catch {
    return null;
  }
};

export const storeMapViewport = ({ lat, lng, zoom }: PersistedMapViewport) => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      MAP_VIEWPORT_STORAGE_KEY,
      JSON.stringify({ lat, lng, zoom }),
    );
  } catch {
    return;
  }
};
