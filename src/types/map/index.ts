export interface MapMediaLog {
  action: string;
  message: string;
  worker_name?: string;
  timestamp: string;
}


export interface MapItem {
  id: string;
  filename?: string;
  status: string;
  worker_name?: string;
  lat: number;
  lng: number;
  altitude?: number;
  address?: string;
  image_url?: string;
  history: MapMediaLog[];
}

export interface MapResponse {
  items: MapItem[];
  total: number;
}


export interface MapFilters {
  min_lat?: number;
  max_lat?: number;
  min_lng?: number;
  max_lng?: number;
  has_trash?: boolean;
  min_confidence?: number;
}
