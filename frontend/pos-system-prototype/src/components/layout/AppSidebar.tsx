import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  Sparkles,
  Users,
  BookOpen,
  CreditCard,
  Utensils,
  CalendarDays,
  FileText,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Role, useAuth } from "@/store/authStore";

interface NavItem {
  title: string;
  url: string;
  icon: React.ElementType;
  roles?: Role[];
}

const items: NavItem[] = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Sales", url: "/sales", icon: ShoppingCart },
  { title: "Products", url: "/products", icon: Package, roles: ["admin", "manager"] },
  { title: "Reports", url: "/reports", icon: BarChart3, roles: ["admin", "manager"] },
];

const operationsItems: NavItem[] = [
  { title: "Reservations", url: "/reservations", icon: CalendarDays },
  { title: "Tables", url: "/tables", icon: Utensils, roles: ["admin", "manager"] },
  { title: "Packages", url: "/packages", icon: CreditCard, roles: ["admin", "manager"] },
  { title: "Sales Report", url: "/sales-report", icon: FileText, roles: ["admin", "manager"] },
];

const adminItems: NavItem[] = [
  { title: "Staff", url: "/staff", icon: Users, roles: ["admin"] },
];

const helpItems: NavItem[] = [
  { title: "User Guide", url: "/guide", icon: BookOpen },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { currentUser } = useAuth();

  const canSee = (item: NavItem) =>
    !item.roles || (currentUser && item.roles.includes(currentUser.role));

  const renderItems = (list: NavItem[]) =>
    list.filter(canSee).map((item) => {
      const active = location.pathname === item.url;
      return (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton asChild tooltip={item.title} className="h-10 rounded-xl">
            <NavLink
              to={item.url}
              end
              className={`group relative transition-base ${
                active
                  ? "bg-gradient-to-r from-primary/10 via-primary/5 to-transparent text-primary font-semibold"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full gradient-primary" />
              )}
              <item.icon
                className={`h-[18px] w-[18px] transition-base ${
                  active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                }`}
              />
              <span className="text-[13px]">{item.title}</span>
            </NavLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      );
    });

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2.5 px-2 py-3.5">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl gradient-primary shadow-glow">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
            <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-success ring-2 ring-sidebar-background" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-[15px] font-bold tracking-tight">Jambo POS</span>
              <span className="text-[10.5px] text-muted-foreground font-medium">Retail Suite · v1.0</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-1.5 py-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground/80 px-3">
            Workspace
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">{renderItems(items)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground/80 px-3">
            Operations
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">{renderItems(operationsItems)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {currentUser?.role === "admin" && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground/80 px-3">
              Admin
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">{renderItems(adminItems)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground/80 px-3">
            Help
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">{renderItems(helpItems)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!collapsed && currentUser && (
          <div className="mt-auto mx-2 mb-2 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/15 p-3.5">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <p className="text-[11px] font-semibold text-foreground">Pro tip</p>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Press <kbd className="px-1 py-0.5 rounded bg-background border border-border text-[10px] font-mono">⌘K</kbd> to quickly find anything.
            </p>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
