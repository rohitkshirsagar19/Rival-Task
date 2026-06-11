import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { Pagination } from "@/components/ui/Pagination";
import { TaskCard } from "@/components/tasks/TaskCard";
import { TaskTable } from "@/components/tasks/TaskTable";
import type { TaskListResponse } from "@/types/task";

type TaskListProps = {
  data?: TaskListResponse;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
};

export function TaskList({
  data,
  isLoading,
  isError,
  onRetry,
  onPreviousPage,
  onNextPage,
}: TaskListProps) {
  if (isLoading) {
    return <LoadingState label="Loading task dashboard" />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Task data is unavailable"
        message="The dashboard could not load the latest tasks."
        actionLabel="Retry"
        onAction={onRetry}
      />
    );
  }

  if (!data || data.tasks.length === 0) {
    return (
      <EmptyState
        title="No tasks match these filters"
        message="Adjust the current filters or create the first task in this queue."
        actionLabel="Refresh list"
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-[color:var(--border-soft)] bg-[color:var(--surface-elevated)]">
      <div className="grid gap-3 p-4 lg:hidden">
        {data.tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>

      <TaskTable tasks={data.tasks} />

      <Pagination
        meta={data.meta}
        onPrevious={onPreviousPage}
        onNext={onNextPage}
      />
    </div>
  );
}
