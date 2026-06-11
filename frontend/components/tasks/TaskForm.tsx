"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { taskFormSchema, type TaskFormValues } from "@/lib/task-validators";
import type { Task, TaskCreateInput } from "@/types/task";

type TaskFormProps = {
  initialTask?: Task;
  submitLabel: string;
  errorMessage?: string | null;
  isSubmitting?: boolean;
  onCancel: () => void;
  onSubmit: (payload: TaskCreateInput) => Promise<void> | void;
};

function toDateTimeLocalValue(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const pad = (part: number) => String(part).padStart(2, "0");

  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join("-") + `T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function getDefaultValues(task?: Task): TaskFormValues {
  return {
    title: task?.title ?? "",
    description: task?.description ?? "",
    status: task?.status ?? "pending",
    priority: task?.priority ?? "medium",
    due_date: toDateTimeLocalValue(task?.due_date),
  };
}

function toPayload(values: TaskFormValues): TaskCreateInput {
  return {
    title: values.title.trim(),
    description: values.description?.trim() ? values.description.trim() : undefined,
    status: values.status,
    priority: values.priority,
    due_date: values.due_date ? new Date(values.due_date).toISOString() : null,
  };
}

export function TaskForm({
  initialTask,
  submitLabel,
  errorMessage,
  isSubmitting = false,
  onCancel,
  onSubmit,
}: TaskFormProps) {
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: getDefaultValues(initialTask),
  });

  useEffect(() => {
    form.reset(getDefaultValues(initialTask));
  }, [form, initialTask]);

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(toPayload(values));
  });

  return (
    <form className="grid gap-5" onSubmit={handleSubmit}>
      <div className="grid gap-2">
        <label className="text-sm font-medium text-[color:var(--foreground)]" htmlFor="title">
          Title
        </label>
        <Input
          id="title"
          placeholder="Ship auth flow"
          maxLength={160}
          {...form.register("title")}
        />
        {form.formState.errors.title ? (
          <p className="text-sm text-[#a12622]">{form.formState.errors.title.message}</p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <label
          className="text-sm font-medium text-[color:var(--foreground)]"
          htmlFor="description"
        >
          Description
        </label>
        <Textarea
          id="description"
          placeholder="Outline the work, constraints, and success criteria."
          maxLength={2000}
          {...form.register("description")}
        />
        {form.formState.errors.description ? (
          <p className="text-sm text-[#a12622]">
            {form.formState.errors.description.message}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="grid gap-2">
          <label className="text-sm font-medium text-[color:var(--foreground)]" htmlFor="status">
            Status
          </label>
          <Select id="status" {...form.register("status")}>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </Select>
          {form.formState.errors.status ? (
            <p className="text-sm text-[#a12622]">{form.formState.errors.status.message}</p>
          ) : null}
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium text-[color:var(--foreground)]" htmlFor="priority">
            Priority
          </label>
          <Select id="priority" {...form.register("priority")}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </Select>
          {form.formState.errors.priority ? (
            <p className="text-sm text-[#a12622]">{form.formState.errors.priority.message}</p>
          ) : null}
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium text-[color:var(--foreground)]" htmlFor="due_date">
            Due date
          </label>
          <Input id="due_date" type="datetime-local" {...form.register("due_date")} />
          {form.formState.errors.due_date ? (
            <p className="text-sm text-[#a12622]">{form.formState.errors.due_date.message}</p>
          ) : null}
        </div>
      </div>

      {errorMessage ? (
        <div className="rounded-lg border border-[#f4c5bf] bg-[#fff5f3] px-4 py-3 text-sm text-[#8f2d18]">
          {errorMessage}
        </div>
      ) : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={form.formState.isSubmitting || isSubmitting}>
          {form.formState.isSubmitting || isSubmitting ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
