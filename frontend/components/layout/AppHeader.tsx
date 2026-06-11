import { ThemeToggle } from "@/components/layout/ThemeToggle";

type AppHeaderProps = {
  title: string;
  subtitle: string;
};

export function AppHeader({ title, subtitle }: AppHeaderProps) {
  return (
    <header className="border-b border-[color:var(--border-soft)] px-5 py-4 sm:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-[color:var(--foreground)]">
            {title}
          </h2>
          <p className="mt-1 text-sm text-[color:var(--muted)]">{subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="rounded-lg border border-[color:var(--border-soft)] bg-[color:var(--surface)] px-3 py-2 text-sm text-[color:var(--muted)]">
            TaskFlow workspace
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
