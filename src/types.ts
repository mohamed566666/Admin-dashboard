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

export interface Manager {
  id: string;
  username: string;
  password?: string; // For display only, don't store plain text
  department: string;
  role: 'manager' | 'supervisor' | 'admin';
  createdAt: string;
  status: 'active' | 'inactive';
}

export interface Department {
  id: string;
  name: string;
  description: string;
}