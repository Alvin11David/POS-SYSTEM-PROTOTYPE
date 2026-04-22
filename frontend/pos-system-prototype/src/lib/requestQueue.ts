// Request queue manager for offline-first functionality

import {
  addQueuedRequest,
  getQueuedRequests,
  removeQueuedRequest,
  QueuedRequest,
} from "./db";

export interface SyncStatus {
  isSyncing: boolean;
  pendingRequests: number;
  lastSyncTime?: number;
  syncError?: string;
}

// Global sync status listeners
const listeners: Set<(status: SyncStatus) => void> = new Set();
let syncStatus: SyncStatus = {
  isSyncing: false,
  pendingRequests: 0,
};

export function subscribeSyncStatus(
  callback: (status: SyncStatus) => void,
): () => void {
  listeners.add(callback);
  callback(syncStatus);
  return () => listeners.delete(callback);
}

function notifyListeners() {
  listeners.forEach((callback) => callback(syncStatus));
}

export async function updatePendingCount() {
  const requests = await getQueuedRequests();
  syncStatus.pendingRequests = requests.length;
  notifyListeners();
}

export async function queueRequestIfOffline(
  url: string,
  init: RequestInit,
  apiBase: string,
): Promise<boolean> {
  if (!navigator.onLine) {
    const method = init.method || "GET";
    // Don't queue GET requests as they're read-only
    if (method !== "GET") {
      await addQueuedRequest({
        url,
        method,
        body: init.body as string,
        headers: init.headers as Record<string, string>,
      });
      await updatePendingCount();
    }
    return true;
  }
  return false;
}

export async function syncQueuedRequests(apiBase: string): Promise<void> {
  if (syncStatus.isSyncing) return;

  const requests = await getQueuedRequests();
  if (requests.length === 0) return;

  syncStatus.isSyncing = true;
  syncStatus.syncError = undefined;
  notifyListeners();

  const failedRequests: QueuedRequest[] = [];

  for (const req of requests) {
    try {
      const response = await fetch(`${apiBase}${req.url}`, {
        method: req.method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...req.headers,
        },
        body: req.body,
      });

      if (!response.ok) {
        // If it's a 4xx error, remove from queue (user error, won't fix by retrying)
        if (response.status >= 400 && response.status < 500) {
          await removeQueuedRequest(req.id);
        } else {
          // 5xx error, keep in queue for retry
          failedRequests.push(req);
        }
      } else {
        await removeQueuedRequest(req.id);
      }
    } catch (error) {
      failedRequests.push(req);
    }
  }

  syncStatus.isSyncing = false;

  if (failedRequests.length > 0) {
    syncStatus.syncError = `Failed to sync ${failedRequests.length} request(s)`;
  } else {
    syncStatus.lastSyncTime = Date.now();
  }

  await updatePendingCount();
  notifyListeners();
}

export function setupSyncListener(apiBase: string): () => void {
  void updatePendingCount();

  // Sync when coming back online
  const handleOnline = async () => {
    await syncQueuedRequests(apiBase);
  };

  // Periodic sync every 30 seconds
  let syncInterval: ReturnType<typeof setInterval> | null = null;
  const startPeriodicSync = () => {
    syncInterval = setInterval(async () => {
      await syncQueuedRequests(apiBase);
    }, 30000);
  };

  const stopPeriodicSync = () => {
    if (syncInterval) clearInterval(syncInterval);
  };

  window.addEventListener("online", handleOnline);

  if (navigator.onLine) {
    startPeriodicSync();
  }

  const handleOffline = () => {
    stopPeriodicSync();
  };

  const handleOnlineInternal = () => {
    startPeriodicSync();
    handleOnline();
  };

  window.addEventListener("offline", handleOffline);
  window.addEventListener("online", handleOnlineInternal);

  return () => {
    stopPeriodicSync();
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
    window.removeEventListener("online", handleOnlineInternal);
  };
}
