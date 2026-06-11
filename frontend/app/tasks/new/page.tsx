"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { AppShell } from "@/components/layout/AppShell";
import { TaskForm } from "@/components/tasks/TaskForm";
import { Card } from "@/components/ui/Card";
import { LoadingState } from "@/components/ui/LoadingState";
import { useAuth } from "@/hooks/useAuth";
import { useCreateTaskMutation } from "@/hooks/useTasks";
import { ApiClientError } from "@/lib/api";
import type { TaskCreateInput } from "@/types/task";

export default function NewTaskPage() {
  const router = useRouter();
  const { status, user } = useAuth();
  const createTaskMutation = useCreateTaskMutation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (payload: TaskCreateInput) => {
    setErrorMessage(null);

    try {
      await createTaskMutation.mutateAsync(payload);
      router.replace("/");
    } catch (error) {
      if (error instanceof ApiClientError) {
        setErrorMessage(error.message);
        return;
      }

      setErrorMessage("Unable to create this task right now.");
    }
  };

  if (status !== "authenticated" || !user) {
    return (
      <AppShell title="Create task" subtitle="Open a new item in the delivery queue.">
        <LoadingState label="Restoring your session" />
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Create task"
      subtitle="Capture the work clearly so it can move through the queue without ambiguity."
    >
      <Card className="mx-auto w-full max-w-4xl p-6">
        <div className="mb-6">
          <p className="text-sm font-medium text-[color:var(--muted)]">New task</p>
          <h2 className="mt-1 text-xl font-semibold text-[color:var(--foreground)]">
            Add a task for {user.name}
          </h2>
        </div>
        <TaskForm
          submitLabel="Create task"
          errorMessage={errorMessage}
          isSubmitting={createTaskMutation.isPending}
          onCancel={() => router.push("/")}
          onSubmit={handleSubmit}
        />
      </Card>
    </AppShell>
  );
}
