import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="text-center max-w-md animate-fade-in">
        <p className="text-7xl font-bold tracking-tight bg-gradient-to-br from-primary to-primary-glow bg-clip-text text-transparent">
          404
        </p>
        <h1 className="mt-3 text-2xl font-bold">Page not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The page <code className="rounded bg-secondary px-1.5 py-0.5 text-xs">{location.pathname}</code> doesn't exist.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Button variant="outline" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Go back
          </Button>
          <Button onClick={() => navigate("/")} className="gap-2 shadow-glow">
            <Home className="h-4 w-4" /> Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
