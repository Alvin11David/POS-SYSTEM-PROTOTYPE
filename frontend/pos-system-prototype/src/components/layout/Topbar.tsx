import { useNavigate } from "react-router-dom";
import {
  Bell,
  BookOpen,
  KeyRound,
  LogOut,
  Search,
  Settings,
  ShoppingCart,
  ArrowRight,
  Trash2,
  Moon,
  Sun,
  Check,
} from "lucide-react";
import { ROLE_LABEL, useAuth } from "@/store/authStore";
import { useNotification } from "@/store/notificationStore";
import { useTheme } from "@/store/themeStore";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState, useMemo, useEffect, useRef } from "react";
import { usePos } from "@/store/posStore";
import { useCurrency } from "@/store/currencyStore";
import { toast } from "sonner";
import { ChangePasswordDialog } from "@/components/ChangePasswordDialog";
import { cn } from "@/lib/utils";

export function Topbar() {
  const navigate = useNavigate();
  const { products, sales } = usePos();
  const { formatCurrency } = useCurrency();
  const { currentUser, logout } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const {
    notifications,
    unreadCount,
    fetchNotifications,
    deleteNotification,
    markAsRead,
  } = useNotification();
  const initials = (currentUser?.fullName || currentUser?.username || "U")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [pwdOpen, setPwdOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch notifications on mount and poll every 10 seconds
  useEffect(() => {
    fetchNotifications();

    // Poll for new notifications every 10 seconds
    const interval = setInterval(() => {
      fetchNotifications();
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Cmd/Ctrl + K focuses search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const results = useMemo(() => {
    if (!query.trim()) return { products: [], sales: [] };
    const q = query.toLowerCase();
    return {
      products: products
        .filter((p) => p.name.toLowerCase().includes(q))
        .slice(0, 5),
      sales: sales
        .filter(
          (s) =>
            s.id.toLowerCase().includes(q) ||
            s.items.some((i) => i.name.toLowerCase().includes(q)),
        )
        .slice(0, 4),
    };
  }, [query, products, sales]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return "🟢";
      case "error":
        return "🔴";
      case "warning":
        return "🟡";
      case "info":
      default:
        return "🔵";
    }
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 min-w-0 items-center gap-2 border-b border-border/60 bg-background/75 px-3 backdrop-blur-xl transition-[padding] duration-300 ease-out motion-reduce:transition-none sm:gap-3 sm:px-4",
      )}
      data-tour="topbar"
    >
      <SidebarTrigger
        className="text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg"
        data-tour="sidebar-trigger"
      />

      <Popover open={open && query.length > 0} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div
            data-tour="topbar-search"
            className={cn(
              "relative hidden min-w-0 flex-1 md:ml-1 md:block md:max-w-sm lg:max-w-md",
            )}
          >
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
              }}
              onFocus={() => query && setOpen(true)}
              placeholder="Search products, transactions..."
              className="h-10 pl-9 pr-16 bg-secondary/60 border-transparent focus-visible:bg-background"
            />
            <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              ⌘K
            </kbd>
          </div>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-(--radix-popover-trigger-width) p-0"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="max-h-80 overflow-y-auto p-2">
            {results.products.length === 0 && results.sales.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                No results found
              </p>
            ) : (
              <>
                {results.products.length > 0 && (
                  <div>
                    <p className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Products
                    </p>
                    {results.products.map((p) => (
                      <button
                        key={p.id}
                        className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-base hover:bg-accent"
                        onClick={() => {
                          navigate("/products");
                          setQuery("");
                          setOpen(false);
                        }}
                      >
                        <span className="text-lg">{p.emoji ?? "📦"}</span>
                        <span className="flex-1 text-sm">{p.name}</span>
                        <span className="text-xs font-semibold text-primary">
                          {formatCurrency(p.price)}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                {results.sales.length > 0 && (
                  <div className="mt-1">
                    <p className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Transactions
                    </p>
                    {results.sales.map((s) => (
                      <button
                        key={s.id}
                        className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-base hover:bg-accent"
                        onClick={() => {
                          navigate("/reports");
                          setQuery("");
                          setOpen(false);
                        }}
                      >
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                        <span className="flex-1 text-sm">
                          #{s.id.slice(0, 6).toUpperCase()}
                        </span>
                        <span className="text-xs font-semibold">
                          {formatCurrency(s.total)}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </PopoverContent>
      </Popover>

      <div className="ml-auto flex min-w-0 items-center gap-1 sm:gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              aria-label="Toggle theme"
            >
              {resolvedTheme === "dark" ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")}>
              <Sun className="mr-2 h-4 w-4" />
              Light
              {theme === "light" && <Check className="ml-auto h-4 w-4" />}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              <Moon className="mr-2 h-4 w-4" />
              Dark
              {theme === "dark" && <Check className="ml-auto h-4 w-4" />}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              <Settings className="mr-2 h-4 w-4" />
              System
              {theme === "system" && <Check className="ml-auto h-4 w-4" />}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-full"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="w-[calc(100vw-2rem)] max-w-96 p-0"
          >
            <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
              <p className="text-sm font-semibold">Notifications</p>
              {unreadCount > 0 && (
                <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-semibold text-primary">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <Bell className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    You're all caught up
                  </p>
                </div>
              ) : (
                <>
                  {notifications.slice(0, 5).map((n) => (
                    <div
                      key={n.id}
                      className={`flex items-start gap-3 border-b border-border/40 px-4 py-3 last:border-0 transition-base hover:bg-accent/40 group ${!n.isRead ? "bg-primary/5" : ""
                        }`}
                    >
                      <span className="mt-1 text-lg">
                        {getNotificationIcon(n.type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold">{n.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {n.message}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-1">
                          {new Date(n.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteNotification(n.id)}
                        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity rounded p-1 hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                      </button>
                    </div>
                  ))}
                  {notifications.length > 5 && (
                    <button
                      onClick={() => navigate("/notifications")}
                      className="flex w-full items-center justify-center gap-2 border-t border-border/60 px-4 py-2.5 text-sm font-semibold text-primary transition-base hover:bg-accent/60"
                    >
                      View all notifications
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </>
              )}
            </div>
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full border border-border bg-card px-1.5 py-1 pr-2 sm:pr-3 shadow-sm transition-base hover:shadow-soft hover:border-primary/30">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="gradient-primary text-[11px] font-semibold text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div
                className={cn(
                  "hidden flex-col items-start leading-tight",
                  "lg:flex",
                )}
              >
                <span className="text-xs font-semibold">
                  {currentUser?.fullName || currentUser?.username || "Guest"}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {currentUser ? ROLE_LABEL[currentUser.role] : "Not signed in"}
                </span>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm font-semibold">
                  {currentUser?.fullName || currentUser?.username || "Guest"}
                </span>
                <span className="text-xs font-normal text-muted-foreground">
                  @{currentUser?.username ?? "guest"} ·{" "}
                  {currentUser ? ROLE_LABEL[currentUser.role] : "—"}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/guide")}>
              <BookOpen className="mr-2 h-4 w-4" /> User guide
            </DropdownMenuItem>
            {currentUser && (
              <DropdownMenuItem onClick={() => setPwdOpen(true)}>
                <KeyRound className="mr-2 h-4 w-4" /> Change password
              </DropdownMenuItem>
            )}
            {currentUser?.role === "admin" && (
              <DropdownMenuItem onClick={() => navigate("/staff")}>
                <Settings className="mr-2 h-4 w-4" /> Staff & roles
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => {
                logout();
                toast.success("Signed out");
                navigate("/login", { replace: true });
              }}
            >
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ChangePasswordDialog open={pwdOpen} onOpenChange={setPwdOpen} />
    </header>
  );
}
