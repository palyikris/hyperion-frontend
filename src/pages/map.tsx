import React, { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useMapData } from "../hooks/map/useMapData";
import L, { Map as LeafletMap } from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import LoadingScreen from "../components/shared/LoadingScreen";
import MapFilters from "../components/features/map/MapFilters";
import MarkerPopup from "../components/features/map/MarkerPopup";
import { MapPinned } from "lucide-react";
import ConfirmModal from "../components/shared/ConfirmModal";
import { toastService } from "../services/toastService";

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
    </div>
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

  const [filters, setFilters] = useState<{ has_trash: boolean | undefined; min_confidence: number }>({
    has_trash: undefined,
    min_confidence: 0,
  });
  const { data, isLoading } = useMapData(filters);

  const mapRef = useRef<LeafletMap | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);

  const flyTo = (lat: number, lng: number) => {
    if (mapRef.current) {
      mapRef.current.flyTo([lat, lng], mapRef.current.getZoom(), { duration: 1.2 });
    }
  };

  const handleGoToMyLocation = () => {
    if (!navigator.geolocation) {
      toastService.error(t("map.geolocation_not_supported", "Geolocation is not supported by your browser."));
      return;
    }
    if (locating) return;
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
        alert(t("map.unable_to_retrieve_location", "Unable to retrieve your location."));
        setLocating(false);
      }
    );
  };


  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden">
      <button
        onClick={handleGoToMyLocation}
        className="absolute z-1000 right-6 top-6 bg-white shadow-lg rounded-full p-2 border border-hyperion-deep-sea hover:bg-gray-100 transition"
        style={{ width: 44, height: 44 }}
        title={t("map.go_to_my_location", "Go to my location")}
        disabled={locating}
      >
        <MapPinned className="text-hyperion-deep-sea w-5 h-5 mx-auto"/>
      </button>
      <ConfirmModal
        isOpen={showLocationModal}
        title={t("map.allow_location_access_title", "Allow Location Access?")}
        description={t("map.allow_location_access_desc", "We need your permission to access your location and center the map where you are.")}
        icon={<MapPinned className="w-8 h-8" />}
        onConfirm={handleConfirmLocation}
        onClose={() => setShowLocationModal(false)}
        confirmText={t("map.allow", "Allow")}
        cancelText={t("map.cancel", "Cancel")}
      />
      <MapFilters
        filters={filters}
        setFilters={setFilters}
        items={data?.items}
        flyTo={flyTo}
      />

      <MapContainer
        center={[47.4979, 19.0402]}
        zoom={12}
        zoomControl={false}
        className="absolute inset-0 h-full w-full"
        ref={mapRef}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
        {data?.items.map((item) => (
          <Marker
            key={item.id}
            position={[item.lat, item.lng]}
            icon={createMapIcon(item.status, true /* setting has_trash true */)}
          >
            <Popup className="custom-popup" minWidth={260}>
              <MarkerPopup item={item} />
            </Popup>
          </Marker>
        ))}
        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={createUserLocationIcon()}
          >
            <Popup minWidth={180}>{t("map.you_are_here", "You are here")}</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};
