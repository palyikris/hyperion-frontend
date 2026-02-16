export interface SystemHealthResponse {
  status: string;
  environment: string;
  uptime?: number | null;
  server_load?: number[] | null;
}

export interface UXResponse {
  active_now: number;
  active_trend: number[];
  avg_response_time: number;
  daily_activity: number[];
}

export interface NodeInfo {
  status: string;
  name: string;
}

export interface AIWorkersResponse {
  total_active_fleet: number;
  cluster_status: string;
  nodes: NodeInfo[];
}
