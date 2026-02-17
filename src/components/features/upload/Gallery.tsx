import GalleryCard from "./GalleryCard";
import type { GalleryItem } from "../../../types/upload";

type GalleryProps = {
  items: GalleryItem[];
  onCardZoom?: (itemId: string) => void;
};

const Gallery = ({ items, onCardZoom }: GalleryProps) => {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item) => (
        <GalleryCard
          key={item.id}
          id={item.id}
          title={item.title}
          imageUrl={item.imageUrl}
          status={item.status}
          gpsCoordinates={item.gpsCoordinates}
          timestamp={item.timestamp}
          metadataInfo={item.metadataInfo}
          onZoom={() => onCardZoom?.(item.id)}
        />
      ))}
    </section>
  );
};

export default Gallery;
