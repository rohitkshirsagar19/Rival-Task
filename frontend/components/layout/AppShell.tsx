import type { ReactNode } from "react";

import { AppHeader } from "@/components/layout/AppHeader";
import { AppSidebar } from "@/components/layout/AppSidebar";

type AppShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function AppShell({ title, subtitle, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[color:var(--background)] text-[color:var(--foreground)]">
      <div className="mx-auto grid min-h-screen max-w-[1600px] lg:grid-cols-[260px_minmax(0,1fr)]">
        <div className="hidden lg:block">
          <AppSidebar />
        </div>

        <div className="flex min-h-screen flex-col">
          <AppHeader title={title} subtitle={subtitle} />
          <main className="flex-1 px-5 py-5 sm:px-8 sm:py-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
