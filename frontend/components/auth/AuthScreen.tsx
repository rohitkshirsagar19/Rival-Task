"use client";

import Link from "next/link";
import type { ReactNode } from "react";

type AuthScreenProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  footerPrompt: string;
  footerLinkLabel: string;
  footerHref: string;
  children: ReactNode;
};

export function AuthScreen({
  eyebrow,
  title,
  subtitle,
  footerPrompt,
  footerLinkLabel,
  footerHref,
  children,
}: AuthScreenProps) {
  return (
    <div className="min-h-screen bg-[color:var(--background)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl overflow-hidden rounded-2xl border border-[color:var(--border-strong)] bg-[color:var(--surface-elevated)] lg:grid-cols-[1.05fr_minmax(420px,0.95fr)]">
        <section className="hidden border-r border-[color:var(--border-soft)] bg-[color:var(--surface-strong)] p-10 lg:flex lg:flex-col lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
              TaskFlow
            </p>
            <h1 className="mt-6 max-w-md text-4xl font-semibold text-[color:var(--foreground)]">
              Quiet control for task-driven teams.
            </h1>
            <p className="mt-4 max-w-md text-base text-[color:var(--muted)]">
              Restore your session through secure cookies, keep work visible, and move from triage to delivery without leaving the dashboard.
            </p>
          </div>

          <div className="grid gap-3">
            {[
              ["Auth", "Cookie-backed session restore"],
              ["Tasks", "Protected task and activity APIs"],
              ["Live", "Realtime updates over WebSocket and SSE"],
            ].map(([label, detail]) => (
              <div
                key={label}
                className="rounded-lg border border-[color:var(--border-soft)] bg-[color:var(--surface)] px-4 py-3"
              >
                <p className="text-sm font-medium text-[color:var(--foreground)]">{label}</p>
                <p className="mt-1 text-sm text-[color:var(--muted)]">{detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
              {eyebrow}
            </p>
            <h2 className="mt-4 text-3xl font-semibold text-[color:var(--foreground)]">
              {title}
            </h2>
            <p className="mt-2 text-sm text-[color:var(--muted)]">{subtitle}</p>

            <div className="mt-8">{children}</div>

            <p className="mt-6 text-sm text-[color:var(--muted)]">
              {footerPrompt}{" "}
              <Link href={footerHref} className="font-medium text-[color:var(--accent)]">
                {footerLinkLabel}
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
