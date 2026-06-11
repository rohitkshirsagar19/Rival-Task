"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { ActivityPanel } from "@/components/activity/ActivityPanel";
import { AppShell } from "@/components/layout/AppShell";
import { PriorityFilter } from "@/components/tasks/PriorityFilter";
import { SortDropdown } from "@/components/tasks/SortDropdown";
import { StatusFilter } from "@/components/tasks/StatusFilter";
import { TaskList } from "@/components/tasks/TaskList";
import { TaskSearch } from "@/components/tasks/TaskSearch";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { useAuth } from "@/hooks/useAuth";
import { useTaskEvents } from "@/hooks/useTaskEvents";
import { useDeleteTaskMutation, useMarkTaskCompleteMutation, useTasks } from "@/hooks/useTasks";
import { ApiClientError } from "@/lib/api";
import type { RealtimeConnectionStatus, RealtimeTransport } from "@/types/realtime";
import type {
  Task,
  TaskFilters,
  TaskPriority,
  TaskSortBy,
  TaskSortOrder,
  TaskStatus,
} from "@/types/task";

function getTaskFilters(searchParams: URLSearchParams): TaskFilters {
  return {
    status: (searchParams.get("status") as TaskStatus | "") ?? "",
    priority: (searchParams.get("priority") as TaskPriority | "") ?? "",
    search: searchParams.get("search") ?? "",
    sortBy: (searchParams.get("sortBy") as TaskSortBy) ?? "created_at",
    sortOrder: (searchParams.get("sortOrder") as TaskSortOrder) ?? "desc",
    page: Number(searchParams.get("page") ?? 1),
    limit: Number(searchParams.get("limit") ?? 10),
  };
}

function getMutationErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiClientError) {
    return error.message;
  }

  return fallback;
}

function getRealtimeBadgeTone(status: RealtimeConnectionStatus) {
  if (status === "live") {
    return "success" as const;
  }

  if (status === "reconnecting" || status === "connecting") {
    return "warning" as const;
  }

  return "critical" as const;
}

function getRealtimeBadgeLabel(status: RealtimeConnectionStatus) {
  if (status === "live") {
    return "Live";
  }

  if (status === "reconnecting" || status === "connecting") {
    return "Reconnecting";
  }

  return "Offline";
}

function getRealtimeTransportLabel(transport: RealtimeTransport) {
  if (transport === "websocket") {
    return "WebSocket";
  }

  if (transport === "sse") {
    return "SSE fallback";
  }

  return "Disconnected";
}

