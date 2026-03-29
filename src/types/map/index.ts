import type { Detection, MediaResponse, VideoDetection } from "../lab";

export interface MapMediaLog {
  action: string;
  message: string;
  worker_name?: string;
  timestamp: string;
}

export interface MapLogsResponse {
  media_id: string;
  history: MapMediaLog[];
  total: number;
}

export interface MapItem {
  id: string;
  filename?: string;
  status: string;
  failed_reason?: string;
  worker_name?: string;
  lat: number;
  lng: number;
  altitude?: number;
  address?: string;
  image_url?: string;
  has_trash: boolean;
  confidence: number;
  detections: Detection[];
}

export const convertMediaResponseToMapItem = (
  media: MediaResponse,
): MapItem => ({
  id: media.id,
  status: media.status,
  failed_reason: media.failed_reason,
  worker_name: media.assigned_worker,
  lat: media.lat || 0,
  lng: media.lng || 0,
  altitude: media.altitude,
  address: media.address,
  image_url: media.hf_path,
  has_trash: media.has_trash || false,
  confidence: media.confidence || 0,
  detections: media.detections || [],
});

export interface MapResponse {
  items: MapItem[];
  video_detections: {
    [media_id: string]: VideoDetection[];
  };
  total: number;
}

export interface GridBounds {
  south: number;
  west: number;
  north: number;
  east: number;
}

export interface GridCell {
  id: string;
  bounds: GridBounds;
  count: number;
  density: number;
  confidence: number;
  dominantLabel: string | null;
  labelDistribution: Record<string, number>;
  items: MapItem[];
}

export interface MapFilters {
  min_lat?: number;
  max_lat?: number;
  min_lng?: number;
  max_lng?: number;
  has_trash?: boolean;
  min_confidence?: number;
}
