export interface Task {
  id: number;
  title: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "todo" | "in-progress" | "done";
  assignee: string;
  createdAt: string;
}

export interface User {
  id: number;
  name: string;
  role: string;
}

export interface AnalyticsData {
  pageViews: number;
  activeUsers: number;
  requests: number;
  latency: number;
  history: Array<{ time: string; value: number }>;
}
