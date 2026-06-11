"use client";

import { useEffect, useState } from "react";

import { getTaskSseUrl } from "@/lib/realtime";
import type {
  RealtimeConnectionStatus,
  RealtimeEventType,
  TaskRealtimeEvent,
} from "@/types/realtime";

const TASK_EVENT_TYPES: RealtimeEventType[] = [
  "task.created",
  "task.updated",
  "task.completed",
  "task.deleted",
];

type UseTaskSseOptions = {
  enabled: boolean;
  onEvent: (event: TaskRealtimeEvent) => void;
};

export function useTaskSSE({ enabled, onEvent }: UseTaskSseOptions) {
  const [status, setStatus] = useState<RealtimeConnectionStatus>("offline");

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let active = true;
    const source = new EventSource(getTaskSseUrl(), { withCredentials: true });

    const handleEvent = (message: MessageEvent<string>) => {
      try {
        const event = JSON.parse(message.data) as TaskRealtimeEvent;
        onEvent(event);
      } catch {
        // Ignore malformed messages and continue listening.
      }
    };

    source.onopen = () => {
      if (!active) {
        return;
      }
      setStatus("live");
    };

    for (const eventType of TASK_EVENT_TYPES) {
      source.addEventListener(eventType, handleEvent as EventListener);
    }

    source.onerror = () => {
      if (!active) {
        return;
      }
      setStatus("reconnecting");
    };

    return () => {
      active = false;
      source.close();
      setStatus("offline");
    };
  }, [enabled, onEvent]);

  if (!enabled) {
    return { status: "offline" as const };
  }

  return { status: status === "offline" ? ("connecting" as const) : status };
}
