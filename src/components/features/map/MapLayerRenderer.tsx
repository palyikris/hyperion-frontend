import React from "react";
import { Marker, Popup, Rectangle } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import type { DivIcon } from "leaflet";

import HeatmapLayer from "./HeatmapLayer";
import GridPopup from "./GridPopup";
import type { GridCell, MapItem } from "../../../types/map";

type ViewMode = "markers" | "heatmap" | "grid";

type Cluster = {
  getChildCount: () => number;
};

type MapLayerRendererProps = {
  viewMode: ViewMode;
  items: MapItem[];
  heatmapPoints: [number, number, number][];
  gridCells: GridCell[];
  maxGridCount: number;
  createClusterCustomIcon: (cluster: Cluster) => DivIcon;
  createMapIcon: (status: string, hasTrash: boolean) => DivIcon;
  mixHexColors: (startHex: string, endHex: string, ratio: number) => string;
  onMarkerClick: (item: MapItem) => void;
};

const MapLayerRenderer: React.FC<MapLayerRendererProps> = ({
  viewMode,
  items,
  heatmapPoints,
  gridCells,
  maxGridCount,
  createClusterCustomIcon,
  createMapIcon,
  mixHexColors,
  onMarkerClick,
}) => {
  if (viewMode === "markers") {
    return (
      <MarkerClusterGroup iconCreateFunction={createClusterCustomIcon}>
        {items.map((item) => (
          <Marker
            key={item.id}
            position={[item.lat, item.lng]}
            icon={createMapIcon(item.status, item.has_trash)}
            eventHandlers={{
              click: () => onMarkerClick(item),
            }}
          />
        ))}
      </MarkerClusterGroup>
    );
  }

  if (viewMode === "heatmap") {
    return <HeatmapLayer points={heatmapPoints} />;
  }

  return (
    <>
      {gridCells.map((cell) => {
        const cellIntensity = cell.density;
        const fillColor = mixHexColors("#8FCACA", "#D97B5A", cellIntensity);
        const normalizedCount = cell.count / maxGridCount;
        const fillOpacity = 0.14 + normalizedCount * 0.5;

        return (
          <Rectangle
            key={cell.id}
            bounds={[
              [cell.bounds.south, cell.bounds.west],
              [cell.bounds.north, cell.bounds.east],
            ]}
            pathOptions={{
              color: fillColor,
              fillColor,
              fillOpacity,
              weight: 1,
            }}
          >
            <Popup>
              <GridPopup cell={cell} />
            </Popup>
          </Rectangle>
        );
      })}
    </>
  );
};

export default MapLayerRenderer;
