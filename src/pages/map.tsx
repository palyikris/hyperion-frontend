import React from "react";
import { useTranslation } from "react-i18next";
import { MapContainer, TileLayer, Marker } from "react-leaflet";

import LoadingScreen from "../components/shared/LoadingScreen";
import MapFilters from "../components/features/map/MapFilters";
import { MarkerSidebar } from "../components/features/map";
import MapSearch from "../components/features/map/MapSearch";
import { MapPinned } from "lucide-react";
import ConfirmModal from "../components/shared/ConfirmModal";
import ImageModal from "../components/shared/ImageModal";
import MapFloatingControls from "../components/features/map/MapFloatingControls";
import MapLayerRenderer from "../components/features/map/MapLayerRenderer";
import MapRegionOverlay from "../components/features/map/MapRegionOverlay";
import MapLayerTransitionOverlay from "../components/features/map/MapLayerTransitionOverlay";
import {
  createClusterCustomIcon,
  createMapIcon,
  createUserLocationIcon,
} from "../utils/map/mapIcons";
import MapViewportEvents from "../components/features/map/MapViewportEvents";
import { mixHexColors } from "../utils/map/mapColors";
import { useMapPageState } from "../hooks/map/useMapPageState";

export const MapPage: React.FC = () => {
  const { t } = useTranslation();
  const {
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
  } = useMapPageState();

  const cartoApiKey = import.meta.env.CARTO_API_KEY;

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
        <TileLayer
          url={`https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png?key=${cartoApiKey}`}
        />

        <MapLayerRenderer
          viewMode={viewMode}
          items={data?.items ?? []}
          video_detections={data?.video_detections || {}}
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
