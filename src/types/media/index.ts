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
}
