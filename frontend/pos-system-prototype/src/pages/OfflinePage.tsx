import { WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-md w-full mx-auto px-6 py-4">
        <div className="rounded-lg bg-white shadow-lg p-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="bg-red-100 rounded-full p-4">
              <WifiOff className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-900">No Internet Connection</h1>
            <p className="text-slate-600">
              You're offline right now. Some features may be limited, but you can still use the app if it was installed while online.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
            <p className="font-semibold mb-2">Tip:</p>
            <p>
              If you just installed the app, try opening it while connected to the internet first. This lets the app download and cache everything it needs to work offline.
            </p>
          </div>

          <div className="space-y-3 pt-4">
            <p className="text-sm text-slate-600">Waiting for connection...</p>
            <Button onClick={handleRetry} className="w-full gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
