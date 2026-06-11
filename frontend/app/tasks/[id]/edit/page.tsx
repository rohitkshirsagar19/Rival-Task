"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { AppShell } from "@/components/layout/AppShell";
import { TaskForm } from "@/components/tasks/TaskForm";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { useAuth } from "@/hooks/useAuth";
import { useTask, useUpdateTaskMutation } from "@/hooks/useTasks";
import { ApiClientError } from "@/lib/api";
import type { TaskCreateInput } from "@/types/task";

export default function EditTaskPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { status, user } = useAuth();
  const taskId = Number(params.id);
  const taskQuery = useTask(taskId);
  const updateTaskMutation = useUpdateTaskMutation(taskId);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (payload: TaskCreateInput) => {
    setErrorMessage(null);

    try {
      await updateTaskMutation.mutateAsync(payload);
      router.replace("/");
    } catch (error) {
      if (error instanceof ApiClientError) {
        setErrorMessage(error.message);
        return;
      }

      setErrorMessage("Unable to update this task right now.");
    }
  };

  if (status !== "authenticated" || !user) {
    return (
      <AppShell title="Edit task" subtitle="Adjust the existing task record.">
        <LoadingState label="Restoring your session" />
      </AppShell>
    );
  }

  if (!Number.isFinite(taskId) || taskId <= 0) {
    return (
      <AppShell title="Edit task" subtitle="Adjust the existing task record.">
        <ErrorState
          title="Task ID is invalid"
          message="The requested task route could not be resolved."
          actionLabel="Back to dashboard"
          onAction={() => router.replace("/")}
        />
      </AppShell>
    );
  }

  if (taskQuery.isLoading) {
    return (
      <AppShell title="Edit task" subtitle="Adjust the existing task record.">
        <LoadingState label="Loading task details" />
      </AppShell>
    );
  }

  if (taskQuery.isError || !taskQuery.data) {
    const message =
      taskQuery.error instanceof ApiClientError && taskQuery.error.status === 404
        ? "This task no longer exists or you no longer have access to it."
        : "The task details could not be loaded.";

    return (
      <AppShell title="Edit task" subtitle="Adjust the existing task record.">
        <ErrorState
          title="Task could not be loaded"
          message={message}
          actionLabel="Back to dashboard"
          onAction={() => router.replace("/")}
        />
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Edit task"
      subtitle="Update the task record and send the latest state back to the dashboard."
    >
      <Card className="mx-auto w-full max-w-4xl p-6">
        <div className="mb-6">
          <p className="text-sm font-medium text-[color:var(--muted)]">Task #{taskQuery.data.id}</p>
          <h2 className="mt-1 text-xl font-semibold text-[color:var(--foreground)]">
            Edit {taskQuery.data.title}
          </h2>
        </div>
        <TaskForm
          initialTask={taskQuery.data}
          submitLabel="Save changes"
          errorMessage={errorMessage}
          isSubmitting={updateTaskMutation.isPending}
          onCancel={() => router.push("/")}
          onSubmit={handleSubmit}
        />
      </Card>
    </AppShell>
  );
}
