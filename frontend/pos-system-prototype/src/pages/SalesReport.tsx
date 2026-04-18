import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, FileText, Printer, Search } from "lucide-react";
import { usePos } from "@/store/posStore";
import { useAuth } from "@/store/authStore";
import { ReceiptDialog } from "@/components/ReceiptDialog";
import { Sale } from "@/types/pos";
import { toast } from "sonner";

export default function SalesReport() {
  const { sales } = usePos();
  const { users } = useAuth();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [cashier, setCashier] = useState("All");
  const [pos, setPos] = useState("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Sale | null>(null);

  const filtered = useMemo(() => {
    return sales.filter((s) => {
      const d = new Date(s.createdAt);
      if (from && d < new Date(from)) return false;
      if (to) {
        const end = new Date(to);
        end.setHours(23, 59, 59, 999);
        if (d > end) return false;
      }
      if (search) {
        const q = search.toLowerCase();
        const matches =
          s.id.toLowerCase().includes(q) ||
          s.items.some((i) => i.name.toLowerCase().includes(q));
        if (!matches) return false;
      }
      // cashier/pos filters are placeholders since this demo store doesn't track them
      return true;
    });
  }, [sales, from, to, search]);

  const totals = useMemo(() => {
    const sum = filtered.reduce((a, s) => a + s.total, 0);
    const items = filtered.reduce(
      (a, s) => a + s.items.reduce((b, i) => b + i.quantity, 0),
      0
    );
    return { sum, items };
  }, [filtered]);

  const exportCsv = () => {
    if (filtered.length === 0) {
      toast.error("Nothing to export");
      return;
    }
    const rows = [
      ["Order No.", "Order Date", "Items", "Cash", "Total"],
      ...filtered.map((s) => [
        s.id.slice(0, 8).toUpperCase(),
        new Date(s.createdAt).toISOString(),
        s.items.map((i) => `${i.quantity}x ${i.name}`).join("; "),
        s.total.toFixed(2),
        s.total.toFixed(2),
      ]),
    ];
    const csv = rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `combined-sales-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Combined POS Sales Report
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Filter, view and export every sale across your outlets.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()} className="gap-2">
            <Printer className="h-4 w-4" /> Print
          </Button>
          <Button onClick={exportCsv} className="gap-2 shadow-glow">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      <Card className="p-4 md:p-6 shadow-soft">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="from">Date from</Label>
            <Input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="to">To</Label>
            <Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Select POS</Label>
            <Select value={pos} onValueChange={setPos}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All POS</SelectItem>
                <SelectItem value="Main Bar">Main Bar</SelectItem>
                <SelectItem value="Restaurant">Restaurant</SelectItem>
                <SelectItem value="Health Club">Health Club</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Cashier</Label>
            <Select value={cashier} onValueChange={setCashier}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All cashiers</SelectItem>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.username}>{u.fullName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="q">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="q"
                placeholder="Order no. or item…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4 shadow-soft">
          <p className="text-xs text-muted-foreground">Transactions</p>
          <p className="text-2xl font-bold mt-1">{filtered.length}</p>
        </Card>
        <Card className="p-4 shadow-soft">
          <p className="text-xs text-muted-foreground">Items sold</p>
          <p className="text-2xl font-bold mt-1">{totals.items}</p>
        </Card>
        <Card className="p-4 shadow-soft">
          <p className="text-xs text-muted-foreground">Total revenue</p>
          <p className="text-2xl font-bold mt-1">${totals.sum.toFixed(2)}</p>
        </Card>
      </div>

      <Card className="p-4 md:p-6 shadow-soft">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary mb-3">
              <FileText className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium">No sales for this filter</p>
            <p className="text-xs text-muted-foreground mt-1">
              Adjust the dates or run some sales to see results.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-border/60 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order No.</TableHead>
                  <TableHead>Order Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead className="text-right">Cash</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="w-32 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">
                      #{s.id.slice(0, 8).toUpperCase()}
                    </TableCell>
                    <TableCell>{new Date(s.createdAt).toLocaleString()}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {s.items.reduce((a, i) => a + i.quantity, 0)} item(s)
                    </TableCell>
                    <TableCell className="text-right">${s.total.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-semibold">
                      ${s.total.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={() => setSelected(s)}>
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <ReceiptDialog
        sale={selected}
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
      />
    </div>
  );
}
