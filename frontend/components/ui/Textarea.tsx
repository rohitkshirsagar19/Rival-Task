import { forwardRef } from "react";
import type { TextareaHTMLAttributes } from "react";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className = "", ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      className={[
        "min-h-28 w-full rounded-lg border border-[color:var(--border-soft)] bg-[color:var(--surface)] px-3 py-2.5 text-sm text-[color:var(--foreground)] outline-none transition-colors placeholder:text-[color:var(--muted)] focus:border-[color:var(--accent)]",
        className,
      ].join(" ")}
      {...props}
    />
  );
});
