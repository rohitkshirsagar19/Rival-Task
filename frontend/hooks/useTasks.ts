"use client";

import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query";

import {
  createTask,
  deleteTask,
  getTask,
  listTasks,
  markTaskComplete,
  updateTask,
} from "@/lib/tasks-api";
import type { TaskRealtimeEvent } from "@/types/realtime";
import type {
  Task,
  TaskCreateInput,
  TaskFilters,
  TaskListResponse,
  TaskPriority,
  TaskSortBy,
  TaskSortOrder,
  TaskUpdateInput,
} from "@/types/task";

export const TASKS_QUERY_KEY = ["tasks"] as const;
export const ACTIVITY_QUERY_KEY = ["activity"] as const;

export function taskDetailQueryKey(taskId: number) {
  return ["task", taskId] as const;
}

export function getFiltersFromQueryKey(queryKey: QueryKey): TaskFilters {
  const maybeFilters = queryKey[1];

  if (maybeFilters && typeof maybeFilters === "object" && !Array.isArray(maybeFilters)) {
    return maybeFilters as TaskFilters;
  }

  return {};
}

function comparePriority(left: TaskPriority, right: TaskPriority) {
  const order: Record<TaskPriority, number> = {
    high: 0,
    medium: 1,
    low: 2,
  };

  return order[left] - order[right];
}

function compareDates(left: string | null, right: string | null) {
  if (!left && !right) {
    return 0;
  }
  if (!left) {
    return 1;
  }
  if (!right) {
    return -1;
  }

  return new Date(left).getTime() - new Date(right).getTime();
}

export function sortTasks(tasks: Task[], filters: TaskFilters = {}) {
  const sortBy: TaskSortBy = filters.sortBy ?? "created_at";
  const sortOrder: TaskSortOrder = filters.sortOrder ?? "desc";
  const direction = sortOrder === "asc" ? 1 : -1;

  return [...tasks].sort((left, right) => {
    let comparison = 0;

    if (sortBy === "priority") {
      comparison = comparePriority(left.priority, right.priority);
    } else if (sortBy === "due_date") {
      comparison = compareDates(left.due_date, right.due_date);
    } else {
      comparison = compareDates(left.created_at, right.created_at);
    }

    if (comparison === 0) {
      comparison = compareDates(left.updated_at, right.updated_at);
    }

    return comparison * direction;
  });
}

export function matchesTaskFilters(task: Task, filters: TaskFilters = {}) {
  if (filters.status && task.status !== filters.status) {
    return false;
  }

  if (filters.priority && task.priority !== filters.priority) {
    return false;
  }

  if (filters.search) {
    const search = filters.search.trim().toLowerCase();
    if (search && !task.title.toLowerCase().includes(search)) {
      return false;
    }
  }

  return true;
}

function withUpdatedMeta(response: TaskListResponse, nextTotal: number): TaskListResponse {
  const total = Math.max(nextTotal, 0);
  const totalPages = total === 0 ? 0 : Math.ceil(total / response.meta.limit);

  return {
    ...response,
    meta: {
      ...response.meta,
      total,
      total_pages: totalPages,
    },
  };
}

export function removeTaskFromResponse(response: TaskListResponse, taskId: number): TaskListResponse {
  const nextTasks = response.tasks.filter((task) => task.id !== taskId);

  if (nextTasks.length === response.tasks.length) {
    return response;
  }

  return withUpdatedMeta(
    {
      ...response,
      tasks: nextTasks,
    },
    response.meta.total - 1,
  );
}

export function upsertTaskInResponse(
  response: TaskListResponse,
  filters: TaskFilters,
  nextTask: Task,
): TaskListResponse {
  const matches = matchesTaskFilters(nextTask, filters);
  const index = response.tasks.findIndex((task) => task.id === nextTask.id);

  if (index === -1) {
    if (!matches) {
      return response;
    }

    const tasks = sortTasks([nextTask, ...response.tasks], filters);
    const total = response.meta.total + 1;
    return {
      tasks,
      meta: {
        ...response.meta,
        total,
        total_pages: total === 0 ? 0 : Math.ceil(total / response.meta.limit),
      },
    };
  }

  if (!matches) {
    return removeTaskFromResponse(response, nextTask.id);
  }

  const tasks = [...response.tasks];
  tasks[index] = nextTask;

  return {
    ...response,
    tasks: sortTasks(tasks, filters),
  };
}

function restoreTaskListSnapshots(
  queryClient: QueryClient,
  snapshots: Array<[QueryKey, TaskListResponse | undefined]>,
) {
  for (const [queryKey, data] of snapshots) {
    queryClient.setQueryData(queryKey, data);
  }
}

