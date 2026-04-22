import { useSync } from "@/store/syncStore";
import { AlertCircle, CheckCircle2, Loader2, WifiOff } from "lucide-react";
import { useOffline } from "@/store/offlineStore";

export function SyncStatus() {
  const { syncStatus } = useSync();
  const { isOnline } = useOffline();

  // Don't show anything if online and no pending requests
  if (isOnline && syncStatus.pendingRequests === 0 && !syncStatus.syncError) {
    return null;
  }

  if (!isOnline) {
    return (
      <div className="fixed bottom-4 right-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 flex items-center gap-2 shadow-md">
        <WifiOff className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
        <div className="flex-1">
          <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
            Offline Mode
          </p>
          {syncStatus.pendingRequests > 0 && (
            <p className="text-xs text-yellow-700 dark:text-yellow-300">
              {syncStatus.pendingRequests} change
              {syncStatus.pendingRequests > 1 ? "s" : ""} waiting to sync
            </p>
          )}
        </div>
      </div>
    );
  }

  if (syncStatus.isSyncing) {
    return (
      <div className="fixed bottom-4 right-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 flex items-center gap-2 shadow-md">
        <Loader2 className="h-4 w-4 text-blue-600 dark:text-blue-400 animate-spin" />
        <div className="flex-1">
          <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
            Syncing...
          </p>
          <p className="text-xs text-blue-700 dark:text-blue-300">
            {syncStatus.pendingRequests} pending
          </p>
        </div>
      </div>
    );
  }

  if (syncStatus.syncError) {
    return (
      <div className="fixed bottom-4 right-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-center gap-2 shadow-md">
        <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
        <div className="flex-1">
          <p className="text-sm font-medium text-red-800 dark:text-red-200">
            Sync Error
          </p>
          <p className="text-xs text-red-700 dark:text-red-300">
            {syncStatus.syncError}
          </p>
        </div>
      </div>
    );
  }

  if (syncStatus.pendingRequests === 0 && syncStatus.lastSyncTime) {
    return (
      <div className="fixed bottom-4 right-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 flex items-center gap-2 shadow-md animate-fade-out">
        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
        <p className="text-sm font-medium text-green-800 dark:text-green-200">
          All synced
        </p>
      </div>
    );
  }

  return null;
}
