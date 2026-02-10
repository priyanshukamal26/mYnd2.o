export type EnergyLevel = 'high' | 'medium' | 'low';
export type TaskStatus = 'created' | 'scheduled' | 'in_progress' | 'completed' | 'postponed' | 'archived';
export type PostponeReason = 'took_longer' | 'interrupted' | 'not_in_mood' | 'forgot' | 'other';
export type TaskCategory = 'essay' | 'problem_set' | 'reading' | 'project' | 'lecture' | 'lab' | 'study' | 'other';

export interface Task {
  id: string;
  title: string;
  category: TaskCategory;
  estimatedMinutes: number;
  actualMinutes?: number;
  deadline: string; // ISO date
  energyLevel: EnergyLevel;
  status: TaskStatus;
  scheduledTime?: string; // HH:MM
  createdAt: string;
  completedAt?: string;
  postponeCount: number;
  postponeReasons: PostponeReason[];
  score?: number;
}

export interface LearningData {
  category: TaskCategory;
  totalEstimated: number;
  totalActual: number;
  completedCount: number;
  accuracy: number; // 0-1
  adjustmentFactor: number; // multiplier for future estimates
}

export interface DailyPlan {
  date: string;
  scheduledTasks: Task[];
  overflowTasks: Task[];
  totalScheduledMinutes: number;
  availableMinutes: number;
}

export interface UserSettings {
  workStartHour: number; // 0-23
  workEndHour: number; // 0-23
  lunchStartHour: number;
  lunchDurationMinutes: number;
}

export const CATEGORY_LABELS: Record<TaskCategory, string> = {
  essay: '📝 Essay',
  problem_set: '🧮 Problem Set',
  reading: '📖 Reading',
  project: '🔨 Project',
  lecture: '🎓 Lecture',
  lab: '🔬 Lab',
  study: '📚 Study',
  other: '📋 Other',
};

export const CATEGORY_EMOJIS: Record<TaskCategory, string> = {
  essay: '📝',
  problem_set: '🧮',
  reading: '📖',
  project: '🔨',
  lecture: '🎓',
  lab: '🔬',
  study: '📚',
  other: '📋',
};
