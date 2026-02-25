export type CardStatus =
  | "PENDING"
  | "UPLOADED"
  | "EXTRACTING"
  | "PROCESSING"
  | "READY"
  | "FAILED";

export interface VaultResponse {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  items: GalleryItem[];
}

export type GalleryItem = {
  id: string;
  filename: string;
  image_url: string;
  status: CardStatus;
  gpsCoordinates?: string;
  timestamp: string;
  metadata: GalleryItemMetadata;
  assigned_worker?: string;
  technical_metadata?: Record<string, string | number | boolean>;
  lat?: number;
  lng?: number;
  altitude?: number;
  address?: string;
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
  address?: string;
}
