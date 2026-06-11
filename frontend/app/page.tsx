import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Input } from "@/components/ui/Input";
import { LoadingState } from "@/components/ui/LoadingState";
import { Pagination } from "@/components/ui/Pagination";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";

const summaryCards = [
  { label: "Due Today", value: "14", tone: "warning" as const },
  { label: "In Review", value: "08", tone: "neutral" as const },
  { label: "Completed", value: "27", tone: "success" as const },
  { label: "Blocked", value: "03", tone: "critical" as const },
];

const priorities = [
  { title: "Checkout audit", due: "Today", tone: "critical" as const },
  { title: "Billing callback", due: "Tomorrow", tone: "warning" as const },
  { title: "Onboarding fixes", due: "Fri", tone: "success" as const },
];

export default function Home() {
  return (
    <AppShell
      title="Delivery Console"
      subtitle="Monitor commitments, shape queues, and keep the next release moving."
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.9fr)]">
        <section className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((card) => (
              <Card key={card.label} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-[color:var(--muted)]">{card.label}</p>
                    <p className="mt-3 text-3xl font-semibold text-[color:var(--foreground)]">
                      {card.value}
                    </p>
                  </div>
                  <Badge tone={card.tone}>{card.label}</Badge>
                </div>
              </Card>
            ))}
          </div>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
            <Card className="p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-[color:var(--muted)]">Quick capture</p>
                  <h3 className="mt-1 text-lg font-semibold text-[color:var(--foreground)]">
                    New task draft
                  </h3>
                </div>
                <Badge tone="success">Open lane</Badge>
              </div>

              <div className="mt-5 grid gap-4">
                <Input placeholder="Task title" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Select defaultValue="medium">
                    <option value="low">Low priority</option>
                    <option value="medium">Medium priority</option>
                    <option value="high">High priority</option>
                  </Select>
                  <Select defaultValue="pending">
                    <option value="pending">Pending</option>
                    <option value="in_progress">In progress</option>
                    <option value="completed">Completed</option>
                  </Select>
                </div>
                <Textarea placeholder="Description, dependencies, rollout notes" />
                <div className="flex flex-wrap gap-3">
                  <Button>Create draft</Button>
                  <Button variant="secondary">Save for later</Button>
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-[color:var(--muted)]">Priority queue</p>
                  <h3 className="mt-1 text-lg font-semibold text-[color:var(--foreground)]">
                    Current focus
                  </h3>
                </div>
                <Badge>Filtered</Badge>
              </div>

              <ul className="mt-5 space-y-3">
                {priorities.map((item) => (
                  <li
                    key={item.title}
                    className="rounded-lg border border-[color:var(--border-soft)] bg-[color:var(--surface)] px-4 py-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-[color:var(--foreground)]">
                          {item.title}
                        </p>
                        <p className="mt-1 text-sm text-[color:var(--muted)]">Due {item.due}</p>
                      </div>
                      <Badge tone={item.tone}>{item.due}</Badge>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <Card>
            <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
              <div>
                <p className="text-sm font-medium text-[color:var(--muted)]">Queue snapshot</p>
                <h3 className="mt-1 text-lg font-semibold text-[color:var(--foreground)]">
                  Active worklist
                </h3>
                <div className="mt-5 space-y-3">
                  {[
                    ["Finish launch notes", "Owner", "High"],
                    ["QA hotfix review", "QA", "Medium"],
                    ["Close rollout checklist", "Ops", "Low"],
                  ].map(([title, owner, priority]) => (
                    <div
                      key={title}
                      className="grid gap-2 rounded-lg border border-[color:var(--border-soft)] bg-[color:var(--surface)] px-4 py-3 sm:grid-cols-[minmax(0,1fr)_88px_92px] sm:items-center"
                    >
                      <p className="text-sm font-medium text-[color:var(--foreground)]">{title}</p>
                      <p className="text-sm text-[color:var(--muted)]">{owner}</p>
                      <Badge tone={priority === "High" ? "critical" : priority === "Medium" ? "warning" : "success"}>
                        {priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4">
                <LoadingState label="Refreshing task counts" />
                <EmptyState
                  title="No backlog bucket selected"
                  message="Assign a view to start collecting deferred work here."
                  actionLabel="Create bucket"
                />
              </div>
            </div>
            <Pagination
              meta={{
                page: 1,
                limit: 10,
                total: 24,
                total_pages: 3,
              }}
            />
          </Card>
        </section>

        <section className="space-y-5">
          <Card className="p-5">
            <p className="text-sm font-medium text-[color:var(--muted)]">Release status</p>
            <h3 className="mt-1 text-lg font-semibold text-[color:var(--foreground)]">
              System watch
            </h3>
            <div className="mt-5 space-y-4">
              <div className="rounded-lg border border-[color:var(--border-soft)] bg-[color:var(--surface)] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-[color:var(--foreground)]">API health</p>
                  <Badge tone="success">Stable</Badge>
                </div>
                <p className="mt-2 text-sm text-[color:var(--muted)]">Auth, tasks, and activity feeds are in the expected range.</p>
              </div>
              <div className="rounded-lg border border-[color:var(--border-soft)] bg-[color:var(--surface)] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-[color:var(--foreground)]">Realtime stream</p>
                  <Badge tone="warning">Warm</Badge>
                </div>
                <p className="mt-2 text-sm text-[color:var(--muted)]">Subscription heartbeat within tolerance.</p>
              </div>
            </div>
          </Card>

          <ErrorState
            title="Sync drift detected"
            message="One downstream queue is lagging behind the primary board snapshot."
            actionLabel="Review feed"
          />
        </section>
      </div>
    </AppShell>
  );
}
