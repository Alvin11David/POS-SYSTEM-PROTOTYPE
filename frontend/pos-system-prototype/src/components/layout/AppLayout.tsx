import { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { AppSidebar } from "./AppSidebar";
import { Topbar } from "./Topbar";

function LayoutShell({ children }: { children: ReactNode }) {
  return (
    <div
      className={cn(
        "flex min-h-screen w-full overflow-x-hidden bg-background gradient-mesh",
      )}
    >
      <AppSidebar />
      <div className={cn("flex min-w-0 flex-1 flex-col")}>
        <Topbar />
        <main className="min-w-0 flex-1 animate-fade-in overflow-x-hidden p-3 sm:p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <LayoutShell>{children}</LayoutShell>
    </SidebarProvider>
  );
}
