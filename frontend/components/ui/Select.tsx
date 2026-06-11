import type { SelectHTMLAttributes } from "react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ children, className = "", ...props }: SelectProps) {
  return (
    <select
      className={[
        "h-10 w-full rounded-lg border border-[color:var(--border-soft)] bg-[color:var(--surface)] px-3 text-sm text-[color:var(--foreground)] outline-none transition-colors focus:border-[color:var(--accent)]",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </select>
  );
}
