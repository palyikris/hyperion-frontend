import { JsonProvider } from "leaflet-geosearch";
import type { SearchResult } from "leaflet-geosearch/lib/providers/provider.js";

interface PhotonFeature {
  geometry: { coordinates: [number, number] };
  properties: {
    name?: string;
    street?: string;
    housenumber?: string;
    city?: string;
    district?: string;
    state?: string;
    country?: string;
    // Photon returns west, north, east, south.
    extent?: [number, number, number, number];
  };
}

interface PhotonResponse {
  features: PhotonFeature[];
}

type SearchLocation = { lat: number; lng: number };

// Nominatim searches whole words; Photon supports incomplete place names.
export default class PhotonProvider extends JsonProvider<PhotonResponse, PhotonFeature> {
  private getLocation?: () => SearchLocation;

  constructor(getLocation?: () => SearchLocation) {
    super();
    this.getLocation = getLocation;
  }

  endpoint({ query }: { query: string }): string {
    const center = this.getLocation?.();
    return this.getUrl(
      import.meta.env.VITE_GEOCODING_URL || "https://photon.komoot.io/api/",
      { q: query.trim(), limit: 5, ...(center ? { lat: center.lat, lon: center.lng } : {}) },
    );
  }

  parse({ data }: { data: PhotonResponse }): SearchResult<PhotonFeature>[] {
    return data.features.map((feature) => {
      const { name, street, housenumber, city, district, state, country, extent } = feature.properties;
      const address = [street, housenumber].filter(Boolean).join(" ");
      const label = [...new Set([name, address, city || district, state, country].filter(Boolean))].join(", ");

      return {
        x: feature.geometry.coordinates[0],
        y: feature.geometry.coordinates[1],
        label,
        bounds: extent ? [[extent[3], extent[0]], [extent[1], extent[2]]] : null,
        raw: feature,
      };
    });
  }

  async search({ query, data }: { query: string; data?: SearchResult<PhotonFeature> }) {
    // Use the chosen suggestion directly instead of geocoding its label again.
    if (data) return [data];
    if (query.trim().length < 3) return [];

    const response = await fetch(this.endpoint({ query }));
    if (!response.ok) throw new Error(`Place search failed (${response.status})`);
    return this.parse({ data: await response.json() });
  }
}
