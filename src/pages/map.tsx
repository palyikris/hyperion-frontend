import React, { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { MapContainer, TileLayer, Marker, Rectangle } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";

import { useMapData } from "../hooks/map/useMapData";
import type { MapItem } from "../types/map";
import L, { Map as LeafletMap } from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import LoadingScreen from "../components/shared/LoadingScreen";
import MapFilters from "../components/features/map/MapFilters";
import { MarkerSidebar } from "../components/features/map";
import MapSearch from "../components/features/map/MapSearch";
import { MapPinned, Filter as FilterIcon } from "lucide-react";
import ConfirmModal from "../components/shared/ConfirmModal";
import { toastService } from "../services/toastService";
import type { MapFiltersFormData } from "../schemas/map/filters";
import { useDebounce } from "../hooks/useDebounce";
import HeatmapLayer from "../components/features/map/HeatmapLayer";

interface Cluster {
  getChildCount: () => number;
}

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

export const MapPage: React.FC = () => {
  const { t } = useTranslation();
  const mapRef = useRef<LeafletMap | null>(null);

  const [filters, setFilters] = useState<MapFiltersFormData>({
    has_trash: undefined,
    min_confidence: 0,
    min_lat: undefined,
    max_lat: undefined,
    min_lng: undefined,
    max_lng: undefined,
  });

  const [showFilters, setShowFilters] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const debouncedFilters = useDebounce(filters, 350);
  const { data, isLoading } = useMapData(debouncedFilters);

  const heatmapPoints = useMemo(
    () =>
      (data?.items ?? []).map(
        (item) => [item.lat, item.lng, 1.0] as [number, number, number],
      ),
    [data?.items],
  );

  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [locating, setLocating] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);

  const flyTo = (lat: number, lng: number) => {
    if (mapRef.current) {
      mapRef.current.flyTo([lat, lng], mapRef.current.getZoom(), {
        duration: 1.2,
      });
    }
  };

  console.log("Map filters:", filters);

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

  if (isLoading && !data) return <LoadingScreen />;

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden">
      {/* Control Buttons Container */}
      <div className="absolute z-1000 right-6 bottom-6 flex flex-col gap-4">
        <AnimatePresence>
          {!showFilters && (
            <motion.button
              key="show-filters-btn"
              initial={{ opacity: 0, scale: 0.7, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.7, y: 10 }}
              onClick={() => setShowFilters(true)}
              className="bg-hyperion-deep-sea shadow-lg rounded-full p-2.5 hover:bg-hyperion-forest transition-all"
              title={t("map.show_filters", "Show filters")}
            >
              <FilterIcon className="text-hyperion-cream w-5 h-5" />
            </motion.button>
          )}
        </AnimatePresence>

        <motion.button
          onClick={() => {
            setSelectedItem(null);
            setShowHeatmap((prev) => !prev);
          }}
          className={`relative overflow-hidden rounded-full p-2.5 py-3 transition-all flex items-center justify-center shadow-lg ${
            showHeatmap
              ? "bg-hyperion-burnt-orange hover:bg-hyperion-burnt-orange/90"
              : "bg-hyperion-deep-sea hover:bg-hyperion-forest"
          }`}
          title={
            showHeatmap
              ? t("map.show_markers", "Show markers")
              : t("map.show_heatmap", "Show heatmap")
          }
          aria-pressed={showHeatmap}
          animate={
            showHeatmap
              ? {
                  scale: [1, 1.08, 1],
                  boxShadow: [
                    "0 8px 16px rgba(0,0,0,0.18)",
                    "0 0 0 3px rgba(248,249,244,0.45)",
                    "0 8px 16px rgba(0,0,0,0.18)",
                  ],
                }
              : {
                  scale: 1,
                  boxShadow: "0 8px 16px rgba(0,0,0,0.18)",
                }
          }
          transition={{ duration: 0.35, ease: "easeOut" }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.span
            className="text-hyperion-cream text-xs font-semibold"
            animate={showHeatmap ? { y: [0, -1, 0] } : { y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            HM
          </motion.span>

          <AnimatePresence>
            {showHeatmap && (
              <motion.span
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute top-1 right-1 h-2 w-2 rounded-full bg-hyperion-cream"
              />
            )}
          </AnimatePresence>
        </motion.button>

        <button
          onClick={handleGoToMyLocation}
          className="bg-hyperion-deep-sea shadow-lg rounded-full p-2.5 hover:bg-hyperion-forest transition-all"
          title={t("map.go_to_my_location", "Go to my location")}
          disabled={locating}
        >
          <MapPinned
            className={`text-hyperion-cream w-5 h-5 ${locating ? "animate-pulse" : ""}`}
          />
        </button>
      </div>

      <MapFilters
        filters={filters}
        onFiltersChange={setFilters}
        items={data?.items}
        flyTo={flyTo}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        onCaptureBounds={handleCaptureBounds}
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
        center={[47.4979, 19.0402]}
        zoom={12}
        zoomControl={false}
        className="absolute inset-0 h-full w-full"
        ref={mapRef}
      >
        {/* Address/City Search */}
        <MapSearch />
        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />

        {showHeatmap ? (
          <HeatmapLayer points={heatmapPoints} />
        ) : (
          <MarkerClusterGroup iconCreateFunction={createClusterCustomIcon}>
            {data?.items.map((item) => (
              <Marker
                key={item.id}
                position={[item.lat, item.lng]}
                icon={createMapIcon(item.status, true)}
                eventHandlers={{
                  click: () => setSelectedItem(item),
                }}
              />
            ))}
          </MarkerClusterGroup>
        )}

        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={createUserLocationIcon()}
          ></Marker>
        )}
        {/* Area Locked Rectangle Overlay */}
        {filters.min_lat !== undefined &&
          filters.max_lat !== undefined &&
          filters.min_lng !== undefined &&
          filters.max_lng !== undefined && (
            <Rectangle
              bounds={[
                [filters.min_lat, filters.min_lng],
                [filters.max_lat, filters.max_lng],
              ]}
              pathOptions={{ color: "#C9A66B", weight: 2, fillOpacity: 0.1 }}
            />
          )}
      </MapContainer>

      {/* Sidebar for marker details */}
      {selectedItem && (
        <MarkerSidebar
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
};
