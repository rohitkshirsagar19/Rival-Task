import type { ReactNode } from "react";

type BadgeTone = "neutral" | "success" | "warning" | "critical";

type BadgeProps = {
  children: ReactNode;
  tone?: BadgeTone;
};

const toneClasses: Record<BadgeTone, string> = {
  neutral: "bg-[color:var(--surface)] text-[color:var(--muted)]",
  success: "bg-[#d7f5e6] text-[#0f5132]",
  warning: "bg-[#ffefc7] text-[#8a5a00]",
  critical: "bg-[#ffe0dd] text-[#a12622]",
};

export function Badge({ children, tone = "neutral" }: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex h-7 items-center rounded-md px-2.5 text-xs font-medium",
        toneClasses[tone],
      ].join(" ")}
    >
      {children}
    </span>
  );
}
