import GalleryCard from "./GalleryCard";
import type { CardStatus, GalleryItem } from "../../../types/upload";
import type { VideoDetectionResponse } from "../../../types/lab";
import Divider from "../../shared/Divider";

type GalleryProps = {
  items: GalleryItem[];
  video_items?: VideoDetectionResponse[];
  onCardZoom?: (itemId: string, imageUrl: string) => void;
  showInfo?: boolean;
};

const Gallery = ({
  items,
  video_items,
  onCardZoom,
  showInfo,
}: GalleryProps) => {
  console.log("Rendering Gallery with items:", items);

  return (
    <>
      <section
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        id="image-items"
      >
        {items.map((item, i) => {
          let metadataInfo = "No metadata";
          if (item.initial_metadata) {
            const rawSize = item.initial_metadata.size;
            const sizeInBytes =
              typeof rawSize === "number" ? rawSize : Number(rawSize);
            const sizeStr = Number.isFinite(sizeInBytes)
              ? `${(sizeInBytes / 1048576).toFixed(2)} MB`
              : "Unknown size";
            const hasDimensions =
              item.initial_metadata.width !== undefined &&
              item.initial_metadata.height !== undefined;
            metadataInfo = hasDimensions
              ? `${sizeStr}, ${item.initial_metadata.width}x${item.initial_metadata.height}`
              : sizeStr;
          }
          const title = `${item.initial_metadata?.filename}` || "Untitled";

          return (
            <GalleryCard
              key={item.id}
              index={i}
              id={item.id}
              title={title}
              imageUrl={item.hf_path}
              status={item.status as unknown as CardStatus}
              gpsCoordinates={item.address || "N/A"}
              timestamp={item.created_at}
              metadataInfo={metadataInfo}
              onZoom={() => onCardZoom?.(item.id, item.hf_path)}
              worker_name={item.assigned_worker}
              technical_metadata={item.technical_metadata}
              address={item.address}
              failed_reason={item.failed_reason}
              showInfo={showInfo}
            />
          );
        })}
      </section>
      <Divider label="Video detections" className="my-6"></Divider>
      <section
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        id="video-items"
      >
        {video_items?.map((item, i) => {
          const media = items.find((media) => media.id === item.media_id);
          const title = `${media?.initial_metadata?.filename || "Untitled"} - ${item.label}`;
          const metadataInfo = `Confidence: ${(item.confidence * 100).toFixed(
            2,
          )}%, Timestamp: ${item.timestamp_in_video}s`;
          return (
            <GalleryCard
              key={item.id}
              index={i}
              id={item.id}
              title={title}
              imageUrl={item.frame_hf_path}
              status={"READY" as CardStatus}
              gpsCoordinates={"N/A"}
              timestamp={item.created_at}
              metadataInfo={metadataInfo}
              onZoom={() => onCardZoom?.(item.id, item.frame_hf_path)}
              showInfo={true}
            />
          );
        })}
      </section>
    </>
  );
};

export default Gallery;
