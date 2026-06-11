"use client";

import { Select } from "@/components/ui/Select";
import type { TaskSortBy, TaskSortOrder } from "@/types/task";

type SortDropdownProps = {
  sortBy: TaskSortBy;
  sortOrder: TaskSortOrder;
  onSortByChange: (value: TaskSortBy) => void;
  onSortOrderChange: (value: TaskSortOrder) => void;
};

export function SortDropdown({
  sortBy,
  sortOrder,
  onSortByChange,
  onSortOrderChange,
}: SortDropdownProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Select
        value={sortBy}
        onChange={(event) => onSortByChange(event.target.value as TaskSortBy)}
        aria-label="Sort tasks by"
      >
        <option value="created_at">Newest</option>
        <option value="due_date">Due date</option>
        <option value="priority">Priority</option>
      </Select>
      <Select
        value={sortOrder}
        onChange={(event) => onSortOrderChange(event.target.value as TaskSortOrder)}
        aria-label="Sort order"
      >
        <option value="desc">Descending</option>
        <option value="asc">Ascending</option>
      </Select>
    </div>
  );
}
