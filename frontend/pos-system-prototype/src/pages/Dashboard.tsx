import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  DollarSign,
  Receipt,
  ShoppingBag,
  TrendingUp,
  Plus,
  Eye,
  Clock3,
  Sparkles,
  Activity,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/StatCard";
import { ReceiptDialog } from "@/components/ReceiptDialog";
import { usePos } from "@/store/posStore";
import { useAuth } from "@/store/authStore";
import { useCurrency } from "@/store/currencyStore";
import { useTour } from "@/store/tourStore";
import { Sale } from "@/types/pos";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function Dashboard() {
  const { sales } = usePos();
  const { currentUser } = useAuth();
  const { formatCurrency } = useCurrency();
  const { start: startTour } = useTour();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Sale | null>(null);
  const firstName = (
    currentUser?.fullName ||
    currentUser?.username ||
    "there"
  ).split(" ")[0];

  const today = new Date().toDateString();
  const todaysSales = sales.filter(
    (s) => new Date(s.createdAt).toDateString() === today,
  );
  const todayRevenue = todaysSales.reduce((acc, s) => acc + s.total, 0);
  const itemsSoldToday = todaysSales.reduce(
    (acc, s) => acc + s.items.reduce((a, i) => a + i.quantity, 0),
    0,
  );
  const totalRevenue = sales.reduce((a, s) => a + s.total, 0);

  const chartData = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const key = d.toDateString();
      const total = sales
        .filter((s) => new Date(s.createdAt).toDateString() === key)
        .reduce((a, s) => a + s.total, 0);
      return {
        day: d.toLocaleDateString(undefined, { weekday: "short" }),
        sales: Number(total.toFixed(2)),
      };
    });
  }, [sales]);

  const weekRevenue = chartData.reduce((acc, day) => acc + day.sales, 0);
  const bestDay = chartData.reduce((best, day) =>
    day.sales > best.sales ? day : best,
  );
  const avgTicket =
    todaysSales.length > 0 ? todayRevenue / todaysSales.length : 0;

  return (
    <div className="relative mx-auto max-w-375 space-y-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-115 overflow-hidden rounded-4xl">
        <div className="absolute inset-0 bg-[radial-gradient(60%_55%_at_20%_22%,hsl(var(--primary)/0.16),transparent_68%),radial-gradient(45%_40%_at_92%_8%,hsl(var(--success)/0.18),transparent_72%)]" />
      </div>

      <div
        className="relative overflow-hidden rounded-3xl border border-border/70 bg-linear-to-br from-slate-900 via-slate-900 to-primary/80 p-5 text-primary-foreground shadow-elevated sm:p-6 md:p-8"
        data-tour="dashboard-hero"
      >
        <div className="absolute inset-0 bg-[linear-gradient(120deg,hsl(0_0%_100%/0.15),transparent_40%)]" />
        <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-success/20 blur-3xl" />
        <div className="absolute -bottom-16 -left-10 h-44 w-44 rounded-full bg-primary-glow/30 blur-3xl" />

        <div className="relative grid gap-6 xl:grid-cols-[1.15fr_0.85fr] xl:items-end">
          <div className="min-w-0 animate-fade-in">
            <Badge className="mb-3 rounded-full border-0 bg-white/15 px-3 py-1 text-[11px] font-medium text-white backdrop-blur-sm hover:bg-white/20">
              {new Date().toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </Badge>

            <h1 className="text-2xl font-black leading-tight tracking-tight sm:text-3xl md:text-[36px]">
              Welcome back, to your {firstName} 👋
            </h1>

            <p className="mt-2 max-w-xl text-sm text-white/80 md:text-[15px]">
              Here is your command center for today. Revenue, activity, and
              quick actions are all in one place.
            </p>

            <div className="mt-5 grid gap-2 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/15 bg-white/8 p-3 backdrop-blur-sm">
                <p className="text-[11px] uppercase tracking-wide text-white/70">
                  Today Revenue
                </p>
                <p className="mt-1 text-lg font-extrabold tracking-tight">
                  {formatCurrency(todayRevenue)}
                </p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/8 p-3 backdrop-blur-sm">
                <p className="text-[11px] uppercase tracking-wide text-white/70">
                  Avg Ticket
                </p>
                <p className="mt-1 text-lg font-extrabold tracking-tight">
                  {formatCurrency(avgTicket)}
                </p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/8 p-3 backdrop-blur-sm">
                <p className="text-[11px] uppercase tracking-wide text-white/70">
                  Top Day
                </p>
                <p className="mt-1 text-lg font-extrabold tracking-tight">
                  {bestDay.day}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 rounded-2xl border border-white/15 bg-black/10 p-4 backdrop-blur-md animate-fade-in [animation-delay:120ms]">
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/10 px-3 py-2.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-white/75">
                <Clock3 className="h-3.5 w-3.5" /> Updated now
              </div>
              <span className="text-sm font-bold">{todaysSales.length}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/10 px-3 py-2.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-white/75">
                <Activity className="h-3.5 w-3.5" /> Week Revenue
              </div>
              <span className="text-sm font-bold">
                {formatCurrency(weekRevenue)}
              </span>
            </div>
            <Button
              onClick={() => navigate("/products")}
              size="lg"
              className="h-11 gap-2 rounded-xl bg-white font-semibold text-slate-900 shadow-lg transition-spring hover:scale-[1.02] hover:bg-white/95"
            >
              <Plus className="h-4 w-4" /> New Product
            </Button>
            <Button
              onClick={() => navigate("/reports")}
              variant="outline"
              className="h-11 gap-2 rounded-xl border-white/25 bg-white/10 font-semibold text-white hover:bg-white/20"
            >
              <Sparkles className="h-4 w-4" /> View Reports
            </Button>
            <Button
              onClick={startTour}
              variant="outline"
              className="h-11 gap-2 rounded-xl border-white/25 bg-white/10 font-semibold text-white hover:bg-white/20"
            >
              <Sparkles className="h-4 w-4" /> Start Tour
            </Button>
          </div>
        </div>
      </div>

      <div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        data-tour="dashboard-stats"
      >
        <StatCard
          label="Sales Today"
          value={formatCurrency(todayRevenue)}
          delta={12}
          icon={DollarSign}
          tone="primary"
        />
        <StatCard
          label="Transactions"
          value={String(todaysSales.length)}
          delta={8}
          icon={Receipt}
          tone="success"
        />
        <StatCard
          label="Items Sold"
          value={String(itemsSoldToday)}
          delta={5}
          icon={ShoppingBag}
          tone="warning"
        />
        <StatCard
          label="All-time Revenue"
          value={formatCurrency(totalRevenue)}
          icon={TrendingUp}
          tone="primary"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="overflow-hidden border-border/60 bg-linear-to-b from-card to-background/40 p-4 shadow-soft transition-base hover:shadow-elevated sm:p-6 lg:col-span-2 animate-fade-in [animation-delay:140ms]">
          <div className="pointer-events-none absolute right-0 top-0 h-28 w-28 rounded-full bg-primary/10 blur-2xl" />
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-[15px]">Sales overview</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Last 7 days performance
              </p>
            </div>
            <Badge className="rounded-full border-0 bg-primary-soft px-3 font-medium text-primary hover:bg-primary-soft">
              Weekly
            </Badge>
          </div>
          <div className="h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ left: -20, right: 8, top: 10 }}
              >
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0.35}
                    />
                    <stop
                      offset="100%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="4 4"
                  stroke="hsl(var(--border))"
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 12,
                    boxShadow: "var(--shadow-lg)",
                  }}
                  labelStyle={{
                    color: "hsl(var(--muted-foreground))",
                    fontSize: 12,
                  }}
                  formatter={(v: number) => [formatCurrency(v), "Sales"]}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2.8}
                  fill="url(#salesGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="border-border/60 bg-card/90 p-4 shadow-soft transition-base hover:shadow-elevated sm:p-6 animate-fade-in [animation-delay:220ms]">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-[15px]">Recent transactions</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Latest activity
              </p>
            </div>
            <Badge variant="secondary" className="rounded-full font-medium">
              {sales.length}
            </Badge>
          </div>
          {sales.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-secondary to-secondary/50 ring-4 ring-secondary/40">
                <Receipt className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-semibold">No sales yet</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-50">
                Complete your first sale to see it here.
              </p>
              <Button
                size="sm"
                className="mt-4 gap-2 rounded-xl"
                onClick={() => navigate("/sales")}
              >
                <Plus className="h-3.5 w-3.5" /> Start a sale
              </Button>
            </div>
          ) : (
            <ul className="space-y-2">
              {sales.slice(0, 6).map((s) => (
                <li key={s.id}>
                  <button
                    onClick={() => setSelected(s)}
                    className="group flex w-full items-center justify-between rounded-2xl border border-border/50 bg-background/80 p-3 text-left transition-base hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary-soft/30 hover:shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft transition-base group-hover:gradient-primary">
                        <Receipt className="h-4 w-4 text-primary group-hover:text-primary-foreground transition-base" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">
                          #{s.id.slice(0, 6).toUpperCase()}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {s.items.reduce((a, i) => a + i.quantity, 0)} items ·{" "}
                          {new Date(s.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">
                        {formatCurrency(s.total)}
                      </span>
                      <Eye className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-1 transition-base group-hover:opacity-100 group-hover:translate-x-0" />
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <ReceiptDialog
        sale={selected}
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
      />
    </div>
  );
}
