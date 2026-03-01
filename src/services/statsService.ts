import { api } from "../api/axiosInstance";
import type {
  AIFleetEfficiency,
  AIFleetWorkerEfficiency,
  EnvironmentalFootprint,
  HotspotDensity,
  MeanTimeToProcess,
  ProcessingTime,
  StatsSummary,
  TemporalTrend,
  TrashComposition,
} from "../types/stats";

interface EnvironmentalFootprintApiResponse {
  total_area_sqm: number;
  total_detections: number;
}

interface AIFleetWorkerEfficiencyApiResponse {
  name: string;
  success_count: number;
  failure_count: number;
  tasks_processed_today: number;
  reliability_score: number;
}

interface AIFleetEfficiencyApiResponse {
  workers: AIFleetWorkerEfficiencyApiResponse[];
  fleet_reliability_score: number;
  total_successes: number;
  total_failures: number;
}

interface ProcessingTimeApiResponse {
  worker_name: string;
  avg_processing_seconds: number;
  task_count: number;
}

interface MeanTimeToProcessApiResponse {
  overall_avg_seconds: number;
  by_worker: ProcessingTimeApiResponse[];
}

interface HotspotDensityApiResponse {
  hotspot_count: number;
  high_confidence_media_count: number;
}

interface TemporalTrendsApiResponse {
  temporal_trends?: TemporalTrend[];
  trends?: TemporalTrend[];
}

interface StatsSummaryApiResponse {
  trash_composition: TrashComposition[];
  environmental_footprint: EnvironmentalFootprintApiResponse;
  ai_fleet_efficiency: AIFleetEfficiencyApiResponse;
  temporal_trends: TemporalTrend[];
  mean_time_to_process: MeanTimeToProcessApiResponse;
  hotspot_density: HotspotDensityApiResponse;
  days_window: number;
}

const mapAIFleetEfficiency = (
  data: AIFleetEfficiencyApiResponse,
): AIFleetEfficiency => {
  const workers: AIFleetWorkerEfficiency[] = data.workers.map((worker) => ({
    name: worker.name,
    successCount: worker.success_count,
    failureCount: worker.failure_count,
    tasksProcessedToday: worker.tasks_processed_today,
    reliabilityScore: worker.reliability_score,
  }));

  return {
    workers,
    fleetReliabilityScore: data.fleet_reliability_score,
    totalSuccesses: data.total_successes,
    totalFailures: data.total_failures,
  };
};

const mapMeanTimeToProcess = (
  data: MeanTimeToProcessApiResponse,
): MeanTimeToProcess => {
  const byWorker: ProcessingTime[] = data.by_worker.map((worker) => ({
    workerName: worker.worker_name,
    avgProcessingSeconds: worker.avg_processing_seconds,
    taskCount: worker.task_count,
  }));

  return {
    overallAvgSeconds: data.overall_avg_seconds,
    byWorker,
  };
};

export const statsService = {
  getTrashComposition: async () => {
    const { data } = await api.get<TrashComposition[]>("/stats/trash-composition");
    return data;
  },

  getEnvironmentalFootprint: async (): Promise<EnvironmentalFootprint> => {
    const { data } = await api.get<EnvironmentalFootprintApiResponse>(
      "/stats/environmental-footprint",
    );

    return {
      totalAreaSqm: data.total_area_sqm,
      totalDetections: data.total_detections,
    };
  },

  getAIFleetEfficiency: async (): Promise<AIFleetEfficiency> => {
    const { data } = await api.get<AIFleetEfficiencyApiResponse>(
      "/stats/ai-fleet-efficiency",
    );

    return mapAIFleetEfficiency(data);
  },

  getTemporalTrends: async (days: number): Promise<TemporalTrend[]> => {
    const { data } = await api.get<TemporalTrend[] | TemporalTrendsApiResponse>("/stats/temporal-trends", {
      params: { days },
    });

    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray(data.temporal_trends)) {
      return data.temporal_trends;
    }

    if (Array.isArray(data.trends)) {
      return data.trends;
    }

    return [];
  },

  getMeanTimeToProcess: async (): Promise<MeanTimeToProcess> => {
    const { data } = await api.get<MeanTimeToProcessApiResponse>(
      "/stats/mean-time-to-process",
    );

    return mapMeanTimeToProcess(data);
  },

  getHotspotDensity: async (): Promise<HotspotDensity> => {
    const { data } = await api.get<HotspotDensityApiResponse>(
      "/stats/hotspot-density",
    );

    return {
      hotspotCount: data.hotspot_count,
      highConfidenceMediaCount: data.high_confidence_media_count,
    };
  },

  getStatsSummary: async (days = 7): Promise<StatsSummary> => {
    const { data } = await api.get<StatsSummaryApiResponse>("/stats/summary", {
      params: { days },
    });

    return {
      trashComposition: data.trash_composition,
      environmentalFootprint: {
        totalAreaSqm: data.environmental_footprint.total_area_sqm,
        totalDetections: data.environmental_footprint.total_detections,
      },
      aiFleetEfficiency: mapAIFleetEfficiency(data.ai_fleet_efficiency),
      temporalTrends: data.temporal_trends,
      meanTimeToProcess: mapMeanTimeToProcess(data.mean_time_to_process),
      hotspotDensity: {
        hotspotCount: data.hotspot_density.hotspot_count,
        highConfidenceMediaCount: data.hotspot_density.high_confidence_media_count,
      },
      daysWindow: data.days_window,
    };
  },
};
