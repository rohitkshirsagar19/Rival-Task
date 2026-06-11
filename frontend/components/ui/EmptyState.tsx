import { Button } from "@/components/ui/Button";

type EmptyStateProps = {
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({
  title = "No items yet",
  message = "This view is ready for the first record.",
  actionLabel = "Create item",
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-40 flex-col items-start justify-center gap-3 rounded-lg border border-dashed border-[color:var(--border-soft)] bg-[color:var(--surface)] p-6">
      <p className="text-sm font-semibold text-[color:var(--foreground)]">{title}</p>
      <p className="text-sm text-[color:var(--muted)]">{message}</p>
      <Button onClick={onAction}>{actionLabel}</Button>
    </div>
  );
}
