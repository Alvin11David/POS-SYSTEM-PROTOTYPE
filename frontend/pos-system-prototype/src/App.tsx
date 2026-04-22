import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PosProvider } from "@/store/posStore";
import { PosExtraProvider } from "@/store/posExtraStore";
import { AuthProvider } from "@/store/authStore";
import { CurrencyProvider } from "@/store/currencyStore";
import { TourProvider } from "@/store/tourStore";
import { ThemeProvider } from "@/store/themeStore";
import { OfflineProvider } from "@/store/offlineStore";
import { SyncProvider } from "@/store/syncStore";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { TourOverlay } from "@/components/TourOverlay";
import { SyncStatus } from "@/components/SyncStatus";
import { NotificationProvider } from "@/store/notificationStore";
import Index from "./pages/Index.tsx";
import Sales from "./pages/Sales.tsx";
import Products from "./pages/Products.tsx";
import Reports from "./pages/Reports.tsx";
import Staff from "./pages/Staff.tsx";
import Guide from "./pages/Guide.tsx";
import Notifications from "./pages/Notifications.tsx";
import Login from "./pages/Login.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();
const API_BASE = import.meta.env.VITE_API_URL || "";

function AppRoutes() {
  const location = useLocation();
  const isLogin = location.pathname === "/login";

  if (isLogin) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
      </Routes>
    );
  }

  return (
    <AppLayout>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Index />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales"
          element={
            <ProtectedRoute>
              <Sales />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products"
          element={
            <ProtectedRoute roles={["admin", "manager"]}>
              <Products />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute roles={["admin", "manager"]}>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff"
          element={
            <ProtectedRoute roles={["admin"]}>
              <Staff />
            </ProtectedRoute>
          }
        />
        <Route
          path="/guide"
          element={
            <ProtectedRoute>
              <Guide />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <OfflineProvider>
        <SyncProvider apiBase={API_BASE}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AuthProvider>
              <CurrencyProvider>
                <PosProvider>
                  <PosExtraProvider>
                    <NotificationProvider>
                      <BrowserRouter>
                        <TourProvider>
                          <AppRoutes />
                          <TourOverlay />
                          <SyncStatus />
                        </TourProvider>
                      </BrowserRouter>
                    </NotificationProvider>
                  </PosExtraProvider>
                </PosProvider>
              </CurrencyProvider>
            </AuthProvider>
          </TooltipProvider>
        </SyncProvider>
      </OfflineProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
