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

export interface Detection {
  id?: string;
  label: string;
  confidence: number;
  bbox?: number[] | null;
  area_sqm?: number;
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

export interface MapResponse {
  items: MapItem[];
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
