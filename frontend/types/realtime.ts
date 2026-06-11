import type { Task } from "@/types/task";

export type RealtimeEventType =
  | "task.created"
  | "task.updated"
  | "task.completed"
  | "task.deleted";

export type TaskRealtimeEvent = {
  type: RealtimeEventType;
  task_id: number;
  user_id: number;
  payload: Task;
  timestamp: string;
};

export type RealtimeConnectionStatus =
  | "connecting"
  | "live"
  | "reconnecting"
  | "offline";

export type RealtimeTransport = "websocket" | "sse" | "none";
