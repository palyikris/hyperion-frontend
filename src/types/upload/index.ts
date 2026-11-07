import type { VideoDetectionResponse } from "../lab";

export type CardStatus =
  | "PENDING"
  | "UPLOADED"
  | "EXTRACTING"
  | "PROCESSING"
  | "READY"
  | "FAILED";

export type FileUploadStatus = "pending" | "preparing" | "uploading" | "completed" | "error" | "cancelled";

export interface FileUploadProgress {
  index: number;
  progress: number;
  status: FileUploadStatus;
  error?: string;
}

export interface VaultResponse {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  image_items: VaultItem[];
  video_items: VideoDetectionResponse[];
}

export type VaultItem = GalleryItem;

export type RecentMediaItem = GalleryItem;

export type GalleryItem = {
  id: string;
  uploader_id: string;
  status: string;
  hf_path: string;
  initial_metadata?: Record<string, unknown>;
  technical_metadata?: GalleryItemTechnicalMetadata;
  assigned_worker?: string;
  created_at: string;
  updated_at: string;
  lat?: number;
  lng?: number;
  altitude?: number;
  address?: string;
  has_trash?: boolean;
  confidence?: number;
  failed_reason?: string;
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
  failed_reason?: string | null;
  img_url?: string | null;
  worker?: string | null;
  timestamp: string;
  address?: string | null;
}
