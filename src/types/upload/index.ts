export type CardStatus =
  | "PENDING"
  | "UPLOADED"
  | "EXTRACTING"
  | "PROCESSING"
  | "READY"
  | "FAILED";

export type GalleryItem = {
  id: string;
  filename: string;
  image_url: string;
  status: CardStatus;
  gpsCoordinates?: string;
  timestamp: string;
  metadata: GalleryItemMetadata;
};

export interface GalleryItemMetadata {
  filename: string;
  size: number;
  width: number;
  height: number;
}
export interface WSStatusUpdate {
  type: "MEDIA_STATUS_UPDATE";
  media_id: string;
  status: CardStatus;
  image_url?: string;
  worker?: string;
  timestamp: string;
}
