import { TaskActions } from "@/components/tasks/TaskActions";
import type { Task } from "@/types/task";

type TaskTableProps = {
  tasks: Task[];
  completingTaskId?: number | null;
  deletingTaskId?: number | null;
  onComplete?: (task: Task) => void;
  onDelete?: (task: Task) => void;
};

export function TaskTable({
  tasks,
  completingTaskId,
  deletingTaskId,
  onComplete,
  onDelete,
}: TaskTableProps) {
  return (
    <div className="hidden overflow-hidden rounded-lg border border-[color:var(--border-soft)] lg:block">
      <table className="min-w-full divide-y divide-[color:var(--border-soft)]">
        <thead className="bg-[color:var(--surface-strong)]">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--muted)]">
              Task
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--muted)]">
              Description
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--muted)]">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[color:var(--border-soft)] bg-[color:var(--surface-elevated)]">
          {tasks.map((task) => (
            <tr key={task.id}>
              <td className="px-4 py-4 text-sm font-medium text-[color:var(--foreground)]">
                {task.title}
              </td>
              <td className="px-4 py-4 text-sm text-[color:var(--muted)]">
                {task.description || "No description provided."}
              </td>
              <td className="px-4 py-4">
                <TaskActions
                  task={task}
                  isCompleting={completingTaskId === task.id}
                  isDeleting={deletingTaskId === task.id}
                  onComplete={onComplete}
                  onDelete={onDelete}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
