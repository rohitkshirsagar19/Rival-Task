const navigation = [
  { label: "Overview", value: "01" },
  { label: "Inbox", value: "12" },
  { label: "Board", value: "07" },
  { label: "Calendar", value: "04" },
];

export function AppSidebar() {
  return (
    <aside className="flex h-full w-full flex-col border-r border-[color:var(--border-strong)] bg-[color:var(--surface-strong)]">
      <div className="border-b border-[color:var(--border-strong)] px-5 py-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
              TaskFlow
            </p>
            <h1 className="mt-2 text-lg font-semibold text-[color:var(--foreground)]">
              Operations
            </h1>
          </div>
          <div className="rounded-md border border-[color:var(--border-strong)] bg-[color:var(--surface)] px-2 py-1 text-xs font-medium text-[color:var(--muted)]">
            Live
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {navigation.map((item, index) => (
            <li key={item.label}>
              <button
                type="button"
                className={[
                  "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                  index === 0
                    ? "bg-[color:var(--surface-accent)] text-[color:var(--foreground)]"
                    : "text-[color:var(--muted)] hover:bg-[color:var(--surface)] hover:text-[color:var(--foreground)]",
                ].join(" ")}
              >
                <span className="font-medium">{item.label}</span>
                <span className="text-xs">{item.value}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-[color:var(--border-strong)] px-5 py-4">
        <div className="rounded-lg bg-[color:var(--surface)] p-4">
          <p className="text-xs font-medium text-[color:var(--muted)]">Workspace</p>
          <p className="mt-1 text-sm font-semibold text-[color:var(--foreground)]">
            Product Delivery
          </p>
        </div>
      </div>
    </aside>
  );
}
