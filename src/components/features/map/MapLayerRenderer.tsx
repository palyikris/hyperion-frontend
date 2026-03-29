import React from "react";
import { Marker, Popup, Rectangle, Polyline } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import type { DivIcon, LatLngExpression } from "leaflet";

import HeatmapLayer from "./HeatmapLayer";
import GridPopup from "./GridPopup";
import {
  convertMediaResponseToMapItem,
  type GridCell,
  type MapItem,
} from "../../../types/map";
import type { VideoDetection } from "../../../types/lab";

type ViewMode = "markers" | "heatmap" | "grid";

type Cluster = {
  getChildCount: () => number;
};

type MapLayerRendererProps = {
  viewMode: ViewMode;
  items: MapItem[];
  video_detections: {
    [media_id: string]: VideoDetection[];
  };
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
  video_detections,
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

        {Object.entries(video_detections).flatMap(([media_id, detections]) => {
          const positions = detections.map((det) => [
            parseFloat(det.lat as unknown as string),
            parseFloat(det.lng as unknown as string),
          ]);

          const polyline =
            positions.length > 1 ? (
              <Polyline
                key={`polyline-${media_id}`}
                positions={positions as unknown as LatLngExpression[]}
                pathOptions={{ color: "#1A5F54", weight: 2 }}
              />
            ) : null;

          console.log(
            "Rendering video detections for media_id:",
            media_id,
            detections,
          );
          const markers = detections.map((det) => (
            <Marker
              key={det.id}
              position={[det.lat, det.lng]}
              icon={createMapIcon("READY", true)}
              eventHandlers={{
                click: () =>
                  onMarkerClick({
                    ...convertMediaResponseToMapItem(det.media),
                    image_url: det.image_url,
                    filename: det.media.initial_metadata?.filename as
                      | string
                      | undefined,
                  }),
              }}
            />
          ));
          return [polyline, ...markers];
        })}
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
