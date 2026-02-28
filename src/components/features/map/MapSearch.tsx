import React from "react";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import "leaflet-geosearch/dist/geosearch.css";

interface MapSearchProps {
  map: L.Map | null;
}

const MapSearch: React.FC<MapSearchProps> = ({ map }) => {
  React.useEffect(() => {
    if (!map) return;
    const provider = new OpenStreetMapProvider();
    const searchControl = GeoSearchControl({
      provider,
      style: "bar",
      showMarker: false,
      showPopup: false,
      autoClose: true,
      retainZoomLevel: false,
      animateZoom: true,
      keepResult: false,
      searchLabel: "Search address or city...",
    });
    map.addControl(searchControl as any);
    return () => {
      map.removeControl(searchControl as any);
    };
  }, [map]);
  return null;
};

export default MapSearch;
