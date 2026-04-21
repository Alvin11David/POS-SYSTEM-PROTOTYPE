import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/StatCard";
import { ReceiptDialog } from "@/components/ReceiptDialog";
import {
  DollarSign,
  Download,
  Receipt,
  ShoppingBag,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { usePos } from "@/store/posStore";
import { useCurrency } from "@/store/currencyStore";
import { Sale } from "@/types/pos";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

type Period = "today" | "week" | "all";

export default function Reports() {
  const { sales } = usePos();
  const { formatCurrency } = useCurrency();
  const [period, setPeriod] = useState<Period>("today");
  const [selected, setSelected] = useState<Sale | null>(null);

  const filteredSales = useMemo(() => {
    const now = new Date();
    if (period === "today") {
      const today = now.toDateString();
      return sales.filter(
        (s) => new Date(s.createdAt).toDateString() === today,
      );
    }
    if (period === "week") {
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      return sales.filter((s) => new Date(s.createdAt) >= weekAgo);
    }
    return sales;
  }, [sales, period]);

  const revenue = filteredSales.reduce((a, s) => a + s.total, 0);
  const items = filteredSales.reduce(
    (a, s) => a + s.items.reduce((b, i) => b + i.quantity, 0),
    0,
  );
  const avgTicket = filteredSales.length ? revenue / filteredSales.length : 0;

  const topProducts = useMemo(() => {
    const map = new Map<
      string,
      { name: string; qty: number; revenue: number }
    >();
    filteredSales.forEach((s) =>
      s.items.forEach((i) => {
        const cur = map.get(i.id) ?? { name: i.name, qty: 0, revenue: 0 };
        cur.qty += i.quantity;
        cur.revenue += i.quantity * i.price;
        map.set(i.id, cur);
      }),
    );
    return Array.from(map.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);
  }, [filteredSales]);

  const exportCsv = () => {
    if (filteredSales.length === 0) {
      toast.error("Nothing to export");
      return;
    }
    const rows = [
      [
        "Sale ID",
        "Date",
        "Items",
        "Total",
        "Client Name",
        "Client Phone",
        "Sold By",
        "Notes",
      ],
      ...filteredSales.map((s) => [
        s.id,
        new Date(s.createdAt).toISOString(),
        s.items.map((i) => `${i.quantity}x ${i.name}`).join("; "),
        s.total.toFixed(2),
        s.clientName || "",
        s.clientPhone || "",
        s.soldBy || "",
        s.notes || "",
      ]),
    ];
    const csv = rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
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
  const periodLabel = { today: "Today", week: "Last 7 days", all: "All time" }[
    period
  ];

  return (
    <div
      className="relative mx-auto max-w-375 space-y-6"
      data-tour="reports-screen"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 overflow-hidden rounded-4xl">
        <div className="absolute inset-0 bg-[radial-gradient(40%_50%_at_30%_35%,hsl(var(--primary)/0.14),transparent_58%),radial-gradient(35%_45%_at_85%_20%,hsl(var(--success)/0.16),transparent_65%)]" />
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-linear-to-br from-slate-900 via-slate-900 to-primary/75 p-5 text-primary-foreground shadow-elevated sm:p-6">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,hsl(0_0%_100%/0.15),transparent_40%)]" />
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-success/20 blur-3xl" />

        <div className="relative grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/70">
              Analytics & Performance
            </p>
            <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">
              Sales Reports
            </h1>
            <p className="mt-2 max-w-md text-sm text-white/80">
              Track revenue trends, identify top performers, and export detailed
              transaction data.
            </p>
          </div>

          <Button
            variant="outline"
            onClick={exportCsv}
            className="gap-2 border-white/25 bg-white/10 text-white hover:bg-white/20 font-semibold rounded-xl"
          >
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      <Card className="border-border/60 bg-linear-to-b from-card to-background/40 p-4 shadow-soft sm:p-5 animate-fade-in">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold">Reporting period</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Filter metrics by timeframe
            </p>
          </div>
          <div className="flex rounded-xl border border-border/70 bg-secondary/60 p-1.5 w-full sm:w-auto">
            {(["today", "week", "all"] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-base ${
                  period === p
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {p === "today"
                  ? "Today"
                  : p === "week"
                    ? "Last 7 days"
                    : "All-time"}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={`Sales · ${periodLabel}`}
          value={formatCurrency(revenue)}
          icon={DollarSign}
          tone="primary"
        />
        <StatCard
          label="Transactions"
          value={String(filteredSales.length)}
          icon={Receipt}
          tone="success"
        />
        <StatCard
          label="Items Sold"
          value={String(items)}
          icon={ShoppingBag}
          tone="warning"
        />
        <StatCard
          label="Avg. Ticket"
          value={formatCurrency(avgTicket)}
          icon={TrendingUp}
          tone="primary"
        />
      </div>

      <Card className="border-border/60 bg-linear-to-b from-card to-background/40 overflow-hidden p-4 shadow-soft sm:p-6 animate-fade-in [animation-delay:140ms]">
        <div className="mb-4 flex items-center justify-between gap-2">
          <div>
            <h3 className="font-semibold">Top products</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Ranked by revenue · {periodLabel.toLowerCase()}
            </p>
          </div>
          <Badge className="rounded-full border-0 bg-primary-soft px-3 font-semibold text-primary hover:bg-primary-soft">
            {periodLabel}
          </Badge>
        </div>
        <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />

        {topProducts.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm font-medium">No sales data yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Complete sales to see your reports.
            </p>
          </div>
        ) : (
          <div className="h-72 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topProducts}
                margin={{ left: -10, right: 8, top: 20, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="barGradient1" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0.95}
                    />
                    <stop
                      offset="100%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0.45}
                    />
                  </linearGradient>
                  <linearGradient id="barGradient2" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="hsl(var(--primary-glow))"
                      stopOpacity={0.9}
                    />
                    <stop
                      offset="100%"
                      stopColor="hsl(var(--primary-glow))"
                      stopOpacity={0.4}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="0"
                  stroke="hsl(var(--border) / 0.35)"
                  vertical={false}
                  horizontalPoints={[]}
                />
                <XAxis
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground) / 0.6)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground) / 0.6)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <Tooltip
                  cursor={{ fill: "hsl(var(--accent) / 0.25)", radius: 6 }}
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--primary) / 0.4)",
                    borderRadius: 12,
                    boxShadow: "0 8px 16px rgb(0 0 0 / 0.2)",
                    padding: "12px 16px",
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                  formatter={(v: number) => [formatCurrency(v), "Revenue"]}
                  labelFormatter={(label) => `${label}`}
                />
                <Bar
                  dataKey="revenue"
                  radius={[12, 12, 4, 4]}
                  isAnimationActive={true}
                >
                  {topProducts.map((_, i) => (
                    <Cell
                      key={i}
                      fill={
                        i % 2 === 0
                          ? "url(#barGradient1)"
                          : "url(#barGradient2)"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      <div className="grid gap-6 lg:grid-cols-2 animate-fade-in [animation-delay:220ms]">
        {topProducts.length > 0 && (
          <Card className="border-border/60 bg-linear-to-b from-card to-background/40 p-4 shadow-soft sm:p-6">
            <h3 className="mb-4 font-semibold">Best-sellers</h3>
            <ul className="divide-y divide-border/60">
              {topProducts.map((p, i) => (
                <li
                  key={p.name}
                  className="flex items-center gap-4 py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-sm font-bold text-primary">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-semibold">{p.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {p.qty} units sold
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-extrabold text-primary">
                    {formatCurrency(p.revenue)}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        <Card className="border-border/60 bg-linear-to-b from-card to-background/40 p-4 shadow-soft sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h3 className="font-semibold">All transactions</h3>
            <Badge className="rounded-full border-0 bg-primary-soft px-3 font-semibold text-primary">
              {filteredSales.length}
            </Badge>
          </div>
          {filteredSales.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground">
                No transactions in this period.
              </p>
            </div>
          ) : (
            <ul className="max-h-80 space-y-1.5 overflow-y-auto">
              {filteredSales.map((s) => (
                <li key={s.id}>
                  <button
                    onClick={() => setSelected(s)}
                    className="flex w-full items-center justify-between rounded-lg border border-border/60 bg-background/60 p-2.5 text-left transition-base hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-sm"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">
                          #{s.id.slice(0, 6).toUpperCase()}
                        </p>
                        {s.clientName && (
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0"
                          >
                            {s.clientName}
                          </Badge>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground flex items-center gap-2">
                        <span>
                          {new Date(s.createdAt).toLocaleString([], {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {s.soldBy && (
                          <>
                            <span className="hidden sm:inline">·</span>
                            <span className="hidden sm:inline italic">
                              By: {s.soldBy}
                            </span>
                          </>
                        )}
                      </p>
                    </div>
                    <span className="text-sm font-extrabold text-primary">
                      {formatCurrency(s.total)}
                    </span>
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
