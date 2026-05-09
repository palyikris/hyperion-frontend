export interface VideoDetectionResponse {
  id: string;
  media_id: string;
  lat?: number;
  lng?: number;
  altitude?: number;
  address?: string;
  label: string;
  confidence: number;
  bbox: Record<string, number>; // {"x", "y", "w", "h"}
  timestamp_in_video: number; // Seconds
  frame_hf_path: string;
  created_at: string; // ISO datetime string
  area_sqm?: number;
}
export interface Detection {
  id: string;
  label: string;
  confidence: number;
  bbox: Record<string, number>;
  area_sqm?: number;
}

export interface MediaResponse {
  id: string;
  uploader_id: string;
  status: string;
  hf_path: string;
  initial_metadata?: Record<string, unknown>;
  technical_metadata?: Record<string, unknown>;
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
  original_media_id?: string;
  detections: Detection[];
}

export interface DetectionInput {
  label: string;
  bbox: Record<string, number>;
  area_sqm?: number;
}

export interface MediaPatchRequest {
  lat?: number;
  lng?: number;
  altitude?: number;
  address?: string;
  detections?: DetectionInput[];
  item_type: "image" | "video";
}

export interface VideoDetection {
  id: string;
  media_id: string;
  lat: number;
  lng: number;
  altitude: number;
  address?: string | null;
  label: string;
  confidence: number;
  bbox: Record<string, number>;
  timestamp_in_video: number; // seconds
  image_url: string;
  media: MediaResponse;
}
