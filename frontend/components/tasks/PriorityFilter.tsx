"use client";

import { Select } from "@/components/ui/Select";
import type { TaskPriority } from "@/types/task";

type PriorityFilterProps = {
  value: TaskPriority | "";
  onChange: (value: TaskPriority | "") => void;
};

export function PriorityFilter({ value, onChange }: PriorityFilterProps) {
  return (
    <Select
      value={value}
      onChange={(event) => onChange(event.target.value as TaskPriority | "")}
      aria-label="Filter by priority"
    >
      <option value="">All priorities</option>
      <option value="high">High</option>
      <option value="medium">Medium</option>
      <option value="low">Low</option>
    </Select>
  );
}
