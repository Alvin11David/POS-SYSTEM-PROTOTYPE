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
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Welcome back, {firstName} 👋</h1>
          <p className="text-sm text-muted-foreground mt-1">Here's what's happening in your store today.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="rounded-full px-3 py-1.5 text-xs font-medium">
            {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
          </Badge>
          <Button onClick={() => navigate("/sales")} className="gap-2 shadow-glow transition-base hover:scale-[1.02]">
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
        <Card className="p-6 lg:col-span-2 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Sales overview</h3>
              <p className="text-xs text-muted-foreground">Last 7 days</p>
            </div>
            <Badge className="bg-primary-soft text-primary hover:bg-primary-soft">Weekly</Badge>
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

        <Card className="p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Recent transactions</h3>
            <Badge variant="secondary" className="rounded-full">{sales.length}</Badge>
          </div>
          {sales.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center mb-3">
                <Receipt className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">No sales yet</p>
              <p className="text-xs text-muted-foreground mt-1">Complete your first sale to see it here.</p>
              <Button size="sm" className="mt-4 gap-2" onClick={() => navigate("/sales")}>
                <Plus className="h-3.5 w-3.5" /> Start a sale
              </Button>
            </div>
          ) : (
            <ul className="space-y-3">
              {sales.slice(0, 6).map((s) => (
                <li key={s.id}>
                  <button
                    onClick={() => setSelected(s)}
                    className="group flex w-full items-center justify-between rounded-xl border border-border/60 p-3 text-left transition-base hover:border-primary/30 hover:bg-secondary/40"
                  >
                    <div>
                      <p className="text-sm font-medium">#{s.id.slice(0, 6).toUpperCase()}</p>
                      <p className="text-xs text-muted-foreground">
                        {s.items.reduce((a, i) => a + i.quantity, 0)} items ·{" "}
                        {new Date(s.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{formatCurrency(s.total)}</span>
                      <Eye className="h-4 w-4 text-muted-foreground opacity-0 transition-base group-hover:opacity-100" />
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
