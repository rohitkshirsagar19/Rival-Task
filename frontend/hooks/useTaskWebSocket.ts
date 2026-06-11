"use client";

import { useEffect, useRef, useState } from "react";

import { getTaskWebSocketUrl } from "@/lib/realtime";
import type {
  RealtimeConnectionStatus,
  TaskRealtimeEvent,
} from "@/types/realtime";

type UseTaskWebSocketOptions = {
  enabled: boolean;
  maxReconnectAttempts?: number;
  onEvent: (event: TaskRealtimeEvent) => void;
  onExhausted?: () => void;
};

export function useTaskWebSocket({
  enabled,
  maxReconnectAttempts = 2,
  onEvent,
  onExhausted,
}: UseTaskWebSocketOptions) {
  const [status, setStatus] = useState<RealtimeConnectionStatus>("offline");
  const attemptsRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let active = true;

    const clearTimer = () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    const cleanupSocket = () => {
      if (socketRef.current) {
        socketRef.current.onopen = null;
        socketRef.current.onmessage = null;
        socketRef.current.onerror = null;
        socketRef.current.onclose = null;
        socketRef.current.close();
        socketRef.current = null;
      }
    };

    const scheduleReconnect = () => {
      if (!active) {
        return;
      }

      if (attemptsRef.current >= maxReconnectAttempts) {
        setStatus("offline");
        onExhausted?.();
        return;
      }

      attemptsRef.current += 1;
      setStatus("reconnecting");
      const delay = Math.min(1000 * 2 ** (attemptsRef.current - 1), 4000);
      timerRef.current = window.setTimeout(connect, delay);
    };

    const connect = () => {
      if (!active) {
        return;
      }

      clearTimer();
      cleanupSocket();
      setStatus(attemptsRef.current === 0 ? "connecting" : "reconnecting");

      const socket = new WebSocket(getTaskWebSocketUrl());
      socketRef.current = socket;

      socket.onopen = () => {
        attemptsRef.current = 0;
        setStatus("live");
      };

      socket.onmessage = (message) => {
        try {
          const event = JSON.parse(message.data) as TaskRealtimeEvent;
          onEvent(event);
        } catch {
          // Ignore malformed messages and keep the connection alive.
        }
      };

      socket.onerror = () => {
        if (socket.readyState !== WebSocket.CLOSED) {
          socket.close();
        }
      };

      socket.onclose = () => {
        if (!active) {
          return;
        }
        scheduleReconnect();
      };
    };

    connect();

    return () => {
      active = false;
      clearTimer();
      cleanupSocket();
      setStatus("offline");
    };
  }, [enabled, maxReconnectAttempts, onEvent, onExhausted]);

  return { status: enabled ? status : ("offline" as const) };
}
