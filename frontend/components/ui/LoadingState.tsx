type LoadingStateProps = {
  label?: string;
};

export function LoadingState({ label = "Loading data" }: LoadingStateProps) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-[color:var(--border-soft)] bg-[color:var(--surface)] p-6 text-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[color:var(--border-soft)] border-t-[color:var(--accent)]" />
      <p className="text-sm text-[color:var(--muted)]">{label}</p>
    </div>
  );
}
