import { ReactNode } from "react";
import {
  SidebarProvider,
  SidebarInset,
  useSidebar,
} from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Topbar } from "./Topbar";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { InstallPrompt } from "@/components/InstallPrompt";
import { cn } from "@/lib/utils";

function MainWrapper({ children }: { children: ReactNode }) {
  const { state, isMobile } = useSidebar();
  const isOpen = state === "expanded";

  // Always leave space for the sidebar, even when collapsed
  // On desktop, margin-left is sidebar width or icon width
  // On mobile, sidebar is off-canvas so no margin needed
  const marginLeft = !isMobile
    ? isOpen
      ? "var(--sidebar-width)"
      : "var(--sidebar-width-icon)"
    : undefined;

  return (
    <SidebarInset className="bg-secondary/50 overflow-hidden">
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] bg-background origin-center",
          isOpen && !isMobile
            ? "my-2 mr-2 ml-1 rounded-2xl overflow-hidden border shadow-2xl scale-[0.98] border-border/60"
            : "m-0 rounded-none border-transparent scale-100",
        )}
        style={{
          marginLeft,
          transition: "margin-left 0.3s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <Topbar />
        <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 animate-fade-in overflow-y-auto">
          {children}
        </main>
        <OfflineIndicator />
        <InstallPrompt />
      </div>
    </SidebarInset>
  );
}

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <MainWrapper>{children}</MainWrapper>
    </SidebarProvider>
  );
}
