"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { PriorityFilter } from "@/components/tasks/PriorityFilter";
import { SortDropdown } from "@/components/tasks/SortDropdown";
import { StatusFilter } from "@/components/tasks/StatusFilter";
import { TaskList } from "@/components/tasks/TaskList";
import { TaskSearch } from "@/components/tasks/TaskSearch";
import { useAuth } from "@/hooks/useAuth";
import { useTasks } from "@/hooks/useTasks";
import type {
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

export function TaskDashboard() {
  const { logout, status, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = useMemo(() => getTaskFilters(searchParams), [searchParams]);
  const tasksQuery = useTasks(filters);

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
              <div className="flex items-center gap-3">
                <Badge tone="success">Authenticated</Badge>
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

          <TaskList
            data={taskData}
            isLoading={tasksQuery.isLoading}
            isError={tasksQuery.isError}
            onRetry={() => void tasksQuery.refetch()}
            onPreviousPage={() =>
              updateFilters({ page: Math.max((filters.page ?? 1) - 1, 1) })
            }
            onNextPage={() => updateFilters({ page: (filters.page ?? 1) + 1 })}
          />
        </section>

        <section className="space-y-5">
          <Card className="p-5">
            <p className="text-sm font-medium text-[color:var(--muted)]">Applied view</p>
            <h3 className="mt-1 text-lg font-semibold text-[color:var(--foreground)]">
              Current query state
            </h3>
            <div className="mt-5 space-y-3 text-sm text-[color:var(--muted)]">
              <div className="rounded-lg border border-[color:var(--border-soft)] bg-[color:var(--surface)] px-4 py-3">
                Status:{" "}
                <span className="font-medium text-[color:var(--foreground)]">
                  {filters.status || "All"}
                </span>
              </div>
              <div className="rounded-lg border border-[color:var(--border-soft)] bg-[color:var(--surface)] px-4 py-3">
                Priority:{" "}
                <span className="font-medium text-[color:var(--foreground)]">
                  {filters.priority || "All"}
                </span>
              </div>
              <div className="rounded-lg border border-[color:var(--border-soft)] bg-[color:var(--surface)] px-4 py-3">
                Sort:{" "}
                <span className="font-medium text-[color:var(--foreground)]">
                  {filters.sortBy} / {filters.sortOrder}
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
            <Card className="p-5">
              <p className="text-sm font-medium text-[color:var(--muted)]">Realtime note</p>
              <h3 className="mt-1 text-lg font-semibold text-[color:var(--foreground)]">
                Data source ready
              </h3>
              <p className="mt-3 text-sm text-[color:var(--muted)]">
                The dashboard is now reading from the protected task API through TanStack Query and URL-backed filters.
              </p>
            </Card>
          )}
        </section>
      </div>
    </AppShell>
  );
}
