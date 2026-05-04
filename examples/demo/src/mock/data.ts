import type { Task, User } from "./types.ts";

export const USERS: User[] = [
  { id: 1, name: "Alice", role: "Developer" },
  { id: 2, name: "Bob", role: "Designer" },
  { id: 3, name: "Charlie", role: "PM" },
];

export const TASKS: Task[] = [
  {
    id: 1,
    title: "Design landing page",
    priority: "high",
    status: "todo",
    assignee: "Alice",
    createdAt: "2026-04-01",
  },
  {
    id: 2,
    title: "Implement auth flow",
    priority: "urgent",
    status: "in-progress",
    assignee: "Bob",
    createdAt: "2026-04-02",
  },
  {
    id: 3,
    title: "Write API docs",
    priority: "low",
    status: "done",
    assignee: "Charlie",
    createdAt: "2026-04-03",
  },
  {
    id: 4,
    title: "Fix login bug",
    priority: "urgent",
    status: "in-progress",
    assignee: "Alice",
    createdAt: "2026-04-04",
  },
  {
    id: 5,
    title: "Add dark mode",
    priority: "medium",
    status: "todo",
    assignee: "Bob",
    createdAt: "2026-04-05",
  },
  {
    id: 6,
    title: "Performance audit",
    priority: "medium",
    status: "todo",
    assignee: "Charlie",
    createdAt: "2026-04-06",
  },
  {
    id: 7,
    title: "Setup CI/CD",
    priority: "high",
    status: "done",
    assignee: "Alice",
    createdAt: "2026-04-07",
  },
  {
    id: 8,
    title: "Database migration",
    priority: "high",
    status: "in-progress",
    assignee: "Bob",
    createdAt: "2026-04-08",
  },
];
