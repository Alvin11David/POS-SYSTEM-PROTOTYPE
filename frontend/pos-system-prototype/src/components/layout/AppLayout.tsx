import { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Topbar } from "./Topbar";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full overflow-x-hidden bg-background gradient-mesh">
        <AppSidebar />
        <div className="flex-1 flex min-w-0 flex-col">
          <Topbar />
          <main className="min-w-0 flex-1 animate-fade-in overflow-x-hidden p-3 sm:p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
