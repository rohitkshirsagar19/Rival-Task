import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { Task } from "@/types/task";

type TaskActionsProps = {
  task: Task;
};

export function TaskActions({ task }: TaskActionsProps) {
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
      <Button variant="ghost" className="h-8 px-2.5 text-xs">
        {dueLabel}
      </Button>
    </div>
  );
}
