import React, { useEffect } from "react";
import { useMapEvents } from "react-leaflet";

import { storeMapViewport } from "../../../utils/map/mapViewport";

export type ViewportState = {
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

interface MapViewportEventsProps {
  onViewportChange: (state: ViewportState) => void;
}

const MapViewportEvents: React.FC<MapViewportEventsProps> = ({
  onViewportChange,
}) => {
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

  useEffect(() => {
    const persistViewport = () => {
      const center = map.getCenter();

      storeMapViewport({
        lat: center.lat,
        lng: center.lng,
        zoom: map.getZoom(),
      });
    };

    persistViewport();
    map.on("moveend", persistViewport);
    map.on("zoomend", persistViewport);

    return () => {
      map.off("moveend", persistViewport);
      map.off("zoomend", persistViewport);
    };
  }, [map]);

  return null;
};

export default MapViewportEvents;
