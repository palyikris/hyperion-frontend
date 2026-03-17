import GalleryCard from "./GalleryCard";
import type { GalleryItem } from "../../../types/upload";

type GalleryProps = {
  items: GalleryItem[];
  onCardZoom?: (itemId: string, imageUrl: string) => void;
  showInfo?: boolean;
};

const Gallery = ({ items, onCardZoom, showInfo }: GalleryProps) => {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item, i) => {
        let metadataInfo = "No metadata";
        if (item.metadata) {
          const sizeStr = `${(item.metadata.size / 1048576).toFixed(2)} MB`;
          const hasDimensions =
            item.metadata.width !== undefined &&
            item.metadata.height !== undefined;
          metadataInfo = hasDimensions
            ? `${sizeStr}, ${item.metadata.width}x${item.metadata.height}`
            : sizeStr;
        }
        return (
          <GalleryCard
            key={item.id}
            index={i}
            id={item.id}
            title={item.filename}
            imageUrl={item.image_url}
            status={item.status}
            gpsCoordinates={item.address || "N/A"}
            timestamp={item.timestamp}
            metadataInfo={metadataInfo}
            onZoom={() => onCardZoom?.(item.id, item.image_url)}
            worker_name={item.assigned_worker}
            technical_metadata={item.technical_metadata}
            address={item.address}
            failed_reason={item.failed_reason}
            showInfo={showInfo}
          />
        );
      })}
    </section>
  );
};

export default Gallery;
