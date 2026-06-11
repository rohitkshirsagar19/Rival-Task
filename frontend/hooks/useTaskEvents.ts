"use client";

import { useCallback, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useTaskSSE } from "@/hooks/useTaskSSE";
import { useTaskWebSocket } from "@/hooks/useTaskWebSocket";
import {
  ACTIVITY_QUERY_KEY,
  applyRealtimeTaskEvent,
} from "@/hooks/useTasks";
import type {
  RealtimeConnectionStatus,
  RealtimeTransport,
  TaskRealtimeEvent,
} from "@/types/realtime";

type UseTaskEventsOptions = {
  enabled: boolean;
};

export function useTaskEvents({ enabled }: UseTaskEventsOptions) {
  const queryClient = useQueryClient();
  const [preferSse, setPreferSse] = useState(false);

  const handleEvent = useCallback(
    (event: TaskRealtimeEvent) => {
      applyRealtimeTaskEvent(queryClient, event);
      void queryClient.invalidateQueries({ queryKey: ACTIVITY_QUERY_KEY });
    },
    [queryClient],
  );

  const websocket = useTaskWebSocket({
    enabled: enabled && !preferSse,
    maxReconnectAttempts: 2,
    onEvent: handleEvent,
    onExhausted: () => {
      setPreferSse(true);
    },
  });

  const sse = useTaskSSE({
    enabled: enabled && preferSse,
    onEvent: handleEvent,
  });

  const status = useMemo<RealtimeConnectionStatus>(() => {
    if (!enabled) {
      return "offline";
    }

    return preferSse ? sse.status : websocket.status;
  }, [enabled, preferSse, sse.status, websocket.status]);

  const transport = useMemo<RealtimeTransport>(() => {
    if (!enabled) {
      return "none";
    }

    return preferSse ? "sse" : "websocket";
  }, [enabled, preferSse]);

  return {
    status,
    transport,
  };
}
