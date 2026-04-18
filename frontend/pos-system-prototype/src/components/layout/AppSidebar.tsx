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
          <SidebarMenuButton asChild tooltip={item.title}>
            <NavLink
              to={item.url}
              end
              className={`transition-base ${
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "hover:bg-sidebar-accent/60"
              }`}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.title}</span>
            </NavLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      );
    });

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2.5 px-2 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl gradient-primary shadow-glow">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight">Jambo POS</span>
              <span className="text-[11px] text-muted-foreground">Retail · v1.0</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderItems(items)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Operations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderItems(operationsItems)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {currentUser?.role === "admin" && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>{renderItems(adminItems)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel>Help</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderItems(helpItems)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
