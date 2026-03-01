import React from "react";
import { Rectangle } from "react-leaflet";
import type { MapFiltersFormData } from "../../../schemas/map/filters";

type MapRegionOverlayProps = {
  filters: MapFiltersFormData;
};

const MapRegionOverlay: React.FC<MapRegionOverlayProps> = ({ filters }) => {
  if (
    filters.min_lat === undefined ||
    filters.max_lat === undefined ||
    filters.min_lng === undefined ||
    filters.max_lng === undefined
  ) {
    return null;
  }

  return (
    <Rectangle
      bounds={[
        [filters.min_lat, filters.min_lng],
        [filters.max_lat, filters.max_lng],
      ]}
      pathOptions={{ color: "#C9A66B", weight: 2, fillOpacity: 0.1 }}
    />
  );
};

export default MapRegionOverlay;
