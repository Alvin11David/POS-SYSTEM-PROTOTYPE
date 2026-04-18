import { useNavigate } from "react-router-dom";
import { Bell, BookOpen, KeyRound, LogOut, Search, Settings, ShoppingCart } from "lucide-react";
import { ROLE_LABEL, useAuth } from "@/store/authStore";
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
import { toast } from "sonner";
import { ChangePasswordDialog } from "@/components/ChangePasswordDialog";

export function Topbar() {
  const navigate = useNavigate();
  const { products, sales } = usePos();
  const { currentUser, logout } = useAuth();
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
      products: products.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 5),
      sales: sales
        .filter(
          (s) =>
            s.id.toLowerCase().includes(q) ||
            s.items.some((i) => i.name.toLowerCase().includes(q))
        )
        .slice(0, 4),
    };
  }, [query, products, sales]);

  const notifications = useMemo(
    () =>
      sales.slice(0, 4).map((s) => ({
        id: s.id,
        title: `Sale #${s.id.slice(0, 6).toUpperCase()}`,
        body: `$${s.total.toFixed(2)} · ${s.items.reduce((a, i) => a + i.quantity, 0)} items`,
        time: new Date(s.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      })),
    [sales]
  );

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md">
      <SidebarTrigger className="text-muted-foreground hover:text-foreground" />

      <Popover open={open && query.length > 0} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative hidden md:block flex-1 max-w-md">
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
          className="w-[var(--radix-popover-trigger-width)] p-0"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="max-h-80 overflow-y-auto p-2">
            {results.products.length === 0 && results.sales.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">No results found</p>
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
                        <span className="text-xs font-semibold text-primary">${p.price.toFixed(2)}</span>
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
                        <span className="flex-1 text-sm">#{s.id.slice(0, 6).toUpperCase()}</span>
                        <span className="text-xs font-semibold">${s.total.toFixed(2)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </PopoverContent>
      </Popover>

      <div className="ml-auto flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative rounded-full" aria-label="Notifications">
              <Bell className="h-4 w-4" />
              {notifications.length > 0 && (
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <p className="text-sm font-semibold">Notifications</p>
              <span className="text-xs text-muted-foreground">{notifications.length} new</span>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-muted-foreground">You're all caught up</p>
              ) : (
                notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => navigate("/reports")}
                    className="flex w-full items-start gap-3 border-b border-border/60 px-4 py-3 text-left last:border-0 transition-base hover:bg-accent"
                  >
                    <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{n.title}</p>
                      <p className="text-xs text-muted-foreground">{n.body}</p>
                    </div>
                    <span className="text-[11px] text-muted-foreground">{n.time}</span>
                  </button>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2.5 rounded-full border border-border bg-card px-1.5 py-1 pr-3 shadow-sm transition-base hover:shadow-soft hover:border-primary/30">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="gradient-primary text-[11px] font-semibold text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:flex flex-col leading-tight items-start">
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
