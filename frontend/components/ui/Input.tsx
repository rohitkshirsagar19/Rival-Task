import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className = "", ...props }: InputProps) {
  return (
    <input
      className={[
        "h-10 w-full rounded-lg border border-[color:var(--border-soft)] bg-[color:var(--surface)] px-3 text-sm text-[color:var(--foreground)] outline-none transition-colors placeholder:text-[color:var(--muted)] focus:border-[color:var(--accent)]",
        className,
      ].join(" ")}
      {...props}
    />
  );
}
