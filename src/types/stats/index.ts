export interface TrashComposition {
  label: string;
  count: number;
  percentage: number;
}

export interface EnvironmentalImpact {
  totalAreaSqm: number;
  totalDetections: number;
  highConfidenceZones: number;
}

export interface EnvironmentalFootprint {
  totalAreaSqm: number;
  totalDetections: number;
}

export interface WorkerPerformance {
  workerName: string;
  successCount: number;
  failureCount: number;
  reliabilityScore: number; // 0 to 1
  avgProcessingTimeSec: number;
}

export interface AIFleetWorkerEfficiency {
  name: string;
  successCount: number;
  failureCount: number;
  tasksProcessedToday: number;
  reliabilityScore: number;
}

export interface AIFleetEfficiency {
  workers: AIFleetWorkerEfficiency[];
  fleetReliabilityScore: number;
  totalSuccesses: number;
  totalFailures: number;
}

export interface DetectionTrend {
  date: string; // ISO format
  count: number;
}

export interface TemporalTrend {
  date: string;
  count: number;
}

export interface ProcessingTime {
  workerName: string;
  avgProcessingSeconds: number;
  taskCount: number;
}

export interface MeanTimeToProcess {
  overallAvgSeconds: number;
  byWorker: ProcessingTime[];
}

export interface HotspotDensity {
  hotspotCount: number;
  highConfidenceMediaCount: number;
}

export interface StatsSummary {
  trashComposition: TrashComposition[];
  environmentalFootprint: EnvironmentalFootprint;
  aiFleetEfficiency: AIFleetEfficiency;
  temporalTrends: TemporalTrend[];
  meanTimeToProcess: MeanTimeToProcess;
  hotspotDensity: HotspotDensity;
  daysWindow: number;
}

export interface StatsResponse {
  impact: EnvironmentalImpact;
  composition: TrashComposition[];
  fleetEfficiency: WorkerPerformance[];
  trends: DetectionTrend[];
  systemMetrics: {
    meanTimeToProcessSec: number;
    duplicateBlockedCount: number;
  };
}

export interface FunFact {
  title: string;
  fact: string;
  icon: string;
}
