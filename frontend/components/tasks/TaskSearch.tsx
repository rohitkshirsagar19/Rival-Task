"use client";

import { Input } from "@/components/ui/Input";

type TaskSearchProps = {
  value: string;
  onChange: (value: string) => void;
};

export function TaskSearch({ value, onChange }: TaskSearchProps) {
  return (
    <Input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Search task titles"
      aria-label="Search task titles"
    />
  );
}
