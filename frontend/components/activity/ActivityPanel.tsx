"use client";

import { useQuery } from "@tanstack/react-query";

import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { ACTIVITY_QUERY_KEY } from "@/hooks/useTasks";
import { apiFetch } from "@/lib/api";
import type { ActivityListResponse, ActivityLog } from "@/types/activity";

function formatAction(action: string) {
  return action
    .replace(/^task\./, "")
    .split(".")
    .join(" ")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getTaskTitle(activity: ActivityLog) {
  const source = activity.new_value ?? activity.old_value ?? null;
  const title = source?.title;

  return typeof title === "string" && title.trim() ? title : `Task #${activity.task_id}`;
}

function getActivitySummary(activity: ActivityLog) {
  if (activity.action === "task.completed") {
    return "Marked as completed";
  }

  if (activity.action === "task.deleted") {
    return "Removed from the active queue";
  }

  if (activity.action === "task.created") {
    return "Added to the active queue";
  }

  return "Updated task details";
}

export function ActivityPanel() {
  const activityQuery = useQuery({
    queryKey: ACTIVITY_QUERY_KEY,
    queryFn: () => apiFetch<ActivityListResponse>("/api/v1/activity"),
    staleTime: 15_000,
  });

  if (activityQuery.isLoading) {
    return <LoadingState label="Loading recent activity" />;
  }

  if (activityQuery.isError) {
    return (
      <ErrorState
        title="Activity is unavailable"
        message="The recent task timeline could not be loaded."
        actionLabel="Retry"
        onAction={() => void activityQuery.refetch()}
      />
    );
  }

  const activities = activityQuery.data?.activities ?? [];

  if (activities.length === 0) {
    return (
      <EmptyState
        title="No activity yet"
        message="Task changes will appear here as soon as work starts moving through the queue."
        actionLabel="Refresh activity"
        onAction={() => void activityQuery.refetch()}
      />
    );
  }

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[color:var(--muted)]">Recent activity</p>
          <h3 className="mt-1 text-lg font-semibold text-[color:var(--foreground)]">
            Task timeline
          </h3>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {activities.slice(0, 8).map((activity) => (
          <div
            key={activity.id}
            className="rounded-lg border border-[color:var(--border-soft)] bg-[color:var(--surface)] px-4 py-3"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-medium text-[color:var(--foreground)]">
                  {getTaskTitle(activity)}
                </p>
                <p className="mt-1 text-sm text-[color:var(--muted)]">
                  {getActivitySummary(activity)}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-xs font-medium uppercase tracking-[0.08em] text-[color:var(--muted)]">
                  {formatAction(activity.action)}
                </p>
                <p className="mt-1 text-xs text-[color:var(--muted)]">
                  {new Intl.DateTimeFormat("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  }).format(new Date(activity.created_at))}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
