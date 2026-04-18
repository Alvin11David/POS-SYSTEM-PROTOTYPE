import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PosProvider } from "@/store/posStore";
import { PosExtraProvider } from "@/store/posExtraStore";
import { AuthProvider } from "@/store/authStore";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index.tsx";
import Sales from "./pages/Sales.tsx";
import Products from "./pages/Products.tsx";
import Reports from "./pages/Reports.tsx";
import SalesReport from "./pages/SalesReport.tsx";
import Packages from "./pages/Packages.tsx";
import Tables from "./pages/Tables.tsx";
import Reservations from "./pages/Reservations.tsx";
import Staff from "./pages/Staff.tsx";
import Guide from "./pages/Guide.tsx";
import Login from "./pages/Login.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

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
        <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
        <Route path="/sales" element={<ProtectedRoute><Sales /></ProtectedRoute>} />
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
          path="/sales-report"
          element={
            <ProtectedRoute roles={["admin", "manager"]}>
              <SalesReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/packages"
          element={
            <ProtectedRoute roles={["admin", "manager"]}>
              <Packages />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tables"
          element={
            <ProtectedRoute roles={["admin", "manager"]}>
              <Tables />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reservations"
          element={<ProtectedRoute><Reservations /></ProtectedRoute>}
        />
        <Route path="/guide" element={<ProtectedRoute><Guide /></ProtectedRoute>} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <PosProvider>
          <PosExtraProvider>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </PosExtraProvider>
        </PosProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
