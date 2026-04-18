import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CalendarDays,
  CheckCircle2,
  Pencil,
  Plus,
  Printer,
  Search,
  Trash2,
} from "lucide-react";
import {
  Reservation,
  ReservationStatus,
  usePosExtra,
} from "@/store/posExtraStore";
import { toast } from "sonner";

const STATUSES: ReservationStatus[] = ["Open", "Confirmed", "Cancelled", "Complete"];

const emptyForm: Omit<Reservation, "id" | "createdAt"> = {
  clientName: "",
  organisation: "",
  telephone: "",
  email: "",
  date: new Date().toISOString().slice(0, 10),
  time: "19:00",
  adults: 2,
  children: 0,
  tableNo: "Table 1",
  description: "",
  deposit: 0,
  status: "Open",
};

const statusTone: Record<ReservationStatus, string> = {
  Open: "bg-warning/15 text-warning",
  Confirmed: "bg-primary-soft text-primary",
  Cancelled: "bg-destructive/15 text-destructive",
  Complete: "bg-success/15 text-success",
};

export default function Reservations() {
  const {
    reservations,
    tables,
    addReservation,
    updateReservation,
    deleteReservation,
  } = usePosExtra();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | "All">("All");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Reservation | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return reservations.filter((r) => {
      const matchesQ = [r.clientName, r.organisation, r.telephone, r.email, r.tableNo]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesS = statusFilter === "All" || r.status === statusFilter;
      return matchesQ && matchesS;
    });
  }, [reservations, search, statusFilter]);

  const openNew = () => {
    setEditing(null);
    setForm({ ...emptyForm, tableNo: tables[0]?.number ?? "Table 1" });
    setOpen(true);
  };

  const openEdit = (r: Reservation) => {
    setEditing(r);
    setForm({
      clientName: r.clientName,
      organisation: r.organisation ?? "",
      telephone: r.telephone ?? "",
      email: r.email ?? "",
      date: r.date,
      time: r.time,
      adults: r.adults,
      children: r.children,
      tableNo: r.tableNo,
      description: r.description ?? "",
      deposit: r.deposit,
      status: r.status,
    });
    setOpen(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clientName.trim()) {
      toast.error("Client name is required");
      return;
    }
    if (editing) {
      updateReservation(editing.id, form);
      toast.success("Reservation updated");
    } else {
      addReservation(form);
      toast.success("Reservation created");
    }
    setOpen(false);
  };

  const markComplete = (r: Reservation) => {
    updateReservation(r.id, { status: "Complete" });
    toast.success(`${r.clientName} marked complete`);
  };

  const printReservation = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">POS Reservations</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track bookings, deposits and table assignments.
          </p>
        </div>
        <Button onClick={openNew} className="gap-2 shadow-glow">
          <Plus className="h-4 w-4" /> New Reservation
        </Button>
      </div>

      <Card className="p-4 md:p-6 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative max-w-sm flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search reservation…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as ReservationStatus | "All")}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All statuses</SelectItem>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <span className="text-xs text-muted-foreground">
            Displaying {filtered.length} of {reservations.length} items
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary mb-3">
              <CalendarDays className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium">No reservations</p>
            <p className="text-xs text-muted-foreground mt-1">
              Click "New Reservation" to book a table.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-border/60 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead className="text-right">Adults</TableHead>
                  <TableHead className="text-right">Children</TableHead>
                  <TableHead>Table</TableHead>
                  <TableHead className="text-right">Deposit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-44 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <div className="font-medium">{r.clientName}</div>
                      {r.organisation && (
                        <div className="text-xs text-muted-foreground">{r.organisation}</div>
                      )}
                    </TableCell>
                    <TableCell>{r.date}</TableCell>
                    <TableCell>{r.time}</TableCell>
                    <TableCell className="text-right">{r.adults}</TableCell>
                    <TableCell className="text-right">{r.children}</TableCell>
                    <TableCell>{r.tableNo}</TableCell>
                    <TableCell className="text-right">{r.deposit.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge className={`${statusTone[r.status]} hover:${statusTone[r.status]}`}>
                        {r.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {r.status !== "Complete" && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-success"
                            onClick={() => markComplete(r)}
                            title="Mark complete"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                        )}
                        <Button size="icon" variant="ghost" onClick={() => openEdit(r)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => setConfirmId(r.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit reservation" : "Client details"}</DialogTitle>
            <DialogDescription>
              Capture all the booking information for this client.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="r-name">Client name</Label>
                <Input
                  id="r-name"
                  value={form.clientName}
                  onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="r-org">Organisation</Label>
                <Input
                  id="r-org"
                  value={form.organisation}
                  onChange={(e) => setForm({ ...form, organisation: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="r-tel">Telephone</Label>
                <Input
                  id="r-tel"
                  value={form.telephone}
                  onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="r-email">Email</Label>
                <Input
                  id="r-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="r-date">Date</Label>
                <Input
                  id="r-date"
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="r-time">Time</Label>
                <Input
                  id="r-time"
                  type="time"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="r-adults">No. of adults</Label>
                <Input
                  id="r-adults"
                  type="number"
                  min="0"
                  value={form.adults}
                  onChange={(e) => setForm({ ...form, adults: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="r-children">No. of children</Label>
                <Input
                  id="r-children"
                  type="number"
                  min="0"
                  value={form.children}
                  onChange={(e) => setForm({ ...form, children: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="r-table">Table No.</Label>
                <Select
                  value={form.tableNo}
                  onValueChange={(v) => setForm({ ...form, tableNo: v })}
                >
                  <SelectTrigger id="r-table">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tables.map((t) => (
                      <SelectItem key={t.id} value={t.number}>{t.number}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="r-deposit">Deposit</Label>
                <Input
                  id="r-deposit"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.deposit}
                  onChange={(e) => setForm({ ...form, deposit: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="r-desc">Description</Label>
                <Input
                  id="r-desc"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="r-status">Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm({ ...form, status: v as ReservationStatus })}
                >
                  <SelectTrigger id="r-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={printReservation}
                className="gap-2"
              >
                <Printer className="h-4 w-4" /> Print
              </Button>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Close
              </Button>
              <Button type="submit" className="shadow-glow">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirmId} onOpenChange={(o) => !o && setConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete reservation?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmId) {
                  deleteReservation(confirmId);
                  toast.success("Reservation deleted");
                }
                setConfirmId(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
