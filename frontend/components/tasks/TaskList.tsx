import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { Pagination } from "@/components/ui/Pagination";
import { TaskCard } from "@/components/tasks/TaskCard";
import { TaskTable } from "@/components/tasks/TaskTable";
import type { Task, TaskListResponse } from "@/types/task";

type TaskListProps = {
  data?: TaskListResponse;
  isLoading: boolean;
  isError: boolean;
  completingTaskId?: number | null;
  deletingTaskId?: number | null;
  onRetry: () => void;
  onCreateTask: () => void;
  onCompleteTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
};

export function TaskList({
  data,
  isLoading,
  isError,
  completingTaskId,
  deletingTaskId,
  onRetry,
  onCreateTask,
  onCompleteTask,
  onDeleteTask,
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
        actionLabel="Create task"
        onAction={onCreateTask}
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-[color:var(--border-soft)] bg-[color:var(--surface-elevated)]">
      <div className="grid gap-3 p-4 lg:hidden">
        {data.tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            isCompleting={completingTaskId === task.id}
            isDeleting={deletingTaskId === task.id}
            onComplete={onCompleteTask}
            onDelete={onDeleteTask}
          />
        ))}
      </div>

      <TaskTable
        tasks={data.tasks}
        completingTaskId={completingTaskId}
        deletingTaskId={deletingTaskId}
        onComplete={onCompleteTask}
        onDelete={onDeleteTask}
      />

      <Pagination meta={data.meta} onPrevious={onPreviousPage} onNext={onNextPage} />
    </div>
  );
}
