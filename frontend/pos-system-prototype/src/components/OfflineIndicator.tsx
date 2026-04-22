import { Wifi, WifiOff } from "lucide-react";
import { useOffline } from "@/store/offlineStore";
import { cn } from "@/lib/utils";

export function OfflineIndicator() {
  const { isOnline, wasOffline } = useOffline();

  if (isOnline && !wasOffline) return null;

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium shadow-lg transition-all duration-300",
        isOnline
          ? "bg-green-500/90 text-white backdrop-blur-sm"
          : "bg-red-500/90 text-white backdrop-blur-sm animate-pulse",
      )}
    >
      {isOnline ? (
        <>
          <Wifi className="h-4 w-4" />
          Back online
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4" />
          Offline mode
        </>
      )}
    </div>
  );
}
