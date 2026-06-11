import { apiFetch } from "@/lib/api";
import { taskFiltersSchema } from "@/lib/task-validators";
import type {
  Task,
  TaskCreateInput,
  TaskFilters,
  TaskListResponse,
  TaskUpdateInput,
} from "@/types/task";

function buildTaskQuery(filters: TaskFilters = {}) {
  const parsed = taskFiltersSchema.parse(filters);
  const query = new URLSearchParams();

  if (parsed.status) {
    query.set("status", parsed.status);
  }
  if (parsed.priority) {
    query.set("priority", parsed.priority);
  }
  if (parsed.search) {
    query.set("search", parsed.search);
  }
  if (parsed.sortBy) {
    query.set("sortBy", parsed.sortBy);
  }
  if (parsed.sortOrder) {
    query.set("sortOrder", parsed.sortOrder);
  }
  if (parsed.page) {
    query.set("page", String(parsed.page));
  }
  if (parsed.limit) {
    query.set("limit", String(parsed.limit));
  }

  const serialized = query.toString();
  return serialized ? `?${serialized}` : "";
}

export function listTasks(filters: TaskFilters = {}) {
  return apiFetch<TaskListResponse>(`/api/v1/tasks${buildTaskQuery(filters)}`);
}

export function getTask(taskId: number) {
  return apiFetch<Task>(`/api/v1/tasks/${taskId}`);
}

export function createTask(payload: TaskCreateInput) {
  return apiFetch<Task>("/api/v1/tasks", {
    method: "POST",
    body: payload,
  });
}

export function updateTask(taskId: number, payload: TaskUpdateInput) {
  return apiFetch<Task>(`/api/v1/tasks/${taskId}`, {
    method: "PATCH",
    body: payload,
  });
}

export function deleteTask(taskId: number) {
  return apiFetch<void>(`/api/v1/tasks/${taskId}`, {
    method: "DELETE",
  });
}

export function markTaskComplete(taskId: number) {
  return updateTask(taskId, { status: "completed" });
}
