"use client";

import { Select } from "@/components/ui/Select";
import type { TaskStatus } from "@/types/task";

type StatusFilterProps = {
  value: TaskStatus | "";
  onChange: (value: TaskStatus | "") => void;
};

export function StatusFilter({ value, onChange }: StatusFilterProps) {
  return (
    <Select
      value={value}
      onChange={(event) => onChange(event.target.value as TaskStatus | "")}
      aria-label="Filter by status"
    >
      <option value="">All statuses</option>
      <option value="pending">Pending</option>
      <option value="in_progress">In progress</option>
      <option value="completed">Completed</option>
    </Select>
  );
}
