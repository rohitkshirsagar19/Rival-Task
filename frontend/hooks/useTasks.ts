"use client";

import { useQuery } from "@tanstack/react-query";

import { listTasks } from "@/lib/tasks-api";
import type { TaskFilters } from "@/types/task";

export function useTasks(filters: TaskFilters) {
  return useQuery({
    queryKey: ["tasks", filters],
    queryFn: () => listTasks(filters),
    staleTime: 15_000,
  });
}
