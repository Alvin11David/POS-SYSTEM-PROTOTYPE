import { WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useOffline } from "@/store/offlineStore";

export function OfflinePage() {
  const { isOnline } = useOffline();

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <WifiOff className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-xl">You're Offline</CardTitle>
          <CardDescription>
            It looks like you've lost your internet connection. Some features
            may not be available.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p className="mb-2">You can still:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>View cached data</li>
              <li>Access previously loaded pages</li>
              <li>Use basic app functionality</li>
            </ul>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleRetry}
              className="flex-1"
              disabled={!isOnline}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              {isOnline ? "Retry Connection" : "Waiting for Connection..."}
            </Button>
          </div>

          {!isOnline && (
            <p className="text-xs text-center text-muted-foreground">
              This page will automatically refresh when you're back online.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
