import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

interface OfflineCtx {
  isOnline: boolean;
  wasOffline: boolean;
}

const Ctx = createContext<OfflineCtx | null>(null);

export function OfflineProvider({ children }: { children: ReactNode }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        // Show a toast or notification that we're back online
        console.log("Back online!");
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      console.log("Gone offline!");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [wasOffline]);

  return (
    <Ctx.Provider value={{ isOnline, wasOffline }}>{children}</Ctx.Provider>
  );
}

export function useOffline() {
  const context = useContext(Ctx);
  if (!context) {
    throw new Error("useOffline must be used within an OfflineProvider");
  }
  return context;
}
