import GalleryCard from "./GalleryCard";
import type { GalleryItem } from "../../../types/upload";

type GalleryProps = {
  items: GalleryItem[];
  onCardZoom?: (itemId: string) => void;
};

const Gallery = ({ items, onCardZoom }: GalleryProps) => {

  console.log("Rendering Gallery with items:", items);

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item, i) => (
        <GalleryCard
          key={item.id}
          index={i}
          id={item.id}
          title={item.filename}
          imageUrl={item.image_url}
          status={item.status}
          gpsCoordinates={item.gpsCoordinates || "N/A"}
          timestamp={item.timestamp}
          metadataInfo={
            item.metadata
              ? `Size: ${(item.metadata.size / 1048576).toFixed(2)} Megabytes, Dimensions: ${item.metadata.width}x${item.metadata.height}`
              : "No metadata"
          }
          onZoom={() => onCardZoom?.(item.id)}
        />
      ))}
    </section>
  );
};

export default Gallery;
