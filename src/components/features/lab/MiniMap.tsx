import { useCallback, useEffect, useMemo, useRef } from "react";
import type { LeafletEventHandlerFnMap, Map as LeafletMap } from "leaflet";
import { Marker as LeafletMarker } from "leaflet";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";

import { createMapIcon } from "../../../utils/map/mapIcons";

type MiniMapProps = {
  lat: number;
  lng: number;
  zoom?: number;
  className?: string;
  onPositionChange?: (lat: number, lng: number) => void;
};

type MiniMapViewportSyncProps = {
  lat: number;
  lng: number;
  zoom: number;
};

type MiniMapMapReadySyncProps = {
  onMapReady: (map: LeafletMap) => void;
};

const MiniMapViewportSync = ({ lat, lng, zoom }: MiniMapViewportSyncProps) => {
  const map = useMap();

  useEffect(() => {
    const center = map.getCenter();
    const isAtTarget =
      Math.abs(center.lat - lat) < 0.000001 &&
      Math.abs(center.lng - lng) < 0.000001;

    if (isAtTarget) {
      return;
    }

    map.flyTo([lat, lng], zoom, { duration: 0.7 });
  }, [lat, lng, map, zoom]);

  return null;
};

const MiniMapMapReadySync = ({ onMapReady }: MiniMapMapReadySyncProps) => {
  const map = useMap();

  useEffect(() => {
    onMapReady(map);
  }, [map, onMapReady]);

  return null;
};

const MiniMap = ({
  lat,
  lng,
  zoom = 16,
  className,
  onPositionChange,
}: MiniMapProps) => {
  const mapRef = useRef<LeafletMap | null>(null);
  const isDraggingRef = useRef(false);

  const handleMapReady = useCallback((map: LeafletMap) => {
    mapRef.current = map;
  }, []);

  const markerDragEvents = useMemo<LeafletEventHandlerFnMap>(
    () => ({
      dragstart: () => {
        isDraggingRef.current = true;
      },
      drag: (event) => {
        const marker = event.target as LeafletMarker;
        const nextPosition = marker.getLatLng();
        mapRef.current?.panTo(nextPosition, {
          animate: false,
        });
      },
      dragend: (event) => {
        isDraggingRef.current = false;
        const marker = event.target as LeafletMarker;
        const nextPosition = marker.getLatLng();
        onPositionChange?.(nextPosition.lat, nextPosition.lng);
      },
    }),
    [onPositionChange],
  );

  return (
    <div
      className={
        className ??
        "h-120 w-full overflow-hidden rounded-2xl border border-hyperion-fog-grey"
      }
    >
      <MapContainer
        center={[lat, lng]}
        zoom={zoom}
        zoomControl={false}
        className="h-full w-full z-100"
      >
        <MiniMapMapReadySync onMapReady={handleMapReady} />
        <MiniMapViewportSync lat={lat} lng={lng} zoom={zoom} />
        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
        <Marker
          position={[lat, lng]}
          icon={createMapIcon("default", true)}
          draggable
          eventHandlers={markerDragEvents}
        />
      </MapContainer>
    </div>
  );
};

export default MiniMap;
