// API request utility with offline caching support

import { getCachedResponse, cacheResponse } from "./offlineCache";
import { queueRequestIfOffline } from "./requestQueue";

/**
 * Make an API request with offline caching support
 * GET requests are cached and served from cache when offline
 * Other requests are queued when offline
 */
export async function apiJsonWithOfflineSupport<T>(
  url: string,
  apiBase: string,
  init?: RequestInit,
): Promise<T> {
  const method = init?.method || "GET";

  // Check if offline
  const isOffline = await queueRequestIfOffline(url, init || {}, apiBase);

  if (isOffline) {
    if (method === "GET") {
      // Try to get from cache for GET requests
      const cached = await getCachedResponse(url);
      if (cached) {
        return cached as T;
      }
      // If not in cache and offline, throw error
      throw new Error("Offline and no cached data available");
    }
    // For non-GET, return empty as it's queued
    return {} as T;
  }

  const response = await fetch(`${apiBase}${url}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  const data = (await response.json().catch(() => ({}))) as T & {
    detail?: string;
  };

  if (!response.ok) {
    throw new Error(
      (data as any)?.detail ?? `Request failed: ${response.status}`,
    );
  }

  // Cache GET responses for offline use
  if (method === "GET") {
    await cacheResponse(url, data);
  }

  return data;
}
