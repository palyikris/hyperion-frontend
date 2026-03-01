import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";

type HeatmapPoint = [number, number, number];

type HeatmapLayerProps = {
  points: HeatmapPoint[];
};

type HeatLayerFactory = {
  heatLayer: (
    latlngs: HeatmapPoint[],
    options?: {
      radius?: number;
      blur?: number;
      maxZoom?: number;
      gradient?: Record<number, string>;
    },
  ) => L.Layer;
};

const HeatmapLayer: React.FC<HeatmapLayerProps> = ({ points }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !points.length) return;

    const heatLayer = (L as typeof L & HeatLayerFactory)
      .heatLayer(points, {
        radius: 32,
        blur: 14,
        maxZoom: 19,
        gradient: {
          0.1: "#7ED7FF",
          0.35: "#54B6FF",
          0.6: "#FFB347",
          0.8: "#FF7A3D",
          1: "#FF3D2E",
        },
      })
      .addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points]);

  return null;
};

export default HeatmapLayer;