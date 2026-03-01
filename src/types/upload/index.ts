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
  items: VaultItem[];
}

export type VaultItem = GalleryItem;

export type RecentMediaItem = GalleryItem;

export type GalleryItem = {
  id: string;
  filename: string;
  image_url: string;
  status: CardStatus;
  failed_reason?: string;
  gpsCoordinates?: string;
  timestamp: string;
  metadata: GalleryItemMetadata;
  assigned_worker?: string;
  technical_metadata?: GalleryItemTechnicalMetadata;
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

export interface GalleryItemTechnicalMetadata {
  make: string;
  model: string;
  software: string;
  date_taken: string;
  gps: {
    lat: number;
    lng: number;
    altitude: number;
    address: string;
  };
}
export interface WSStatusUpdate {
  type: "MEDIA_STATUS_UPDATE";
  media_id: string;
  status: CardStatus;
  failed_reason?: string;
  image_url?: string;
  worker?: string;
  timestamp: string;
  address?: string;
}
