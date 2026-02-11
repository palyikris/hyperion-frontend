export type ProcessingStatus = "pending" | "processing" | "success" | "failed";

export interface Detection {
  id: number;
  label: string;
  confidence: number;
  bbox: { x: number; y: number; w: number; h: number };
  is_manual: boolean;
  area_sqm?: number;
}

export interface MediaItem {
  id: number;
  filename: string;
  file_url: string;
  status: ProcessingStatus;
  location: { lat: number; lng: number };
  altitude: number;
  created_at: string;
  detections: Detection[];
}
