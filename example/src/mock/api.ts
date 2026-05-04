import type { AnalyticsData, Task } from "./types.ts";
import { TASKS } from "./data.ts";

export function fetchAnalytics(): Promise<AnalyticsData> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        pageViews: 2847,
        activeUsers: 142,
        requests: 12563,
        latency: 234,
        history: Array.from({ length: 24 }, (_, i) => ({
          time: `${i}:00`,
          value: Math.floor(Math.random() * 200 + 100),
        })),
      });
    }, 100);
  });
}

export function fetchTasks(): Promise<Task[]> {
  return Promise.resolve([...TASKS]);
}

export function updateTask(task: Task): Promise<Task> {
  return Promise.resolve(task);
}
