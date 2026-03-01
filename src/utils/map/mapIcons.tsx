import L from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";

interface Cluster {
  getChildCount: () => number;
}

export const createClusterCustomIcon = (cluster: Cluster) => {
  const count = cluster.getChildCount();
  let size: "small" | "medium" | "large" = "small";

  if (count >= 100) size = "large";
  else if (count >= 10) size = "medium";

  return L.divIcon({
    html: `<div class="custom-cluster-icon ${size}"><span>${count}</span></div>`,
    className: `custom-cluster custom-cluster-${size}`,
    iconSize: [40, 40],
  });
};

export const createMapIcon = (_status: string, hasTrash: boolean) => {
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

export const createUserLocationIcon = () => {
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
    </div>,
  );

  return L.divIcon({
    html,
    className: "custom-user-location-pin",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};
