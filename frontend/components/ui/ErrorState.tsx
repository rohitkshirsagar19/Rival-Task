import { Button } from "@/components/ui/Button";

type ErrorStateProps = {
  title?: string;
  message?: string;
  actionLabel?: string;
};

export function ErrorState({
  title = "Something needs attention",
  message = "The latest request could not be completed.",
  actionLabel = "Retry",
}: ErrorStateProps) {
  return (
    <div className="flex min-h-40 flex-col items-start justify-center gap-3 rounded-lg border border-[#f4c5bf] bg-[#fff5f3] p-6">
      <p className="text-sm font-semibold text-[#8f2d18]">{title}</p>
      <p className="text-sm text-[#aa4b37]">{message}</p>
      <Button variant="secondary">{actionLabel}</Button>
    </div>
  );
}
