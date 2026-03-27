export interface User {
  id: string;
  name: string;
  windowsId: string;
  enrollmentDate: string;
  status: 'active' | 'inactive';
  embeddingVector?: number[];
}

export interface ThresholdConfig {
  similarityThreshold: number;
  counterThreshold: number;
  detectionInterval: number;
  noFacePenalty: number;
  mismatchPenalty: number;
  embeddingDimension: number;
}

export interface SessionLog {
  id: string;
  userId: string;
  userName: string;
  startTime: string;
  endTime?: string;
  status: 'completed' | 'locked' | 'active';
  successRate: number;
}

export interface AnalyticsData {
  date: string;
  verifications: number;
  successes: number;
  failures: number;
}
