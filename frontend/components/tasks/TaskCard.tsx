import { Card } from "@/components/ui/Card";
import { TaskActions } from "@/components/tasks/TaskActions";
import type { Task } from "@/types/task";

type TaskCardProps = {
  task: Task;
};

export function TaskCard({ task }: TaskCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-[color:var(--foreground)]">
            {task.title}
          </h3>
          <p className="mt-2 text-sm text-[color:var(--muted)]">
            {task.description || "No description provided."}
          </p>
        </div>
      </div>
      <div className="mt-4">
        <TaskActions task={task} />
      </div>
    </Card>
  );
}