export function TaskDashboard() {
  const { logout, status, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [actionError, setActionError] = useState<string | null>(null);

  const filters = useMemo(() => getTaskFilters(searchParams), [searchParams]);
  const tasksQuery = useTasks(filters);
  const completeTaskMutation = useMarkTaskCompleteMutation();
  const deleteTaskMutation = useDeleteTaskMutation();
  const realtime = useTaskEvents({ enabled: status === "authenticated" && Boolean(user) });

  const updateFilters = (patch: Partial<TaskFilters>) => {
    const next = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(patch)) {
      const paramKey =
        key === "sortBy"
          ? "sortBy"
          : key === "sortOrder"
            ? "sortOrder"
            : key;

      if (value === undefined || value === null || value === "") {
        next.delete(paramKey);
      } else {
        next.set(paramKey, String(value));
      }
    }

    if (
      patch.status !== undefined ||
      patch.priority !== undefined ||
      patch.search !== undefined ||
      patch.sortBy !== undefined ||
      patch.sortOrder !== undefined
    ) {
      next.set("page", "1");
    }

    const serialized = next.toString();
    router.replace(serialized ? `${pathname}?${serialized}` : pathname);
  };

  const handleCompleteTask = async (task: Task) => {
    setActionError(null);

    try {
      await completeTaskMutation.mutateAsync(task);
    } catch (error) {
      setActionError(
        getMutationErrorMessage(error, "Unable to mark this task as completed right now."),
      );
    }
  };

  const handleDeleteTask = async (task: Task) => {
    setActionError(null);

    try {
      await deleteTaskMutation.mutateAsync(task);
    } catch (error) {
      setActionError(getMutationErrorMessage(error, "Unable to delete this task right now."));
    }
  };

  if (status !== "authenticated" || !user) {
    return (
      <AppShell
        title="Delivery Console"
        subtitle="Monitor commitments, shape queues, and keep the next release moving."
      >
        <LoadingState label="Restoring your session" />
      </AppShell>
    );
  }

  const taskData = tasksQuery.data;
  const counts =
    taskData?.tasks.reduce(
      (acc, task) => {
        acc.total += 1;
        if (task.status === "pending") acc.pending += 1;
        if (task.status === "in_progress") acc.inProgress += 1;
        if (task.status === "completed") acc.completed += 1;
        if (task.priority === "high") acc.highPriority += 1;
        return acc;
      },
      { total: 0, pending: 0, inProgress: 0, completed: 0, highPriority: 0 },
    ) ?? { total: 0, pending: 0, inProgress: 0, completed: 0, highPriority: 0 };

  return (
    <AppShell
      title="Delivery Console"
      subtitle={`Signed in as ${user.name}. Filter, inspect, and manage the live task queue.`}
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.9fr)]">
        <section className="space-y-5">
          <Card className="p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-[color:var(--muted)]">Session</p>
                <h3 className="mt-1 text-lg font-semibold text-[color:var(--foreground)]">
                  {user.name}
                </h3>
                <p className="mt-1 text-sm text-[color:var(--muted)]">{user.email}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Badge tone="success">Authenticated</Badge>
                <Badge tone={getRealtimeBadgeTone(realtime.status)}>
                  {getRealtimeBadgeLabel(realtime.status)}
                </Badge>
                <Button variant="secondary" onClick={() => router.push("/tasks/new")}>
                  Create task
                </Button>
                <Button variant="secondary" onClick={() => void logout()}>
                  Log out
                </Button>
              </div>
            </div>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Visible", value: String(counts.total), tone: "neutral" as const },
              { label: "Pending", value: String(counts.pending), tone: "warning" as const },
              { label: "In Progress", value: String(counts.inProgress), tone: "neutral" as const },
              { label: "Completed", value: String(counts.completed), tone: "success" as const },
            ].map((card) => (
              <Card key={card.label} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-[color:var(--muted)]">{card.label}</p>
                    <p className="mt-3 text-3xl font-semibold text-[color:var(--foreground)]">
                      {card.value}
                    </p>
                  </div>
                  <Badge tone={card.tone}>{card.label}</Badge>
                </div>
              </Card>
            ))}
          </div>

          <Card className="p-5">
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-sm font-medium text-[color:var(--muted)]">Filters</p>
                <h3 className="mt-1 text-lg font-semibold text-[color:var(--foreground)]">
                  Task dashboard controls
                </h3>
              </div>

              <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_repeat(3,minmax(0,0.8fr))]">
                <TaskSearch
                  value={filters.search ?? ""}
                  onChange={(value) => updateFilters({ search: value })}
                />
                <StatusFilter
                  value={filters.status ?? ""}
                  onChange={(value) => updateFilters({ status: value })}
                />
                <PriorityFilter
                  value={filters.priority ?? ""}
                  onChange={(value) => updateFilters({ priority: value })}
                />
                <SortDropdown
                  sortBy={filters.sortBy ?? "created_at"}
                  sortOrder={filters.sortOrder ?? "desc"}
                  onSortByChange={(value) => updateFilters({ sortBy: value })}
                  onSortOrderChange={(value) => updateFilters({ sortOrder: value })}
                />
              </div>
            </div>
          </Card>

          {actionError ? (
            <div className="rounded-lg border border-[#f4c5bf] bg-[#fff5f3] px-4 py-3 text-sm text-[#8f2d18]">
              {actionError}
            </div>
          ) : null}

          <TaskList
            data={taskData}
            isLoading={tasksQuery.isLoading}
            isError={tasksQuery.isError}
            completingTaskId={completeTaskMutation.isPending ? completeTaskMutation.variables?.id : null}
            deletingTaskId={deleteTaskMutation.isPending ? deleteTaskMutation.variables?.id : null}
            onRetry={() => void tasksQuery.refetch()}
            onCreateTask={() => router.push("/tasks/new")}
            onCompleteTask={(task) => void handleCompleteTask(task)}
            onDeleteTask={(task) => void handleDeleteTask(task)}
            onPreviousPage={() =>
              updateFilters({ page: Math.max((filters.page ?? 1) - 1, 1) })
            }
            onNextPage={() => updateFilters({ page: (filters.page ?? 1) + 1 })}
          />
        </section>

        <section className="space-y-5">
          <Card className="p-5">
            <p className="text-sm font-medium text-[color:var(--muted)]">Realtime</p>
            <h3 className="mt-1 text-lg font-semibold text-[color:var(--foreground)]">
              Live connection state
            </h3>
            <div className="mt-5 space-y-3 text-sm text-[color:var(--muted)]">
              <div className="rounded-lg border border-[color:var(--border-soft)] bg-[color:var(--surface)] px-4 py-3">
                Status:{" "}
                <span className="font-medium text-[color:var(--foreground)]">
                  {getRealtimeBadgeLabel(realtime.status)}
                </span>
              </div>
              <div className="rounded-lg border border-[color:var(--border-soft)] bg-[color:var(--surface)] px-4 py-3">
                Transport:{" "}
                <span className="font-medium text-[color:var(--foreground)]">
                  {getRealtimeTransportLabel(realtime.transport)}
                </span>
              </div>
              <div className="rounded-lg border border-[color:var(--border-soft)] bg-[color:var(--surface)] px-4 py-3">
                High priority visible:{" "}
                <span className="font-medium text-[color:var(--foreground)]">
                  {counts.highPriority}
                </span>
              </div>
            </div>
          </Card>

          {tasksQuery.isError ? (
            <ErrorState
              title="Filter refresh failed"
              message="The latest dashboard query could not be completed."
              actionLabel="Retry query"
              onAction={() => void tasksQuery.refetch()}
            />
          ) : (
            <ActivityPanel />
          )}
        </section>
      </div>
    </AppShell>
  );
}
