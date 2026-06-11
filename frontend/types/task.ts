import type { PaginationMeta } from "@/types/api";

export type TaskStatus = "pending" | "in_progress" | "completed";
export type TaskPriority = "low" | "medium" | "high";
export type TaskSortBy = "due_date" | "priority" | "created_at";
export type TaskSortOrder = "asc" | "desc";

export type Task = {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type TaskListResponse = {
  tasks: Task[];
  meta: PaginationMeta;
};

export type TaskFilters = {
  status?: TaskStatus | "";
  priority?: TaskPriority | "";
  search?: string;
  sortBy?: TaskSortBy;
  sortOrder?: TaskSortOrder;
  page?: number;
  limit?: number;
};

export type TaskCreateInput = {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  due_date?: string | null;
};

export type TaskUpdateInput = Partial<TaskCreateInput>;