export function applyRealtimeTaskEvent(queryClient: QueryClient, event: TaskRealtimeEvent) {
  if (event.type === "task.deleted") {
    const listSnapshots = queryClient.getQueriesData<TaskListResponse>({
      queryKey: TASKS_QUERY_KEY,
    });

    for (const [queryKey, data] of listSnapshots) {
      if (!data) {
        continue;
      }

      queryClient.setQueryData(queryKey, removeTaskFromResponse(data, event.task_id));
    }

    queryClient.removeQueries({ queryKey: taskDetailQueryKey(event.task_id), exact: true });
    return;
  }

  const nextTask = event.payload;
  const listSnapshots = queryClient.getQueriesData<TaskListResponse>({
    queryKey: TASKS_QUERY_KEY,
  });

  for (const [queryKey, data] of listSnapshots) {
    if (!data) {
      continue;
    }

    queryClient.setQueryData(
      queryKey,
      upsertTaskInResponse(data, getFiltersFromQueryKey(queryKey), nextTask),
    );
  }

  queryClient.setQueryData(taskDetailQueryKey(nextTask.id), nextTask);
}

export function useTasks(filters: TaskFilters) {
  return useQuery({
    queryKey: [...TASKS_QUERY_KEY, filters],
    queryFn: () => listTasks(filters),
    staleTime: 15_000,
  });
}

export function useTask(taskId?: number) {
  return useQuery({
    queryKey: taskDetailQueryKey(taskId ?? 0),
    queryFn: () => getTask(taskId as number),
    enabled: typeof taskId === "number" && Number.isFinite(taskId) && taskId > 0,
    staleTime: 15_000,
  });
}

export function useCreateTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TaskCreateInput) => createTask(payload),
    onSuccess: (task) => {
      queryClient.setQueryData(taskDetailQueryKey(task.id), task);
      return queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
    },
  });
}

export function useUpdateTaskMutation(taskId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TaskUpdateInput) => updateTask(taskId, payload),
    onSuccess: (task) => {
      queryClient.setQueryData(taskDetailQueryKey(task.id), task);
      void queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
    },
  });
}

export function useMarkTaskCompleteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (task: Task) => markTaskComplete(task.id),
    onMutate: async (task) => {
      await queryClient.cancelQueries({ queryKey: TASKS_QUERY_KEY });
      await queryClient.cancelQueries({ queryKey: taskDetailQueryKey(task.id) });

      const listSnapshots = queryClient.getQueriesData<TaskListResponse>({
        queryKey: TASKS_QUERY_KEY,
      });
      const detailSnapshot = queryClient.getQueryData<Task>(taskDetailQueryKey(task.id));
      const optimisticTask: Task = {
        ...task,
        status: "completed",
        completed_at: task.completed_at ?? new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      for (const [queryKey, data] of listSnapshots) {
        if (!data) {
          continue;
        }

        queryClient.setQueryData(
          queryKey,
          upsertTaskInResponse(data, getFiltersFromQueryKey(queryKey), optimisticTask),
        );
      }

      queryClient.setQueryData(taskDetailQueryKey(task.id), optimisticTask);

      return {
        listSnapshots,
        detailSnapshot,
      };
    },
    onError: (_error, task, context) => {
      if (context) {
        restoreTaskListSnapshots(queryClient, context.listSnapshots);
        queryClient.setQueryData(taskDetailQueryKey(task.id), context.detailSnapshot);
      }
    },
    onSuccess: (task) => {
      queryClient.setQueryData(taskDetailQueryKey(task.id), task);
    },
    onSettled: (_data, _error, task) => {
      void queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: taskDetailQueryKey(task.id) });
      void queryClient.invalidateQueries({ queryKey: ACTIVITY_QUERY_KEY });
    },
  });
}

export function useDeleteTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (task: Task) => deleteTask(task.id),
    onMutate: async (task) => {
      await queryClient.cancelQueries({ queryKey: TASKS_QUERY_KEY });
      await queryClient.cancelQueries({ queryKey: taskDetailQueryKey(task.id) });

      const listSnapshots = queryClient.getQueriesData<TaskListResponse>({
        queryKey: TASKS_QUERY_KEY,
      });
      const detailSnapshot = queryClient.getQueryData<Task>(taskDetailQueryKey(task.id));

      for (const [queryKey, data] of listSnapshots) {
        if (!data) {
          continue;
        }

        queryClient.setQueryData(queryKey, removeTaskFromResponse(data, task.id));
      }

      queryClient.removeQueries({ queryKey: taskDetailQueryKey(task.id), exact: true });

      return {
        listSnapshots,
        detailSnapshot,
      };
    },
    onError: (_error, task, context) => {
      if (context) {
        restoreTaskListSnapshots(queryClient, context.listSnapshots);
        queryClient.setQueryData(taskDetailQueryKey(task.id), context.detailSnapshot);
      }
    },
    onSettled: (_data, _error, task) => {
      void queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: taskDetailQueryKey(task.id) });
      void queryClient.invalidateQueries({ queryKey: ACTIVITY_QUERY_KEY });
    },
  });
}
