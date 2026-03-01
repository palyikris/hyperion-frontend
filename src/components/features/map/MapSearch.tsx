import React from "react";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import { useMap } from "react-leaflet";
import { useTranslation } from "react-i18next";
import type { Control } from "leaflet";
import "leaflet-geosearch/dist/geosearch.css";

const MapSearch: React.FC = () => {
  const map = useMap();
  const { t } = useTranslation();

  React.useEffect(() => {
    const provider = new OpenStreetMapProvider();
    const searchControl = GeoSearchControl({
      provider,
      style: "bar",
      classNames: {
        form: "hyperion-map-search-form",
        input: "hyperion-map-search-input",
        resetButton: "reset hyperion-map-search-reset",
        resultlist: "hyperion-map-search-results",
        item: "hyperion-map-search-item",
        notfound: "hyperion-map-search-notfound",
      },
      showMarker: false,
      showPopup: false,
      autoClose: true,
      retainZoomLevel: false,
      animateZoom: true,
      keepResult: false,
      resetButton: "×",
      searchLabel: t("map.search_label"),
      clearSearchLabel: t("map.clear_search_label"),
      notFoundMessage: t("map.not_found_message"),
    });
    map.addControl(searchControl as unknown as Control);
    return () => {
      map.removeControl(searchControl as unknown as Control);
    };
  }, [map, t]);

  return null;
};

export default MapSearch;
