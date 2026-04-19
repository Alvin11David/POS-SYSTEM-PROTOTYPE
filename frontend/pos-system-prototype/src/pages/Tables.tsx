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
  Dialog,
  DialogContent,
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
import { Pencil, Plus, Search, Trash2, Utensils } from "lucide-react";
import { PosTable, usePosExtra } from "@/store/posExtraStore";
import { toast } from "sonner";

const empty: Omit<PosTable, "id"> = {
  number: "",
  description: "Main Bar, Restaurant, Health Club",
  pos: "Main Bar",
};

export default function Tables() {
  const { tables, addTable, updateTable, deleteTable } = usePosExtra();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PosTable | null>(null);
  const [form, setForm] = useState<Omit<PosTable, "id">>(empty);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      tables.filter((t) =>
        [t.number, t.description, t.pos]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [tables, search],
  );

  const openNew = () => {
    setEditing(null);
    setForm({ ...empty, number: `Table ${tables.length + 1}` });
    setOpen(true);
  };
  const openEdit = (t: PosTable) => {
    setEditing(t);
    setForm({ number: t.number, description: t.description, pos: t.pos });
    setOpen(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.number.trim()) {
      toast.error("Table number is required");
      return;
    }
    if (editing) {
      updateTable(editing.id, form);
      toast.success("Table updated");
    } else {
      addTable(form);
      toast.success("Table created");
    }
    setOpen(false);
  };

  return (
    <div className="space-y-6 max-w-[1500px] mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Manage POS Tables
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Set up tables across your bar, restaurant and lounges.
          </p>
        </div>
        <Button
          onClick={openNew}
          className="gap-2 shadow-glow w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" /> New Table
        </Button>
      </div>

      <Card className="p-4 sm:p-6 shadow-soft">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm sm:flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tables…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <span className="text-xs text-muted-foreground sm:text-right">
            Displaying {filtered.length} of {tables.length} items
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary mb-3">
              <Utensils className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium">No tables yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Click "New Table" to add your first table.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-border/60 overflow-x-auto">
            <Table className="min-w-[760px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">#</TableHead>
                  <TableHead>Table No.</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>POS</TableHead>
                  <TableHead className="w-32 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((t, i) => (
                  <TableRow key={t.id}>
                    <TableCell className="text-muted-foreground">
                      {i + 1}
                    </TableCell>
                    <TableCell className="font-medium">{t.number}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {t.description}
                    </TableCell>
                    <TableCell>{t.pos}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => openEdit(t)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => setConfirmId(t.id)}
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
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit table" : "New table"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="t-num">Table number</Label>
              <Input
                id="t-num"
                value={form.number}
                onChange={(e) => setForm({ ...form, number: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="t-desc">Description</Label>
              <Input
                id="t-desc"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Main Bar, Restaurant, Health Club"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="t-pos">POS</Label>
              <Input
                id="t-pos"
                value={form.pos}
                onChange={(e) => setForm({ ...form, pos: e.target.value })}
              />
            </div>
            <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button type="submit" className="shadow-glow w-full sm:w-auto">
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!confirmId}
        onOpenChange={(o) => !o && setConfirmId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete table?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmId) {
                  deleteTable(confirmId);
                  toast.success("Table deleted");
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
