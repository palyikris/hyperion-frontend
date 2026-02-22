export type CardStatus =
  | "PENDING"
  | "UPLOADING"
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
  metadataInfo: string;
};

export interface WSStatusUpdate {
  type: "MEDIA_STATUS_UPDATE";
  media_id: string;
  status: CardStatus;
  worker?: string;
  timestamp: string;
}
