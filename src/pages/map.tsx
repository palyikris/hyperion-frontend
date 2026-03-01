import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";

import { useMapData } from "../hooks/map/useMapData";
import type { MapItem } from "../types/map";
import L, { Map as LeafletMap } from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import LoadingScreen from "../components/shared/LoadingScreen";
import MapFilters from "../components/features/map/MapFilters";
import { MarkerSidebar } from "../components/features/map";
import MapSearch from "../components/features/map/MapSearch";
import { MapPinned } from "lucide-react";
import ConfirmModal from "../components/shared/ConfirmModal";
import { toastService } from "../services/toastService";
import type { MapFiltersFormData } from "../schemas/map/filters";
import { useDebounce } from "../hooks/useDebounce";
import ImageModal from "../components/features/upload/ImageModal";
import { useMapGrid } from "../hooks/map/useMapGrid";
import MapFloatingControls from "../components/features/map/MapFloatingControls";
import MapLayerRenderer from "../components/features/map/MapLayerRenderer";
import MapRegionOverlay from "../components/features/map/MapRegionOverlay";
import MapLayerTransitionOverlay from "../components/features/map/MapLayerTransitionOverlay";

interface Cluster {
  getChildCount: () => number;
}

type ViewMode = "markers" | "heatmap" | "grid";

type PersistedMapViewport = {
  lat: number;
  lng: number;
  zoom: number;
};

type ViewportState = {
  zoom: number;
  center: {
    lat: number;
    lng: number;
  };
  bounds: {
    south: number;
    west: number;
    north: number;
    east: number;
  };
};

const MAP_VIEWPORT_STORAGE_KEY = "hyperion.map.viewport";
const DEFAULT_MAP_CENTER: [number, number] = [47.4979, 19.0402];
const DEFAULT_MAP_ZOOM = 12;
const MARKER_FOCUS_ZOOM = 18;

const isValidViewportNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const getStoredMapViewport = (): PersistedMapViewport | null => {
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

const storeMapViewport = ({ lat, lng, zoom }: PersistedMapViewport) => {
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

const createClusterCustomIcon = (cluster: Cluster) => {
  const count = cluster.getChildCount();
  let size: "small" | "medium" | "large" = "small";
  if (count >= 100) size = "large";
  else if (count >= 10) size = "medium";
  return L.divIcon({
    html: `<div class="custom-cluster-icon ${size}"><span>${count}</span></div>`,
    className: `custom-cluster custom-cluster-${size}`,
    iconSize: [40, 40],
  });
};

const createMapIcon = (_status: string, hasTrash: boolean) => {
  const color = hasTrash ? "#D97B5A" : "#8FCACA";
  const html = renderToStaticMarkup(
    <div className="relative flex items-center justify-center">
      <div
        className="absolute w-8 h-8 rounded-full animate-ping opacity-20"
        style={{ backgroundColor: color }}
      />
      <div
        className="relative z-10 w-4 h-4 rounded-full border-2 border-white shadow-md"
        style={{ backgroundColor: color }}
      />
    </div>,
  );
  return L.divIcon({
    html,
    className: "custom-pin",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

const createUserLocationIcon = () => {
  const color = "#1A5F54";
  const html = renderToStaticMarkup(
    <div className="relative flex items-center justify-center">
      <div
        className="absolute w-8 h-8 rounded-full animate-ping opacity-20"
        style={{ backgroundColor: color }}
      />
      <div
        className="relative z-10 w-4 h-4 rounded-full border-2 border-hyperion-cream shadow-md"
        style={{ backgroundColor: color }}
      />
    </div>,
  );
  return L.divIcon({
    html,
    className: "custom-user-location-pin",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

const parseHexColor = (hex: string) => {
  const cleanHex = hex.replace("#", "");
  const bigint = Number.parseInt(cleanHex, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
};

const mixHexColors = (startHex: string, endHex: string, ratio: number) => {
  const clamped = Math.min(Math.max(ratio, 0), 1);
  const start = parseHexColor(startHex);
  const end = parseHexColor(endHex);

  const r = Math.round(start.r + (end.r - start.r) * clamped);
  const g = Math.round(start.g + (end.g - start.g) * clamped);
  const b = Math.round(start.b + (end.b - start.b) * clamped);

  return `rgb(${r}, ${g}, ${b})`;
};

const MapViewportEvents: React.FC<{
  onViewportChange: (state: ViewportState) => void;
}> = ({ onViewportChange }) => {
  const map = useMapEvents({
    moveend: () => {
      const bounds = map.getBounds();
      const center = map.getCenter();
      onViewportChange({
        zoom: map.getZoom(),
        center: {
          lat: center.lat,
          lng: center.lng,
        },
        bounds: {
          south: bounds.getSouth(),
          west: bounds.getWest(),
          north: bounds.getNorth(),
          east: bounds.getEast(),
        },
      });
    },
  });

  useEffect(() => {
    const bounds = map.getBounds();
    const center = map.getCenter();
    onViewportChange({
      zoom: map.getZoom(),
      center: {
        lat: center.lat,
        lng: center.lng,
      },
      bounds: {
        south: bounds.getSouth(),
        west: bounds.getWest(),
        north: bounds.getNorth(),
        east: bounds.getEast(),
      },
    });
  }, [map, onViewportChange]);

  return null;
};

export const MapPage: React.FC = () => {
  const { t } = useTranslation();
  const mapRef = useRef<LeafletMap | null>(null);
  const transitionTimerRef = useRef<number | null>(null);
  const storedViewport = useMemo(() => getStoredMapViewport(), []);

  const [filters, setFilters] = useState<MapFiltersFormData>({
    has_trash: undefined,
    min_confidence: 0,
    min_lat: undefined,
    max_lat: undefined,
    min_lng: undefined,
    max_lng: undefined,
  });

  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("markers");
  const [viewportState, setViewportState] = useState<ViewportState | null>(
    null,
  );
  const [showLayerTransition, setShowLayerTransition] = useState(false);
  const [initialCenter] = useState<[number, number]>(() =>
    storedViewport
      ? [storedViewport.lat, storedViewport.lng]
      : DEFAULT_MAP_CENTER,
  );
  const [initialZoom] = useState<number>(
    () => storedViewport?.zoom ?? DEFAULT_MAP_ZOOM,
  );
  const debouncedFilters = useDebounce(filters, 350);
  const debouncedViewport = useDebounce(viewportState, 150);
  const { data, isLoading } = useMapData(debouncedFilters);

  const heatmapPoints = useMemo(
    () =>
      (data?.items ?? []).map(
        (item) =>
          [item.lat, item.lng, item.has_trash ? 1 : 0.45] as [
            number,
            number,
            number,
          ],
      ),
    [data?.items],
  );

  const gridCells = useMapGrid({
    items: data?.items ?? [],
    zoom: debouncedViewport?.zoom ?? 12,
    bounds: debouncedViewport?.bounds ?? null,
  });

  const maxGridCount = useMemo(
    () => Math.max(1, ...gridCells.map((cell) => cell.count)),
    [gridCells],
  );

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    if (mode === "grid") {
      setFilters((prev) =>
        prev.has_trash === true
          ? prev
          : {
              ...prev,
              has_trash: true,
            },
      );
    }
    setShowLayerTransition(true);

    if (transitionTimerRef.current !== null) {
      window.clearTimeout(transitionTimerRef.current);
    }

    transitionTimerRef.current = window.setTimeout(() => {
      setShowLayerTransition(false);
      transitionTimerRef.current = null;
    }, 400);
  };

  useEffect(() => {
    return () => {
      if (transitionTimerRef.current !== null) {
        window.clearTimeout(transitionTimerRef.current);
      }
    };
  }, []);

  const handleViewportChange = useCallback((state: ViewportState) => {
    setViewportState(state);
    storeMapViewport({
      lat: state.center.lat,
      lng: state.center.lng,
      zoom: state.zoom,
    });
  }, []);

  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [locating, setLocating] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);

  const flyTo = (lat: number, lng: number) => {
    if (mapRef.current) {
      mapRef.current.flyTo([lat, lng], MARKER_FOCUS_ZOOM, {
        duration: 1.2,
      });
    }
  };

  const handleCaptureBounds = () => {
    if (!mapRef.current) return;
    const bounds = mapRef.current.getBounds();

    setFilters((prev) => ({
      ...prev,
      min_lat: bounds.getSouth(),
      max_lat: bounds.getNorth(),
      min_lng: bounds.getWest(),
      max_lng: bounds.getEast(),
    }));

    toastService.success(t("map.area_captured", "Area captured successfully"));
  };

  const handleGoToMyLocation = () => {
    if (!navigator.geolocation) {
      toastService.error(
        t("map.geolocation_not_supported", "Geolocation not supported."),
      );
      return;
    }
    setShowLocationModal(true);
  };

  const handleConfirmLocation = () => {
    setShowLocationModal(false);
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        flyTo(latitude, longitude);
        setLocating(false);
      },
      () => {
        toastService.error(
          t("map.unable_to_retrieve_location", "Unable to retrieve location."),
        );
        setLocating(false);
      },
    );
  };

  // Sidebar state for selected marker
  const [selectedItem, setSelectedItem] = useState<MapItem | null>(null);
  const [zoomedImage, setZoomedImage] = useState<{
    id: string;
    url: string;
  } | null>(null);

  const handleMarkerImageZoom = (item: MapItem) => {
    if (!item.image_url) return;
    setZoomedImage({
      id: item.id,
      url: item.image_url,
    });
  };

  const handleCloseImageModal = () => setZoomedImage(null);

  if (isLoading && !data) return <LoadingScreen />;

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden">
      <MapFloatingControls
        showFilters={showFilters}
        onShowFilters={() => setShowFilters(true)}
        onGoToMyLocation={handleGoToMyLocation}
        locating={locating}
        showFiltersLabel={t("map.show_filters", "Show filters")}
        goToMyLocationLabel={t("map.go_to_my_location", "Go to my location")}
      />

      <MapFilters
        filters={filters}
        onFiltersChange={(nextFilters) =>
          setFilters(
            viewMode === "grid"
              ? {
                  ...nextFilters,
                  has_trash: true,
                }
              : nextFilters,
          )
        }
        items={data?.items}
        flyTo={flyTo}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        onCaptureBounds={handleCaptureBounds}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
      />

      <ConfirmModal
        isOpen={showLocationModal}
        title={t("map.allow_location_access_title", "Allow Location Access?")}
        description={t(
          "map.allow_location_access_desc",
          "We need your permission to center the map where you are.",
        )}
        icon={<MapPinned className="w-8 h-8 text-hyperion-deep-sea" />}
        onConfirm={handleConfirmLocation}
        onClose={() => setShowLocationModal(false)}
        confirmText={t("map.allow", "Allow")}
        cancelText={t("map.cancel", "Cancel")}
      />

      <MapContainer
        center={initialCenter}
        zoom={initialZoom}
        zoomControl={false}
        className="absolute inset-0 h-full w-full"
        ref={mapRef}
      >
        <MapViewportEvents onViewportChange={handleViewportChange} />
        {/* Address/City Search */}
        <MapSearch />
        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />

        <MapLayerRenderer
          viewMode={viewMode}
          items={data?.items ?? []}
          heatmapPoints={heatmapPoints}
          gridCells={gridCells}
          maxGridCount={maxGridCount}
          createClusterCustomIcon={createClusterCustomIcon}
          createMapIcon={createMapIcon}
          mixHexColors={mixHexColors}
          onMarkerClick={setSelectedItem}
        />

        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={createUserLocationIcon()}
          ></Marker>
        )}
        <MapRegionOverlay filters={filters} />
      </MapContainer>

      <MapLayerTransitionOverlay
        showLayerTransition={showLayerTransition}
        viewMode={viewMode}
      />

      {/* Sidebar for marker details */}
      {selectedItem && (
        <MarkerSidebar
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onImageZoom={() => handleMarkerImageZoom(selectedItem)}
        />
      )}

      <ImageModal
        open={!!zoomedImage}
        imageUrl={zoomedImage?.url || ""}
        alt={zoomedImage?.id}
        onClose={handleCloseImageModal}
      />
    </div>
  );
};
