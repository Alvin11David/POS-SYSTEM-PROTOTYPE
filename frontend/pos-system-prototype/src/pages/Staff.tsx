import { useEffect, useState } from "react";
import {
  Pencil,
  Plus,
  Shield,
  ShieldCheck,
  ShieldHalf,
  Trash2,
  UserPlus,
} from "lucide-react";
import {
  ROLE_DESCRIPTION,
  ROLE_LABEL,
  Role,
  User,
  useAuth,
} from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { useCurrency } from "@/store/currencyStore";
import { toast } from "sonner";

const roleIcon: Record<Role, React.ElementType> = {
  admin: ShieldCheck,
  manager: ShieldHalf,
  cashier: Shield,
};

const roleColor: Record<Role, string> = {
  admin: "bg-primary/10 text-primary border-primary/20",
  manager: "bg-warning/10 text-warning border-warning/20",
  cashier: "bg-success/10 text-success border-success/20",
};

interface FormState {
  fullName: string;
  username: string;
  password: string;
  role: Role;
}

const empty: FormState = {
  fullName: "",
  username: "",
  password: "",
  role: "cashier",
};

export default function Staff() {
  const { users, addUser, updateUser, deleteUser, currentUser } = useAuth();
  const {
    currency,
    setCurrency,
    formatCurrency,
    currencyOptions,
    taxRate,
    setTaxRate,
  } = useCurrency();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const [confirmDelete, setConfirmDelete] = useState<User | null>(null);
  const [taxInput, setTaxInput] = useState(() => (taxRate * 100).toFixed(2));

  useEffect(() => {
    setTaxInput((taxRate * 100).toFixed(2));
  }, [taxRate]);

  const commitTaxInput = () => {
    const parsed = Number(taxInput);
    if (!Number.isFinite(parsed) || parsed < 0) {
      setTaxInput((taxRate * 100).toFixed(2));
      return;
    }
    setTaxRate(parsed / 100);
  };

  const openAdd = () => {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  };

  const openEdit = (u: User) => {
    setEditing(u);
    setForm({
      fullName: u.fullName,
      username: u.username,
      password: u.password,
      role: u.role,
    });
    setOpen(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      updateUser(editing.id, form);
      toast.success(`${form.fullName || form.username} updated`);
      setOpen(false);
      return;
    }
    const res = addUser(form);
    if (!res.ok) {
      toast.error(res.error ?? "Could not add user");
      return;
    }
    toast.success(
      `${form.fullName || form.username} added as ${ROLE_LABEL[form.role]}`,
    );
    setOpen(false);
  };

  const confirmRemove = () => {
    if (!confirmDelete) return;
    deleteUser(confirmDelete.id);
    toast.success(
      `${confirmDelete.fullName || confirmDelete.username} removed`,
    );
    setConfirmDelete(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Staff & roles</h1>
          <p className="text-sm text-muted-foreground">
            Create logins for your team and choose what they can do.
          </p>
        </div>
        <Button
          onClick={openAdd}
          className="w-full sm:w-auto gap-2 shadow-glow"
        >
          <UserPlus className="h-4 w-4" /> Add staff member
        </Button>
      </div>

      {/* Role legend */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <Card className="p-4 shadow-sm sm:col-span-2 xl:col-span-3">
          <div className="grid gap-3 md:grid-cols-[220px_180px_1fr] md:items-end">
            <div className="space-y-2">
              <Label>Preferred currency</Label>
              <Select
                value={currency}
                onValueChange={(v) => setCurrency(v as typeof currency)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencyOptions.map((option) => (
                    <SelectItem key={option.code} value={option.code}>
                      {option.code} · {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sales-tax">Sales tax (%)</Label>
              <Input
                id="sales-tax"
                type="text"
                inputMode="decimal"
                value={taxInput}
                onChange={(e) => {
                  setTaxInput(e.target.value);
                }}
                onBlur={commitTaxInput}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    commitTaxInput();
                  }
                }}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              This updates prices across Sales, Products, Reports, and receipts.
              Preview: {formatCurrency(6000)} · Tax {(taxRate * 100).toFixed(2)}
              %
            </p>
          </div>
        </Card>

        {(Object.keys(ROLE_LABEL) as Role[]).map((r) => {
          const Icon = roleIcon[r];
          return (
            <Card key={r} className="p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl border ${roleColor[r]}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{ROLE_LABEL[r]}</p>
                  <p className="text-xs text-muted-foreground wrap-break-word">
                    {ROLE_DESCRIPTION[r]}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Users list */}
      <Card className="overflow-hidden shadow-sm">
        <div className="hidden lg:grid grid-cols-12 gap-4 border-b border-border bg-muted/40 px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          <div className="col-span-5">Member</div>
          <div className="col-span-3">Username</div>
          <div className="col-span-2">Role</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>
        {users.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-muted-foreground">
            No staff yet.
          </div>
        ) : (
          users.map((u) => {
            const Icon = roleIcon[u.role];
            const isMe = currentUser?.id === u.id;
            return (
              <div
                key={u.id}
                className="border-b border-border last:border-0 transition-base hover:bg-accent/30"
              >
                <div className="lg:hidden px-4 py-3 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full gradient-primary text-xs font-semibold text-primary-foreground">
                        {(u.fullName || u.username).slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">
                          {u.fullName || u.username}
                          {isMe && (
                            <span className="ml-2 text-[10px] font-normal text-muted-foreground">
                              (you)
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Added {new Date(u.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={`shrink-0 gap-1 ${roleColor[u.role]}`}
                    >
                      <Icon className="h-3 w-3" />
                      {ROLE_LABEL[u.role]}
                    </Badge>
                  </div>

                  <div className="rounded-lg border border-border/70 bg-background/60 px-3 py-2">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      Username
                    </p>
                    <p className="font-mono text-sm">{u.username}</p>
                  </div>

                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEdit(u)}
                      aria-label="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      disabled={isMe}
                      onClick={() => setConfirmDelete(u)}
                      aria-label="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="hidden lg:grid grid-cols-12 items-center gap-4 px-5 py-3">
                  <div className="col-span-5 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full gradient-primary text-xs font-semibold text-primary-foreground">
                      {(u.fullName || u.username).slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">
                        {u.fullName || u.username}
                        {isMe && (
                          <span className="ml-2 text-[10px] font-normal text-muted-foreground">
                            (you)
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Added {new Date(u.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="col-span-3 font-mono text-sm">
                    {u.username}
                  </div>
                  <div className="col-span-2">
                    <Badge
                      variant="outline"
                      className={`gap-1 ${roleColor[u.role]}`}
                    >
                      <Icon className="h-3 w-3" />
                      {ROLE_LABEL[u.role]}
                    </Badge>
                  </div>
                  <div className="col-span-2 flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEdit(u)}
                      aria-label="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      disabled={isMe}
                      onClick={() => setConfirmDelete(u)}
                      aria-label="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </Card>

      {/* Add/Edit dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-4 w-4 text-primary" />
              {editing ? "Edit staff member" : "Add staff member"}
            </DialogTitle>
            <DialogDescription>
              They'll sign in with the username & password you set here.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                placeholder="Jane Doe"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={form.username}
                  onChange={(e) =>
                    setForm({ ...form, username: e.target.value })
                  }
                  placeholder="jane"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  placeholder="min 4 chars"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={form.role}
                onValueChange={(v) => setForm({ ...form, role: v as Role })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(ROLE_LABEL) as Role[]).map((r) => (
                    <SelectItem key={r} value={r}>
                      <div className="flex flex-col">
                        <span className="font-medium">{ROLE_LABEL[r]}</span>
                        <span className="text-xs text-muted-foreground">
                          {ROLE_DESCRIPTION[r]}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="shadow-glow">
                {editing ? "Save changes" : "Create login"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!confirmDelete}
        onOpenChange={(o) => !o && setConfirmDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this staff member?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDelete?.fullName || confirmDelete?.username} will no
              longer be able to sign in. This can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemove}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
