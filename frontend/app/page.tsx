import { Suspense } from "react";

import { TaskDashboard } from "@/components/tasks/TaskDashboard";
import { LoadingState } from "@/components/ui/LoadingState";

export default function Home() {
  return (
    <Suspense fallback={<LoadingState label="Loading dashboard view" />}>
      <TaskDashboard />
    </Suspense>
  );
}
