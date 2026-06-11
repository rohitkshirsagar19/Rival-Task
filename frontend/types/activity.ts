export type ActivityLog = {
  id: number;
  task_id: number;
  user_id: number;
  action: string;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  created_at: string;
};

export type ActivityListResponse = {
  activities: ActivityLog[];
};
