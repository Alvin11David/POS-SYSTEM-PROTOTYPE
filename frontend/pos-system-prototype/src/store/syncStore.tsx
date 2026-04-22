import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  setupSyncListener,
  subscribeSyncStatus,
  SyncStatus,
} from "@/lib/requestQueue";

interface SyncCtx {
  syncStatus: SyncStatus;
}

const Ctx = createContext<SyncCtx | null>(null);

export function SyncProvider({
  children,
  apiBase,
}: {
  children: ReactNode;
  apiBase: string;
}) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isSyncing: false,
    pendingRequests: 0,
  });

  useEffect(() => {
    // Setup sync listener and subscribe to status updates
    const cleanup = setupSyncListener(apiBase);
    const unsubscribe = subscribeSyncStatus(setSyncStatus);

    return () => {
      cleanup();
      unsubscribe();
    };
  }, [apiBase]);

  return <Ctx.Provider value={{ syncStatus }}>{children}</Ctx.Provider>;
}

export function useSync() {
  const context = useContext(Ctx);
  if (!context) {
    throw new Error("useSync must be used within a SyncProvider");
  }
  return context;
}
