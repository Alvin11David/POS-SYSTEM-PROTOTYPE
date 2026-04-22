import { useEffect, useState } from "react";
import { useOffline } from "@/store/offlineStore";

export function useNetworkAwareQuery() {
  const { isOnline } = useOffline();
  const [lastError, setLastError] = useState<Error | null>(null);

  useEffect(() => {
    if (isOnline && lastError) {
      // Clear error when back online
      setLastError(null);
    }
  }, [isOnline, lastError]);

  const handleError = (error: Error) => {
    // Check if it's a network error
    if (!navigator.onLine || error.message.includes("fetch")) {
      setLastError(error);
    }
    throw error;
  };

  return {
    isOnline,
    lastNetworkError: lastError,
    handleError,
    clearError: () => setLastError(null),
  };
}
