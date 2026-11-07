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
  // The parent media ID remains the target for logs and media deletion.
  id: string;
  video_detection_id?: string;
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

export const convertVideoDetectionToMapItem = (
  detection: VideoDetection,
): MapItem => ({
  ...convertMediaResponseToMapItem(detection.media),
  id: detection.media_id,
  video_detection_id: detection.id,
  filename: detection.media.initial_metadata?.filename as string | undefined,
  lat: Number(detection.lat),
  lng: Number(detection.lng),
  altitude: detection.altitude,
  address: detection.address ?? undefined,
  image_url: detection.image_url,
  has_trash: true,
  confidence: detection.confidence * 100,
  detections: [detection],
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
  density: number; // Trash-positive count relative to the densest visible cell, in [0, 1].
  confidence: number; // Average confidence in percent, in [0, 100].
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
