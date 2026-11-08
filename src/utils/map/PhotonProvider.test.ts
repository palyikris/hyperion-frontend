import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import PhotonProvider from "./PhotonProvider";

const city = {
  geometry: { coordinates: [19.6922302, 46.9075423] as [number, number] },
  properties: {
    name: "Kecskemét",
    city: "Kecskemét",
    state: "Alföld és Észak",
    country: "Magyarország",
    extent: [19.5068013, 47.0012539, 19.8517741, 46.7699196] as [number, number, number, number],
  },
};

describe("PhotonProvider", () => {
  const fetchMock = vi.fn();
  const provider = new PhotonProvider();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ features: [city] }) });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.resetAllMocks();
  });

  it.each(["kecskem", "kecskemet", "Kecskemét"])("searches using the entered name: %s", async (query) => {
    const results = await provider.search({ query });
    const url = new URL(fetchMock.mock.calls[0][0]);
    expect(url.origin).toBe("https://photon.komoot.io");
    expect(url.searchParams.get("q")).toBe(query);
    expect(results[0].label).toBe("Kecskemét, Alföld és Észak, Magyarország");
  });

  it("converts Photon extents into Leaflet bounds in latitude/longitude order", () => {
    expect(provider.parse({ data: { features: [city] } })[0]).toMatchObject({
      x: 19.6922302,
      y: 46.9075423,
      bounds: [[46.7699196, 19.5068013], [47.0012539, 19.8517741]],
    });
  });

  it("uses a selected suggestion without another search", async () => {
    const [selected] = provider.parse({ data: { features: [city] } });
    expect(await provider.search({ query: selected.label, data: selected })).toEqual([selected]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("formats an address without requiring an extent or a place name", () => {
    const results = provider.parse({ data: { features: [{
      geometry: city.geometry,
      properties: { street: "Kossuth tér", housenumber: "1", city: "Kecskemét", country: "Magyarország" },
    }] } });
    expect(results[0]).toMatchObject({ label: "Kossuth tér 1, Kecskemét, Magyarország", bounds: null });
  });

  it("skips empty and very short queries", async () => {
    expect(await provider.search({ query: "  " })).toEqual([]);
    expect(await provider.search({ query: "ke" })).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("supports a configured Photon instance", async () => {
    vi.stubEnv("VITE_GEOCODING_URL", "https://search.example.test/api/");
    await provider.search({ query: " kecskem " });
    const url = new URL(fetchMock.mock.calls[0][0]);
    expect(url.origin).toBe("https://search.example.test");
    expect(url.searchParams.get("q")).toBe("kecskem");
  });

  it("prefers results near the current map center without restricting the search area", () => {
    const getLocation = vi.fn().mockReturnValue({ lat: 47.4979, lng: 19.0402 });
    const localProvider = new PhotonProvider(getLocation);
    const firstUrl = new URL(localProvider.endpoint({ query: "kecskemet" }));
    expect(firstUrl.searchParams.get("lat")).toBe("47.4979");
    expect(firstUrl.searchParams.get("lon")).toBe("19.0402");
    expect(firstUrl.searchParams.has("bbox")).toBe(false);

    getLocation.mockReturnValue({ lat: 46.9, lng: 19.7 });
    const nextUrl = new URL(localProvider.endpoint({ query: "kecskem" }));
    expect(nextUrl.searchParams.get("lat")).toBe("46.9");
  });
});
