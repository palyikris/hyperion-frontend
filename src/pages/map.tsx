import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { MapContainer, TileLayer, Marker } from "react-leaflet";

import { useMapData } from "../hooks/map/useMapData";
import type { MapItem } from "../types/map";
import { Map as LeafletMap } from "leaflet";
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
import { getStoredMapViewport } from "../utils/map/mapViewport";
import type { ViewportState } from "../components/features/map/MapViewportEvents";
import { areMapFiltersEqual } from "../utils/map/mapFilters";
import {
  createClusterCustomIcon,
  createMapIcon,
  createUserLocationIcon,
} from "../utils/map/mapIcons";
import MapViewportEvents from "../components/features/map/MapViewportEvents";
import { mixHexColors } from "../utils/map/mapColors";

type ViewMode = "markers" | "heatmap" | "grid";
const DEFAULT_MAP_CENTER: [number, number] = [47.4979, 19.0402];
const DEFAULT_MAP_ZOOM = 12;
const MARKER_FOCUS_ZOOM = 18;

export const MapPage: React.FC = () => {
  const { t } = useTranslation();
  const mapRef = useRef<LeafletMap | null>(null);
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
  const { data, isLoading, isFetching, isError, dataUpdatedAt } =
    useMapData(debouncedFilters);
  const [lastTransitionDataUpdatedAt, setLastTransitionDataUpdatedAt] =
    useState(0);

  useEffect(() => {
    if (!showLayerTransition) return;

    if (isError && !isFetching) {
      window.requestAnimationFrame(() => {
        setShowLayerTransition(false);
      });
      return;
    }

    const hasNewDataForTransition =
      dataUpdatedAt > 0 && dataUpdatedAt !== lastTransitionDataUpdatedAt;

    if (!isFetching && hasNewDataForTransition) {
      const frameId = window.requestAnimationFrame(() => {
        setLastTransitionDataUpdatedAt(dataUpdatedAt);
        setShowLayerTransition(false);
      });

      return () => window.cancelAnimationFrame(frameId);
    }
  }, [
    showLayerTransition,
    isFetching,
    isError,
    dataUpdatedAt,
    lastTransitionDataUpdatedAt,
  ]);

  const setFiltersWithTransition = useCallback(
    (nextFilters: MapFiltersFormData) => {
      if (areMapFiltersEqual(filters, nextFilters)) return;
      setShowLayerTransition(true);
      setFilters(nextFilters);
    },
    [filters],
  );

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
      if (filters.has_trash !== true) {
        setFiltersWithTransition({
          ...filters,
          has_trash: true,
        });
      }
    }
  };

  const handleViewportChange = useCallback((state: ViewportState) => {
    setViewportState(state);
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

    setFiltersWithTransition({
      ...filters,
      min_lat: bounds.getSouth(),
      max_lat: bounds.getNorth(),
      min_lng: bounds.getWest(),
      max_lng: bounds.getEast(),
    });

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
          setFiltersWithTransition(
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
