import { useState } from "react";
import {
  Pencil,
  Plus,
  Search,
  Trash2,
  Package as PackageIcon,
  Sparkles,
} from "lucide-react";
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
import { useCurrency } from "@/store/currencyStore";
import { useTour } from "@/store/tourStore";
import { Product } from "@/types/pos";
import { toast } from "sonner";

const MAX_IMAGE_SIZE = 1_500_000;

const formatPriceInput = (value: string) => {
  const cleaned = value.replace(/,/g, "").replace(/[^\d.]/g, "");
  if (!cleaned) return "";

  const [integerPart, ...decimalParts] = cleaned.split(".");
  const integer = integerPart.replace(/^0+(\d)/, "$1") || "0";
  const decimal = decimalParts.join("").slice(0, 2);

  const formattedInteger = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(Number(integer));

  if (cleaned.includes(".")) {
    return `${formattedInteger}.${decimal}`;
  }

  return formattedInteger;
};

async function fileToDataUrl(file: File): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Failed to read image"));
    reader.readAsDataURL(file);
  });
}

export default function Products() {
  const { products, addProduct, updateProduct, deleteProduct } = usePos();
  const { formatCurrency, currency } = useCurrency();
  const { start } = useTour();
  const [open, setOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<{
    url: string;
    name: string;
  } | null>(null);
  const [editing, setEditing] = useState<Product | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [query, setQuery] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase()),
  );

  const openNew = () => {
    setEditing(null);
    setName("");
    setPrice("");
    setImageUrl("");
    setOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setName(p.name);
    setPrice(formatPriceInput(String(p.price)));
    setImageUrl(p.imageUrl ?? "");
    setOpen(true);
  };

  const onImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      toast.error("Image must be 1.5MB or smaller");
      return;
    }

    try {
      const dataUrl = await fileToDataUrl(file);
      setImageUrl(dataUrl);
    } catch {
      toast.error("Could not read image");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(price.replace(/,/g, ""));
    if (!name.trim() || isNaN(priceNum) || priceNum < 0) {
      toast.error("Please enter a valid name and price.");
      return;
    }
    if (editing) {
      updateProduct(editing.id, {
        name: name.trim(),
        price: priceNum,
        imageUrl,
      });
      toast.success("Product updated");
    } else {
      addProduct({ name: name.trim(), price: priceNum, imageUrl });
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
    <div
      className="relative mx-auto max-w-375 space-y-6"
      data-tour="products-page"
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
              Inventory Management
            </p>
            <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">
              Product Catalog
            </h1>
            <p className="mt-2 max-w-md text-sm text-white/80">
              Add, edit, and organize your inventory. Control pricing and images
              across all sales channels.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 sm:flex-col">
            <Button
              variant="outline"
              onClick={start}
              className="gap-2 border-white/25 bg-white/10 text-white hover:bg-white/20"
              data-tour="products-tour-start"
            >
              <Sparkles className="h-4 w-4" /> Tour
            </Button>
            <Button
              onClick={openNew}
              className="gap-2 rounded-xl bg-white text-slate-900 font-semibold shadow-lg hover:bg-white/95"
              data-tour="products-add"
            >
              <Plus className="h-4 w-4" /> Add Product
            </Button>
          </div>
        </div>
      </div>

      <Card
        className="border-border/60 bg-linear-to-b from-card to-background/40 p-4 shadow-soft sm:p-5 animate-fade-in"
        data-tour="products-search"
      >
        <div className="relative max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
            className="border-border/70 bg-background/80 pl-9"
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {filtered.length} of {products.length} products
        </p>
      </Card>

      {filtered.length === 0 ? (
        <Card
          className="p-12 text-center shadow-soft animate-fade-in"
          data-tour="products-empty"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-soft text-primary">
            <PackageIcon className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">Your catalog is empty</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Add your first product to get started building your inventory.
          </p>
          <Button onClick={openNew} className="mt-5 gap-2">
            <Plus className="h-4 w-4" /> Add Product
          </Button>
        </Card>
      ) : (
        <div
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-fade-in"
          data-tour="products-grid"
        >
          {filtered.map((p) => (
            <Card
              key={p.id}
              className="group relative overflow-hidden border-border/70 bg-linear-to-b from-card to-background/60 p-5 shadow-soft transition-base hover:-translate-y-0.5 hover:shadow-elevated animate-scale-in"
            >
              <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-primary/10 blur-2xl opacity-0 transition-base group-hover:opacity-100" />

              <div className="relative flex items-start justify-between">
                <button
                  type="button"
                  className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-primary-soft transition-base group-hover:bg-primary group-hover:text-primary-foreground"
                  onClick={() =>
                    p.imageUrl &&
                    setPreviewImage({
                      url: p.imageUrl,
                      name: p.name,
                    })
                  }
                  aria-label={
                    p.imageUrl
                      ? `Preview ${p.name}`
                      : `${p.name} image unavailable`
                  }
                >
                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <PackageIcon className="h-6 w-6 text-muted-foreground group-hover:text-primary-foreground" />
                  )}
                </button>
                <Badge className="rounded-full border-0 bg-primary-soft px-2.5 py-1 text-xs font-semibold text-primary">
                  {p.category ?? "General"}
                </Badge>
              </div>

              <div className="relative mt-4">
                <h3 className="truncate text-sm font-semibold">{p.name}</h3>
                <p className="mt-2 text-xl font-extrabold text-primary">
                  {formatCurrency(p.price)}
                </p>
              </div>

              <div className="relative mt-4 flex gap-2 transition-base sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1.5"
                  onClick={() => openEdit(p)}
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-border/70 text-destructive hover:bg-destructive/10 hover:text-destructive"
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
        <DialogContent className="sm:max-w-md" data-tour="products-dialog">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit product" : "Add product"}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? "Update the product details."
                : "Add a new product to your inventory."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="image">Product image</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={onImageChange}
              />
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-secondary"
                  onClick={() =>
                    imageUrl &&
                    setPreviewImage({
                      url: imageUrl,
                      name: name || "Product preview",
                    })
                  }
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <PackageIcon className="h-6 w-6 text-muted-foreground" />
                  )}
                </button>
                {imageUrl && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setImageUrl("")}
                  >
                    Remove image
                  </Button>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Product name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Espresso"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price ({currency})</Label>
              <Input
                id="price"
                type="text"
                inputMode="decimal"
                value={price}
                onChange={(e) => setPrice(formatPriceInput(e.target.value))}
                placeholder="0.00"
              />
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
                {editing ? "Save changes" : "Add product"}
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
            <AlertDialogTitle>Delete this product?</AlertDialogTitle>
            <AlertDialogDescription>
              <b>{confirmDelete?.name}</b> will be removed from your catalog.
              This can't be undone.
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

      <Dialog
        open={!!previewImage}
        onOpenChange={(o) => !o && setPreviewImage(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{previewImage?.name ?? "Image preview"}</DialogTitle>
          </DialogHeader>
          {previewImage && (
            <div className="overflow-hidden rounded-xl border border-border/60 bg-secondary">
              <img
                src={previewImage.url}
                alt={previewImage.name}
                className="h-auto max-h-[70vh] w-full object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
