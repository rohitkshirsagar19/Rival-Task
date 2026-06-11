import type { HTMLAttributes, ReactNode } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function Card({ children, className = "", ...props }: CardProps) {
  return (
    <div
      className={[
        "rounded-lg border border-[color:var(--border-soft)] bg-[color:var(--surface-elevated)]",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}
