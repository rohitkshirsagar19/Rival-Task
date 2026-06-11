import { API_BASE_URL } from "@/lib/api";

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function getOriginFromApiBase() {
  return trimTrailingSlash(API_BASE_URL).replace(/\/api\/v1$/, "");
}

export function getTaskWebSocketUrl() {
  const configured = process.env.NEXT_PUBLIC_WS_URL;

  if (configured) {
    return configured;
  }

  return getOriginFromApiBase().replace(/^http/, "ws") + "/api/v1/ws/tasks";
}

export function getTaskSseUrl() {
  const configured = process.env.NEXT_PUBLIC_SSE_URL;

  if (configured) {
    return configured;
  }

  return getOriginFromApiBase() + "/api/v1/events/tasks";
}
