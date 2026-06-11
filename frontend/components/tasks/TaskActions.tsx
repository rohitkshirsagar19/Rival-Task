"use client";

import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { Task } from "@/types/task";

type TaskActionsProps = {
  task: Task;
  isCompleting?: boolean;
  isDeleting?: boolean;
  onComplete?: (task: Task) => void;
  onDelete?: (task: Task) => void;
};

export function TaskActions({
  task,
  isCompleting = false,
  isDeleting = false,
  onComplete,
  onDelete,
}: TaskActionsProps) {
  const router = useRouter();

  const dueLabel = task.due_date
    ? new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
      }).format(new Date(task.due_date))
    : "No due date";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge
        tone={
          task.priority === "high"
            ? "critical"
            : task.priority === "medium"
              ? "warning"
              : "success"
        }
      >
        {task.priority}
      </Badge>
      <Badge tone={task.status === "completed" ? "success" : "neutral"}>
        {task.status.replace("_", " ")}
      </Badge>
      <Button variant="ghost" className="h-8 px-2.5 text-xs" disabled>
        {dueLabel}
      </Button>
      <Button
        variant="secondary"
        className="h-8 px-3 text-xs"
        onClick={() => router.push(`/tasks/${task.id}/edit`)}
      >
        Edit
      </Button>
      {task.status !== "completed" ? (
        <Button
          className="h-8 px-3 text-xs"
          disabled={isCompleting || isDeleting}
          onClick={() => onComplete?.(task)}
        >
          {isCompleting ? "Completing..." : "Complete"}
        </Button>
      ) : null}
      <Button
        variant="ghost"
        className="h-8 px-3 text-xs text-[#a12622] hover:bg-[#fff1ef] hover:text-[#8f2d18]"
        disabled={isDeleting || isCompleting}
        onClick={() => {
          if (window.confirm(`Delete \"${task.title}\"?`)) {
            onDelete?.(task);
          }
        }}
      >
        {isDeleting ? "Deleting..." : "Delete"}
      </Button>
    </div>
  );
}
