import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/StatCard";
import { ReceiptDialog } from "@/components/ReceiptDialog";
import { DollarSign, Download, Receipt, ShoppingBag, TrendingUp } from "lucide-react";
import { usePos } from "@/store/posStore";
import { Sale } from "@/types/pos";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";

type Period = "today" | "week" | "all";

export default function Reports() {
  const { sales } = usePos();
  const [period, setPeriod] = useState<Period>("today");
  const [selected, setSelected] = useState<Sale | null>(null);

  const filteredSales = useMemo(() => {
    const now = new Date();
    if (period === "today") {
      const today = now.toDateString();
      return sales.filter((s) => new Date(s.createdAt).toDateString() === today);
    }
    if (period === "week") {
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      return sales.filter((s) => new Date(s.createdAt) >= weekAgo);
    }
    return sales;
  }, [sales, period]);

  const revenue = filteredSales.reduce((a, s) => a + s.total, 0);
  const items = filteredSales.reduce((a, s) => a + s.items.reduce((b, i) => b + i.quantity, 0), 0);
  const avgTicket = filteredSales.length ? revenue / filteredSales.length : 0;

  const topProducts = useMemo(() => {
    const map = new Map<string, { name: string; qty: number; revenue: number }>();
    filteredSales.forEach((s) =>
      s.items.forEach((i) => {
        const cur = map.get(i.id) ?? { name: i.name, qty: 0, revenue: 0 };
        cur.qty += i.quantity;
        cur.revenue += i.quantity * i.price;
        map.set(i.id, cur);
      })
    );
    return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 6);
  }, [filteredSales]);

  const exportCsv = () => {
    if (filteredSales.length === 0) {
      toast.error("Nothing to export");
      return;
    }
    const rows = [
      ["Sale ID", "Date", "Items", "Total"],
      ...filteredSales.map((s) => [
        s.id,
        new Date(s.createdAt).toISOString(),
        s.items.map((i) => `${i.quantity}x ${i.name}`).join("; "),
        s.total.toFixed(2),
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `jambo-sales-${period}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  };

  const COLORS = ["hsl(var(--primary))", "hsl(var(--primary-glow))"];
  const periodLabel = { today: "Today", week: "Last 7 days", all: "All time" }[period];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">Track performance and best-sellers.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-full bg-secondary p-1">
            {(["today", "week", "all"] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-base ${
                  period === p ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {p === "today" ? "Today" : p === "week" ? "7 days" : "All"}
              </button>
            ))}
          </div>
          <Button variant="outline" onClick={exportCsv} className="gap-2">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={`Sales · ${periodLabel}`} value={`$${revenue.toFixed(2)}`} icon={DollarSign} tone="primary" />
        <StatCard label="Transactions" value={String(filteredSales.length)} icon={Receipt} tone="success" />
        <StatCard label="Items Sold" value={String(items)} icon={ShoppingBag} tone="warning" />
        <StatCard label="Avg. Ticket" value={`$${avgTicket.toFixed(2)}`} icon={TrendingUp} tone="primary" />
      </div>

      <Card className="p-6 shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold">Top products</h3>
            <p className="text-xs text-muted-foreground">Ranked by revenue · {periodLabel.toLowerCase()}</p>
          </div>
          <Badge className="bg-primary-soft text-primary hover:bg-primary-soft">{periodLabel}</Badge>
        </div>

        {topProducts.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm font-medium">No sales data yet</p>
            <p className="text-xs text-muted-foreground mt-1">Complete sales to see your reports.</p>
          </div>
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts} margin={{ left: -20, right: 8, top: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: "hsl(var(--accent) / 0.4)" }}
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 12,
                    boxShadow: "var(--shadow-lg)",
                  }}
                  formatter={(v: number) => [`$${v.toFixed(2)}`, "Revenue"]}
                />
                <Bar dataKey="revenue" radius={[8, 8, 0, 0]}>
                  {topProducts.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {topProducts.length > 0 && (
          <Card className="p-6 shadow-soft">
            <h3 className="font-semibold mb-4">Best-sellers</h3>
            <ul className="divide-y divide-border">
              {topProducts.map((p, i) => (
                <li key={p.name} className="flex items-center gap-4 py-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-soft text-primary text-sm font-bold">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.qty} sold</p>
                  </div>
                  <span className="text-sm font-semibold">${p.revenue.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        <Card className="p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">All transactions</h3>
            <Badge variant="secondary" className="rounded-full">{filteredSales.length}</Badge>
          </div>
          {filteredSales.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground">No transactions in this period.</p>
            </div>
          ) : (
            <ul className="space-y-2 max-h-80 overflow-y-auto">
              {filteredSales.map((s) => (
                <li key={s.id}>
                  <button
                    onClick={() => setSelected(s)}
                    className="flex w-full items-center justify-between rounded-xl border border-border/60 p-3 text-left transition-base hover:border-primary/30 hover:bg-secondary/40"
                  >
                    <div>
                      <p className="text-sm font-medium">#{s.id.slice(0, 6).toUpperCase()}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(s.createdAt).toLocaleString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <span className="text-sm font-semibold">${s.total.toFixed(2)}</span>
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
