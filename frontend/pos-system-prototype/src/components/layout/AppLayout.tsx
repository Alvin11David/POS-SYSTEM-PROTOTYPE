import { ReactNode } from "react";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { AppSidebar } from "./AppSidebar";
import { Topbar } from "./Topbar";

function LayoutShell({ children }: { children: ReactNode }) {
  const { state, isMobile } = useSidebar();
  const isExpandedDesktop = !isMobile && state === "expanded";

  return (
    <div
      className={cn(
        "flex min-h-screen w-full overflow-x-hidden bg-background gradient-mesh",
      )}
    >
      <AppSidebar />
      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col origin-top-left transition-[transform,margin,box-shadow,border-radius] duration-450 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
          isExpandedDesktop
            ? "md:mr-1.5 md:mt-1.5 md:scale-[0.992] md:translate-x-0.5 md:translate-y-0.5 md:overflow-hidden md:rounded-3xl md:shadow-xl md:shadow-primary/10"
            : "scale-100 translate-x-0 translate-y-0",
        )}
      >
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
