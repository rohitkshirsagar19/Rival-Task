import { Button } from "@/components/ui/Button";
import type { PaginationMeta } from "@/types/api";

type PaginationProps = {
  meta: PaginationMeta;
  onPrevious?: () => void;
  onNext?: () => void;
};

export function Pagination({ meta, onPrevious, onNext }: PaginationProps) {
  const totalPages = Math.max(meta.total_pages, 1);

  return (
    <div className="flex flex-col gap-3 border-t border-[color:var(--border-soft)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-[color:var(--muted)]">
        Page {meta.page} of {totalPages}
      </p>
      <div className="flex gap-2">
        <Button variant="secondary" disabled={meta.page <= 1} onClick={onPrevious}>
          Previous
        </Button>
        <Button
          variant="secondary"
          disabled={meta.page >= totalPages}
          onClick={onNext}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
