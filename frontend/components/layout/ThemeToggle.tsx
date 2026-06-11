"use client";

import { Button } from "@/components/ui/Button";
import { useTheme } from "@/hooks/useTheme";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex items-center gap-2 rounded-lg border border-[color:var(--border-soft)] bg-[color:var(--surface)] p-1">
      <span className="px-2 text-xs font-medium text-[color:var(--muted)]">Theme</span>
      <Button
        variant="ghost"
        className="h-8 px-3 text-xs text-[color:var(--foreground)]"
        onClick={toggleTheme}
      >
        <span suppressHydrationWarning>{theme === "dark" ? "Dark" : "Light"}</span>
      </Button>
    </div>
  );
}
