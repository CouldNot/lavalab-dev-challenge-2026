export type Tag = { id: string; name: string; color: string };

export type ActivityLog = {
  id: string;
  employeeName: string;
  activityType: string;
  startedAt: string;
  endedAt: string;
  fieldName: string;
  transcript: string;
  summary: string;
  responseAccuracy: number;
  audioUrl: string | null;
  waveform: number[];
  latitude: number;
  longitude: number;
  tags: Tag[];
};

export type DashboardMetrics = {
  todaysRecordings: number;
  newRecordings: number;
  activeWorkers: number;
  responseAccuracy: number;
};

export type DashboardFilters = {
  q?: string;
  sort?: "date-desc" | "date-asc" | "employee" | "activity";
  range?: "month" | "all";
  field?: string;
  activity?: string;
  log?: string;
};

export type DashboardSnapshot = {
  farmName: string;
  role: string;
  metrics: DashboardMetrics;
  logs: ActivityLog[];
  fields: string[];
  activities: string[];
  filters: DashboardFilters;
  isPersistent: boolean;
};
