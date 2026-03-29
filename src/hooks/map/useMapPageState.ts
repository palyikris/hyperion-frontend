import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Map as LeafletMap } from "leaflet";

import { useMapData } from "./useMapData";
import { useMapGrid } from "./useMapGrid";
import { useDebounce } from "../useDebounce";
import { getStoredMapViewport } from "../../utils/map/mapViewport";
import { areMapFiltersEqual } from "../../utils/map/mapFilters";
import { toastService } from "../../services/toastService";
import type { MapFiltersFormData } from "../../schemas/map/filters";
import type { MapItem } from "../../types/map";
import type { ViewportState } from "../../components/features/map/MapViewportEvents";

type ViewMode = "markers" | "heatmap" | "grid";

const DEFAULT_MAP_CENTER: [number, number] = [47.4979, 19.0402];
const DEFAULT_MAP_ZOOM = 12;
const MARKER_FOCUS_ZOOM = 18;

export function useMapPageState() {
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

  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [locating, setLocating] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MapItem | null>(null);
  const [zoomedImage, setZoomedImage] = useState<{
    id: string;
    url: string;
  } | null>(null);
  const [lastTransitionDataUpdatedAt, setLastTransitionDataUpdatedAt] =
    useState(0);

  const debouncedFilters = useDebounce(filters, 350);
  const debouncedViewport = useDebounce(viewportState, 150);

  const { data, isLoading, isFetching, isError, dataUpdatedAt } =
    useMapData(debouncedFilters);

  const heatmapPoints = useMemo(() => {
    const itemPoints = (data?.items ?? []).map(
      (item) =>
        [item.lat, item.lng, item.has_trash ? 1 : 0.45] as [
          number,
          number,
          number,
        ],
    );
    const detectionPoints = data?.video_detections
      ? Object.values(data.video_detections)
          .flat()
          .map(
            (det) =>
              [
                typeof det.lat === "string"
                  ? parseFloat(det.lat as unknown as string)
                  : det.lat,
                typeof det.lng === "string"
                  ? parseFloat(det.lng as unknown as string)
                  : det.lng,
                1,
              ] as [number, number, number],
          )
      : [];
    return [...itemPoints, ...detectionPoints];
  }, [data]);

  // merge items and video detections for grid cell calculation
  const mergedItems = useMemo(() => {
    const items = data?.items ?? [];
    const detections = data?.video_detections
      ? Object.values(data.video_detections)
          .flat()
          .map((det) => ({
            id: det.id,
            lat:
              typeof det.lat === "string"
                ? parseFloat(det.lat as unknown as string)
                : det.lat,
            lng:
              typeof det.lng === "string"
                ? parseFloat(det.lng as unknown as string)
                : det.lng,
            has_trash: true,
            status: "READY",
            confidence: det.confidence ?? 1,
            image_url: det.image_url,
            address: det.address || undefined,
            filename: det.media?.initial_metadata?.filename as
              | string
              | undefined,
            detections: [det],
          }))
      : [];
    return [...items, ...detections];
  }, [data]);

  const gridCells = useMapGrid({
    items: mergedItems,
    zoom: debouncedViewport?.zoom ?? DEFAULT_MAP_ZOOM,
    bounds: debouncedViewport?.bounds ?? null,
  });

  const maxGridCount = useMemo(
    () => Math.max(1, ...gridCells.map((cell) => cell.count)),
    [gridCells],
  );

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

  const handleViewModeChange = useCallback(
    (mode: ViewMode) => {
      setViewMode(mode);
      if (mode === "grid" && filters.has_trash !== true) {
        setFiltersWithTransition({
          ...filters,
          has_trash: true,
        });
      }
    },
    [filters, setFiltersWithTransition],
  );

  const handleViewportChange = useCallback((state: ViewportState) => {
    setViewportState(state);
  }, []);

  const flyTo = useCallback((lat: number, lng: number) => {
    if (!mapRef.current) return;

    mapRef.current.flyTo([lat, lng], MARKER_FOCUS_ZOOM, {
      duration: 1.2,
    });
  }, []);

  const handleCaptureBounds = useCallback(() => {
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
  }, [filters, setFiltersWithTransition, t]);

  const handleGoToMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toastService.error(
        t("map.geolocation_not_supported", "Geolocation not supported."),
      );
      return;
    }

    setShowLocationModal(true);
  }, [t]);

  const handleConfirmLocation = useCallback(() => {
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
  }, [flyTo, t]);

  const handleMarkerImageZoom = useCallback((item: MapItem) => {
    if (!item.image_url) return;

    setZoomedImage({
      id: item.id,
      url: item.image_url,
    });
  }, []);

  const handleCloseImageModal = useCallback(() => {
    setZoomedImage(null);
  }, []);

  return {
    mapRef,
    initialCenter,
    initialZoom,
    filters,
    showFilters,
    setShowFilters,
    viewMode,
    data,
    isLoading,
    gridCells,
    maxGridCount,
    heatmapPoints,
    showLayerTransition,
    handleViewportChange,
    userLocation,
    locating,
    showLocationModal,
    setShowLocationModal,
    handleGoToMyLocation,
    handleConfirmLocation,
    selectedItem,
    setSelectedItem,
    zoomedImage,
    handleMarkerImageZoom,
    handleCloseImageModal,
    flyTo,
    handleCaptureBounds,
    handleViewModeChange,
    setFiltersWithTransition,
  };
}
