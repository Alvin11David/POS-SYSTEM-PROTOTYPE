import { useState } from "react";
import { Pencil, Plus, Search, Trash2, Package as PackageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Badge } from "@/components/ui/badge";
import { usePos } from "@/store/posStore";
import { Product } from "@/types/pos";
import { toast } from "sonner";

const EMOJIS = ["📦", "🛍️", "🎁", "☕", "🍔", "🍕", "🥐", "🍰", "🥗", "🍊", "🥑", "🧁"];

export default function Products() {
  const { products, addProduct, updateProduct, deleteProduct } = usePos();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [emoji, setEmoji] = useState("📦");
  const [query, setQuery] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null);

  const filtered = products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));

  const openNew = () => {
    setEditing(null);
    setName("");
    setPrice("");
    setEmoji("📦");
    setOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setName(p.name);
    setPrice(String(p.price));
    setEmoji(p.emoji ?? "📦");
    setOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(price);
    if (!name.trim() || isNaN(priceNum) || priceNum < 0) {
      toast.error("Please enter a valid name and price.");
      return;
    }
    if (editing) {
      updateProduct(editing.id, { name: name.trim(), price: priceNum, emoji });
      toast.success("Product updated");
    } else {
      addProduct({ name: name.trim(), price: priceNum, emoji });
      toast.success("Product added");
    }
    setOpen(false);
  };

  const handleDelete = (p: Product) => {
    deleteProduct(p.id);
    toast.success(`${p.name} deleted`);
    setConfirmDelete(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your inventory and pricing.</p>
        </div>
        <Button onClick={openNew} className="gap-2 shadow-glow transition-base hover:scale-[1.02]">
          <Plus className="h-4 w-4" /> Add Product
        </Button>
      </div>

      <Card className="p-4 shadow-soft">
        <div className="relative max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
            className="pl-9"
          />
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card className="p-12 text-center shadow-soft">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
            <PackageIcon className="h-6 w-6" />
          </div>
          <h3 className="mt-4 font-semibold">No products yet</h3>
          <p className="text-sm text-muted-foreground mt-1">Add your first product to get started.</p>
          <Button onClick={openNew} className="mt-5 gap-2">
            <Plus className="h-4 w-4" /> Add Product
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p) => (
            <Card
              key={p.id}
              className="group p-5 shadow-soft transition-base hover:shadow-elevated hover:-translate-y-0.5 animate-scale-in"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-3xl">
                  {p.emoji ?? "📦"}
                </div>
                <Badge variant="secondary" className="rounded-full text-xs">
                  {p.category ?? "General"}
                </Badge>
              </div>
              <div className="mt-4">
                <h3 className="font-semibold truncate">{p.name}</h3>
                <p className="text-lg font-bold text-primary mt-1">${p.price.toFixed(2)}</p>
              </div>
              <div className="mt-4 flex gap-2 transition-base sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={() => openEdit(p)}>
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => setConfirmDelete(p)}
                  aria-label={`Delete ${p.name}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit product" : "Add product"}</DialogTitle>
            <DialogDescription>
              {editing ? "Update the product details." : "Add a new product to your inventory."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Icon</Label>
              <div className="flex flex-wrap gap-2">
                {EMOJIS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setEmoji(e)}
                    className={`h-10 w-10 rounded-xl text-xl transition-base ${
                      emoji === e ? "bg-primary-soft ring-2 ring-primary" : "bg-secondary hover:bg-accent"
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Product name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Espresso" autoFocus />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="shadow-glow">
                {editing ? "Save changes" : "Add product"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this product?</AlertDialogTitle>
            <AlertDialogDescription>
              <b>{confirmDelete?.name}</b> will be removed from your catalog. This can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmDelete && handleDelete(confirmDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
