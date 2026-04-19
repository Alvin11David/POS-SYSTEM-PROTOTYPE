import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DollarSign, Receipt, ShoppingBag, TrendingUp, Plus, Eye } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/StatCard";
import { ReceiptDialog } from "@/components/ReceiptDialog";
import { usePos } from "@/store/posStore";
import { useAuth } from "@/store/authStore";
import { Sale } from "@/types/pos";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const formatCurrency = (n: number) => `$${n.toFixed(2)}`;

export default function Dashboard() {
  const { sales } = usePos();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Sale | null>(null);
  const firstName = (currentUser?.fullName || currentUser?.username || "there").split(" ")[0];

  const today = new Date().toDateString();
  const todaysSales = sales.filter((s) => new Date(s.createdAt).toDateString() === today);
  const todayRevenue = todaysSales.reduce((acc, s) => acc + s.total, 0);
  const itemsSoldToday = todaysSales.reduce(
    (acc, s) => acc + s.items.reduce((a, i) => a + i.quantity, 0),
    0
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-primary via-primary to-primary-glow p-6 md:p-8 shadow-glow-lg">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(0_0%_100%/0.2),_transparent_50%)]" />
        <div className="absolute -bottom-20 -right-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute top-10 right-32 h-32 w-32 rounded-full bg-white/5 blur-2xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div className="text-primary-foreground">
            <Badge className="mb-3 bg-white/15 text-white hover:bg-white/20 border-0 backdrop-blur-sm rounded-full px-3 py-1 text-[11px] font-medium">
              {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
            </Badge>
            <h1 className="text-2xl md:text-[32px] font-bold tracking-tight leading-tight">
              Welcome back, {firstName} 👋
            </h1>
            <p className="text-sm md:text-[15px] text-white/80 mt-1.5 max-w-lg">
              Here's what's happening in your store today. You're doing great!
            </p>
          </div>
          <Button
            onClick={() => navigate("/sales")}
            size="lg"
            className="gap-2 bg-white text-primary hover:bg-white/95 hover:scale-[1.03] transition-spring shadow-lg font-semibold rounded-xl"
          >
            <Plus className="h-4 w-4" /> New Sale
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Sales Today" value={formatCurrency(todayRevenue)} delta={12} icon={DollarSign} tone="primary" />
        <StatCard label="Transactions" value={String(todaysSales.length)} delta={8} icon={Receipt} tone="success" />
        <StatCard label="Items Sold" value={String(itemsSoldToday)} delta={5} icon={ShoppingBag} tone="warning" />
        <StatCard label="All-time Revenue" value={formatCurrency(totalRevenue)} icon={TrendingUp} tone="primary" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2 shadow-sm border-border/60 transition-base hover:shadow-soft">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-[15px]">Sales overview</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Last 7 days performance</p>
            </div>
            <Badge className="bg-primary-soft text-primary hover:bg-primary-soft border-0 rounded-full px-3 font-medium">Weekly</Badge>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ left: -20, right: 8, top: 10 }}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 12,
                    boxShadow: "var(--shadow-lg)",
                  }}
                  labelStyle={{ color: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  formatter={(v: number) => [`$${v}`, "Sales"]}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2.5}
                  fill="url(#salesGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 shadow-sm border-border/60 transition-base hover:shadow-soft">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-[15px]">Recent transactions</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Latest activity</p>
            </div>
            <Badge variant="secondary" className="rounded-full font-medium">{sales.length}</Badge>
          </div>
          {sales.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-secondary to-secondary/50 flex items-center justify-center mb-3 ring-4 ring-secondary/40">
                <Receipt className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-semibold">No sales yet</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">Complete your first sale to see it here.</p>
              <Button size="sm" className="mt-4 gap-2 rounded-xl" onClick={() => navigate("/sales")}>
                <Plus className="h-3.5 w-3.5" /> Start a sale
              </Button>
            </div>
          ) : (
            <ul className="space-y-2">
              {sales.slice(0, 6).map((s) => (
                <li key={s.id}>
                  <button
                    onClick={() => setSelected(s)}
                    className="group flex w-full items-center justify-between rounded-xl border border-border/50 p-3 text-left transition-base hover:border-primary/30 hover:bg-primary-soft/40 hover:shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-primary-soft flex items-center justify-center group-hover:gradient-primary transition-base">
                        <Receipt className="h-4 w-4 text-primary group-hover:text-primary-foreground transition-base" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">#{s.id.slice(0, 6).toUpperCase()}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {s.items.reduce((a, i) => a + i.quantity, 0)} items ·{" "}
                          {new Date(s.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">{formatCurrency(s.total)}</span>
                      <Eye className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-1 transition-base group-hover:opacity-100 group-hover:translate-x-0" />
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <ReceiptDialog sale={selected} open={!!selected} onOpenChange={(o) => !o && setSelected(null)} />
    </div>
  );
}
